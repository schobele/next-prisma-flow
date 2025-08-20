import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../../config";
import { write } from "../../fs";
import { header, imp, impType, toCamelCase } from "../../strings";
import { isRelation } from "../../../dmmf";

export async function emitServerQueries({
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
  content.push(header("server/queries.ts"));
  content.push(`"use server";`);
  content.push(``);
  content.push(imp("../../prisma", ["prisma"]));
  content.push(imp("../../core", ["cacheTagged", "FlowCtx", "FlowPolicyError"]));
  content.push(imp("../../policies", [`can${model.name}`]));
  
  // Import the select if configured
  if (cfg.perModelSelect[model.name]) {
    content.push(imp(`./selects`, [`${model.name}Select`]));
  }
  
  content.push(impType("../../prisma", ["Prisma"]));
  content.push(impType("../types/schemas", [`Flow${model.name}`]));
  content.push(``);
  
  // Helper to transform Prisma response to match schema types
  content.push(`// Transform Prisma response to match Flow${model.name} schema (null -> undefined for relations)`);
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
  content.push(`function transformResponseList(items: any[]): any[] {`);
  content.push(`  return items.map(transformResponse);`);
  content.push(`}`);
  content.push(``);

  // Get by ID
  content.push(`export const get${model.name}ById = cacheTagged(async function (`);
  content.push(`  id: ${idType},`);
  content.push(`  ctx: FlowCtx = {}`);
  content.push(`): Promise<Flow${model.name} | null> {`);
  content.push(`  const policy = await can${model.name}("read", ctx || {});`);
  content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
  content.push(``);
  content.push(`  const item = await prisma.${modelCamel}.findUnique({`);
  content.push(`    where: { ${idField?.name || "id"}: id, ...policy.where },`);
  
  if (cfg.perModelSelect[model.name]) {
    content.push(`    select: ${model.name}Select`);
  }
  
  content.push(`  }) as Flow${model.name} | null;`);
  content.push(``);
  content.push(`  return transformResponse(item) as Flow${model.name} | null;`);
  content.push(`});`);
  content.push(``);

  // List params type
  content.push(`export type ${model.name}ListParams = {`);
  content.push(`  where?: Prisma.${model.name}WhereInput;`);
  content.push(`  orderBy?: Prisma.${model.name}OrderByWithRelationInput | Prisma.${model.name}OrderByWithRelationInput[];`);
  content.push(`  skip?: number;`);
  content.push(`  take?: number;`);
  content.push(`  cursor?: Prisma.${model.name}WhereUniqueInput;`);
  content.push(`};`);
  content.push(``);

  // List function
  content.push(`export const list${model.name}s = cacheTagged(async function (`);
  content.push(`  params: ${model.name}ListParams = {},`);
  content.push(`  ctx: FlowCtx = {}`);
  content.push(`): Promise<{ items: Flow${model.name}[]; total: number }> {`);
  content.push(`  const policy = await can${model.name}("list", ctx || {});`);
  content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
  content.push(``);
  content.push(`  const where = { ...params.where, ...policy.where };`);
  content.push(``);
  content.push(`  const [items, total] = await Promise.all([`);
  content.push(`    prisma.${modelCamel}.findMany({`);
  content.push(`      where,`);
  content.push(`      orderBy: params.orderBy,`);
  content.push(`      skip: params.skip,`);
  content.push(`      take: params.take || 50,`);
  content.push(`      cursor: params.cursor,`);
  
  if (cfg.perModelSelect[model.name]) {
    content.push(`      select: ${model.name}Select`);
  }
  
  content.push(`    }) as Promise<Flow${model.name}[]>,`);
  content.push(`    prisma.${modelCamel}.count({ where })`);
  content.push(`  ]);`);
  content.push(``);
  content.push(`  return { items: transformResponseList(items) as Flow${model.name}[], total };`);
  content.push(`});`);
  content.push(``);

  // Search function (if the model has searchable fields)
  const searchableFields = model.fields.filter(f => 
    f.type === "String" && !f.isId && !f.isList
  );

  if (searchableFields.length > 0) {
    content.push(`export const search${model.name}s = cacheTagged(async function (`);
    content.push(`  query: string,`);
    content.push(`  params: Omit<${model.name}ListParams, 'where'> = {},`);
    content.push(`  ctx: FlowCtx = {}`);
    content.push(`): Promise<{ items: Flow${model.name}[]; total: number }> {`);
    content.push(`  const policy = await can${model.name}("list", ctx || {});`);
    content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
    content.push(``);
    content.push(`  const where = {`);
    content.push(`    AND: [`);
    content.push(`      policy.where,`);
    content.push(`      {`);
    content.push(`        OR: [`);
    searchableFields.forEach(field => {
      content.push(`          { ${field.name}: { contains: query, mode: 'insensitive' as const } },`);
    });
    content.push(`        ]`);
    content.push(`      }`);
    content.push(`    ]`);
    content.push(`  };`);
    content.push(``);
    content.push(`  const [items, total] = await Promise.all([`);
    content.push(`    prisma.${modelCamel}.findMany({`);
    content.push(`      where,`);
    content.push(`      orderBy: params.orderBy,`);
    content.push(`      skip: params.skip,`);
    content.push(`      take: params.take || 50,`);
    content.push(`      cursor: params.cursor,`);
    
    if (cfg.perModelSelect[model.name]) {
      content.push(`      select: ${model.name}Select`);
    }
    
    content.push(`    }) as Promise<Flow${model.name}[]>,`);
    content.push(`    prisma.${modelCamel}.count({ where })`);
    content.push(`  ]);`);
    content.push(``);
    content.push(`  return { items: transformResponseList(items) as Flow${model.name}[], total };`);
    content.push(`});`);
  }

  const serverDir = join(modelDir, "server");
  await write(join(serverDir, "queries.ts"), content.join("\n"));
}