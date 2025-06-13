import {
	PostCreateManyInputSchema,
	PostFindFirstArgsSchema,
	PostFindManyArgsSchema,
	PostUncheckedCreateInputSchema,
	PostUncheckedUpdateInputSchema,
	PostWhereInputSchema,
	PostWhereUniqueInputSchema,
} from "../zod";

export const schemas = {
	whereUnique: PostWhereUniqueInputSchema,
	where: PostWhereInputSchema,
	createInput: PostUncheckedCreateInputSchema,
	createManyInput: PostCreateManyInputSchema,
	updateInput: PostUncheckedUpdateInputSchema,
	findFirstArgs: PostFindFirstArgsSchema,
	findManyArgs: PostFindManyArgsSchema,
};
