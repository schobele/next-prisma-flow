import { join, resolve, relative, dirname, basename, extname } from "node:path";
import * as pluralize from "pluralize";
import { camelCase as toCamelCase, pascalCase, kebabCase, snakeCase } from "change-case";
import * as validator from "validator";
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
		outputDir: resolve(outputPath),
		zodDir: join(resolve(outputPath), "zod"),
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

// ============================================================================
// STRING MANIPULATION UTILITIES - Using proper libraries for consistency
// ============================================================================

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to camelCase
 */
export function camelCase(str: string): string {
	return toCamelCase(str);
}

/**
 * Convert string to PascalCase (same as capitalize but more robust)
 */
export function toPascalCase(str: string): string {
	return pascalCase(str);
}

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str: string): string {
	return kebabCase(str);
}

/**
 * Convert string to snake_case
 */
export function toSnakeCase(str: string): string {
	return snakeCase(str);
}

/**
 * Proper pluralization using pluralize library
 */
export function plural(word: string): string {
	return pluralize.plural(word);
}

/**
 * Get singular form of a word
 */
export function singular(word: string): string {
	return pluralize.singular(word);
}

/**
 * Check if a word is plural
 */
export function isPlural(word: string): boolean {
	return pluralize.isPlural(word);
}

/**
 * Check if a word is singular
 */
export function isSingular(word: string): boolean {
	return pluralize.isSingular(word);
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
		pluralName: capitalize(plural(modelName)),
		lowerPluralName: plural(lowerModelName),
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

// ============================================================================
// VALIDATION UTILITIES - Using validator library for common validations
// ============================================================================

/**
 * Check if a string is a valid email
 */
export function isValidEmail(email: string): boolean {
	return validator.isEmail(email);
}

/**
 * Check if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
	return validator.isURL(url);
}

/**
 * Check if a string is a valid UUID
 */
export function isValidUuid(uuid: string): boolean {
	return validator.isUUID(uuid);
}

/**
 * Check if a string is numeric
 */
export function isNumeric(str: string): boolean {
	return validator.isNumeric(str);
}

/**
 * Check if a string is alphanumeric
 */
export function isAlphanumeric(str: string): boolean {
	return validator.isAlphanumeric(str);
}

/**
 * Escape HTML characters in a string
 */
export function escapeHtml(str: string): string {
	return validator.escape(str);
}

/**
 * Normalize email address
 */
export function normalizeEmail(email: string): string | false {
	return validator.normalizeEmail(email);
}

/**
 * Check if string contains only letters
 */
export function isAlpha(str: string): boolean {
	return validator.isAlpha(str);
}

/**
 * Check if string is a valid JSON
 */
export function isValidJson(str: string): boolean {
	return validator.isJSON(str);
}

// ============================================================================
// ENHANCED FIELD UTILITIES - More robust field name handling
// ============================================================================

/**
 * Enhanced field name sanitization with additional checks
 */
export function sanitizeFieldName(fieldName: string): string {
	// Handle reserved words and special characters
	const reserved = [
		"abstract",
		"arguments",
		"await",
		"boolean",
		"break",
		"byte",
		"case",
		"catch",
		"char",
		"class",
		"const",
		"continue",
		"debugger",
		"default",
		"delete",
		"do",
		"double",
		"else",
		"enum",
		"eval",
		"export",
		"extends",
		"false",
		"final",
		"finally",
		"float",
		"for",
		"function",
		"goto",
		"if",
		"implements",
		"import",
		"in",
		"instanceof",
		"int",
		"interface",
		"let",
		"long",
		"native",
		"new",
		"null",
		"package",
		"private",
		"protected",
		"public",
		"return",
		"short",
		"static",
		"super",
		"switch",
		"synchronized",
		"this",
		"throw",
		"throws",
		"transient",
		"true",
		"try",
		"typeof",
		"var",
		"void",
		"volatile",
		"while",
		"with",
		"yield",
	];

	if (reserved.includes(fieldName.toLowerCase())) {
		return `_${fieldName}`;
	}

	// Ensure field name starts with letter or underscore
	if (!/^[a-zA-Z_]/.test(fieldName)) {
		return `_${fieldName}`;
	}

	// Replace invalid characters with underscores
	const sanitized = fieldName.replace(/[^a-zA-Z0-9_]/g, "_");

	return sanitized;
}

/**
 * Check if a field name is valid JavaScript identifier
 */
export function isValidIdentifier(name: string): boolean {
	return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
}

/**
 * Convert field name to a valid JavaScript identifier
 */
export function toValidIdentifier(name: string): string {
	if (isValidIdentifier(name)) {
		return name;
	}
	return sanitizeFieldName(name);
}

// ============================================================================
// FILE AND PATH UTILITIES - Enhanced path handling
// ============================================================================

/**
 * Ensure a path uses forward slashes (for consistency across platforms)
 */
export function normalizePath(filePath: string): string {
	return filePath.replace(/\\/g, "/");
}

/**
 * Create a relative import path between two files
 */
export function createRelativePath(from: string, to: string): string {
	const relativePath = relative(dirname(from), to);
	return normalizePath(relativePath);
}

/**
 * Ensure an import path starts with ./ or ../
 */
export function ensureRelativeImport(importPath: string): string {
	if (importPath.startsWith("@/") || importPath.startsWith("/") || !importPath.startsWith(".")) {
		return importPath;
	}
	if (!importPath.startsWith("./") && !importPath.startsWith("../")) {
		return `./${importPath}`;
	}
	return importPath;
}

/**
 * Remove file extension from a path
 */
export function removeExtension(filePath: string): string {
	return filePath.replace(/\.[^/.]+$/, "");
}

// ============================================================================
// BUN NATIVE FILE I/O UTILITIES - Using Bun's optimized file operations
// ============================================================================

/**
 * Write content to a file using Bun's native file I/O
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
	await Bun.write(filePath, content);
}

/**
 * Read file content using Bun's native file I/O
 */
export async function readFile(filePath: string): Promise<string> {
	const file = Bun.file(filePath);
	return await file.text();
}

/**
 * Check if a file exists using Bun's native file I/O
 */
export async function fileExists(filePath: string): Promise<boolean> {
	const file = Bun.file(filePath);
	return await file.exists();
}

/**
 * Get file size using Bun's native file I/O
 */
export async function getFileSize(filePath: string): Promise<number> {
	const file = Bun.file(filePath);
	return file.size;
}

/**
 * Get file MIME type using Bun's native file I/O
 */
export function getFileType(filePath: string): string {
	const file = Bun.file(filePath);
	return file.type;
}

/**
 * Copy a file using Bun's native file I/O
 */
export async function copyFile(source: string, destination: string): Promise<void> {
	const sourceFile = Bun.file(source);
	await Bun.write(destination, sourceFile);
}

/**
 * Delete a file using Bun's native file I/O
 */
export async function deleteFile(filePath: string): Promise<void> {
	const file = Bun.file(filePath);
	await file.delete();
}

/**
 * Create a file writer for incremental writing
 */
export function createFileWriter(filePath: string, options?: { highWaterMark?: number }) {
	const file = Bun.file(filePath);
	return file.writer(options);
}

/**
 * Write multiple files concurrently using Bun's native file I/O
 */
export async function writeFiles(files: Array<{ path: string; content: string }>): Promise<void> {
	await Promise.all(files.map(({ path, content }) => Bun.write(path, content)));
}

/**
 * Read multiple files concurrently using Bun's native file I/O
 */
export async function readFiles(filePaths: string[]): Promise<Array<{ path: string; content: string }>> {
	const results = await Promise.all(
		filePaths.map(async (path) => ({
			path,
			content: await Bun.file(path).text(),
		})),
	);
	return results;
}

/**
 * Create a directory using Node.js fs (Bun doesn't have mkdir yet)
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
	const { mkdir } = await import("node:fs/promises");
	await mkdir(dirPath, { recursive: true });
}

/**
 * Read directory contents using Node.js fs (Bun doesn't have readdir yet)
 */
export async function readDirectory(dirPath: string, recursive = false): Promise<string[]> {
	const { readdir } = await import("node:fs/promises");
	return (await readdir(dirPath, { recursive })) as string[];
}

// ============================================================================
// CODE GENERATION UTILITIES - Helpers for generating clean code
// ============================================================================

/**
 * Create a properly formatted import statement with optional type imports
 */
export function createTypedImportStatement(imports: string[], typeImports: string[], from: string): string {
	const parts: string[] = [];

	if (imports.length > 0) {
		parts.push(imports.join(", "));
	}

	if (typeImports.length > 0) {
		parts.push(`type { ${typeImports.join(", ")} }`);
	}

	if (parts.length === 0) return "";

	return `import { ${parts.join(", ")} } from "${from}";`;
}

/**
 * Create a JSDoc comment block
 */
export function createJSDocComment(
	description: string,
	params?: Array<{ name: string; type: string; description: string }>,
): string {
	const lines = ["/**", ` * ${description}`];

	if (params && params.length > 0) {
		lines.push(" *");
		for (const param of params) {
			lines.push(` * @param ${param.name} {${param.type}} ${param.description}`);
		}
	}

	lines.push(" */");
	return lines.join("\n");
}

/**
 * Indent code lines by a specified number of spaces
 */
export function indentLines(code: string, spaces = 2): string {
	const indent = " ".repeat(spaces);
	return code
		.split("\n")
		.map((line) => (line.trim() ? `${indent}${line}` : line))
		.join("\n");
}

/**
 * Create a TypeScript interface from field definitions
 */
export function createInterface(
	name: string,
	fields: Array<{ name: string; type: string; optional?: boolean; description?: string }>,
	exported = true,
): string {
	const exportKeyword = exported ? "export " : "";
	const lines = [`${exportKeyword}interface ${name} {`];

	for (const field of fields) {
		if (field.description) {
			lines.push(`\t/** ${field.description} */`);
		}
		const optionalMarker = field.optional ? "?" : "";
		lines.push(`\t${field.name}${optionalMarker}: ${field.type};`);
	}

	lines.push("}");
	return lines.join("\n");
}

/**
 * Wrap text to a specified line length
 */
export function wrapText(text: string, maxLength = 80): string {
	if (text.length <= maxLength) return text;

	const words = text.split(" ");
	const lines: string[] = [];
	let currentLine = "";

	for (const word of words) {
		if (currentLine.length + word.length + 1 <= maxLength) {
			currentLine += (currentLine ? " " : "") + word;
		} else {
			if (currentLine) lines.push(currentLine);
			currentLine = word;
		}
	}

	if (currentLine) lines.push(currentLine);
	return lines.join("\n");
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
