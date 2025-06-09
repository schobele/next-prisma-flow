import { join } from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { formatGeneratedFileHeader, writeFile } from "../utils.js";

export async function generateSchemas(
	modelInfo: ModelInfo,
	context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName } = modelInfo;

	const template = `${formatGeneratedFileHeader()}import {
	${modelName}CreateInputSchema,
	${modelName}CreateManyInputSchema,
	${modelName}FindFirstArgsSchema,
	${modelName}FindManyArgsSchema,
	${modelName}UpdateInputSchema,
	${modelName}WhereInputSchema,
	${modelName}WhereUniqueInputSchema,
} from "../zod";

export const schemas = {
	whereUnique: ${modelName}WhereUniqueInputSchema,
	where: ${modelName}WhereInputSchema,
	createInput: ${modelName}CreateInputSchema,
	createManyInput: ${modelName}CreateManyInputSchema,
	updateInput: ${modelName}UpdateInputSchema,
	findFirstArgs: ${modelName}FindFirstArgsSchema,
	findManyArgs: ${modelName}FindManyArgsSchema,
	// Adding create and update for form factory compatibility
	create: ${modelName}CreateInputSchema,
	update: ${modelName}UpdateInputSchema,
};
`;

	const filePath = join(modelDir, "schemas.ts");
	await writeFile(filePath, template);
}
