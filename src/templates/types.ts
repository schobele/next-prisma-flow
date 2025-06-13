import { join } from "node:path";
import { analyzeModel } from "../model-analyzer.js";
import { analyzeSchemaRelationships } from "../relationship-analyzer.js";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { formatGeneratedFileHeader, writeFile } from "../utils.js";

export async function generateTypeDefinitions(
	modelInfo: ModelInfo,
	context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName, analyzed } = modelInfo;

	// Create select type based on configured fields
	const selectType = createSelectType(modelInfo, context);

	// Generate relationships interface
	const relationshipsInterface = generateRelationshipsInterface(analyzed, modelName);

	const template = `${formatGeneratedFileHeader()}import type { Prisma } from "../prisma";

export type CreateInput = Prisma.${modelName}UncheckedCreateInput;
export type CreateManyInput = Prisma.${modelName}CreateManyInput;
export type UpdateInput = Prisma.${modelName}UncheckedUpdateInput;
export type UpdateManyInput = {
	where: Prisma.${modelName}WhereInput;
	data: Prisma.${modelName}UncheckedUpdateManyInput;
	limit?: number;
};
export type WhereInput = Prisma.${modelName}WhereInput;
export type WhereUniqueInput = Prisma.${modelName}WhereUniqueInput;
export type OrderByInput = Prisma.${modelName}OrderByWithRelationInput;
export type SelectInput = Prisma.${modelName}Select;
export type IncludeInput = Prisma.${modelName}Include;

export type ModelType = Prisma.${modelName}GetPayload<{
	select: ${selectType}
}>;

export type Options = {
	orderBy?: OrderByInput;
};

export type CreateManyOptions = {
	include?: IncludeInput;
	select?: SelectInput;
};

${relationshipsInterface}
`;

	const filePath = join(modelDir, "types.ts");
	await writeFile(filePath, template);
}

function createSelectType(modelInfo: ModelInfo, context: GeneratorContext): string {
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
				selectEntries.push(`\t\t${field}: true`);
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
						selectEntries.push(`\t\t${field}: true`);
					} else {
						selectEntries.push(`\t\t${field}: {
\t\t\tselect: ${nestedSelect.trimmedResult};
\t\t}`);
					}
				} else {
					// Fallback if model not found
					selectEntries.push(`\t\t${field}: true`);
				}
			}
		} else {
			// Regular field
			selectEntries.push(`\t\t${field}: true`);
		}
	}

	const result =
		selectEntries.length > 0
			? `{
${selectEntries.join(";\n")};
\t}`
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

function generateRelationshipsInterface(analyzed: any, modelName: string): string {
	// Get all relationships from both owns and referencedBy
	const allRelationships = [...(analyzed.relationships?.owns || []), ...(analyzed.relationships?.referencedBy || [])];

	if (!allRelationships.length) {
		return `export interface Relationships extends Record<string, { where: any; many: boolean }> {
	// No relationships found for this model
}`;
	}

	// Remove duplicates by field name
	const uniqueRelationships = allRelationships.reduce((acc: any[], rel: any) => {
		if (!acc.find((existing) => existing.fieldName === rel.fieldName)) {
			acc.push(rel);
		}
		return acc;
	}, []);

	const relationEntries = uniqueRelationships
		.map((rel: any) => {
			const isList = rel.type === "one-to-many" || rel.type === "many-to-many";
			const relatedModel = rel.relatedModel;
			const whereType = isList ? `Prisma.${relatedModel}WhereUniqueInput[]` : `Prisma.${relatedModel}WhereUniqueInput`;

			return `\t${rel.fieldName}: { where: ${whereType}; many: ${isList} }`;
		})
		.join(";\n");

	return `export interface Relationships extends Record<string, { where: any; many: boolean }> {
${relationEntries};
}`;
}
