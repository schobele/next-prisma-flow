import { join } from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { formatGeneratedFileHeader, writeFile } from "../utils.js";
import { generateOptimisticCreateFields, generateOptimisticUpdateFields } from "../model-analyzer.js";

export async function generateJotaiAtoms(
	modelInfo: ModelInfo,
	context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName, lowerName, pluralName, lowerPluralName, analyzed } = modelInfo;

	// Generate dynamic optimistic field assignments
	const optimisticCreateFields = generateOptimisticCreateFields(analyzed);
	const optimisticUpdateFields = generateOptimisticUpdateFields(analyzed);

	const template = `${formatGeneratedFileHeader()}import { atom } from "jotai";
import { atomWithImmer } from "jotai-immer";
import * as ${modelName}Actions from "./actions";
import type { ${modelName}, ${modelName}CreateInput, ${modelName}OptimisticUpdate, ${modelName}UpdateInput } from "./types";

// ============================================================================
// BASE STATE ATOMS - Core data storage with normalization
// ============================================================================

/**
 * Base atom storing all ${lowerPluralName} by ID for efficient lookups and updates.
 * Using atomWithImmer for complex state updates with immutability.
 */
export const base${pluralName}Atom = atomWithImmer<Record<string, ${modelName}>>({});

/**
 * Derived atom providing ${lowerPluralName} as an array.
 * Automatically updates when base${pluralName}Atom changes.
 */
export const ${lowerName}ListAtom = atom((get) => {
	const ${lowerPluralName}Map = get(base${pluralName}Atom);
	return Object.values(${lowerPluralName}Map).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

// ============================================================================
// LOADING STATE ATOMS - Granular loading indicators
// ============================================================================

/** Global loading state for batch operations */
export const ${lowerPluralName}LoadingAtom = atom<boolean>(false);

/** Loading state for create operations */
export const ${lowerName}CreatingAtom = atom<boolean>(false);

/** Loading states for individual ${lowerName} updates by ID */
export const ${lowerName}UpdatingAtom = atom<Record<string, boolean>>({});

/** Loading states for individual ${lowerName} deletions by ID */
export const ${lowerName}DeletingAtom = atom<Record<string, boolean>>({});

/** Loading state for pagination operations */
export const ${lowerPluralName}PaginationLoadingAtom = atom<boolean>(false);

// ============================================================================
// ERROR STATE ATOMS - Comprehensive error tracking
// ============================================================================

/** Global error state for general operations */
export const ${lowerPluralName}ErrorAtom = atom<string | null>(null);

/** Error states for individual operations by ${lowerName} ID */
export const ${lowerName}ErrorsAtom = atom<Record<string, string>>({});

/** Last error context for debugging */
export const lastErrorContextAtom = atom<{
	operation: string;
	timestamp: number;
	context?: Record<string, any>;
} | null>(null);

// ============================================================================
// OPTIMISTIC UPDATE TRACKING - State for managing optimistic updates
// ============================================================================

/** Track active optimistic updates */
export const optimisticUpdatesAtom = atom<Record<string, ${modelName}OptimisticUpdate>>({});

/** Track temporary IDs for optimistic creates */
export const temp${modelName}IdsAtom = atom<Set<string>>(new Set<string>());

// ============================================================================
// METADATA ATOMS - Additional state information
// ============================================================================

/** Timestamp of last successful fetch */
export const lastFetchTimestampAtom = atom<number | null>(null);

/** Cache metadata for staleness checking */
export const cacheMetadataAtom = atom<{
	lastFetch: number | null;
	isStale: boolean;
	ttl: number;
}>({
	lastFetch: null,
	isStale: false,
	ttl: 300000, // 5 minutes
});

// ============================================================================
// DERIVED ATOMS - Computed state based on base atoms
// ============================================================================

/** Count of ${lowerPluralName} */
export const ${lowerName}CountAtom = atom((get) => {
	const ${lowerPluralName} = get(${lowerName}ListAtom);
	return ${lowerPluralName}.length;
});

/** Whether the ${lowerPluralName} list is empty */
export const is${pluralName}EmptyAtom = atom((get) => {
	const count = get(${lowerName}CountAtom);
	return count === 0;
});

/** Whether any operation is currently loading */
export const isAnyLoadingAtom = atom((get) => {
	const globalLoading = get(${lowerPluralName}LoadingAtom);
	const creating = get(${lowerName}CreatingAtom);
	const updating = get(${lowerName}UpdatingAtom);
	const deleting = get(${lowerName}DeletingAtom);
	const paginationLoading = get(${lowerPluralName}PaginationLoadingAtom);

	return (
		globalLoading ||
		creating ||
		paginationLoading ||
		Object.values(updating).some(Boolean) ||
		Object.values(deleting).some(Boolean)
	);
});

/** Whether there are any errors */
export const hasAnyErrorAtom = atom((get) => {
	const globalError = get(${lowerPluralName}ErrorAtom);
	const individualErrors = get(${lowerName}ErrorsAtom);

	return !!globalError || Object.keys(individualErrors).length > 0;
});

// ============================================================================
// INDIVIDUAL ${modelName.toUpperCase()} ATOMS - Factory functions for specific ${lowerPluralName}
// ============================================================================

/**
 * Get atom for a specific ${lowerName} by ID
 * Returns null if ${lowerName} doesn't exist
 */
export const ${lowerName}ByIdAtom = (id: string) =>
	atom((get) => {
		const ${lowerPluralName}Map = get(base${pluralName}Atom);
		return ${lowerPluralName}Map[id] || null;
	});

/**
 * Check if a specific ${lowerName} exists
 */
export const ${lowerName}ExistsAtom = (id: string) =>
	atom((get) => {
		const ${lowerName} = get(${lowerName}ByIdAtom(id));
		return !!${lowerName};
	});

/**
 * Get loading state for a specific ${lowerName}
 */
export const ${lowerName}LoadingStateAtom = (id: string) =>
	atom((get) => {
		const updating = get(${lowerName}UpdatingAtom)[id] || false;
		const deleting = get(${lowerName}DeletingAtom)[id] || false;
		const optimistic = get(optimisticUpdatesAtom)[id];

		return {
			updating,
			deleting,
			hasOptimisticUpdate: !!optimistic,
			isLoading: updating || deleting,
		};
	});

/**
 * Get individual error atom for a specific ${lowerName}
 */
export const clear${modelName}ErrorAtom = (id: string) =>
	atom(null, (get, set) => {
		set(${lowerName}ErrorsAtom, (prev) => {
			const { [id]: _, ...rest } = prev;
			return rest;
		});
	});

/**
 * Clear all errors atom
 */
export const clearAllErrorsAtom = atom(null, (get, set) => {
	set(${lowerPluralName}ErrorAtom, null);
	set(${lowerName}ErrorsAtom, {});
	set(lastErrorContextAtom, null);
});

// ============================================================================
// ACTION ATOMS - Write-only atoms for mutations
// ============================================================================

/**
 * Refresh ${lowerPluralName} from server
 * Handles loading states and error management
 */
export const refresh${pluralName}Atom = atom(null, async (get, set, force = false) => {
	// Check if refresh is needed (unless forced)
	if (!force) {
		const cacheMetadata = get(cacheMetadataAtom);
		const now = Date.now();

		if (cacheMetadata.lastFetch && now - cacheMetadata.lastFetch < cacheMetadata.ttl) {
			return; // Skip refresh if cache is still fresh
		}
	}

	set(${lowerPluralName}LoadingAtom, true);
	set(${lowerPluralName}ErrorAtom, null);
	set(lastErrorContextAtom, null);

	try {
		const ${lowerPluralName} = await ${modelName}Actions.findMany();
		const ${lowerPluralName}Map = Object.fromEntries(${lowerPluralName}.map((${lowerName}) => [${lowerName}.id, ${lowerName}]));

		set(base${pluralName}Atom, (draft) => {
			Object.assign(draft, ${lowerPluralName}Map);
		});
		set(lastFetchTimestampAtom, Date.now());
		set(cacheMetadataAtom, {
			lastFetch: Date.now(),
			isStale: false,
			ttl: 300000,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Failed to fetch ${lowerPluralName}";
		set(${lowerPluralName}ErrorAtom, errorMessage);
		set(lastErrorContextAtom, {
			operation: "refresh",
			timestamp: Date.now(),
			context: { error, force },
		});
	} finally {
		set(${lowerPluralName}LoadingAtom, false);
	}
});

/**
 * Optimistic create atom with comprehensive rollback support
 */
export const optimisticCreate${modelName}Atom = atom(null, async (get, set, ${lowerName}Data: ${modelName}CreateInput) => {
	const tempId = \`temp-\${Date.now()}-\${Math.random().toString(36).substring(2)}\`;

	// Create optimistic ${lowerName} with dynamic field handling
	const optimistic${modelName} = {
${optimisticCreateFields}
		// Merge input data, allowing overrides
		...${lowerName}Data,
	} as ${modelName};

	// Track optimistic update
	const optimisticUpdate: ${modelName}OptimisticUpdate = {
		id: tempId,
		data: optimistic${modelName},
		timestamp: Date.now(),
		operation: "create",
	};

	// Apply optimistic update
	set(base${pluralName}Atom, (draft) => {
		draft[tempId] = optimistic${modelName};
	});
	set(optimisticUpdatesAtom, (prev: Record<string, ${modelName}OptimisticUpdate>) => ({
		...prev,
		[tempId]: optimisticUpdate,
	}));
	set(temp${modelName}IdsAtom, (prev: Set<string>) => new Set([...Array.from(prev), tempId]));
	set(${lowerName}CreatingAtom, true);
	set(${lowerPluralName}ErrorAtom, null);

	try {
		const created${modelName} = await ${modelName}Actions.create({ data: ${lowerName}Data });

		// Replace optimistic entry with real data
		set(base${pluralName}Atom, (draft) => {
			delete draft[tempId];
			draft[created${modelName}.id] = created${modelName};
		});

		// Clean up optimistic tracking
		set(optimisticUpdatesAtom, (prev: Record<string, ${modelName}OptimisticUpdate>) => {
			const { [tempId]: _, ...rest } = prev;
			return rest;
		});
		set(temp${modelName}IdsAtom, (prev: Set<string>) => {
			const newSet = new Set(prev);
			newSet.delete(tempId);
			return newSet;
		});

		return created${modelName};
	} catch (error) {
		// Rollback optimistic update
		set(base${pluralName}Atom, (draft) => {
			delete draft[tempId];
		});
		set(optimisticUpdatesAtom, (prev: Record<string, ${modelName}OptimisticUpdate>) => {
			const { [tempId]: _, ...rest } = prev;
			return rest;
		});
		set(temp${modelName}IdsAtom, (prev: Set<string>) => {
			const newSet = new Set(prev);
			newSet.delete(tempId);
			return newSet;
		});

		const errorMessage = error instanceof Error ? error.message : "Failed to create ${lowerName}";
		set(${lowerPluralName}ErrorAtom, errorMessage);
		set(lastErrorContextAtom, {
			operation: "create",
			timestamp: Date.now(),
			context: { error, ${lowerName}Data },
		});
		throw error;
	} finally {
		set(${lowerName}CreatingAtom, false);
	}
});

/**
 * Optimistic update atom with rollback support
 */
export const optimisticUpdate${modelName}Atom = atom(
	null,
	async (get, set, { id, data }: { id: string; data: ${modelName}UpdateInput }) => {
		const current${modelName} = get(base${pluralName}Atom)[id];
		if (!current${modelName}) {
			throw new Error("${modelName} not found");
		}

		// Create optimistic update with dynamic field handling
		const optimistic${modelName} = {
			...current${modelName},
			...data,
${optimisticUpdateFields}
		} as ${modelName};

		const optimisticUpdate: ${modelName}OptimisticUpdate = {
			id,
			data: optimistic${modelName},
			timestamp: Date.now(),
			operation: "update",
			originalData: current${modelName},
		};

		// Apply optimistic update
		set(base${pluralName}Atom, (draft) => {
			draft[id] = optimistic${modelName};
		});
		set(optimisticUpdatesAtom, (prev: Record<string, ${modelName}OptimisticUpdate>) => ({
			...prev,
			[id]: optimisticUpdate,
		}));
		set(${lowerName}UpdatingAtom, (prev) => ({ ...prev, [id]: true }));
		set(${lowerPluralName}ErrorAtom, null);

		try {
			const updated${modelName} = await ${modelName}Actions.update({ where: { id }, data });

			// Update with server response
			set(base${pluralName}Atom, (draft) => {
				draft[id] = updated${modelName};
			});

			// Clean up optimistic tracking
			set(optimisticUpdatesAtom, (prev: Record<string, ${modelName}OptimisticUpdate>) => {
				const { [id]: _, ...rest } = prev;
				return rest;
			});

			return updated${modelName};
		} catch (error) {
			// Rollback optimistic update
			set(base${pluralName}Atom, (draft) => {
				draft[id] = current${modelName};
			});
			set(optimisticUpdatesAtom, (prev: Record<string, ${modelName}OptimisticUpdate>) => {
				const { [id]: _, ...rest } = prev;
				return rest;
			});

			const errorMessage = error instanceof Error ? error.message : "Failed to update ${lowerName}";
			set(${lowerPluralName}ErrorAtom, errorMessage);
			set(${lowerName}ErrorsAtom, (prev) => ({ ...prev, [id]: errorMessage }));
			set(lastErrorContextAtom, {
				operation: "update",
				timestamp: Date.now(),
				context: { error, id, data },
			});
			throw error;
		} finally {
			set(${lowerName}UpdatingAtom, (prev) => {
				const { [id]: _, ...rest } = prev;
				return rest;
			});
		}
	}
);

/**
 * Optimistic delete atom with rollback support
 */
export const optimisticDelete${modelName}Atom = atom(null, async (get, set, id: string) => {
	const ${lowerName}ToDelete = get(base${pluralName}Atom)[id];
	if (!${lowerName}ToDelete) {
		throw new Error("${modelName} not found");
	}

	const optimisticUpdate: ${modelName}OptimisticUpdate = {
		id,
		data: {},
		timestamp: Date.now(),
		operation: "delete",
		originalData: ${lowerName}ToDelete,
	};

	// Apply optimistic deletion
	set(base${pluralName}Atom, (draft) => {
		delete draft[id];
	});
	set(optimisticUpdatesAtom, (prev: Record<string, ${modelName}OptimisticUpdate>) => ({
		...prev,
		[id]: optimisticUpdate,
	}));
	set(${lowerName}DeletingAtom, (prev) => ({ ...prev, [id]: true }));
	set(${lowerPluralName}ErrorAtom, null);

	try {
		await ${modelName}Actions.deleteRecord({ where: { id } });

		// Clean up optimistic tracking
		set(optimisticUpdatesAtom, (prev: Record<string, ${modelName}OptimisticUpdate>) => {
			const { [id]: _, ...rest } = prev;
			return rest;
		});
	} catch (error) {
		// Rollback: restore the deleted item
		set(base${pluralName}Atom, (draft) => {
			draft[id] = ${lowerName}ToDelete;
		});
		set(optimisticUpdatesAtom, (prev: Record<string, ${modelName}OptimisticUpdate>) => {
			const { [id]: _, ...rest } = prev;
			return rest;
		});

		const errorMessage = error instanceof Error ? error.message : "Failed to delete ${lowerName}";
		set(${lowerPluralName}ErrorAtom, errorMessage);
		set(${lowerName}ErrorsAtom, (prev) => ({ ...prev, [id]: errorMessage }));
		set(lastErrorContextAtom, {
			operation: "delete",
			timestamp: Date.now(),
			context: { error, id },
		});
		throw error;
	} finally {
		set(${lowerName}DeletingAtom, (prev) => {
			const { [id]: _, ...rest } = prev;
			return rest;
		});
	}
});

// ============================================================================
// BATCH OPERATION ATOMS - For bulk operations
// ============================================================================

/**
 * Batch create ${lowerPluralName} atom
 */
export const batchCreate${pluralName}Atom = atom(
	null,
	async (get, set, ${lowerPluralName}Data: ${modelName}CreateInput[]) => {
		set(${lowerName}CreatingAtom, true);
		set(${lowerPluralName}ErrorAtom, null);

		try {
			const result = await ${modelName}Actions.createMany({ data: ${lowerPluralName}Data });
			
			// Refresh data after batch create
			await set(refresh${pluralName}Atom, true);
			
			return result;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to create ${lowerPluralName}";
			set(${lowerPluralName}ErrorAtom, errorMessage);
			set(lastErrorContextAtom, {
				operation: "batchCreate",
				timestamp: Date.now(),
				context: { error, ${lowerPluralName}Data },
			});
			throw error;
		} finally {
			set(${lowerName}CreatingAtom, false);
		}
	}
);

/**
 * Batch delete ${lowerPluralName} atom
 */
export const batchDelete${pluralName}Atom = atom(
	null,
	async (get, set, ids: string[]) => {
		// Store items for potential rollback
		const itemsToDelete = ids.map(id => get(base${pluralName}Atom)[id]).filter(Boolean);
		
		// Apply optimistic deletions
		set(base${pluralName}Atom, (draft) => {
			for (const id of ids) {
				delete draft[id];
			}
		});
		
		// Set loading states
		const loadingStates = Object.fromEntries(ids.map(id => [id, true]));
		set(${lowerName}DeletingAtom, (prev) => ({ ...prev, ...loadingStates }));
		set(${lowerPluralName}ErrorAtom, null);

		try {
			const result = await ${modelName}Actions.deleteMany({ where: { id: { in: ids } } });
			return result;
		} catch (error) {
			// Rollback: restore deleted items
			set(base${pluralName}Atom, (draft) => {
				for (const item of itemsToDelete) {
					draft[item.id] = item;
				}
			});

			const errorMessage = error instanceof Error ? error.message : "Failed to delete ${lowerPluralName}";
			set(${lowerPluralName}ErrorAtom, errorMessage);
			set(lastErrorContextAtom, {
				operation: "batchDelete",
				timestamp: Date.now(),
				context: { error, ids },
			});
			throw error;
		} finally {
			// Clear loading states
			set(${lowerName}DeletingAtom, (prev) => {
				const newState = { ...prev };
				for (const id of ids) {
					delete newState[id];
				}
				return newState;
			});
		}
	}
);
`;

	const filePath = join(modelDir, "atoms.ts");
	await writeFile(filePath, template);
}
