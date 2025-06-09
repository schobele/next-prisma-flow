import * as path from "node:path";
import type { GeneratorOptions } from "@prisma/generator-helper";
import { ConfigurationError, ModelNotFoundError } from "./errors.js";
import type { FlowGeneratorConfig, ModelConfig } from "./types.js";

export function parseGeneratorConfig(options: GeneratorOptions): FlowGeneratorConfig {
	const config = options.generator.config;
	const output = options.generator.output?.value ?? "./generated/flow";
	if (!output) {
		throw new ConfigurationError('Missing required "output" configuration', "output");
	}

	if (!config.models) {
		throw new ConfigurationError('Missing required "models" configuration', "models");
	}

	const models = Array.isArray(config.models) ? config.models : config.models.split(",").map((m) => m.trim());

	// Resolve prismaImport relative to schema file location
	const resolvedPrismaImport = resolvePrismaImportPath(options, (config.prismaImport as string) || "@prisma/client");

	const parsedConfig: FlowGeneratorConfig = {
		output: output,
		prismaImport: resolvedPrismaImport,
		models,
	};

	// Only set optional paths if they are actually provided
	if (config.prismaClientPath) {
		parsedConfig.prismaClientPath = config.prismaClientPath as string;
	}
	if (config.serverPath) {
		parsedConfig.serverPath = config.serverPath as string;
	}
	if (config.cacheUtilsPath) {
		parsedConfig.cacheUtilsPath = config.cacheUtilsPath as string;
	}

	// Parse model-specific configurations using flattened keys
	for (const modelName of models) {
		const lowerModelName = modelName.toLowerCase();
		const modelConfig = parseModelConfigFromFlatKeys(config, modelName);

		if (Object.keys(modelConfig).length > 0) {
			parsedConfig[lowerModelName] = modelConfig;
		}
	}

	return parsedConfig;
}

function parseModelConfigFromFlatKeys(config: Record<string, any>, modelName: string): ModelConfig {
	const modelConfig: ModelConfig = {};
	const lowerModelName = modelName.toLowerCase();

	// Parse select fields - look for {modelName}Select
	const selectKey = `${lowerModelName}Select`;
	if (config[selectKey]) {
		const selectValue = config[selectKey];
		modelConfig.select = Array.isArray(selectValue) ? selectValue : selectValue.split(",").map((f: string) => f.trim());
	}

	// Parse optimistic strategy - look for {modelName}Optimistic
	const optimisticKey = `${lowerModelName}Optimistic`;
	if (config[optimisticKey]) {
		const optimisticValue = config[optimisticKey] as string;
		if (!["merge", "overwrite", "manual"].includes(optimisticValue)) {
			throw new ConfigurationError(
				`Invalid optimistic strategy for ${modelName}: ${optimisticValue}. Must be one of: merge, overwrite, manual`,
				optimisticKey,
			);
		}
		modelConfig.optimistic = optimisticValue as "merge" | "overwrite" | "manual";
	}

	// Parse pagination - look for {modelName}Pagination
	const paginationKey = `${lowerModelName}Pagination`;
	if (config[paginationKey] !== undefined) {
		const paginationValue = config[paginationKey];
		modelConfig.pagination = paginationValue === "true" || paginationValue === true;
	}

	return modelConfig;
}

/**
 * Resolves a relative import path from the Prisma schema to the correct relative path
 * from the generator output directory.
 */
function resolvePrismaImportPath(options: GeneratorOptions, importPath: string): string {
	// If it's an absolute import (starts with @/ or doesn't start with ./ or ../), return as-is
	if (!importPath.startsWith(".")) {
		return importPath;
	}

	// Get the directory containing the schema file
	const schemaDir = path.dirname(options.schemaPath);

	// Get the output directory (already resolved to absolute path by Prisma)
	const outputDir = options.generator.output?.value ?? "./generated/flow";

	// Resolve the import path relative to the schema directory to get absolute path
	const absoluteImportPath = path.resolve(schemaDir, importPath);

	// Calculate relative path from output directory to the resolved import
	const relativeFromOutput = path.relative(outputDir, absoluteImportPath);

	// Convert to proper import format (forward slashes, no extension)
	return relativeFromOutput.replace(/\\/g, "/").replace(/\.ts$/, "");
}

/**
 * Gets the correctly resolved import path for a specific nesting level within the output.
 * @param basePrismaImport - The resolved prismaImport from config
 * @param nestingLevel - How many directories deep (0 = root, 1 = model subdirectory)
 */
export function getPrismaImportForNesting(basePrismaImport: string, nestingLevel: number): string {
	// If it's an absolute import (starts with @/ or doesn't start with ./ or ../), return as-is
	if (!basePrismaImport.startsWith(".")) {
		return basePrismaImport;
	}

	// Add additional ../ for each nesting level
	const additionalLevels = "../".repeat(nestingLevel);
	return additionalLevels + basePrismaImport;
}

export function validateConfig(config: FlowGeneratorConfig, modelNames: string[]): void {
	// Validate that all specified models exist in the schema
	const invalidModels = config.models.filter((modelName) => !modelNames.includes(modelName));

	if (invalidModels.length > 0) {
		throw new ModelNotFoundError(`Unknown models specified in config: ${invalidModels.join(", ")}`);
	}

	// Validate model-specific configurations
	for (const modelName of config.models) {
		const lowerModelName = modelName.toLowerCase();
		const modelConfig = config[lowerModelName] as ModelConfig;

		if (modelConfig?.select && !Array.isArray(modelConfig.select)) {
			throw new ConfigurationError(`Model ${modelName}: select must be an array of field names`, "select");
		}
	}
}
