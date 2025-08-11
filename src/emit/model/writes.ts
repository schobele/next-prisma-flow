import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../config";
import { write } from "../fs";
import { header, imp, impType } from "../strings";
import { join } from "node:path";
import { isScalar, isEnum, isRelation, targetModel } from "../../dmmf";

export async function emitWrites({
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
  const content = [];
  content.push(header("writes.ts"));
  content.push(impType("@prisma/client", ["Prisma"]));
  content.push(impType("./zod", [`Flow${model.name}Write`]));
  
  // Collect all referenced models for imports
  const referencedModels = new Set<string>();
  for (const field of model.fields) {
    if (isRelation(field) && !field.isReadOnly) {
      const target = targetModel(field);
      if (target !== model.name) { // Don't import self
        referencedModels.add(target);
      }
    }
  }
  
  // Add imports for referenced model transformers
  for (const refModel of referencedModels) {
    const refModelLower = refModel.toLowerCase();
    content.push(imp(`../${refModelLower}/writes`, [`transform${refModel}Create`, `transform${refModel}Update`]));
  }
  
  content.push("");
  
  content.push(generateTransformer(model, dmmf, "create"));
  content.push("");
  content.push(generateTransformer(model, dmmf, "update"));
  
  await write(join(modelDir, "writes.ts"), content.join("\n"));
}

function generateTransformer(
  model: DMMF.Model,
  dmmf: DMMF.Document,
  operation: "create" | "update"
): string {
  const lines: string[] = [];
  const fnName = `transform${model.name}${operation === "create" ? "Create" : "Update"}`;
  const inputType = operation === "create" ? `Flow${model.name}Write` : `Partial<Flow${model.name}Write>`;
  const outputType = `Prisma.${model.name}${operation === "create" ? "CreateInput" : "UpdateInput"}`;
  
  lines.push(`export function ${fnName}(input: ${inputType}): ${outputType} {`);
  lines.push(`  const result: any = {};`);
  lines.push(``);
  
  for (const field of model.fields) {
    if (isScalar(field) || isEnum(field)) {
      if (!field.isId && !field.isReadOnly && !field.isGenerated && !field.isUpdatedAt) {
        // For create operation with required fields, access directly
        // For update operation or optional fields, check existence
        if (operation === "create" && field.isRequired && !field.hasDefaultValue) {
          lines.push(`  result.${field.name} = input.${field.name} as any;`);
        } else {
          lines.push(`  if ("${field.name}" in input) {`);
          lines.push(`    result.${field.name} = input.${field.name} as any;`);
          lines.push(`  }`);
        }
      }
    } else if (isRelation(field) && !field.isReadOnly) {
      const target = targetModel(field);
      const targetModelDef = dmmf.datamodel.models.find(m => m.name === target);
      const idField = targetModelDef?.fields.find(f => f.isId);
      const uniqueFields = targetModelDef?.fields.filter(f => f.isUnique && isScalar(f)) || [];
      
      // Check if there's a direct foreign key field (e.g., authorId for author relation)
      const foreignKeyField = field.relationFromFields?.[0];
      
      if (targetModelDef) {
        // First check if direct foreign key is provided (e.g., authorId)
        if (foreignKeyField) {
          lines.push(`  if (input.${foreignKeyField} !== undefined && input.${field.name} === undefined) {`);
          lines.push(`    // Direct foreign key provided - use connect`);
          lines.push(`    result.${field.name} = { connect: { ${idField?.name || 'id'}: input.${foreignKeyField} } };`);
          lines.push(`  } else if (input.${field.name} !== undefined) {`);
        } else {
          lines.push(`  if (input.${field.name} !== undefined) {`);
        }
        
        // For self-referential relations, use the same model's transform functions
        const transformCreate = target === model.name ? fnName.replace("Update", "Create") : `transform${target}Create`;
        const transformUpdate = target === model.name ? fnName.replace("Create", "Update") : `transform${target}Update`;
        
        if (field.isList) {
          // List relations - handle array of discriminated union items
          lines.push(`    if (Array.isArray(input.${field.name})) {`);
          lines.push(`      const connects: any[] = [];`);
          lines.push(`      const creates: any[] = [];`);
          lines.push(`      const connectOrCreates: any[] = [];`);
          
          if (operation === "update") {
            lines.push(`      const updates: any[] = [];`);
            lines.push(`      const upserts: any[] = [];`);
            lines.push(`      const deletes: any[] = [];`);
            lines.push(`      let hasSet = false;`);
          }
          
          lines.push(`      `);
          lines.push(`      for (const item of input.${field.name}) {`);
          lines.push(`        const strategy = item.flowRelationStrategy;`);
          lines.push(`        const data = { ...item };`);
          lines.push(`        delete data.flowRelationStrategy;`);
          lines.push(`        `);
          lines.push(`        switch (strategy) {`);
          lines.push(`          case 'connect': {`);
          lines.push(`            const where: any = {};`);
          if (idField) {
            lines.push(`            if (data.${idField.name}) where.${idField.name} = data.${idField.name};`);
          }
          for (const uniqueField of uniqueFields) {
            lines.push(`            if (data.${uniqueField.name}) where.${uniqueField.name} = data.${uniqueField.name};`);
          }
          lines.push(`            connects.push(where);`);
          lines.push(`            break;`);
          lines.push(`          }`);
          lines.push(`          `);
          lines.push(`          case 'create': {`);
          lines.push(`            creates.push(${transformCreate}(data));`);
          lines.push(`            break;`);
          lines.push(`          }`);
          lines.push(`          `);
          lines.push(`          case 'connectOrCreate': {`);
          lines.push(`            const where: any = {};`);
          if (idField) {
            lines.push(`            if (data.${idField.name}) where.${idField.name} = data.${idField.name};`);
          }
          for (const uniqueField of uniqueFields) {
            lines.push(`            if (data.${uniqueField.name}) where.${uniqueField.name} = data.${uniqueField.name};`);
          }
          lines.push(`            const createData = { ...data };`);
          if (idField) {
            lines.push(`            delete createData.${idField.name};`);
          }
          for (const uniqueField of uniqueFields) {
            lines.push(`            if (where.${uniqueField.name}) delete createData.${uniqueField.name};`);
          }
          lines.push(`            connectOrCreates.push({`);
          lines.push(`              where,`);
          lines.push(`              create: ${transformCreate}(createData)`);
          lines.push(`            });`);
          lines.push(`            break;`);
          lines.push(`          }`);
          
          if (operation === "update") {
            lines.push(`          `);
            lines.push(`          case 'update': {`);
            lines.push(`            const where: any = {};`);
            if (idField) {
              lines.push(`            if (data.${idField.name}) where.${idField.name} = data.${idField.name};`);
            }
            lines.push(`            updates.push({`);
            lines.push(`              where,`);
            lines.push(`              data: ${transformUpdate}(data)`);
            lines.push(`            });`);
            lines.push(`            break;`);
            lines.push(`          }`);
            lines.push(`          `);
            lines.push(`          case 'set': {`);
            lines.push(`            hasSet = true;`);
            lines.push(`            const where: any = {};`);
            if (idField) {
              lines.push(`            if (data.${idField.name}) where.${idField.name} = data.${idField.name};`);
            }
            for (const uniqueField of uniqueFields) {
              lines.push(`            if (data.${uniqueField.name}) where.${uniqueField.name} = data.${uniqueField.name};`);
            }
            lines.push(`            connects.push(where);`);
            lines.push(`            break;`);
            lines.push(`          }`);
            lines.push(`          `);
            lines.push(`          case 'delete': {`);
            lines.push(`            const where: any = {};`);
            if (idField) {
              lines.push(`            if (data.${idField.name}) where.${idField.name} = data.${idField.name};`);
            }
            lines.push(`            deletes.push(where);`);
            lines.push(`            break;`);
            lines.push(`          }`);
          }
          
          lines.push(`          `);
          lines.push(`          default: {`);
          lines.push(`            // Default to connectOrCreate`);
          lines.push(`            const where: any = {};`);
          if (idField) {
            lines.push(`            if (data.${idField.name}) where.${idField.name} = data.${idField.name};`);
          }
          for (const uniqueField of uniqueFields) {
            lines.push(`            if (data.${uniqueField.name}) where.${uniqueField.name} = data.${uniqueField.name};`);
          }
          lines.push(`            const createData = { ...data };`);
          if (idField) {
            lines.push(`            delete createData.${idField.name};`);
          }
          for (const uniqueField of uniqueFields) {
            lines.push(`            if (where.${uniqueField.name}) delete createData.${uniqueField.name};`);
          }
          lines.push(`            connectOrCreates.push({`);
          lines.push(`              where,`);
          lines.push(`              create: ${transformCreate}(createData)`);
          lines.push(`            });`);
          lines.push(`          }`);
          lines.push(`        }`);
          lines.push(`      }`);
          lines.push(`      `);
          lines.push(`      result.${field.name} = {};`);
          
          if (operation === "update") {
            lines.push(`      if (hasSet) result.${field.name}.set = connects;`);
            lines.push(`      else {`);
            lines.push(`        if (connects.length) result.${field.name}.connect = connects;`);
            lines.push(`        if (creates.length) result.${field.name}.create = creates;`);
            lines.push(`        if (connectOrCreates.length) result.${field.name}.connectOrCreate = connectOrCreates;`);
            lines.push(`        if (updates.length) result.${field.name}.updateMany = updates;`);
            lines.push(`        if (deletes.length) result.${field.name}.deleteMany = deletes;`);
            lines.push(`      }`);
          } else {
            lines.push(`      if (connects.length) result.${field.name}.connect = connects;`);
            lines.push(`      if (creates.length) result.${field.name}.create = creates;`);
            lines.push(`      if (connectOrCreates.length) result.${field.name}.connectOrCreate = connectOrCreates;`);
          }
          
          lines.push(`    }`);
        } else {
          // Single relation - handle discriminated union
          lines.push(`    const rel = input.${field.name};`);
          lines.push(`    const strategy = rel.flowRelationStrategy;`);
          lines.push(`    const data = { ...rel };`);
          lines.push(`    delete data.flowRelationStrategy;`);
          lines.push(`    `);
          lines.push(`    switch (strategy) {`);
          lines.push(`      case 'connect': {`);
          lines.push(`        const where: any = {};`);
          if (idField) {
            lines.push(`        if (data.${idField.name}) where.${idField.name} = data.${idField.name};`);
          }
          for (const uniqueField of uniqueFields) {
            lines.push(`        if (data.${uniqueField.name}) where.${uniqueField.name} = data.${uniqueField.name};`);
          }
          lines.push(`        result.${field.name} = { connect: where };`);
          lines.push(`        break;`);
          lines.push(`      }`);
          lines.push(`      `);
          lines.push(`      case 'create': {`);
          lines.push(`        result.${field.name} = { create: ${transformCreate}(data) };`);
          lines.push(`        break;`);
          lines.push(`      }`);
          lines.push(`      `);
          lines.push(`      case 'connectOrCreate': {`);
          lines.push(`        const where: any = {};`);
          if (idField) {
            lines.push(`        if (data.${idField.name}) where.${idField.name} = data.${idField.name};`);
          }
          for (const uniqueField of uniqueFields) {
            lines.push(`        if (data.${uniqueField.name}) where.${uniqueField.name} = data.${uniqueField.name};`);
          }
          lines.push(`        const createData = { ...data };`);
          if (idField) {
            lines.push(`        delete createData.${idField.name};`);
          }
          for (const uniqueField of uniqueFields) {
            // Only delete unique fields that are being used for where
            lines.push(`        if (where.${uniqueField.name}) delete createData.${uniqueField.name};`);
          }
          lines.push(`        result.${field.name} = {`);
          lines.push(`          connectOrCreate: {`);
          lines.push(`            where,`);
          lines.push(`            create: ${transformCreate}(createData)`);
          lines.push(`          }`);
          lines.push(`        };`);
          lines.push(`        break;`);
          lines.push(`      }`);
          
          if (operation === "update") {
            lines.push(`      `);
            lines.push(`      case 'update': {`);
            lines.push(`        result.${field.name} = { update: ${transformUpdate}(data) };`);
            lines.push(`        break;`);
            lines.push(`      }`);
            lines.push(`      `);
            lines.push(`      case 'upsert': {`);
            lines.push(`        const where: any = {};`);
            if (idField) {
              lines.push(`        if (data.${idField.name}) where.${idField.name} = data.${idField.name};`);
            }
            for (const uniqueField of uniqueFields) {
              lines.push(`        if (data.${uniqueField.name}) where.${uniqueField.name} = data.${uniqueField.name};`);
            }
            lines.push(`        const upsertData = { ...data };`);
            if (idField) {
              lines.push(`        delete upsertData.${idField.name};`);
            }
            lines.push(`        result.${field.name} = {`);
            lines.push(`          upsert: {`);
            lines.push(`            where,`);
            lines.push(`            create: ${transformCreate}(upsertData),`);
            lines.push(`            update: ${transformUpdate}(upsertData)`);
            lines.push(`          }`);
            lines.push(`        };`);
            lines.push(`        break;`);
            lines.push(`      }`);
            lines.push(`      `);
            lines.push(`      case 'disconnect': {`);
            lines.push(`        result.${field.name} = { disconnect: true };`);
            lines.push(`        break;`);
            lines.push(`      }`);
            lines.push(`      `);
            lines.push(`      case 'delete': {`);
            lines.push(`        result.${field.name} = { delete: true };`);
            lines.push(`        break;`);
            lines.push(`      }`);
          }
          
          lines.push(`      `);
          lines.push(`      default: {`);
          lines.push(`        // Smart default based on available fields`);
          lines.push(`        const where: any = {};`);
          if (idField) {
            lines.push(`        if (data.${idField.name}) where.${idField.name} = data.${idField.name};`);
          }
          for (const uniqueField of uniqueFields) {
            lines.push(`        if (data.${uniqueField.name}) where.${uniqueField.name} = data.${uniqueField.name};`);
          }
          lines.push(`        `);
          
          // Get required fields for create (excluding ID, generated, and fields with defaults)
          const requiredCreateFields = targetModelDef?.fields.filter(f => 
            isScalar(f) && 
            f.isRequired && 
            !f.hasDefaultValue && 
            !f.isId && 
            !f.isGenerated && 
            !f.isUpdatedAt &&
            !f.isReadOnly
          ) || [];
          
          if (requiredCreateFields.length > 0) {
            lines.push(`        // Check if we have all required fields for create`);
            lines.push(`        const hasAllRequiredFields = `);
            for (let i = 0; i < requiredCreateFields.length; i++) {
              const field = requiredCreateFields[i];
              const prefix = i === 0 ? '' : '          && ';
              // Only check data fields, not where fields (where is for finding, not creating)
              lines.push(`${prefix}data.${field.name} != null`);
            }
            lines.push(`;`);
          } else {
            lines.push(`        const hasAllRequiredFields = true; // No required fields`);
          }
          
          lines.push(`        `);
          lines.push(`        if (Object.keys(where).length === 0) {`);
          lines.push(`          // No ID/unique fields - must create`);
          lines.push(`          result.${field.name} = { create: ${transformCreate}(data) };`);
          lines.push(`        } else if (!hasAllRequiredFields) {`);
          lines.push(`          // Has ID/unique but missing required fields - use connect`);
          lines.push(`          result.${field.name} = { connect: where };`);
          lines.push(`        } else {`);
          lines.push(`          // Has ID/unique AND all required fields - use connectOrCreate`);
          lines.push(`          const createData = { ...data };`);
          if (idField) {
            lines.push(`          delete createData.${idField.name};`);
          }
          for (const uniqueField of uniqueFields) {
            lines.push(`          if (where.${uniqueField.name}) delete createData.${uniqueField.name};`);
          }
          lines.push(`          result.${field.name} = {`);
          lines.push(`            connectOrCreate: {`);
          lines.push(`              where,`);
          lines.push(`              create: ${transformCreate}(createData)`);
          lines.push(`            }`);
          lines.push(`          };`);
          lines.push(`        }`);
          lines.push(`      }`);
          lines.push(`    }`);
        }
        
        lines.push(`  }`);
      }
    }
  }
  
  lines.push(``);
  lines.push(`  return result as ${outputType};`);
  lines.push(`}`);
  
  return lines.join("\n");
}