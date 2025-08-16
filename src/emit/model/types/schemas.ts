import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../../config";
import { write } from "../../fs";
import { header, imp, impType } from "../../strings";
import { isEnum, isRelation, isScalar, targetModel } from "../../../dmmf";
import {
  SchemaContext,
  pathKey,
  wouldBeCircular,
  getSelectConfig,
  generateScalarZod,
  getBaseZodType,
  relationSchemaName,
  getFieldsForSchema,
  isManyToMany,
  getRelationLimit,
  getRelationOrder,
  generateWhereUniqueFields,
  generateFilterOps
} from "./schema-builder";

export async function emitTypesSchemas({
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
  const ctx: SchemaContext = {
    dmmf,
    cfg,
    visitedPath: [],
    schemaCache: new Map()
  };

  const content: string[] = [];
  content.push(header("types/schemas.ts"));
  content.push(imp("zod", ["z"]));
  content.push("");

  // Track all generated schemas to avoid duplicates
  const generatedSchemas = new Set<string>();

  // 1. Generate base scalar schema (only scalar fields)
  content.push(`// Scalar fields only`);
  const scalarSchema = generateScalarSchema(model);
  content.push(scalarSchema);
  content.push("");

  // 2. Generate relation schemas first (defined upfront)
  content.push(`// Relation schemas`);
  const relationSchemas = generateAllRelationSchemas(model, ctx);
  content.push(...relationSchemas);
  if (relationSchemas.length > 0) content.push("");

  // 3. Generate main schema with relations
  content.push(`// Main schema with relations`);
  const mainSchema = generateMainSchemaWithRelations(model, ctx);
  content.push(mainSchema);
  content.push("");

  // 4. Generate input schemas for Prisma operations
  content.push(`// Input schemas for create operations`);
  const createSchemas = generateCreateSchemas(model, ctx, generatedSchemas);
  content.push(...createSchemas);
  content.push("");

  content.push(`// Input schemas for update operations`);
  const updateSchemas = generateUpdateSchemas(model, ctx, generatedSchemas);
  content.push(...updateSchemas);
  content.push("");

  // 5. Generate filter/where schemas
  content.push(`// Filter and where schemas`);
  const filterSchemas = generateFilterSchemas(model, ctx);
  content.push(...filterSchemas);
  content.push("");

  // 6. Type exports
  content.push(`// Type exports`);
  content.push(`export type Flow${model.name} = z.infer<typeof ${model.name}Schema>;`);
  content.push(`export type Flow${model.name}Create = z.infer<typeof ${model.name}CreateSchema>;`);
  content.push(`export type Flow${model.name}Update = z.infer<typeof ${model.name}UpdateSchema>;`);
  content.push(`export type Flow${model.name}Filter = z.infer<typeof ${model.name}FilterSchema>;`);
  content.push(`export type Flow${model.name}Where = z.infer<typeof ${model.name}WhereInputSchema>;`);
  content.push(`export type Flow${model.name}WhereUnique = z.infer<typeof ${model.name}WhereUniqueInputSchema>;`);

  const typesDir = join(modelDir, "types");
  await write(join(typesDir, "schemas.ts"), content.join("\n"));
}

function generateScalarSchema(model: DMMF.Model): string {
  const lines: string[] = [];
  lines.push(`export const ${model.name}ScalarSchema = z.object({`);
  
  for (const field of model.fields) {
    if (isScalar(field) || isEnum(field)) {
      lines.push(`  ${field.name}: ${generateScalarZod(field)},`);
    }
  }
  
  lines.push(`});`);
  return lines.join("\n");
}

function generateAllRelationSchemas(model: DMMF.Model, ctx: SchemaContext): string[] {
  const allSchemas: string[] = [];
  const selectConfig = ctx.cfg.perModelSelect[model.name];
  
  if (!selectConfig) return allSchemas;
  
  // First collect all nested schemas that need to be defined
  const nestedSchemas: { name: string; definition: string[] }[] = [];
  
  // Generate a schema for each relation field
  for (const fieldName of selectConfig) {
    const field = model.fields.find(f => f.name === fieldName);
    if (!field || !isRelation(field)) continue;
    
    const targetModelName = targetModel(field);
    const targetModelDef = ctx.dmmf.datamodel.models.find(m => m.name === targetModelName);
    if (!targetModelDef) continue;
    
    // Get fields for this relation based on config
    // First check for a specific relation config like PostAuthorSelect
    const specificRelationKey = `${model.name}${field.name.charAt(0).toUpperCase() + field.name.slice(1)}`;
    const selectConfigForRelation = ctx.cfg.perModelSelect[specificRelationKey] 
      || ctx.cfg.perModelSelect[targetModelName];
    
    const fields = selectConfigForRelation
      ? targetModelDef.fields.filter(f => selectConfigForRelation.includes(f.name))
      : targetModelDef.fields.filter(f => isScalar(f) || isEnum(f));
    
    // Check for nested relations and create their schemas first
    for (const relField of fields) {
      if (isRelation(relField)) {
        const nestedTargetName = targetModel(relField);
        // Skip if circular reference back to parent
        if (nestedTargetName === model.name) continue;
        
        const nestedTargetDef = ctx.dmmf.datamodel.models.find(m => m.name === nestedTargetName);
        if (nestedTargetDef) {
          const nestedSchemaName = `${model.name}${field.name.charAt(0).toUpperCase() + field.name.slice(1)}${relField.name.charAt(0).toUpperCase() + relField.name.slice(1)}Schema`;
          
          const nestedLines: string[] = [];
          nestedLines.push(`export const ${nestedSchemaName} = z.object({`);
          
          const nestedSelectConfig = ctx.cfg.perModelSelect[nestedTargetName];
          const nestedFields = nestedSelectConfig
            ? nestedTargetDef.fields.filter(f => nestedSelectConfig.includes(f.name) && (isScalar(f) || isEnum(f)))
            : nestedTargetDef.fields.filter(f => isScalar(f) || isEnum(f));
            
          for (const nestedField of nestedFields) {
            nestedLines.push(`  ${nestedField.name}: ${generateScalarZod(nestedField)},`);
          }
          
          nestedLines.push(`});`);
          nestedSchemas.push({ name: nestedSchemaName, definition: nestedLines });
        }
      }
    }
  }
  
  // Add nested schemas first
  for (const nested of nestedSchemas) {
    allSchemas.push(...nested.definition);
    allSchemas.push(``);
  }
  
  // Now generate the main relation schemas
  for (const fieldName of selectConfig) {
    const field = model.fields.find(f => f.name === fieldName);
    if (!field || !isRelation(field)) continue;
    
    const targetModelName = targetModel(field);
    const targetModelDef = ctx.dmmf.datamodel.models.find(m => m.name === targetModelName);
    if (!targetModelDef) continue;
    
    const schemaName = `${model.name}${field.name.charAt(0).toUpperCase() + field.name.slice(1)}Schema`;
    
    allSchemas.push(`export const ${schemaName} = z.object({`);
    
    // Get fields for this relation based on config
    // Use the target model's own select config for determining which fields to include
    const selectConfigForRelation = ctx.cfg.perModelSelect[targetModelName];
    
    const fields = selectConfigForRelation
      ? targetModelDef.fields.filter(f => selectConfigForRelation.includes(f.name))
      : targetModelDef.fields.filter(f => isScalar(f) || isEnum(f));
    
    // Add scalar fields
    for (const relField of fields) {
      if (isScalar(relField) || isEnum(relField)) {
        allSchemas.push(`  ${relField.name}: ${generateScalarZod(relField)},`);
      }
    }
    
    // For nested relations, reference the schemas we defined above
    for (const relField of fields) {
      if (isRelation(relField)) {
        const nestedTargetName = targetModel(relField);
        // Skip if circular reference back to parent
        if (nestedTargetName === model.name) continue;
        
        const nestedSchemaName = `${model.name}${field.name.charAt(0).toUpperCase() + field.name.slice(1)}${relField.name.charAt(0).toUpperCase() + relField.name.slice(1)}Schema`;
        
        // Reference it in the parent schema
        if (relField.isList) {
          allSchemas.push(`  ${relField.name}: z.array(${nestedSchemaName}).optional(),`);
        } else {
          allSchemas.push(`  ${relField.name}: ${nestedSchemaName}.optional(),`);
        }
      }
    }
    
    allSchemas.push(`});`);
    allSchemas.push(``);
  }
  
  return allSchemas;
}

function generateMainSchemaWithRelations(model: DMMF.Model, ctx: SchemaContext): string {
  const lines: string[] = [];
  const selectConfig = ctx.cfg.perModelSelect[model.name];
  
  if (!selectConfig || !selectConfig.some(f => {
    const field = model.fields.find(mf => mf.name === f);
    return field && isRelation(field);
  })) {
    // No relations configured, just use scalar schema
    lines.push(`export const ${model.name}Schema = ${model.name}ScalarSchema;`);
    return lines.join("\n");
  }
  
  lines.push(`export const ${model.name}Schema = ${model.name}ScalarSchema.extend({`);
  
  // Add configured relations
  for (const fieldName of selectConfig) {
    const field = model.fields.find(f => f.name === fieldName);
    if (!field || !isRelation(field)) continue;
    
    const schemaName = `${model.name}${field.name.charAt(0).toUpperCase() + field.name.slice(1)}Schema`;
    
    if (field.isList) {
      lines.push(`  ${field.name}: z.array(${schemaName}).optional(),`);
    } else {
      lines.push(`  ${field.name}: ${schemaName}.optional(),`);
    }
  }
  
  lines.push(`});`);
  
  return lines.join("\n");
}

function generateRelationSchemas(
  model: DMMF.Model,
  ctx: SchemaContext,
  generatedSchemas: Set<string>
): string[] {
  const lines: string[] = [];
  const selectConfig = ctx.cfg.perModelSelect[model.name];
  
  if (!selectConfig) return lines;
  
  // Generate schemas for each relation in the select config
  for (const fieldName of selectConfig) {
    const field = model.fields.find(f => f.name === fieldName);
    if (!field || !isRelation(field)) continue;
    
    const schemaName = `${model.name}${field.name.charAt(0).toUpperCase() + field.name.slice(1)}Schema`;
    if (generatedSchemas.has(schemaName)) continue;
    generatedSchemas.add(schemaName);
    
    const relationSchema = generateNestedRelationSchema(
      model.name,
      field,
      ctx,
      [field.name],
      generatedSchemas
    );
    
    if (relationSchema) {
      lines.push(...relationSchema);
      lines.push("");
    }
  }
  
  return lines;
}

function generateNestedRelationSchema(
  parentModelName: string,
  field: DMMF.Field,
  ctx: SchemaContext,
  relationPath: string[],
  generatedSchemas: Set<string>
): string[] | null {
  const targetModelName = targetModel(field);
  const targetModelDef = ctx.dmmf.datamodel.models.find(m => m.name === targetModelName);
  
  if (!targetModelDef) return null;
  
  // Check for circular reference - use the target model name in the path
  const pathKeyStr = `${parentModelName}.${relationPath.join(".")}.${targetModelName}`;
  if (ctx.visitedPath.includes(pathKeyStr)) {
    return null;
  }
  
  // Create new context with updated path
  const newCtx: SchemaContext = {
    ...ctx,
    visitedPath: [...ctx.visitedPath, pathKeyStr]
  };
  
  const schemaName = relationSchemaName(parentModelName, relationPath);
  
  // Early exit if already generated
  if (generatedSchemas.has(schemaName)) {
    return null;
  }
  generatedSchemas.add(schemaName);
  
  const lines: string[] = [];
  
  // Get fields for this relation based on config - look for specific relation config first
  const relationConfigKey = relationPath.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join("");
  const selectConfig = getSelectConfig(ctx.cfg, parentModelName, relationConfigKey) 
    || ctx.cfg.perModelSelect[targetModelName];
    
  const fields = selectConfig 
    ? targetModelDef.fields.filter(f => selectConfig.includes(f.name))
    : targetModelDef.fields.filter(f => !isRelation(f)); // Default to scalar fields only
  
  lines.push(`const ${schemaName} = z.object({`);
  
  // Add scalar fields
  for (const relField of fields) {
    if (isScalar(relField) || isEnum(relField)) {
      lines.push(`  ${relField.name}: ${generateScalarZod(relField)},`);
    }
  }
  
  // Add nested relations if configured
  for (const relField of fields) {
    if (isRelation(relField)) {
      const nestedTargetName = targetModel(relField);
      
      // Skip if it points back to parent (circular) or if we've seen this model in our path
      if (nestedTargetName === parentModelName || ctx.visitedPath.some(p => p.includes(nestedTargetName))) {
        continue;
      }
      
      // Only generate one level deep for now to avoid complexity
      // The nested schema will only contain scalar fields
      const nestedPath = [...relationPath, relField.name];
      const nestedSchemaName = relationSchemaName(parentModelName, nestedPath);
      
      // Generate the nested schema if not already done
      if (!generatedSchemas.has(nestedSchemaName)) {
        const nestedTargetDef = ctx.dmmf.datamodel.models.find(m => m.name === nestedTargetName);
        if (nestedTargetDef) {
          // Generate a simple scalar-only schema for nested relations
          const nestedLines: string[] = [];
          nestedLines.push(`const ${nestedSchemaName} = z.object({`);
          
          // Get scalar fields for the nested model
          const nestedSelectConfig = ctx.cfg.perModelSelect[nestedTargetName];
          const nestedFields = nestedSelectConfig
            ? nestedTargetDef.fields.filter(f => nestedSelectConfig.includes(f.name) && (isScalar(f) || isEnum(f)))
            : nestedTargetDef.fields.filter(f => isScalar(f) || isEnum(f));
          
          for (const nestedField of nestedFields) {
            nestedLines.push(`  ${nestedField.name}: ${generateScalarZod(nestedField)},`);
          }
          
          nestedLines.push(`});`);
          
          // Add nested schema definition before current schema
          lines.unshift(...nestedLines, "");
          generatedSchemas.add(nestedSchemaName);
        }
      }
      
      // Reference the nested schema
      if (relField.isList) {
        lines.push(`  ${relField.name}: z.array(z.lazy(() => ${nestedSchemaName})).optional(),`);
      } else {
        lines.push(`  ${relField.name}: z.lazy(() => ${nestedSchemaName}).optional(),`);
      }
    }
  }
  
  lines.push(`});`);
  
  return lines;
}

function generateMainSchema(model: DMMF.Model, ctx: SchemaContext, generatedSchemas: Set<string>): string {
  const lines: string[] = [];
  const selectConfig = ctx.cfg.perModelSelect[model.name];
  
  if (!selectConfig) {
    // No select config, just use scalar schema
    lines.push(`export const ${model.name}Schema = ${model.name}ScalarSchema;`);
    return lines.join("\n");
  }
  
  // First ensure all relation schemas are generated
  const relationLines: string[] = [];
  for (const fieldName of selectConfig) {
    const field = model.fields.find(f => f.name === fieldName);
    if (!field || !isRelation(field)) continue;
    
    const schemaName = `${model.name}${field.name.charAt(0).toUpperCase() + field.name.slice(1)}Schema`;
    
    // Generate the relation schema if not already done
    if (!generatedSchemas.has(schemaName)) {
      generatedSchemas.add(schemaName);
      const targetModelName = targetModel(field);
      const targetModelDef = ctx.dmmf.datamodel.models.find(m => m.name === targetModelName);
      
      if (targetModelDef) {
        relationLines.push(`const ${schemaName} = z.object({`);
        
        // Get fields for this relation based on config
        const relationConfigKey = field.name.charAt(0).toUpperCase() + field.name.slice(1);
        const selectConfigForRelation = getSelectConfig(ctx.cfg, model.name, relationConfigKey) 
          || ctx.cfg.perModelSelect[targetModelName];
        
        const fields = selectConfigForRelation
          ? targetModelDef.fields.filter(f => selectConfigForRelation.includes(f.name))
          : targetModelDef.fields.filter(f => isScalar(f) || isEnum(f));
        
        // Add scalar fields
        for (const relField of fields) {
          if (isScalar(relField) || isEnum(relField)) {
            relationLines.push(`  ${relField.name}: ${generateScalarZod(relField)},`);
          }
        }
        
        // Add nested relations if configured (only one level deep)
        for (const relField of fields) {
          if (isRelation(relField)) {
            const nestedTargetName = targetModel(relField);
            // Skip if circular reference
            if (nestedTargetName === model.name) continue;
            
            // For nested relations, just reference false or a simple schema
            relationLines.push(`  ${relField.name}: z.boolean().optional(), // Simplified to avoid deep nesting`);
          }
        }
        
        relationLines.push(`});`);
        relationLines.push(``);
      }
    }
  }
  
  // Add relation schemas before main schema
  if (relationLines.length > 0) {
    lines.push(...relationLines);
  }
  
  lines.push(`export const ${model.name}Schema = ${model.name}ScalarSchema.extend({`);
  
  // Add configured relations
  for (const fieldName of selectConfig) {
    const field = model.fields.find(f => f.name === fieldName);
    if (!field || !isRelation(field)) continue;
    
    const schemaName = `${model.name}${field.name.charAt(0).toUpperCase() + field.name.slice(1)}Schema`;
    
    if (field.isList) {
      lines.push(`  ${field.name}: z.array(z.lazy(() => ${schemaName})).optional(),`);
    } else {
      lines.push(`  ${field.name}: z.lazy(() => ${schemaName}).optional(),`);
    }
  }
  
  lines.push(`});`);
  
  return lines.join("\n");
}

function generateCreateSchemas(
  model: DMMF.Model,
  ctx: SchemaContext,
  generatedSchemas: Set<string>
): string[] {
  const lines: string[] = [];
  
  // Generate nested create schemas for relations first
  const nestedCreateSchemas = generateNestedCreateSchemas(model, ctx, generatedSchemas);
  if (nestedCreateSchemas.length > 0) {
    lines.push(...nestedCreateSchemas);
    lines.push("");
  }
  
  // Main create input schema
  lines.push(`export const ${model.name}CreateSchema = z.object({`);
  
  const selectConfig = ctx.cfg.perModelSelect[model.name];
  const fields = selectConfig 
    ? model.fields.filter(f => selectConfig.includes(f.name))
    : model.fields;
  
  // Add scalar fields
  for (const field of fields) {
    if (isScalar(field) || isEnum(field)) {
      // Skip auto-generated fields
      if (field.isId || field.isGenerated || field.isUpdatedAt) {
        if (!field.hasDefaultValue) continue;
        lines.push(`  ${field.name}: ${generateScalarZod(field, true, ctx.cfg.tenantField)},`);
      } else {
        lines.push(`  ${field.name}: ${generateScalarZod(field, true, ctx.cfg.tenantField)},`);
      }
    }
  }
  
  // Add foreign key fields for relations (even if not in selectConfig)
  // This allows passing scalar IDs instead of relation objects
  for (const field of model.fields) {
    if (isRelation(field) && !field.isList && field.relationFromFields?.length) {
      const foreignKeyField = field.relationFromFields[0];
      const scalarField = model.fields.find(f => f.name === foreignKeyField);
      
      // Only add if not already added above
      if (scalarField && !fields.includes(scalarField)) {
        lines.push(`  ${foreignKeyField}: ${generateScalarZod(scalarField, true, ctx.cfg.tenantField)},`);
      }
    }
  }
  
  // Add relation fields
  for (const field of fields) {
    if (isRelation(field)) {
      lines.push(`  ${field.name}: z.object({`);
      
      const nestedSchemaName = `${model.name}Create${field.name.charAt(0).toUpperCase() + field.name.slice(1)}InputSchema`;
      
      if (field.isList) {
        // List relations support multiple operations
        lines.push(`    create: z.union([`);
        lines.push(`      ${nestedSchemaName},`);
        lines.push(`      z.array(${nestedSchemaName})`);
        lines.push(`    ]).optional(),`);
        
        if (!isManyToMany(field)) {
          lines.push(`    createMany: z.object({`);
          lines.push(`      data: z.union([${nestedSchemaName}, z.array(${nestedSchemaName})]),`);
          lines.push(`      skipDuplicates: z.boolean().optional()`);
          lines.push(`    }).optional(),`);
        }
        
        lines.push(`    connect: z.union([`);
        lines.push(`      z.object({ id: z.string() }),`);
        lines.push(`      z.array(z.object({ id: z.string() }))`);
        lines.push(`    ]).optional(),`);
        
        lines.push(`    connectOrCreate: z.union([`);
        lines.push(`      z.object({`);
        lines.push(`        where: z.object({ id: z.string() }),`);
        lines.push(`        create: ${nestedSchemaName}`);
        lines.push(`      }),`);
        lines.push(`      z.array(z.object({`);
        lines.push(`        where: z.object({ id: z.string() }),`);
        lines.push(`        create: ${nestedSchemaName}`);
        lines.push(`      }))`);
        lines.push(`    ]).optional(),`);
      } else {
        // Single relations
        lines.push(`    create: ${nestedSchemaName}.optional(),`);
        lines.push(`    connect: z.object({ id: z.string() }).optional(),`);
        lines.push(`    connectOrCreate: z.object({`);
        lines.push(`      where: z.object({ id: z.string() }),`);
        lines.push(`      create: ${nestedSchemaName}`);
        lines.push(`    }).optional(),`);
      }
      
      lines.push(`  }).optional(),`);
    }
  }
  
  lines.push(`});`);
  
  // CreateMany input schema (without relations)
  lines.push(``);
  lines.push(`export const ${model.name}CreateManyInputSchema = z.object({`);
  
  for (const field of fields) {
    if (isScalar(field) || isEnum(field)) {
      if (field.isId || field.isGenerated || field.isUpdatedAt) {
        if (!field.hasDefaultValue) continue;
        lines.push(`  ${field.name}: ${generateScalarZod(field, true, ctx.cfg.tenantField)},`);
      } else {
        lines.push(`  ${field.name}: ${generateScalarZod(field, true, ctx.cfg.tenantField)},`);
      }
    }
  }
  
  lines.push(`});`);
  
  return lines;
}

function generateNestedCreateSchemas(
  model: DMMF.Model,
  ctx: SchemaContext,
  generatedSchemas: Set<string>
): string[] {
  const lines: string[] = [];
  const selectConfig = ctx.cfg.perModelSelect[model.name];
  
  if (!selectConfig) return lines;
  
  for (const fieldName of selectConfig) {
    const field = model.fields.find(f => f.name === fieldName);
    if (!field || !isRelation(field)) continue;
    
    const targetModelName = targetModel(field);
    const targetModelDef = ctx.dmmf.datamodel.models.find(m => m.name === targetModelName);
    if (!targetModelDef) continue;
    
    const schemaName = `${model.name}Create${field.name.charAt(0).toUpperCase() + field.name.slice(1)}InputSchema`;
    
    if (generatedSchemas.has(schemaName)) continue;
    generatedSchemas.add(schemaName);
    
    lines.push(`const ${schemaName} = z.object({`);
    
    // Get fields for the target model based on its select config
    const targetSelectConfig = ctx.cfg.perModelSelect[targetModelName];
    const targetFields = targetSelectConfig
      ? targetModelDef.fields.filter(f => targetSelectConfig.includes(f.name))
      : targetModelDef.fields;
    
    // Add all scalar fields (for better DX, include all fields and let Prisma validate)
    for (const targetField of targetFields) {
      if (isScalar(targetField) || isEnum(targetField)) {
        if (targetField.isId || targetField.isGenerated || targetField.isUpdatedAt) {
          if (!targetField.hasDefaultValue) continue;
          lines.push(`  ${targetField.name}: ${generateScalarZod(targetField, true, ctx.cfg.tenantField)},`);
        } else {
          lines.push(`  ${targetField.name}: ${generateScalarZod(targetField, true, ctx.cfg.tenantField)},`);
        }
      }
    }
    
    // For nested relations, only allow connect (not create) to avoid deep nesting
    // This prevents infinite recursion while still providing good DX
    for (const targetField of targetFields) {
      if (isRelation(targetField)) {
        lines.push(`  ${targetField.name}: z.object({`);
        
        if (targetField.isList) {
          lines.push(`    connect: z.union([`);
          lines.push(`      z.object({ id: z.string() }),`);
          lines.push(`      z.array(z.object({ id: z.string() }))`);
          lines.push(`    ]).optional()`);
        } else {
          lines.push(`    connect: z.object({ id: z.string() }).optional()`);
        }
        
        lines.push(`  }).optional(),`);
      }
    }
    
    lines.push(`});`);
    lines.push(``);
  }
  
  return lines;
}

function generateUpdateSchemas(
  model: DMMF.Model,
  ctx: SchemaContext,
  generatedSchemas: Set<string>
): string[] {
  const lines: string[] = [];
  
  // Generate nested schemas for relations (both create and update variants)
  // We need create schemas for create operations within updates
  const nestedCreateSchemas = generateNestedCreateSchemas(model, ctx, generatedSchemas);
  if (nestedCreateSchemas.length > 0) {
    lines.push(...nestedCreateSchemas);
    lines.push("");
  }
  
  const nestedUpdateSchemas = generateNestedUpdateSchemas(model, ctx, generatedSchemas);
  if (nestedUpdateSchemas.length > 0) {
    lines.push(...nestedUpdateSchemas);
    lines.push("");
  }
  
  // Main update input schema
  lines.push(`export const ${model.name}UpdateSchema = z.object({`);
  
  const selectConfig = ctx.cfg.perModelSelect[model.name];
  const fields = selectConfig 
    ? model.fields.filter(f => selectConfig.includes(f.name))
    : model.fields;
  
  // Add scalar fields (all optional for updates)
  for (const field of fields) {
    if (isScalar(field) || isEnum(field)) {
      // Skip id and auto-generated fields
      if (field.isId || field.isGenerated || field.isUpdatedAt) continue;
      
      const baseType = getBaseZodType(field.type as string);
      if (field.isList) {
        lines.push(`  ${field.name}: z.array(${baseType}).optional().nullable(),`);
      } else {
        // In updates:
        // - Required fields (no ?) can be updated but not set to null
        // - Optional fields (with ?) can be updated or set to null
        if (field.isRequired) {
          lines.push(`  ${field.name}: ${baseType}.optional(),`);
        } else {
          lines.push(`  ${field.name}: ${baseType}.optional().nullable(),`);
        }
      }
    }
  }
  
  // Add foreign key fields for relations (even if not in selectConfig)
  // This allows passing scalar IDs instead of relation objects
  for (const field of model.fields) {
    if (isRelation(field) && !field.isList && field.relationFromFields?.length) {
      const foreignKeyField = field.relationFromFields[0];
      const scalarField = model.fields.find(f => f.name === foreignKeyField);
      
      // Only add if not already added above
      if (scalarField && !fields.includes(scalarField)) {
        const baseType = getBaseZodType(scalarField.type as string);
        if (scalarField.isRequired) {
          lines.push(`  ${foreignKeyField}: ${baseType}.optional(),`);
        } else {
          lines.push(`  ${foreignKeyField}: ${baseType}.optional().nullable(),`);
        }
      }
    }
  }
  
  // Add relation fields with all Prisma operations
  for (const field of fields) {
    if (isRelation(field)) {
      lines.push(`  ${field.name}: z.object({`);
      
      // Use different schemas for create vs update operations
      const nestedCreateSchemaName = `${model.name}Create${field.name.charAt(0).toUpperCase() + field.name.slice(1)}InputSchema`;
      const nestedUpdateSchemaName = `${model.name}Update${field.name.charAt(0).toUpperCase() + field.name.slice(1)}InputSchema`;
      
      if (field.isList) {
        // Create operations use the create schema
        lines.push(`    create: z.union([`);
        lines.push(`      ${nestedCreateSchemaName},`);
        lines.push(`      z.array(${nestedCreateSchemaName})`);
        lines.push(`    ]).optional(),`);
        
        if (!isManyToMany(field)) {
          lines.push(`    createMany: z.object({`);
          lines.push(`      data: z.union([${nestedCreateSchemaName}, z.array(${nestedCreateSchemaName})]),`);
          lines.push(`      skipDuplicates: z.boolean().optional()`);
          lines.push(`    }).optional(),`);
        }
        
        // Connect operations
        lines.push(`    connect: z.union([`);
        lines.push(`      z.object({ id: z.string() }),`);
        lines.push(`      z.array(z.object({ id: z.string() }))`);
        lines.push(`    ]).optional(),`);
        
        lines.push(`    connectOrCreate: z.union([`);
        lines.push(`      z.object({`);
        lines.push(`        where: z.object({ id: z.string() }),`);
        lines.push(`        create: ${nestedCreateSchemaName}`);
        lines.push(`      }),`);
        lines.push(`      z.array(z.object({`);
        lines.push(`        where: z.object({ id: z.string() }),`);
        lines.push(`        create: ${nestedCreateSchemaName}`);
        lines.push(`      }))`);
        lines.push(`    ]).optional(),`);
        
        // Set operation
        lines.push(`    set: z.union([`);
        lines.push(`      z.object({ id: z.string() }),`);
        lines.push(`      z.array(z.object({ id: z.string() }))`);
        lines.push(`    ]).optional(),`);
        
        // Disconnect operation
        lines.push(`    disconnect: z.union([`);
        lines.push(`      z.object({ id: z.string() }),`);
        lines.push(`      z.array(z.object({ id: z.string() }))`);
        lines.push(`    ]).optional(),`);
        
        // Update operations use the update schema
        lines.push(`    update: z.union([`);
        lines.push(`      z.object({`);
        lines.push(`        where: z.object({ id: z.string() }),`);
        lines.push(`        data: ${nestedUpdateSchemaName}`);
        lines.push(`      }),`);
        lines.push(`      z.array(z.object({`);
        lines.push(`        where: z.object({ id: z.string() }),`);
        lines.push(`        data: ${nestedUpdateSchemaName}`);
        lines.push(`      }))`);
        lines.push(`    ]).optional(),`);
        
        lines.push(`    updateMany: z.object({`);
        lines.push(`      where: z.any().optional(),`);
        lines.push(`      data: ${nestedUpdateSchemaName}`);
        lines.push(`    }).optional(),`);
        
        // Upsert operations use both schemas
        lines.push(`    upsert: z.union([`);
        lines.push(`      z.object({`);
        lines.push(`        where: z.object({ id: z.string() }),`);
        lines.push(`        update: ${nestedUpdateSchemaName},`);
        lines.push(`        create: ${nestedCreateSchemaName}`);
        lines.push(`      }),`);
        lines.push(`      z.array(z.object({`);
        lines.push(`        where: z.object({ id: z.string() }),`);
        lines.push(`        update: ${nestedUpdateSchemaName},`);
        lines.push(`        create: ${nestedCreateSchemaName}`);
        lines.push(`      }))`);
        lines.push(`    ]).optional(),`);
        
        // Delete operations
        lines.push(`    delete: z.union([`);
        lines.push(`      z.object({ id: z.string() }),`);
        lines.push(`      z.array(z.object({ id: z.string() }))`);
        lines.push(`    ]).optional(),`);
        
        lines.push(`    deleteMany: z.any().optional(),`);
      } else {
        // Single relations
        lines.push(`    create: ${nestedCreateSchemaName}.optional(),`);
        lines.push(`    connect: z.object({ id: z.string() }).optional(),`);
        lines.push(`    connectOrCreate: z.object({`);
        lines.push(`      where: z.object({ id: z.string() }),`);
        lines.push(`      create: ${nestedCreateSchemaName}`);
        lines.push(`    }).optional(),`);
        
        if (!field.isRequired) {
          lines.push(`    disconnect: z.boolean().optional(),`);
        }
        
        lines.push(`    update: z.object({`);
        lines.push(`      where: z.object({ id: z.string() }).optional(),`);
        lines.push(`      data: ${nestedUpdateSchemaName}`);
        lines.push(`    }).optional(),`);
        
        lines.push(`    upsert: z.object({`);
        lines.push(`      where: z.object({ id: z.string() }),`);
        lines.push(`      update: ${nestedUpdateSchemaName},`);
        lines.push(`      create: ${nestedCreateSchemaName}`);
        lines.push(`    }).optional(),`);
        
        if (!field.isRequired) {
          lines.push(`    delete: z.boolean().optional(),`);
        }
      }
      
      lines.push(`  }).optional(),`);
    }
  }
  
  lines.push(`});`);
  
  // UpdateMany input schema (without relations)
  lines.push(``);
  lines.push(`export const ${model.name}UpdateManyInputSchema = z.object({`);
  
  for (const field of fields) {
    if (isScalar(field) || isEnum(field)) {
      if (field.isId || field.isGenerated || field.isUpdatedAt) continue;
      
      const baseType = getBaseZodType(field.type as string);
      if (field.isList) {
        lines.push(`  ${field.name}: z.array(${baseType}).optional().nullable(),`);
      } else {
        // UpdateMany allows setting any field to null for bulk operations
        lines.push(`  ${field.name}: ${baseType}.optional().nullable(),`);
      }
    }
  }
  
  lines.push(`});`);
  
  // Upsert input schema
  lines.push(``);
  lines.push(`export const ${model.name}UpsertInputSchema = z.object({`);
  lines.push(`  create: ${model.name}CreateSchema,`);
  lines.push(`  update: ${model.name}UpdateSchema,`);
  lines.push(`});`);
  
  return lines;
}

function generateNestedUpdateSchemas(
  model: DMMF.Model,
  ctx: SchemaContext,
  generatedSchemas: Set<string>
): string[] {
  const lines: string[] = [];
  const selectConfig = ctx.cfg.perModelSelect[model.name];
  
  if (!selectConfig) return lines;
  
  for (const fieldName of selectConfig) {
    const field = model.fields.find(f => f.name === fieldName);
    if (!field || !isRelation(field)) continue;
    
    const targetModelName = targetModel(field);
    const targetModelDef = ctx.dmmf.datamodel.models.find(m => m.name === targetModelName);
    if (!targetModelDef) continue;
    
    const schemaName = `${model.name}Update${field.name.charAt(0).toUpperCase() + field.name.slice(1)}InputSchema`;
    
    if (generatedSchemas.has(schemaName)) continue;
    generatedSchemas.add(schemaName);
    
    lines.push(`const ${schemaName} = z.object({`);
    
    // Get fields for the target model based on its select config
    const targetSelectConfig = ctx.cfg.perModelSelect[targetModelName];
    const targetFields = targetSelectConfig
      ? targetModelDef.fields.filter(f => targetSelectConfig.includes(f.name))
      : targetModelDef.fields;
    
    // Add all scalar fields (for better DX, include all fields and let Prisma validate)
    for (const targetField of targetFields) {
      if (isScalar(targetField) || isEnum(targetField)) {
        if (targetField.isId || targetField.isGenerated || targetField.isUpdatedAt) continue;
        
        const baseType = getBaseZodType(targetField.type as string);
        if (targetField.isList) {
          lines.push(`  ${targetField.name}: z.array(${baseType}).optional().nullable(),`);
        } else {
          // In updates:
          // - Required fields (no ?) can be updated but not set to null
          // - Optional fields (with ?) can be updated or set to null
          if (targetField.isRequired) {
            lines.push(`  ${targetField.name}: ${baseType}.optional(),`);
          } else {
            lines.push(`  ${targetField.name}: ${baseType}.optional().nullable(),`);
          }
        }
      }
    }
    
    // For nested relations, only allow connect/disconnect (not create/update) to avoid deep nesting
    // This prevents infinite recursion while still providing good DX
    for (const targetField of targetFields) {
      if (isRelation(targetField)) {
        lines.push(`  ${targetField.name}: z.object({`);
        
        if (targetField.isList) {
          lines.push(`    connect: z.union([`);
          lines.push(`      z.object({ id: z.string() }),`);
          lines.push(`      z.array(z.object({ id: z.string() }))`);
          lines.push(`    ]).optional(),`);
          lines.push(`    disconnect: z.union([`);
          lines.push(`      z.object({ id: z.string() }),`);
          lines.push(`      z.array(z.object({ id: z.string() }))`);
          lines.push(`    ]).optional(),`);
          lines.push(`    set: z.union([`);
          lines.push(`      z.object({ id: z.string() }),`);
          lines.push(`      z.array(z.object({ id: z.string() }))`);
          lines.push(`    ]).optional()`);
        } else {
          lines.push(`    connect: z.object({ id: z.string() }).optional(),`);
          if (!targetField.isRequired) {
            lines.push(`    disconnect: z.boolean().optional()`);
          }
        }
        
        lines.push(`  }).optional(),`);
      }
    }
    
    lines.push(`});`);
    lines.push(``);
  }
  
  return lines;
}

function generateFilterSchemas(model: DMMF.Model, ctx: SchemaContext): string[] {
  const lines: string[] = [];
  
  const selectConfig = ctx.cfg.perModelSelect[model.name];
  const fields = selectConfig 
    ? model.fields.filter(f => selectConfig.includes(f.name))
    : model.fields;
  
  // First, generate where schemas for each relation
  const relationWhereSchemas: string[] = [];
  for (const field of fields) {
    if (isRelation(field)) {
      const targetModelName = targetModel(field);
      const targetModelDef = ctx.dmmf.datamodel.models.find(m => m.name === targetModelName);
      if (!targetModelDef) continue;
      
      const filterSchemaName = `${model.name}${field.name.charAt(0).toUpperCase() + field.name.slice(1)}FilterSchema`;
      relationWhereSchemas.push(...generateRelationWhereSchema(filterSchemaName, targetModelDef, ctx));
      relationWhereSchemas.push(``);
    }
  }
  
  if (relationWhereSchemas.length > 0) {
    lines.push(`// Relation where schemas`);
    lines.push(...relationWhereSchemas);
  }
  
  // Generate the base filter schema (with placeholders for self-references)
  lines.push(`// Base filter schema`);
  lines.push(`export const ${model.name}FilterBaseSchema = z.object({`);
  
  // Scalar field filters
  for (const field of fields) {
    if (isScalar(field)) {
      const filterOps = generateFilterOps(field);
      
      if (filterOps.length > 0) {
        lines.push(`  ${field.name}: z.union([`);
        lines.push(`    ${generateScalarZod(field)},`);
        lines.push(`    z.object({`);
        for (const op of filterOps) {
          lines.push(`      ${op},`);
        }
        lines.push(`    })`);
        lines.push(`  ]).optional(),`);
      } else {
        lines.push(`  ${field.name}: ${generateScalarZod(field)}.optional(),`);
      }
    }
  }
  
  // Relation filters using the relation filter schemas
  for (const field of fields) {
    if (isRelation(field)) {
      const filterSchemaName = `${model.name}${field.name.charAt(0).toUpperCase() + field.name.slice(1)}FilterSchema`;
      
      if (field.isList) {
        lines.push(`  ${field.name}: z.object({`);
        lines.push(`    every: ${filterSchemaName}.optional(),`);
        lines.push(`    some: ${filterSchemaName}.optional(),`);
        lines.push(`    none: ${filterSchemaName}.optional(),`);
        lines.push(`  }).optional(),`);
      } else {
        lines.push(`  ${field.name}: z.union([`);
        lines.push(`    ${filterSchemaName},`);
        lines.push(`    z.null()`);
        lines.push(`  ]).optional(),`);
      }
    }
  }
  
  // Placeholder logical operators
  lines.push(`  AND: z.union([`);
  lines.push(`    z.any(),`);
  lines.push(`    z.array(z.any())`);
  lines.push(`  ]).optional(),`);
  lines.push(`  OR: z.array(z.any()).optional(),`);
  lines.push(`  NOT: z.union([`);
  lines.push(`    z.any(),`);
  lines.push(`    z.array(z.any())`);
  lines.push(`  ]).optional(),`);
  
  lines.push(`});`);
  lines.push(``);
  
  // Extended filter schema with proper self-references
  lines.push(`// Extended filter schema with self-references`);
  lines.push(`export const ${model.name}FilterSchema = ${model.name}FilterBaseSchema.extend({`);
  lines.push(`  AND: z.array(${model.name}FilterBaseSchema).optional(),`);
  lines.push(`  OR: z.array(${model.name}FilterBaseSchema).optional(),`);
  lines.push(`  NOT: ${model.name}FilterBaseSchema.optional(),`);
  lines.push(`});`);
  lines.push(``);
  
  // Alias for Prisma compatibility
  lines.push(`// Alias for Prisma compatibility`);
  lines.push(`export const ${model.name}WhereInputSchema = ${model.name}FilterSchema;`);
  lines.push(``);
  
  // WhereUniqueInput schema
  lines.push(`export const ${model.name}WhereUniqueInputSchema = z.object({`);
  
  const uniqueFields = generateWhereUniqueFields(model);
  for (const field of uniqueFields) {
    lines.push(`  ${field},`);
  }
  
  lines.push(`});`);
  
  return lines;
}

function generateRelationWhereSchema(
  schemaName: string,
  targetModel: DMMF.Model,
  ctx: SchemaContext
): string[] {
  const lines: string[] = [];
  
  // Get the select config for the target model
  const selectConfig = ctx.cfg.perModelSelect[targetModel.name];
  const fields = selectConfig
    ? targetModel.fields.filter(f => selectConfig.includes(f.name) && isScalar(f))
    : targetModel.fields.filter(f => isScalar(f));
  
  lines.push(`export const ${schemaName} = z.object({`);
  
  // Add scalar field filters for the target model
  for (const field of fields) {
    const filterOps = generateFilterOps(field);
    
    if (filterOps.length > 0) {
      lines.push(`  ${field.name}: z.union([`);
      lines.push(`    ${generateScalarZod(field)},`);
      lines.push(`    z.object({`);
      for (const op of filterOps) {
        lines.push(`      ${op},`);
      }
      lines.push(`    })`);
      lines.push(`  ]).optional(),`);
    } else {
      lines.push(`  ${field.name}: ${generateScalarZod(field)}.optional(),`);
    }
  }
  
  // Add logical operators for the relation where schema too
  lines.push(`  AND: z.array(z.any()).optional(),`);
  lines.push(`  OR: z.array(z.any()).optional(),`);
  lines.push(`  NOT: z.any().optional(),`);
  
  lines.push(`});`);
  
  return lines;
}