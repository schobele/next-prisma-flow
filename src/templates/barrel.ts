import { join } from "node:path";
import type { FlowGeneratorConfig, GeneratorContext } from "../types.js";
import { capitalize, formatGeneratedFileHeader, plural, writeFile } from "../utils.js";

export async function generateBarrelExports(config: FlowGeneratorConfig, context: GeneratorContext): Promise<void> {
	await Promise.all([
		generateEnhancedMainIndex(config, context),
		generateNamespacedTypes(config, context),
		generateStoreSetup(config, context),
	]);
}

async function generateModelBarrelExport(modelName: string, context: GeneratorContext): Promise<void> {
	const lowerName = modelName.toLowerCase();
	const pluralName = capitalize(plural(modelName));
	const lowerPluralName = plural(lowerName);

	const template = `${formatGeneratedFileHeader()}// Barrel export for ${modelName} module

// Export namespace as default
export { ${lowerPluralName} } from './namespace';

// Export all individual pieces for direct import
export * from './types';
export * from './actions';
export * from './atoms';
export * from './hooks';
// Note: routes are not exported to avoid naming conflicts in barrel exports

// Named exports for convenience
export {
  // Types
  type ${modelName},
  type ${modelName}CreateInput,
  type ${modelName}UpdateInput,
  type ${modelName}FormData,
  
  // Schemas
  ${modelName}CreateInputSchema,
  ${modelName}UpdateInputSchema,
} from './types';

export {
  // Core CRUD actions
  findMany,
  findUnique,
  findFirst,
  create,
  update,
  deleteRecord,
  upsert,
  createMany,
  updateMany,
  deleteMany,
  
  // Utility actions
  exists,
  count,
  aggregate,
  groupBy,
} from './actions';

export {
  // Hooks
  use${pluralName},
  use${modelName},
  use${modelName}Form,
} from './hooks';

`;

	const filePath = join(context.outputDir, lowerName, "index.ts");
	await writeFile(filePath, template);
}

async function generateEnhancedMainIndex(config: FlowGeneratorConfig, context: GeneratorContext): Promise<void> {
	// Generate barrel exports for each model directory first
	await Promise.all(
		config.models.map(async (modelName) => {
			await generateModelBarrelExport(modelName, context);
		}),
	);

	const modelExports = config.models
		.map((modelName) => {
			const lowerName = modelName.toLowerCase();
			const lowerPluralName = plural(lowerName);
			return `// ${modelName} namespace export
import { ${lowerPluralName} } from './${lowerName}/namespace';
export { ${lowerPluralName} };
export { ${lowerPluralName} as ${lowerName} }; // Convenience alias`;
		})
		.join("\n\n");

	const template = `${formatGeneratedFileHeader()}// Enhanced Next Prisma Flow v0.2.0 - Model-specific namespace exports
// Modern, intuitive developer experience with smart API patterns

${modelExports}

// Global utilities
export * from './store';
export * from './types';

// Flow Provider for SSR, state management, and error handling
export { 
  FlowProvider,
  useFlowContext,
  useFlowConfig,
  useFlowUser,
  useFlowStore,
  useFlowErrorBoundary,
  useFlowDebug
} from './flow-provider';
export type { 
  FlowProviderProps
} from './flow-provider';
export type { 
  FlowContextValue,
  FlowDebugInfo,
  FlowErrorBoundaryRef
} from './flow-context';
export type { 
  FlowConfig,
  DEFAULT_FLOW_CONFIG,
  createFlowConfig,
  validateFlowConfig
} from './flow-config';
`;

	const filePath = join(context.outputDir, "index.ts");
	await writeFile(filePath, template);
}

async function generateNamespacedTypes(config: FlowGeneratorConfig, context: GeneratorContext): Promise<void> {
	const typeExports = config.models
		.map((modelName) => {
			const lowerName = modelName.toLowerCase();
			return `export * from './${lowerName}/types';`;
		})
		.join("\n");

	const template = `${formatGeneratedFileHeader()}// Consolidated type exports for all models

${typeExports}

// Common utility types
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  success: boolean;
  message?: string;
  errors?: ApiError[];
}

export interface ListApiResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MutationResponse<T = any> extends ApiResponse<T> {
  // Specific to mutations
}

export interface BatchResponse extends ApiResponse {
  count: number;
}

// Form types
export interface FormField<T = any> {
  value: T;
  onChange: (value: T) => void;
  onBlur: () => void;
  error?: string;
  required: boolean;
  name: string;
}

export interface FormState<T = any> {
  data: Partial<T>;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  loading: boolean;
  error: Error | null;
}

// Optimistic update types
export interface OptimisticUpdate<T = any> {
  id: string;
  data: Partial<T>;
  timestamp: number;
  operation: 'create' | 'update' | 'delete';
}

// State management types
export interface LoadingStates {
  [key: string]: boolean;
}

export interface EntityState<T = any> {
  items: Record<string, T>;
  loading: boolean;
  creating: boolean;
  updating: LoadingStates;
  deleting: LoadingStates;
  error: string | null;
  optimisticUpdates: Record<string, OptimisticUpdate<T>>;
}
`;

	const filePath = join(context.outputDir, "types.ts");
	await writeFile(filePath, template);
}

async function generateStoreSetup(config: FlowGeneratorConfig, context: GeneratorContext): Promise<void> {
	const atomImports = config.models
		.map((modelName) => {
			const lowerName = modelName.toLowerCase();
			const pluralName = capitalize(plural(modelName));
			const lowerPluralName = plural(lowerName);
			return `import {
  base${pluralName}Atom,
  ${lowerPluralName}LoadingAtom,
  ${lowerPluralName}ErrorAtom,
} from './${lowerName}/atoms';`;
		})
		.join("\n");

	const atomExports = config.models
		.map((modelName) => {
			const lowerName = modelName.toLowerCase();
			const pluralName = capitalize(plural(modelName));
			const lowerPluralName = plural(lowerName);
			return `  ${lowerName}: {
    data: base${pluralName}Atom,
    loading: ${lowerPluralName}LoadingAtom,
    error: ${lowerPluralName}ErrorAtom,
  },`;
		})
		.join("\n");

	const clearDataStatements = config.models
		.map((modelName) => {
			const lowerName = modelName.toLowerCase();
			const pluralName = capitalize(plural(modelName));
			const lowerPluralName = plural(lowerName);
			return `  flowStore.set(base${pluralName}Atom, {});
  flowStore.set(${lowerPluralName}LoadingAtom, false);
  flowStore.set(${lowerPluralName}ErrorAtom, null);`;
		})
		.join("\n");

	const template = `${formatGeneratedFileHeader()}// Enhanced store setup for all Flow atoms
// Provides utilities for global state management and debugging

import { createStore } from 'jotai';
${atomImports}

// Create a store instance for SSR/testing if needed
export const flowStore = createStore();

// Organized atom access by model
export const flowAtoms = {
${atomExports}
};

// Utility function to clear all data (useful for logout, testing, etc.)
export function clearAllFlowData() {
${clearDataStatements}
}

// Utility function to check if any data is loading
export function isAnyFlowDataLoading(): boolean {
  return Object.values(flowAtoms).some(model => 
    flowStore.get(model.loading)
  );
}

// Utility function to get all errors
export function getAllFlowErrors(): Record<string, string | null> {
  return Object.fromEntries(
    Object.entries(flowAtoms).map(([modelName, atoms]) => [
      modelName,
      flowStore.get(atoms.error)
    ])
  );
}

// Enhanced debugging utilities
export function getFlowDebugInfo() {
  const errors = getAllFlowErrors();
  const isLoading = isAnyFlowDataLoading();
  const hasErrors = Object.values(errors).some(Boolean);
  
  return {
    isLoading,
    hasErrors,
    errors,
    models: Object.keys(flowAtoms),
    timestamp: new Date().toISOString(),
  };
}

// Development helpers
export function logFlowState() {
  if (process.env.NODE_ENV === 'development') {
    console.group('🌊 Flow State Debug');
    console.log('Debug Info:', getFlowDebugInfo());
    console.log('Store:', flowStore);
    console.groupEnd();
  }
}

// Type for the complete state shape
export interface FlowState {
${config.models
	.map((modelName) => {
		const lowerName = modelName.toLowerCase();
		const pluralName = capitalize(plural(modelName));
		const lowerPluralName = plural(lowerName);
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
		const pluralName = capitalize(plural(modelName));
		const lowerPluralName = plural(lowerName);
		return `    ${lowerPluralName}: flowStore.get(base${pluralName}Atom),
    ${lowerPluralName}Loading: flowStore.get(${lowerPluralName}LoadingAtom),
    ${lowerPluralName}Error: flowStore.get(${lowerPluralName}ErrorAtom),`;
	})
	.join("\n")}
  };
}

// React DevTools integration (if available)
if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  (window as any).__FLOW_DEBUG__ = {
    store: flowStore,
    atoms: flowAtoms,
    getState: getFlowSnapshot,
    getDebugInfo: getFlowDebugInfo,
    clearAll: clearAllFlowData,
  };
}
`;

	const filePath = join(context.outputDir, "store.ts");
	await writeFile(filePath, template);
}
