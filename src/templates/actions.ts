import { join } from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { formatGeneratedFileHeader, writeFile } from "../utils.js";

export async function generateServerActions(
	modelInfo: ModelInfo,
	_context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName } = modelInfo;

	const template = `${formatGeneratedFileHeader()}"use server";

import { createModelActions } from "../shared/actions/factory";
import { modelPrismaClient, select } from "./config";
import { schemas } from "./schemas";
import type { ModelType } from "./types";

const modelActions = createModelActions<ModelType, typeof schemas, typeof select>(modelPrismaClient, schemas, select);

export const {
	findUnique,
	findMany,
	findFirst,
	create,
	createMany,
	update,
	updateMany,
	upsert,
	remove,
	removeMany,
	count,
} = modelActions;
`;

	const filePath = join(modelDir, "actions.ts");
	await writeFile(filePath, template);
}
