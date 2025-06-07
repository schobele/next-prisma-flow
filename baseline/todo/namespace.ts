// ============================================================================
// IMPORT ALL MODULES - Centralized imports for re-export
// ============================================================================

// Action imports
import * as TodoActionsModule from "./actions";

// Atom imports
import * as TodoAtomsModule from "./atoms";

// Hook imports
import * as TodoHooksModule from "./hooks";

// Type imports
import * as TodoTypesModule from "./types";

// Route function imports (these would be used in actual route files)
import * as TodoRoutesModule from "./routes";

// ============================================================================
// ACTIONS NAMESPACE - Server actions for data operations
// ============================================================================

export const actions = {
	// Read operations
	findMany: TodoActionsModule.findMany,
	findUnique: TodoActionsModule.findUnique,
	findFirst: TodoActionsModule.findFirst,
	count: TodoActionsModule.count,
	exists: TodoActionsModule.exists,

	// Create operations
	create: TodoActionsModule.create,
	createMany: TodoActionsModule.createMany,

	// Update operations
	update: TodoActionsModule.update,
	updateMany: TodoActionsModule.updateMany,

	// Delete operations
	deleteRecord: TodoActionsModule.deleteRecord,
	deleteMany: TodoActionsModule.deleteMany,

	// Upsert operations
	upsert: TodoActionsModule.upsert,

	// Required relationship operations
	setUser: TodoActionsModule.setUser,

	// Optional relationship operations
	setCategory: TodoActionsModule.setCategory,
	removeCategory: TodoActionsModule.removeCategory,

	// Many-to-many relationship operations
	addTags: TodoActionsModule.addTags,
	removeTags: TodoActionsModule.removeTags,
	replaceTags: TodoActionsModule.replaceTags,
	clearTags: TodoActionsModule.clearTags,
} as const;

// ============================================================================
// ATOMS NAMESPACE - Jotai state management atoms
// ============================================================================

/**
 * Jotai atoms for Todo state management with optimistic updates.
 * Provides reactive state with automatic UI synchronization.
 */
export const atoms = {
	// Base state atoms
	base: TodoAtomsModule.baseTodosAtom,
	list: TodoAtomsModule.todoListAtom,

	// Loading state atoms
	loading: {
		global: TodoAtomsModule.todosLoadingAtom,
		creating: TodoAtomsModule.todoCreatingAtom,
		updating: TodoAtomsModule.todoUpdatingAtom,
		deleting: TodoAtomsModule.todoDeletingAtom,
		pagination: TodoAtomsModule.todosPaginationLoadingAtom,
		any: TodoAtomsModule.isAnyLoadingAtom,
	},

	// Error state atoms
	errors: {
		global: TodoAtomsModule.todosErrorAtom,
		individual: TodoAtomsModule.todoErrorsAtom,
		lastContext: TodoAtomsModule.lastErrorContextAtom,
		hasAny: TodoAtomsModule.hasAnyErrorAtom,
	},

	// Derived state atoms
	derived: {
		count: TodoAtomsModule.todoCountAtom,
		isEmpty: TodoAtomsModule.isTodosEmptyAtom,
		stats: TodoAtomsModule.todoStatsAtom,
		byStatus: TodoAtomsModule.todosByStatusAtom,
		recentlyUpdated: TodoAtomsModule.recentlyUpdatedTodosAtom,
	},

	// Individual todo atom factories
	individual: {
		byId: TodoAtomsModule.todoByIdAtom,
		exists: TodoAtomsModule.todoExistsAtom,
		loadingState: TodoAtomsModule.todoLoadingStateAtom,
	},

	// Action atoms for mutations
	actions: {
		refresh: TodoAtomsModule.refreshTodosAtom,
		optimisticCreate: TodoAtomsModule.optimisticCreateTodoAtom,
		optimisticUpdate: TodoAtomsModule.optimisticUpdateTodoAtom,
		optimisticDelete: TodoAtomsModule.optimisticDeleteTodoAtom,
		batchCreate: TodoAtomsModule.batchCreateTodosAtom,
		batchDelete: TodoAtomsModule.batchDeleteTodosAtom,
	},

	// Utility atoms
	utils: {
		clearAllErrors: TodoAtomsModule.clearAllErrorsAtom,
		clearTodoError: TodoAtomsModule.clearTodoErrorAtom,
		invalidateCache: TodoAtomsModule.invalidateCacheAtom,
		resetAllState: TodoAtomsModule.resetAllStateAtom,
	},

	// Debug and development atoms
	debug: {
		info: TodoAtomsModule.debugInfoAtom,
	},

	// Metadata atoms
	metadata: {
		lastFetch: TodoAtomsModule.lastFetchTimestampAtom,
		cache: TodoAtomsModule.cacheMetadataAtom,
		optimisticUpdates: TodoAtomsModule.optimisticUpdatesAtom,
		tempIds: TodoAtomsModule.tempTodoIdsAtom,
	},
} as const;

// ============================================================================
// HOOKS NAMESPACE - React hooks for component integration
// ============================================================================

/**
 * React hooks for Todo management with optimistic updates and form integration.
 * Provides declarative state management for React components.
 */
export const hooks = {
	// Primary hooks for most use cases
	useTodos: TodoHooksModule.useTodos,
	useTodo: TodoHooksModule.useTodo,

	// Form-specific hooks
	forms: {
		useCreate: TodoHooksModule.useCreateTodoForm,
		useUpdate: TodoHooksModule.useUpdateTodoForm,
	},

	// Utility hooks for specific states
	utils: {
		useIsAnyLoading: TodoHooksModule.useIsAnyTodoLoading,
		useHasErrors: TodoHooksModule.useHasTodoErrors,
		useCount: TodoHooksModule.useTodoCount,
		useIsEmpty: TodoHooksModule.useIsTodosEmpty,
	},
} as const;

// ============================================================================
// TYPES NAMESPACE - TypeScript type definitions
// ============================================================================

/**
 * TypeScript types for Todo entities and operations.
 * Provides complete type safety for all Todo-related code.
 */
export const types = {
	// Core entity types
	entity: {
		Todo: {} as TodoTypesModule.Todo,
		TodoId: {} as TodoTypesModule.TodoId,
	},

	// Input types for operations
	input: {
		create: {} as TodoTypesModule.TodoCreateInput,
		update: {} as TodoTypesModule.TodoUpdateInput,
		createMany: {} as TodoTypesModule.TodoCreateManyInput,
	},

	// Array and collection types
	collections: {
		array: {} as TodoTypesModule.TodoArray,
		createInputArray: {} as TodoTypesModule.TodoCreateInputArray,
		createManyInputArray: {} as TodoTypesModule.TodoCreateManyInputArray,
	},

	// API and response types
	api: {
		response: {} as TodoTypesModule.TodoApiResponse,
		listResponse: {} as TodoTypesModule.TodoListApiResponse,
		mutationResponse: {} as TodoTypesModule.TodoMutationResponse,
		batchResponse: {} as TodoTypesModule.TodoBatchResponse,
	},

	// Search and filtering types
	search: {
		params: {} as TodoTypesModule.TodoSearchParams,
		filterParams: {} as TodoTypesModule.TodoFilterParams,
	},

	// State management types
	state: {
		todoState: {} as TodoTypesModule.TodoState,
		optimisticUpdate: {} as TodoTypesModule.TodoOptimisticUpdate,
	},

	// Hook result types
	hooks: {
		useTodosResult: {} as TodoTypesModule.UseTodosResult,
		useTodoResult: {} as TodoTypesModule.UseTodoResult,
		useCreateFormResult: {} as TodoTypesModule.UseCreateTodoFormResult,
		useUpdateFormResult: {} as TodoTypesModule.UseUpdateTodoFormResult,
	},

	// Form and validation types
	forms: {
		formData: {} as TodoTypesModule.TodoFormData,
		updateFormData: {} as TodoTypesModule.TodoUpdateFormData,
		fieldConfig: {} as TodoTypesModule.TodoFieldConfig,
		validation: {} as TodoTypesModule.TodoFormValidation,
	},

	// Validation types
	validation: {
		error: {} as TodoTypesModule.TodoValidationError,
		errors: {} as TodoTypesModule.TodoValidationErrors,
		success: {} as TodoTypesModule.TodoValidationSuccess,
		result: {} as TodoTypesModule.TodoValidationResult,
	},

	// Configuration types
	config: {
		todo: {} as TodoTypesModule.TodoConfig,
		optimistic: {} as TodoTypesModule.TodoOptimisticConfig,
		cache: {} as TodoTypesModule.TodoCacheConfig,
	},

	// Event types
	events: {
		change: {} as TodoTypesModule.TodoChangeEvent,
	},

	// Prisma integration types
	prisma: {
		whereInput: {} as TodoTypesModule.TodoWhereInput,
		whereUniqueInput: {} as TodoTypesModule.TodoWhereUniqueInput,
		orderByInput: {} as TodoTypesModule.TodoOrderByInput,
	},
} as const;

// ============================================================================
// SCHEMAS NAMESPACE - Zod validation schemas
// ============================================================================

/**
 * Zod schemas for runtime validation and type inference.
 * Ensures data integrity and provides parsing capabilities.
 */
export const schemas = {
	// Primary schemas
	todo: TodoTypesModule.todoSchema,
	create: TodoTypesModule.TodoCreateInputSchema,
	update: TodoTypesModule.TodoUpdateInputSchema,
	createMany: TodoTypesModule.TodoCreateManyInputSchema,

	// Configuration objects
	select: TodoTypesModule.todoSelect,
} as const;

// ============================================================================
// ROUTES NAMESPACE - API route handlers
// ============================================================================

export const routes = {
	// Collection routes
	collection: {
		GET: TodoRoutesModule.GET,
		POST: TodoRoutesModule.POST,
		PATCH: TodoRoutesModule.PATCH,
		DELETE: TodoRoutesModule.DELETE,
	},

	// Individual item routes
	individual: {
		GET: TodoRoutesModule.GETById,
		PATCH: TodoRoutesModule.PATCHById,
		DELETE: TodoRoutesModule.DELETEById,
	},

	// Relationship routes
	relationships: {
		user: {
			PATCH: TodoRoutesModule.PATCHUser,
		},
		category: {
			PATCH: TodoRoutesModule.PATCHCategory,
			DELETE: TodoRoutesModule.DELETECategory,
		},
		tags: {
			POST: TodoRoutesModule.POSTTags,
			PUT: TodoRoutesModule.PUTTags,
			DELETE: TodoRoutesModule.DELETETags,
		},
	},

	// Utility routes
	utils: {
		count: TodoRoutesModule.GETCount,
		exists: TodoRoutesModule.POSTExists,
	},
} as const;

// ============================================================================
// UTILITIES NAMESPACE - Helper functions and constants
// ============================================================================

/**
 * Utility functions and constants for Todo operations.
 * Provides helper functions and default configurations.
 */
export const utils = {
	// Type guards
	guards: {
		isTodo: TodoTypesModule.isTodo,
		isTodoCreateInput: TodoTypesModule.isTodoCreateInput,
		isTodoValidationError: TodoTypesModule.isTodoValidationError,
	},

	// Default configurations
	defaults: {
		config: TodoTypesModule.DEFAULT_TODO_CONFIG,
		searchParams: TodoTypesModule.DEFAULT_SEARCH_PARAMS,
	},

	// Select object for Prisma queries
	select: TodoTypesModule.todoSelect,
} as const;

// ============================================================================
// MAIN EXPORT - Complete Todo namespace
// ============================================================================

/**
 * Complete Todo namespace with all functionality organized by concern.
 * This is the main export that developers will import and use.
 */
export const todos = {
	actions,
	atoms,
	hooks,
	types,
	schemas,
	routes,
	utils,
} as const;

// ============================================================================
// CONVENIENCE RE-EXPORTS - Direct access to commonly used items
// ============================================================================

// Re-export primary types for convenience
export type {
	Todo,
	TodoCreateInput,
	TodoUpdateInput,
	TodoId,
	UseTodosResult,
	UseTodoResult,
} from "./types";

// Re-export primary schemas for convenience
export {
	todoSchema,
	TodoCreateInputSchema,
	TodoUpdateInputSchema,
	todoSelect,
} from "./types";

// Re-export primary hooks for convenience
export {
	useTodos,
	useTodo,
	useCreateTodoForm,
	useUpdateTodoForm,
} from "./hooks";
