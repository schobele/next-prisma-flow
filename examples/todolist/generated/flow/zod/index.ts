import { z } from "zod";
import type { Prisma } from "@prisma/client";

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(["Serializable"]);

export const UserScalarFieldEnumSchema = z.enum(["id", "email", "name", "avatar", "createdAt", "updatedAt"]);

export const CategoryScalarFieldEnumSchema = z.enum(["id", "name", "color", "createdAt"]);

export const TodoScalarFieldEnumSchema = z.enum([
	"id",
	"title",
	"description",
	"status",
	"priority",
	"dueDate",
	"completedAt",
	"createdAt",
	"updatedAt",
	"userId",
	"categoryId",
]);

export const SortOrderSchema = z.enum(["asc", "desc"]);

export const NullsOrderSchema = z.enum(["first", "last"]);
/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
	id: z.string(),
	email: z.string(),
	name: z.string(),
	avatar: z.string().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;

/////////////////////////////////////////
// CATEGORY SCHEMA
/////////////////////////////////////////

export const CategorySchema = z.object({
	id: z.string(),
	name: z.string(),
	color: z.string(),
	createdAt: z.coerce.date(),
});

export type Category = z.infer<typeof CategorySchema>;

/////////////////////////////////////////
// TODO SCHEMA
/////////////////////////////////////////

export const TodoSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	status: z.string(),
	priority: z.string(),
	dueDate: z.coerce.date().nullable(),
	completedAt: z.coerce.date().nullable(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	userId: z.string().nullable(),
	categoryId: z.string().nullable(),
});

export type Todo = z.infer<typeof TodoSchema>;

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// USER
//------------------------------------------------------

export const UserIncludeSchema: z.ZodType<Prisma.UserInclude> = z
	.object({
		todos: z.union([z.boolean(), z.lazy(() => TodoFindManyArgsSchema)]).optional(),
		_count: z.union([z.boolean(), z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
	})
	.strict();

export const UserArgsSchema: z.ZodType<Prisma.UserDefaultArgs> = z
	.object({
		select: z.lazy(() => UserSelectSchema).optional(),
		include: z.lazy(() => UserIncludeSchema).optional(),
	})
	.strict();

export const UserCountOutputTypeArgsSchema: z.ZodType<Prisma.UserCountOutputTypeDefaultArgs> = z
	.object({
		select: z.lazy(() => UserCountOutputTypeSelectSchema).nullish(),
	})
	.strict();

export const UserCountOutputTypeSelectSchema: z.ZodType<Prisma.UserCountOutputTypeSelect> = z
	.object({
		todos: z.boolean().optional(),
	})
	.strict();

export const UserSelectSchema: z.ZodType<Prisma.UserSelect> = z
	.object({
		id: z.boolean().optional(),
		email: z.boolean().optional(),
		name: z.boolean().optional(),
		avatar: z.boolean().optional(),
		createdAt: z.boolean().optional(),
		updatedAt: z.boolean().optional(),
		todos: z.union([z.boolean(), z.lazy(() => TodoFindManyArgsSchema)]).optional(),
		_count: z.union([z.boolean(), z.lazy(() => UserCountOutputTypeArgsSchema)]).optional(),
	})
	.strict();

// CATEGORY
//------------------------------------------------------

export const CategoryIncludeSchema: z.ZodType<Prisma.CategoryInclude> = z
	.object({
		todos: z.union([z.boolean(), z.lazy(() => TodoFindManyArgsSchema)]).optional(),
		_count: z.union([z.boolean(), z.lazy(() => CategoryCountOutputTypeArgsSchema)]).optional(),
	})
	.strict();

export const CategoryArgsSchema: z.ZodType<Prisma.CategoryDefaultArgs> = z
	.object({
		select: z.lazy(() => CategorySelectSchema).optional(),
		include: z.lazy(() => CategoryIncludeSchema).optional(),
	})
	.strict();

export const CategoryCountOutputTypeArgsSchema: z.ZodType<Prisma.CategoryCountOutputTypeDefaultArgs> = z
	.object({
		select: z.lazy(() => CategoryCountOutputTypeSelectSchema).nullish(),
	})
	.strict();

export const CategoryCountOutputTypeSelectSchema: z.ZodType<Prisma.CategoryCountOutputTypeSelect> = z
	.object({
		todos: z.boolean().optional(),
	})
	.strict();

export const CategorySelectSchema: z.ZodType<Prisma.CategorySelect> = z
	.object({
		id: z.boolean().optional(),
		name: z.boolean().optional(),
		color: z.boolean().optional(),
		createdAt: z.boolean().optional(),
		todos: z.union([z.boolean(), z.lazy(() => TodoFindManyArgsSchema)]).optional(),
		_count: z.union([z.boolean(), z.lazy(() => CategoryCountOutputTypeArgsSchema)]).optional(),
	})
	.strict();

// TODO
//------------------------------------------------------

export const TodoIncludeSchema: z.ZodType<Prisma.TodoInclude> = z
	.object({
		user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
		category: z.union([z.boolean(), z.lazy(() => CategoryArgsSchema)]).optional(),
	})
	.strict();

export const TodoArgsSchema: z.ZodType<Prisma.TodoDefaultArgs> = z
	.object({
		select: z.lazy(() => TodoSelectSchema).optional(),
		include: z.lazy(() => TodoIncludeSchema).optional(),
	})
	.strict();

export const TodoSelectSchema: z.ZodType<Prisma.TodoSelect> = z
	.object({
		id: z.boolean().optional(),
		title: z.boolean().optional(),
		description: z.boolean().optional(),
		status: z.boolean().optional(),
		priority: z.boolean().optional(),
		dueDate: z.boolean().optional(),
		completedAt: z.boolean().optional(),
		createdAt: z.boolean().optional(),
		updatedAt: z.boolean().optional(),
		userId: z.boolean().optional(),
		categoryId: z.boolean().optional(),
		user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
		category: z.union([z.boolean(), z.lazy(() => CategoryArgsSchema)]).optional(),
	})
	.strict();

/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const UserWhereInputSchema: z.ZodType<Prisma.UserWhereInput> = z
	.object({
		AND: z.union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()]).optional(),
		OR: z
			.lazy(() => UserWhereInputSchema)
			.array()
			.optional(),
		NOT: z.union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()]).optional(),
		id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		email: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		avatar: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
		updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
		todos: z.lazy(() => TodoListRelationFilterSchema).optional(),
	})
	.strict();

export const UserOrderByWithRelationInputSchema: z.ZodType<Prisma.UserOrderByWithRelationInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		email: z.lazy(() => SortOrderSchema).optional(),
		name: z.lazy(() => SortOrderSchema).optional(),
		avatar: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
		createdAt: z.lazy(() => SortOrderSchema).optional(),
		updatedAt: z.lazy(() => SortOrderSchema).optional(),
		todos: z.lazy(() => TodoOrderByRelationAggregateInputSchema).optional(),
	})
	.strict();

export const UserWhereUniqueInputSchema: z.ZodType<Prisma.UserWhereUniqueInput> = z
	.union([
		z.object({
			id: z.string(),
			email: z.string(),
		}),
		z.object({
			id: z.string(),
		}),
		z.object({
			email: z.string(),
		}),
	])
	.and(
		z
			.object({
				id: z.string().optional(),
				email: z.string().optional(),
				AND: z.union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()]).optional(),
				OR: z
					.lazy(() => UserWhereInputSchema)
					.array()
					.optional(),
				NOT: z.union([z.lazy(() => UserWhereInputSchema), z.lazy(() => UserWhereInputSchema).array()]).optional(),
				name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				avatar: z
					.union([z.lazy(() => StringNullableFilterSchema), z.string()])
					.optional()
					.nullable(),
				createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
				updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
				todos: z.lazy(() => TodoListRelationFilterSchema).optional(),
			})
			.strict(),
	);

export const UserOrderByWithAggregationInputSchema: z.ZodType<Prisma.UserOrderByWithAggregationInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		email: z.lazy(() => SortOrderSchema).optional(),
		name: z.lazy(() => SortOrderSchema).optional(),
		avatar: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
		createdAt: z.lazy(() => SortOrderSchema).optional(),
		updatedAt: z.lazy(() => SortOrderSchema).optional(),
		_count: z.lazy(() => UserCountOrderByAggregateInputSchema).optional(),
		_max: z.lazy(() => UserMaxOrderByAggregateInputSchema).optional(),
		_min: z.lazy(() => UserMinOrderByAggregateInputSchema).optional(),
	})
	.strict();

export const UserScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UserScalarWhereWithAggregatesInput> = z
	.object({
		AND: z
			.union([
				z.lazy(() => UserScalarWhereWithAggregatesInputSchema),
				z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array(),
			])
			.optional(),
		OR: z
			.lazy(() => UserScalarWhereWithAggregatesInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([
				z.lazy(() => UserScalarWhereWithAggregatesInputSchema),
				z.lazy(() => UserScalarWhereWithAggregatesInputSchema).array(),
			])
			.optional(),
		id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		email: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		name: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		avatar: z
			.union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
			.optional()
			.nullable(),
		createdAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
		updatedAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
	})
	.strict();

export const CategoryWhereInputSchema: z.ZodType<Prisma.CategoryWhereInput> = z
	.object({
		AND: z.union([z.lazy(() => CategoryWhereInputSchema), z.lazy(() => CategoryWhereInputSchema).array()]).optional(),
		OR: z
			.lazy(() => CategoryWhereInputSchema)
			.array()
			.optional(),
		NOT: z.union([z.lazy(() => CategoryWhereInputSchema), z.lazy(() => CategoryWhereInputSchema).array()]).optional(),
		id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		color: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
		todos: z.lazy(() => TodoListRelationFilterSchema).optional(),
	})
	.strict();

export const CategoryOrderByWithRelationInputSchema: z.ZodType<Prisma.CategoryOrderByWithRelationInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		name: z.lazy(() => SortOrderSchema).optional(),
		color: z.lazy(() => SortOrderSchema).optional(),
		createdAt: z.lazy(() => SortOrderSchema).optional(),
		todos: z.lazy(() => TodoOrderByRelationAggregateInputSchema).optional(),
	})
	.strict();

export const CategoryWhereUniqueInputSchema: z.ZodType<Prisma.CategoryWhereUniqueInput> = z
	.object({
		id: z.string(),
	})
	.and(
		z
			.object({
				id: z.string().optional(),
				AND: z
					.union([z.lazy(() => CategoryWhereInputSchema), z.lazy(() => CategoryWhereInputSchema).array()])
					.optional(),
				OR: z
					.lazy(() => CategoryWhereInputSchema)
					.array()
					.optional(),
				NOT: z
					.union([z.lazy(() => CategoryWhereInputSchema), z.lazy(() => CategoryWhereInputSchema).array()])
					.optional(),
				name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				color: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
				todos: z.lazy(() => TodoListRelationFilterSchema).optional(),
			})
			.strict(),
	);

export const CategoryOrderByWithAggregationInputSchema: z.ZodType<Prisma.CategoryOrderByWithAggregationInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		name: z.lazy(() => SortOrderSchema).optional(),
		color: z.lazy(() => SortOrderSchema).optional(),
		createdAt: z.lazy(() => SortOrderSchema).optional(),
		_count: z.lazy(() => CategoryCountOrderByAggregateInputSchema).optional(),
		_max: z.lazy(() => CategoryMaxOrderByAggregateInputSchema).optional(),
		_min: z.lazy(() => CategoryMinOrderByAggregateInputSchema).optional(),
	})
	.strict();

export const CategoryScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CategoryScalarWhereWithAggregatesInput> = z
	.object({
		AND: z
			.union([
				z.lazy(() => CategoryScalarWhereWithAggregatesInputSchema),
				z.lazy(() => CategoryScalarWhereWithAggregatesInputSchema).array(),
			])
			.optional(),
		OR: z
			.lazy(() => CategoryScalarWhereWithAggregatesInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([
				z.lazy(() => CategoryScalarWhereWithAggregatesInputSchema),
				z.lazy(() => CategoryScalarWhereWithAggregatesInputSchema).array(),
			])
			.optional(),
		id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		name: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		color: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		createdAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
	})
	.strict();

export const TodoWhereInputSchema: z.ZodType<Prisma.TodoWhereInput> = z
	.object({
		AND: z.union([z.lazy(() => TodoWhereInputSchema), z.lazy(() => TodoWhereInputSchema).array()]).optional(),
		OR: z
			.lazy(() => TodoWhereInputSchema)
			.array()
			.optional(),
		NOT: z.union([z.lazy(() => TodoWhereInputSchema), z.lazy(() => TodoWhereInputSchema).array()]).optional(),
		id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		title: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		description: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		status: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		priority: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		dueDate: z
			.union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
			.optional()
			.nullable(),
		completedAt: z
			.union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
			.optional()
			.nullable(),
		createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
		updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
		userId: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		categoryId: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		user: z
			.union([z.lazy(() => UserNullableRelationFilterSchema), z.lazy(() => UserWhereInputSchema)])
			.optional()
			.nullable(),
		category: z
			.union([z.lazy(() => CategoryNullableRelationFilterSchema), z.lazy(() => CategoryWhereInputSchema)])
			.optional()
			.nullable(),
	})
	.strict();

export const TodoOrderByWithRelationInputSchema: z.ZodType<Prisma.TodoOrderByWithRelationInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		title: z.lazy(() => SortOrderSchema).optional(),
		description: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
		status: z.lazy(() => SortOrderSchema).optional(),
		priority: z.lazy(() => SortOrderSchema).optional(),
		dueDate: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
		completedAt: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
		createdAt: z.lazy(() => SortOrderSchema).optional(),
		updatedAt: z.lazy(() => SortOrderSchema).optional(),
		userId: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
		categoryId: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
		user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
		category: z.lazy(() => CategoryOrderByWithRelationInputSchema).optional(),
	})
	.strict();

export const TodoWhereUniqueInputSchema: z.ZodType<Prisma.TodoWhereUniqueInput> = z
	.object({
		id: z.string(),
	})
	.and(
		z
			.object({
				id: z.string().optional(),
				AND: z.union([z.lazy(() => TodoWhereInputSchema), z.lazy(() => TodoWhereInputSchema).array()]).optional(),
				OR: z
					.lazy(() => TodoWhereInputSchema)
					.array()
					.optional(),
				NOT: z.union([z.lazy(() => TodoWhereInputSchema), z.lazy(() => TodoWhereInputSchema).array()]).optional(),
				title: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				description: z
					.union([z.lazy(() => StringNullableFilterSchema), z.string()])
					.optional()
					.nullable(),
				status: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				priority: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
				dueDate: z
					.union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
					.optional()
					.nullable(),
				completedAt: z
					.union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
					.optional()
					.nullable(),
				createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
				updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
				userId: z
					.union([z.lazy(() => StringNullableFilterSchema), z.string()])
					.optional()
					.nullable(),
				categoryId: z
					.union([z.lazy(() => StringNullableFilterSchema), z.string()])
					.optional()
					.nullable(),
				user: z
					.union([z.lazy(() => UserNullableRelationFilterSchema), z.lazy(() => UserWhereInputSchema)])
					.optional()
					.nullable(),
				category: z
					.union([z.lazy(() => CategoryNullableRelationFilterSchema), z.lazy(() => CategoryWhereInputSchema)])
					.optional()
					.nullable(),
			})
			.strict(),
	);

export const TodoOrderByWithAggregationInputSchema: z.ZodType<Prisma.TodoOrderByWithAggregationInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		title: z.lazy(() => SortOrderSchema).optional(),
		description: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
		status: z.lazy(() => SortOrderSchema).optional(),
		priority: z.lazy(() => SortOrderSchema).optional(),
		dueDate: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
		completedAt: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
		createdAt: z.lazy(() => SortOrderSchema).optional(),
		updatedAt: z.lazy(() => SortOrderSchema).optional(),
		userId: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
		categoryId: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
		_count: z.lazy(() => TodoCountOrderByAggregateInputSchema).optional(),
		_max: z.lazy(() => TodoMaxOrderByAggregateInputSchema).optional(),
		_min: z.lazy(() => TodoMinOrderByAggregateInputSchema).optional(),
	})
	.strict();

export const TodoScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TodoScalarWhereWithAggregatesInput> = z
	.object({
		AND: z
			.union([
				z.lazy(() => TodoScalarWhereWithAggregatesInputSchema),
				z.lazy(() => TodoScalarWhereWithAggregatesInputSchema).array(),
			])
			.optional(),
		OR: z
			.lazy(() => TodoScalarWhereWithAggregatesInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([
				z.lazy(() => TodoScalarWhereWithAggregatesInputSchema),
				z.lazy(() => TodoScalarWhereWithAggregatesInputSchema).array(),
			])
			.optional(),
		id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		title: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		description: z
			.union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
			.optional()
			.nullable(),
		status: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		priority: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
		dueDate: z
			.union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
			.optional()
			.nullable(),
		completedAt: z
			.union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
			.optional()
			.nullable(),
		createdAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
		updatedAt: z.union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()]).optional(),
		userId: z
			.union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
			.optional()
			.nullable(),
		categoryId: z
			.union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
			.optional()
			.nullable(),
	})
	.strict();

export const UserCreateInputSchema: z.ZodType<Prisma.UserCreateInput> = z
	.object({
		id: z.string().optional(),
		email: z.string(),
		name: z.string(),
		avatar: z.string().optional().nullable(),
		createdAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
		todos: z.lazy(() => TodoCreateNestedManyWithoutUserInputSchema).optional(),
	})
	.strict();

export const UserUncheckedCreateInputSchema: z.ZodType<Prisma.UserUncheckedCreateInput> = z
	.object({
		id: z.string().optional(),
		email: z.string(),
		name: z.string(),
		avatar: z.string().optional().nullable(),
		createdAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
		todos: z.lazy(() => TodoUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
	})
	.strict();

export const UserUpdateInputSchema: z.ZodType<Prisma.UserUpdateInput> = z
	.object({
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		avatar: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		todos: z.lazy(() => TodoUpdateManyWithoutUserNestedInputSchema).optional(),
	})
	.strict();

export const UserUncheckedUpdateInputSchema: z.ZodType<Prisma.UserUncheckedUpdateInput> = z
	.object({
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		avatar: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		todos: z.lazy(() => TodoUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
	})
	.strict();

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z
	.object({
		id: z.string().optional(),
		email: z.string(),
		name: z.string(),
		avatar: z.string().optional().nullable(),
		createdAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
	})
	.strict();

export const UserUpdateManyMutationInputSchema: z.ZodType<Prisma.UserUpdateManyMutationInput> = z
	.object({
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		avatar: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const UserUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UserUncheckedUpdateManyInput> = z
	.object({
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		avatar: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const CategoryCreateInputSchema: z.ZodType<Prisma.CategoryCreateInput> = z
	.object({
		id: z.string().optional(),
		name: z.string(),
		color: z.string().optional(),
		createdAt: z.coerce.date().optional(),
		todos: z.lazy(() => TodoCreateNestedManyWithoutCategoryInputSchema).optional(),
	})
	.strict();

export const CategoryUncheckedCreateInputSchema: z.ZodType<Prisma.CategoryUncheckedCreateInput> = z
	.object({
		id: z.string().optional(),
		name: z.string(),
		color: z.string().optional(),
		createdAt: z.coerce.date().optional(),
		todos: z.lazy(() => TodoUncheckedCreateNestedManyWithoutCategoryInputSchema).optional(),
	})
	.strict();

export const CategoryUpdateInputSchema: z.ZodType<Prisma.CategoryUpdateInput> = z
	.object({
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		color: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		todos: z.lazy(() => TodoUpdateManyWithoutCategoryNestedInputSchema).optional(),
	})
	.strict();

export const CategoryUncheckedUpdateInputSchema: z.ZodType<Prisma.CategoryUncheckedUpdateInput> = z
	.object({
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		color: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		todos: z.lazy(() => TodoUncheckedUpdateManyWithoutCategoryNestedInputSchema).optional(),
	})
	.strict();

export const CategoryCreateManyInputSchema: z.ZodType<Prisma.CategoryCreateManyInput> = z
	.object({
		id: z.string().optional(),
		name: z.string(),
		color: z.string().optional(),
		createdAt: z.coerce.date().optional(),
	})
	.strict();

export const CategoryUpdateManyMutationInputSchema: z.ZodType<Prisma.CategoryUpdateManyMutationInput> = z
	.object({
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		color: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const CategoryUncheckedUpdateManyInputSchema: z.ZodType<Prisma.CategoryUncheckedUpdateManyInput> = z
	.object({
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		color: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const TodoCreateInputSchema: z.ZodType<Prisma.TodoCreateInput> = z
	.object({
		id: z.string().optional(),
		title: z.string(),
		description: z.string().optional().nullable(),
		status: z.string().optional(),
		priority: z.string().optional(),
		dueDate: z.coerce.date().optional().nullable(),
		completedAt: z.coerce.date().optional().nullable(),
		createdAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
		user: z.lazy(() => UserCreateNestedOneWithoutTodosInputSchema).optional(),
		category: z.lazy(() => CategoryCreateNestedOneWithoutTodosInputSchema).optional(),
	})
	.strict();

export const TodoUncheckedCreateInputSchema: z.ZodType<Prisma.TodoUncheckedCreateInput> = z
	.object({
		id: z.string().optional(),
		title: z.string(),
		description: z.string().optional().nullable(),
		status: z.string().optional(),
		priority: z.string().optional(),
		dueDate: z.coerce.date().optional().nullable(),
		completedAt: z.coerce.date().optional().nullable(),
		createdAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
		userId: z.string().optional().nullable(),
		categoryId: z.string().optional().nullable(),
	})
	.strict();

export const TodoUpdateInputSchema: z.ZodType<Prisma.TodoUpdateInput> = z
	.object({
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		title: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		description: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		status: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		priority: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		dueDate: z
			.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		completedAt: z
			.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		user: z.lazy(() => UserUpdateOneWithoutTodosNestedInputSchema).optional(),
		category: z.lazy(() => CategoryUpdateOneWithoutTodosNestedInputSchema).optional(),
	})
	.strict();

export const TodoUncheckedUpdateInputSchema: z.ZodType<Prisma.TodoUncheckedUpdateInput> = z
	.object({
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		title: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		description: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		status: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		priority: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		dueDate: z
			.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		completedAt: z
			.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		userId: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		categoryId: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
	})
	.strict();

export const TodoCreateManyInputSchema: z.ZodType<Prisma.TodoCreateManyInput> = z
	.object({
		id: z.string().optional(),
		title: z.string(),
		description: z.string().optional().nullable(),
		status: z.string().optional(),
		priority: z.string().optional(),
		dueDate: z.coerce.date().optional().nullable(),
		completedAt: z.coerce.date().optional().nullable(),
		createdAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
		userId: z.string().optional().nullable(),
		categoryId: z.string().optional().nullable(),
	})
	.strict();

export const TodoUpdateManyMutationInputSchema: z.ZodType<Prisma.TodoUpdateManyMutationInput> = z
	.object({
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		title: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		description: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		status: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		priority: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		dueDate: z
			.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		completedAt: z
			.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const TodoUncheckedUpdateManyInputSchema: z.ZodType<Prisma.TodoUncheckedUpdateManyInput> = z
	.object({
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		title: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		description: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		status: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		priority: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		dueDate: z
			.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		completedAt: z
			.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		userId: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		categoryId: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
	})
	.strict();

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z
	.object({
		equals: z.string().optional(),
		in: z.string().array().optional(),
		notIn: z.string().array().optional(),
		lt: z.string().optional(),
		lte: z.string().optional(),
		gt: z.string().optional(),
		gte: z.string().optional(),
		contains: z.string().optional(),
		startsWith: z.string().optional(),
		endsWith: z.string().optional(),
		not: z.union([z.string(), z.lazy(() => NestedStringFilterSchema)]).optional(),
	})
	.strict();

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z
	.object({
		equals: z.string().optional().nullable(),
		in: z.string().array().optional().nullable(),
		notIn: z.string().array().optional().nullable(),
		lt: z.string().optional(),
		lte: z.string().optional(),
		gt: z.string().optional(),
		gte: z.string().optional(),
		contains: z.string().optional(),
		startsWith: z.string().optional(),
		endsWith: z.string().optional(),
		not: z
			.union([z.string(), z.lazy(() => NestedStringNullableFilterSchema)])
			.optional()
			.nullable(),
	})
	.strict();

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z
	.object({
		equals: z.coerce.date().optional(),
		in: z.coerce.date().array().optional(),
		notIn: z.coerce.date().array().optional(),
		lt: z.coerce.date().optional(),
		lte: z.coerce.date().optional(),
		gt: z.coerce.date().optional(),
		gte: z.coerce.date().optional(),
		not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeFilterSchema)]).optional(),
	})
	.strict();

export const TodoListRelationFilterSchema: z.ZodType<Prisma.TodoListRelationFilter> = z
	.object({
		every: z.lazy(() => TodoWhereInputSchema).optional(),
		some: z.lazy(() => TodoWhereInputSchema).optional(),
		none: z.lazy(() => TodoWhereInputSchema).optional(),
	})
	.strict();

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z
	.object({
		sort: z.lazy(() => SortOrderSchema),
		nulls: z.lazy(() => NullsOrderSchema).optional(),
	})
	.strict();

export const TodoOrderByRelationAggregateInputSchema: z.ZodType<Prisma.TodoOrderByRelationAggregateInput> = z
	.object({
		_count: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const UserCountOrderByAggregateInputSchema: z.ZodType<Prisma.UserCountOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		email: z.lazy(() => SortOrderSchema).optional(),
		name: z.lazy(() => SortOrderSchema).optional(),
		avatar: z.lazy(() => SortOrderSchema).optional(),
		createdAt: z.lazy(() => SortOrderSchema).optional(),
		updatedAt: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const UserMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UserMaxOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		email: z.lazy(() => SortOrderSchema).optional(),
		name: z.lazy(() => SortOrderSchema).optional(),
		avatar: z.lazy(() => SortOrderSchema).optional(),
		createdAt: z.lazy(() => SortOrderSchema).optional(),
		updatedAt: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const UserMinOrderByAggregateInputSchema: z.ZodType<Prisma.UserMinOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		email: z.lazy(() => SortOrderSchema).optional(),
		name: z.lazy(() => SortOrderSchema).optional(),
		avatar: z.lazy(() => SortOrderSchema).optional(),
		createdAt: z.lazy(() => SortOrderSchema).optional(),
		updatedAt: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z
	.object({
		equals: z.string().optional(),
		in: z.string().array().optional(),
		notIn: z.string().array().optional(),
		lt: z.string().optional(),
		lte: z.string().optional(),
		gt: z.string().optional(),
		gte: z.string().optional(),
		contains: z.string().optional(),
		startsWith: z.string().optional(),
		endsWith: z.string().optional(),
		not: z.union([z.string(), z.lazy(() => NestedStringWithAggregatesFilterSchema)]).optional(),
		_count: z.lazy(() => NestedIntFilterSchema).optional(),
		_min: z.lazy(() => NestedStringFilterSchema).optional(),
		_max: z.lazy(() => NestedStringFilterSchema).optional(),
	})
	.strict();

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z
	.object({
		equals: z.string().optional().nullable(),
		in: z.string().array().optional().nullable(),
		notIn: z.string().array().optional().nullable(),
		lt: z.string().optional(),
		lte: z.string().optional(),
		gt: z.string().optional(),
		gte: z.string().optional(),
		contains: z.string().optional(),
		startsWith: z.string().optional(),
		endsWith: z.string().optional(),
		not: z
			.union([z.string(), z.lazy(() => NestedStringNullableWithAggregatesFilterSchema)])
			.optional()
			.nullable(),
		_count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
		_min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
		_max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
	})
	.strict();

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z
	.object({
		equals: z.coerce.date().optional(),
		in: z.coerce.date().array().optional(),
		notIn: z.coerce.date().array().optional(),
		lt: z.coerce.date().optional(),
		lte: z.coerce.date().optional(),
		gt: z.coerce.date().optional(),
		gte: z.coerce.date().optional(),
		not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeWithAggregatesFilterSchema)]).optional(),
		_count: z.lazy(() => NestedIntFilterSchema).optional(),
		_min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
		_max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
	})
	.strict();

export const CategoryCountOrderByAggregateInputSchema: z.ZodType<Prisma.CategoryCountOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		name: z.lazy(() => SortOrderSchema).optional(),
		color: z.lazy(() => SortOrderSchema).optional(),
		createdAt: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const CategoryMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CategoryMaxOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		name: z.lazy(() => SortOrderSchema).optional(),
		color: z.lazy(() => SortOrderSchema).optional(),
		createdAt: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const CategoryMinOrderByAggregateInputSchema: z.ZodType<Prisma.CategoryMinOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		name: z.lazy(() => SortOrderSchema).optional(),
		color: z.lazy(() => SortOrderSchema).optional(),
		createdAt: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const DateTimeNullableFilterSchema: z.ZodType<Prisma.DateTimeNullableFilter> = z
	.object({
		equals: z.coerce.date().optional().nullable(),
		in: z.coerce.date().array().optional().nullable(),
		notIn: z.coerce.date().array().optional().nullable(),
		lt: z.coerce.date().optional(),
		lte: z.coerce.date().optional(),
		gt: z.coerce.date().optional(),
		gte: z.coerce.date().optional(),
		not: z
			.union([z.coerce.date(), z.lazy(() => NestedDateTimeNullableFilterSchema)])
			.optional()
			.nullable(),
	})
	.strict();

export const UserNullableRelationFilterSchema: z.ZodType<Prisma.UserNullableRelationFilter> = z
	.object({
		is: z
			.lazy(() => UserWhereInputSchema)
			.optional()
			.nullable(),
		isNot: z
			.lazy(() => UserWhereInputSchema)
			.optional()
			.nullable(),
	})
	.strict();

export const CategoryNullableRelationFilterSchema: z.ZodType<Prisma.CategoryNullableRelationFilter> = z
	.object({
		is: z
			.lazy(() => CategoryWhereInputSchema)
			.optional()
			.nullable(),
		isNot: z
			.lazy(() => CategoryWhereInputSchema)
			.optional()
			.nullable(),
	})
	.strict();

export const TodoCountOrderByAggregateInputSchema: z.ZodType<Prisma.TodoCountOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		title: z.lazy(() => SortOrderSchema).optional(),
		description: z.lazy(() => SortOrderSchema).optional(),
		status: z.lazy(() => SortOrderSchema).optional(),
		priority: z.lazy(() => SortOrderSchema).optional(),
		dueDate: z.lazy(() => SortOrderSchema).optional(),
		completedAt: z.lazy(() => SortOrderSchema).optional(),
		createdAt: z.lazy(() => SortOrderSchema).optional(),
		updatedAt: z.lazy(() => SortOrderSchema).optional(),
		userId: z.lazy(() => SortOrderSchema).optional(),
		categoryId: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const TodoMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TodoMaxOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		title: z.lazy(() => SortOrderSchema).optional(),
		description: z.lazy(() => SortOrderSchema).optional(),
		status: z.lazy(() => SortOrderSchema).optional(),
		priority: z.lazy(() => SortOrderSchema).optional(),
		dueDate: z.lazy(() => SortOrderSchema).optional(),
		completedAt: z.lazy(() => SortOrderSchema).optional(),
		createdAt: z.lazy(() => SortOrderSchema).optional(),
		updatedAt: z.lazy(() => SortOrderSchema).optional(),
		userId: z.lazy(() => SortOrderSchema).optional(),
		categoryId: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const TodoMinOrderByAggregateInputSchema: z.ZodType<Prisma.TodoMinOrderByAggregateInput> = z
	.object({
		id: z.lazy(() => SortOrderSchema).optional(),
		title: z.lazy(() => SortOrderSchema).optional(),
		description: z.lazy(() => SortOrderSchema).optional(),
		status: z.lazy(() => SortOrderSchema).optional(),
		priority: z.lazy(() => SortOrderSchema).optional(),
		dueDate: z.lazy(() => SortOrderSchema).optional(),
		completedAt: z.lazy(() => SortOrderSchema).optional(),
		createdAt: z.lazy(() => SortOrderSchema).optional(),
		updatedAt: z.lazy(() => SortOrderSchema).optional(),
		userId: z.lazy(() => SortOrderSchema).optional(),
		categoryId: z.lazy(() => SortOrderSchema).optional(),
	})
	.strict();

export const DateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeNullableWithAggregatesFilter> = z
	.object({
		equals: z.coerce.date().optional().nullable(),
		in: z.coerce.date().array().optional().nullable(),
		notIn: z.coerce.date().array().optional().nullable(),
		lt: z.coerce.date().optional(),
		lte: z.coerce.date().optional(),
		gt: z.coerce.date().optional(),
		gte: z.coerce.date().optional(),
		not: z
			.union([z.coerce.date(), z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema)])
			.optional()
			.nullable(),
		_count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
		_min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
		_max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
	})
	.strict();

export const TodoCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.TodoCreateNestedManyWithoutUserInput> = z
	.object({
		create: z
			.union([
				z.lazy(() => TodoCreateWithoutUserInputSchema),
				z.lazy(() => TodoCreateWithoutUserInputSchema).array(),
				z.lazy(() => TodoUncheckedCreateWithoutUserInputSchema),
				z.lazy(() => TodoUncheckedCreateWithoutUserInputSchema).array(),
			])
			.optional(),
		connectOrCreate: z
			.union([
				z.lazy(() => TodoCreateOrConnectWithoutUserInputSchema),
				z.lazy(() => TodoCreateOrConnectWithoutUserInputSchema).array(),
			])
			.optional(),
		createMany: z.lazy(() => TodoCreateManyUserInputEnvelopeSchema).optional(),
		connect: z
			.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
			.optional(),
	})
	.strict();

export const TodoUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.TodoUncheckedCreateNestedManyWithoutUserInput> =
	z
		.object({
			create: z
				.union([
					z.lazy(() => TodoCreateWithoutUserInputSchema),
					z.lazy(() => TodoCreateWithoutUserInputSchema).array(),
					z.lazy(() => TodoUncheckedCreateWithoutUserInputSchema),
					z.lazy(() => TodoUncheckedCreateWithoutUserInputSchema).array(),
				])
				.optional(),
			connectOrCreate: z
				.union([
					z.lazy(() => TodoCreateOrConnectWithoutUserInputSchema),
					z.lazy(() => TodoCreateOrConnectWithoutUserInputSchema).array(),
				])
				.optional(),
			createMany: z.lazy(() => TodoCreateManyUserInputEnvelopeSchema).optional(),
			connect: z
				.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
				.optional(),
		})
		.strict();

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z
	.object({
		set: z.string().optional(),
	})
	.strict();

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> =
	z
		.object({
			set: z.string().optional().nullable(),
		})
		.strict();

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z
	.object({
		set: z.coerce.date().optional(),
	})
	.strict();

export const TodoUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.TodoUpdateManyWithoutUserNestedInput> = z
	.object({
		create: z
			.union([
				z.lazy(() => TodoCreateWithoutUserInputSchema),
				z.lazy(() => TodoCreateWithoutUserInputSchema).array(),
				z.lazy(() => TodoUncheckedCreateWithoutUserInputSchema),
				z.lazy(() => TodoUncheckedCreateWithoutUserInputSchema).array(),
			])
			.optional(),
		connectOrCreate: z
			.union([
				z.lazy(() => TodoCreateOrConnectWithoutUserInputSchema),
				z.lazy(() => TodoCreateOrConnectWithoutUserInputSchema).array(),
			])
			.optional(),
		upsert: z
			.union([
				z.lazy(() => TodoUpsertWithWhereUniqueWithoutUserInputSchema),
				z.lazy(() => TodoUpsertWithWhereUniqueWithoutUserInputSchema).array(),
			])
			.optional(),
		createMany: z.lazy(() => TodoCreateManyUserInputEnvelopeSchema).optional(),
		set: z
			.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
			.optional(),
		disconnect: z
			.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
			.optional(),
		delete: z
			.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
			.optional(),
		connect: z
			.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
			.optional(),
		update: z
			.union([
				z.lazy(() => TodoUpdateWithWhereUniqueWithoutUserInputSchema),
				z.lazy(() => TodoUpdateWithWhereUniqueWithoutUserInputSchema).array(),
			])
			.optional(),
		updateMany: z
			.union([
				z.lazy(() => TodoUpdateManyWithWhereWithoutUserInputSchema),
				z.lazy(() => TodoUpdateManyWithWhereWithoutUserInputSchema).array(),
			])
			.optional(),
		deleteMany: z
			.union([z.lazy(() => TodoScalarWhereInputSchema), z.lazy(() => TodoScalarWhereInputSchema).array()])
			.optional(),
	})
	.strict();

export const TodoUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.TodoUncheckedUpdateManyWithoutUserNestedInput> =
	z
		.object({
			create: z
				.union([
					z.lazy(() => TodoCreateWithoutUserInputSchema),
					z.lazy(() => TodoCreateWithoutUserInputSchema).array(),
					z.lazy(() => TodoUncheckedCreateWithoutUserInputSchema),
					z.lazy(() => TodoUncheckedCreateWithoutUserInputSchema).array(),
				])
				.optional(),
			connectOrCreate: z
				.union([
					z.lazy(() => TodoCreateOrConnectWithoutUserInputSchema),
					z.lazy(() => TodoCreateOrConnectWithoutUserInputSchema).array(),
				])
				.optional(),
			upsert: z
				.union([
					z.lazy(() => TodoUpsertWithWhereUniqueWithoutUserInputSchema),
					z.lazy(() => TodoUpsertWithWhereUniqueWithoutUserInputSchema).array(),
				])
				.optional(),
			createMany: z.lazy(() => TodoCreateManyUserInputEnvelopeSchema).optional(),
			set: z
				.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
				.optional(),
			disconnect: z
				.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
				.optional(),
			delete: z
				.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
				.optional(),
			connect: z
				.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
				.optional(),
			update: z
				.union([
					z.lazy(() => TodoUpdateWithWhereUniqueWithoutUserInputSchema),
					z.lazy(() => TodoUpdateWithWhereUniqueWithoutUserInputSchema).array(),
				])
				.optional(),
			updateMany: z
				.union([
					z.lazy(() => TodoUpdateManyWithWhereWithoutUserInputSchema),
					z.lazy(() => TodoUpdateManyWithWhereWithoutUserInputSchema).array(),
				])
				.optional(),
			deleteMany: z
				.union([z.lazy(() => TodoScalarWhereInputSchema), z.lazy(() => TodoScalarWhereInputSchema).array()])
				.optional(),
		})
		.strict();

export const TodoCreateNestedManyWithoutCategoryInputSchema: z.ZodType<Prisma.TodoCreateNestedManyWithoutCategoryInput> =
	z
		.object({
			create: z
				.union([
					z.lazy(() => TodoCreateWithoutCategoryInputSchema),
					z.lazy(() => TodoCreateWithoutCategoryInputSchema).array(),
					z.lazy(() => TodoUncheckedCreateWithoutCategoryInputSchema),
					z.lazy(() => TodoUncheckedCreateWithoutCategoryInputSchema).array(),
				])
				.optional(),
			connectOrCreate: z
				.union([
					z.lazy(() => TodoCreateOrConnectWithoutCategoryInputSchema),
					z.lazy(() => TodoCreateOrConnectWithoutCategoryInputSchema).array(),
				])
				.optional(),
			createMany: z.lazy(() => TodoCreateManyCategoryInputEnvelopeSchema).optional(),
			connect: z
				.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
				.optional(),
		})
		.strict();

export const TodoUncheckedCreateNestedManyWithoutCategoryInputSchema: z.ZodType<Prisma.TodoUncheckedCreateNestedManyWithoutCategoryInput> =
	z
		.object({
			create: z
				.union([
					z.lazy(() => TodoCreateWithoutCategoryInputSchema),
					z.lazy(() => TodoCreateWithoutCategoryInputSchema).array(),
					z.lazy(() => TodoUncheckedCreateWithoutCategoryInputSchema),
					z.lazy(() => TodoUncheckedCreateWithoutCategoryInputSchema).array(),
				])
				.optional(),
			connectOrCreate: z
				.union([
					z.lazy(() => TodoCreateOrConnectWithoutCategoryInputSchema),
					z.lazy(() => TodoCreateOrConnectWithoutCategoryInputSchema).array(),
				])
				.optional(),
			createMany: z.lazy(() => TodoCreateManyCategoryInputEnvelopeSchema).optional(),
			connect: z
				.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
				.optional(),
		})
		.strict();

export const TodoUpdateManyWithoutCategoryNestedInputSchema: z.ZodType<Prisma.TodoUpdateManyWithoutCategoryNestedInput> =
	z
		.object({
			create: z
				.union([
					z.lazy(() => TodoCreateWithoutCategoryInputSchema),
					z.lazy(() => TodoCreateWithoutCategoryInputSchema).array(),
					z.lazy(() => TodoUncheckedCreateWithoutCategoryInputSchema),
					z.lazy(() => TodoUncheckedCreateWithoutCategoryInputSchema).array(),
				])
				.optional(),
			connectOrCreate: z
				.union([
					z.lazy(() => TodoCreateOrConnectWithoutCategoryInputSchema),
					z.lazy(() => TodoCreateOrConnectWithoutCategoryInputSchema).array(),
				])
				.optional(),
			upsert: z
				.union([
					z.lazy(() => TodoUpsertWithWhereUniqueWithoutCategoryInputSchema),
					z.lazy(() => TodoUpsertWithWhereUniqueWithoutCategoryInputSchema).array(),
				])
				.optional(),
			createMany: z.lazy(() => TodoCreateManyCategoryInputEnvelopeSchema).optional(),
			set: z
				.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
				.optional(),
			disconnect: z
				.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
				.optional(),
			delete: z
				.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
				.optional(),
			connect: z
				.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
				.optional(),
			update: z
				.union([
					z.lazy(() => TodoUpdateWithWhereUniqueWithoutCategoryInputSchema),
					z.lazy(() => TodoUpdateWithWhereUniqueWithoutCategoryInputSchema).array(),
				])
				.optional(),
			updateMany: z
				.union([
					z.lazy(() => TodoUpdateManyWithWhereWithoutCategoryInputSchema),
					z.lazy(() => TodoUpdateManyWithWhereWithoutCategoryInputSchema).array(),
				])
				.optional(),
			deleteMany: z
				.union([z.lazy(() => TodoScalarWhereInputSchema), z.lazy(() => TodoScalarWhereInputSchema).array()])
				.optional(),
		})
		.strict();

export const TodoUncheckedUpdateManyWithoutCategoryNestedInputSchema: z.ZodType<Prisma.TodoUncheckedUpdateManyWithoutCategoryNestedInput> =
	z
		.object({
			create: z
				.union([
					z.lazy(() => TodoCreateWithoutCategoryInputSchema),
					z.lazy(() => TodoCreateWithoutCategoryInputSchema).array(),
					z.lazy(() => TodoUncheckedCreateWithoutCategoryInputSchema),
					z.lazy(() => TodoUncheckedCreateWithoutCategoryInputSchema).array(),
				])
				.optional(),
			connectOrCreate: z
				.union([
					z.lazy(() => TodoCreateOrConnectWithoutCategoryInputSchema),
					z.lazy(() => TodoCreateOrConnectWithoutCategoryInputSchema).array(),
				])
				.optional(),
			upsert: z
				.union([
					z.lazy(() => TodoUpsertWithWhereUniqueWithoutCategoryInputSchema),
					z.lazy(() => TodoUpsertWithWhereUniqueWithoutCategoryInputSchema).array(),
				])
				.optional(),
			createMany: z.lazy(() => TodoCreateManyCategoryInputEnvelopeSchema).optional(),
			set: z
				.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
				.optional(),
			disconnect: z
				.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
				.optional(),
			delete: z
				.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
				.optional(),
			connect: z
				.union([z.lazy(() => TodoWhereUniqueInputSchema), z.lazy(() => TodoWhereUniqueInputSchema).array()])
				.optional(),
			update: z
				.union([
					z.lazy(() => TodoUpdateWithWhereUniqueWithoutCategoryInputSchema),
					z.lazy(() => TodoUpdateWithWhereUniqueWithoutCategoryInputSchema).array(),
				])
				.optional(),
			updateMany: z
				.union([
					z.lazy(() => TodoUpdateManyWithWhereWithoutCategoryInputSchema),
					z.lazy(() => TodoUpdateManyWithWhereWithoutCategoryInputSchema).array(),
				])
				.optional(),
			deleteMany: z
				.union([z.lazy(() => TodoScalarWhereInputSchema), z.lazy(() => TodoScalarWhereInputSchema).array()])
				.optional(),
		})
		.strict();

export const UserCreateNestedOneWithoutTodosInputSchema: z.ZodType<Prisma.UserCreateNestedOneWithoutTodosInput> = z
	.object({
		create: z
			.union([
				z.lazy(() => UserCreateWithoutTodosInputSchema),
				z.lazy(() => UserUncheckedCreateWithoutTodosInputSchema),
			])
			.optional(),
		connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutTodosInputSchema).optional(),
		connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
	})
	.strict();

export const CategoryCreateNestedOneWithoutTodosInputSchema: z.ZodType<Prisma.CategoryCreateNestedOneWithoutTodosInput> =
	z
		.object({
			create: z
				.union([
					z.lazy(() => CategoryCreateWithoutTodosInputSchema),
					z.lazy(() => CategoryUncheckedCreateWithoutTodosInputSchema),
				])
				.optional(),
			connectOrCreate: z.lazy(() => CategoryCreateOrConnectWithoutTodosInputSchema).optional(),
			connect: z.lazy(() => CategoryWhereUniqueInputSchema).optional(),
		})
		.strict();

export const NullableDateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput> =
	z
		.object({
			set: z.coerce.date().optional().nullable(),
		})
		.strict();

export const UserUpdateOneWithoutTodosNestedInputSchema: z.ZodType<Prisma.UserUpdateOneWithoutTodosNestedInput> = z
	.object({
		create: z
			.union([
				z.lazy(() => UserCreateWithoutTodosInputSchema),
				z.lazy(() => UserUncheckedCreateWithoutTodosInputSchema),
			])
			.optional(),
		connectOrCreate: z.lazy(() => UserCreateOrConnectWithoutTodosInputSchema).optional(),
		upsert: z.lazy(() => UserUpsertWithoutTodosInputSchema).optional(),
		disconnect: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
		delete: z.union([z.boolean(), z.lazy(() => UserWhereInputSchema)]).optional(),
		connect: z.lazy(() => UserWhereUniqueInputSchema).optional(),
		update: z
			.union([
				z.lazy(() => UserUpdateToOneWithWhereWithoutTodosInputSchema),
				z.lazy(() => UserUpdateWithoutTodosInputSchema),
				z.lazy(() => UserUncheckedUpdateWithoutTodosInputSchema),
			])
			.optional(),
	})
	.strict();

export const CategoryUpdateOneWithoutTodosNestedInputSchema: z.ZodType<Prisma.CategoryUpdateOneWithoutTodosNestedInput> =
	z
		.object({
			create: z
				.union([
					z.lazy(() => CategoryCreateWithoutTodosInputSchema),
					z.lazy(() => CategoryUncheckedCreateWithoutTodosInputSchema),
				])
				.optional(),
			connectOrCreate: z.lazy(() => CategoryCreateOrConnectWithoutTodosInputSchema).optional(),
			upsert: z.lazy(() => CategoryUpsertWithoutTodosInputSchema).optional(),
			disconnect: z.union([z.boolean(), z.lazy(() => CategoryWhereInputSchema)]).optional(),
			delete: z.union([z.boolean(), z.lazy(() => CategoryWhereInputSchema)]).optional(),
			connect: z.lazy(() => CategoryWhereUniqueInputSchema).optional(),
			update: z
				.union([
					z.lazy(() => CategoryUpdateToOneWithWhereWithoutTodosInputSchema),
					z.lazy(() => CategoryUpdateWithoutTodosInputSchema),
					z.lazy(() => CategoryUncheckedUpdateWithoutTodosInputSchema),
				])
				.optional(),
		})
		.strict();

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z
	.object({
		equals: z.string().optional(),
		in: z.string().array().optional(),
		notIn: z.string().array().optional(),
		lt: z.string().optional(),
		lte: z.string().optional(),
		gt: z.string().optional(),
		gte: z.string().optional(),
		contains: z.string().optional(),
		startsWith: z.string().optional(),
		endsWith: z.string().optional(),
		not: z.union([z.string(), z.lazy(() => NestedStringFilterSchema)]).optional(),
	})
	.strict();

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z
	.object({
		equals: z.string().optional().nullable(),
		in: z.string().array().optional().nullable(),
		notIn: z.string().array().optional().nullable(),
		lt: z.string().optional(),
		lte: z.string().optional(),
		gt: z.string().optional(),
		gte: z.string().optional(),
		contains: z.string().optional(),
		startsWith: z.string().optional(),
		endsWith: z.string().optional(),
		not: z
			.union([z.string(), z.lazy(() => NestedStringNullableFilterSchema)])
			.optional()
			.nullable(),
	})
	.strict();

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z
	.object({
		equals: z.coerce.date().optional(),
		in: z.coerce.date().array().optional(),
		notIn: z.coerce.date().array().optional(),
		lt: z.coerce.date().optional(),
		lte: z.coerce.date().optional(),
		gt: z.coerce.date().optional(),
		gte: z.coerce.date().optional(),
		not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeFilterSchema)]).optional(),
	})
	.strict();

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z
	.object({
		equals: z.string().optional(),
		in: z.string().array().optional(),
		notIn: z.string().array().optional(),
		lt: z.string().optional(),
		lte: z.string().optional(),
		gt: z.string().optional(),
		gte: z.string().optional(),
		contains: z.string().optional(),
		startsWith: z.string().optional(),
		endsWith: z.string().optional(),
		not: z.union([z.string(), z.lazy(() => NestedStringWithAggregatesFilterSchema)]).optional(),
		_count: z.lazy(() => NestedIntFilterSchema).optional(),
		_min: z.lazy(() => NestedStringFilterSchema).optional(),
		_max: z.lazy(() => NestedStringFilterSchema).optional(),
	})
	.strict();

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z
	.object({
		equals: z.number().optional(),
		in: z.number().array().optional(),
		notIn: z.number().array().optional(),
		lt: z.number().optional(),
		lte: z.number().optional(),
		gt: z.number().optional(),
		gte: z.number().optional(),
		not: z.union([z.number(), z.lazy(() => NestedIntFilterSchema)]).optional(),
	})
	.strict();

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> =
	z
		.object({
			equals: z.string().optional().nullable(),
			in: z.string().array().optional().nullable(),
			notIn: z.string().array().optional().nullable(),
			lt: z.string().optional(),
			lte: z.string().optional(),
			gt: z.string().optional(),
			gte: z.string().optional(),
			contains: z.string().optional(),
			startsWith: z.string().optional(),
			endsWith: z.string().optional(),
			not: z
				.union([z.string(), z.lazy(() => NestedStringNullableWithAggregatesFilterSchema)])
				.optional()
				.nullable(),
			_count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
			_min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
			_max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
		})
		.strict();

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z
	.object({
		equals: z.number().optional().nullable(),
		in: z.number().array().optional().nullable(),
		notIn: z.number().array().optional().nullable(),
		lt: z.number().optional(),
		lte: z.number().optional(),
		gt: z.number().optional(),
		gte: z.number().optional(),
		not: z
			.union([z.number(), z.lazy(() => NestedIntNullableFilterSchema)])
			.optional()
			.nullable(),
	})
	.strict();

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z
	.object({
		equals: z.coerce.date().optional(),
		in: z.coerce.date().array().optional(),
		notIn: z.coerce.date().array().optional(),
		lt: z.coerce.date().optional(),
		lte: z.coerce.date().optional(),
		gt: z.coerce.date().optional(),
		gte: z.coerce.date().optional(),
		not: z.union([z.coerce.date(), z.lazy(() => NestedDateTimeWithAggregatesFilterSchema)]).optional(),
		_count: z.lazy(() => NestedIntFilterSchema).optional(),
		_min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
		_max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
	})
	.strict();

export const NestedDateTimeNullableFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableFilter> = z
	.object({
		equals: z.coerce.date().optional().nullable(),
		in: z.coerce.date().array().optional().nullable(),
		notIn: z.coerce.date().array().optional().nullable(),
		lt: z.coerce.date().optional(),
		lte: z.coerce.date().optional(),
		gt: z.coerce.date().optional(),
		gte: z.coerce.date().optional(),
		not: z
			.union([z.coerce.date(), z.lazy(() => NestedDateTimeNullableFilterSchema)])
			.optional()
			.nullable(),
	})
	.strict();

export const NestedDateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableWithAggregatesFilter> =
	z
		.object({
			equals: z.coerce.date().optional().nullable(),
			in: z.coerce.date().array().optional().nullable(),
			notIn: z.coerce.date().array().optional().nullable(),
			lt: z.coerce.date().optional(),
			lte: z.coerce.date().optional(),
			gt: z.coerce.date().optional(),
			gte: z.coerce.date().optional(),
			not: z
				.union([z.coerce.date(), z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema)])
				.optional()
				.nullable(),
			_count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
			_min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
			_max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
		})
		.strict();

export const TodoCreateWithoutUserInputSchema: z.ZodType<Prisma.TodoCreateWithoutUserInput> = z
	.object({
		id: z.string().optional(),
		title: z.string(),
		description: z.string().optional().nullable(),
		status: z.string().optional(),
		priority: z.string().optional(),
		dueDate: z.coerce.date().optional().nullable(),
		completedAt: z.coerce.date().optional().nullable(),
		createdAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
		category: z.lazy(() => CategoryCreateNestedOneWithoutTodosInputSchema).optional(),
	})
	.strict();

export const TodoUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.TodoUncheckedCreateWithoutUserInput> = z
	.object({
		id: z.string().optional(),
		title: z.string(),
		description: z.string().optional().nullable(),
		status: z.string().optional(),
		priority: z.string().optional(),
		dueDate: z.coerce.date().optional().nullable(),
		completedAt: z.coerce.date().optional().nullable(),
		createdAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
		categoryId: z.string().optional().nullable(),
	})
	.strict();

export const TodoCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.TodoCreateOrConnectWithoutUserInput> = z
	.object({
		where: z.lazy(() => TodoWhereUniqueInputSchema),
		create: z.union([
			z.lazy(() => TodoCreateWithoutUserInputSchema),
			z.lazy(() => TodoUncheckedCreateWithoutUserInputSchema),
		]),
	})
	.strict();

export const TodoCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.TodoCreateManyUserInputEnvelope> = z
	.object({
		data: z.union([z.lazy(() => TodoCreateManyUserInputSchema), z.lazy(() => TodoCreateManyUserInputSchema).array()]),
	})
	.strict();

export const TodoUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.TodoUpsertWithWhereUniqueWithoutUserInput> =
	z
		.object({
			where: z.lazy(() => TodoWhereUniqueInputSchema),
			update: z.union([
				z.lazy(() => TodoUpdateWithoutUserInputSchema),
				z.lazy(() => TodoUncheckedUpdateWithoutUserInputSchema),
			]),
			create: z.union([
				z.lazy(() => TodoCreateWithoutUserInputSchema),
				z.lazy(() => TodoUncheckedCreateWithoutUserInputSchema),
			]),
		})
		.strict();

export const TodoUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.TodoUpdateWithWhereUniqueWithoutUserInput> =
	z
		.object({
			where: z.lazy(() => TodoWhereUniqueInputSchema),
			data: z.union([
				z.lazy(() => TodoUpdateWithoutUserInputSchema),
				z.lazy(() => TodoUncheckedUpdateWithoutUserInputSchema),
			]),
		})
		.strict();

export const TodoUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.TodoUpdateManyWithWhereWithoutUserInput> =
	z
		.object({
			where: z.lazy(() => TodoScalarWhereInputSchema),
			data: z.union([
				z.lazy(() => TodoUpdateManyMutationInputSchema),
				z.lazy(() => TodoUncheckedUpdateManyWithoutUserInputSchema),
			]),
		})
		.strict();

export const TodoScalarWhereInputSchema: z.ZodType<Prisma.TodoScalarWhereInput> = z
	.object({
		AND: z
			.union([z.lazy(() => TodoScalarWhereInputSchema), z.lazy(() => TodoScalarWhereInputSchema).array()])
			.optional(),
		OR: z
			.lazy(() => TodoScalarWhereInputSchema)
			.array()
			.optional(),
		NOT: z
			.union([z.lazy(() => TodoScalarWhereInputSchema), z.lazy(() => TodoScalarWhereInputSchema).array()])
			.optional(),
		id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		title: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		description: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		status: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		priority: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
		dueDate: z
			.union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
			.optional()
			.nullable(),
		completedAt: z
			.union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
			.optional()
			.nullable(),
		createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
		updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
		userId: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
		categoryId: z
			.union([z.lazy(() => StringNullableFilterSchema), z.string()])
			.optional()
			.nullable(),
	})
	.strict();

export const TodoCreateWithoutCategoryInputSchema: z.ZodType<Prisma.TodoCreateWithoutCategoryInput> = z
	.object({
		id: z.string().optional(),
		title: z.string(),
		description: z.string().optional().nullable(),
		status: z.string().optional(),
		priority: z.string().optional(),
		dueDate: z.coerce.date().optional().nullable(),
		completedAt: z.coerce.date().optional().nullable(),
		createdAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
		user: z.lazy(() => UserCreateNestedOneWithoutTodosInputSchema).optional(),
	})
	.strict();

export const TodoUncheckedCreateWithoutCategoryInputSchema: z.ZodType<Prisma.TodoUncheckedCreateWithoutCategoryInput> =
	z
		.object({
			id: z.string().optional(),
			title: z.string(),
			description: z.string().optional().nullable(),
			status: z.string().optional(),
			priority: z.string().optional(),
			dueDate: z.coerce.date().optional().nullable(),
			completedAt: z.coerce.date().optional().nullable(),
			createdAt: z.coerce.date().optional(),
			updatedAt: z.coerce.date().optional(),
			userId: z.string().optional().nullable(),
		})
		.strict();

export const TodoCreateOrConnectWithoutCategoryInputSchema: z.ZodType<Prisma.TodoCreateOrConnectWithoutCategoryInput> =
	z
		.object({
			where: z.lazy(() => TodoWhereUniqueInputSchema),
			create: z.union([
				z.lazy(() => TodoCreateWithoutCategoryInputSchema),
				z.lazy(() => TodoUncheckedCreateWithoutCategoryInputSchema),
			]),
		})
		.strict();

export const TodoCreateManyCategoryInputEnvelopeSchema: z.ZodType<Prisma.TodoCreateManyCategoryInputEnvelope> = z
	.object({
		data: z.union([
			z.lazy(() => TodoCreateManyCategoryInputSchema),
			z.lazy(() => TodoCreateManyCategoryInputSchema).array(),
		]),
	})
	.strict();

export const TodoUpsertWithWhereUniqueWithoutCategoryInputSchema: z.ZodType<Prisma.TodoUpsertWithWhereUniqueWithoutCategoryInput> =
	z
		.object({
			where: z.lazy(() => TodoWhereUniqueInputSchema),
			update: z.union([
				z.lazy(() => TodoUpdateWithoutCategoryInputSchema),
				z.lazy(() => TodoUncheckedUpdateWithoutCategoryInputSchema),
			]),
			create: z.union([
				z.lazy(() => TodoCreateWithoutCategoryInputSchema),
				z.lazy(() => TodoUncheckedCreateWithoutCategoryInputSchema),
			]),
		})
		.strict();

export const TodoUpdateWithWhereUniqueWithoutCategoryInputSchema: z.ZodType<Prisma.TodoUpdateWithWhereUniqueWithoutCategoryInput> =
	z
		.object({
			where: z.lazy(() => TodoWhereUniqueInputSchema),
			data: z.union([
				z.lazy(() => TodoUpdateWithoutCategoryInputSchema),
				z.lazy(() => TodoUncheckedUpdateWithoutCategoryInputSchema),
			]),
		})
		.strict();

export const TodoUpdateManyWithWhereWithoutCategoryInputSchema: z.ZodType<Prisma.TodoUpdateManyWithWhereWithoutCategoryInput> =
	z
		.object({
			where: z.lazy(() => TodoScalarWhereInputSchema),
			data: z.union([
				z.lazy(() => TodoUpdateManyMutationInputSchema),
				z.lazy(() => TodoUncheckedUpdateManyWithoutCategoryInputSchema),
			]),
		})
		.strict();

export const UserCreateWithoutTodosInputSchema: z.ZodType<Prisma.UserCreateWithoutTodosInput> = z
	.object({
		id: z.string().optional(),
		email: z.string(),
		name: z.string(),
		avatar: z.string().optional().nullable(),
		createdAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
	})
	.strict();

export const UserUncheckedCreateWithoutTodosInputSchema: z.ZodType<Prisma.UserUncheckedCreateWithoutTodosInput> = z
	.object({
		id: z.string().optional(),
		email: z.string(),
		name: z.string(),
		avatar: z.string().optional().nullable(),
		createdAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
	})
	.strict();

export const UserCreateOrConnectWithoutTodosInputSchema: z.ZodType<Prisma.UserCreateOrConnectWithoutTodosInput> = z
	.object({
		where: z.lazy(() => UserWhereUniqueInputSchema),
		create: z.union([
			z.lazy(() => UserCreateWithoutTodosInputSchema),
			z.lazy(() => UserUncheckedCreateWithoutTodosInputSchema),
		]),
	})
	.strict();

export const CategoryCreateWithoutTodosInputSchema: z.ZodType<Prisma.CategoryCreateWithoutTodosInput> = z
	.object({
		id: z.string().optional(),
		name: z.string(),
		color: z.string().optional(),
		createdAt: z.coerce.date().optional(),
	})
	.strict();

export const CategoryUncheckedCreateWithoutTodosInputSchema: z.ZodType<Prisma.CategoryUncheckedCreateWithoutTodosInput> =
	z
		.object({
			id: z.string().optional(),
			name: z.string(),
			color: z.string().optional(),
			createdAt: z.coerce.date().optional(),
		})
		.strict();

export const CategoryCreateOrConnectWithoutTodosInputSchema: z.ZodType<Prisma.CategoryCreateOrConnectWithoutTodosInput> =
	z
		.object({
			where: z.lazy(() => CategoryWhereUniqueInputSchema),
			create: z.union([
				z.lazy(() => CategoryCreateWithoutTodosInputSchema),
				z.lazy(() => CategoryUncheckedCreateWithoutTodosInputSchema),
			]),
		})
		.strict();

export const UserUpsertWithoutTodosInputSchema: z.ZodType<Prisma.UserUpsertWithoutTodosInput> = z
	.object({
		update: z.union([
			z.lazy(() => UserUpdateWithoutTodosInputSchema),
			z.lazy(() => UserUncheckedUpdateWithoutTodosInputSchema),
		]),
		create: z.union([
			z.lazy(() => UserCreateWithoutTodosInputSchema),
			z.lazy(() => UserUncheckedCreateWithoutTodosInputSchema),
		]),
		where: z.lazy(() => UserWhereInputSchema).optional(),
	})
	.strict();

export const UserUpdateToOneWithWhereWithoutTodosInputSchema: z.ZodType<Prisma.UserUpdateToOneWithWhereWithoutTodosInput> =
	z
		.object({
			where: z.lazy(() => UserWhereInputSchema).optional(),
			data: z.union([
				z.lazy(() => UserUpdateWithoutTodosInputSchema),
				z.lazy(() => UserUncheckedUpdateWithoutTodosInputSchema),
			]),
		})
		.strict();

export const UserUpdateWithoutTodosInputSchema: z.ZodType<Prisma.UserUpdateWithoutTodosInput> = z
	.object({
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		avatar: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const UserUncheckedUpdateWithoutTodosInputSchema: z.ZodType<Prisma.UserUncheckedUpdateWithoutTodosInput> = z
	.object({
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		email: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		avatar: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const CategoryUpsertWithoutTodosInputSchema: z.ZodType<Prisma.CategoryUpsertWithoutTodosInput> = z
	.object({
		update: z.union([
			z.lazy(() => CategoryUpdateWithoutTodosInputSchema),
			z.lazy(() => CategoryUncheckedUpdateWithoutTodosInputSchema),
		]),
		create: z.union([
			z.lazy(() => CategoryCreateWithoutTodosInputSchema),
			z.lazy(() => CategoryUncheckedCreateWithoutTodosInputSchema),
		]),
		where: z.lazy(() => CategoryWhereInputSchema).optional(),
	})
	.strict();

export const CategoryUpdateToOneWithWhereWithoutTodosInputSchema: z.ZodType<Prisma.CategoryUpdateToOneWithWhereWithoutTodosInput> =
	z
		.object({
			where: z.lazy(() => CategoryWhereInputSchema).optional(),
			data: z.union([
				z.lazy(() => CategoryUpdateWithoutTodosInputSchema),
				z.lazy(() => CategoryUncheckedUpdateWithoutTodosInputSchema),
			]),
		})
		.strict();

export const CategoryUpdateWithoutTodosInputSchema: z.ZodType<Prisma.CategoryUpdateWithoutTodosInput> = z
	.object({
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		color: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
	})
	.strict();

export const CategoryUncheckedUpdateWithoutTodosInputSchema: z.ZodType<Prisma.CategoryUncheckedUpdateWithoutTodosInput> =
	z
		.object({
			id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
			name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
			color: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
			createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		})
		.strict();

export const TodoCreateManyUserInputSchema: z.ZodType<Prisma.TodoCreateManyUserInput> = z
	.object({
		id: z.string().optional(),
		title: z.string(),
		description: z.string().optional().nullable(),
		status: z.string().optional(),
		priority: z.string().optional(),
		dueDate: z.coerce.date().optional().nullable(),
		completedAt: z.coerce.date().optional().nullable(),
		createdAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
		categoryId: z.string().optional().nullable(),
	})
	.strict();

export const TodoUpdateWithoutUserInputSchema: z.ZodType<Prisma.TodoUpdateWithoutUserInput> = z
	.object({
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		title: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		description: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		status: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		priority: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		dueDate: z
			.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		completedAt: z
			.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		category: z.lazy(() => CategoryUpdateOneWithoutTodosNestedInputSchema).optional(),
	})
	.strict();

export const TodoUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.TodoUncheckedUpdateWithoutUserInput> = z
	.object({
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		title: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		description: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		status: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		priority: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		dueDate: z
			.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		completedAt: z
			.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		categoryId: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
	})
	.strict();

export const TodoUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.TodoUncheckedUpdateManyWithoutUserInput> =
	z
		.object({
			id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
			title: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
			description: z
				.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
				.optional()
				.nullable(),
			status: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
			priority: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
			dueDate: z
				.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
				.optional()
				.nullable(),
			completedAt: z
				.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
				.optional()
				.nullable(),
			createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
			updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
			categoryId: z
				.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
				.optional()
				.nullable(),
		})
		.strict();

export const TodoCreateManyCategoryInputSchema: z.ZodType<Prisma.TodoCreateManyCategoryInput> = z
	.object({
		id: z.string().optional(),
		title: z.string(),
		description: z.string().optional().nullable(),
		status: z.string().optional(),
		priority: z.string().optional(),
		dueDate: z.coerce.date().optional().nullable(),
		completedAt: z.coerce.date().optional().nullable(),
		createdAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
		userId: z.string().optional().nullable(),
	})
	.strict();

export const TodoUpdateWithoutCategoryInputSchema: z.ZodType<Prisma.TodoUpdateWithoutCategoryInput> = z
	.object({
		id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		title: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		description: z
			.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		status: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		priority: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
		dueDate: z
			.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		completedAt: z
			.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
			.optional()
			.nullable(),
		createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
		user: z.lazy(() => UserUpdateOneWithoutTodosNestedInputSchema).optional(),
	})
	.strict();

export const TodoUncheckedUpdateWithoutCategoryInputSchema: z.ZodType<Prisma.TodoUncheckedUpdateWithoutCategoryInput> =
	z
		.object({
			id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
			title: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
			description: z
				.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
				.optional()
				.nullable(),
			status: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
			priority: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
			dueDate: z
				.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
				.optional()
				.nullable(),
			completedAt: z
				.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
				.optional()
				.nullable(),
			createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
			updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
			userId: z
				.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
				.optional()
				.nullable(),
		})
		.strict();

export const TodoUncheckedUpdateManyWithoutCategoryInputSchema: z.ZodType<Prisma.TodoUncheckedUpdateManyWithoutCategoryInput> =
	z
		.object({
			id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
			title: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
			description: z
				.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
				.optional()
				.nullable(),
			status: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
			priority: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
			dueDate: z
				.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
				.optional()
				.nullable(),
			completedAt: z
				.union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
				.optional()
				.nullable(),
			createdAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
			updatedAt: z.union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)]).optional(),
			userId: z
				.union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
				.optional()
				.nullable(),
		})
		.strict();

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const UserFindFirstArgsSchema: z.ZodType<Prisma.UserFindFirstArgs> = z
	.object({
		select: UserSelectSchema.optional(),
		include: UserIncludeSchema.optional(),
		where: UserWhereInputSchema.optional(),
		orderBy: z.union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema]).optional(),
		cursor: UserWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const UserFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UserFindFirstOrThrowArgs> = z
	.object({
		select: UserSelectSchema.optional(),
		include: UserIncludeSchema.optional(),
		where: UserWhereInputSchema.optional(),
		orderBy: z.union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema]).optional(),
		cursor: UserWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const UserFindManyArgsSchema: z.ZodType<Prisma.UserFindManyArgs> = z
	.object({
		select: UserSelectSchema.optional(),
		include: UserIncludeSchema.optional(),
		where: UserWhereInputSchema.optional(),
		orderBy: z.union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema]).optional(),
		cursor: UserWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([UserScalarFieldEnumSchema, UserScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const UserAggregateArgsSchema: z.ZodType<Prisma.UserAggregateArgs> = z
	.object({
		where: UserWhereInputSchema.optional(),
		orderBy: z.union([UserOrderByWithRelationInputSchema.array(), UserOrderByWithRelationInputSchema]).optional(),
		cursor: UserWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const UserGroupByArgsSchema: z.ZodType<Prisma.UserGroupByArgs> = z
	.object({
		where: UserWhereInputSchema.optional(),
		orderBy: z.union([UserOrderByWithAggregationInputSchema.array(), UserOrderByWithAggregationInputSchema]).optional(),
		by: UserScalarFieldEnumSchema.array(),
		having: UserScalarWhereWithAggregatesInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const UserFindUniqueArgsSchema: z.ZodType<Prisma.UserFindUniqueArgs> = z
	.object({
		select: UserSelectSchema.optional(),
		include: UserIncludeSchema.optional(),
		where: UserWhereUniqueInputSchema,
	})
	.strict();

export const UserFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UserFindUniqueOrThrowArgs> = z
	.object({
		select: UserSelectSchema.optional(),
		include: UserIncludeSchema.optional(),
		where: UserWhereUniqueInputSchema,
	})
	.strict();

export const CategoryFindFirstArgsSchema: z.ZodType<Prisma.CategoryFindFirstArgs> = z
	.object({
		select: CategorySelectSchema.optional(),
		include: CategoryIncludeSchema.optional(),
		where: CategoryWhereInputSchema.optional(),
		orderBy: z
			.union([CategoryOrderByWithRelationInputSchema.array(), CategoryOrderByWithRelationInputSchema])
			.optional(),
		cursor: CategoryWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([CategoryScalarFieldEnumSchema, CategoryScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const CategoryFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CategoryFindFirstOrThrowArgs> = z
	.object({
		select: CategorySelectSchema.optional(),
		include: CategoryIncludeSchema.optional(),
		where: CategoryWhereInputSchema.optional(),
		orderBy: z
			.union([CategoryOrderByWithRelationInputSchema.array(), CategoryOrderByWithRelationInputSchema])
			.optional(),
		cursor: CategoryWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([CategoryScalarFieldEnumSchema, CategoryScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const CategoryFindManyArgsSchema: z.ZodType<Prisma.CategoryFindManyArgs> = z
	.object({
		select: CategorySelectSchema.optional(),
		include: CategoryIncludeSchema.optional(),
		where: CategoryWhereInputSchema.optional(),
		orderBy: z
			.union([CategoryOrderByWithRelationInputSchema.array(), CategoryOrderByWithRelationInputSchema])
			.optional(),
		cursor: CategoryWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([CategoryScalarFieldEnumSchema, CategoryScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const CategoryAggregateArgsSchema: z.ZodType<Prisma.CategoryAggregateArgs> = z
	.object({
		where: CategoryWhereInputSchema.optional(),
		orderBy: z
			.union([CategoryOrderByWithRelationInputSchema.array(), CategoryOrderByWithRelationInputSchema])
			.optional(),
		cursor: CategoryWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const CategoryGroupByArgsSchema: z.ZodType<Prisma.CategoryGroupByArgs> = z
	.object({
		where: CategoryWhereInputSchema.optional(),
		orderBy: z
			.union([CategoryOrderByWithAggregationInputSchema.array(), CategoryOrderByWithAggregationInputSchema])
			.optional(),
		by: CategoryScalarFieldEnumSchema.array(),
		having: CategoryScalarWhereWithAggregatesInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const CategoryFindUniqueArgsSchema: z.ZodType<Prisma.CategoryFindUniqueArgs> = z
	.object({
		select: CategorySelectSchema.optional(),
		include: CategoryIncludeSchema.optional(),
		where: CategoryWhereUniqueInputSchema,
	})
	.strict();

export const CategoryFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.CategoryFindUniqueOrThrowArgs> = z
	.object({
		select: CategorySelectSchema.optional(),
		include: CategoryIncludeSchema.optional(),
		where: CategoryWhereUniqueInputSchema,
	})
	.strict();

export const TodoFindFirstArgsSchema: z.ZodType<Prisma.TodoFindFirstArgs> = z
	.object({
		select: TodoSelectSchema.optional(),
		include: TodoIncludeSchema.optional(),
		where: TodoWhereInputSchema.optional(),
		orderBy: z.union([TodoOrderByWithRelationInputSchema.array(), TodoOrderByWithRelationInputSchema]).optional(),
		cursor: TodoWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([TodoScalarFieldEnumSchema, TodoScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const TodoFindFirstOrThrowArgsSchema: z.ZodType<Prisma.TodoFindFirstOrThrowArgs> = z
	.object({
		select: TodoSelectSchema.optional(),
		include: TodoIncludeSchema.optional(),
		where: TodoWhereInputSchema.optional(),
		orderBy: z.union([TodoOrderByWithRelationInputSchema.array(), TodoOrderByWithRelationInputSchema]).optional(),
		cursor: TodoWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([TodoScalarFieldEnumSchema, TodoScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const TodoFindManyArgsSchema: z.ZodType<Prisma.TodoFindManyArgs> = z
	.object({
		select: TodoSelectSchema.optional(),
		include: TodoIncludeSchema.optional(),
		where: TodoWhereInputSchema.optional(),
		orderBy: z.union([TodoOrderByWithRelationInputSchema.array(), TodoOrderByWithRelationInputSchema]).optional(),
		cursor: TodoWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
		distinct: z.union([TodoScalarFieldEnumSchema, TodoScalarFieldEnumSchema.array()]).optional(),
	})
	.strict();

export const TodoAggregateArgsSchema: z.ZodType<Prisma.TodoAggregateArgs> = z
	.object({
		where: TodoWhereInputSchema.optional(),
		orderBy: z.union([TodoOrderByWithRelationInputSchema.array(), TodoOrderByWithRelationInputSchema]).optional(),
		cursor: TodoWhereUniqueInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const TodoGroupByArgsSchema: z.ZodType<Prisma.TodoGroupByArgs> = z
	.object({
		where: TodoWhereInputSchema.optional(),
		orderBy: z.union([TodoOrderByWithAggregationInputSchema.array(), TodoOrderByWithAggregationInputSchema]).optional(),
		by: TodoScalarFieldEnumSchema.array(),
		having: TodoScalarWhereWithAggregatesInputSchema.optional(),
		take: z.number().optional(),
		skip: z.number().optional(),
	})
	.strict();

export const TodoFindUniqueArgsSchema: z.ZodType<Prisma.TodoFindUniqueArgs> = z
	.object({
		select: TodoSelectSchema.optional(),
		include: TodoIncludeSchema.optional(),
		where: TodoWhereUniqueInputSchema,
	})
	.strict();

export const TodoFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.TodoFindUniqueOrThrowArgs> = z
	.object({
		select: TodoSelectSchema.optional(),
		include: TodoIncludeSchema.optional(),
		where: TodoWhereUniqueInputSchema,
	})
	.strict();

export const UserCreateArgsSchema: z.ZodType<Prisma.UserCreateArgs> = z
	.object({
		select: UserSelectSchema.optional(),
		include: UserIncludeSchema.optional(),
		data: z.union([UserCreateInputSchema, UserUncheckedCreateInputSchema]),
	})
	.strict();

export const UserUpsertArgsSchema: z.ZodType<Prisma.UserUpsertArgs> = z
	.object({
		select: UserSelectSchema.optional(),
		include: UserIncludeSchema.optional(),
		where: UserWhereUniqueInputSchema,
		create: z.union([UserCreateInputSchema, UserUncheckedCreateInputSchema]),
		update: z.union([UserUpdateInputSchema, UserUncheckedUpdateInputSchema]),
	})
	.strict();

export const UserCreateManyArgsSchema: z.ZodType<Prisma.UserCreateManyArgs> = z
	.object({
		data: z.union([UserCreateManyInputSchema, UserCreateManyInputSchema.array()]),
	})
	.strict();

export const UserCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UserCreateManyAndReturnArgs> = z
	.object({
		data: z.union([UserCreateManyInputSchema, UserCreateManyInputSchema.array()]),
	})
	.strict();

export const UserDeleteArgsSchema: z.ZodType<Prisma.UserDeleteArgs> = z
	.object({
		select: UserSelectSchema.optional(),
		include: UserIncludeSchema.optional(),
		where: UserWhereUniqueInputSchema,
	})
	.strict();

export const UserUpdateArgsSchema: z.ZodType<Prisma.UserUpdateArgs> = z
	.object({
		select: UserSelectSchema.optional(),
		include: UserIncludeSchema.optional(),
		data: z.union([UserUpdateInputSchema, UserUncheckedUpdateInputSchema]),
		where: UserWhereUniqueInputSchema,
	})
	.strict();

export const UserUpdateManyArgsSchema: z.ZodType<Prisma.UserUpdateManyArgs> = z
	.object({
		data: z.union([UserUpdateManyMutationInputSchema, UserUncheckedUpdateManyInputSchema]),
		where: UserWhereInputSchema.optional(),
	})
	.strict();

export const UserDeleteManyArgsSchema: z.ZodType<Prisma.UserDeleteManyArgs> = z
	.object({
		where: UserWhereInputSchema.optional(),
	})
	.strict();

export const CategoryCreateArgsSchema: z.ZodType<Prisma.CategoryCreateArgs> = z
	.object({
		select: CategorySelectSchema.optional(),
		include: CategoryIncludeSchema.optional(),
		data: z.union([CategoryCreateInputSchema, CategoryUncheckedCreateInputSchema]),
	})
	.strict();

export const CategoryUpsertArgsSchema: z.ZodType<Prisma.CategoryUpsertArgs> = z
	.object({
		select: CategorySelectSchema.optional(),
		include: CategoryIncludeSchema.optional(),
		where: CategoryWhereUniqueInputSchema,
		create: z.union([CategoryCreateInputSchema, CategoryUncheckedCreateInputSchema]),
		update: z.union([CategoryUpdateInputSchema, CategoryUncheckedUpdateInputSchema]),
	})
	.strict();

export const CategoryCreateManyArgsSchema: z.ZodType<Prisma.CategoryCreateManyArgs> = z
	.object({
		data: z.union([CategoryCreateManyInputSchema, CategoryCreateManyInputSchema.array()]),
	})
	.strict();

export const CategoryCreateManyAndReturnArgsSchema: z.ZodType<Prisma.CategoryCreateManyAndReturnArgs> = z
	.object({
		data: z.union([CategoryCreateManyInputSchema, CategoryCreateManyInputSchema.array()]),
	})
	.strict();

export const CategoryDeleteArgsSchema: z.ZodType<Prisma.CategoryDeleteArgs> = z
	.object({
		select: CategorySelectSchema.optional(),
		include: CategoryIncludeSchema.optional(),
		where: CategoryWhereUniqueInputSchema,
	})
	.strict();

export const CategoryUpdateArgsSchema: z.ZodType<Prisma.CategoryUpdateArgs> = z
	.object({
		select: CategorySelectSchema.optional(),
		include: CategoryIncludeSchema.optional(),
		data: z.union([CategoryUpdateInputSchema, CategoryUncheckedUpdateInputSchema]),
		where: CategoryWhereUniqueInputSchema,
	})
	.strict();

export const CategoryUpdateManyArgsSchema: z.ZodType<Prisma.CategoryUpdateManyArgs> = z
	.object({
		data: z.union([CategoryUpdateManyMutationInputSchema, CategoryUncheckedUpdateManyInputSchema]),
		where: CategoryWhereInputSchema.optional(),
	})
	.strict();

export const CategoryDeleteManyArgsSchema: z.ZodType<Prisma.CategoryDeleteManyArgs> = z
	.object({
		where: CategoryWhereInputSchema.optional(),
	})
	.strict();

export const TodoCreateArgsSchema: z.ZodType<Prisma.TodoCreateArgs> = z
	.object({
		select: TodoSelectSchema.optional(),
		include: TodoIncludeSchema.optional(),
		data: z.union([TodoCreateInputSchema, TodoUncheckedCreateInputSchema]),
	})
	.strict();

export const TodoUpsertArgsSchema: z.ZodType<Prisma.TodoUpsertArgs> = z
	.object({
		select: TodoSelectSchema.optional(),
		include: TodoIncludeSchema.optional(),
		where: TodoWhereUniqueInputSchema,
		create: z.union([TodoCreateInputSchema, TodoUncheckedCreateInputSchema]),
		update: z.union([TodoUpdateInputSchema, TodoUncheckedUpdateInputSchema]),
	})
	.strict();

export const TodoCreateManyArgsSchema: z.ZodType<Prisma.TodoCreateManyArgs> = z
	.object({
		data: z.union([TodoCreateManyInputSchema, TodoCreateManyInputSchema.array()]),
	})
	.strict();

export const TodoCreateManyAndReturnArgsSchema: z.ZodType<Prisma.TodoCreateManyAndReturnArgs> = z
	.object({
		data: z.union([TodoCreateManyInputSchema, TodoCreateManyInputSchema.array()]),
	})
	.strict();

export const TodoDeleteArgsSchema: z.ZodType<Prisma.TodoDeleteArgs> = z
	.object({
		select: TodoSelectSchema.optional(),
		include: TodoIncludeSchema.optional(),
		where: TodoWhereUniqueInputSchema,
	})
	.strict();

export const TodoUpdateArgsSchema: z.ZodType<Prisma.TodoUpdateArgs> = z
	.object({
		select: TodoSelectSchema.optional(),
		include: TodoIncludeSchema.optional(),
		data: z.union([TodoUpdateInputSchema, TodoUncheckedUpdateInputSchema]),
		where: TodoWhereUniqueInputSchema,
	})
	.strict();

export const TodoUpdateManyArgsSchema: z.ZodType<Prisma.TodoUpdateManyArgs> = z
	.object({
		data: z.union([TodoUpdateManyMutationInputSchema, TodoUncheckedUpdateManyInputSchema]),
		where: TodoWhereInputSchema.optional(),
	})
	.strict();

export const TodoDeleteManyArgsSchema: z.ZodType<Prisma.TodoDeleteManyArgs> = z
	.object({
		where: TodoWhereInputSchema.optional(),
	})
	.strict();
