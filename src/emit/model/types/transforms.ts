import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../../config";
import { write } from "../../fs";
import { header, imp, impType } from "../../strings";
import { isScalar, isEnum, isRelation, targetModel } from "../../../dmmf";
import { isManyToMany } from "./schema-builder";

export async function emitTypesTransforms({
  modelDir,
  dmmf,
  model,
  cfg,
}: {
  modelDir: string;
  dmmf: DMMF.Document;
  model: DMMF.Model;
  cfg: FlowConfig;
}) {
  const content = [];
  content.push(header("types/transforms.ts"));
  content.push(impType("../../prisma", ["Prisma"]));
  content.push(impType("./schemas", [`Flow${model.name}Create`, `Flow${model.name}Update`]));
  
  // Get configured fields for this model
  const configuredFields = cfg.perModelSelect[model.name];
  
  // We no longer need to import transform functions from other models
  // since we'll pass nested data directly without transformation
  
  content.push("");
  
  // Generate create transformer
  content.push(generateTransformer(model, dmmf, cfg, "create"));
  content.push("");
  
  // Generate update transformer
  content.push(generateTransformer(model, dmmf, cfg, "update"));
  
  const typesDir = join(modelDir, "types");
  await write(join(typesDir, "transforms.ts"), content.join("\n"));
}

function generateTransformer(
  model: DMMF.Model,
  dmmf: DMMF.Document,
  cfg: FlowConfig,
  operation: "create" | "update"
): string {
  const lines: string[] = [];
  const fnName = `transform${model.name}${operation === "create" ? "Create" : "Update"}`;
  const inputType = `Flow${model.name}${operation === "create" ? "Create" : "Update"}`;
  const outputType = `Prisma.${model.name}${operation === "create" ? "CreateInput" : "UpdateInput"}`;
  
  // Get configured fields for this model
  const configuredFields = cfg.perModelSelect[model.name];
  
  lines.push(`export function ${fnName}(input: ${inputType}): ${outputType} {`);
  lines.push(`  const result: any = {};`);
  lines.push(``);
  
  // Handle scalar and enum fields
  for (const field of model.fields) {
    // Skip if field is not in configured fields
    if (configuredFields && !configuredFields.includes(field.name)) {
      continue;
    }
    
    if (isScalar(field) || isEnum(field)) {
      if (!field.isId && !field.isReadOnly && !field.isGenerated && !field.isUpdatedAt) {
        if (operation === "create" && field.isRequired && !field.hasDefaultValue) {
          lines.push(`  result.${field.name} = input.${field.name};`);
        } else if (operation === "update") {
          // For updates, handle null differently based on whether field is required
          lines.push(`  const ${field.name}Value = input.${field.name};`);
          if (field.isRequired) {
            // Required fields cannot be set to null
            lines.push(`  if (${field.name}Value !== undefined && ${field.name}Value !== null) {`);
          } else {
            // Optional fields can be set to null to clear them
            lines.push(`  if (${field.name}Value !== undefined) {`);
          }
          lines.push(`    result.${field.name} = ${field.name}Value;`);
          lines.push(`  }`);
        } else {
          // For create operations with optional fields
          lines.push(`  if ("${field.name}" in input && input.${field.name} !== undefined) {`);
          lines.push(`    result.${field.name} = input.${field.name};`);
          lines.push(`  }`);
        }
      }
    }
  }
  
  // Handle relation fields with inline type-safe transformations
  for (const field of model.fields) {
    // Skip if field is not in configured fields
    if (configuredFields && !configuredFields.includes(field.name)) {
      continue;
    }
    
    if (isRelation(field) && !field.isReadOnly) {
      const target = targetModel(field);
      const targetModelDef = dmmf.datamodel.models.find(m => m.name === target);
      
      if (!targetModelDef) continue;
      
      const foreignKeyField = field.relationFromFields?.[0];
      
      // Check if we should handle the foreign key field directly
      if (operation === "create" && foreignKeyField) {
        // Handle the case where foreign key is provided but relation field is not
        lines.push(`  if (input.${field.name} !== undefined) {`);
      } else {
        lines.push(`  if (input.${field.name} !== undefined) {`);
      }
      
      if (operation === "create") {
        // For create operations, handle connect/create/connectOrCreate
        // Since our schemas already generate the correct "WithoutXxx" types,
        // we can pass the data directly without transformation
        if (field.isList) {
          lines.push(`    const ${field.name}Data = input.${field.name};`);
          lines.push(`    if (${field.name}Data) {`);
          lines.push(`      if ("connect" in ${field.name}Data && ${field.name}Data.connect) {`);
          lines.push(`        result.${field.name} = { connect: ${field.name}Data.connect };`);
          lines.push(`      } else if ("create" in ${field.name}Data && ${field.name}Data.create) {`);
          lines.push(`        result.${field.name} = {`);
          lines.push(`          create: ${field.name}Data.create as any`);
          lines.push(`        };`);
          lines.push(`      } else if ("createMany" in ${field.name}Data && ${field.name}Data.createMany) {`);
          // Only handle createMany for one-to-many relations
          if (!isManyToMany(field)) {
            lines.push(`        result.${field.name} = {`);
            lines.push(`          createMany: ${field.name}Data.createMany as any`);
            lines.push(`        };`);
          }
          lines.push(`      } else if ("connectOrCreate" in ${field.name}Data && ${field.name}Data.connectOrCreate) {`);
          lines.push(`        result.${field.name} = {`);
          lines.push(`          connectOrCreate: ${field.name}Data.connectOrCreate as any`);
          lines.push(`        };`);
          lines.push(`      }`);
          lines.push(`    }`);
        } else {
          // Handle one-to-one relations
          lines.push(`    const ${field.name}Data = input.${field.name};`);
          lines.push(`    if (${field.name}Data) {`)
          
          lines.push(`      if ("connect" in ${field.name}Data && ${field.name}Data.connect) {`);
          lines.push(`        result.${field.name} = { connect: ${field.name}Data.connect };`);
          lines.push(`      } else if ("create" in ${field.name}Data && ${field.name}Data.create) {`);
          lines.push(`        result.${field.name} = { create: ${field.name}Data.create as any };`);
          lines.push(`      } else if ("connectOrCreate" in ${field.name}Data && ${field.name}Data.connectOrCreate) {`);
          lines.push(`        result.${field.name} = {`);
          lines.push(`          connectOrCreate: ${field.name}Data.connectOrCreate as any`);
          lines.push(`        };`);
          lines.push(`      }`);
          lines.push(`    }`);
        }
      } else {
        // For update operations, pass the data directly
        // Our schemas already generate the correct types
        lines.push(`    const ${field.name}Data = input.${field.name};`);
        lines.push(`    if (${field.name}Data) {`);
        lines.push(`      result.${field.name} = ${field.name}Data as any;`);
        lines.push(`    }`);
      }
      
      lines.push(`  }`);
      
      // After handling the relation field, check if we need to handle the foreign key separately
      if (operation === "create" && foreignKeyField && !field.isList) {
        // Add a separate check for when the foreign key is provided but the relation field is not
        lines.push(`  // Handle foreign key field when relation is not provided`);
        lines.push(`  if (input.${field.name} === undefined && "${foreignKeyField}" in input && input.${foreignKeyField}) {`);
        lines.push(`    result.${field.name} = { connect: { id: input.${foreignKeyField} } };`);
        lines.push(`  }`);
      }
    }
  }
  
  // Handle foreign keys for relations that aren't in configured fields
  if (operation === "create") {
    for (const field of model.fields) {
      if (isRelation(field) && !field.isReadOnly && !field.isList) {
        const foreignKeyField = field.relationFromFields?.[0];
        
        // Only add if the relation wasn't already handled above
        if (foreignKeyField && configuredFields && !configuredFields.includes(field.name)) {
          lines.push(`  // Handle ${field.name} foreign key when relation is not configured`);
          lines.push(`  if ("${foreignKeyField}" in input && input.${foreignKeyField} !== undefined && input.${foreignKeyField} !== null) {`);
          lines.push(`    result.${field.name} = { connect: { id: input.${foreignKeyField} } };`);
          lines.push(`  }`);
        }
      }
    }
  }
  
  lines.push(``);
  lines.push(`  return result;`);
  lines.push(`}`);
  
  return lines.join("\n");
}

