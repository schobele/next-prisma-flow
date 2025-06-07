import { z } from "zod";
import { Response, type Request } from "../server";
import * as TodoActions from "./actions";
import { TodoCreateInputSchema, TodoUpdateInputSchema } from "./types";

// ============================================================================
// VALIDATION SCHEMAS - Request validation with Zod
// ============================================================================

/** Schema for validating URL parameters */
const ParamsSchema = z.object({
	id: z.string().min(1, "Valid ID is required"),
});

/** Schema for batch delete operations */
const BatchDeleteSchema = z.object({
	ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
});

/** Schema for batch create operations */
const BatchCreateSchema = z.object({
	items: z.array(TodoCreateInputSchema).min(1, "At least one item is required"),
});

/** Schema for batch update operations */
const BatchUpdateSchema = z.object({
	where: z.object({}).passthrough(), // TodoWhereInput
	data: TodoUpdateInputSchema,
});

/** Schema for relationship operations */
const SetRelationSchema = z.object({
	relatedId: z.string().min(1, "Valid related ID is required"),
});

const ManyToManySchema = z.object({
	relatedIds: z.array(z.string().min(1)).min(1, "At least one related ID is required"),
});

// ============================================================================
// UTILITY FUNCTIONS - Request handling helpers
// ============================================================================

/** Extract and validate URL parameters */
function validateParams(params: Record<string, string>) {
	return ParamsSchema.parse(params);
}

/** Parse and validate JSON body */
async function parseJsonBody<T>(request: Request, schema: z.ZodSchema<T>): Promise<T> {
	try {
		const body = await request.json();
		return schema.parse(body);
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw new Error(`Validation failed: ${error.errors.map((e) => e.message).join(", ")}`);
		}
		throw new Error("Invalid JSON body");
	}
}

/** Create standardized error response */
function createErrorResponse(message: string, status: number): Response {
	return Response.json(
		{
			success: false,
			message,
			meta: {
				timestamp: new Date().toISOString(),
			},
		},
		{ status },
	);
}

/** Create standardized success response */
function createSuccessResponse<T>(data: T, message?: string, status = 200): Response {
	return Response.json(
		{
			data,
			success: true,
			message,
			meta: {
				timestamp: new Date().toISOString(),
			},
		},
		{ status },
	);
}

/** Handle and format errors consistently */
function handleApiError(error: unknown, operation: string): Response {
	console.error(`API ${operation} error:`, error);

	if (error instanceof Error) {
		const message = error.message;

		// Handle validation errors
		if (message.includes("Validation failed")) {
			return createErrorResponse(message, 400);
		}

		// Handle not found errors
		if (message.includes("not found") || message.includes("NOT_FOUND")) {
			return createErrorResponse(message, 404);
		}

		// Handle duplicate errors
		if (message.includes("already exists") || message.includes("DUPLICATE")) {
			return createErrorResponse(message, 409);
		}

		// Generic error response
		return createErrorResponse(message, 500);
	}

	// Fallback for unknown errors
	return createErrorResponse("An unexpected error occurred", 500);
}

// ============================================================================
// COLLECTION ROUTES - /api/todos
// ============================================================================

/**
 * GET /api/todos - Find todos with optional filtering
 */
export async function GET(request: Request): Promise<Response> {
	try {
		const { searchParams } = request.nextUrl;

		// Build Prisma options from query parameters
		const options: any = {};

		// Handle pagination
		const page = Number(searchParams.get("page")) || 1;
		const limit = Math.min(Number(searchParams.get("limit")) || 10, 100);
		options.skip = (page - 1) * limit;
		options.take = limit;

		// Handle sorting
		const orderBy = searchParams.get("orderBy") || "createdAt";
		const orderDirection = searchParams.get("orderDirection") || "desc";
		options.orderBy = { [orderBy]: orderDirection };

		// Handle filtering
		const query = searchParams.get("query");
		if (query) {
			options.where = {
				OR: [
					{ title: { contains: query, mode: "insensitive" } },
					{ description: { contains: query, mode: "insensitive" } },
				],
			};
		}

		const todos = await TodoActions.findMany(options);

		return createSuccessResponse(todos, `Retrieved ${todos.length} todos`);
	} catch (error) {
		return handleApiError(error, "GET /api/todos");
	}
}

/**
 * POST /api/todos - Create new todo or batch create
 */
export async function POST(request: Request): Promise<Response> {
	try {
		const body = await request.json();

		// Check if this is a batch create operation
		if (Array.isArray(body) || (body && Array.isArray(body.items))) {
			// Batch create operation
			const { items } = BatchCreateSchema.parse(Array.isArray(body) ? { items: body } : body);
			const result = await TodoActions.createMany(items);

			return Response.json(
				{
					count: result.count,
					success: true,
					message: `Successfully created ${result.count} todos`,
					meta: {
						timestamp: new Date().toISOString(),
					},
				},
				{ status: 201 },
			);
		} else {
			// Single create operation
			const todoData = TodoCreateInputSchema.parse(body);
			const newTodo = await TodoActions.create(todoData);

			return createSuccessResponse(newTodo, "Todo created successfully", 201);
		}
	} catch (error) {
		return handleApiError(error, "POST /api/todos");
	}
}

/**
 * PATCH /api/todos - Batch update todos
 */
export async function PATCH(request: Request): Promise<Response> {
	try {
		const { where, data } = await parseJsonBody(request, BatchUpdateSchema);
		const result = await TodoActions.updateMany(where, data);

		return Response.json(
			{
				count: result.count,
				success: true,
				message: `Successfully updated ${result.count} todos`,
				meta: {
					timestamp: new Date().toISOString(),
				},
			},
			{ status: 200 },
		);
	} catch (error) {
		return handleApiError(error, "PATCH /api/todos");
	}
}

/**
 * DELETE /api/todos - Batch delete todos
 */
export async function DELETE(request: Request): Promise<Response> {
	try {
		const { ids } = await parseJsonBody(request, BatchDeleteSchema);
		const where = { id: { in: ids } };
		const result = await TodoActions.deleteMany(where);

		return Response.json(
			{
				count: result.count,
				success: true,
				message: `Successfully deleted ${result.count} todos`,
				meta: {
					timestamp: new Date().toISOString(),
				},
			},
			{ status: 200 },
		);
	} catch (error) {
		return handleApiError(error, "DELETE /api/todos");
	}
}

// ============================================================================
// INDIVIDUAL ROUTES - /api/todos/[id]
// ============================================================================

/**
 * GET /api/todos/[id] - Find specific todo
 */
export async function GETById(request: Request, context: { params: Record<string, string> }): Promise<Response> {
	try {
		const { id } = validateParams(context.params);
		const todo = await TodoActions.findUnique({ id });

		if (!todo) {
			return createErrorResponse("Todo not found", 404);
		}

		return createSuccessResponse(todo, "Todo retrieved successfully");
	} catch (error) {
		return handleApiError(error, "GET /api/todos/[id]");
	}
}

/**
 * PATCH /api/todos/[id] - Update specific todo
 */
export async function PATCHById(request: Request, context: { params: Record<string, string> }): Promise<Response> {
	try {
		const { id } = validateParams(context.params);
		const updateData = await parseJsonBody(request, TodoUpdateInputSchema);

		const updatedTodo = await TodoActions.update({ id }, updateData);

		return createSuccessResponse(updatedTodo, "Todo updated successfully");
	} catch (error) {
		return handleApiError(error, "PATCH /api/todos/[id]");
	}
}

/**
 * DELETE /api/todos/[id] - Delete specific todo
 */
export async function DELETEById(request: Request, context: { params: Record<string, string> }): Promise<Response> {
	try {
		const { id } = validateParams(context.params);
		await TodoActions.deleteRecord({ id });

		return Response.json(
			{
				success: true,
				message: "Todo deleted successfully",
				meta: {
					timestamp: new Date().toISOString(),
				},
			},
			{ status: 200 },
		);
	} catch (error) {
		return handleApiError(error, "DELETE /api/todos/[id]");
	}
}

// ============================================================================
// RELATIONSHIP ROUTES - /api/todos/[id]/relationships
// ============================================================================

/**
 * PATCH /api/todos/[id]/user - Set user relationship
 */
export async function PATCHUser(request: Request, context: { params: Record<string, string> }): Promise<Response> {
	try {
		const { id } = validateParams(context.params);
		const { relatedId } = await parseJsonBody(request, SetRelationSchema);

		const updatedTodo = await TodoActions.setUser({ id }, { id: relatedId });

		return createSuccessResponse(updatedTodo, "User relationship updated successfully");
	} catch (error) {
		return handleApiError(error, "PATCH /api/todos/[id]/user");
	}
}

/**
 * PATCH /api/todos/[id]/category - Set category relationship
 */
export async function PATCHCategory(request: Request, context: { params: Record<string, string> }): Promise<Response> {
	try {
		const { id } = validateParams(context.params);
		const { relatedId } = await parseJsonBody(request, SetRelationSchema);

		const updatedTodo = await TodoActions.setCategory({ id }, { id: relatedId });

		return createSuccessResponse(updatedTodo, "Category relationship updated successfully");
	} catch (error) {
		return handleApiError(error, "PATCH /api/todos/[id]/category");
	}
}

/**
 * DELETE /api/todos/[id]/category - Remove category relationship
 */
export async function DELETECategory(request: Request, context: { params: Record<string, string> }): Promise<Response> {
	try {
		const { id } = validateParams(context.params);

		const updatedTodo = await TodoActions.removeCategory({ id });

		return createSuccessResponse(updatedTodo, "Category relationship removed successfully");
	} catch (error) {
		return handleApiError(error, "DELETE /api/todos/[id]/category");
	}
}

/**
 * POST /api/todos/[id]/tags - Add tags to todo
 */
export async function POSTTags(request: Request, context: { params: Record<string, string> }): Promise<Response> {
	try {
		const { id } = validateParams(context.params);
		const { relatedIds } = await parseJsonBody(request, ManyToManySchema);

		const tagWheres = relatedIds.map((tagId) => ({ id: tagId }));
		const updatedTodo = await TodoActions.addTags({ id }, tagWheres);

		return createSuccessResponse(updatedTodo, "Tags added successfully");
	} catch (error) {
		return handleApiError(error, "POST /api/todos/[id]/tags");
	}
}

/**
 * DELETE /api/todos/[id]/tags - Remove tags from todo
 */
export async function DELETETags(request: Request, context: { params: Record<string, string> }): Promise<Response> {
	try {
		const { id } = validateParams(context.params);
		const { relatedIds } = await parseJsonBody(request, ManyToManySchema);

		const tagWheres = relatedIds.map((tagId) => ({ id: tagId }));
		const updatedTodo = await TodoActions.removeTags({ id }, tagWheres);

		return createSuccessResponse(updatedTodo, "Tags removed successfully");
	} catch (error) {
		return handleApiError(error, "DELETE /api/todos/[id]/tags");
	}
}

/**
 * PUT /api/todos/[id]/tags - Replace all tags for todo
 */
export async function PUTTags(request: Request, context: { params: Record<string, string> }): Promise<Response> {
	try {
		const { id } = validateParams(context.params);
		const { relatedIds } = await parseJsonBody(request, ManyToManySchema);

		const tagWheres = relatedIds.map((tagId) => ({ id: tagId }));
		const updatedTodo = await TodoActions.replaceTags({ id }, tagWheres);

		return createSuccessResponse(updatedTodo, "Tags replaced successfully");
	} catch (error) {
		return handleApiError(error, "PUT /api/todos/[id]/tags");
	}
}

// ============================================================================
// UTILITY ROUTES
// ============================================================================

/**
 * GET /api/todos/count - Get total count of todos
 */
export async function GETCount(request: Request): Promise<Response> {
	try {
		const { searchParams } = request.nextUrl;

		// Build where clause from query parameters
		const options: any = {};
		const query = searchParams.get("query");
		if (query) {
			options.where = {
				OR: [
					{ title: { contains: query, mode: "insensitive" } },
					{ description: { contains: query, mode: "insensitive" } },
				],
			};
		}

		const count = await TodoActions.count(options);

		return createSuccessResponse({ count }, `Found ${count} todos`);
	} catch (error) {
		return handleApiError(error, "GET /api/todos/count");
	}
}

/**
 * POST /api/todos/exists/[id] - Check if todo exists
 */
export async function POSTExists(request: Request, context: { params: Record<string, string> }): Promise<Response> {
	try {
		const { id } = validateParams(context.params);
		const exists = await TodoActions.exists({ id });

		return createSuccessResponse({ exists }, exists ? "Todo exists" : "Todo does not exist");
	} catch (error) {
		return handleApiError(error, "POST /api/todos/exists/[id]");
	}
}
