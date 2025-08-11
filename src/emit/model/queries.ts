import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../config";
import { write } from "../fs";
import { header, imp, impType } from "../strings";
import { join } from "node:path";

export async function emitQueries({
  modelDir,
  dmmf,
  model,
  cfg
}: {
  modelDir: string;
  dmmf: DMMF.Document;
  model: DMMF.Model;
  cfg: FlowConfig;
}) {
  const modelLower = model.name.toLowerCase();
  const idField = model.fields.find(f => f.isId);
  const idType = idField?.type === "String" ? "string" : "number";
  
  const content = [];
  content.push(header("queries.server.ts"));
  content.push(`"use server";`);
  content.push(``);
  content.push(imp(cfg.prismaImport, ["prisma"]));
  content.push(imp("../core", ["cacheTagged", "keys", "FlowCtx"]));
  content.push(imp("../policies", [`can${model.name}`]));
  content.push(imp(`./selects`, [`${model.name}DeepSelect`, `${model.name}ListSelect`]));
  content.push(impType("@prisma/client", ["Prisma"]));
  content.push(``);
  
  content.push(`export const get${model.name}ById = cacheTagged(async function(id: ${idType}, ctx: FlowCtx) {`);
  content.push(`  const policy = await can${model.name}("read", ctx);`);
  content.push(`  if (!policy.ok) return null;`);
  content.push(``);
  content.push(`  const item = await prisma.${modelLower}.findUnique({`);
  content.push(`    where: { ${idField?.name || "id"}: id, ...policy.where },`);
  content.push(`    select: ${model.name}DeepSelect`);
  content.push(`  });`);
  content.push(``);
  content.push(`  return item;`);
  content.push(`});`);
  content.push(``);
  
  content.push(`export type ${model.name}ListParams = {`);
  content.push(`  where?: Prisma.${model.name}WhereInput;`);
  content.push(`  orderBy?: Prisma.${model.name}OrderByWithRelationInput;`);
  content.push(`  skip?: number;`);
  content.push(`  take?: number;`);
  content.push(`};`);
  content.push(``);
  
  content.push(`export const list${model.name}s = cacheTagged(async function(params: ${model.name}ListParams, ctx: FlowCtx) {`);
  content.push(`  const policy = await can${model.name}("list", ctx);`);
  content.push(`  if (!policy.ok) return { items: [], total: 0 };`);
  content.push(``);
  content.push(`  const where = { ...params.where, ...policy.where };`);
  content.push(``);
  content.push(`  const [items, total] = await Promise.all([`);
  content.push(`    prisma.${modelLower}.findMany({`);
  content.push(`      where,`);
  content.push(`      orderBy: params.orderBy,`);
  content.push(`      skip: params.skip,`);
  content.push(`      take: params.take || 50,`);
  content.push(`      select: ${model.name}ListSelect`);
  content.push(`    }),`);
  content.push(`    prisma.${modelLower}.count({ where })`);
  content.push(`  ]);`);
  content.push(``);
  content.push(`  return { items, total };`);
  content.push(`});`);
  
  await write(join(modelDir, "queries.server.ts"), content.join("\n"));
}