"use server";

import { invalidateTag } from "../cache";
import { prisma, type Prisma } from "../prisma";
import {
	TodoCreateInputSchema,
	TodoCreateManyInputSchema,
	todoSelect,
	TodoUpdateInputSchema,
	type CategoryWhereUniqueInput,
	type TagWhereUniqueInput,
	type Todo,
	type TodoCreateInput,
	type TodoCreateManyInput,
	type TodoUpdateInput,
	type TodoWhereInput,
	type TodoWhereUniqueInput,
	type UserWhereUniqueInput,
} from "./types";

// ============================================================================
// CACHE MANAGEMENT - Schema-driven cache invalidation
// ============================================================================

/** Model name for cache tagging */
const MODEL_NAME = "Todo" as const;

/** Generate cache tags based on model data and relationships */
function generateCacheTags(data: Partial<Todo>): string[] {
	const tags: string[] = [MODEL_NAME];

	// Add ID-specific tag if available
	if (data.id) {
		tags.push(`${MODEL_NAME}:${data.id}`);
	}

	// Add relationship-specific tags based on foreign keys
	if (data.userId) {
		tags.push(`${MODEL_NAME}:user:${data.userId}`);
	}

	if (data.categoryId) {
		tags.push(`${MODEL_NAME}:category:${data.categoryId}`);
	}

	// Note: Many-to-many relationships (like tags) are handled through
	// the main record invalidation since tag connections affect the todo's state

	return tags;
}

/** Invalidate cache tags for a todo */
function invalidateCache(data: Partial<Todo>): void {
	const tags = generateCacheTags(data);
	for (const tag of tags) {
		invalidateTag(tag);
	}
}

// ============================================================================
// ERROR HANDLING - Streamlined error management utilities
// ============================================================================

/** Standardized error for actions */
class ActionError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly statusCode: number = 400,
		public readonly context?: Record<string, any>,
	) {
		super(message);
		this.name = "ActionError";
	}
}

/** Wrapper for consistent error handling and validation */
async function withErrorHandling<T>(
	operation: string,
	fn: () => Promise<T>,
	context?: Record<string, any>,
): Promise<T> {
	try {
		return await fn();
	} catch (error) {
		console.error(`${MODEL_NAME} ${operation} error:`, error, context);

		if (error instanceof ActionError) {
			throw error;
		}

		// Handle Prisma errors
		if (typeof error === "object" && error !== null && "code" in error) {
			const prismaError = error as { code: string; message: string };

			switch (prismaError.code) {
				case "P2002":
					throw new ActionError("Unique constraint violation", "DUPLICATE", 409, context);
				case "P2025":
					throw new ActionError("Record not found", "NOT_FOUND", 404, context);
				case "P2003":
					throw new ActionError("Foreign key constraint violation", "INVALID_REFERENCE", 400, context);
				default:
					throw new ActionError(`Database error: ${prismaError.message}`, "DATABASE_ERROR", 500, context);
			}
		}

		// Handle validation errors
		if (error instanceof Error && error.message.includes("validation")) {
			throw new ActionError(`Validation failed: ${error.message}`, "VALIDATION_ERROR", 400, context);
		}

		// Fallback for unknown errors
		const message = error instanceof Error ? error.message : "Unknown error occurred";
		throw new ActionError(message, "UNKNOWN_ERROR", 500, context);
	}
}

// ============================================================================
// READ OPERATIONS - Generic operations with Prisma options support
// ============================================================================

/**
 * Find many todos with flexible Prisma options
 *
 * @param options - Complete Prisma findMany options
 * @returns Promise resolving to array of todos
 */
export async function findMany(
	options?: Omit<Prisma.TodoFindManyArgs, "select"> & { select?: never },
): Promise<Todo[]> {
	return withErrorHandling(
		"findMany",
		async () => {
			const todos = await prisma.todo.findMany({
				...options,
				select: todoSelect,
			});

			return todos as Todo[];
		},
		{ options },
	);
}

/**
 * Find a single todo by unique selector
 *
 * @param where - Unique selector for the todo
 * @param options - Additional Prisma options
 * @returns Promise resolving to todo or null if not found
 */
export async function findUnique(
	where: TodoWhereUniqueInput,
	options?: Omit<Prisma.TodoFindUniqueArgs, "where" | "select"> & { select?: never },
): Promise<Todo | null> {
	return withErrorHandling(
		"findUnique",
		async () => {
			const todo = await prisma.todo.findUnique({
				where,
				...options,
				select: todoSelect,
			});

			return todo as Todo | null;
		},
		{ where, options },
	);
}

/**
 * Find first todo matching criteria
 *
 * @param options - Complete Prisma findFirst options
 * @returns Promise resolving to todo or null if not found
 */
export async function findFirst(
	options?: Omit<Prisma.TodoFindFirstArgs, "select"> & { select?: never },
): Promise<Todo | null> {
	return withErrorHandling(
		"findFirst",
		async () => {
			const todo = await prisma.todo.findFirst({
				...options,
				select: todoSelect,
			});

			return todo as Todo | null;
		},
		{ options },
	);
}

/**
 * Count todos matching criteria
 *
 * @param options - Prisma count options
 * @returns Promise resolving to count of todos
 */
export async function count(options?: Prisma.TodoCountArgs): Promise<number> {
	return withErrorHandling(
		"count",
		async () => {
			return await prisma.todo.count(options);
		},
		{ options },
	);
}

/**
 * Check if a todo exists with given criteria
 *
 * @param where - Unique selector for the todo
 * @returns Promise resolving to boolean indicating existence
 */
export async function exists(where: TodoWhereUniqueInput): Promise<boolean> {
	return withErrorHandling(
		"exists",
		async () => {
			const todo = await prisma.todo.findUnique({
				where,
				select: { id: true },
			});

			return !!todo;
		},
		{ where },
	);
}

// ============================================================================
// CREATE OPERATIONS - Schema-validated creation with flexible options
// ============================================================================

/**
 * Create a new todo with validation and cache invalidation
 *
 * @param data - Todo creation data
 * @param options - Additional Prisma create options
 * @returns Promise resolving to created todo
 */
export async function create(
	data: TodoCreateInput,
	options?: Omit<Prisma.TodoCreateArgs, "data" | "select"> & { select?: never },
): Promise<Todo> {
	return withErrorHandling(
		"create",
		async () => {
			// Validate input with Zod schema
			const validatedData = TodoCreateInputSchema.parse(data);

			const newTodo = await prisma.todo.create({
				data: validatedData,
				...options,
				select: todoSelect,
			});

			// Invalidate relevant caches
			invalidateCache(newTodo);

			return newTodo as Todo;
		},
		{ data, options },
	);
}

/**
 * Create multiple todos
 *
 * @param data - Array of todo creation data
 * @param options - Additional Prisma createMany options
 * @returns Promise resolving to batch creation result
 */
export async function createMany(
	data: TodoCreateManyInput[],
	options?: Omit<Prisma.TodoCreateManyArgs, "data">,
): Promise<{ count: number }> {
	return withErrorHandling(
		"createMany",
		async () => {
			if (!Array.isArray(data) || data.length === 0) {
				throw new ActionError("At least one item is required", "INVALID_INPUT", 400);
			}

			// Validate all inputs
			const validatedData = data.map((item, index) => {
				try {
					return TodoCreateManyInputSchema.parse(item);
				} catch (error) {
					throw new ActionError(`Validation failed for item at index ${index}`, "VALIDATION_ERROR", 400, {
						index,
						item,
						error,
					});
				}
			});

			const result = await prisma.todo.createMany({
				data: validatedData,
				...options,
			});

			// Invalidate all model cache since we don't have individual IDs
			invalidateTag(MODEL_NAME);

			return result;
		},
		{ data, options },
	);
}

// ============================================================================
// UPDATE OPERATIONS - Generic updates with flexible selectors
// ============================================================================

/**
 * Update a todo by unique selector with validation and cache management
 *
 * @param where - Unique selector for the todo to update
 * @param data - Todo update data
 * @param options - Additional Prisma update options
 * @returns Promise resolving to updated todo
 */
export async function update(
	where: TodoWhereUniqueInput,
	data: TodoUpdateInput,
	options?: Omit<Prisma.TodoUpdateArgs, "where" | "data" | "select"> & { select?: never },
): Promise<Todo> {
	return withErrorHandling(
		"update",
		async () => {
			// Validate input with Zod schema
			const validatedData = TodoUpdateInputSchema.parse(data);

			// Get existing todo for cache invalidation
			const existingTodo = await prisma.todo.findUnique({
				where,
				select: { id: true, userId: true, categoryId: true },
			});

			if (!existingTodo) {
				throw new ActionError("Record not found", "NOT_FOUND", 404);
			}

			const updatedTodo = await prisma.todo.update({
				where,
				data: validatedData,
				...options,
				select: todoSelect,
			});

			// Invalidate caches for both old and new states
			invalidateCache(existingTodo);
			invalidateCache(updatedTodo);

			return updatedTodo as Todo;
		},
		{ where, data, options },
	);
}

/**
 * Update multiple todos with the same data
 *
 * @param where - Where clause to match todos
 * @param data - Todo update data to apply to all matched records
 * @param options - Additional Prisma updateMany options
 * @returns Promise resolving to update count
 */
export async function updateMany(
	where: TodoWhereInput,
	data: TodoUpdateInput,
	options?: Omit<Prisma.TodoUpdateManyArgs, "where" | "data">,
): Promise<{ count: number }> {
	return withErrorHandling(
		"updateMany",
		async () => {
			// Validate input
			const validatedData = TodoUpdateInputSchema.parse(data);

			const result = await prisma.todo.updateMany({
				where,
				data: validatedData,
				...options,
			});

			// Invalidate all model cache since we don't know specific IDs
			invalidateTag(MODEL_NAME);

			return result;
		},
		{ where, data, options },
	);
}

// ============================================================================
// DELETE OPERATIONS - Generic deletion with flexible selectors
// ============================================================================

/**
 * Delete a todo by unique selector
 *
 * @param where - Unique selector for the todo to delete
 * @param options - Additional Prisma delete options
 * @returns Promise resolving to deleted todo
 */
export async function deleteRecord(
	where: TodoWhereUniqueInput,
	options?: Omit<Prisma.TodoDeleteArgs, "where" | "select"> & { select?: never },
): Promise<Todo> {
	return withErrorHandling(
		"delete",
		async () => {
			// Get the todo first for cache invalidation
			const todoToDelete = await prisma.todo.findUnique({
				where,
				select: { id: true, userId: true, categoryId: true },
			});

			if (!todoToDelete) {
				throw new ActionError("Record not found", "NOT_FOUND", 404);
			}

			const deletedTodo = await prisma.todo.delete({
				where,
				...options,
				select: todoSelect,
			});

			// Invalidate relevant caches
			invalidateCache(todoToDelete);

			return deletedTodo as Todo;
		},
		{ where, options },
	);
}

/**
 * Delete multiple todos matching criteria
 *
 * @param where - Where clause to match todos for deletion
 * @param options - Additional Prisma deleteMany options
 * @returns Promise resolving to deletion count
 */
export async function deleteMany(
	where: TodoWhereInput,
	options?: Omit<Prisma.TodoDeleteManyArgs, "where">,
): Promise<{ count: number }> {
	return withErrorHandling(
		"deleteMany",
		async () => {
			// Get todos first for cache invalidation
			const todosToDelete = await prisma.todo.findMany({
				where,
				select: { id: true, userId: true, categoryId: true },
			});

			const result = await prisma.todo.deleteMany({
				where,
				...options,
			});

			// Invalidate caches for all deleted todos
			invalidateTag(MODEL_NAME);
			for (const todo of todosToDelete) {
				invalidateCache(todo);
			}

			return result;
		},
		{ where, options },
	);
}

// ============================================================================
// RELATIONSHIP OPERATIONS - Schema-driven relationship management
// ============================================================================

// ============================================================================
// REQUIRED FOREIGN KEY RELATIONSHIPS - Can only be changed, not removed
// ============================================================================

/**
 * Change the user for a todo (required relationship)
 *
 * @param where - Unique selector for the todo
 * @param userWhere - Unique selector for the user to associate
 * @param options - Additional Prisma update options
 * @returns Promise resolving to updated todo
 */
export async function setUser(
	where: TodoWhereUniqueInput,
	userWhere: UserWhereUniqueInput,
	options?: Omit<Prisma.TodoUpdateArgs, "where" | "data" | "select"> & { select?: never },
): Promise<Todo> {
	return withErrorHandling(
		"setUser",
		async () => {
			// First, get the user to extract the ID
			const user = await prisma.user.findUnique({ where: userWhere, select: { id: true } });
			if (!user) {
				throw new ActionError("User not found", "NOT_FOUND", 404);
			}

			const updatedTodo = await prisma.todo.update({
				where,
				data: { userId: user.id },
				...options,
				select: todoSelect,
			});

			invalidateCache(updatedTodo);
			return updatedTodo as Todo;
		},
		{ where, userWhere, options },
	);
}

// ============================================================================
// OPTIONAL FOREIGN KEY RELATIONSHIPS - Can be set or removed
// ============================================================================

/**
 * Set the category relationship for a todo (optional relationship)
 *
 * @param where - Unique selector for the todo
 * @param categoryWhere - Unique selector for the category to associate
 * @param options - Additional Prisma update options
 * @returns Promise resolving to updated todo
 */
export async function setCategory(
	where: TodoWhereUniqueInput,
	categoryWhere: CategoryWhereUniqueInput,
	options?: Omit<Prisma.TodoUpdateArgs, "where" | "data" | "select"> & { select?: never },
): Promise<Todo> {
	return withErrorHandling(
		"setCategory",
		async () => {
			// First, get the category to extract the ID
			const category = await prisma.category.findUnique({ where: categoryWhere, select: { id: true } });
			if (!category) {
				throw new ActionError("Category not found", "NOT_FOUND", 404);
			}

			const updatedTodo = await prisma.todo.update({
				where,
				data: { categoryId: category.id },
				...options,
				select: todoSelect,
			});

			invalidateCache(updatedTodo);
			return updatedTodo as Todo;
		},
		{ where, categoryWhere, options },
	);
}

/**
 * Remove the category relationship from a todo (optional relationship)
 *
 * @param where - Unique selector for the todo
 * @param options - Additional Prisma update options
 * @returns Promise resolving to updated todo
 */
export async function removeCategory(
	where: TodoWhereUniqueInput,
	options?: Omit<Prisma.TodoUpdateArgs, "where" | "data" | "select"> & { select?: never },
): Promise<Todo> {
	return withErrorHandling(
		"removeCategory",
		async () => {
			const updatedTodo = await prisma.todo.update({
				where,
				data: { categoryId: null },
				...options,
				select: todoSelect,
			});

			invalidateCache(updatedTodo);
			return updatedTodo as Todo;
		},
		{ where, options },
	);
}

// ============================================================================
// MANY-TO-MANY RELATIONSHIPS - Connect/disconnect operations
// ============================================================================

/**
 * Add tags to a todo (many-to-many relationship)
 *
 * @param where - Unique selector for the todo
 * @param tagWheres - Array of unique selectors for tags to connect
 * @param options - Additional Prisma update options
 * @returns Promise resolving to updated todo
 */
export async function addTags(
	where: TodoWhereUniqueInput,
	tagWheres: TagWhereUniqueInput[],
	options?: Omit<Prisma.TodoUpdateArgs, "where" | "data" | "select"> & { select?: never },
): Promise<Todo> {
	return withErrorHandling(
		"addTags",
		async () => {
			const updatedTodo = await prisma.todo.update({
				where,
				data: {
					tags: {
						connect: tagWheres,
					},
				},
				...options,
				select: todoSelect,
			});

			invalidateCache(updatedTodo);
			return updatedTodo as Todo;
		},
		{ where, tagWheres, options },
	);
}

/**
 * Remove specific tags from a todo (many-to-many relationship)
 *
 * @param where - Unique selector for the todo
 * @param tagWheres - Array of unique selectors for tags to disconnect
 * @param options - Additional Prisma update options
 * @returns Promise resolving to updated todo
 */
export async function removeTags(
	where: TodoWhereUniqueInput,
	tagWheres: TagWhereUniqueInput[],
	options?: Omit<Prisma.TodoUpdateArgs, "where" | "data" | "select"> & { select?: never },
): Promise<Todo> {
	return withErrorHandling(
		"removeTags",
		async () => {
			const updatedTodo = await prisma.todo.update({
				where,
				data: {
					tags: {
						disconnect: tagWheres,
					},
				},
				...options,
				select: todoSelect,
			});

			invalidateCache(updatedTodo);
			return updatedTodo as Todo;
		},
		{ where, tagWheres, options },
	);
}

/**
 * Replace all tags for a todo (many-to-many relationship)
 *
 * @param where - Unique selector for the todo
 * @param tagWheres - Array of unique selectors for tags to set as the complete list
 * @param options - Additional Prisma update options
 * @returns Promise resolving to updated todo
 */
export async function replaceTags(
	where: TodoWhereUniqueInput,
	tagWheres: TagWhereUniqueInput[],
	options?: Omit<Prisma.TodoUpdateArgs, "where" | "data" | "select"> & { select?: never },
): Promise<Todo> {
	return withErrorHandling(
		"replaceTags",
		async () => {
			const updatedTodo = await prisma.todo.update({
				where,
				data: {
					tags: {
						set: tagWheres,
					},
				},
				...options,
				select: todoSelect,
			});

			invalidateCache(updatedTodo);
			return updatedTodo as Todo;
		},
		{ where, tagWheres, options },
	);
}

/**
 * Remove all tags from a todo (many-to-many relationship)
 *
 * @param where - Unique selector for the todo
 * @param options - Additional Prisma update options
 * @returns Promise resolving to updated todo
 */
export async function clearTags(
	where: TodoWhereUniqueInput,
	options?: Omit<Prisma.TodoUpdateArgs, "where" | "data" | "select"> & { select?: never },
): Promise<Todo> {
	return withErrorHandling(
		"clearTags",
		async () => {
			const updatedTodo = await prisma.todo.update({
				where,
				data: {
					tags: {
						set: [],
					},
				},
				...options,
				select: todoSelect,
			});

			invalidateCache(updatedTodo);
			return updatedTodo as Todo;
		},
		{ where, options },
	);
}

// ============================================================================
// UPSERT OPERATIONS - Create or update operations
// ============================================================================

/**
 * Create a todo or update it if it already exists
 *
 * @param where - Unique selector for the todo
 * @param data - Todo creation data
 * @param updateData - Todo update data (defaults to creation data)
 * @param options - Additional Prisma upsert options
 * @returns Promise resolving to upserted todo
 */
export async function upsert(
	where: TodoWhereUniqueInput,
	data: TodoCreateInput,
	updateData?: TodoUpdateInput,
	options?: Omit<Prisma.TodoUpsertArgs, "where" | "create" | "update" | "select"> & { select?: never },
): Promise<Todo> {
	return withErrorHandling(
		"upsert",
		async () => {
			// Validate inputs with Zod schemas
			const validatedCreateData = TodoCreateInputSchema.parse(data);
			const validatedUpdateData = updateData ? TodoUpdateInputSchema.parse(updateData) : validatedCreateData;

			const upsertedTodo = await prisma.todo.upsert({
				where,
				create: validatedCreateData,
				update: validatedUpdateData,
				...options,
				select: todoSelect,
			});

			// Invalidate relevant caches
			invalidateCache(upsertedTodo);

			return upsertedTodo as Todo;
		},
		{ where, data, updateData, options },
	);
}

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

/**
 * This module provides comprehensive, schema-driven server actions for Todo management:
 *
 * READ OPERATIONS:
 * - findMany() - Flexible query with full Prisma options support
 * - findUnique() - Find single record by unique selector
 * - findFirst() - Find first record matching criteria
 * - count() - Count records with filtering
 * - exists() - Check record existence by unique selector
 *
 * CREATE OPERATIONS:
 * - create() - Create single record with validation
 * - createMany() - Batch create
 *
 * UPDATE OPERATIONS:
 * - update() - Update single record by unique selector
 * - updateMany() - Batch update with where clause
 *
 * DELETE OPERATIONS:
 * - deleteRecord() - Delete single record by unique selector
 * - deleteMany() - Batch delete with where clause
 *
 * UPSERT OPERATIONS:
 * - upsert() - Create or update with flexible data
 *
 * RELATIONSHIP OPERATIONS (schema-driven generation):
 * - setUser() - Change required user relationship
 * - setCategory() / removeCategory() - Manage optional category relationship
 * - addTags() / removeTags() / replaceTags() / clearTags() - Manage many-to-many tag relationships
 *
 * KEY FEATURES:
 * - Generic operations using Prisma-generated types
 * - Flexible options support for advanced queries
 * - Comprehensive input validation with auto-generated Zod schemas
 * - Schema-driven cache invalidation
 * - Consistent error handling with utility wrappers
 * - Full type safety throughout
 * - Zero domain-specific assumptions
 * - Easily templatable for code generation
 *
 * All operations are designed to be automatically generatable from
 * Prisma schema analysis without requiring domain knowledge.
 */
