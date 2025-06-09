import {
	PostCreateInputSchema,
	PostCreateManyInputSchema,
	PostFindFirstArgsSchema,
	PostFindManyArgsSchema,
	PostUpdateInputSchema,
	PostWhereInputSchema,
	PostWhereUniqueInputSchema,
} from "../zod";

export const schemas = {
	whereUnique: PostWhereUniqueInputSchema,
	where: PostWhereInputSchema,
	createInput: PostCreateInputSchema,
	createManyInput: PostCreateManyInputSchema,
	updateInput: PostUpdateInputSchema,
	findFirstArgs: PostFindFirstArgsSchema,
	findManyArgs: PostFindManyArgsSchema,
};
