import type { GeneratorOptions } from "@prisma/generator-helper";
import { ConfigurationError, ModelNotFoundError } from "./errors.js";
import type { ModelConfig, FlowGeneratorConfig } from "./types.js";

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

	const parsedConfig: FlowGeneratorConfig = {
		output: output,
		zodPrismaImport: (config.zodPrismaImport as string) || "./generated/zod",
		prismaImport: (config.prismaImport as string) || "@/lib/prisma",
		models,
	};

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
		modelConfig.select = Array.isArray(selectValue)
			? selectValue
			: selectValue.split(",").map((f: string) => f.trim());
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
