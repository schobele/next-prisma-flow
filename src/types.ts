import type { DMMF } from "@prisma/generator-helper";
import type { AnalyzedModel, ValidationRule } from "./model-analyzer.js";

export interface FlowGeneratorConfig {
	output: string;
	prismaImport?: string;
	prismaClientPath?: string;
	serverPath?: string;
	cacheUtilsPath?: string;
	models: string[];
	[modelName: string]: any;
}

export interface ModelConfig {
	select?: string[];
	include?: Record<string, boolean | object>;
	optimistic?: "merge" | "overwrite" | "manual";
	pagination?: boolean;
}

export interface GeneratorContext {
	config: FlowGeneratorConfig;
	dmmf: DMMF.Document;
	outputDir: string;
	zodDir: string;
	prismaImport: string;
}

export interface ModelInfo {
	name: string;
	lowerName: string;
	camelCaseName: string;
	pluralName: string;
	lowerPluralName: string;
	config: ModelConfig;
	model: DMMF.Model;
	selectFields: string[];
	analyzed: AnalyzedModel;
	validationRules: ValidationRule[];
}

export interface TemplateData {
	modelInfo: ModelInfo;
	context: GeneratorContext;
	imports: string[];
	exports: string[];
}
