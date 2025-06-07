"use client";

import React, { createContext, useContext, useMemo, useCallback, type ReactNode } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { atom } from "jotai";
import type {
	Todo,
	TodoCreateInput,
	TodoUpdateInput,
	TodoFormValidation,
	TodoFieldConfig,
	TodoConfig,
	DEFAULT_TODO_CONFIG,
} from "./types";
import {
	optimisticCreateTodoAtom,
	optimisticUpdateTodoAtom,
	todoCreatingAtom,
	todoUpdatingAtom,
	todosErrorAtom,
	todoErrorsAtom,
} from "./atoms";

// ============================================================================
// CONTEXT TYPES - TypeScript interfaces for form context
// ============================================================================

/** Configuration for form provider behavior */
export interface TodoFormProviderConfig {
	/** Whether to validate on field change */
	validateOnChange?: boolean;

	/** Whether to validate on field blur */
	validateOnBlur?: boolean;

	/** Whether to validate on form submission */
	validateOnSubmit?: boolean;

	/** Debounce delay for validation (ms) */
	validationDelay?: number;

	/** Whether to reset form after successful submission */
	resetOnSuccess?: boolean;

	/** Whether to focus first error field on validation failure */
	focusOnError?: boolean;

	/** Custom error messages */
	errorMessages?: Record<string, string>;

	/** Default values for new forms */
	defaultValues?: Partial<TodoCreateInput>;
}

/** Form state for create operations */
export interface CreateFormState {
	/** Current form data */
	data: Partial<TodoCreateInput>;

	/** Field validation errors */
	errors: Record<string, string>;

	/** Fields that have been touched */
	touched: Record<string, boolean>;

	/** Whether form has been modified */
	isDirty: boolean;

	/** Whether form is currently submitting */
	isSubmitting: boolean;

	/** Whether form is valid */
	isValid: boolean;
}

/** Form state for update operations */
export interface UpdateFormState {
	/** Todo ID being updated */
	id: string;

	/** Current form data */
	data: Partial<TodoUpdateInput>;

	/** Original todo data */
	originalData: Todo | null;

	/** Field validation errors */
	errors: Record<string, string>;

	/** Fields that have been touched */
	touched: Record<string, boolean>;

	/** Whether form has been modified */
	isDirty: boolean;

	/** Whether form is currently submitting */
	isSubmitting: boolean;

	/** Whether form is valid */
	isValid: boolean;
}

/** Form actions for create operations */
export interface CreateFormActions {
	/** Update form data */
	setData: (data: Partial<TodoCreateInput>) => void;

	/** Update a specific field */
	setField: (field: keyof TodoCreateInput, value: any) => void;

	/** Mark field as touched */
	touchField: (field: keyof TodoCreateInput) => void;

	/** Set field error */
	setFieldError: (field: keyof TodoCreateInput, error: string) => void;

	/** Clear field error */
	clearFieldError: (field: keyof TodoCreateInput) => void;

	/** Clear all errors */
	clearAllErrors: () => void;

	/** Validate specific field */
	validateField: (field: keyof TodoCreateInput) => boolean;

	/** Validate entire form */
	validateForm: () => boolean;

	/** Submit form */
	submit: () => Promise<Todo | null>;

	/** Reset form to initial state */
	reset: () => void;
}

/** Form actions for update operations */
export interface UpdateFormActions {
	/** Update form data */
	setData: (data: Partial<TodoUpdateInput>) => void;

	/** Update a specific field */
	setField: (field: keyof TodoUpdateInput, value: any) => void;

	/** Mark field as touched */
	touchField: (field: keyof TodoUpdateInput) => void;

	/** Set field error */
	setFieldError: (field: keyof TodoUpdateInput, error: string) => void;

	/** Clear field error */
	clearFieldError: (field: keyof TodoUpdateInput) => void;

	/** Clear all errors */
	clearAllErrors: () => void;

	/** Validate specific field */
	validateField: (field: keyof TodoUpdateInput) => boolean;

	/** Validate entire form */
	validateForm: () => boolean;

	/** Submit form */
	submit: () => Promise<Todo | null>;

	/** Reset form to original data */
	reset: () => void;
}

/** Complete form context for create operations */
export interface CreateFormContext {
	state: CreateFormState;
	actions: CreateFormActions;
	config: TodoFormProviderConfig;
	field: (name: keyof TodoCreateInput) => TodoFieldConfig;
}

/** Complete form context for update operations */
export interface UpdateFormContext {
	state: UpdateFormState;
	actions: UpdateFormActions;
	config: TodoFormProviderConfig;
	field: (name: keyof TodoUpdateInput) => TodoFieldConfig;
}

// ============================================================================
// CONTEXT CREATION - React contexts for form providers
// ============================================================================

/** Context for create form operations */
const CreateFormContext = createContext<CreateFormContext | null>(null);

/** Context for update form operations */
const UpdateFormContext = createContext<UpdateFormContext | null>(null);

// ============================================================================
// CREATE FORM PROVIDER - Provider for todo creation forms
// ============================================================================

/** Props for create form provider */
export interface CreateFormProviderProps {
	children: ReactNode;
	config?: TodoFormProviderConfig;
	initialData?: Partial<TodoCreateInput>;
	onSuccess?: (todo: Todo) => void;
	onError?: (error: Error) => void;
}

/**
 * Provider for Todo creation forms with comprehensive state management.
 * Handles form validation, submission, and error states.
 */
export function CreateFormProvider({
	children,
	config = {},
	initialData = {},
	onSuccess,
	onError,
}: CreateFormProviderProps): JSX.Element {
	// Merge with default configuration
	const formConfig: TodoFormProviderConfig = useMemo(
		() => ({
			validateOnChange: true,
			validateOnBlur: true,
			validateOnSubmit: true,
			validationDelay: 300,
			resetOnSuccess: true,
			focusOnError: true,
			defaultValues: {},
			...config,
		}),
		[config],
	);

	// Form state atoms
	const [formData, setFormData] = useAtom(
		useMemo(() => atom({ ...formConfig.defaultValues, ...initialData }), [formConfig.defaultValues, initialData]),
	);
	const [errors, setErrors] = useAtom(useMemo(() => atom<Record<string, string>>({}), []));
	const [touched, setTouched] = useAtom(useMemo(() => atom<Record<string, boolean>>({}), []));
	const [isDirty, setIsDirty] = useAtom(useMemo(() => atom(false), []));
	const [isSubmitting, setIsSubmitting] = useAtom(useMemo(() => atom(false), []));

	// Global state
	const isCreating = useAtomValue(todoCreatingAtom);
	const globalError = useAtomValue(todosErrorAtom);
	const createTodoAction = useSetAtom(optimisticCreateTodoAtom);

	// Validation function
	const validateField = useCallback(
		(field: keyof TodoCreateInput): boolean => {
			const value = formData[field];
			let error = "";

			switch (field) {
				case "title":
					if (!value || (typeof value === "string" && !value.trim())) {
						error = formConfig.errorMessages?.titleRequired || "Title is required";
					} else if (typeof value === "string" && value.length > 200) {
						error = formConfig.errorMessages?.titleTooLong || "Title must be less than 200 characters";
					}
					break;

				case "description":
					if (value && typeof value === "string" && value.length > 1000) {
						error = formConfig.errorMessages?.descriptionTooLong || "Description must be less than 1000 characters";
					}
					break;
			}

			setErrors((prev: Record<string, string>) => {
				if (error) {
					return { ...prev, [field]: error };
				} else {
					const { [field]: _, ...rest } = prev;
					return rest;
				}
			});

			return !error;
		},
		[formData, formConfig.errorMessages, setErrors],
	);

	// Validate entire form
	const validateForm = useCallback((): boolean => {
		const fields: (keyof TodoCreateInput)[] = ["title", "description"];
		const results = fields.map(validateField);
		return results.every(Boolean);
	}, [validateField]);

	// Form actions
	const actions: CreateFormActions = useMemo(
		() => ({
			setData: (data: Partial<TodoCreateInput>) => {
				setFormData((prev) => ({ ...prev, ...data }));
				setIsDirty(true);
			},

			setField: (field: keyof TodoCreateInput, value: any) => {
				setFormData((prev) => ({ ...prev, [field]: value }));
				setIsDirty(true);

				if (formConfig.validateOnChange) {
					setTimeout(() => validateField(field), formConfig.validationDelay);
				}
			},

			touchField: (field: keyof TodoCreateInput) => {
				setTouched((prev) => ({ ...prev, [field]: true }));

				if (formConfig.validateOnBlur) {
					validateField(field);
				}
			},

			setFieldError: (field: keyof TodoCreateInput, error: string) => {
				setErrors((prev) => ({ ...prev, [field]: error }));
			},

			clearFieldError: (field: keyof TodoCreateInput) => {
				setErrors((prev) => {
					const { [field]: _, ...rest } = prev;
					return rest;
				});
			},

			clearAllErrors: () => {
				setErrors({});
			},

			validateField,
			validateForm,

			submit: async (): Promise<Todo | null> => {
				setIsSubmitting(true);

				try {
					// Mark all fields as touched
					const allFields = Object.keys(formData);
					const touchedFields: Record<string, boolean> = {};
					for (const field of allFields) {
						touchedFields[field] = true;
					}
					setTouched(touchedFields);

					// Validate if required
					if (formConfig.validateOnSubmit && !validateForm()) {
						return null;
					}

					// Submit the form
					const result = await createTodoAction(formData as TodoCreateInput);

					// Handle success
					if (formConfig.resetOnSuccess) {
						setFormData({ ...formConfig.defaultValues, ...initialData });
						setErrors({});
						setTouched({});
						setIsDirty(false);
					}

					onSuccess?.(result);
					return result;
				} catch (error) {
					const err = error instanceof Error ? error : new Error("Submission failed");
					onError?.(err);
					return null;
				} finally {
					setIsSubmitting(false);
				}
			},

			reset: () => {
				setFormData({ ...formConfig.defaultValues, ...initialData });
				setErrors({});
				setTouched({});
				setIsDirty(false);
			},
		}),
		[
			formData,
			formConfig,
			initialData,
			setFormData,
			setErrors,
			setTouched,
			setIsDirty,
			setIsSubmitting,
			validateField,
			validateForm,
			createTodoAction,
			onSuccess,
			onError,
		],
	);

	// Form state
	const state: CreateFormState = useMemo(
		() => ({
			data: formData,
			errors,
			touched,
			isDirty,
			isSubmitting: isSubmitting || isCreating,
			isValid: Object.keys(errors).length === 0 && !!formData.title,
		}),
		[formData, errors, touched, isDirty, isSubmitting, isCreating],
	);

	// Field helper function
	const field = useCallback(
		(name: keyof TodoCreateInput): TodoFieldConfig => ({
			name: name as string,
			value: formData[name] || "",
			onChange: (value: any) => actions.setField(name, value),
			onBlur: () => actions.touchField(name),
			error: errors[name],
			required: name === "title",
			isValid: !errors[name],
			touched: touched[name] || false,
		}),
		[formData, errors, touched, actions],
	);

	// Context value
	const contextValue: CreateFormContext = useMemo(
		() => ({
			state,
			actions,
			config: formConfig,
			field,
		}),
		[state, actions, formConfig, field],
	);

	return <CreateFormContext.Provider value={contextValue}>{children}</CreateFormContext.Provider>;
}

// ============================================================================
// UPDATE FORM PROVIDER - Provider for todo update forms
// ============================================================================

/** Props for update form provider */
export interface UpdateFormProviderProps {
	children: ReactNode;
	config?: TodoFormProviderConfig;
	todo: Todo | null;
	onSuccess?: (todo: Todo) => void;
	onError?: (error: Error) => void;
}

/**
 * Provider for Todo update forms with comprehensive state management.
 * Handles form validation, submission, and error states for updates.
 */
export function UpdateFormProvider({
	children,
	config = {},
	todo,
	onSuccess,
	onError,
}: UpdateFormProviderProps): JSX.Element {
	// Merge with default configuration
	const formConfig: TodoFormProviderConfig = useMemo(
		() => ({
			validateOnChange: true,
			validateOnBlur: true,
			validateOnSubmit: true,
			validationDelay: 300,
			resetOnSuccess: false,
			focusOnError: true,
			...config,
		}),
		[config],
	);

	// Form state atoms
	const [formData, setFormData] = useAtom(
		useMemo(
			() =>
				atom<Partial<TodoUpdateInput>>(
					todo
						? {
								title: todo.title,
								description: todo.description,
								status: todo.status,
								priority: todo.priority,
								dueDate: todo.dueDate,
								categoryId: todo.categoryId,
							}
						: {},
				),
			[todo],
		),
	);
	const [errors, setErrors] = useAtom(useMemo(() => atom<Record<string, string>>({}), []));
	const [touched, setTouched] = useAtom(useMemo(() => atom<Record<string, boolean>>({}), []));
	const [isDirty, setIsDirty] = useAtom(useMemo(() => atom(false), []));
	const [isSubmitting, setIsSubmitting] = useAtom(useMemo(() => atom(false), []));

	// Global state
	const updating = useAtomValue(todoUpdatingAtom);
	const isUpdating = todo ? updating[todo.id] || false : false;
	const individualErrors = useAtomValue(todoErrorsAtom);
	const individualError = todo ? individualErrors[todo.id] : null;
	const updateTodoAction = useSetAtom(optimisticUpdateTodoAtom);

	// Validation function
	const validateField = useCallback(
		(field: keyof TodoUpdateInput): boolean => {
			const value = formData[field];
			let error = "";

			switch (field) {
				case "title":
					if (value !== undefined) {
						if (!value || (typeof value === "string" && !value.trim())) {
							error = formConfig.errorMessages?.titleRequired || "Title cannot be empty";
						} else if (typeof value === "string" && value.length > 200) {
							error = formConfig.errorMessages?.titleTooLong || "Title must be less than 200 characters";
						}
					}
					break;

				case "description":
					if (value !== undefined && value && typeof value === "string" && value.length > 1000) {
						error = formConfig.errorMessages?.descriptionTooLong || "Description must be less than 1000 characters";
					}
					break;
			}

			setErrors((prev: Record<string, string>) => {
				if (error) {
					return { ...prev, [field]: error };
				} else {
					const { [field]: _, ...rest } = prev;
					return rest;
				}
			});

			return !error;
		},
		[formData, formConfig.errorMessages, setErrors],
	);

	// Validate entire form
	const validateForm = useCallback((): boolean => {
		const fields: (keyof TodoUpdateInput)[] = ["title", "description"];
		const results = fields.map(validateField);
		return results.every(Boolean);
	}, [validateField]);

	// Form actions
	const actions: UpdateFormActions = useMemo(
		() => ({
			setData: (data: Partial<TodoUpdateInput>) => {
				setFormData((prev) => ({ ...prev, ...data }));
				setIsDirty(true);
			},

			setField: (field: keyof TodoUpdateInput, value: any) => {
				setFormData((prev) => ({ ...prev, [field]: value }));
				setIsDirty(true);

				if (formConfig.validateOnChange) {
					setTimeout(() => validateField(field), formConfig.validationDelay);
				}
			},

			touchField: (field: keyof TodoUpdateInput) => {
				setTouched((prev) => ({ ...prev, [field]: true }));

				if (formConfig.validateOnBlur) {
					validateField(field);
				}
			},

			setFieldError: (field: keyof TodoUpdateInput, error: string) => {
				setErrors((prev) => ({ ...prev, [field]: error }));
			},

			clearFieldError: (field: keyof TodoUpdateInput) => {
				setErrors((prev) => {
					const { [field]: _, ...rest } = prev;
					return rest;
				});
			},

			clearAllErrors: () => {
				setErrors({});
			},

			validateField,
			validateForm,

			submit: async (): Promise<Todo | null> => {
				if (!todo) {
					onError?.(new Error("No todo to update"));
					return null;
				}

				setIsSubmitting(true);

				try {
					// Mark all fields as touched
					const allFields = Object.keys(formData);
					const touchedFields: Record<string, boolean> = {};
					for (const field of allFields) {
						touchedFields[field] = true;
					}
					setTouched(touchedFields);

					// Validate if required
					if (formConfig.validateOnSubmit && !validateForm()) {
						return null;
					}

					// Submit the form
					const result = await updateTodoAction({ id: todo.id, data: formData });

					// Handle success
					if (formConfig.resetOnSuccess) {
						setFormData(
							todo
								? {
										title: todo.title,
										description: todo.description,
										status: todo.status,
										priority: todo.priority,
										dueDate: todo.dueDate,
										categoryId: todo.categoryId,
									}
								: {},
						);
						setErrors({});
						setTouched({});
						setIsDirty(false);
					} else {
						setIsDirty(false);
					}

					onSuccess?.(result);
					return result;
				} catch (error) {
					const err = error instanceof Error ? error : new Error("Update failed");
					onError?.(err);
					return null;
				} finally {
					setIsSubmitting(false);
				}
			},

			reset: () => {
				setFormData(
					todo
						? {
								title: todo.title,
								description: todo.description,
								status: todo.status,
								priority: todo.priority,
								dueDate: todo.dueDate,
								categoryId: todo.categoryId,
							}
						: {},
				);
				setErrors({});
				setTouched({});
				setIsDirty(false);
			},
		}),
		[
			todo,
			formData,
			formConfig,
			setFormData,
			setErrors,
			setTouched,
			setIsDirty,
			setIsSubmitting,
			validateField,
			validateForm,
			updateTodoAction,
			onSuccess,
			onError,
		],
	);

	// Form state
	const state: UpdateFormState = useMemo(
		() => ({
			id: todo?.id || "",
			data: formData,
			originalData: todo,
			errors,
			touched,
			isDirty,
			isSubmitting: isSubmitting || isUpdating,
			isValid: Object.keys(errors).length === 0,
		}),
		[todo, formData, errors, touched, isDirty, isSubmitting, isUpdating],
	);

	// Field helper function
	const field = useCallback(
		(name: keyof TodoUpdateInput): TodoFieldConfig => ({
			name: name as string,
			value: formData[name] || "",
			onChange: (value: any) => actions.setField(name, value),
			onBlur: () => actions.touchField(name),
			error: errors[name],
			required: false, // Updates are always optional
			isValid: !errors[name],
			touched: touched[name] || false,
		}),
		[formData, errors, touched, actions],
	);

	// Context value
	const contextValue: UpdateFormContext = useMemo(
		() => ({
			state,
			actions,
			config: formConfig,
			field,
		}),
		[state, actions, formConfig, field],
	);

	return <UpdateFormContext.Provider value={contextValue}>{children}</UpdateFormContext.Provider>;
}

// ============================================================================
// CONTEXT HOOKS - Hooks to access form contexts
// ============================================================================

/**
 * Hook to access create form context.
 * Must be used within a CreateFormProvider.
 */
export function useCreateFormContext(): CreateFormContext {
	const context = useContext(CreateFormContext);

	if (!context) {
		throw new Error("useCreateFormContext must be used within a CreateFormProvider");
	}

	return context;
}

/**
 * Hook to access update form context.
 * Must be used within an UpdateFormProvider.
 */
export function useUpdateFormContext(): UpdateFormContext {
	const context = useContext(UpdateFormContext);

	if (!context) {
		throw new Error("useUpdateFormContext must be used within an UpdateFormProvider");
	}

	return context;
}
