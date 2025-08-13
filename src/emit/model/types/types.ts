import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../../config";
import { write } from "../../fs";
import { header, impType } from "../../strings";

export async function emitTypesTypes({
  modelDir,
  model,
  cfg,
}: {
  modelDir: string;
  model: DMMF.Model;
  cfg: FlowConfig;
}) {
  const content = [];
  content.push(header("types/types.ts"));
  content.push(impType("@prisma/client", ["Prisma"]));
  content.push(impType("../server/selects", [
    `${model.name}DeepSelect`,
    `${model.name}ListSelect`,
    `${model.name}ShallowSelect`,
  ]));
  content.push("");

  // Type aliases for Prisma payloads
  content.push(`// Type aliases for ${model.name} with different select levels`);
  content.push(`export type ${model.name}WithRelations = Prisma.${model.name}GetPayload<{`);
  content.push(`  select: typeof ${model.name}DeepSelect;`);
  content.push(`}>;`);
  content.push("");

  content.push(`export type ${model.name}ListItem = Prisma.${model.name}GetPayload<{`);
  content.push(`  select: typeof ${model.name}ListSelect;`);
  content.push(`}>;`);
  content.push("");

  content.push(`export type ${model.name}Shallow = Prisma.${model.name}GetPayload<{`);
  content.push(`  select: typeof ${model.name}ShallowSelect;`);
  content.push(`}>;`);
  content.push("");

  // Input/Args type helpers
  content.push(`// Input type helpers`);
  content.push(`export type ${model.name}CreateInput = Prisma.${model.name}CreateInput;`);
  content.push(`export type ${model.name}UpdateInput = Prisma.${model.name}UpdateInput;`);
  content.push(`export type ${model.name}WhereInput = Prisma.${model.name}WhereInput;`);
  content.push(`export type ${model.name}WhereUniqueInput = Prisma.${model.name}WhereUniqueInput;`);
  content.push(`export type ${model.name}OrderByInput = Prisma.${model.name}OrderByWithRelationInput;`);
  content.push("");

  // Relation type helpers
  const relationFields = model.fields.filter(f => f.kind === "object");
  if (relationFields.length > 0) {
    content.push(`// Relation type helpers`);
    for (const field of relationFields) {
      content.push(`export type ${model.name}With${capitalize(field.name)} = ${model.name}WithRelations & {`);
      content.push(`  ${field.name}: NonNullable<${model.name}WithRelations['${field.name}']>;`);
      content.push(`};`);
    }
    content.push("");
  }

  // Utility types
  content.push(`// Utility types`);
  content.push(`export type ${model.name}Id = ${model.name}WithRelations['${model.fields.find(f => f.isId)?.name || 'id'}'];`);
  content.push(`export type Partial${model.name} = Partial<${model.name}WithRelations>;`);
  content.push(`export type ${model.name}Keys = keyof ${model.name}WithRelations;`);
  content.push("");

  // Pagination types
  content.push(`// Pagination types`);
  content.push(`export type ${model.name}Page = {`);
  content.push(`  items: ${model.name}ListItem[];`);
  content.push(`  total: number;`);
  content.push(`  page: number;`);
  content.push(`  pageSize: number;`);
  content.push(`  totalPages: number;`);
  content.push(`};`);
  content.push("");

  content.push(`export type ${model.name}Cursor = {`);
  content.push(`  items: ${model.name}ListItem[];`);
  content.push(`  nextCursor?: ${model.name}WhereUniqueInput;`);
  content.push(`  hasMore: boolean;`);
  content.push(`};`);

  const typesDir = join(modelDir, "types");
  await write(join(typesDir, "types.ts"), content.join("\n"));
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}