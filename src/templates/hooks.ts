import { join } from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { formatGeneratedFileHeader, writeFile } from "../utils.js";

export async function generateReactHooks(
	modelInfo: ModelInfo,
	context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName, lowerName, pluralName, lowerPluralName } = modelInfo;

	const template = `${formatGeneratedFileHeader()}"use client";

import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo } from "react";
import * as React from "react";
import {
	batchCreate${pluralName}Atom,
	batchDelete${pluralName}Atom,
	clearAllErrorsAtom,
	clear${modelName}ErrorAtom,
	hasAnyErrorAtom,
	isAnyLoadingAtom,
	is${pluralName}EmptyAtom,
	optimisticCreate${modelName}Atom,
	optimisticDelete${modelName}Atom,
	optimisticUpdate${modelName}Atom,
	// Action atoms
	refresh${pluralName}Atom,
	// Individual ${lowerName} atoms
	${lowerName}ByIdAtom,
	// Derived atoms
	${lowerName}CountAtom,
	${lowerName}CreatingAtom,
	${lowerName}DeletingAtom,
	${lowerName}ErrorsAtom,
	${lowerName}ExistsAtom,
	${lowerName}ListAtom,
	${lowerName}LoadingStateAtom,
	// Error atoms
	${lowerPluralName}ErrorAtom,
	// Loading atoms
	${lowerPluralName}LoadingAtom,
	${lowerName}UpdatingAtom,
} from "./atoms";
import type {
	${modelName},
	${modelName}CreateInput,
	${modelName}UpdateInput,
	Use${modelName}Result,
	Use${pluralName}Result,
} from "./types";

// ============================================================================
// UNIFIED ${pluralName.toUpperCase()} HOOK - Primary interface for ${modelName} management
// ============================================================================

/**
 * Unified hook providing comprehensive ${modelName} management functionality.
 * This is the primary hook developers should use for most ${modelName} operations.
 *
 * @returns Complete ${modelName} management interface with CRUD operations
 */
export function use${pluralName}(): Use${pluralName}Result {
	// Data atoms
	const data = useAtomValue(${lowerName}ListAtom);
	const count = useAtomValue(${lowerName}CountAtom);
	const isEmpty = useAtomValue(is${pluralName}EmptyAtom);

	// Loading state atoms
	const loading = useAtomValue(${lowerPluralName}LoadingAtom);
	const isCreating = useAtomValue(${lowerName}CreatingAtom);
	const updating = useAtomValue(${lowerName}UpdatingAtom);
	const deleting = useAtomValue(${lowerName}DeletingAtom);
	const isAnyLoading = useAtomValue(isAnyLoadingAtom);

	// Error state atoms
	const error = useAtomValue(${lowerPluralName}ErrorAtom);
	const hasError = useAtomValue(hasAnyErrorAtom);

	// Action atoms
	const refresh = useSetAtom(refresh${pluralName}Atom);
	const create${modelName}Action = useSetAtom(optimisticCreate${modelName}Atom);
	const update${modelName}Action = useSetAtom(optimisticUpdate${modelName}Atom);
	const delete${modelName}Action = useSetAtom(optimisticDelete${modelName}Atom);
	const batchCreateAction = useSetAtom(batchCreate${pluralName}Atom);
	const batchDeleteAction = useSetAtom(batchDelete${pluralName}Atom);
	const clearError = useSetAtom(clearAllErrorsAtom);

	// Memoized CRUD operations
	const create${modelName} = useCallback(
		async (input: ${modelName}CreateInput): Promise<${modelName}> => {
			return await create${modelName}Action(input);
		},
		[create${modelName}Action],
	);

	const update${modelName} = useCallback(
		async (id: string, input: ${modelName}UpdateInput): Promise<${modelName}> => {
			return await update${modelName}Action({ id, data: input });
		},
		[update${modelName}Action],
	);

	const delete${modelName} = useCallback(
		async (id: string): Promise<void> => {
			await delete${modelName}Action(id);
		},
		[delete${modelName}Action],
	);

	// Memoized batch operations
	const createMany = useCallback(
		async (inputs: ${modelName}CreateInput[]): Promise<{ count: number }> => {
			return await batchCreateAction(inputs);
		},
		[batchCreateAction],
	);

	const deleteMany = useCallback(
		async (ids: string[]): Promise<{ count: number }> => {
			return await batchDeleteAction(ids);
		},
		[batchDeleteAction],
	);

	// Loading state helpers
	const isUpdating = useCallback((id: string): boolean => updating[id] || false, [updating]);

	const isDeleting = useCallback((id: string): boolean => deleting[id] || false, [deleting]);

	// Auto-refresh on mount
	useEffect(() => {
		refresh();
	}, [refresh]);

	// Memoized optimistic updates info
	const optimisticUpdates = useMemo(() => {
		const result: Record<string, boolean> = {};
		for (const id of Object.keys(updating)) {
			result[id] = updating[id] || false;
		}
		for (const id of Object.keys(deleting)) {
			result[id] = deleting[id] || false;
		}
		return result;
	}, [updating, deleting]);

	return {
		// Data
		data,
		loading,
		error,
		count,
		isEmpty,

		// CRUD operations
		create${modelName},
		update${modelName},
		delete${modelName},

		// Batch operations
		createMany,
		deleteMany,

		// State management
		refresh: () => refresh(true), // Force refresh
		clearError,

		// Loading states for individual operations
		isCreating,
		isUpdating,
		isDeleting,

		// Optimistic updates info
		optimisticUpdates,
	};
}

// ============================================================================
// INDIVIDUAL ${modelName.toUpperCase()} HOOK - For working with specific ${lowerPluralName}
// ============================================================================

/**
 * Hook for managing a specific ${modelName} by ID.
 * Provides focused operations for individual ${lowerPluralName}.
 *
 * @param id - ${modelName} ID to manage
 * @returns Individual ${modelName} management interface
 */
export function use${modelName}(id: string): Use${modelName}Result {
	// Data atoms for this specific ${lowerName}
	const data = useAtomValue(${lowerName}ByIdAtom(id));
	const exists = useAtomValue(${lowerName}ExistsAtom(id));
	const loadingState = useAtomValue(${lowerName}LoadingStateAtom(id));
	const error = useAtomValue(${lowerName}ErrorsAtom)[id] || null;

	// Action atoms
	const update${modelName}Action = useSetAtom(optimisticUpdate${modelName}Atom);
	const delete${modelName}Action = useSetAtom(optimisticDelete${modelName}Atom);
	const clear${modelName}Error = useSetAtom(clear${modelName}ErrorAtom(id));

	// Memoized operations
	const update = useCallback(
		async (input: ${modelName}UpdateInput): Promise<${modelName}> => {
			return await update${modelName}Action({ id, data: input });
		},
		[id, update${modelName}Action],
	);

	const delete${modelName} = useCallback(async (): Promise<void> => {
		await delete${modelName}Action(id);
	}, [id, delete${modelName}Action]);

	return {
		// Data
		data,
		loading: loadingState.isLoading,
		error,
		exists,

		// Operations
		update,
		delete: delete${modelName},

		// State
		isUpdating: loadingState.updating,
		isDeleting: loadingState.deleting,
		isOptimistic: loadingState.hasOptimisticUpdate,
	};
}

// ============================================================================
// REACT HOOK FORM INTEGRATION
// ============================================================================

/**
 * React Hook Form wrapper with sensible defaults and Flow integration.
 * Provides a clean API for form handling while allowing full customization.
 *
 * @param operation - The operation type: 'create' or 'update'
 * @param config - Optional react-hook-form configuration
 * @param options - Additional Flow-specific options
 * @returns Enhanced useForm hook with Flow integration
 */
export function use${modelName}Form(
	operation: 'create' | 'update',
	config?: any,
	options?: {
		onSuccess?: (data: ${modelName}) => void;
		onError?: (error: Error) => void;
		autoSubmit?: boolean;
		optimisticUpdates?: boolean;
	}
) {
	// Action atoms
	const create${modelName}Action = useSetAtom(optimisticCreate${modelName}Atom);
	const update${modelName}Action = useSetAtom(optimisticUpdate${modelName}Atom);
	
	// Loading and error states
	const isCreating = useAtomValue(${lowerName}CreatingAtom);
	const updating = useAtomValue(${lowerName}UpdatingAtom);
	const globalError = useAtomValue(${lowerPluralName}ErrorAtom);

	// Default form configuration with Flow-specific defaults
	const defaultConfig = {
		mode: 'onBlur' as const,
		defaultValues: operation === 'create' ? {} : undefined,
		...config,
	};

	// Import useForm dynamically to avoid build errors if react-hook-form isn't installed
	const [useForm, setUseForm] = React.useState<any>(null);
	
	React.useEffect(() => {
		import('react-hook-form').then((rhf) => {
			setUseForm(() => rhf.useForm);
		}).catch(() => {
			console.warn(
				'react-hook-form is not installed. Please install it to use ${modelName}Form: npm install react-hook-form'
			);
		});
	}, []);

	const form = useForm ? useForm(defaultConfig) : null;

	// Enhanced submit handler with Flow integration
	const handleSubmit = React.useCallback(
		async (data: any) => {
			if (!form) return;
			
			try {
				let result: ${modelName};
				
				if (operation === 'create') {
					result = await create${modelName}Action(data);
				} else {
					// For updates, we need the ID from the form data or options
					const id = data.id || config?.defaultValues?.id;
					if (!id) {
						throw new Error('ID is required for update operations');
					}
					result = await update${modelName}Action({ id, data });
				}
				
				options?.onSuccess?.(result);
				
				// Reset form on successful create
				if (operation === 'create') {
					form.reset();
				}
				
				return result;
			} catch (error) {
				const errorObj = error instanceof Error ? error : new Error(String(error));
				options?.onError?.(errorObj);
				throw errorObj;
			}
		},
		[form, operation, create${modelName}Action, update${modelName}Action, options, config]
	);

	if (!form) {
		return {
			loading: true,
			error: new Error('react-hook-form is loading or not installed'),
			form: null,
			handleSubmit: () => Promise.reject(new Error('Form not ready')),
		};
	}

	return {
		// Pass through the react-hook-form instance
		...form,
		
		// Enhanced with Flow-specific properties
		loading: operation === 'create' ? isCreating : updating[config?.defaultValues?.id] || false,
		error: globalError ? new Error(globalError) : null,
		
		// Enhanced submit handler
		handleSubmit: form.handleSubmit(handleSubmit),
		
		// Convenience methods
		submitWithFlow: handleSubmit,
		operation,
	};
}

// ============================================================================
// UTILITY HOOKS - Helper hooks for specific use cases
// ============================================================================

/**
 * Hook to check if any ${lowerPluralName} are currently loading
 */
export function useIsAny${modelName}Loading(): boolean {
	return useAtomValue(isAnyLoadingAtom);
}

/**
 * Hook to check if there are any ${lowerName} errors
 */
export function useHas${modelName}Errors(): boolean {
	return useAtomValue(hasAnyErrorAtom);
}

/**
 * Hook to get ${lowerName} count
 */
export function use${modelName}Count(): number {
	return useAtomValue(${lowerName}CountAtom);
}

/**
 * Hook to check if ${lowerPluralName} list is empty
 */
export function useIs${pluralName}Empty(): boolean {
	return useAtomValue(is${pluralName}EmptyAtom);
}

// ============================================================================
// SPECIALIZED FORM HOOKS - Convenience wrappers for common use cases
// ============================================================================

/**
 * Specialized hook for creating ${lowerPluralName}
 * Convenience wrapper around useForm with create operation
 */
export function useCreate${modelName}Form(
	config?: any,
	options?: {
		onSuccess?: (data: ${modelName}) => void;
		onError?: (error: Error) => void;
		autoSubmit?: boolean;
		optimisticUpdates?: boolean;
	}
) {
	return use${modelName}Form('create', config, options);
}

/**
 * Specialized hook for updating ${lowerPluralName}
 * Convenience wrapper around useForm with update operation
 */
export function useUpdate${modelName}Form(
	id: string,
	initialData?: Partial<${modelName}>,
	config?: any,
	options?: {
		onSuccess?: (data: ${modelName}) => void;
		onError?: (error: Error) => void;
		autoSubmit?: boolean;
		optimisticUpdates?: boolean;
	}
) {
	const formConfig = {
		...config,
		defaultValues: {
			id,
			...initialData,
			...config?.defaultValues,
		},
	};
	
	return use${modelName}Form('update', formConfig, options);
}
`;

	const filePath = join(modelDir, "hooks.ts");
	await writeFile(filePath, template);
}
