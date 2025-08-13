import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../../config";
import { isEnum, isRelation, isScalar, scalarZodFor, targetModel } from "../../../dmmf";

export interface SchemaContext {
  dmmf: DMMF.Document;
  cfg: FlowConfig;
  visitedPath: string[];
  schemaCache: Map<string, string>;
}

// Generate a unique key for tracking visited models in a path
export function pathKey(modelName: string, relationName?: string): string {
  return relationName ? `${modelName}.${relationName}` : modelName;
}

// Check if adding this model/relation would create a circular reference
export function wouldBeCircular(ctx: SchemaContext, modelName: string, relationName?: string): boolean {
  const key = pathKey(modelName, relationName);
  return ctx.visitedPath.includes(key);
}

// Get the select configuration for a specific model and relation
export function getSelectConfig(
  cfg: FlowConfig, 
  parentModel: string, 
  relationField?: string
): string[] | undefined {
  // First check for specific relation config (e.g., PostAuthorSelect)
  if (relationField) {
    const relationKey = `${parentModel}${relationField.charAt(0).toUpperCase() + relationField.slice(1)}`;
    const relationSelect = cfg.perModelSelect[relationKey];
    if (relationSelect) return relationSelect;
  }
  
  // Fall back to model's default select
  return cfg.perModelSelect[parentModel];
}

// Generate Zod type for a scalar field
export function generateScalarZod(field: DMMF.Field, forCreate: boolean = false): string {
  if (isScalar(field)) {
    const baseType = getBaseZodType(field.type as string);
    
    // For create operations
    if (forCreate) {
      // Auto-generated fields are always optional
      if (field.isId || field.isGenerated || field.isUpdatedAt) {
        return field.isList ? `z.array(${baseType}).optional()` : `${baseType}.optional()`;
      }
      
      // Fields with defaults are optional
      if (field.hasDefaultValue) {
        return field.isList ? `z.array(${baseType}).optional()` : `${baseType}.optional()`;
      }
      
      // Required fields stay required
      if (field.isRequired) {
        return field.isList ? `z.array(${baseType})` : baseType;
      }
      
      // Optional fields are optional and nullable
      return field.isList ? `z.array(${baseType}).optional()` : `${baseType}.optional().nullable()`;
    }
    
    // For non-create operations, use the standard generator
    return scalarZodFor(field);
  }
  
  if (isEnum(field)) {
    // Handle enum types - would need enum values from DMMF
    return `z.string()`; // Simplified for now
  }
  
  return `z.any()`;
}

// Get base Zod type for a Prisma scalar type
export function getBaseZodType(type: string): string {
  switch (type) {
    case "String": return "z.string()";
    case "Int": return "z.number().int()";
    case "Float": return "z.number()";
    case "Boolean": return "z.boolean()";
    case "DateTime": return "z.date()";
    case "BigInt": return "z.bigint()";
    case "Decimal": return "z.string()";
    case "Json": return "z.any()";
    case "Bytes": return "z.instanceof(Buffer)";
    default: return "z.any()";
  }
}

// Generate schema name for a relation
export function relationSchemaName(
  parentModel: string, 
  relationPath: string[]
): string {
  if (relationPath.length === 0) return `${parentModel}Schema`;
  return `${parentModel}${relationPath.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join("")}Schema`;
}

// Get fields that should be included in a schema based on select config
export function getFieldsForSchema(
  model: DMMF.Model, 
  cfg: FlowConfig,
  parentModel?: string,
  relationName?: string
): readonly DMMF.Field[] {
  const selectConfig = parentModel && relationName 
    ? getSelectConfig(cfg, parentModel, relationName)
    : cfg.perModelSelect[model.name];
    
  if (!selectConfig) {
    // If no config, include all fields by default
    return model.fields;
  }
  
  // Filter to only configured fields
  return model.fields.filter(f => selectConfig.includes(f.name));
}

// Check if a relation is many-to-many (no foreign key on this side)
export function isManyToMany(field: DMMF.Field): boolean {
  return !field.relationFromFields || field.relationFromFields.length === 0;
}

// Get limit for a relation
export function getRelationLimit(cfg: FlowConfig, modelName: string, fieldName: string): number {
  return cfg.perRelationLimit[`${modelName}.${fieldName}`] || 50;
}

// Get order for a relation  
export function getRelationOrder(cfg: FlowConfig, modelName: string, fieldName: string): string | undefined {
  return cfg.perRelationOrder[`${modelName}.${fieldName}`];
}

// Generate where unique input fields for a model
export function generateWhereUniqueFields(model: DMMF.Model): string[] {
  const uniqueFields: string[] = [];
  
  // Add ID fields
  const idField = model.fields.find(f => f.isId);
  if (idField) {
    uniqueFields.push(`${idField.name}: ${generateScalarZod(idField)}.optional()`);
  }
  
  // Add unique fields
  for (const field of model.fields) {
    if (field.isUnique && !field.isId && isScalar(field)) {
      uniqueFields.push(`${field.name}: ${generateScalarZod(field)}.optional()`);
    }
  }
  
  // Add compound unique constraints (simplified - would need to handle properly)
  // This would require checking model.uniqueIndexes in real implementation
  
  return uniqueFields;
}

// Generate filter operations for a field type
export function generateFilterOps(field: DMMF.Field): string[] {
  const ops: string[] = [];
  const baseType = generateScalarZod(field);
  
  if (field.type === "String") {
    ops.push(
      `equals: z.string().optional()`,
      `contains: z.string().optional()`,
      `startsWith: z.string().optional()`,
      `endsWith: z.string().optional()`,
      `in: z.array(z.string()).optional()`,
      `notIn: z.array(z.string()).optional()`,
      `not: z.string().optional()`
    );
  } else if (["Int", "Float", "Decimal", "BigInt"].includes(field.type as string)) {
    ops.push(
      `equals: ${baseType}.optional()`,
      `lt: ${baseType}.optional()`,
      `lte: ${baseType}.optional()`,
      `gt: ${baseType}.optional()`,
      `gte: ${baseType}.optional()`,
      `in: z.array(${baseType}).optional()`,
      `notIn: z.array(${baseType}).optional()`,
      `not: ${baseType}.optional()`
    );
  } else if (field.type === "Boolean") {
    ops.push(
      `equals: z.boolean().optional()`,
      `not: z.boolean().optional()`
    );
  } else if (field.type === "DateTime") {
    ops.push(
      `equals: z.date().optional()`,
      `lt: z.date().optional()`,
      `lte: z.date().optional()`,
      `gt: z.date().optional()`,
      `gte: z.date().optional()`,
      `in: z.array(z.date()).optional()`,
      `notIn: z.array(z.date()).optional()`,
      `not: z.date().optional()`
    );
  }
  
  return ops;
}