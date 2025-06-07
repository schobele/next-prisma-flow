import type { z } from "zod";
import type { Prisma } from "../prisma";

export {
	TodoUncheckedCreateInputSchema as TodoCreateInputSchema,
	TodoCreateManyInputSchema,
	TodoSchema as todoSchema,
	TodoUncheckedUpdateInputSchema as TodoUpdateInputSchema,
} from "../zod";

import type { TodoCreateManyInputSchema, TodoUncheckedCreateInputSchema, TodoUncheckedUpdateInputSchema } from "../zod";

// ============================================================================
// CORE TYPES - Inferred from Zod schemas for consistency
// ============================================================================

/** Input type for creating a new Todo */
export type TodoCreateInput = z.infer<typeof TodoUncheckedCreateInputSchema>;

/** Input type for updating an existing Todo */
export type TodoUpdateInput = z.infer<typeof TodoUncheckedUpdateInputSchema>;

/** Input type for batch creating Todos */
export type TodoCreateManyInput = z.infer<typeof TodoCreateManyInputSchema>;

// ============================================================================
// PRISMA WHERE TYPES - Direct exports from Prisma for flexible querying
// ============================================================================

/** Where conditions for filtering todos */
export type TodoWhereInput = Prisma.TodoWhereInput;

/** Unique selectors for identifying a specific todo */
export type TodoWhereUniqueInput = Prisma.TodoWhereUniqueInput;

/** Order by options for sorting todos */
export type TodoOrderByInput = Prisma.TodoOrderByWithRelationInput;

// ============================================================================
// RELATED MODEL WHERE TYPES - For relationship operations
// ============================================================================

/** Unique selectors for user entities (for relationship operations) */
export type UserWhereUniqueInput = Prisma.UserWhereUniqueInput;

/** Unique selectors for category entities (for relationship operations) */
export type CategoryWhereUniqueInput = Prisma.CategoryWhereUniqueInput;

/** Unique selectors for tag entities (for relationship operations) */
export type TagWhereUniqueInput = Prisma.TagWhereUniqueInput;

// ============================================================================
// PRISMA INTEGRATION - Proper select object and type generation
// ============================================================================

/**
 * Select object that defines exactly which fields are exposed from the database.
 * This serves as a security whitelist and performance optimization.
 */
export const todoSelect = {
	// Core fields
	id: true,
	title: true,
	description: true,
	status: true,
	priority: true,
	dueDate: true,
	completedAt: true,
	createdAt: true,
	updatedAt: true,

	// Foreign keys
	userId: true,
	categoryId: true,

	// Relations (with selective field exposure)
	user: {
		select: {
			id: true,
			email: true,
			name: true,
			createdAt: true,
			updatedAt: true,
		},
	},
	category: {
		select: {
			id: true,
			name: true,
			createdAt: true,
		},
	},
	tags: {
		select: {
			id: true,
			name: true,
			createdAt: true,
		},
	},
} satisfies Prisma.TodoSelect;

/**
 * Generated Todo type based on our select object.
 * This ensures type safety between database queries and TypeScript types.
 */
export type Todo = Prisma.TodoGetPayload<{
	select: typeof todoSelect;
}>;

// ============================================================================
// UTILITY TYPES - Common patterns for working with Todos
// ============================================================================

/** Strongly typed Todo ID */
export type TodoId = Todo["id"];

/** Alias for better readability in function signatures */
export type TodoInput = TodoCreateInput;

// Note: Prisma where types are defined above in the PRISMA WHERE TYPES section

// ============================================================================
// ARRAY AND COLLECTION TYPES
// ============================================================================

/** Array of Todo entities */
export type TodoArray = Todo[];

/** Array of create inputs for batch operations */
export type TodoCreateInputArray = TodoInput[];

/** Array of create many inputs for optimized batch inserts */
export type TodoCreateManyInputArray = TodoCreateManyInput[];

/** Partial Todo input for optional updates */
export type PartialTodoInput = Partial<TodoInput>;

// ============================================================================
// RELATIONSHIP OPERATION TYPES - Types for relationship management
// ============================================================================

/** Parameters for setting a required relationship */
export interface SetRequiredRelationParams<TRelatedWhere> {
	/** Unique selector for the main record */
	where: TodoWhereUniqueInput;
	/** Unique selector for the related record to associate */
	relatedWhere: TRelatedWhere;
	/** Additional Prisma options */
	options?: Omit<Prisma.TodoUpdateArgs, "where" | "data" | "select"> & { select?: never };
}

/** Parameters for setting an optional relationship */
export interface SetOptionalRelationParams<TRelatedWhere> {
	/** Unique selector for the main record */
	where: TodoWhereUniqueInput;
	/** Unique selector for the related record to associate */
	relatedWhere: TRelatedWhere;
	/** Additional Prisma options */
	options?: Omit<Prisma.TodoUpdateArgs, "where" | "data" | "select"> & { select?: never };
}

/** Parameters for removing an optional relationship */
export interface RemoveOptionalRelationParams {
	/** Unique selector for the main record */
	where: TodoWhereUniqueInput;
	/** Additional Prisma options */
	options?: Omit<Prisma.TodoUpdateArgs, "where" | "data" | "select"> & { select?: never };
}

/** Parameters for many-to-many relationship operations */
export interface ManyToManyRelationParams<TRelatedWhere> {
	/** Unique selector for the main record */
	where: TodoWhereUniqueInput;
	/** Array of unique selectors for related records */
	relatedWheres: TRelatedWhere[];
	/** Additional Prisma options */
	options?: Omit<Prisma.TodoUpdateArgs, "where" | "data" | "select"> & { select?: never };
}

/** Parameters for clearing many-to-many relationships */
export interface ClearManyToManyRelationParams {
	/** Unique selector for the main record */
	where: TodoWhereUniqueInput;
	/** Additional Prisma options */
	options?: Omit<Prisma.TodoUpdateArgs, "where" | "data" | "select"> & { select?: never };
}

// ============================================================================
// API AND SEARCH TYPES - For query operations and pagination
// ============================================================================

/** Parameters for searching and filtering todos */
export interface TodoSearchParams {
	/** Full-text search query */
	query?: string;

	/** Pagination page number (1-based) */
	page?: number;

	/** Number of items per page */
	limit?: number;

	/** Field to sort by */
	orderBy?: keyof Todo;

	/** Sort direction */
	orderDirection?: "asc" | "desc";
}

/** Extended search parameters with Prisma where conditions */
export interface TodoFilterParams extends TodoSearchParams {
	/** Advanced filtering with Prisma where conditions */
	where?: TodoWhereInput;
}

// ============================================================================
// API RESPONSE TYPES - Standardized response formats
// ============================================================================

/** Standard API response for single Todo operations */
export interface TodoApiResponse {
	data: Todo;
	success: boolean;
	message?: string;
	meta?: {
		timestamp: string;
		requestId?: string;
	};
}

/** API response for Todo list operations with pagination */
export interface TodoListApiResponse {
	data: Todo[];
	success: boolean;
	message?: string;
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrevious: boolean;
	};
	meta?: {
		timestamp: string;
		requestId?: string;
	};
}

/** Response type for mutations (create, update, delete) */
export interface TodoMutationResponse {
	data?: Todo;
	success: boolean;
	message?: string;
	errors?: Record<string, string[]>;
	meta?: {
		timestamp: string;
		requestId?: string;
	};
}

/** Response type for batch operations */
export interface TodoBatchResponse {
	count: number;
	success: boolean;
	message?: string;
	errors?: Array<{
		index: number;
		error: string;
	}>;
	meta?: {
		timestamp: string;
		requestId?: string;
	};
}

// ============================================================================
// STATE MANAGEMENT TYPES - For Jotai atoms and React state
// ============================================================================

/** Complete state shape for Todo management */
export interface TodoState {
	/** Map of todos by ID for efficient updates */
	items: Record<string, Todo>;

	/** Global loading state */
	loading: boolean;

	/** Creation loading state */
	creating: boolean;

	/** Update loading states by todo ID */
	updating: Record<string, boolean>;

	/** Delete loading states by todo ID */
	deleting: Record<string, boolean>;

	/** Global error state */
	error: string | null;

	/** Last fetch timestamp for cache management */
	lastFetched?: number;

	/** Optimistic update tracking */
	optimisticUpdates: Record<string, TodoOptimisticUpdate>;
}

/** Tracking data for optimistic updates */
export interface TodoOptimisticUpdate {
	/** Unique ID for the optimistic update */
	id: string;

	/** The optimistic data */
	data: Partial<Todo>;

	/** When the optimistic update was created */
	timestamp: number;

	/** Original data for rollback */
	originalData?: Todo;

	/** Operation type */
	operation: "create" | "update" | "delete";
}

// ============================================================================
// FORM TYPES - For React Hook Form and form handling
// ============================================================================

/** Form data type excluding auto-generated fields */
export type TodoFormData = Omit<TodoInput, "id" | "createdAt" | "updatedAt">;

/** Partial form data for updates */
export type TodoUpdateFormData = Partial<TodoFormData>;

/** Field configuration for form hooks */
export interface TodoFieldConfig {
	/** Field name */
	name: string;

	/** Current field value */
	value: any;

	/** Change handler */
	onChange: (value: any) => void;

	/** Blur handler for validation */
	onBlur: () => void;

	/** Field validation error */
	error?: string;

	/** Whether field is required */
	required?: boolean;

	/** Field validation state */
	isValid?: boolean;

	/** Whether field has been touched */
	touched?: boolean;
}

/** Form validation state */
export interface TodoFormValidation {
	/** Whether entire form is valid */
	isValid: boolean;

	/** Whether form has been modified */
	isDirty: boolean;

	/** Field-specific errors */
	errors: Record<string, string>;

	/** Fields that have been touched */
	touched: Record<string, boolean>;
}

// ============================================================================
// EVENT TYPES - For custom hooks and event handling
// ============================================================================

/** Event emitted when a Todo changes */
export interface TodoChangeEvent {
	/** Type of change */
	type: "create" | "update" | "delete";

	/** The todo after the change */
	todo: Todo;

	/** The todo before the change (for updates) */
	previousValue?: Todo;

	/** Timestamp of the change */
	timestamp: number;

	/** Whether this was an optimistic update */
	optimistic: boolean;
}

// ============================================================================
// VALIDATION TYPES - For error handling and validation
// ============================================================================

/** Individual field validation error */
export interface TodoValidationError {
	/** Field that has the error */
	field: keyof TodoInput;

	/** Human-readable error message */
	message: string;

	/** Error code for programmatic handling */
	code: string;

	/** Additional error context */
	context?: Record<string, any>;
}

/** Collection of validation errors */
export interface TodoValidationErrors {
	/** Array of field errors */
	errors: TodoValidationError[];

	/** Overall error message */
	message: string;

	/** Whether validation failed */
	isValid: false;
}

/** Successful validation result */
export interface TodoValidationSuccess {
	/** Validation passed */
	isValid: true;

	/** Validated data */
	data: TodoInput;
}

/** Union type for validation results */
export type TodoValidationResult = TodoValidationSuccess | TodoValidationErrors;

// ============================================================================
// HOOK RESULT TYPES - Return types for custom hooks
// ============================================================================

/** Result type for useTodos hook */
export interface UseTodosResult {
	// Data
	data: Todo[];
	loading: boolean;
	error: string | null;
	count: number;
	isEmpty: boolean;

	// CRUD operations
	createTodo: (data: TodoCreateInput) => Promise<Todo>;
	updateTodo: (id: string, data: TodoUpdateInput) => Promise<Todo>;
	deleteTodo: (id: string) => Promise<void>;

	// Batch operations
	createMany: (data: TodoCreateInput[]) => Promise<{ count: number }>;
	deleteMany: (ids: string[]) => Promise<{ count: number }>;

	// State management
	refresh: () => void;
	clearError: () => void;

	// Loading states for individual operations
	isCreating: boolean;
	isUpdating: (id: string) => boolean;
	isDeleting: (id: string) => boolean;

	// Optimistic updates info
	optimisticUpdates: Record<string, boolean>;
}

/** Result type for useTodo hook */
export interface UseTodoResult {
	// Data
	data: Todo | null;
	loading: boolean;
	error: string | null;
	exists: boolean;

	// Operations
	update: (data: TodoUpdateInput) => Promise<Todo>;
	delete: () => Promise<void>;

	// State
	isUpdating: boolean;
	isDeleting: boolean;
	isOptimistic: boolean;

	// Form integration
	form: UseUpdateTodoFormResult;
}

/** Result type for create form hook */
export interface UseCreateTodoFormResult extends TodoFormValidation {
	// Form data
	data: Partial<TodoCreateInput>;

	// Field helpers
	field: (name: keyof TodoCreateInput) => TodoFieldConfig;

	// Form operations
	submit: () => Promise<Todo | null>;
	reset: () => void;
	setData: (data: Partial<TodoCreateInput>) => void;

	// Loading states
	loading: boolean;
	error: Error | null;

	// Validation methods
	validate: () => boolean;
	validateField: (field: keyof TodoCreateInput) => boolean;

	// Auto-save capabilities
	enableAutoSave: (debounceMs?: number) => void;
	disableAutoSave: () => void;
}

/** Result type for update form hook */
export interface UseUpdateTodoFormResult extends TodoFormValidation {
	// Form data
	data: Partial<TodoUpdateInput>;

	// Field helpers
	field: (name: keyof TodoUpdateInput) => TodoFieldConfig;

	// Form operations
	submit: () => Promise<Todo | null>;
	reset: () => void;
	setData: (data: Partial<TodoUpdateInput>) => void;

	// Loading states
	loading: boolean;
	error: Error | null;

	// Validation methods
	validate: () => boolean;
	validateField: (field: keyof TodoUpdateInput) => boolean;

	// Auto-save capabilities
	enableAutoSave: (debounceMs?: number) => void;
	disableAutoSave: () => void;

	// ID for update operations
	id: string;
}

// ============================================================================
// CONFIGURATION TYPES - For customizing behavior
// ============================================================================

/** Configuration for optimistic updates */
export interface TodoOptimisticConfig {
	/** Strategy for handling conflicts */
	conflictResolution: "merge" | "overwrite" | "manual";

	/** Timeout for optimistic updates (ms) */
	timeout: number;

	/** Maximum number of retries */
	maxRetries: number;
}

/** Configuration for caching behavior */
export interface TodoCacheConfig {
	/** Cache TTL in milliseconds */
	ttl: number;

	/** Whether to use stale-while-revalidate */
	staleWhileRevalidate: boolean;

	/** Cache tags for invalidation */
	tags: string[];
}

/** Overall configuration for Todo operations */
export interface TodoConfig {
	/** Optimistic update configuration */
	optimistic: TodoOptimisticConfig;

	/** Cache configuration */
	cache: TodoCacheConfig;

	/** Whether to enable debug logging */
	debug: boolean;

	/** Custom error handler */
	onError?: (error: Error, context: string) => void;
}

// ============================================================================
// TYPE GUARDS - Runtime type checking utilities
// ============================================================================

/** Type guard to check if a value is a valid Todo */
export function isTodo(value: any): value is Todo {
	return typeof value === "object" && value !== null && typeof value.id === "string" && typeof value.title === "string";
}

/** Type guard to check if a value is a valid TodoCreateInput */
export function isTodoCreateInput(value: any): value is TodoCreateInput {
	return typeof value === "object" && value !== null && typeof value.title === "string";
}

/** Type guard to check if a value is a validation error */
export function isTodoValidationError(value: any): value is TodoValidationErrors {
	return typeof value === "object" && value !== null && value.isValid === false && Array.isArray(value.errors);
}

// ============================================================================
// DEFAULT VALUES - Sensible defaults for various types
// ============================================================================

/** Default configuration values */
export const DEFAULT_TODO_CONFIG: TodoConfig = {
	optimistic: {
		conflictResolution: "merge",
		timeout: 5000,
		maxRetries: 3,
	},
	cache: {
		ttl: 300000, // 5 minutes
		staleWhileRevalidate: true,
		tags: ["Todo"],
	},
	debug: process.env.NODE_ENV === "development",
};

/** Default search parameters */
export const DEFAULT_SEARCH_PARAMS: Required<TodoSearchParams> = {
	query: "",
	page: 1,
	limit: 10,
	orderBy: "createdAt",
	orderDirection: "desc",
};

// ============================================================================
// UTILITY TYPE HELPERS
// ============================================================================

/** Extract keys that are required in TodoCreateInput */
export type RequiredTodoFields = {
	[K in keyof TodoCreateInput]-?: TodoCreateInput[K] extends undefined ? never : K;
}[keyof TodoCreateInput];

/** Extract keys that are optional in TodoCreateInput */
export type OptionalTodoFields = {
	[K in keyof TodoCreateInput]-?: TodoCreateInput[K] extends undefined ? K : never;
}[keyof TodoCreateInput];

/** Make specific fields required */
export type TodoWith<T extends keyof Todo> = Todo & Required<Pick<Todo, T>>;

/** Make specific fields optional */
export type TodoWithout<T extends keyof Todo> = Todo & Partial<Pick<Todo, T>>;
