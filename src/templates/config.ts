import { join } from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { formatGeneratedFileHeader, writeFile, camelCase } from "../utils.js";
import { analyzeModel } from "../model-analyzer.js";
import { analyzeSchemaRelationships } from "../relationship-analyzer.js";

export async function generateModelConfig(
	modelInfo: ModelInfo,
	context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName, lowerName, camelCaseName, selectFields } = modelInfo;

	// Create select object from configured fields using the same logic as types
	const selectObject = createSelectObject(modelInfo, context);

	const template = `${formatGeneratedFileHeader()}import { prisma } from "../prisma";
import type { SelectInput } from "./types";

export const model = "${camelCaseName}" as const;
export const modelPrismaClient = prisma[model];
export const select: SelectInput = ${selectObject};
`;

	const filePath = join(modelDir, "config.ts");
	await writeFile(filePath, template);
}

function createSelectObject(modelInfo: ModelInfo, context: GeneratorContext): string {
	const { selectFields, analyzed } = modelInfo;

	if (!selectFields || selectFields.length === 0) {
		return "true"; // Select all fields
	}

	// Build select with circular reference detection
	return buildSelectObject(modelInfo, context, new Set()).trimmedResult;
}

function buildSelectObject(
	modelInfo: ModelInfo,
	context: GeneratorContext,
	visited: Set<string>,
): { trimmedResult: string; fullResult: string } {
	const { selectFields, analyzed, name: currentModelName } = modelInfo;

	if (!selectFields || selectFields.length === 0) {
		return { trimmedResult: "true", fullResult: "true" };
	}

	// Add current model to visited set to prevent circular references
	const newVisited = new Set([...visited, currentModelName]);

	const selectEntries: string[] = [];

	for (const field of selectFields) {
		// Check if this is a relation field
		const relationField = [...(analyzed.relationships?.owns || []), ...(analyzed.relationships?.referencedBy || [])].find(
			(rel: any) => rel.fieldName === field,
		);

		if (relationField) {
			const relatedModelName = relationField.relatedModel;

			// Skip if we would create a circular reference
			if (visited.has(relatedModelName)) {
				continue; // Drop the field to avoid circular reference
			}

			// Get the related model's configuration
			const relatedModelConfig = getModelConfig(relatedModelName, context);
			const relatedSelectFields = getSelectFieldsForModel(relatedModelName, relatedModelConfig, context);

			if (relatedSelectFields.length === 0) {
				// No select configuration for related model, select all fields
				selectEntries.push(`\t${field}: true`);
			} else {
				// Create a temporary ModelInfo for the related model to build its select
				const relatedModel = context.dmmf.datamodel.models.find((m) => m.name === relatedModelName);
				if (relatedModel) {
					// Analyze the related model properly
					const schemaRelationships = analyzeSchemaRelationships(context.dmmf);
					const relatedModelRelationships = schemaRelationships.get(relatedModelName);
					const relatedRelationshipInfo = relatedModelRelationships
						? {
								owns: relatedModelRelationships.ownsRelations,
								referencedBy: relatedModelRelationships.referencedBy,
								relatedModels: Array.from(relatedModelRelationships.relatedModels),
							}
						: undefined;

					const relatedAnalyzed = analyzeModel(relatedModel, relatedRelationshipInfo);
					const relatedModelInfo = {
						name: relatedModelName,
						lowerName: relatedModelName.toLowerCase(),
						camelCaseName: camelCase(relatedModelName),
						pluralName: "", // Not needed for select generation
						lowerPluralName: "", // Not needed for select generation
						config: relatedModelConfig,
						model: relatedModel,
						selectFields: relatedSelectFields,
						analyzed: relatedAnalyzed,
						validationRules: [],
					};

					const nestedSelect = buildSelectObject(relatedModelInfo, context, newVisited);

					if (nestedSelect.trimmedResult === "true") {
						selectEntries.push(`\t${field}: true`);
					} else {
						selectEntries.push(`\t${field}: {
\t\tselect: ${nestedSelect.trimmedResult},
\t}`);
					}
				} else {
					// Fallback if model not found
					selectEntries.push(`\t${field}: true`);
				}
			}
		} else {
			// Regular field
			selectEntries.push(`\t${field}: true`);
		}
	}

	const result =
		selectEntries.length > 0
			? `{
${selectEntries.join(",\n")},
}`
			: "{}";

	return { trimmedResult: result, fullResult: result };
}

function getModelConfig(modelName: string, context: GeneratorContext): any {
	const lowerModelName = modelName.toLowerCase();
	return context.config[lowerModelName] || {};
}

function getSelectFieldsForModel(modelName: string, modelConfig: any, context: GeneratorContext): string[] {
	if (modelConfig.select && Array.isArray(modelConfig.select)) {
		return modelConfig.select;
	}

	// Default: all scalar and enum fields
	const model = context.dmmf.datamodel.models.find((m) => m.name === modelName);
	if (model) {
		return model.fields.filter((f) => f.kind === "scalar" || f.kind === "enum").map((f) => f.name);
	}

	return [];
}
