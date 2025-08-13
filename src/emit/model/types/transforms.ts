import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../../config";
import { write } from "../../fs";
import { header, imp, impType } from "../../strings";
import { isScalar, isEnum, isRelation, targetModel } from "../../../dmmf";

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
  
  // Collect all referenced models for imports (only for configured fields)
  const referencedModels = new Set<string>();
  for (const field of model.fields) {
    // Skip if field is not in configured fields
    if (configuredFields && !configuredFields.includes(field.name)) {
      continue;
    }
    
    if (isRelation(field) && !field.isReadOnly) {
      const target = targetModel(field);
      if (target !== model.name) {
        referencedModels.add(target);
      }
    }
  }
  
  // Add imports for referenced model transformers
  for (const refModel of referencedModels) {
    const refModelLower = refModel.toLowerCase();
    content.push(imp(`../../${refModelLower}/types/transforms`, [
      `transform${refModel}Create`,
    ]));
  }
  
  content.push("");
  
  // Generate create transformer
  content.push(generateTransformer(model, dmmf, cfg, "create", referencedModels));
  content.push("");
  
  // Generate update transformer
  content.push(generateTransformer(model, dmmf, cfg, "update", referencedModels));
  
  const typesDir = join(modelDir, "types");
  await write(join(typesDir, "transforms.ts"), content.join("\n"));
}

function generateTransformer(
  model: DMMF.Model,
  dmmf: DMMF.Document,
  cfg: FlowConfig,
  operation: "create" | "update",
  referencedModels: Set<string>
): string {
  const lines: string[] = [];
  const fnName = `transform${model.name}${operation === "create" ? "Create" : "Update"}`;
  const inputType = `Flow${model.name}${operation === "create" ? "Create" : "Update"}`;
  const outputType = `Prisma.${model.name}${operation === "create" ? "CreateInput" : "UpdateInput"}`;
  
  // Get configured fields for this model
  const configuredFields = cfg.perModelSelect[model.name];
  
  lines.push(`export function ${fnName}(input: ${inputType}): ${outputType} {`);
  lines.push(`  const result: ${outputType} = {} as ${outputType};`);
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
        if (field.isList) {
          lines.push(`    const ${field.name}Data = input.${field.name};`);
          lines.push(`    if (${field.name}Data) {`);
          lines.push(`      if ("connect" in ${field.name}Data && ${field.name}Data.connect) {`);
          lines.push(`        result.${field.name} = { connect: ${field.name}Data.connect };`);
          lines.push(`      } else if ("create" in ${field.name}Data && ${field.name}Data.create) {`);
          if (target !== model.name) {
            lines.push(`        result.${field.name} = {`);
            lines.push(`          create: Array.isArray(${field.name}Data.create)`);
            lines.push(`            ? ${field.name}Data.create.map(item => transform${target}Create(item))`);
            lines.push(`            : transform${target}Create(${field.name}Data.create)`);
            lines.push(`        };`);
          } else {
            // Self-reference - only pass scalar fields and FKs for unchecked input
            lines.push(`        const cleanedData = Array.isArray(${field.name}Data.create)`);
            lines.push(`          ? ${field.name}Data.create.map((item: any) => {`);
            lines.push(`              // Extract only scalar fields and foreign keys that exist in input`);
            lines.push(`              const cleaned: any = {};`);
            // Add all scalar fields from the model that could be in the input
            for (const f of model.fields) {
              if (!isRelation(f)) {
                lines.push(`              if ('${f.name}' in item && item.${f.name} !== undefined) cleaned.${f.name} = item.${f.name};`);
              }
            }
            lines.push(`              return cleaned;`);
            lines.push(`            })`);
            lines.push(`          : (() => {`);
            lines.push(`              const item = ${field.name}Data.create;`);
            lines.push(`              const cleaned: any = {};`);
            // Add all scalar fields from the model that could be in the input
            for (const f of model.fields) {
              if (!isRelation(f)) {
                lines.push(`              if ('${f.name}' in item && item.${f.name} !== undefined) cleaned.${f.name} = item.${f.name};`);
              }
            }
            lines.push(`              return cleaned;`);
            lines.push(`            })();`);
            lines.push(`        result.${field.name} = { create: cleanedData };`);
          }
          lines.push(`      }`);
          lines.push(`    }`);
        } else {
          // Handle one-to-one relations
          lines.push(`    const ${field.name}Data = input.${field.name};`);
          lines.push(`    if (${field.name}Data) {`)
          
          lines.push(`      if ("connect" in ${field.name}Data && ${field.name}Data.connect) {`);
          lines.push(`        result.${field.name} = { connect: ${field.name}Data.connect };`);
          lines.push(`      } else if ("create" in ${field.name}Data && ${field.name}Data.create) {`);
          if (target !== model.name) {
            lines.push(`        result.${field.name} = { create: transform${target}Create(${field.name}Data.create) };`);
          } else {
            // Self-reference - only pass scalar fields and FKs for unchecked input
            lines.push(`        const item = ${field.name}Data.create;`);
            lines.push(`        const cleanedData: any = {};`);
            // Add all scalar fields from the model that could be in the input
            for (const f of model.fields) {
              if (!isRelation(f)) {
                lines.push(`        if ('${f.name}' in item && item.${f.name} !== undefined) cleanedData.${f.name} = item.${f.name};`);
              }
            }
            lines.push(`        result.${field.name} = { create: cleanedData };`);
          }
          lines.push(`      } else if ("connectOrCreate" in ${field.name}Data && ${field.name}Data.connectOrCreate) {`);
          lines.push(`        result.${field.name} = {`);
          lines.push(`          connectOrCreate: {`);
          lines.push(`            where: ${field.name}Data.connectOrCreate.where,`);
          if (target !== model.name) {
            lines.push(`            create: transform${target}Create(${field.name}Data.connectOrCreate.create)`);
          } else {
            // Self-reference - only pass scalar fields and FKs for unchecked input
            lines.push(`            create: (() => {`);
            lines.push(`              const item = ${field.name}Data.connectOrCreate.create;`);
            lines.push(`              const cleanedData: any = {};`);
            // Add all scalar fields from the model that could be in the input
            for (const f of model.fields) {
              if (!isRelation(f)) {
                lines.push(`              if ('${f.name}' in item && item.${f.name} !== undefined) cleanedData.${f.name} = item.${f.name};`);
              }
            }
            lines.push(`              return cleanedData;`);
            lines.push(`            })()`);
          }
          lines.push(`          }`);
          lines.push(`        };`);
          lines.push(`      }`);
          lines.push(`    }`);
        }
      } else {
        // For update operations, handle ALL Prisma operations
        lines.push(`    const ${field.name}Data = input.${field.name};`);
        lines.push(`    if (${field.name}Data) {`);
        lines.push(`      result.${field.name} = {};`);
        
        // Create operations
        lines.push(`      if ("create" in ${field.name}Data && ${field.name}Data.create) {`);
        if (target !== model.name) {
          if (field.isList) {
            lines.push(`        result.${field.name}.create = Array.isArray(${field.name}Data.create)`);
            lines.push(`          ? ${field.name}Data.create.map(item => transform${target}Create(item))`);
            lines.push(`          : transform${target}Create(${field.name}Data.create);`);
          } else {
            lines.push(`        result.${field.name}.create = transform${target}Create(${field.name}Data.create);`);
          }
        } else {
          // Self-reference - pass through for unchecked input
          lines.push(`        result.${field.name}.create = ${field.name}Data.create;`);
        }
        lines.push(`      }`);
        
        // CreateMany (only for list relations)
        if (field.isList) {
          lines.push(`      if ("createMany" in ${field.name}Data && ${field.name}Data.createMany) {`);
          lines.push(`        result.${field.name}.createMany = ${field.name}Data.createMany;`);
          lines.push(`      }`);
        }
        
        // Connect
        lines.push(`      if ("connect" in ${field.name}Data && ${field.name}Data.connect) {`);
        lines.push(`        result.${field.name}.connect = ${field.name}Data.connect;`);
        lines.push(`      }`);
        
        // ConnectOrCreate
        lines.push(`      if ("connectOrCreate" in ${field.name}Data && ${field.name}Data.connectOrCreate) {`);
        lines.push(`        result.${field.name}.connectOrCreate = ${field.name}Data.connectOrCreate;`);
        lines.push(`      }`);
        
        // Update operations
        lines.push(`      if ("update" in ${field.name}Data && ${field.name}Data.update) {`);
        lines.push(`        result.${field.name}.update = ${field.name}Data.update;`);
        lines.push(`      }`);
        
        if (field.isList) {
          lines.push(`      if ("updateMany" in ${field.name}Data && ${field.name}Data.updateMany) {`);
          lines.push(`        result.${field.name}.updateMany = ${field.name}Data.updateMany;`);
          lines.push(`      }`);
        }
        
        // Upsert
        lines.push(`      if ("upsert" in ${field.name}Data && ${field.name}Data.upsert) {`);
        lines.push(`        result.${field.name}.upsert = ${field.name}Data.upsert;`);
        lines.push(`      }`);
        
        // Delete operations (only for list relations)
        if (field.isList) {
          lines.push(`      if ("delete" in ${field.name}Data && ${field.name}Data.delete) {`);
          lines.push(`        result.${field.name}.delete = ${field.name}Data.delete;`);
          lines.push(`      }`);
          lines.push(`      if ("deleteMany" in ${field.name}Data && ${field.name}Data.deleteMany) {`);
          lines.push(`        result.${field.name}.deleteMany = ${field.name}Data.deleteMany;`);
          lines.push(`      }`);
        }
        
        // Disconnect handling
        if (field.isList) {
          // Many-to-many relations always support disconnect with WhereUniqueInput
          lines.push(`      if ("disconnect" in ${field.name}Data && ${field.name}Data.disconnect) {`);
          lines.push(`        result.${field.name}.disconnect = ${field.name}Data.disconnect;`);
          lines.push(`      }`);
          // Set is also available for list relations  
          lines.push(`      if ("set" in ${field.name}Data && ${field.name}Data.set) {`);
          lines.push(`        result.${field.name}.set = ${field.name}Data.set;`);
          lines.push(`      }`);
        } else if (!field.isRequired) {
          // Only optional one-to-one/many-to-one relations can be disconnected
          lines.push(`      if ("disconnect" in ${field.name}Data && ${field.name}Data.disconnect) {`);
          lines.push(`        result.${field.name}.disconnect = ${field.name}Data.disconnect;`);
          lines.push(`      }`);
        }
        // Note: Required one-to-one/many-to-one relations cannot be disconnected
        
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
          lines.push(`  if ("${foreignKeyField}" in input && input.${foreignKeyField}) {`);
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

