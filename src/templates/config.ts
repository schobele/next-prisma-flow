import { join } from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { formatGeneratedFileHeader, writeFile } from "../utils.js";

export async function generateModelConfig(
	modelInfo: ModelInfo,
	context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName, lowerName, selectFields } = modelInfo;

	// Create select object from configured fields
	const selectObject = createSelectObject(selectFields);

	const template = `${formatGeneratedFileHeader()}import { prisma } from "../prisma";
import type { SelectInput } from "./types";

export const model = "${lowerName}" as const;
export const modelPrismaClient = prisma[model];
export const select: SelectInput = ${selectObject};
`;

	const filePath = join(modelDir, "config.ts");
	await writeFile(filePath, template);
}

function createSelectObject(selectFields: string[]): string {
	if (!selectFields || selectFields.length === 0) {
		return "true"; // Select all fields
	}

	const selectEntries = selectFields.map((field) => {
		// Handle nested relations - if field contains a dot, it's a relation
		if (field.includes(".")) {
			const [relationName, ...fieldPath] = field.split(".");
			// For now, keep it simple and just select the relation
			return `\t${relationName}: true`;
		}
		return `\t${field}: true`;
	});

	return `{\n${selectEntries.join(",\n")}\n}`;
}
