import fs from "node:fs/promises";
import path from "node:path";
import type { FlowGeneratorConfig, GeneratorContext } from "../types.js";
import { formatGeneratedFileHeader, capitalize, pluralize } from "../utils.js";

export async function generateBarrelExports(config: FlowGeneratorConfig, context: GeneratorContext): Promise<void> {
	await Promise.all([
		generateMainIndex(config, context),
		generateActionsIndex(config, context),
		generateHooksIndex(config, context),
		generateAtomsIndex(config, context),
		generateTypesIndex(config, context),
		generateStoreSetup(config, context),
	]);
}

async function generateMainIndex(config: FlowGeneratorConfig, context: GeneratorContext): Promise<void> {
	const exports = config.models
		.map((modelName) => {
			const lowerName = modelName.toLowerCase();
			return `// ${modelName} exports
export * from './${lowerName}/types';
export * from './${lowerName}/actions';
export * from './${lowerName}/atoms';
export * from './${lowerName}/hooks';`;
		})
		.join("\n\n");

	const template = `${formatGeneratedFileHeader()}// Main barrel export file for Next Prisma Flow
// This file re-exports all generated code for easy importing

${exports}

// Store setup
export * from './store';
`;

	const filePath = path.join(context.outputDir, "index.ts");
	await fs.writeFile(filePath, template, "utf-8");
}

async function generateActionsIndex(config: FlowGeneratorConfig, context: GeneratorContext): Promise<void> {
	const exports = config.models
		.map((modelName) => {
			const lowerName = modelName.toLowerCase();
			return `export * as ${modelName}Actions from './${lowerName}/actions';`;
		})
		.join("\n");

	const namedExports = config.models.flatMap((modelName) => {
		const lowerName = modelName.toLowerCase();
		const pluralName = capitalize(pluralize(modelName));
		return [
			`getAll${pluralName}`,
			`get${modelName}`,
			`create${modelName}`,
			`update${modelName}`,
			`delete${modelName}`,
			`createMany${pluralName}`,
			`deleteMany${pluralName}`,
		].map((action) => `${action} as ${lowerName}${action.replace(modelName, "").replace(pluralName, "")}`);
	});

	const template = `${formatGeneratedFileHeader()}// Server Actions barrel exports
// Import all server actions for convenient access

${exports}

// Named exports for direct import
${config.models
	.map((modelName) => {
		const lowerName = modelName.toLowerCase();
		const pluralName = capitalize(pluralize(modelName));
		return `export {
  getAll${pluralName},
  get${modelName},
  create${modelName},
  update${modelName},
  delete${modelName},
  createMany${pluralName},
  deleteMany${pluralName},
} from './${lowerName}/actions';`;
	})
	.join("\n\n")}
`;

	const filePath = path.join(context.outputDir, "actions.ts");
	await fs.writeFile(filePath, template, "utf-8");
}

async function generateHooksIndex(config: FlowGeneratorConfig, context: GeneratorContext): Promise<void> {
	const exports = config.models
		.map((modelName) => {
			const lowerName = modelName.toLowerCase();
			return `export * from './${lowerName}/hooks';`;
		})
		.join("\n");

	const template = `${formatGeneratedFileHeader()}// React Hooks barrel exports
// Import all hooks for convenient access

${exports}

// Type exports for hook return types
${config.models
	.map((modelName) => {
		const lowerName = modelName.toLowerCase();
		const pluralName = capitalize(pluralize(modelName));
		return `export type {
  Use${pluralName}Result,
  Use${modelName}Result,
  UseCreate${modelName}Result,
  UseUpdate${modelName}Result,
  UseDelete${modelName}Result,
  Use${modelName}MutationsResult,
  UseBatch${modelName}OperationsResult,
} from './${lowerName}/hooks';`;
	})
	.join("\n\n")}
`;

	const filePath = path.join(context.outputDir, "hooks.ts");
	await fs.writeFile(filePath, template, "utf-8");
}

async function generateAtomsIndex(config: FlowGeneratorConfig, context: GeneratorContext): Promise<void> {
	const exports = config.models
		.map((modelName) => {
			const lowerName = modelName.toLowerCase();
			return `export * from './${lowerName}/atoms';`;
		})
		.join("\n");

	const template = `${formatGeneratedFileHeader()}// Jotai Atoms barrel exports
// Import all atoms for convenient access

${exports}

// Convenient re-exports for common atoms
${config.models
	.map((modelName) => {
		const lowerName = modelName.toLowerCase();
		const pluralName = capitalize(pluralize(modelName));
		const lowerPluralName = pluralize(lowerName);
		return `export {
  base${pluralName}Atom,
  ${lowerName}ListAtom,
  ${lowerPluralName}LoadingAtom,
  ${lowerPluralName}ErrorAtom,
  refresh${pluralName}Atom,
  ${lowerName}CountAtom,
  is${pluralName}EmptyAtom,
} from './${lowerName}/atoms';`;
	})
	.join("\n\n")}
`;

	const filePath = path.join(context.outputDir, "atoms.ts");
	await fs.writeFile(filePath, template, "utf-8");
}

async function generateTypesIndex(config: FlowGeneratorConfig, context: GeneratorContext): Promise<void> {
	const exports = config.models
		.map((modelName) => {
			const lowerName = modelName.toLowerCase();
			return `export * from './${lowerName}/types';`;
		})
		.join("\n");

	const template = `${formatGeneratedFileHeader()}// TypeScript Types barrel exports
// Import all types for convenient access

${exports}

// Common type aliases for convenience
${config.models
	.map((modelName) => {
		const lowerName = modelName.toLowerCase();
		return `export type {
  ${modelName},
  ${modelName}Input,
  ${modelName}UpdateInput,
  ${modelName}ApiResponse,
  ${modelName}ListApiResponse,
  ${modelName}MutationResponse,
  ${modelName}FormData,
} from './${lowerName}/types';`;
	})
	.join("\n\n")}
`;

	const filePath = path.join(context.outputDir, "types.ts");
	await fs.writeFile(filePath, template, "utf-8");
}

async function generateStoreSetup(config: FlowGeneratorConfig, context: GeneratorContext): Promise<void> {
	const atomImports = config.models
		.map((modelName) => {
			const lowerName = modelName.toLowerCase();
			const pluralName = capitalize(pluralize(modelName));
			const lowerPluralName = pluralize(lowerName);
			return `  base${pluralName}Atom,
  ${lowerPluralName}LoadingAtom,
  ${lowerPluralName}ErrorAtom,`;
		})
		.join("\n");

	const atomExports = config.models
		.map((modelName) => {
			const lowerName = modelName.toLowerCase();
			const pluralName = capitalize(pluralize(modelName));
			const lowerPluralName = pluralize(lowerName);
			return `  base${pluralName}Atom,
  ${lowerPluralName}LoadingAtom,
  ${lowerPluralName}ErrorAtom,`;
		})
		.join("\n");

	const template = `${formatGeneratedFileHeader()}// Central store setup for all Flow atoms
// This file provides utilities for global state management

import { createStore } from 'jotai';
import {
${atomImports}
} from './atoms';

// Create a store instance for SSR/testing if needed
export const flowStore = createStore();

// Export all base atoms for external access
export const flowAtoms = {
${atomExports}
};

// Utility function to clear all data (useful for logout, testing, etc.)
export function clearAllFlowData() {
${config.models
	.map((modelName) => {
		const lowerName = modelName.toLowerCase();
		const pluralName = capitalize(pluralize(modelName));
		const lowerPluralName = pluralize(lowerName);
		return `  flowStore.set(base${pluralName}Atom, {});
  flowStore.set(${lowerPluralName}LoadingAtom, false);
  flowStore.set(${lowerPluralName}ErrorAtom, null);`;
	})
	.join("\n")}
}

// Utility function to check if any data is loading
export function isAnyFlowDataLoading(): boolean {
  return [
${config.models
	.map((modelName) => {
		const lowerName = modelName.toLowerCase();
		const lowerPluralName = pluralize(lowerName);
		return `    flowStore.get(${lowerPluralName}LoadingAtom),`;
	})
	.join("\n")}
  ].some(Boolean);
}

// Utility function to get all errors
export function getAllFlowErrors(): Record<string, string | null> {
  return {
${config.models
	.map((modelName) => {
		const lowerName = modelName.toLowerCase();
		const lowerPluralName = pluralize(lowerName);
		return `    ${lowerName}: flowStore.get(${lowerPluralName}ErrorAtom),`;
	})
	.join("\n")}
  };
}

// Type for the complete state shape
export interface FlowState {
${config.models
	.map((modelName) => {
		const lowerName = modelName.toLowerCase();
		const pluralName = capitalize(pluralize(modelName));
		const lowerPluralName = pluralize(lowerName);
		return `  ${lowerPluralName}: ReturnType<typeof base${pluralName}Atom['read']>;
  ${lowerPluralName}Loading: boolean;
  ${lowerPluralName}Error: string | null;`;
	})
	.join("\n")}
}

// Utility to get complete state snapshot
export function getFlowSnapshot(): FlowState {
  return {
${config.models
	.map((modelName) => {
		const lowerName = modelName.toLowerCase();
		const pluralName = capitalize(pluralize(modelName));
		const lowerPluralName = pluralize(lowerName);
		return `    ${lowerPluralName}: flowStore.get(base${pluralName}Atom),
    ${lowerPluralName}Loading: flowStore.get(${lowerPluralName}LoadingAtom),
    ${lowerPluralName}Error: flowStore.get(${lowerPluralName}ErrorAtom),`;
	})
	.join("\n")}
  };
}
`;

	const filePath = path.join(context.outputDir, "store.ts");
	await fs.writeFile(filePath, template, "utf-8");
}
