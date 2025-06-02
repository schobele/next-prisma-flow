import fs from "node:fs/promises";
import path from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { createSelectObjectWithRelations, formatGeneratedFileHeader, getZodImportPath } from "../utils.js";

export async function generateTypes(modelInfo: ModelInfo, context: GeneratorContext, modelDir: string): Promise<void> {
	const { name: modelName, lowerName, selectFields } = modelInfo;
	const selectObject = createSelectObjectWithRelations(modelInfo, context);

	// Get the correct relative path from the model subdirectory to local zod directory
	const zodImportPath = getZodImportPath(1);

	const template = `${formatGeneratedFileHeader()}import type { Prisma } from '@prisma/client';
import { z } from 'zod';

// Re-export Zod schemas from zod-prisma-types
export {
  ${modelName}Schema as ${lowerName}Schema,
  ${modelName}CreateInputSchema,
  ${modelName}UpdateInputSchema,
  ${modelName}CreateManyInputSchema,
} from '${zodImportPath}';

// Import schemas for type inference
import {
  ${modelName}CreateInputSchema,
  ${modelName}UpdateInputSchema,
  ${modelName}CreateManyInputSchema,
} from '${zodImportPath}';

// Infer types from Zod schemas
export type ${modelName}CreateInput = z.infer<typeof ${modelName}CreateInputSchema>;
export type ${modelName}UpdateInput = z.infer<typeof ${modelName}UpdateInputSchema>;
export type ${modelName}CreateManyInput = z.infer<typeof ${modelName}CreateManyInputSchema>;

// Define the select object for this model
export const ${lowerName}Select = ${selectObject} satisfies Prisma.${modelName}Select;

// Generate the exact type based on our select
export type ${modelName} = Prisma.${modelName}GetPayload<{
  select: typeof ${lowerName}Select;
}>;

// Utility types for working with this model
export type ${modelName}Id = ${modelName}['id'];

export type ${modelName}Input = ${modelName}CreateInput;
export type ${modelName}WhereInput = Prisma.${modelName}WhereInput;
export type ${modelName}WhereUniqueInput = Prisma.${modelName}WhereUniqueInput;
export type ${modelName}OrderByInput = Prisma.${modelName}OrderByWithRelationInput;

// For array operations
export type ${modelName}Array = ${modelName}[];
export type ${modelName}CreateInputArray = ${modelName}Input[];
export type ${modelName}CreateManyInputArray = ${modelName}CreateManyInput[];

// For partial updates (useful for forms)
export type Partial${modelName}Input = Partial<${modelName}Input>;

// For search and filtering
export interface ${modelName}SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  orderBy?: keyof ${modelName};
  orderDirection?: 'asc' | 'desc';
}

export interface ${modelName}FilterParams extends ${modelName}SearchParams {
  where?: ${modelName}WhereInput;
}

// Response types for API operations
export interface ${modelName}ApiResponse {
  data: ${modelName};
  success: boolean;
  message?: string;
}

export interface ${modelName}ListApiResponse {
  data: ${modelName}[];
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ${modelName}MutationResponse {
  data?: ${modelName};
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ${modelName}BatchResponse {
  count: number;
  success: boolean;
  message?: string;
}

// State management types for Jotai atoms
export interface ${modelName}State {
  items: Record<string, ${modelName}>;
  loading: boolean;
  creating: boolean;
  updating: Record<string, boolean>;
  deleting: Record<string, boolean>;
  error: string | null;
}

export interface ${modelName}OptimisticUpdate {
  id: string;
  data: Partial<${modelName}>;
  timestamp: number;
}

// Form types (useful for React Hook Form integration)
export type ${modelName}FormData = Omit<${modelName}Input, 'id' | 'createdAt' | 'updatedAt'>;
export type ${modelName}UpdateFormData = Partial<${modelName}FormData>;

// Event types for custom hooks
export interface ${modelName}ChangeEvent {
  type: 'create' | 'update' | 'delete';
  ${lowerName}: ${modelName};
  previousValue?: ${modelName};
}

// Validation error types
export interface ${modelName}ValidationError {
  field: keyof ${modelName}Input;
  message: string;
  code: string;
}

export interface ${modelName}ValidationErrors {
  errors: ${modelName}ValidationError[];
  message: string;
}
`;

	const filePath = path.join(modelDir, "types.ts");
	await fs.writeFile(filePath, template, "utf-8");
}
