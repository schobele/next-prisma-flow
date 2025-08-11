import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../config";
import { write } from "../fs";
import { header, imp } from "../strings";
import { join } from "node:path";
import { isScalar, isEnum, isRelation, targetModel } from "../../dmmf";
import { DEFAULTS } from "../../config";

export async function emitSelects({
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
  content.push(header("selects.ts"));
  content.push(imp("@prisma/client", ["Prisma"]));
  content.push("");
  
  content.push(generateDeepSelect(model, dmmf, cfg, new Set()));
  content.push("");
  content.push(generateShallowSelect(model, cfg));
  content.push("");
  content.push(generateListSelect(model, dmmf, cfg));
  
  await write(join(modelDir, "selects.ts"), content.join("\n"));
}

function generateDeepSelect(
  model: DMMF.Model, 
  dmmf: DMMF.Document, 
  cfg: FlowConfig,
  ancestors: Set<string>
): string {
  const lines: string[] = [];
  const selectName = `${model.name}DeepSelect`;
  
  lines.push(`export const ${selectName} = {`);
  
  const configuredFields = cfg.perModelSelect[model.name] || [];
  const fieldsToInclude = configuredFields.length > 0 
    ? model.fields.filter(f => configuredFields.includes(f.name))
    : model.fields.filter(f => isScalar(f) || isEnum(f)); // Only scalars by default
  
  for (const field of fieldsToInclude) {
    if (isScalar(field) || isEnum(field)) {
      lines.push(`  ${field.name}: true,`);
    } else if (isRelation(field)) {
      const target = targetModel(field);
      
      if (ancestors.has(target)) {
        lines.push(`  ${field.name}: false,`);
      } else {
        const newAncestors = new Set(ancestors);
        newAncestors.add(model.name);
        
        const limit = cfg.perRelationLimit[`${model.name}.${field.name}`] || DEFAULTS.DEFAULT_LIMIT;
        const orderRaw = cfg.perRelationOrder[`${model.name}.${field.name}`];
        const orderBy = orderRaw ? `, orderBy: ${orderRaw}` : "";
        
        const targetModel = dmmf.datamodel.models.find(m => m.name === target);
        if (targetModel) {
          const nestedSelect = generateDeepSelectInline(targetModel, dmmf, cfg, newAncestors);
          
          if (field.isList) {
            lines.push(`  ${field.name}: {`);
            lines.push(`    take: ${limit}${orderBy},`);
            lines.push(`    select: ${nestedSelect}`);
            lines.push(`  },`);
          } else {
            lines.push(`  ${field.name}: {`);
            lines.push(`    select: ${nestedSelect}`);
            lines.push(`  },`);
          }
        }
      }
    }
  }
  
  lines.push(`} as const satisfies Prisma.${model.name}Select;`);
  return lines.join("\n");
}

function generateDeepSelectInline(
  model: DMMF.Model,
  dmmf: DMMF.Document,
  cfg: FlowConfig,
  ancestors: Set<string>
): string {
  const lines: string[] = [];
  lines.push(`{`);
  
  const configuredFields = cfg.perModelSelect[model.name] || [];
  const fieldsToInclude = configuredFields.length > 0 
    ? model.fields.filter(f => configuredFields.includes(f.name))
    : model.fields.filter(f => isScalar(f) || isEnum(f)); // Only scalars by default
  
  for (const field of fieldsToInclude) {
    if (isScalar(field) || isEnum(field)) {
      lines.push(`      ${field.name}: true,`);
    } else if (isRelation(field)) {
      const target = targetModel(field);
      
      if (ancestors.has(target)) {
        lines.push(`      ${field.name}: false,`);
      } else {
        const newAncestors = new Set(ancestors);
        newAncestors.add(model.name);
        
        const limit = cfg.perRelationLimit[`${model.name}.${field.name}`] || DEFAULTS.DEFAULT_LIMIT;
        const orderRaw = cfg.perRelationOrder[`${model.name}.${field.name}`];
        const orderBy = orderRaw ? `, orderBy: ${orderRaw}` : "";
        
        const targetModel = dmmf.datamodel.models.find(m => m.name === target);
        if (targetModel) {
          const nestedSelect = generateDeepSelectInline(targetModel, dmmf, cfg, newAncestors);
          
          if (field.isList) {
            lines.push(`      ${field.name}: { take: ${limit}${orderBy}, select: ${nestedSelect} },`);
          } else {
            lines.push(`      ${field.name}: { select: ${nestedSelect} },`);
          }
        }
      }
    }
  }
  
  lines.push(`    }`);
  return lines.join("\n");
}

function generateShallowSelect(model: DMMF.Model, cfg: FlowConfig): string {
  const lines: string[] = [];
  const selectName = `${model.name}ShallowSelect`;
  
  lines.push(`export const ${selectName} = {`);
  
  const configuredFields = cfg.perModelSelect[model.name] || [];
  const fieldsToInclude = configuredFields.length > 0 
    ? model.fields.filter(f => configuredFields.includes(f.name))
    : model.fields;
  
  for (const field of fieldsToInclude) {
    if (isScalar(field) || isEnum(field)) {
      lines.push(`  ${field.name}: true,`);
    }
  }
  
  lines.push(`} as const satisfies Prisma.${model.name}Select;`);
  return lines.join("\n");
}

function generateListSelect(model: DMMF.Model, dmmf: DMMF.Document, cfg: FlowConfig): string {
  const lines: string[] = [];
  const selectName = `${model.name}ListSelect`;
  
  lines.push(`export const ${selectName} = {`);
  
  const configuredFields = cfg.perModelSelect[model.name] || [];
  const fieldsToInclude = configuredFields.length > 0 
    ? model.fields.filter(f => configuredFields.includes(f.name))
    : model.fields.filter(f => isScalar(f) || isEnum(f)); // Only scalars by default
  
  for (const field of fieldsToInclude) {
    if (isScalar(field) || isEnum(field)) {
      lines.push(`  ${field.name}: true,`);
    } else if (isRelation(field)) {
      const target = targetModel(field);
      const targetModelDef = dmmf.datamodel.models.find(m => m.name === target);
      
      if (targetModelDef) {
        if (field.isList) {
          // For list relations, include with a limit
          const limit = cfg.perRelationLimit[`${model.name}.${field.name}`] || 10;
          lines.push(`  ${field.name}: {`);
          lines.push(`    take: ${limit},`);
          lines.push(`    select: {`);
          
          // Include scalar fields from the related model
          for (const tf of targetModelDef.fields) {
            if (isScalar(tf) || isEnum(tf)) {
              lines.push(`      ${tf.name}: true,`);
            } else if (isRelation(tf) && !tf.isList) {
              // For comments, include author info
              if (field.name === "comments" && tf.name === "author") {
                const authorModel = dmmf.datamodel.models.find(m => m.name === targetModel(tf));
                if (authorModel) {
                  lines.push(`      ${tf.name}: {`);
                  lines.push(`        select: {`);
                  for (const af of authorModel.fields) {
                    if (isScalar(af) || isEnum(af)) {
                      lines.push(`          ${af.name}: true,`);
                    }
                  }
                  lines.push(`        }`);
                  lines.push(`      },`);
                }
              }
            }
          }
          
          lines.push(`    }`);
          lines.push(`  },`);
        } else {
          // For single relations, include scalar fields
          lines.push(`  ${field.name}: {`);
          lines.push(`    select: {`);
          
          // Include scalar fields from the related model
          for (const tf of targetModelDef.fields) {
            if (isScalar(tf) || isEnum(tf)) {
              lines.push(`      ${tf.name}: true,`);
            }
          }
          
          lines.push(`    }`);
          lines.push(`  },`);
        }
      }
    }
  }
  
  lines.push(`} as const satisfies Prisma.${model.name}Select;`);
  return lines.join("\n");
}