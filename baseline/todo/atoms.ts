import { atom } from "jotai";
import { atomWithImmer } from "jotai-immer";
import * as TodoActions from "./actions";
import type { Todo, TodoCreateInput, TodoOptimisticUpdate, TodoUpdateInput } from "./types";

// ============================================================================
// BASE STATE ATOMS - Core data storage with normalization
// ============================================================================

/**
 * Base atom storing all todos by ID for efficient lookups and updates.
 * Using atomWithImmer for complex state updates with immutability.
 */
export const baseTodosAtom = atomWithImmer<Record<string, Todo>>({});

/**
 * Derived atom providing todos as an array.
 * Automatically updates when baseTodosAtom changes.
 */
export const todoListAtom = atom((get) => {
	const todosMap = get(baseTodosAtom);
	return Object.values(todosMap).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

// ============================================================================
// LOADING STATE ATOMS - Granular loading indicators
// ============================================================================

/** Global loading state for batch operations */
export const todosLoadingAtom = atom<boolean>(false);

/** Loading state for create operations */
export const todoCreatingAtom = atom<boolean>(false);

/** Loading states for individual todo updates by ID */
export const todoUpdatingAtom = atom<Record<string, boolean>>({});

/** Loading states for individual todo deletions by ID */
export const todoDeletingAtom = atom<Record<string, boolean>>({});

/** Loading state for pagination operations */
export const todosPaginationLoadingAtom = atom<boolean>(false);

// ============================================================================
// ERROR STATE ATOMS - Comprehensive error tracking
// ============================================================================

/** Global error state for general operations */
export const todosErrorAtom = atom<string | null>(null);

/** Error states for individual operations by todo ID */
export const todoErrorsAtom = atom<Record<string, string>>({});

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
export const optimisticUpdatesAtom = atom<Record<string, TodoOptimisticUpdate>>({});

/** Track temporary IDs for optimistic creates */
export const tempTodoIdsAtom = atom<Set<string>>(new Set<string>());

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

/** Count of todos */
export const todoCountAtom = atom((get) => {
	const todos = get(todoListAtom);
	return todos.length;
});

/** Whether the todos list is empty */
export const isTodosEmptyAtom = atom((get) => {
	const count = get(todoCountAtom);
	return count === 0;
});

/** Whether any operation is currently loading */
export const isAnyLoadingAtom = atom((get) => {
	const globalLoading = get(todosLoadingAtom);
	const creating = get(todoCreatingAtom);
	const updating = get(todoUpdatingAtom);
	const deleting = get(todoDeletingAtom);
	const paginationLoading = get(todosPaginationLoadingAtom);

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
	const globalError = get(todosErrorAtom);
	const individualErrors = get(todoErrorsAtom);

	return !!globalError || Object.keys(individualErrors).length > 0;
});

/** Todo statistics */
export const todoStatsAtom = atom((get) => {
	const todos = get(todoListAtom);

	return {
		total: todos.length,
		completed: todos.filter((t) => t.status === "COMPLETED").length,
		pending: todos.filter((t) => t.status !== "COMPLETED").length,
		overdue: todos.filter((t) => t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) < new Date()).length,
	};
});

/** Filtered todos by status */
export const todosByStatusAtom = atom((get) => {
	const todos = get(todoListAtom);

	return {
		pending: todos.filter((t) => t.status === "PENDING"),
		inProgress: todos.filter((t) => t.status === "IN_PROGRESS"),
		completed: todos.filter((t) => t.status === "COMPLETED"),
	};
});

/** Recently updated todos (last 24 hours) */
export const recentlyUpdatedTodosAtom = atom((get) => {
	const todos = get(todoListAtom);
	const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

	return todos
		.filter((t) => new Date(t.updatedAt) > oneDayAgo)
		.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
});

// ============================================================================
// INDIVIDUAL TODO ATOMS - Factory functions for specific todos
// ============================================================================

/**
 * Get atom for a specific todo by ID
 * Returns null if todo doesn't exist
 */
export const todoByIdAtom = (id: string) =>
	atom((get) => {
		const todosMap = get(baseTodosAtom);
		return todosMap[id] || null;
	});

/**
 * Check if a specific todo exists
 */
export const todoExistsAtom = (id: string) =>
	atom((get) => {
		const todo = get(todoByIdAtom(id));
		return !!todo;
	});

/**
 * Get loading state for a specific todo
 */
export const todoLoadingStateAtom = (id: string) =>
	atom((get) => {
		const updating = get(todoUpdatingAtom)[id] || false;
		const deleting = get(todoDeletingAtom)[id] || false;
		const optimistic = get(optimisticUpdatesAtom)[id];

		return {
			updating,
			deleting,
			hasOptimisticUpdate: !!optimistic,
			isLoading: updating || deleting,
		};
	});

// ============================================================================
// ACTION ATOMS - Write-only atoms for mutations
// ============================================================================

/**
 * Refresh todos from server
 * Handles loading states and error management
 */
export const refreshTodosAtom = atom(null, async (get, set, force = false) => {
	// Check if refresh is needed (unless forced)
	if (!force) {
		const cacheMetadata = get(cacheMetadataAtom);
		const now = Date.now();

		if (cacheMetadata.lastFetch && now - cacheMetadata.lastFetch < cacheMetadata.ttl) {
			return; // Skip refresh if cache is still fresh
		}
	}

	set(todosLoadingAtom, true);
	set(todosErrorAtom, null);
	set(lastErrorContextAtom, null);

	try {
		const todos = await TodoActions.findMany();
		const todosMap = Object.fromEntries(todos.map((todo) => [todo.id, todo]));

		set(baseTodosAtom, (draft) => {
			Object.assign(draft, todosMap);
		});
		set(lastFetchTimestampAtom, Date.now());
		set(cacheMetadataAtom, {
			lastFetch: Date.now(),
			isStale: false,
			ttl: 300000,
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Failed to fetch todos";
		set(todosErrorAtom, errorMessage);
		set(lastErrorContextAtom, {
			operation: "refresh",
			timestamp: Date.now(),
			context: { error, force },
		});
	} finally {
		set(todosLoadingAtom, false);
	}
});

/**
 * Optimistic create atom with comprehensive rollback support
 */
export const optimisticCreateTodoAtom = atom(null, async (get, set, todoData: TodoCreateInput) => {
	const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`;

	// Create optimistic todo with proper field handling
	const optimisticTodo = {
		// Auto-generated fields
		id: tempId,
		createdAt: new Date(),
		updatedAt: new Date(),

		// Required fields from input
		title: todoData.title || "",
		userId: todoData.userId || "",

		// Optional fields with defaults
		description: todoData.description || null,
		status: todoData.status || "PENDING",
		priority: todoData.priority || "MEDIUM",
		dueDate: todoData.dueDate || null,
		completedAt: null,
		categoryId: todoData.categoryId || null,

		// Relations (populated from select)
		user: {
			id: todoData.userId || "",
			name: "",
			email: "",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		category: null,
		tags: [],
	} as Todo;

	// Track optimistic update
	const optimisticUpdate: TodoOptimisticUpdate = {
		id: tempId,
		data: optimisticTodo,
		timestamp: Date.now(),
		operation: "create",
	};

	// Apply optimistic update
	set(baseTodosAtom, (draft) => {
		draft[tempId] = optimisticTodo;
	});
	set(optimisticUpdatesAtom, (prev: Record<string, TodoOptimisticUpdate>) => ({
		...prev,
		[tempId]: optimisticUpdate,
	}));
	set(tempTodoIdsAtom, (prev: Set<string>) => new Set([...Array.from(prev), tempId]));
	set(todoCreatingAtom, true);
	set(todosErrorAtom, null);

	try {
		const createdTodo = await TodoActions.create(todoData);

		// Replace optimistic entry with real data
		set(baseTodosAtom, (draft) => {
			delete draft[tempId];
			draft[createdTodo.id] = createdTodo;
		});

		// Clean up optimistic tracking
		set(optimisticUpdatesAtom, (prev: Record<string, TodoOptimisticUpdate>) => {
			const { [tempId]: _, ...rest } = prev;
			return rest;
		});
		set(tempTodoIdsAtom, (prev: Set<string>) => {
			const newSet = new Set(prev);
			newSet.delete(tempId);
			return newSet;
		});

		return createdTodo;
	} catch (error) {
		// Rollback optimistic update
		set(baseTodosAtom, (draft) => {
			delete draft[tempId];
		});
		set(optimisticUpdatesAtom, (prev: Record<string, TodoOptimisticUpdate>) => {
			const { [tempId]: _, ...rest } = prev;
			return rest;
		});
		set(tempTodoIdsAtom, (prev: Set<string>) => {
			const newSet = new Set(prev);
			newSet.delete(tempId);
			return newSet;
		});

		const errorMessage = error instanceof Error ? error.message : "Failed to create todo";
		set(todosErrorAtom, errorMessage);
		set(lastErrorContextAtom, {
			operation: "create",
			timestamp: Date.now(),
			context: { todoData, error },
		});

		throw error;
	} finally {
		set(todoCreatingAtom, false);
	}
});

/**
 * Optimistic update atom with conflict resolution
 */
export const optimisticUpdateTodoAtom = atom(
	null,
	async (get, set, { id, data }: { id: string; data: TodoUpdateInput }) => {
		const currentTodo = get(baseTodosAtom)[id];
		if (!currentTodo) {
			throw new Error(`Todo with ID ${id} not found`);
		}

		// Store original data for rollback
		const originalTodo = { ...currentTodo };

		// Create optimistic update - cast to Todo since we're merging with existing
		const optimisticTodo = {
			...currentTodo,
			...data,
			updatedAt: new Date(),
		} as Todo;

		const optimisticUpdate: TodoOptimisticUpdate = {
			id,
			data: optimisticTodo,
			timestamp: Date.now(),
			originalData: originalTodo,
			operation: "update",
		};

		// Apply optimistic update
		set(baseTodosAtom, (draft) => {
			draft[id] = optimisticTodo;
		});
		set(optimisticUpdatesAtom, (prev) => ({
			...prev,
			[id]: optimisticUpdate,
		}));
		set(todoUpdatingAtom, (prev) => ({ ...prev, [id]: true }));
		set(todosErrorAtom, null);

		try {
			const updatedTodo = await TodoActions.update({ id }, data);

			// Replace optimistic data with server response
			set(baseTodosAtom, (draft) => {
				draft[id] = updatedTodo;
			});

			// Clean up optimistic tracking
			set(optimisticUpdatesAtom, (prev) => {
				const { [id]: _, ...rest } = prev;
				return rest;
			});

			return updatedTodo;
		} catch (error) {
			// Rollback to original state
			set(baseTodosAtom, (draft) => {
				draft[id] = originalTodo;
			});
			set(optimisticUpdatesAtom, (prev) => {
				const { [id]: _, ...rest } = prev;
				return rest;
			});

			const errorMessage = error instanceof Error ? error.message : "Failed to update todo";
			set(todoErrorsAtom, (prev) => ({ ...prev, [id]: errorMessage }));
			set(lastErrorContextAtom, {
				operation: "update",
				timestamp: Date.now(),
				context: { id, data, error },
			});

			throw error;
		} finally {
			set(todoUpdatingAtom, (prev) => {
				const { [id]: _, ...rest } = prev;
				return rest;
			});
		}
	},
);

/**
 * Optimistic delete atom with soft rollback
 */
export const optimisticDeleteTodoAtom = atom(null, async (get, set, id: string) => {
	const todoToDelete = get(baseTodosAtom)[id];
	if (!todoToDelete) {
		throw new Error(`Todo with ID ${id} not found`);
	}

	// Track optimistic delete
	const optimisticUpdate: TodoOptimisticUpdate = {
		id,
		data: {},
		timestamp: Date.now(),
		originalData: todoToDelete,
		operation: "delete",
	};

	// Apply optimistic removal
	set(baseTodosAtom, (draft) => {
		delete draft[id];
	});
	set(optimisticUpdatesAtom, (prev) => ({
		...prev,
		[id]: optimisticUpdate,
	}));
	set(todoDeletingAtom, (prev) => ({ ...prev, [id]: true }));
	set(todosErrorAtom, null);

	try {
		await TodoActions.deleteRecord({ id });

		// Clean up optimistic tracking (success)
		set(optimisticUpdatesAtom, (prev) => {
			const { [id]: _, ...rest } = prev;
			return rest;
		});
	} catch (error) {
		// Rollback: restore the deleted item
		set(baseTodosAtom, (draft) => {
			draft[id] = todoToDelete;
		});
		set(optimisticUpdatesAtom, (prev) => {
			const { [id]: _, ...rest } = prev;
			return rest;
		});

		const errorMessage = error instanceof Error ? error.message : "Failed to delete todo";
		set(todoErrorsAtom, (prev) => ({ ...prev, [id]: errorMessage }));
		set(lastErrorContextAtom, {
			operation: "delete",
			timestamp: Date.now(),
			context: { id, error },
		});

		throw error;
	} finally {
		set(todoDeletingAtom, (prev) => {
			const { [id]: _, ...rest } = prev;
			return rest;
		});
	}
});

// ============================================================================
// BATCH OPERATION ATOMS - Handling multiple items efficiently
// ============================================================================

/**
 * Batch create todos atom
 */
export const batchCreateTodosAtom = atom(null, async (get, set, inputs: TodoCreateInput[]) => {
	set(todosLoadingAtom, true);
	set(todosErrorAtom, null);

	try {
		const result = await TodoActions.createMany(inputs);

		// Refresh data to get the newly created todos
		await set(refreshTodosAtom, true);

		return result;
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Failed to create todos";
		set(todosErrorAtom, errorMessage);
		set(lastErrorContextAtom, {
			operation: "batchCreate",
			timestamp: Date.now(),
			context: { inputs, error },
		});
		throw error;
	} finally {
		set(todosLoadingAtom, false);
	}
});

/**
 * Batch delete todos atom
 */
export const batchDeleteTodosAtom = atom(null, async (get, set, ids: string[]) => {
	// Store todos for potential rollback
	const todosToDelete = ids.map((id) => get(baseTodosAtom)[id]).filter(Boolean);

	// Apply optimistic removal
	set(baseTodosAtom, (draft) => {
		for (const id of ids) {
			delete draft[id];
		}
	});
	set(todosLoadingAtom, true);
	set(todosErrorAtom, null);

	try {
		const result = await TodoActions.deleteMany({ id: { in: ids } });
		return result;
	} catch (error) {
		// Rollback: restore deleted todos
		set(baseTodosAtom, (draft) => {
			for (const todo of todosToDelete) {
				if (todo) {
					draft[todo.id] = todo;
				}
			}
		});

		const errorMessage = error instanceof Error ? error.message : "Failed to delete todos";
		set(todosErrorAtom, errorMessage);
		set(lastErrorContextAtom, {
			operation: "batchDelete",
			timestamp: Date.now(),
			context: { ids, error },
		});
		throw error;
	} finally {
		set(todosLoadingAtom, false);
	}
});

// ============================================================================
// UTILITY ATOMS - Helper atoms for common operations
// ============================================================================

/**
 * Clear all errors atom
 */
export const clearAllErrorsAtom = atom(null, (get, set) => {
	set(todosErrorAtom, null);
	set(todoErrorsAtom, {});
	set(lastErrorContextAtom, null);
});

/**
 * Clear specific todo error atom
 */
export const clearTodoErrorAtom = (id: string) =>
	atom(null, (get, set) => {
		set(todoErrorsAtom, (prev) => {
			const { [id]: _, ...rest } = prev;
			return rest;
		});
	});

/**
 * Force cache invalidation atom
 */
export const invalidateCacheAtom = atom(null, (get, set) => {
	set(cacheMetadataAtom, (prev) => ({
		...prev,
		isStale: true,
		lastFetch: null,
	}));
});

/**
 * Reset all state atom (useful for logout/cleanup)
 */
export const resetAllStateAtom = atom(null, (get, set) => {
	set(baseTodosAtom, (draft) => {
		for (const key of Object.keys(draft)) {
			delete draft[key];
		}
	});
	set(todosLoadingAtom, false);
	set(todoCreatingAtom, false);
	set(todoUpdatingAtom, {});
	set(todoDeletingAtom, {});
	set(todosErrorAtom, null);
	set(todoErrorsAtom, {});
	set(optimisticUpdatesAtom, {});
	set(tempTodoIdsAtom, new Set());
	set(lastFetchTimestampAtom, null);
	set(lastErrorContextAtom, null);
	set(cacheMetadataAtom, {
		lastFetch: null,
		isStale: false,
		ttl: 300000,
	});
});

// ============================================================================
// DEBUGGING ATOMS - Development and debugging utilities
// ============================================================================

/**
 * Debug info atom for development tools
 */
export const debugInfoAtom = atom((get) => {
	const todos = get(todoListAtom);
	const optimisticUpdates = get(optimisticUpdatesAtom);
	const tempIds = get(tempTodoIdsAtom);
	const loading = get(isAnyLoadingAtom);
	const errors = get(hasAnyErrorAtom);
	const cacheMetadata = get(cacheMetadataAtom);

	return {
		counts: {
			total: todos.length,
			optimistic: Object.keys(optimisticUpdates).length,
			temporary: tempIds.size,
		},
		states: {
			loading,
			hasErrors: errors,
			cacheStale: cacheMetadata.isStale,
		},
		cache: cacheMetadata,
		optimisticUpdates,
		tempIds: Array.from(tempIds),
		timestamp: Date.now(),
	};
});
