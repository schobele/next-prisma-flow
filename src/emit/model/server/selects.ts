import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../../config";
import { write } from "../../fs";
import { header, imp } from "../../strings";
import { isRelation, targetModel } from "../../../dmmf";

export async function emitServerSelects({
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
  const content: string[] = [];
  content.push(header("server/selects.ts"));
  content.push(`import "server-only";`);
  content.push(imp("../../prisma", ["Prisma"]));
  content.push(``);

  // Generate all selects for this model
  const selects = generateModelSelects(model, cfg, dmmf);
  
  // Add scalar selects
  if (selects.scalarSelects.length > 0) {
    content.push(`// Scalar selects`);
    content.push(...selects.scalarSelects);
    content.push(``);
  }
  
  // Add nested relation selects
  if (selects.nestedSelects.length > 0) {
    content.push(`// Nested relation selects`);
    content.push(...selects.nestedSelects);
    content.push(``);
  }
  
  // Add main select
  content.push(`// Main select`);
  content.push(selects.mainSelect);

  const serverDir = join(modelDir, "server");
  await write(join(serverDir, "selects.ts"), content.join("\n"));
}

interface GeneratedSelects {
  scalarSelects: string[];
  nestedSelects: string[];
  mainSelect: string;
}

function generateModelSelects(
  model: DMMF.Model,
  cfg: FlowConfig,
  dmmf: DMMF.Document
): GeneratedSelects {
  const result: GeneratedSelects = {
    scalarSelects: [],
    nestedSelects: [],
    mainSelect: ""
  };

  const selectConfig = cfg.perModelSelect[model.name];
  if (!selectConfig) {
    // No config, just generate scalar select
    result.mainSelect = generateScalarSelectExport(model, model.name);
    return result;
  }

  // Phase 1: Generate scalar selects for main model and all transitively referenced models
  const scalarModels = new Map<string, DMMF.Model>();
  
  // Add main model
  scalarModels.set(model.name, model);
  
  // Recursively collect all models referenced through select configs
  collectAllReferencedModels(model, cfg, dmmf, [model.name], scalarModels);
  
  // Generate scalar selects
  for (const [modelName, modelDef] of scalarModels) {
    const scalarName = `${model.name}${modelName === model.name ? '' : modelName}ScalarSelect`;
    result.scalarSelects.push(generateScalarSelect(scalarName, modelDef));
  }

  // Phase 2: Generate nested relation selects
  const allNestedSelects: string[] = [];
  
  for (const fieldName of selectConfig) {
    const field = model.fields.find(f => f.name === fieldName);
    if (!field || !isRelation(field)) continue;

    generateNestedRelationSelects(
      model.name,
      field,
      [model.name],
      cfg,
      dmmf,
      allNestedSelects,
      model.name // Pass the root model name to know which scalar selects to use
    );
  }
  
  result.nestedSelects = allNestedSelects;

  // Phase 3: Generate main composite select
  result.mainSelect = generateMainCompositeSelect(model, cfg, dmmf);

  return result;
}

function collectAllReferencedModels(
  model: DMMF.Model,
  cfg: FlowConfig,
  dmmf: DMMF.Document,
  visitedPath: string[],
  collected: Map<string, DMMF.Model>
) {
  const selectConfig = cfg.perModelSelect[model.name];
  if (!selectConfig) return;

  for (const fieldName of selectConfig) {
    const field = model.fields.find(f => f.name === fieldName);
    if (!field || !isRelation(field)) continue;

    const targetModelName = targetModel(field);
    const targetModelDef = dmmf.datamodel.models.find(m => m.name === targetModelName);
    if (!targetModelDef) continue;

    // Add this model to collected if not already there
    if (!collected.has(targetModelName)) {
      collected.set(targetModelName, targetModelDef);
    }

    // Recursively collect from target model if not circular
    if (!visitedPath.includes(targetModelName)) {
      collectAllReferencedModels(
        targetModelDef,
        cfg,
        dmmf,
        [...visitedPath, targetModelName],
        collected
      );
    }
  }
}

function generateScalarSelect(name: string, model: DMMF.Model): string {
  const fields: string[] = [];
  
  for (const field of model.fields) {
    if (!isRelation(field)) {
      fields.push(`  ${field.name}: true,`);
    }
  }
  
  return `export const ${name} = {
${fields.join('\n')}
} as Prisma.${model.name}Select;`;
}

function generateScalarSelectExport(model: DMMF.Model, namePrefix: string): string {
  const fields: string[] = [];
  
  for (const field of model.fields) {
    if (!isRelation(field)) {
      fields.push(`  ${field.name}: true,`);
    }
  }
  
  return `export const ${namePrefix}Select = {
${fields.join('\n')}
} as Prisma.${model.name}Select;`;
}

function generateNestedRelationSelects(
  parentPrefix: string,
  field: DMMF.Field,
  modelPath: string[],
  cfg: FlowConfig,
  dmmf: DMMF.Document,
  allSelects: string[],
  rootModelName: string
): void {
  const targetModelName = targetModel(field);
  const targetModelDef = dmmf.datamodel.models.find(m => m.name === targetModelName);
  
  if (!targetModelDef) return;

  const selectName = `${parentPrefix}${field.name.charAt(0).toUpperCase() + field.name.slice(1)}Select`;
  const targetConfig = cfg.perModelSelect[targetModelName];
  
  if (!targetConfig) {
    // No config for target, just reference the scalar select
    const scalarName = `${rootModelName}${targetModelName}ScalarSelect`;
    allSelects.push(`export const ${selectName} = ${scalarName};`);
    return;
  }

  // First generate any deeper nested selects
  const fieldPrefix = parentPrefix + field.name.charAt(0).toUpperCase() + field.name.slice(1);
  
  for (const targetFieldName of targetConfig) {
    const targetField = targetModelDef.fields.find(f => f.name === targetFieldName);
    if (!targetField || !isRelation(targetField)) continue;

    const nestedTargetName = targetModel(targetField);
    
    // Check if this would go back up the tree
    if (!modelPath.includes(nestedTargetName)) {
      // Generate deeper nested selects first
      const deeperPath = [...modelPath, targetModelName];
      generateNestedRelationSelects(
        fieldPrefix,
        targetField,
        deeperPath,
        cfg,
        dmmf,
        allSelects,
        rootModelName
      );
    }
  }

  // Now generate this select
  // Use the scalar select for this model type from the root model's scalar selects
  const scalarSelectName = rootModelName === targetModelName 
    ? `${rootModelName}ScalarSelect`
    : `${rootModelName}${targetModelName}ScalarSelect`;
  const nestedFields: string[] = [`  ...${scalarSelectName},`];
  
  for (const targetFieldName of targetConfig) {
    const targetField = targetModelDef.fields.find(f => f.name === targetFieldName);
    if (!targetField || !isRelation(targetField)) continue;

    const nestedTargetName = targetModel(targetField);
    
    // Check if this would go back up the tree
    if (modelPath.includes(nestedTargetName)) {
      nestedFields.push(`  ${targetFieldName}: false,`);
    } else {
      const nestedSelectName = `${fieldPrefix}${targetFieldName.charAt(0).toUpperCase() + targetFieldName.slice(1)}Select`;
      
      if (targetField.isList) {
        // For list relations, include take/orderBy
        const limit = cfg.perRelationLimit[`${targetModelDef.name}.${targetFieldName}`] || 50;
        const orderBy = cfg.perRelationOrder[`${targetModelDef.name}.${targetFieldName}`];
        
        nestedFields.push(`  ${targetFieldName}: {`);
        nestedFields.push(`    select: ${nestedSelectName},`);
        nestedFields.push(`    take: ${limit},`);
        if (orderBy) {
          nestedFields.push(`    orderBy: ${orderBy},`);
        }
        nestedFields.push(`  },`);
      } else {
        // For single relations, just wrap with select
        nestedFields.push(`  ${targetFieldName}: { select: ${nestedSelectName} },`);
      }
    }
  }

  // Add this select
  allSelects.push(`export const ${selectName} = {
${nestedFields.join('\n')}
} as Prisma.${targetModelName}Select;`);
}

function generateMainCompositeSelect(
  model: DMMF.Model,
  cfg: FlowConfig,
  dmmf: DMMF.Document
): string {
  const selectConfig = cfg.perModelSelect[model.name];
  
  if (!selectConfig) {
    return `export const ${model.name}Select = ${model.name}ScalarSelect;`;
  }

  const fields: string[] = [`  ...${model.name}ScalarSelect,`];
  
  for (const fieldName of selectConfig) {
    const field = model.fields.find(f => f.name === fieldName);
    if (!field || !isRelation(field)) continue;

    const selectName = `${model.name}${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}Select`;
    
    if (field.isList) {
      const limit = cfg.perRelationLimit[`${model.name}.${fieldName}`] || 50;
      const orderBy = cfg.perRelationOrder[`${model.name}.${fieldName}`];
      
      fields.push(`  ${fieldName}: {`);
      fields.push(`    take: ${limit},`);
      if (orderBy) {
        fields.push(`    orderBy: ${orderBy},`);
      }
      fields.push(`    select: ${selectName},`);
      fields.push(`  },`);
    } else {
      fields.push(`  ${fieldName}: {`);
      fields.push(`    select: ${selectName},`);
      fields.push(`  },`);
    }
  }

  return `export const ${model.name}Select = {
${fields.join('\n')}
} as Prisma.${model.name}Select;`;
}