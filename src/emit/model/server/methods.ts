import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../../config";
import { write } from "../../fs";
import { header, imp, impType, toCamelCase } from "../../strings";

export async function emitServerMethods({
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
  content.push(header("server/methods.ts"));
  content.push(`"use server";`);
  content.push(``);
  content.push(imp("../../prisma", ["prisma"]));
  content.push(impType("../../prisma", ["Prisma"]));
  content.push(imp("../../core", ["FlowCtx", "FlowPolicyError", "deepMergePrismaData"]));
  content.push(imp("../../policies", [`can${model.name}`]));
  
  // Import the default select if configured
  if (cfg.perModelSelect[model.name]) {
    content.push(imp("./selects", [`${model.name}Select`]));
  }
  // Import FlowType for return type annotations
  content.push(impType("../types/schemas", [`Flow${model.name}`]));
  
  content.push(``);

  // findUnique
  content.push(`export async function findUnique(`);
  content.push(`  args: Prisma.${model.name}FindUniqueArgs,`);
  content.push(`  ctx: FlowCtx = {}`);
  content.push(`): Promise<Flow${model.name} | null> {`);
  content.push(`  const policy = await can${model.name}("read", ctx || {});`);
  content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
  content.push(``);
  
  if (cfg.perModelSelect[model.name]) {
    content.push(`  return prisma.${modelCamel}.findUnique({`);
    content.push(`    select: ${model.name}Select,`);
    content.push(`    ...args,`);
    content.push(`    where: { ...args.where, ...policy.where }`);
    content.push(`  }) as Promise<Flow${model.name} | null>;`);
  } else {
    content.push(`  return prisma.${modelCamel}.findUnique({`);
    content.push(`    ...args,`);
    content.push(`    where: { ...args.where, ...policy.where }`);
    content.push(`  }) as Promise<Flow${model.name} | null>;`);
  }
  
  content.push(`}`);
  content.push(``);

  // findUniqueOrThrow
  content.push(`export async function findUniqueOrThrow(`);
  content.push(`  args: Prisma.${model.name}FindUniqueOrThrowArgs,`);
  content.push(`  ctx: FlowCtx = {}`);
  content.push(`): Promise<Flow${model.name}> {`);
  content.push(`  const policy = await can${model.name}("read", ctx || {});`);
  content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
  content.push(``);
  
  if (cfg.perModelSelect[model.name]) {
    content.push(`  return prisma.${modelCamel}.findUniqueOrThrow({`);
    content.push(`    select: ${model.name}Select,`);
    content.push(`    ...args,`);
    content.push(`    where: { ...args.where, ...policy.where }`);
    content.push(`  }) as Promise<Flow${model.name}>;`);
  } else {
    content.push(`  return prisma.${modelCamel}.findUniqueOrThrow({`);
    content.push(`    ...args,`);
    content.push(`    where: { ...args.where, ...policy.where }`);
    content.push(`  }) as Promise<Flow${model.name}>;`);
  }
  
  content.push(`}`);
  content.push(``);

  // findFirst
  content.push(`export async function findFirst(`);
  content.push(`  args?: Prisma.${model.name}FindFirstArgs,`);
  content.push(`  ctx: FlowCtx = {}`);
  content.push(`): Promise<Flow${model.name} | null> {`);
  content.push(`  const policy = await can${model.name}("list", ctx || {});`);
  content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
  content.push(``);
  
  if (cfg.perModelSelect[model.name]) {
    content.push(`  return prisma.${modelCamel}.findFirst({`);
    content.push(`    select: ${model.name}Select,`);
    content.push(`    ...args,`);
    content.push(`    where: { ...args?.where, ...policy.where }`);
    content.push(`  }) as Promise<Flow${model.name} | null>;`);
  } else {
    content.push(`  return prisma.${modelCamel}.findFirst({`);
    content.push(`    ...args,`);
    content.push(`    where: { ...args?.where, ...policy.where }`);
    content.push(`  }) as Promise<Flow${model.name} | null>;`);
  }
  
  content.push(`}`);
  content.push(``);

  // findFirstOrThrow
  content.push(`export async function findFirstOrThrow(`);
  content.push(`  args?: Prisma.${model.name}FindFirstOrThrowArgs,`);
  content.push(`  ctx: FlowCtx = {}`);
  content.push(`): Promise<Flow${model.name}> {`);
  content.push(`  const policy = await can${model.name}("list", ctx || {});`);
  content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
  content.push(``);
  
  if (cfg.perModelSelect[model.name]) {
    content.push(`  return prisma.${modelCamel}.findFirstOrThrow({`);
    content.push(`    select: ${model.name}Select,`);
    content.push(`    ...args,`);
    content.push(`    where: { ...args?.where, ...policy.where }`);
    content.push(`  }) as Promise<Flow${model.name}>;`);
  } else {
    content.push(`  return prisma.${modelCamel}.findFirstOrThrow({`);
    content.push(`    ...args,`);
    content.push(`    where: { ...args?.where, ...policy.where }`);
    content.push(`  }) as Promise<Flow${model.name}>;`);
  }
  
  content.push(`}`);
  content.push(``);

  // findMany
  content.push(`export async function findMany(`);
  content.push(`  args?: Prisma.${model.name}FindManyArgs,`);
  content.push(`  ctx: FlowCtx = {}`);
  content.push(`): Promise<Flow${model.name}[]> {`);
  content.push(`  const policy = await can${model.name}("list", ctx || {});`);
  content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
  content.push(``);
  
  if (cfg.perModelSelect[model.name]) {
    content.push(`  return prisma.${modelCamel}.findMany({`);
    content.push(`    select: ${model.name}Select,`);
    content.push(`    ...args,`);
    content.push(`    where: { ...args?.where, ...policy.where }`);
    content.push(`  }) as Promise<Flow${model.name}[]>;`);
  } else {
    content.push(`  return prisma.${modelCamel}.findMany({`);
    content.push(`    ...args,`);
    content.push(`    where: { ...args?.where, ...policy.where }`);
    content.push(`  }) as Promise<Flow${model.name}[]>;`);
  }
  
  content.push(`}`);
  content.push(``);

  // create
  content.push(`export async function create(`);
  content.push(`  args: Prisma.${model.name}CreateArgs,`);
  content.push(`  ctx: FlowCtx = {}`);
  content.push(`): Promise<Flow${model.name}> {`);
  content.push(`  const policy = await can${model.name}("create", ctx || {});`);
  content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
  content.push(``);
  
  if (cfg.perModelSelect[model.name]) {
    content.push(`  const result = await prisma.${modelCamel}.create({`);
    content.push(`    select: ${model.name}Select,`);
    content.push(`    ...args,`);
    content.push(`    data: deepMergePrismaData(args.data, policy.data || {}, "${model.name}")`);
    content.push(`  }) as Flow${model.name};`);
  } else {
    content.push(`  const result = await prisma.${modelCamel}.create({`);
    content.push(`    ...args,`);
    content.push(`    data: deepMergePrismaData(args.data, policy.data || {}, "${model.name}")`);
    content.push(`  }) as Flow${model.name};`);
  }
  
  content.push(``);
  content.push(`  return result;`);
  content.push(`}`);
  content.push(``);

  // createMany
  content.push(`export async function createMany(`);
  content.push(`  args: Prisma.${model.name}CreateManyArgs,`);
  content.push(`  ctx: FlowCtx = {}`);
  content.push(`) {`);
  content.push(`  const policy = await can${model.name}("create", ctx || {});`);
  content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
  content.push(``);
  content.push(`  // Apply policy data to each item using deep merge`);
  content.push(`  const data = Array.isArray(args.data) `);
  content.push(`    ? args.data.map(item => deepMergePrismaData(item, policy.data || {}, "${model.name}"))`);
  content.push(`    : deepMergePrismaData(args.data, policy.data || {});`);
  content.push(``);
  content.push(`  return prisma.${modelCamel}.createMany({`);
  content.push(`    ...args,`);
  content.push(`    data`);
  content.push(`  });`);
  content.push(`}`);
  content.push(``);

  // update
  content.push(`export async function update(`);
  content.push(`  args: Prisma.${model.name}UpdateArgs,`);
  content.push(`  ctx: FlowCtx = {}`);
  content.push(`): Promise<Flow${model.name}> {`);
  content.push(`  const policy = await can${model.name}("update", ctx || {});`);
  content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
  content.push(``);
  
  if (cfg.perModelSelect[model.name]) {
    content.push(`  const result = await prisma.${modelCamel}.update({`);
    content.push(`    select: ${model.name}Select,`);
    content.push(`    ...args,`);
    content.push(`    where: { ...args.where, ...policy.where },`);
    content.push(`    data: deepMergePrismaData(args.data, policy.data || {}, "${model.name}")`);
    content.push(`  }) as Flow${model.name};`);
  } else {
    content.push(`  const result = await prisma.${modelCamel}.update({`);
    content.push(`    ...args,`);
    content.push(`    where: { ...args.where, ...policy.where },`);
    content.push(`    data: deepMergePrismaData(args.data, policy.data || {}, "${model.name}")`);
    content.push(`  }) as Flow${model.name};`);
  }
  
  content.push(``);
  content.push(`  return result;`);
  content.push(`}`);
  content.push(``);

  // updateMany
  content.push(`export async function updateMany(`);
  content.push(`  args: Prisma.${model.name}UpdateManyArgs,`);
  content.push(`  ctx: FlowCtx = {}`);
  content.push(`) {`);
  content.push(`  const policy = await can${model.name}("update", ctx || {});`);
  content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
  content.push(``);
  content.push(`  return prisma.${modelCamel}.updateMany({`);
  content.push(`    ...args,`);
  content.push(`    where: { ...args.where, ...policy.where },`);
  content.push(`    data: deepMergePrismaData(args.data, policy.data || {}, "${model.name}")`);
  content.push(`  });`);
  content.push(`}`);
  content.push(``);

  // upsert
  content.push(`export async function upsert(`);
  content.push(`  args: Prisma.${model.name}UpsertArgs,`);
  content.push(`  ctx: FlowCtx = {}`);
  content.push(`): Promise<Flow${model.name}> {`);
  content.push(`  // Check both create and update policies`);
  content.push(`  const createPolicy = await can${model.name}("create", ctx);`);
  content.push(`  const updatePolicy = await can${model.name}("update", ctx);`);
  content.push(``);
  content.push(`  // Need both permissions for upsert`);
  content.push(`  if (!createPolicy.ok || !updatePolicy.ok) {`);
  content.push(`    throw new FlowPolicyError("Insufficient permissions for upsert");`);
  content.push(`  }`);
  content.push(``);
  
  if (cfg.perModelSelect[model.name]) {
    content.push(`  return prisma.${modelCamel}.upsert({`);
    content.push(`    select: ${model.name}Select,`);
    content.push(`    ...args,`);
    content.push(`    where: { ...args.where, ...updatePolicy.where },`);
    content.push(`    create: deepMergePrismaData(args.create, createPolicy.data || {}, "${model.name}"),`);
    content.push(`    update: deepMergePrismaData(args.update, updatePolicy.data || {}, "${model.name}")`);
    content.push(`  }) as Promise<Flow${model.name}>;`);
  } else {
    content.push(`  return prisma.${modelCamel}.upsert({`);
    content.push(`    ...args,`);
    content.push(`    where: { ...args.where, ...updatePolicy.where },`);
    content.push(`    create: deepMergePrismaData(args.create, createPolicy.data || {}, "${model.name}"),`);
    content.push(`    update: deepMergePrismaData(args.update, updatePolicy.data || {}, "${model.name}")`);
    content.push(`  }) as Promise<Flow${model.name}>;`);
  }
  
  content.push(`}`);
  content.push(``);

  // delete
  content.push(`export async function deleteOne(`);
  content.push(`  args: Prisma.${model.name}DeleteArgs,`);
  content.push(`  ctx: FlowCtx = {}`);
  content.push(`) {`);
  content.push(`  const policy = await can${model.name}("delete", ctx || {});`);
  content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
  content.push(``);
  content.push(`  return prisma.${modelCamel}.delete({`);
  content.push(`    ...args,`);
  content.push(`    where: { ...args.where, ...policy.where }`);
  content.push(`  });`);
  content.push(`}`);
  content.push(``);

  // deleteMany
  content.push(`export async function deleteMany(`);
  content.push(`  args?: Prisma.${model.name}DeleteManyArgs,`);
  content.push(`  ctx: FlowCtx = {}`);
  content.push(`) {`);
  content.push(`  const policy = await can${model.name}("delete", ctx || {});`);
  content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
  content.push(``);
  content.push(`  return prisma.${modelCamel}.deleteMany({`);
  content.push(`    ...args,`);
  content.push(`    where: { ...args?.where, ...policy.where }`);
  content.push(`  });`);
  content.push(`}`);
  content.push(``);

  // count
  content.push(`export async function count(`);
  content.push(`  args?: Prisma.${model.name}CountArgs,`);
  content.push(`  ctx: FlowCtx = {}`);
  content.push(`) {`);
  content.push(`  const policy = await can${model.name}("list", ctx || {});`);
  content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
  content.push(``);
  content.push(`  return prisma.${modelCamel}.count({`);
  content.push(`    ...args,`);
  content.push(`    where: { ...args?.where, ...policy.where }`);
  content.push(`  });`);
  content.push(`}`);
  content.push(``);

  // aggregate
  content.push(`export async function aggregate(`);
  content.push(`  args: Prisma.${model.name}AggregateArgs,`);
  content.push(`  ctx: FlowCtx = {}`);
  content.push(`) {`);
  content.push(`  const policy = await can${model.name}("list", ctx || {});`);
  content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
  content.push(``);
  content.push(`  return prisma.${modelCamel}.aggregate({`);
  content.push(`    ...args,`);
  content.push(`    where: { ...args.where, ...policy.where }`);
  content.push(`  });`);
  content.push(`}`);
  content.push(``);

  // groupBy
  content.push(`export async function groupBy<`);
  content.push(`  T extends Prisma.${model.name}GroupByArgs,`);
  content.push(`  HasSelectOrTake extends Prisma.Or<`);
  content.push(`    Prisma.Extends<'skip', Prisma.Keys<T>>,`);
  content.push(`    Prisma.Extends<'take', Prisma.Keys<T>>`);
  content.push(`  >,`);
  content.push(`  OrderByArg extends Prisma.True extends HasSelectOrTake`);
  content.push(`    ? { orderBy: Prisma.${model.name}GroupByArgs['orderBy'] }`);
  content.push(`    : { orderBy?: Prisma.${model.name}GroupByArgs['orderBy'] },`);
  content.push(`  OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>,`);
  content.push(`  ByFields extends Prisma.MaybeTupleToUnion<T['by']>,`);
  content.push(`  ByValid extends Prisma.Has<ByFields, OrderFields>,`);
  content.push(`  HavingFields extends Prisma.GetHavingFields<T['having']>,`);
  content.push(`  HavingValid extends Prisma.Has<ByFields, HavingFields>,`);
  content.push(`  ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False,`);
  content.push(`  InputErrors extends ByEmpty extends Prisma.True`);
  content.push(`    ? \`Error: "by" must not be empty.\``);
  content.push(`    : HavingValid extends Prisma.False`);
  content.push(`    ? {`);
  content.push(`        [P in HavingFields]: P extends ByFields`);
  content.push(`          ? never`);
  content.push(`          : P extends string`);
  content.push(`          ? \`Error: Field "\${P}" used in "having" needs to be provided in "by".\``);
  content.push(`          : [`);
  content.push(`              Error,`);
  content.push(`              'Field ',`);
  content.push(`              P,`);
  content.push(`              \` used in "having" needs to be provided in "by"\`,`);
  content.push(`            ]`);
  content.push(`      }[HavingFields]`);
  content.push(`    : 'take' extends Prisma.Keys<T>`);
  content.push(`    ? 'orderBy' extends Prisma.Keys<T>`);
  content.push(`      ? ByValid extends Prisma.True`);
  content.push(`        ? {}`);
  content.push(`        : {`);
  content.push(`            [P in OrderFields]: P extends ByFields`);
  content.push(`              ? never`);
  content.push(`              : \`Error: Field "\${P}" in "orderBy" needs to be provided in "by"\``);
  content.push(`          }[OrderFields]`);
  content.push(`      : 'Error: If you provide "take", you also need to provide "orderBy"'`);
  content.push(`    : 'skip' extends Prisma.Keys<T>`);
  content.push(`    ? 'orderBy' extends Prisma.Keys<T>`);
  content.push(`      ? ByValid extends Prisma.True`);
  content.push(`        ? {}`);
  content.push(`        : {`);
  content.push(`            [P in OrderFields]: P extends ByFields`);
  content.push(`              ? never`);
  content.push(`              : \`Error: Field "\${P}" in "orderBy" needs to be provided in "by"\``);
  content.push(`          }[OrderFields]`);
  content.push(`      : 'Error: If you provide "skip", you also need to provide "orderBy"'`);
  content.push(`    : ByValid extends Prisma.True`);
  content.push(`    ? {}`);
  content.push(`    : {`);
  content.push(`        [P in OrderFields]: P extends ByFields`);
  content.push(`          ? never`);
  content.push(`          : \`Error: Field "\${P}" in "orderBy" needs to be provided in "by"\``);
  content.push(`      }[OrderFields]`);
  content.push(`>(`);
  content.push(`  args: Prisma.SubsetIntersection<T, Prisma.${model.name}GroupByArgs, OrderByArg> & InputErrors,`);
  content.push(`  ctx: FlowCtx = {}`);
  content.push(`): Promise<{} extends InputErrors ? Prisma.Get${model.name}GroupByPayload<T> : InputErrors> {`);
  content.push(`  const policy = await can${model.name}("list", ctx || {});`);
  content.push(`  if (!policy.ok) throw new FlowPolicyError(policy.message);`);
  content.push(``);
  content.push(`  return prisma.${modelCamel}.groupBy({`);
  content.push(`    ...(args as any),`);
  content.push(`    where: { ...args.where, ...policy.where }`);
  content.push(`  } as any) as any;`);
  content.push(`}`);

  const serverDir = join(modelDir, "server");
  await write(join(serverDir, "methods.ts"), content.join("\n"));
}