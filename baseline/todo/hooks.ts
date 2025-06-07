"use client";

import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo } from "react";
import {
	batchCreateTodosAtom,
	batchDeleteTodosAtom,
	clearAllErrorsAtom,
	clearTodoErrorAtom,
	hasAnyErrorAtom,
	isAnyLoadingAtom,
	isTodosEmptyAtom,
	optimisticCreateTodoAtom,
	optimisticDeleteTodoAtom,
	optimisticUpdateTodoAtom,
	// Action atoms
	refreshTodosAtom,
	// Individual todo atoms
	todoByIdAtom,
	// Derived atoms
	todoCountAtom,
	todoCreatingAtom,
	todoDeletingAtom,
	todoErrorsAtom,
	todoExistsAtom,
	todoListAtom,
	todoLoadingStateAtom,
	// Error atoms
	todosErrorAtom,
	// Loading atoms
	todosLoadingAtom,
	todoUpdatingAtom,
} from "./atoms";
import type {
	Todo,
	TodoCreateInput,
	TodoUpdateInput,
	UseCreateTodoFormResult,
	UseTodoResult,
	UseTodosResult,
	UseUpdateTodoFormResult,
} from "./types";

// ============================================================================
// UNIFIED TODOS HOOK - Primary interface for Todo management
// ============================================================================

/**
 * Unified hook providing comprehensive Todo management functionality.
 * This is the primary hook developers should use for most Todo operations.
 *
 * @returns Complete Todo management interface with CRUD operations
 */
export function useTodos(): UseTodosResult {
	// Data atoms
	const data = useAtomValue(todoListAtom);
	const count = useAtomValue(todoCountAtom);
	const isEmpty = useAtomValue(isTodosEmptyAtom);

	// Loading state atoms
	const loading = useAtomValue(todosLoadingAtom);
	const isCreating = useAtomValue(todoCreatingAtom);
	const updating = useAtomValue(todoUpdatingAtom);
	const deleting = useAtomValue(todoDeletingAtom);
	const isAnyLoading = useAtomValue(isAnyLoadingAtom);

	// Error state atoms
	const error = useAtomValue(todosErrorAtom);
	const hasError = useAtomValue(hasAnyErrorAtom);

	// Action atoms
	const refresh = useSetAtom(refreshTodosAtom);
	const createTodoAction = useSetAtom(optimisticCreateTodoAtom);
	const updateTodoAction = useSetAtom(optimisticUpdateTodoAtom);
	const deleteTodoAction = useSetAtom(optimisticDeleteTodoAtom);
	const batchCreateAction = useSetAtom(batchCreateTodosAtom);
	const batchDeleteAction = useSetAtom(batchDeleteTodosAtom);
	const clearError = useSetAtom(clearAllErrorsAtom);

	// Memoized CRUD operations
	const createTodo = useCallback(
		async (input: TodoCreateInput): Promise<Todo> => {
			return await createTodoAction(input);
		},
		[createTodoAction],
	);

	const updateTodo = useCallback(
		async (id: string, input: TodoUpdateInput): Promise<Todo> => {
			return await updateTodoAction({ id, data: input });
		},
		[updateTodoAction],
	);

	const deleteTodo = useCallback(
		async (id: string): Promise<void> => {
			await deleteTodoAction(id);
		},
		[deleteTodoAction],
	);

	// Memoized batch operations
	const createMany = useCallback(
		async (inputs: TodoCreateInput[]): Promise<{ count: number }> => {
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
		createTodo,
		updateTodo,
		deleteTodo,

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
// INDIVIDUAL TODO HOOK - For working with specific todos
// ============================================================================

/**
 * Hook for managing a specific Todo by ID.
 * Provides focused operations and form integration for individual todos.
 *
 * @param id - Todo ID to manage
 * @returns Individual Todo management interface
 */
export function useTodo(id: string): UseTodoResult {
	// Data atoms for this specific todo
	const data = useAtomValue(todoByIdAtom(id));
	const exists = useAtomValue(todoExistsAtom(id));
	const loadingState = useAtomValue(todoLoadingStateAtom(id));
	const error = useAtomValue(todoErrorsAtom)[id] || null;

	// Action atoms
	const updateTodoAction = useSetAtom(optimisticUpdateTodoAtom);
	const deleteTodoAction = useSetAtom(optimisticDeleteTodoAtom);
	const clearTodoError = useSetAtom(clearTodoErrorAtom(id));

	// Memoized operations
	const update = useCallback(
		async (input: TodoUpdateInput): Promise<Todo> => {
			return await updateTodoAction({ id, data: input });
		},
		[id, updateTodoAction],
	);

	const deleteTodo = useCallback(async (): Promise<void> => {
		await deleteTodoAction(id);
	}, [id, deleteTodoAction]);

	// Form integration
	const form = useUpdateTodoForm(id, data);

	return {
		// Data
		data,
		loading: loadingState.isLoading,
		error,
		exists,

		// Operations
		update,
		delete: deleteTodo,

		// State
		isUpdating: loadingState.updating,
		isDeleting: loadingState.deleting,
		isOptimistic: loadingState.hasOptimisticUpdate,

		// Form integration
		form,
	};
}

// ============================================================================
// FORM HOOKS - Specialized hooks for form handling
// ============================================================================

/**
 * Hook for creating new todos with form validation and auto-save.
 * Provides comprehensive form state management and validation.
 *
 * @param initialData - Optional initial form data
 * @returns Create form interface with validation and submission
 */
export function useCreateTodoForm(initialData: Partial<TodoCreateInput> = {}): UseCreateTodoFormResult {
	// Form state
	const [formData, setFormData] = useAtom(useMemo(() => atom(initialData), [initialData]));
	const [errors, setErrors] = useAtom(useMemo(() => atom<Record<string, string>>({}), []));
	const [touched, setTouched] = useAtom(useMemo(() => atom<Record<string, boolean>>({}), []));
	const [isDirty, setIsDirty] = useAtom(useMemo(() => atom(false), []));

	// Action atoms
	const createTodoAction = useSetAtom(optimisticCreateTodoAtom);
	const isCreating = useAtomValue(todoCreatingAtom);
	const globalError = useAtomValue(todosErrorAtom);

	// Validation function
	const validate = useCallback((): boolean => {
		const newErrors: Record<string, string> = {};

		// Required field validation
		if (!formData.title?.trim()) {
			newErrors.title = "Title is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}, [formData, setErrors]);

	// Field validation function
	const validateField = useCallback(
		(fieldName: keyof TodoCreateInput): boolean => {
			const newErrors = { ...errors };

			// Clear existing error for this field
			delete newErrors[fieldName];

			// Validate specific field
			switch (fieldName) {
				case "title":
					if (!formData.title?.trim()) {
						newErrors.title = "Title is required";
					}
					break;
				case "description":
					break;
			}

			setErrors(newErrors);
			return !(fieldName in newErrors);
		},
		[formData, errors, setErrors],
	);

	// Field helper function
	const field = useCallback(
		(name: keyof TodoCreateInput) => ({
			name: name as string,
			value: formData[name] || "",
			onChange: (value: any) => {
				setFormData((prev) => ({ ...prev, [name]: value }));
				setIsDirty(true);

				// Clear error when user starts typing
				if (errors[name]) {
					setErrors((prev) => {
						const { [name]: _, ...rest } = prev;
						return rest;
					});
				}
			},
			onBlur: () => {
				setTouched((prev) => ({ ...prev, [name]: true }));
				validateField(name);
			},
			error: errors[name],
			required: name === "title", // Only title is required
			isValid: !errors[name],
			touched: touched[name] || false,
		}),
		[formData, errors, touched, setFormData, setTouched, setErrors, setIsDirty, validateField],
	);

	// Submit function
	const submit = useCallback(async (): Promise<Todo | null> => {
		// Mark all fields as touched
		const touchedFields: Record<string, boolean> = {};
		for (const key of Object.keys(formData)) {
			touchedFields[key] = true;
		}
		setTouched(touchedFields);

		// Validate form
		if (!validate()) {
			return null;
		}

		try {
			const result = await createTodoAction(formData as TodoCreateInput);

			// Reset form on success
			setFormData(initialData);
			setErrors({});
			setTouched({});
			setIsDirty(false);

			return result;
		} catch (error) {
			// Form errors are handled by the action atom
			return null;
		}
	}, [formData, validate, createTodoAction, initialData, setFormData, setErrors, setTouched, setIsDirty]);

	// Reset function
	const reset = useCallback(() => {
		setFormData(initialData);
		setErrors({});
		setTouched({});
		setIsDirty(false);
	}, [initialData, setFormData, setErrors, setTouched, setIsDirty]);

	// Set data function
	const setData = useCallback(
		(data: Partial<TodoCreateInput>) => {
			setFormData((prev) => ({ ...prev, ...data }));
			setIsDirty(true);
		},
		[setFormData, setIsDirty],
	);

	// Computed validation state
	const isValid = useMemo(() => {
		return Object.keys(errors).length === 0 && !!formData.title?.trim();
	}, [errors, formData.title]);

	return {
		// Form data
		data: formData,

		// Field helpers
		field,

		// Form operations
		submit,
		reset,
		setData,

		// Loading states
		loading: isCreating,
		error: globalError ? new Error(globalError) : null,

		// Validation methods
		validate,
		validateField,

		// Validation state
		isValid,
		isDirty,
		errors,
		touched,

		// Auto-save capabilities (placeholders for now)
		enableAutoSave: () => {
			console.warn("Auto-save not implemented yet");
		},
		disableAutoSave: () => {
			console.warn("Auto-save not implemented yet");
		},
	};
}

/**
 * Hook for updating existing todos with form validation.
 * Provides update-specific form state management.
 *
 * @param id - Todo ID to update
 * @param initialData - Initial todo data for the form
 * @returns Update form interface with validation and submission
 */
export function useUpdateTodoForm(id: string, initialData: Todo | null = null): UseUpdateTodoFormResult {
	// Form state
	const [formData, setFormData] = useAtom(
		useMemo(
			() =>
				atom<Partial<TodoUpdateInput>>(
					initialData
						? {
								title: initialData.title,
								description: initialData.description,
								status: initialData.status,
								priority: initialData.priority,
								dueDate: initialData.dueDate,
								categoryId: initialData.categoryId,
							}
						: {},
				),
			[initialData],
		),
	);
	const [errors, setErrors] = useAtom(useMemo(() => atom<Record<string, string>>({}), []));
	const [touched, setTouched] = useAtom(useMemo(() => atom<Record<string, boolean>>({}), []));
	const [isDirty, setIsDirty] = useAtom(useMemo(() => atom(false), []));

	// Action atoms
	const updateTodoAction = useSetAtom(optimisticUpdateTodoAtom);
	const updating = useAtomValue(todoUpdatingAtom);
	const isUpdating = updating[id] || false;
	const individualError = useAtomValue(todoErrorsAtom)[id];

	// Update form data when initial data changes
	useEffect(() => {
		if (initialData) {
			setFormData({
				title: initialData.title,
				description: initialData.description,
				status: initialData.status,
				priority: initialData.priority,
				dueDate: initialData.dueDate,
				categoryId: initialData.categoryId,
			});
			setIsDirty(false);
		}
	}, [initialData, setFormData, setIsDirty]);

	// Validation function
	const validate = useCallback((): boolean => {
		const newErrors: Record<string, string> = {};

		// Title validation (if provided)
		if (formData.title !== undefined) {
			if (typeof formData.title === "string" && !formData.title.trim()) {
				newErrors.title = "Title cannot be empty";
			} else if (typeof formData.title === "string" && formData.title.length > 200) {
				newErrors.title = "Title must be less than 200 characters";
			}
		}

		// Description validation (if provided)
		if (
			formData.description !== undefined &&
			typeof formData.description === "string" &&
			formData.description.length > 1000
		) {
			newErrors.description = "Description must be less than 1000 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}, [formData, setErrors]);

	// Field validation function
	const validateField = useCallback(
		(fieldName: keyof TodoUpdateInput): boolean => {
			const newErrors = { ...errors };

			// Clear existing error for this field
			delete newErrors[fieldName];

			// Validate specific field
			switch (fieldName) {
				case "title":
					if (formData.title !== undefined && typeof formData.title === "string") {
						if (!formData.title.trim()) {
							newErrors.title = "Title cannot be empty";
						} else if (formData.title.length > 200) {
							newErrors.title = "Title must be less than 200 characters";
						}
					}
					break;
				case "description":
					if (
						formData.description !== undefined &&
						typeof formData.description === "string" &&
						formData.description.length > 1000
					) {
						newErrors.description = "Description must be less than 1000 characters";
					}
					break;
			}

			setErrors(newErrors);
			return !(fieldName in newErrors);
		},
		[formData, errors, setErrors],
	);

	// Field helper function
	const field = useCallback(
		(name: keyof TodoUpdateInput) => ({
			name: name as string,
			value: formData[name] || "",
			onChange: (value: any) => {
				setFormData((prev) => ({ ...prev, [name]: value }));
				setIsDirty(true);

				// Clear error when user starts typing
				if (errors[name]) {
					setErrors((prev) => {
						const { [name]: _, ...rest } = prev;
						return rest;
					});
				}
			},
			onBlur: () => {
				setTouched((prev) => ({ ...prev, [name]: true }));
				validateField(name);
			},
			error: errors[name],
			required: false, // Updates are always optional
			isValid: !errors[name],
			touched: touched[name] || false,
		}),
		[formData, errors, touched, setFormData, setTouched, setErrors, setIsDirty, validateField],
	);

	// Submit function
	const submit = useCallback(async (): Promise<Todo | null> => {
		// Mark all fields as touched
		const touchedFields: Record<string, boolean> = {};
		for (const key of Object.keys(formData)) {
			touchedFields[key] = true;
		}
		setTouched(touchedFields);

		// Validate form
		if (!validate()) {
			return null;
		}

		try {
			const result = await updateTodoAction({ id, data: formData });
			setIsDirty(false);
			return result;
		} catch (error) {
			// Form errors are handled by the action atom
			return null;
		}
	}, [id, formData, validate, updateTodoAction, setTouched, setIsDirty]);

	// Reset function
	const reset = useCallback(() => {
		setFormData(
			initialData
				? {
						title: initialData.title,
						description: initialData.description,
						status: initialData.status,
						priority: initialData.priority,
						dueDate: initialData.dueDate,
						categoryId: initialData.categoryId,
					}
				: {},
		);
		setErrors({});
		setTouched({});
		setIsDirty(false);
	}, [initialData, setFormData, setErrors, setTouched, setIsDirty]);

	// Set data function
	const setData = useCallback(
		(data: Partial<TodoUpdateInput>) => {
			setFormData((prev) => ({ ...prev, ...data }));
			setIsDirty(true);
		},
		[setFormData, setIsDirty],
	);

	// Computed validation state
	const isValid = useMemo(() => {
		return Object.keys(errors).length === 0;
	}, [errors]);

	return {
		// Form data
		data: formData,

		// Field helpers
		field,

		// Form operations
		submit,
		reset,
		setData,

		// Loading states
		loading: isUpdating,
		error: individualError ? new Error(individualError) : null,

		// Validation methods
		validate,
		validateField,

		// Validation state
		isValid,
		isDirty,
		errors,
		touched,

		// Auto-save capabilities (placeholders for now)
		enableAutoSave: () => {
			console.warn("Auto-save not implemented yet");
		},
		disableAutoSave: () => {
			console.warn("Auto-save not implemented yet");
		},

		// ID for update operations
		id,
	};
}

// ============================================================================
// UTILITY HOOKS - Helper hooks for specific use cases
// ============================================================================

/**
 * Hook to check if any todos are currently loading
 */
export function useIsAnyTodoLoading(): boolean {
	return useAtomValue(isAnyLoadingAtom);
}

/**
 * Hook to check if there are any todo errors
 */
export function useHasTodoErrors(): boolean {
	return useAtomValue(hasAnyErrorAtom);
}

/**
 * Hook to get todo count
 */
export function useTodoCount(): number {
	return useAtomValue(todoCountAtom);
}

/**
 * Hook to check if todos list is empty
 */
export function useIsTodosEmpty(): boolean {
	return useAtomValue(isTodosEmptyAtom);
}
