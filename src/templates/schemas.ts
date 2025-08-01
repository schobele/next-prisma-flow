import { join } from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { formatGeneratedFileHeader, writeFile } from "../utils.js";

export async function generateSchemas(
	modelInfo: ModelInfo,
	_context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName } = modelInfo;

	const template = `${formatGeneratedFileHeader()}import {
	${modelName}CreateManyInputSchema,
	${modelName}FindFirstArgsSchema,
	${modelName}FindManyArgsSchema,
	${modelName}UncheckedCreateInputSchema,
	${modelName}UncheckedUpdateInputSchema,
	${modelName}WhereInputSchema,
	${modelName}WhereUniqueInputSchema,
} from "../zod";

export const schemas = {
	whereUnique: ${modelName}WhereUniqueInputSchema,
	where: ${modelName}WhereInputSchema,
	createInput: ${modelName}UncheckedCreateInputSchema,
	createManyInput: ${modelName}CreateManyInputSchema,
	updateInput: ${modelName}UncheckedUpdateInputSchema,
	findFirstArgs: ${modelName}FindFirstArgsSchema,
	findManyArgs: ${modelName}FindManyArgsSchema,
};
`;

	const filePath = join(modelDir, "schemas.ts");
	await writeFile(filePath, template);
}
