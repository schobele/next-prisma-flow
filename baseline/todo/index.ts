// ============================================================================
// CORE EXPORTS - Primary functionality for Todo management
// ============================================================================

// Export the complete namespace (recommended approach)
export { todos } from "./namespace";

// Export individual modules for direct access
export * as TodoActions from "./actions";
export * as TodoAtoms from "./atoms";
export * as TodoHooks from "./hooks";
export * as TodoRoutes from "./routes";
export * as TodoSmartForm from "./smart-form";
export * as TodoTypes from "./types";

// Export form providers
export {
	CreateFormProvider,
	UpdateFormProvider,
	useCreateFormContext,
	useUpdateFormContext,
	type CreateFormContext,
	type CreateFormProviderProps,
	type TodoFormProviderConfig,
	type UpdateFormContext,
	type UpdateFormProviderProps,
} from "./form-provider";

// ============================================================================
// CONVENIENCE EXPORTS - Commonly used types and functions
// ============================================================================

// Primary types for external usage
export type {
	Todo,
	TodoApiResponse,
	TodoArray,
	TodoBatchResponse,
	TodoConfig,
	TodoCreateInput,
	TodoCreateManyInput,
	TodoFieldConfig,
	TodoFilterParams,
	TodoFormData,
	TodoFormValidation,
	TodoId,
	TodoListApiResponse,
	TodoMutationResponse,
	TodoOptimisticUpdate,
	TodoSearchParams,
	TodoState,
	TodoUpdateFormData,
	TodoUpdateInput,
	TodoValidationResult,
	UseCreateTodoFormResult,
	UseTodoResult,
	UseTodosResult,
	UseUpdateTodoFormResult,
} from "./types";

// Primary schemas for validation
export {
	TodoCreateInputSchema,
	TodoCreateManyInputSchema,
	todoSchema,
	todoSelect,
	TodoUpdateInputSchema,
} from "./types";

// Primary hooks for React integration
export {
	useCreateTodoForm,
	useHasTodoErrors,
	useIsAnyTodoLoading,
	useIsTodosEmpty,
	useTodo,
	useTodoCount,
	useTodos,
	useUpdateTodoForm,
} from "./hooks";

// Primary actions for server operations
export {
	addTags,
	clearTags,
	count,
	create,
	createMany,
	deleteMany,
	deleteRecord,
	exists,
	findFirst,
	findMany,
	findUnique,
	removeCategory,
	removeTags,
	replaceTags,
	setCategory,
	setUser,
	update,
	updateMany,
	upsert,
} from "./actions";

// Primary atoms for state management
export * as atoms from "./atoms";

// API route handlers for Next.js
export * as routes from "./routes";

// Smart form utilities
export * as form from "./smart-form";

// Type guards and utilities
export {
	isTodo,
	isTodoCreateInput,
	isTodoValidationError,
} from "./types";
