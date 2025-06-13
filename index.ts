#!/usr/bin/env node

import { type GeneratorOptions, generatorHandler } from "@prisma/generator-helper";
import { join } from "node:path";
import { ensureDirectory, writeFile } from "./src/utils.js";

import { parseGeneratorConfig, validateConfig } from "./src/config.js";
import { FileSystemError, FlowGeneratorError, ModelNotFoundError, TemplateGenerationError } from "./src/errors.js";
import { analyzeModel, generateValidationRules } from "./src/model-analyzer.js";
import { analyzeSchemaRelationships } from "./src/relationship-analyzer.js";
import { generateServerActions } from "./src/templates/actions.js";
import { generateJotaiAtoms } from "./src/templates/atoms.js";
import { generateModelConfig } from "./src/templates/config.js";
import { generateDerivedAtoms } from "./src/templates/derived.js";
import { generateEffectAtoms } from "./src/templates/fx.js";
import { generateReactHooks } from "./src/templates/hooks.js";
import { generateModelIndex } from "./src/templates/index.js";
import { generatePrismaTemplate } from "./src/templates/prisma.js";
import { generateRootIndex } from "./src/templates/root-index.js";
import { generateSchemas } from "./src/templates/schemas.js";
import { generateSharedInfrastructure } from "./src/templates/shared.js";
import { generateTypeDefinitions } from "./src/templates/types.js";
import type { GeneratorContext } from "./src/types.js";
import { capitalize, createGeneratorContext, plural } from "./src/utils.js";
import { generateZodSchemas } from "./src/zod-generator.js";

generatorHandler({
	onManifest() {
		return {
			version: "1.0.0",
			defaultOutput: "./generated/flow",
			prettyName: "Prisma Next Flow Generator",
			requiresGenerators: ["prisma-client-js"],
		};
	},

	async onGenerate(options: GeneratorOptions) {
		try {
			console.log("🚀 Starting Prisma Next Flow Generator...");

			// Parse and validate configuration
			const config = parseGeneratorConfig(options);
			const modelNames = options.dmmf.datamodel.models.map((m) => m.name);
			validateConfig(config, modelNames);

			// Create generator context
			const context = createGeneratorContext(config, options.dmmf, config.output);

			// Ensure output directory exists
			try {
				await ensureDirectory(context.outputDir);
			} catch (error) {
				throw new FileSystemError("create directory", context.outputDir, error);
			}

			// Generate Zod schemas first using zod-prisma-types
			try {
				console.log("🚀 Starting Zod schema generation...");
				await generateZodSchemas(options, context.outputDir, config.models);
			} catch (error) {
				console.error("❌ Zod generation failed in main generator:", error);
				throw new TemplateGenerationError("zod schemas", "all models", error);
			}

			// Analyze schema relationships first
			console.log("🔍 Analyzing schema relationships...");
			const schemaRelationships = analyzeSchemaRelationships(options.dmmf);

			// Generate code for each model
			for (const modelName of config.models) {
				console.log(`📝 Generating code for model: ${modelName}`);

				const model = options.dmmf.datamodel.models.find((m) => m.name === modelName);
				if (!model) {
					throw new ModelNotFoundError(modelName);
				}

				const lowerModelName = modelName.toLowerCase();
				const modelConfig = config[lowerModelName] || {};
				const pluralName = capitalize(plural(modelName));
				const lowerPluralName = plural(lowerModelName);

				// Get relationship information for this model
				const modelRelationships = schemaRelationships.get(modelName);
				const relationshipInfo = modelRelationships
					? {
							owns: modelRelationships.ownsRelations,
							referencedBy: modelRelationships.referencedBy,
							relatedModels: Array.from(modelRelationships.relatedModels),
						}
					: undefined;

				// Analyze the model structure for dynamic code generation
				const analyzedModel = analyzeModel(model, relationshipInfo);
				const validationRules = generateValidationRules(analyzedModel);

				const modelInfo = {
					name: modelName,
					lowerName: lowerModelName,
					pluralName,
					lowerPluralName,
					config: modelConfig,
					model,
					selectFields:
						modelConfig.select || model.fields.filter((f) => f.kind === "scalar" || f.kind === "enum").map((f) => f.name),
					analyzed: analyzedModel,
					validationRules,
				};

				// Create model-specific directory
				const modelDir = join(context.outputDir, lowerModelName);
				try {
					await ensureDirectory(modelDir);
				} catch (error) {
					throw new FileSystemError("create directory", modelDir, error);
				}

				// Generate all template files for this model
				try {
					await Promise.all([
						generateModelConfig(modelInfo, context, modelDir).catch((error) => {
							throw new TemplateGenerationError("config", modelName, error);
						}),
						generateJotaiAtoms(modelInfo, context, modelDir).catch((error) => {
							throw new TemplateGenerationError("atoms", modelName, error);
						}),
						generateDerivedAtoms(modelInfo, context, modelDir).catch((error) => {
							throw new TemplateGenerationError("derived", modelName, error);
						}),
						generateEffectAtoms(modelInfo, context, modelDir).catch((error) => {
							throw new TemplateGenerationError("fx", modelName, error);
						}),
						generateServerActions(modelInfo, context, modelDir).catch((error) => {
							throw new TemplateGenerationError("actions", modelName, error);
						}),
						generateReactHooks(modelInfo, context, modelDir).catch((error) => {
							throw new TemplateGenerationError("hooks", modelName, error);
						}),
						generateTypeDefinitions(modelInfo, context, modelDir).catch((error) => {
							throw new TemplateGenerationError("types", modelName, error);
						}),
						generateSchemas(modelInfo, context, modelDir).catch((error) => {
							throw new TemplateGenerationError("schemas", modelName, error);
						}),
						generateModelIndex(modelInfo, context, modelDir).catch((error) => {
							throw new TemplateGenerationError("index", modelName, error);
						}),
					]);
				} catch (error) {
					if (error instanceof TemplateGenerationError) {
						throw error;
					}
					throw new TemplateGenerationError("unknown", modelName, error);
				}
			}

			// Generate utility files
			try {
				const prismaContent = generatePrismaTemplate(context);
				await writeFile(join(context.outputDir, "prisma.ts"), prismaContent);
			} catch (error) {
				throw new TemplateGenerationError("utility files", "all models", error);
			}

			// Generate shared infrastructure
			try {
				await generateSharedInfrastructure(context);
			} catch (error) {
				throw new TemplateGenerationError("shared infrastructure", "all models", error);
			}

			// Generate root index file
			try {
				await generateRootIndex(context);
			} catch (error) {
				throw new TemplateGenerationError("root index", "all models", error);
			}

			console.log("✅ Next Prisma Flow Generator completed successfully!");
		} catch (error) {
			if (error instanceof FlowGeneratorError) {
				console.error(`❌ ${error.name}: ${error.message}`);
				if (error.cause) {
					console.error(`Caused by: ${error.cause}`);
				}
			} else {
				console.error(`❌ Unexpected error: ${error}`);
			}
			throw error;
		}
	},
});
