import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";

export type ActionResult<T> =
	| { success: true; data: T }
	| { success: false; error: { message: string; code: string; details?: any } };

export const handleAction = async <T>(operation: () => Promise<T>): Promise<ActionResult<T>> => {
	try {
		const data = await operation();
		return {
			success: true,
			data,
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: {
					message: error.message,
					code: "VALIDATION_ERROR",
					details: error.errors,
				},
			};
		} else if (error instanceof PrismaClientKnownRequestError) {
			return {
				success: false,
				error: {
					message: error.message,
					code: error.code,
					details: error.meta,
				},
			};
		}
		return {
			success: false,
			error: { message: "Unknown error", code: "UNKNOWN_ERROR" },
		};
	}
};

// Schema types for validation
export type ModelSchemas = {
	whereUnique: z.ZodSchema<any>;
	where: z.ZodSchema<any>;
	createInput: z.ZodSchema<any>;
	createManyInput: z.ZodSchema<any>;
	updateInput: z.ZodSchema<any>;
	findFirstArgs?: z.ZodSchema<any>;
	findManyArgs?: z.ZodSchema<any>;
};

// Generic CRUD operations factory
export function createModelActions<T, S extends ModelSchemas, Select>(model: any, schemas: S, select: Select) {
	return {
		findUnique: async (filter: z.infer<S["whereUnique"]>): Promise<ActionResult<T | null>> => {
			return handleAction(async () => {
				const parsed = schemas.whereUnique.parse(filter);
				const result = await model.findUniqueOrThrow({
					where: parsed,
					select,
				});
				return result as T | null;
			});
		},

		findMany: async (
			filter: z.infer<S["where"]>,
			options?: S["findManyArgs"] extends z.ZodSchema ? z.infer<S["findManyArgs"]> : any,
		): Promise<ActionResult<T[]>> => {
			return handleAction(async () => {
				const parsed = schemas.where.parse(filter);
				const result = await model.findMany({
					...options,
					where: parsed,
					select,
				});
				return result as T[];
			});
		},

		findFirst: async (
			filter: z.infer<S["where"]>,
			options?: S["findFirstArgs"] extends z.ZodSchema ? z.infer<S["findFirstArgs"]> : any,
		): Promise<ActionResult<T | null>> => {
			return handleAction(async () => {
				const parsed = schemas.where.parse(filter);
				const result = await model.findFirst({
					...options,
					where: parsed,
					select,
				});
				return result as T | null;
			});
		},

		create: async (data: z.infer<S["createInput"]>): Promise<ActionResult<T>> => {
			return handleAction(async () => {
				const parsed = schemas.createInput.parse(data);
				const result = await model.create({
					data: parsed,
					select,
				});
				return result as T;
			});
		},

		createMany: async (data: z.infer<S["createManyInput"]>[]): Promise<ActionResult<{ count: number }>> => {
			return handleAction(async () => {
				const parsed = data.map((item) => schemas.createManyInput.parse(item));
				const result = await model.createMany({
					data: parsed,
				});
				return result;
			});
		},

		update: async (where: z.infer<S["whereUnique"]>, data: z.infer<S["updateInput"]>): Promise<ActionResult<T>> => {
			return handleAction(async () => {
				const parsedWhere = schemas.whereUnique.parse(where);
				const parsedData = schemas.updateInput.parse(data);
				const result = await model.update({
					where: parsedWhere,
					data: parsedData,
					select,
				});
				return result as T;
			});
		},

		updateMany: async (
			where: z.infer<S["where"]>,
			data: z.infer<S["updateInput"]>,
		): Promise<ActionResult<{ count: number }>> => {
			return handleAction(async () => {
				const parsedWhere = schemas.where.parse(where);
				const parsedData = schemas.updateInput.parse(data);
				const result = await model.updateMany({
					where: parsedWhere,
					data: parsedData,
				});
				return result;
			});
		},

		upsert: async (
			where: z.infer<S["whereUnique"]>,
			create: z.infer<S["createInput"]>,
			update: z.infer<S["updateInput"]>,
		): Promise<ActionResult<T>> => {
			return handleAction(async () => {
				const parsedWhere = schemas.whereUnique.parse(where);
				const parsedCreate = schemas.createInput.parse(create);
				const parsedUpdate = schemas.updateInput.parse(update);
				const result = await model.upsert({
					where: parsedWhere,
					create: parsedCreate,
					update: parsedUpdate,
					select,
				});
				return result as T;
			});
		},

		remove: async (where: z.infer<S["whereUnique"]>): Promise<ActionResult<T>> => {
			return handleAction(async () => {
				const parsed = schemas.whereUnique.parse(where);
				const result = await model.delete({
					where: parsed,
					select,
				});
				return result as T;
			});
		},

		removeMany: async (where: z.infer<S["where"]>): Promise<ActionResult<{ count: number }>> => {
			return handleAction(async () => {
				const parsed = schemas.where.parse(where);
				const result = await model.deleteMany({
					where: parsed,
				});
				return result;
			});
		},

		count: async (where?: z.infer<S["where"]>): Promise<ActionResult<number>> => {
			return handleAction(async () => {
				const parsed = where ? schemas.where.parse(where) : undefined;
				const result = await model.count({
					where: parsed,
				});
				return result;
			});
		},
	};
}
