/**
 * Deep merge utility for Prisma data operations
 * Handles nested create, update, connect operations while preserving tenant isolation
 */

/**
 * Check if a value is a plain object (not array, date, null, etc.)
 */
function isPlainObject(value: any): boolean {
  return value !== null && 
         typeof value === 'object' && 
         !Array.isArray(value) && 
         !(value instanceof Date);
}

/**
 * Deep merge two Prisma data objects
 * Handles nested operations like create, connect, update, etc.
 * 
 * @param target - The target object (usually args.data)
 * @param source - The source object to merge (usually policy.data)
 * @returns Deeply merged object
 */
export function deepMergePrismaData(target: any, source: any): any {
  // If source is not an object, return target as-is
  if (!isPlainObject(source)) {
    return target;
  }

  // If target is not an object, return source
  if (!isPlainObject(target)) {
    return source;
  }

  // Create a new object to avoid mutations
  const result: any = { ...target };

  // Iterate through source properties
  for (const key in source) {
    if (!source.hasOwnProperty(key)) continue;

    const sourceValue = source[key];
    const targetValue = target[key];

    // Handle Prisma nested operations
    if (key === 'create' || key === 'update' || key === 'upsert') {
      // For create/update operations, deeply merge the nested data
      if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
        result[key] = deepMergePrismaData(targetValue, sourceValue);
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue;
      }
    } 
    // Handle createMany - need to merge into each item
    else if (key === 'createMany') {
      if (isPlainObject(targetValue) && targetValue.data) {
        if (Array.isArray(targetValue.data)) {
          // Merge source data into each array item
          result[key] = {
            ...targetValue,
            data: targetValue.data.map((item: any) => 
              deepMergePrismaData(item, sourceValue.data || sourceValue)
            )
          };
        } else {
          // Single item in createMany
          result[key] = {
            ...targetValue,
            data: deepMergePrismaData(targetValue.data, sourceValue.data || sourceValue)
          };
        }
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue;
      }
    }
    // Handle connect, connectOrCreate
    else if (key === 'connect' || key === 'connectOrCreate') {
      // For connect operations, merge the connection criteria
      if (key === 'connectOrCreate' && isPlainObject(targetValue) && isPlainObject(sourceValue)) {
        // connectOrCreate has 'where' and 'create' sub-objects
        result[key] = {
          ...targetValue,
          where: sourceValue.where ? { ...targetValue.where, ...sourceValue.where } : targetValue.where,
          create: sourceValue.create ? deepMergePrismaData(targetValue.create || {}, sourceValue.create) : targetValue.create
        };
      } else if (sourceValue !== undefined) {
        // For simple connect, just use source if it exists
        result[key] = sourceValue;
      }
    }
    // Handle arrays (like tags: [...])
    else if (Array.isArray(targetValue)) {
      // For arrays, keep target array as-is (don't merge arrays)
      result[key] = targetValue;
    }
    // Handle nested objects
    else if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      // Recursively merge nested objects
      result[key] = deepMergePrismaData(targetValue, sourceValue);
    }
    // For other values, use source if it exists and target doesn't
    else if (targetValue === undefined && sourceValue !== undefined) {
      result[key] = sourceValue;
    }
  }

  return result;
}

/**
 * Apply tenant field to all nested create operations
 * This ensures multi-tenancy is maintained at all levels
 * 
 * @param data - The Prisma data object
 * @param tenantField - The name of the tenant field (e.g., 'companyId')
 * @param tenantRelation - The relation name (e.g., 'company')
 * @param tenantId - The tenant ID value
 * @returns Data with tenant field applied to all creates
 */
export function applyTenantToNestedCreates(
  data: any,
  tenantField: string,
  tenantRelation: string,
  tenantId: string | undefined
): any {
  if (!tenantId || !isPlainObject(data)) {
    return data;
  }

  const result: any = { ...data };

  // Apply tenant connection at the current level if not already set
  if (!result[tenantRelation] && !result[tenantField]) {
    result[tenantRelation] = { connect: { id: tenantId } };
  }

  // Recursively apply to nested creates
  for (const key in result) {
    if (!result.hasOwnProperty(key)) continue;

    const value = result[key];

    // Handle nested create
    if (key === 'create' && isPlainObject(value)) {
      result[key] = applyTenantToNestedCreates(value, tenantField, tenantRelation, tenantId);
    }
    // Handle createMany
    else if (key === 'createMany' && isPlainObject(value) && value.data) {
      if (Array.isArray(value.data)) {
        result[key] = {
          ...value,
          data: value.data.map((item: any) => 
            applyTenantToNestedCreates(item, tenantField, tenantRelation, tenantId)
          )
        };
      } else {
        result[key] = {
          ...value,
          data: applyTenantToNestedCreates(value.data, tenantField, tenantRelation, tenantId)
        };
      }
    }
    // Handle connectOrCreate
    else if (key === 'connectOrCreate' && isPlainObject(value) && value.create) {
      result[key] = {
        ...value,
        create: applyTenantToNestedCreates(value.create, tenantField, tenantRelation, tenantId)
      };
    }
    // Handle nested relation objects (e.g., list: { create: {...} })
    else if (isPlainObject(value) && (value.create || value.createMany || value.connectOrCreate)) {
      result[key] = applyTenantToNestedCreates(value, tenantField, tenantRelation, tenantId);
    }
  }

  return result;
}