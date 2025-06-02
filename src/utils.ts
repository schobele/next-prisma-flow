import path from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import { getPrismaImportForNesting } from "./config.js";
import type { FlowGeneratorConfig, GeneratorContext } from "./types.js";

export function createGeneratorContext(
	config: FlowGeneratorConfig,
	dmmf: DMMF.Document,
	outputPath: string,
): GeneratorContext {
	return {
		config,
		dmmf,
		outputDir: path.resolve(outputPath),
		zodDir: path.join(path.resolve(outputPath), "zod"),
		prismaImport: config.prismaImport || "@prisma/client",
	};
}

/**
 * Gets the correct prismaImport path for a specific file location.
 * @param context - The generator context
 * @param nestingLevel - How many directories deep from output root (0 = root, 1 = model subdirectory)
 */
export function getPrismaImportPath(context: GeneratorContext, nestingLevel = 0): string {
	return getPrismaImportForNesting(context.prismaImport, nestingLevel);
}

/**
 * Gets the correct local zod import path for a specific file location.
 * @param nestingLevel - How many directories deep from output root (0 = root, 1 = model subdirectory)
 */
export function getZodImportPath(nestingLevel = 0): string {
	// Local zod directory is always at ../zod from model subdirectories
	const relativePath = nestingLevel === 0 ? "./zod" : "../zod";
	return relativePath;
}

export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function camelCase(str: string): string {
	return str.charAt(0).toLowerCase() + str.slice(1);
}

export function getModelFields(model: DMMF.Model, selectFields?: string[]): DMMF.Field[] {
	if (selectFields) {
		return model.fields.filter((field) => selectFields.includes(field.name));
	}
	return model.fields.filter((field) => field.kind === "scalar" || field.kind === "enum");
}

export function createSelectObject(fields: string[]): string {
	const selectEntries = fields.map((field) => `${field}: true`).join(", ");
	return `{ ${selectEntries} }`;
}

export function createSelectObjectWithRelations(
	modelInfo: ModelInfo,
	context: GeneratorContext,
	visited: Set<string> = new Set(),
): string {
	const selectEntries: string[] = [];

	// Add current model to visited set to prevent circular references
	visited.add(modelInfo.name);

	for (const fieldName of modelInfo.selectFields) {
		const field = modelInfo.model.fields.find((f) => f.name === fieldName);

		if (!field) {
			// Field not found in model, treat as simple select
			selectEntries.push(`${fieldName}: true`);
			continue;
		}

		if (field.kind === "object") {
			// This is a relationship field
			const relatedModelName = field.type;

			// Check for circular reference
			if (visited.has(relatedModelName)) {
				// Skip this relationship to prevent circular reference
				continue;
			}

			const relatedModelConfig = getModelConfigFromContext(relatedModelName, context);

			if (relatedModelConfig?.selectFields) {
				// Create nested select for the relationship with filtered fields
				const filteredFields = filterFieldsForCircularReference(
					relatedModelConfig.selectFields,
					relatedModelConfig,
					modelInfo.name,
				);

				if (filteredFields.length > 0) {
					const nestedSelect = createSelectObjectWithCircularPrevention(
						filteredFields,
						relatedModelConfig,
						context,
						new Set(visited),
					);
					selectEntries.push(`${fieldName}: { select: ${nestedSelect} }`);
				}
			} else {
				// No specific config for related model, use simple select
				selectEntries.push(`${fieldName}: true`);
			}
		} else {
			// Scalar, enum, or other non-relationship field
			selectEntries.push(`${fieldName}: true`);
		}
	}

	return `{ ${selectEntries.join(", ")} }`;
}

function filterFieldsForCircularReference(
	fields: string[],
	relatedModelConfig: ModelInfo,
	parentModelName: string,
): string[] {
	return fields.filter((fieldName) => {
		const field = relatedModelConfig.model.fields.find((f) => f.name === fieldName);
		if (!field || field.kind !== "object") {
			return true; // Keep non-relationship fields
		}

		// Check if this relationship field points back to the parent model
		if (field.type === parentModelName) {
			return false; // Remove circular reference
		}

		// Check if this is a list relationship that could contain the parent model
		if (field.isList) {
			const relationshipModel = field.type;
			// This is a more complex check - for now, we'll be conservative
			// and remove any list relationships that could potentially create cycles
			return false;
		}

		return true; // Keep other relationship fields
	});
}

function createSelectObjectWithCircularPrevention(
	fields: string[],
	modelInfo: ModelInfo,
	context: GeneratorContext,
	visited: Set<string>,
): string {
	const selectEntries: string[] = [];

	for (const fieldName of fields) {
		const field = modelInfo.model.fields.find((f) => f.name === fieldName);

		if (!field) {
			selectEntries.push(`${fieldName}: true`);
			continue;
		}

		if (field.kind === "object") {
			const relatedModelName = field.type;

			// Skip if already visited (circular reference)
			if (visited.has(relatedModelName)) {
				continue;
			}

			// For deeper relationships, just use simple select to avoid complexity
			selectEntries.push(`${fieldName}: true`);
		} else {
			selectEntries.push(`${fieldName}: true`);
		}
	}

	return `{ ${selectEntries.join(", ")} }`;
}

function getModelConfigFromContext(modelName: string, context: GeneratorContext): ModelInfo | null {
	// Find the model in the configured models list
	if (!context.config.models.includes(modelName)) {
		return null;
	}

	// Get the model from DMMF
	const model = context.dmmf.datamodel.models.find((m) => m.name === modelName);
	if (!model) {
		return null;
	}

	// Get the model configuration
	const lowerModelName = modelName.toLowerCase();
	const modelConfig = context.config[lowerModelName] || {};

	// Create a minimal ModelInfo object for select field access
	return {
		name: modelName,
		lowerName: lowerModelName,
		pluralName: capitalize(pluralize(modelName)),
		lowerPluralName: pluralize(lowerModelName),
		config: modelConfig,
		model,
		selectFields:
			modelConfig.select || model.fields.filter((f) => f.kind === "scalar" || f.kind === "enum").map((f) => f.name),
	};
}

export function getTypeFromField(field: DMMF.Field): string {
	let type = field.type;

	// Handle optional fields
	if (!field.isRequired && !field.isList) {
		type = `${type} | null`;
	}

	// Handle arrays
	if (field.isList) {
		type = `${type}[]`;
	}

	return type;
}

export function formatGeneratedFileHeader(): string {
	return `// This file is auto-generated by Next Prisma Flow Generator.
// Do not edit this file manually as it will be overwritten.
// Generated at: ${new Date().toISOString()}

`;
}

export function createImportStatement(imports: string[], from: string): string {
	if (imports.length === 0) return "";
	return `import { ${imports.join(", ")} } from '${from}';`;
}

export function sanitizeFieldName(fieldName: string): string {
	// Handle reserved words and special characters
	const reserved = ["class", "function", "var", "let", "const", "if", "else", "for", "while"];
	if (reserved.includes(fieldName)) {
		return `_${fieldName}`;
	}
	return fieldName;
}

export function pluralize(word: string): string {
	// Common irregular plurals
	const irregulars: Record<string, string> = {
		person: "people",
		child: "children",
		foot: "feet",
		tooth: "teeth",
		mouse: "mice",
		goose: "geese",
		man: "men",
		woman: "women",
		ox: "oxen",
		sheep: "sheep",
		deer: "deer",
		fish: "fish",
		species: "species",
		series: "series",
		todo: "todos",
		photo: "photos",
		piano: "pianos",
		halo: "halos",
	};

	const lowerWord = word.toLowerCase();

	// Check for irregular plurals
	if (irregulars[lowerWord]) {
		return irregulars[lowerWord];
	}

	// Preserve original case for the irregular plural
	const irregular = Object.entries(irregulars).find(([singular]) => singular.toLowerCase() === lowerWord);
	if (irregular) {
		return irregular[1];
	}

	// Standard pluralization rules
	if (lowerWord.endsWith("y")) {
		// If preceded by a consonant, change y to ies
		if (lowerWord.length > 1 && !"aeiou".includes(lowerWord[lowerWord.length - 2])) {
			return `${word.slice(0, -1)}ies`;
		}
		// If preceded by a vowel, just add s
		return `${word}s`;
	}

	if (
		lowerWord.endsWith("s") ||
		lowerWord.endsWith("sh") ||
		lowerWord.endsWith("ch") ||
		lowerWord.endsWith("x") ||
		lowerWord.endsWith("z")
	) {
		return `${word}es`;
	}

	if (lowerWord.endsWith("f")) {
		return `${word.slice(0, -1)}ves`;
	}

	if (lowerWord.endsWith("fe")) {
		return `${word.slice(0, -2)}ves`;
	}

	if (lowerWord.endsWith("o")) {
		// Most words ending in o preceded by a consonant add es
		if (lowerWord.length > 1 && !"aeiou".includes(lowerWord[lowerWord.length - 2])) {
			return `${word}es`;
		}
		return `${word}s`;
	}

	// Default: just add s
	return `${word}s`;
}

// Re-export the interface and types that templates might need
export interface ModelInfo {
	name: string;
	lowerName: string;
	pluralName: string;
	lowerPluralName: string;
	config: any;
	model: DMMF.Model;
	selectFields: string[];
}
