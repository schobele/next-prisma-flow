import { writeFile } from "../utils.js";
import { join } from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { createSelectObjectWithRelations, formatGeneratedFileHeader, getPrismaImportPath } from "../utils.js";

export async function generateServerActions(
	modelInfo: ModelInfo,
	context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName, lowerName, pluralName, lowerPluralName, selectFields, analyzed } = modelInfo;
	const selectObject = createSelectObjectWithRelations(modelInfo, context);

	// Generate dynamic imports based on actual relationships
	const relationshipImports = analyzed.relationships.relatedModels.map((model) => `${model}WhereUniqueInput`).sort();

	// Generate dynamic foreign key cache tags based on actual relationships
	const foreignKeyCacheTags = analyzed.foreignKeyFields
		.map(
			(field) => `if (data.${field.name}) {
			tags.push(\`\${MODEL_NAME}:${field.name}:\${data.${field.name}}\`);
		}`,
		)
		.join("\n\t\t");

	// Generate relationship connection methods dynamically (only for "owns" relationships to avoid duplicates)
	const relationshipMethods = analyzed.relationships.owns
		.filter((rel) => !rel.isScalarField) // Only include object relations, not foreign key fields
		.map((rel) => {
			const relationKey = rel.fieldName;
			const relatedModel = rel.relatedModel;
			const isList = rel.type === "one-to-many" || rel.type === "many-to-many";

			return `
/**
 * Connect ${relationKey} relation for ${lowerName}
 */
export async function connect${relationKey.charAt(0).toUpperCase() + relationKey.slice(1)}(
	id: string,
	${relationKey}Ids: string${isList ? "[]" : ""},
): Promise<${modelName}> {
	return withErrorHandling(
		"connect${relationKey}",
		async () => {
			const result = await prisma.${lowerName}.update({
				where: { id },
				data: {
					${relationKey}: {
						${isList ? `connect: ${relationKey}Ids.map(id => ({ id }))` : `connect: { id: ${relationKey}Ids }`}
					}
				},
				select: ${lowerName}Select,
			});

			invalidateCache(result as ${modelName});
			return result as ${modelName};
		},
		{ id, ${relationKey}Ids },
	);
}

/**
 * Disconnect ${relationKey} relation for ${lowerName}
 */
export async function disconnect${relationKey.charAt(0).toUpperCase() + relationKey.slice(1)}(
	id: string,
	${relationKey}Ids: string${isList ? "[]" : ""},
): Promise<${modelName}> {
	return withErrorHandling(
		"disconnect${relationKey}",
		async () => {
			const result = await prisma.${lowerName}.update({
				where: { id },
				data: {
					${relationKey}: {
						${isList ? `disconnect: ${relationKey}Ids.map(id => ({ id }))` : `disconnect: { id: ${relationKey}Ids }`}
					}
				},
				select: ${lowerName}Select,
			});

			invalidateCache(result as ${modelName});
			return result as ${modelName};
		},
		{ id, ${relationKey}Ids },
	);
}`;
		})
		.join("\n");

	const template = `${formatGeneratedFileHeader()}"use server";

import { revalidateTag } from "next/cache";
import { prisma, type Prisma } from "../prisma";
import {
	${modelName}CreateInputSchema,
	${modelName}CreateManyInputSchema,
	${lowerName}Select,
	${modelName}UpdateInputSchema,
} from "./types";
import type {
	${modelName},
	${modelName}CreateInput,
	${modelName}CreateManyInput,
	${modelName}UpdateInput,
	${modelName}WhereInput,
	${modelName}WhereUniqueInput,${relationshipImports.length > 0 ? `\n\t${relationshipImports.join(",\n\t")},` : ""}
} from "./types";

// ============================================================================
// CACHE MANAGEMENT - Dynamic cache invalidation
// ============================================================================

const MODEL_NAME = "${modelName}" as const;

function generateCacheTags(data: Partial<${modelName}>): string[] {
	const tags: string[] = [MODEL_NAME];

	if (data.id) {
		tags.push(\`\${MODEL_NAME}:\${data.id}\`);
	}

	${foreignKeyCacheTags}

	return tags;
}

function invalidateCache(data: Partial<${modelName}>): void {
	const tags = generateCacheTags(data);
	for (const tag of tags) {
		revalidateTag(tag);
	}
}

// ============================================================================
// ERROR HANDLING - Prisma-aware error management
// ============================================================================

class ${modelName}Error extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly statusCode: number = 400,
		public readonly context?: Record<string, any>,
	) {
		super(message);
		this.name = "${modelName}Error";
	}
}

async function withErrorHandling<T>(
	operation: string,
	fn: () => Promise<T>,
	context?: Record<string, any>,
): Promise<T> {
	try {
		return await fn();
	} catch (error) {
		console.error(\`\${MODEL_NAME} \${operation} error:\`, error, context);

		if (error instanceof ${modelName}Error) {
			throw error;
		}

		if (typeof error === "object" && error !== null && "code" in error) {
			const prismaError = error as { code: string; message: string };

			switch (prismaError.code) {
				case "P2002":
					throw new ${modelName}Error("Unique constraint violation", "DUPLICATE", 409, context);
				case "P2025":
					throw new ${modelName}Error("Record not found", "NOT_FOUND", 404, context);
				case "P2003":
					throw new ${modelName}Error("Foreign key constraint violation", "INVALID_REFERENCE", 400, context);
				case "P2014":
					throw new ${modelName}Error("Invalid relation reference", "INVALID_RELATION", 400, context);
				default:
					throw new ${modelName}Error(\`Database error: \${prismaError.message}\`, "DATABASE_ERROR", 500, context);
			}
		}

		if (error instanceof Error && error.message.includes("validation")) {
			throw new ${modelName}Error(\`Validation failed: \${error.message}\`, "VALIDATION_ERROR", 400, context);
		}

		const message = error instanceof Error ? error.message : "Unknown error occurred";
		throw new ${modelName}Error(message, "UNKNOWN_ERROR", 500, context);
	}
}

// ============================================================================
// CORE CRUD OPERATIONS - Full Prisma API parity
// ============================================================================

/**
 * Find many ${lowerPluralName} with Prisma options
 */
export async function findMany(
	args?: Prisma.${modelName}FindManyArgs,
): Promise<${modelName}[]> {
	return withErrorHandling(
		"findMany",
		async () => {
			const result = await prisma.${lowerName}.findMany({
				...args,
				select: args?.select || ${lowerName}Select,
			});

			return result as ${modelName}[];
		},
		{ args },
	);
}

/**
 * Find unique ${lowerName} by unique constraint
 */
export async function findUnique(
	args: Prisma.${modelName}FindUniqueArgs,
): Promise<${modelName} | null> {
	return withErrorHandling(
		"findUnique",
		async () => {
			const result = await prisma.${lowerName}.findUnique({
				...args,
				select: args.select || ${lowerName}Select,
			});

			return result as ${modelName} | null;
		},
		{ args },
	);
}

/**
 * Find unique ${lowerName} or throw error if not found
 */
export async function findUniqueOrThrow(
	args: Prisma.${modelName}FindUniqueArgs,
): Promise<${modelName}> {
	return withErrorHandling(
		"findUniqueOrThrow",
		async () => {
			const result = await prisma.${lowerName}.findUniqueOrThrow({
				...args,
				select: args.select || ${lowerName}Select,
			});

			return result as ${modelName};
		},
		{ args },
	);
}

/**
 * Find first ${lowerName} matching criteria
 */
export async function findFirst(
	args?: Prisma.${modelName}FindFirstArgs,
): Promise<${modelName} | null> {
	return withErrorHandling(
		"findFirst",
		async () => {
			const result = await prisma.${lowerName}.findFirst({
				...args,
				select: args?.select || ${lowerName}Select,
			});

			return result as ${modelName} | null;
		},
		{ args },
	);
}

/**
 * Find first ${lowerName} or throw error if not found
 */
export async function findFirstOrThrow(
	args?: Prisma.${modelName}FindFirstArgs,
): Promise<${modelName}> {
	return withErrorHandling(
		"findFirstOrThrow",
		async () => {
			const result = await prisma.${lowerName}.findFirstOrThrow({
				...args,
				select: args?.select || ${lowerName}Select,
			});

			return result as ${modelName};
		},
		{ args },
	);
}

/**
 * Create a new ${lowerName}
 */
export async function create(
	args: Prisma.${modelName}CreateArgs,
): Promise<${modelName}> {
	return withErrorHandling(
		"create",
		async () => {
			const data = ${modelName}CreateInputSchema.parse(args.data);
			const result = await prisma.${lowerName}.create({
				...args,
				data,
				select: args.select || ${lowerName}Select,
			});

			invalidateCache(result as ${modelName});
			return result as ${modelName};
		},
		{ args },
	);
}

/**
 * Create multiple ${lowerPluralName}
 */
export async function createMany(
	args: Prisma.${modelName}CreateManyArgs,
): Promise<Prisma.BatchPayload> {
	return withErrorHandling(
		"createMany",
		async () => {
			const data = Array.isArray(args.data) 
				? args.data.map(item => ${modelName}CreateManyInputSchema.parse(item))
				: ${modelName}CreateManyInputSchema.parse(args.data);
			
			const result = await prisma.${lowerName}.createMany({
				...args,
				data,
			});

			revalidateTag(MODEL_NAME);
			return result;
		},
		{ args },
	);
}

/**
 * Update an existing ${lowerName}
 */
export async function update(
	args: Prisma.${modelName}UpdateArgs,
): Promise<${modelName}> {
	return withErrorHandling(
		"update",
		async () => {
			const data = ${modelName}UpdateInputSchema.parse(args.data);
			const result = await prisma.${lowerName}.update({
				...args,
				data,
				select: args.select || ${lowerName}Select,
			});

			invalidateCache(result as ${modelName});
			return result as ${modelName};
		},
		{ args },
	);
}

/**
 * Update multiple ${lowerPluralName}
 */
export async function updateMany(
	args: Prisma.${modelName}UpdateManyArgs,
): Promise<Prisma.BatchPayload> {
	return withErrorHandling(
		"updateMany",
		async () => {
			const data = ${modelName}UpdateInputSchema.parse(args.data);
			const result = await prisma.${lowerName}.updateMany({
				...args,
				data,
			});

			revalidateTag(MODEL_NAME);
			return result;
		},
		{ args },
	);
}

/**
 * Upsert a ${lowerName} (create or update)
 */
export async function upsert(
	args: Prisma.${modelName}UpsertArgs,
): Promise<${modelName}> {
	return withErrorHandling(
		"upsert",
		async () => {
			const createData = ${modelName}CreateInputSchema.parse(args.create);
			const updateData = ${modelName}UpdateInputSchema.parse(args.update);

			const result = await prisma.${lowerName}.upsert({
				...args,
				create: createData,
				update: updateData,
				select: args.select || ${lowerName}Select,
			});

			invalidateCache(result as ${modelName});
			return result as ${modelName};
		},
		{ args },
	);
}

/**
 * Delete a ${lowerName}
 */
export async function deleteRecord(
	args: Prisma.${modelName}DeleteArgs,
): Promise<${modelName}> {
	return withErrorHandling(
		"delete",
		async () => {
			const existing = await prisma.${lowerName}.findUnique({
				where: args.where,
				select: ${lowerName}Select,
			});

			const result = await prisma.${lowerName}.delete({
				...args,
				select: args.select || ${lowerName}Select,
			});

			if (existing) {
				invalidateCache(existing as ${modelName});
			}
			return result as ${modelName};
		},
		{ args },
	);
}

/**
 * Delete multiple ${lowerPluralName}
 */
export async function deleteMany(
	args: Prisma.${modelName}DeleteManyArgs,
): Promise<Prisma.BatchPayload> {
	return withErrorHandling(
		"deleteMany",
		async () => {
			const result = await prisma.${lowerName}.deleteMany(args);
			revalidateTag(MODEL_NAME);
			return result;
		},
		{ args },
	);
}

// ============================================================================
// AGGREGATION & ANALYSIS OPERATIONS
// ============================================================================

/**
 * Count ${lowerPluralName} matching criteria
 */
export async function count(
	args?: Prisma.${modelName}CountArgs,
): Promise<number> {
	return withErrorHandling(
		"count",
		async () => {
			return await prisma.${lowerName}.count(args);
		},
		{ args },
	);
}

/**
 * Aggregate ${lowerPluralName} data
 */
export async function aggregate(
	args: Prisma.${modelName}AggregateArgs,
): Promise<Prisma.Get${modelName}AggregateType<typeof args>> {
	return withErrorHandling(
		"aggregate",
		async () => {
			return await prisma.${lowerName}.aggregate(args) as any;
		},
		{ args },
	);
}

/**
 * Group ${lowerPluralName} by field values
 */
export async function groupBy(
	args: Prisma.${modelName}GroupByArgs,
): Promise<any> {
	return withErrorHandling(
		"groupBy",
		async () => {
			return await prisma.${lowerName}.groupBy(args);
		},
		{ args },
	);
}

// ============================================================================
// CONVENIENCE UTILITY METHODS
// ============================================================================

/**
 * Check if a ${lowerName} exists
 */
export async function exists(where: ${modelName}WhereUniqueInput): Promise<boolean> {
	return withErrorHandling(
		"exists",
		async () => {
			const result = await prisma.${lowerName}.findUnique({
				where,
				select: { id: true },
			});
			return result !== null;
		},
		{ where },
	);
}

/**
 * Check if any ${lowerPluralName} exist matching criteria
 */
export async function existsWhere(where: ${modelName}WhereInput): Promise<boolean> {
	return withErrorHandling(
		"existsWhere",
		async () => {
			const result = await prisma.${lowerName}.findFirst({
				where,
				select: { id: true },
			});
			return result !== null;
		},
		{ where },
	);
}

/**
 * Find ${lowerName} by ID (convenience method)
 */
export async function findById(id: string): Promise<${modelName} | null> {
	return findUnique({ where: { id } });
}

/**
 * Find ${lowerName} by ID or throw error
 */
export async function findByIdOrThrow(id: string): Promise<${modelName}> {
	return findUniqueOrThrow({ where: { id } });
}

/**
 * Update ${lowerName} by ID (convenience method)
 */
export async function updateById(
	id: string,
	data: ${modelName}UpdateInput,
): Promise<${modelName}> {
	return update({ where: { id }, data });
}

/**
 * Delete ${lowerName} by ID (convenience method)
 */
export async function deleteById(id: string): Promise<${modelName}> {
	return deleteRecord({ where: { id } });
}

/**
 * Find ${lowerPluralName} with pagination
 */
export async function findWithPagination(args: {
	where?: ${modelName}WhereInput;
	orderBy?: Prisma.${modelName}OrderByWithRelationInput;
	page: number;
	pageSize: number;
}): Promise<{
	data: ${modelName}[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}> {
	return withErrorHandling(
		"findWithPagination",
		async () => {
			const { where, orderBy, page, pageSize } = args;
			const skip = (page - 1) * pageSize;

			const [data, total] = await Promise.all([
				prisma.${lowerName}.findMany({
					where,
					orderBy,
					skip,
					take: pageSize,
					select: ${lowerName}Select,
				}),
				prisma.${lowerName}.count({ where }),
			]);

			return {
				data: data as ${modelName}[],
				total,
				page,
				pageSize,
				totalPages: Math.ceil(total / pageSize),
			};
		},
		{ args },
	);
}

/**
 * Search ${lowerPluralName} across text fields
 */
export async function search(
	query: string,
	options?: {
		fields?: Prisma.${modelName}ScalarFieldEnum[];
		where?: ${modelName}WhereInput;
		orderBy?: Prisma.${modelName}OrderByWithRelationInput;
		take?: number;
	},
): Promise<${modelName}[]> {
	return withErrorHandling(
		"search",
		async () => {
			// Default to searching common text fields
			const searchFields = options?.fields || ['title', 'name', 'description'].filter(
				field => field in ${lowerName}Select
			) as Prisma.${modelName}ScalarFieldEnum[];

			const searchConditions = searchFields.map(field => ({
				[field]: {
					contains: query,
					mode: 'insensitive' as const,
				},
			}));

			const where: ${modelName}WhereInput = {
				AND: [
					options?.where || {},
					searchConditions.length > 0 ? { OR: searchConditions } : {},
				],
			};

			return await findMany({
				where,
				orderBy: options?.orderBy,
				take: options?.take,
			});
		},
		{ query, options },
	);
}

${
	relationshipMethods
		? `// ============================================================================
// RELATIONSHIP OPERATIONS - Dynamic based on schema
// ============================================================================
${relationshipMethods}`
		: ""
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Bulk create ${lowerPluralName} and return created records
 */
export async function bulkCreate(data: ${modelName}CreateInput[]): Promise<${modelName}[]> {
	return withErrorHandling(
		"bulkCreate",
		async () => {
			const results: ${modelName}[] = [];
			
			for (const item of data) {
				const created = await create({ data: item });
				results.push(created);
			}
			
			return results;
		},
		{ data },
	);
}

/**
 * Bulk upsert operations
 */
export async function bulkUpsert(operations: Array<{
	where: ${modelName}WhereUniqueInput;
	create: ${modelName}CreateInput;
	update: ${modelName}UpdateInput;
}>): Promise<${modelName}[]> {
	return withErrorHandling(
		"bulkUpsert",
		async () => {
			const results: ${modelName}[] = [];
			
			for (const op of operations) {
				const result = await upsert({
					where: op.where,
					create: op.create,
					update: op.update,
				});
				results.push(result);
			}
			
			return results;
		},
		{ operations },
	);
}
`;

	const filePath = join(modelDir, "actions.ts");
	await writeFile(filePath, template);
}
