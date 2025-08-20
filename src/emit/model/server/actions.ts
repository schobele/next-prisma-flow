import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../../config";
import { write } from "../../fs";
import { header, imp, impType, toCamelCase } from "../../strings";
import { isRelation } from "../../../dmmf";

export async function emitServerActions({
  modelDir,
  model,
  cfg,
}: {
  modelDir: string;
  model: DMMF.Model;
  cfg: FlowConfig;
}) {
  const modelCamel = toCamelCase(model.name);
  const idField = model.fields.find((f) => f.isId);
  const idType = idField?.type === "String" ? "string" : "number";

  const content = [];
  content.push(header("server/actions.ts"));
  content.push(`"use server";`);
  content.push(``);
  content.push(imp("../../prisma", ["prisma"]));
  content.push(imp("../../core", ["invalidateTags", "keys", "FlowCtx", "FlowPolicyError", "FlowValidationError", "deepMergePrismaData"]));
  content.push(imp("../../policies", [`can${model.name}`]));
  content.push(imp(`./selects`, [`${model.name}Select`]));
  content.push(imp(`../types/schemas`, [`${model.name}CreateSchema`, `${model.name}UpdateSchema`]));
  content.push(impType(`../types/schemas`, [`Flow${model.name}`, `Flow${model.name}Create`, `Flow${model.name}Update`]));
  content.push(imp(`../types/transforms`, [`transform${model.name}Create`, `transform${model.name}Update`]));
  content.push(``);
  
  // Helper to transform Prisma response to match schema types
  content.push(`// Transform Prisma response to match FlowPost schema (null -> undefined for relations)`);
  content.push(`function transformResponse(item: any): any {`);
  content.push(`  if (!item) return item;`);
  content.push(`  const result = { ...item };`);
  
  // Transform nullable relations to undefined
  for (const field of model.fields) {
    if (isRelation(field) && !field.isRequired) {
      content.push(`  if (result.${field.name} === null) result.${field.name} = undefined;`);
    }
  }
  
  content.push(`  return result;`);
  content.push(`}`);
  content.push(``);

  // Create action
  content.push(`export async function create${model.name}(data: Flow${model.name}Create, ctx: FlowCtx = {}): Promise<Flow${model.name}> {`);
  content.push(`  const policy = await can${model.name}("create", ctx || {});`);
  content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
  content.push(``);
  content.push(`  const parsed = ${model.name}CreateSchema.safeParse(data);`);
  content.push(`  if (!parsed.success) {`);
  content.push(`    throw new FlowValidationError(parsed.error.issues);`);
  content.push(`  }`);
  content.push(``);
  content.push(`  const createData = transform${model.name}Create(parsed.data as any);`);
  content.push(`  const item = await prisma.${modelCamel}.create({`);
  content.push(`    data: deepMergePrismaData(createData, policy.data || {}, "${model.name}"),`);
  content.push(`    select: ${model.name}Select`);
  content.push(`  }) as Flow${model.name};`);
  content.push(``);
  content.push(`  await invalidateTags([keys.m("${model.name}").tag()]);`);
  content.push(`  return transformResponse(item) as Flow${model.name};`);
  content.push(`}`);
  content.push(``);

  // Update action
  content.push(`export async function update${model.name}(`);
  content.push(`  id: ${idType},`);
  content.push(`  data: Flow${model.name}Update,`);
  content.push(`  ctx: FlowCtx = {}`);
  content.push(`): Promise<Flow${model.name}> {`);
  content.push(`  const policy = await can${model.name}("update", ctx || {}, id);`);
  content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
  content.push(``);
  content.push(`  const parsed = ${model.name}UpdateSchema.safeParse(data);`);
  content.push(`  if (!parsed.success) {`);
  content.push(`    throw new FlowValidationError(parsed.error.issues);`);
  content.push(`  }`);
  content.push(``);
  content.push(`  const updateData = transform${model.name}Update(parsed.data as any);`);
  content.push(`  const item = await prisma.${modelCamel}.update({`);
  content.push(`    where: { ${idField?.name || "id"}: id, ...policy.where },`);
  content.push(`    data: deepMergePrismaData(updateData, policy.data || {}, "${model.name}"),`);
  content.push(`    select: ${model.name}Select`);
  content.push(`  }) as Flow${model.name};`);
  content.push(``);
  content.push(`  await invalidateTags([`);
  content.push(`    keys.m("${model.name}").tag(),`);
  content.push(`    keys.m("${model.name}").tag(String(id))`);
  content.push(`  ]);`);
  content.push(`  return transformResponse(item) as Flow${model.name};`);
  content.push(`}`);
  content.push(``);

  // Delete action
  content.push(`export async function delete${model.name}(id: ${idType}, ctx?: FlowCtx): Promise<void> {`);
  content.push(`  const policy = await can${model.name}("delete", ctx || {}, id);`);
  content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
  content.push(``);
  content.push(`  await prisma.${modelCamel}.delete({`);
  content.push(`    where: { ${idField?.name || "id"}: id, ...policy.where }`);
  content.push(`  });`);
  content.push(``);
  content.push(`  await invalidateTags([`);
  content.push(`    keys.m("${model.name}").tag(),`);
  content.push(`    keys.m("${model.name}").tag(String(id))`);
  content.push(`  ]);`);
  content.push(`}`);

  const serverDir = join(modelDir, "server");
  await write(join(serverDir, "actions.ts"), content.join("\n"));
}