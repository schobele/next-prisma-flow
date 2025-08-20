import { join } from "node:path";
import type { FlowConfig } from "../config";
import type { DMMF } from "@prisma/generator-helper";
import { write } from "./fs";
import { header } from "./strings";
import { emitErrors } from "./core/errors";
import { emitFormProvider } from "./core/form-provider";
import { emitFieldWrapper } from "./core/field-wrapper";
import { emitFieldRegistry } from "./core/field-registry";

export async function emitRuntime({
	outDir,
	cfg,
	models,
}: {
	outDir: string;
	cfg: FlowConfig;
	models?: DMMF.Model[];
}) {
	const tenantComment = cfg.tenantModel 
		? `// ID of the ${cfg.tenantModel} for tenant isolation (matches ${cfg.tenantField || "tenantId"} in DB)`
		: `// value that should match the DB's ${cfg.tenantField || "tenantId"} column on your models`;
	
	await write(
		join(outDir, "core/ctx.ts"),
		header("core/ctx.ts") +
			`
export type FlowCtx = {
  userId?: string | null;
  tenantId?: string | null; ${tenantComment}
  role?: string | null;
  roles?: string[] | null; // For multi-role support
};
export type CtxProvider = () => Promise<FlowCtx> | FlowCtx;
`,
	);

	// Emit error classes
	await write(
		join(outDir, "core/errors.ts"),
		emitErrors()
	);

	// Emit form provider
	await write(
		join(outDir, "core/form-provider.tsx"),
		emitFormProvider()
	);

	// Emit field wrapper
	await write(
		join(outDir, "core/field-wrapper.tsx"),
		emitFieldWrapper()
	);

	// Emit field registry
	await write(
		join(outDir, "core/field-registry.tsx"),
		emitFieldRegistry()
	);

	await write(
		join(outDir, "core/cache.ts"),
		header("core/cache.ts") +
			`
import { revalidateTag } from "next/cache";
import { cache } from "react";

export function cacheTagged<T extends (...args: any[]) => Promise<any>>(fn: T){
  return cache(fn);
}
export async function invalidateTags(tags: string[]){
  for (const t of tags) revalidateTag(t);
}
`,
	);

	await write(
		join(outDir, "core/keys.ts"),
		header("core/keys.ts") +
			`
export const keys = {
  m: (name: string) => ({
    byId: (id: string) => [name, "byId", id] as const,
    list: (p?: any) => [name, "list", p||{}] as const,
    tag: (sub?: string) => \`\${name}\${sub?":"+sub:""}\`,
  })
};
`,
	);

	await write(
		join(outDir, "core/http.ts"),
		header("core/http.ts") +
			`
export function ok(data: any){ return Response.json({ ok: true, data }); }
export function bad(message: string, status=400){ return Response.json({ ok: false, error: message }, { status }); }
`,
	);

	await write(
		join(outDir, "core/provider.tsx"),
		header("core/provider.tsx") +
			`
"use client";
import { createContext, useContext } from "react";
import type { FlowCtx } from "./ctx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const Ctx = createContext<FlowCtx | null>(null);
let qc: QueryClient | null = null;

export function FlowProvider({ ctx, children }: { ctx: FlowCtx; children: any }){
  if(!qc) qc = new QueryClient();
  return (
    <Ctx.Provider value={ctx}>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </Ctx.Provider>
  );
}
export function useFlowCtx(){
  const c = useContext(Ctx);
  if(!c) throw new Error("FlowProvider missing");
  return c;
}
`,
	);

	// Build tenant relation map and relation target map if we have models and tenant configuration
	let tenantRelationMap: Record<string, string> = {};
	let relationTargetMap: Record<string, Record<string, string>> = {};
	
	if (models && cfg.tenantField && cfg.tenantModel) {
		for (const model of models) {
			const tenantField = cfg.tenantField;
			// Find the relation that points to the tenant model
			const tenantRelation = model.fields.find(
				(f) => f.type === cfg.tenantModel && 
				       f.relationFromFields?.includes(tenantField)
			);
			if (tenantRelation) {
				tenantRelationMap[model.name] = tenantRelation.name;
			}
			
			// Build map of relations to their target models
			relationTargetMap[model.name] = {};
			for (const field of model.fields) {
				if (field.kind === "object") { // It's a relation
					relationTargetMap[model.name][field.name] = field.type;
				}
			}
		}
	}
	
	await write(
		join(outDir, "core/utils.ts"),
		header("core/utils.ts") +
			`
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj } as any;
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const output = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
        (output as any)[key] = deepMerge(target[key] as any, source[key] as any);
      } else {
        (output as any)[key] = source[key];
      }
    } else {
      (output as any)[key] = source[key];
    }
  }
  return output;
}

/**
 * Map of model names to their tenant relation field names
 */
const TENANT_RELATION_MAP: Record<string, string> = ${JSON.stringify(tenantRelationMap, null, 2)};

/**
 * Map of model.relation to target model name
 * e.g., { "Todo": { "tags": "Tag", "list": "List" } }
 */
const RELATION_TARGET_MAP: Record<string, Record<string, string>> = ${JSON.stringify(relationTargetMap, null, 2)};

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
 * Get tenant connection for a specific model
 */
function getTenantConnectionForModel(modelName: string, tenantId: string | null | undefined): any {
  if (!tenantId || !modelName) return {};
  const relationName = TENANT_RELATION_MAP[modelName];
  if (!relationName) return {};
  return { [relationName]: { connect: { id: tenantId } } };
}

/**
 * Extract tenant ID from source data
 */
function extractTenantId(source: any): string | null | undefined {
  // Look for tenant connection in source data
  for (const key in source) {
    const value = source[key];
    if (value && typeof value === 'object' && value.connect && value.connect.id) {
      // Check if this is a tenant relation
      for (const model in TENANT_RELATION_MAP) {
        if (TENANT_RELATION_MAP[model] === key) {
          return value.connect.id;
        }
      }
    }
  }
  return null;
}

/**
 * Deep merge for Prisma data with special handling for nested operations
 * Automatically applies the correct tenant relation for each model
 */
export function deepMergePrismaData(target: any, source: any, parentModel?: string): any {
  if (!isPlainObject(source)) return target;
  if (!isPlainObject(target)) return source;

  const result: any = { ...target };
  
  // Extract tenant ID from source to use for nested creates
  const tenantId = extractTenantId(source);

  // First, copy all source properties that don't exist in target
  for (const key in source) {
    if (!source.hasOwnProperty(key)) continue;
    if (!(key in result)) {
      result[key] = source[key];
    }
  }

  // Then handle the complex merging for existing properties
  for (const key in target) {
    if (!target.hasOwnProperty(key)) continue;

    const targetValue = target[key];
    const sourceValue = source[key];

    // Handle nested relation operations
    if (isPlainObject(targetValue)) {
      // Check if this is a Prisma relation operation
      if ('create' in targetValue || 'createMany' in targetValue || 
          'connect' in targetValue || 'connectOrCreate' in targetValue ||
          'update' in targetValue || 'upsert' in targetValue) {
        
        // This is a relation object
        result[key] = { ...targetValue };
        
        // Determine the target model for this relation
        let targetModel: string | undefined;
        if (parentModel && RELATION_TARGET_MAP[parentModel]) {
          targetModel = RELATION_TARGET_MAP[parentModel][key];
        }
        
        // Get the correct tenant connection for the target model
        const targetTenantConnection = targetModel && tenantId 
          ? getTenantConnectionForModel(targetModel, tenantId)
          : source; // Fallback to original source if we can't determine model
        
        if (targetValue.create) {
          // Check if create is an array (many-to-many relation)
          if (Array.isArray(targetValue.create)) {
            // For array creates, merge tenant connection into each item
            result[key].create = targetValue.create.map((item: any) => {
              // First merge the tenant connection into the item
              const merged = { ...item };
              for (const prop in targetTenantConnection) {
                if (!(prop in merged)) {
                  merged[prop] = targetTenantConnection[prop];
                }
              }
              // Then recursively process for any nested relations
              return deepMergePrismaData(merged, targetTenantConnection, targetModel);
            });
          } else {
            // Single object create - apply recursive merge
            result[key].create = deepMergePrismaData(targetValue.create, targetTenantConnection, targetModel);
          }
        }
        
        if (targetValue.createMany && targetValue.createMany.data) {
          // Handle createMany by merging into each item
          if (Array.isArray(targetValue.createMany.data)) {
            result[key].createMany = {
              ...targetValue.createMany,
              data: targetValue.createMany.data.map((item: any) => 
                deepMergePrismaData(item, targetTenantConnection, targetModel)
              )
            };
          } else {
            result[key].createMany = {
              ...targetValue.createMany,
              data: deepMergePrismaData(targetValue.createMany.data, targetTenantConnection, targetModel)
            };
          }
        }
        
        if (targetValue.connectOrCreate) {
          // Handle connectOrCreate - can be array or single object
          if (Array.isArray(targetValue.connectOrCreate)) {
            // Array of connectOrCreate items
            result[key].connectOrCreate = targetValue.connectOrCreate.map((item: any) => {
              if (item.create) {
                return {
                  ...item,
                  create: deepMergePrismaData(item.create, targetTenantConnection, targetModel)
                };
              }
              return item;
            });
          } else if (targetValue.connectOrCreate.create) {
            // Single connectOrCreate with create field
            result[key].connectOrCreate = {
              ...targetValue.connectOrCreate,
              create: Array.isArray(targetValue.connectOrCreate.create)
                ? targetValue.connectOrCreate.create.map((item: any) => {
                    // First merge the tenant connection into the item
                    const merged = { ...item };
                    for (const prop in targetTenantConnection) {
                      if (!(prop in merged)) {
                        merged[prop] = targetTenantConnection[prop];
                      }
                    }
                    // Then recursively process for any nested relations
                    return deepMergePrismaData(merged, targetTenantConnection, targetModel);
                  })
                : deepMergePrismaData(targetValue.connectOrCreate.create, targetTenantConnection, targetModel)
            };
          }
        }
        
        if (targetValue.update) {
          // Update can also be an array in some cases
          if (Array.isArray(targetValue.update)) {
            result[key].update = targetValue.update.map((item: any) => {
              // For update operations with where/data structure
              if (item.where && item.data) {
                // Merge tenant connection into the data property, not at root level
                const mergedData = { ...item.data };
                for (const prop in targetTenantConnection) {
                  if (!(prop in mergedData)) {
                    mergedData[prop] = targetTenantConnection[prop];
                  }
                }
                return {
                  ...item,
                  data: deepMergePrismaData(mergedData, targetTenantConnection, targetModel)
                };
              } else {
                // Fallback for other structures
                const merged = { ...item };
                for (const prop in targetTenantConnection) {
                  if (!(prop in merged)) {
                    merged[prop] = targetTenantConnection[prop];
                  }
                }
                return deepMergePrismaData(merged, targetTenantConnection, targetModel);
              }
            });
          } else {
            result[key].update = deepMergePrismaData(targetValue.update, targetTenantConnection, targetModel);
          }
        }
        
        if (targetValue.upsert) {
          // Handle upsert with both create and update
          result[key].upsert = { ...targetValue.upsert };
          if (targetValue.upsert.create) {
            if (Array.isArray(targetValue.upsert.create)) {
              result[key].upsert.create = targetValue.upsert.create.map((item: any) => {
                // First merge the tenant connection into the item
                const merged = { ...item };
                for (const prop in targetTenantConnection) {
                  if (!(prop in merged)) {
                    merged[prop] = targetTenantConnection[prop];
                  }
                }
                // Then recursively process for any nested relations
                return deepMergePrismaData(merged, targetTenantConnection, targetModel);
              });
            } else {
              result[key].upsert.create = deepMergePrismaData(targetValue.upsert.create, targetTenantConnection, targetModel);
            }
          }
          if (targetValue.upsert.update) {
            if (Array.isArray(targetValue.upsert.update)) {
              result[key].upsert.update = targetValue.upsert.update.map((item: any) => {
                // For update operations with where/data structure
                if (item.where && item.data) {
                  // Merge tenant connection into the data property, not at root level
                  const mergedData = { ...item.data };
                  for (const prop in targetTenantConnection) {
                    if (!(prop in mergedData)) {
                      mergedData[prop] = targetTenantConnection[prop];
                    }
                  }
                  return {
                    ...item,
                    data: deepMergePrismaData(mergedData, targetTenantConnection, targetModel)
                  };
                } else {
                  // Fallback for other structures
                  const merged = { ...item };
                  for (const prop in targetTenantConnection) {
                    if (!(prop in merged)) {
                      merged[prop] = targetTenantConnection[prop];
                    }
                  }
                  return deepMergePrismaData(merged, targetTenantConnection, targetModel);
                }
              });
            } else {
              result[key].upsert.update = deepMergePrismaData(targetValue.upsert.update, targetTenantConnection, targetModel);
            }
          }
        }
      } else if (sourceValue !== undefined) {
        // Regular nested object, recursive merge
        result[key] = deepMergePrismaData(targetValue, sourceValue, parentModel);
      }
    } else if (targetValue !== undefined) {
      // Keep target value for non-objects
      result[key] = targetValue;
    }
  }

  return result;
}
`,
	);

	await write(
		join(outDir, "core/index.ts"),
		header("core/index.ts") +
			`
export * from "./ctx";
export * from "./cache";
export * from "./keys";
export * from "./http";
export * from "./utils";
export * from "./errors";
export { FlowProvider, useFlowCtx } from "./provider";
`,
	);

	// Create a client-safe index that doesn't include server-only imports
	await write(
		join(outDir, "core/index.client.ts"),
		header("core/index.client.ts") +
			`
export * from "./ctx";
export * from "./keys";
export * from "./utils";
export * from "./errors";
export { FlowProvider, useFlowCtx } from "./provider";
export * from "./form-provider";
export * from "./field-wrapper";
export * from "./field-registry";
`,
	);
}
