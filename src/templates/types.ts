import { writeFile } from "../utils.js";
import { join } from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import {
	createSelectObjectWithRelations,
	formatGeneratedFileHeader,
	getPrismaImportPath,
	getZodImportPath,
} from "../utils.js";

export async function generateTypes(modelInfo: ModelInfo, context: GeneratorContext, modelDir: string): Promise<void> {
	const { name: modelName, lowerName, pluralName, model } = modelInfo;
	const selectObject = createSelectObjectWithRelations(modelInfo, context);

	// Get the correct relative path from the model subdirectory to local zod directory
	const zodImportPath = getZodImportPath(1);

	// Get the prisma import path for this nesting level
	const prismaImportPath = getPrismaImportPath(context, 1);

	// Determine if we're using the default @prisma/client or a custom prisma client
	const isDefaultPrismaClient = prismaImportPath === "@prisma/client";

	// Generate appropriate imports based on the prisma source
	const prismaImports = isDefaultPrismaClient
		? `import type { Prisma } from '@prisma/client';`
		: `import type { Prisma } from '${prismaImportPath}';`;

	// Get related model types for relationships
	const relatedModelTypes = new Set<string>();
	for (const field of model.fields) {
		// Check if field is a relation (has relationName OR is a model type)
		if (field.kind === "object" && field.type !== modelName) {
			const relatedModelName = field.type.replace("[]", ""); // Remove array notation
			relatedModelTypes.add(`${relatedModelName}WhereUniqueInput`);
		}
	}

	// Special case: For Todo model, manually add Tag relationship for now
	// TODO: Fix automatic detection of many-to-many relationships
	if (modelName === "Todo") {
		relatedModelTypes.add("TagWhereUniqueInput");
	}

	const template = `${formatGeneratedFileHeader()}import { z } from "zod";
${prismaImports}

export {
	${modelName}UncheckedCreateInputSchema as ${modelName}CreateInputSchema,
	${modelName}CreateManyInputSchema,
	${modelName}Schema as ${lowerName}Schema,
	${modelName}UncheckedUpdateInputSchema as ${modelName}UpdateInputSchema,
} from "${zodImportPath}";

import type { ${modelName}CreateManyInputSchema, ${modelName}UncheckedCreateInputSchema, ${modelName}UncheckedUpdateInputSchema } from "${zodImportPath}";

// ============================================================================
// CORE TYPES - Inferred from Zod schemas for consistency
// ============================================================================

/** Input type for creating a new ${modelName} */
export type ${modelName}CreateInput = z.infer<typeof ${modelName}UncheckedCreateInputSchema>;

/** Input type for updating an existing ${modelName} */
export type ${modelName}UpdateInput = z.infer<typeof ${modelName}UncheckedUpdateInputSchema>;

/** Input type for batch creating ${pluralName} */
export type ${modelName}CreateManyInput = z.infer<typeof ${modelName}CreateManyInputSchema>;

// ============================================================================
// PRISMA WHERE TYPES - Direct exports from Prisma for flexible querying
// ============================================================================

/** Where conditions for filtering ${lowerName}s */
export type ${modelName}WhereInput = Prisma.${modelName}WhereInput;

/** Unique selectors for identifying a specific ${lowerName} */
export type ${modelName}WhereUniqueInput = Prisma.${modelName}WhereUniqueInput;

/** Order by options for sorting ${lowerName}s */
export type ${modelName}OrderByInput = Prisma.${modelName}OrderByWithRelationInput;

// ============================================================================
// RELATED MODEL WHERE TYPES - For relationship operations
// ============================================================================
${Array.from(relatedModelTypes)
	.map(
		(type) =>
			`/** Unique selectors for ${type.replace("WhereUniqueInput", "").toLowerCase()} entities (for relationship operations) */
export type ${type} = Prisma.${type};`,
	)
	.join("\n\n")}

// ============================================================================
// PRISMA INTEGRATION - Proper select object and type generation
// ============================================================================

/**
 * Select object that defines exactly which fields are exposed from the database.
 * This serves as a security whitelist and performance optimization.
 */
export const ${lowerName}Select = ${selectObject} satisfies Prisma.${modelName}Select;

/**
 * Generated ${modelName} type based on our select object.
 * This ensures type safety between database queries and TypeScript types.
 */
export type ${modelName} = Prisma.${modelName}GetPayload<{
	select: typeof ${lowerName}Select;
}>;

// ============================================================================
// UTILITY TYPES - Common patterns for working with ${pluralName}
// ============================================================================

/** Strongly typed ${modelName} ID */
export type ${modelName}Id = ${modelName}["id"];

/** Alias for better readability in function signatures */
export type ${modelName}Input = ${modelName}CreateInput;

// Note: Prisma where types are defined above in the PRISMA WHERE TYPES section

// ============================================================================
// ARRAY AND COLLECTION TYPES
// ============================================================================

/** Array of ${modelName} entities */
export type ${modelName}Array = ${modelName}[];

/** Array of create inputs for batch operations */
export type ${modelName}CreateInputArray = ${modelName}Input[];

/** Array of create many inputs for optimized batch inserts */
export type ${modelName}CreateManyInputArray = ${modelName}CreateManyInput[];

/** Partial ${modelName} input for optional updates */
export type Partial${modelName}Input = Partial<${modelName}Input>;

// ============================================================================
// RELATIONSHIP OPERATION TYPES - Types for relationship management
// ============================================================================

/** Parameters for setting a required relationship */
export interface SetRequiredRelationParams<TRelatedWhere> {
	/** Unique selector for the main record */
	where: ${modelName}WhereUniqueInput;
	/** Unique selector for the related record to associate */
	relatedWhere: TRelatedWhere;
	/** Additional Prisma options */
	options?: Omit<Prisma.${modelName}UpdateArgs, "where" | "data" | "select"> & { select?: never };
}

/** Parameters for setting an optional relationship */
export interface SetOptionalRelationParams<TRelatedWhere> {
	/** Unique selector for the main record */
	where: ${modelName}WhereUniqueInput;
	/** Unique selector for the related record to associate */
	relatedWhere: TRelatedWhere;
	/** Additional Prisma options */
	options?: Omit<Prisma.${modelName}UpdateArgs, "where" | "data" | "select"> & { select?: never };
}

/** Parameters for removing an optional relationship */
export interface RemoveOptionalRelationParams {
	/** Unique selector for the main record */
	where: ${modelName}WhereUniqueInput;
	/** Additional Prisma options */
	options?: Omit<Prisma.${modelName}UpdateArgs, "where" | "data" | "select"> & { select?: never };
}

/** Parameters for many-to-many relationship operations */
export interface ManyToManyRelationParams<TRelatedWhere> {
	/** Unique selector for the main record */
	where: ${modelName}WhereUniqueInput;
	/** Array of unique selectors for related records */
	relatedWheres: TRelatedWhere[];
	/** Additional Prisma options */
	options?: Omit<Prisma.${modelName}UpdateArgs, "where" | "data" | "select"> & { select?: never };
}

/** Parameters for clearing many-to-many relationships */
export interface ClearManyToManyRelationParams {
	/** Unique selector for the main record */
	where: ${modelName}WhereUniqueInput;
	/** Additional Prisma options */
	options?: Omit<Prisma.${modelName}UpdateArgs, "where" | "data" | "select"> & { select?: never };
}

// ============================================================================
// API AND SEARCH TYPES - For query operations and pagination
// ============================================================================

/** Parameters for searching and filtering ${lowerName}s */
export interface ${modelName}SearchParams {
	/** Full-text search query */
	query?: string;

	/** Pagination page number (1-based) */
	page?: number;

	/** Number of items per page */
	limit?: number;

	/** Field to sort by */
	orderBy?: keyof ${modelName};

	/** Sort direction */
	orderDirection?: "asc" | "desc";
}

/** Extended search parameters with Prisma where conditions */
export interface ${modelName}FilterParams extends ${modelName}SearchParams {
	/** Advanced filtering with Prisma where conditions */
	where?: ${modelName}WhereInput;
}

// ============================================================================
// API RESPONSE TYPES - Standardized response formats
// ============================================================================

/** Standard API response for single ${modelName} operations */
export interface ${modelName}ApiResponse {
	data: ${modelName};
	success: boolean;
	message?: string;
	meta?: {
		timestamp: string;
		requestId?: string;
	};
}

/** API response for ${modelName} list operations with pagination */
export interface ${modelName}ListApiResponse {
	data: ${modelName}[];
	success: boolean;
	message?: string;
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrevious: boolean;
	};
	meta?: {
		timestamp: string;
		requestId?: string;
	};
}

/** Response type for mutations (create, update, delete) */
export interface ${modelName}MutationResponse {
	data?: ${modelName};
	success: boolean;
	message?: string;
	errors?: Record<string, string[]>;
	meta?: {
		timestamp: string;
		requestId?: string;
	};
}

/** Response type for batch operations */
export interface ${modelName}BatchResponse {
	count: number;
	success: boolean;
	message?: string;
	errors?: Array<{
		index: number;
		error: string;
	}>;
	meta?: {
		timestamp: string;
		requestId?: string;
	};
}

// ============================================================================
// STATE MANAGEMENT TYPES - For Jotai atoms and React state
// ============================================================================

/** Complete state shape for ${modelName} management */
export interface ${modelName}State {
	/** Map of ${lowerName}s by ID for efficient updates */
	items: Record<string, ${modelName}>;

	/** Global loading state */
	loading: boolean;

	/** Creation loading state */
	creating: boolean;

	/** Update loading states by ${lowerName} ID */
	updating: Record<string, boolean>;

	/** Delete loading states by ${lowerName} ID */
	deleting: Record<string, boolean>;

	/** Global error state */
	error: string | null;

	/** Last fetch timestamp for cache management */
	lastFetched?: number;

	/** Optimistic update tracking */
	optimisticUpdates: Record<string, ${modelName}OptimisticUpdate>;
}

/** Tracking data for optimistic updates */
export interface ${modelName}OptimisticUpdate {
	/** Unique ID for the optimistic update */
	id: string;

	/** The optimistic data */
	data: Partial<${modelName}>;

	/** When the optimistic update was created */
	timestamp: number;

	/** Original data for rollback */
	originalData?: ${modelName};

	/** Operation type */
	operation: "create" | "update" | "delete";
}

// ============================================================================
// REACT HOOK FORM INTEGRATION TYPES
// ============================================================================

/** Form data type excluding auto-generated fields */
export type ${modelName}FormData = Omit<${modelName}Input, "id" | "createdAt" | "updatedAt">;

/** Partial form data for updates */
export type ${modelName}UpdateFormData = Partial<${modelName}FormData>;

/** Options for use${modelName}Form hook */
export interface Use${modelName}FormOptions {
	/** Success callback when form submission succeeds */
	onSuccess?: (data: ${modelName}) => void;
	
	/** Error callback when form submission fails */
	onError?: (error: Error) => void;
	
	/** Whether to enable automatic form submission */
	autoSubmit?: boolean;
	
	/** Whether to enable optimistic updates */
	optimisticUpdates?: boolean;
}

/** Result type for use${modelName}Form hook (React Hook Form integration) */
export interface Use${modelName}FormResult {
	/** All react-hook-form properties and methods */
	[key: string]: any;
	
	/** Loading state from Flow actions */
	loading: boolean;
	
	/** Error state from Flow actions */
	error: Error | null;
	
	/** Enhanced submit handler with Flow integration */
	handleSubmit: (onValid: (data: any) => void | Promise<void>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
	
	/** Direct submission with Flow integration */
	submitWithFlow: (data: any) => Promise<${modelName}>;
	
	/** The operation type */
	operation: 'create' | 'update';
}

// ============================================================================
// EVENT TYPES - For custom hooks and event handling
// ============================================================================

/** Event emitted when a ${modelName} changes */
export interface ${modelName}ChangeEvent {
	/** Type of change */
	type: "create" | "update" | "delete";

	/** The ${lowerName} after the change */
	${lowerName}: ${modelName};

	/** The ${lowerName} before the change (for updates) */
	previousValue?: ${modelName};

	/** Timestamp of the change */
	timestamp: number;

	/** Whether this was an optimistic update */
	optimistic: boolean;
}

// ============================================================================
// VALIDATION TYPES - For error handling and validation
// ============================================================================

/** Individual field validation error */
export interface ${modelName}ValidationError {
	/** Field that has the error */
	field: keyof ${modelName}Input;

	/** Human-readable error message */
	message: string;

	/** Error code for programmatic handling */
	code: string;

	/** Additional error context */
	context?: Record<string, any>;
}

/** Collection of validation errors */
export interface ${modelName}ValidationErrors {
	/** Array of field errors */
	errors: ${modelName}ValidationError[];

	/** Overall error message */
	message: string;

	/** Whether validation failed */
	isValid: false;
}

/** Successful validation result */
export interface ${modelName}ValidationSuccess {
	/** Validation passed */
	isValid: true;

	/** Validated data */
	data: ${modelName}Input;
}

/** Union type for validation results */
export type ${modelName}ValidationResult = ${modelName}ValidationSuccess | ${modelName}ValidationErrors;

// ============================================================================
// HOOK RESULT TYPES - Return types for custom hooks
// ============================================================================

/** Result type for use${pluralName} hook */
export interface Use${pluralName}Result {
	// Data
	data: ${modelName}[];
	loading: boolean;
	error: string | null;
	count: number;
	isEmpty: boolean;

	// CRUD operations
	create${modelName}: (data: ${modelName}CreateInput) => Promise<${modelName}>;
	update${modelName}: (id: string, data: ${modelName}UpdateInput) => Promise<${modelName}>;
	delete${modelName}: (id: string) => Promise<void>;

	// Batch operations
	createMany: (data: ${modelName}CreateInput[]) => Promise<{ count: number }>;
	deleteMany: (ids: string[]) => Promise<{ count: number }>;

	// State management
	refresh: () => void;
	clearError: () => void;

	// Loading states for individual operations
	isCreating: boolean;
	isUpdating: (id: string) => boolean;
	isDeleting: (id: string) => boolean;

	// Optimistic updates info
	optimisticUpdates: Record<string, boolean>;
}

/** Result type for use${modelName} hook */
export interface Use${modelName}Result {
	// Data
	data: ${modelName} | null;
	loading: boolean;
	error: string | null;
	exists: boolean;

	// Operations
	update: (data: ${modelName}UpdateInput) => Promise<${modelName}>;
	delete: () => Promise<void>;

	// State
	isUpdating: boolean;
	isDeleting: boolean;
	isOptimistic: boolean;

}

// ============================================================================
// CONFIGURATION TYPES - For customizing behavior
// ============================================================================

/** Configuration for optimistic updates */
export interface ${modelName}OptimisticConfig {
	/** Strategy for handling conflicts */
	conflictResolution: "merge" | "overwrite" | "manual";

	/** Timeout for optimistic updates (ms) */
	timeout: number;

	/** Maximum number of retries */
	maxRetries: number;
}

/** Configuration for caching behavior */
export interface ${modelName}CacheConfig {
	/** Cache TTL in milliseconds */
	ttl: number;

	/** Whether to use stale-while-revalidate */
	staleWhileRevalidate: boolean;

	/** Cache tags for invalidation */
	tags: string[];
}

/** Overall configuration for ${modelName} operations */
export interface ${modelName}Config {
	/** Optimistic update configuration */
	optimistic: ${modelName}OptimisticConfig;

	/** Cache configuration */
	cache: ${modelName}CacheConfig;

	/** Whether to enable debug logging */
	debug: boolean;

	/** Custom error handler */
	onError?: (error: Error, context: string) => void;
}

// ============================================================================
// TYPE GUARDS - Runtime type checking utilities
// ============================================================================

/** Type guard to check if a value is a valid ${modelName} */
export function is${modelName}(value: any): value is ${modelName} {
	return typeof value === "object" && value !== null && typeof value.id === "string";
}

/** Type guard to check if a value is a valid ${modelName}CreateInput */
export function is${modelName}CreateInput(value: any): value is ${modelName}CreateInput {
	return typeof value === "object" && value !== null;
}

/** Type guard to check if a value is a validation error */
export function is${modelName}ValidationError(value: any): value is ${modelName}ValidationErrors {
	return typeof value === "object" && value !== null && value.isValid === false && Array.isArray(value.errors);
}

// ============================================================================
// DEFAULT VALUES - Sensible defaults for various types
// ============================================================================

/** Default configuration values */
export const DEFAULT_${modelName.toUpperCase()}_CONFIG: ${modelName}Config = {
	optimistic: {
		conflictResolution: "merge",
		timeout: 5000,
		maxRetries: 3,
	},
	cache: {
		ttl: 300000, // 5 minutes
		staleWhileRevalidate: true,
		tags: ["${modelName}"],
	},
	debug: process.env.NODE_ENV === "development",
};

/** Default search parameters */
export const DEFAULT_SEARCH_PARAMS: Required<${modelName}SearchParams> = {
	query: "",
	page: 1,
	limit: 10,
	orderBy: "createdAt",
	orderDirection: "desc",
};

// ============================================================================
// UTILITY TYPE HELPERS
// ============================================================================

/** Extract keys that are required in ${modelName}CreateInput */
export type Required${modelName}Fields = {
	[K in keyof ${modelName}CreateInput]-?: ${modelName}CreateInput[K] extends undefined ? never : K;
}[keyof ${modelName}CreateInput];

/** Extract keys that are optional in ${modelName}CreateInput */
export type Optional${modelName}Fields = {
	[K in keyof ${modelName}CreateInput]-?: ${modelName}CreateInput[K] extends undefined ? K : never;
}[keyof ${modelName}CreateInput];

/** Make specific fields required */
export type ${modelName}With<T extends keyof ${modelName}> = ${modelName} & Required<Pick<${modelName}, T>>;

/** Make specific fields optional */
export type ${modelName}Without<T extends keyof ${modelName}> = ${modelName} & Partial<Pick<${modelName}, T>>;
`;

	const filePath = join(modelDir, "types.ts");
	await writeFile(filePath, template);
}
