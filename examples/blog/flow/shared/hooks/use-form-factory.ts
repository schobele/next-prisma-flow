// @ts-nocheck
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import type { z } from "zod";

/* -----------------------------------------------------------
   Generic schema bundle the generator passes in.
   ----------------------------------------------------------- */
export interface FormSchemas<CreateInput, UpdateInput> {
	create: z.ZodSchema<CreateInput>;
	update: z.ZodSchema<UpdateInput>;
}

/* -----------------------------------------------------------
   Form submission actions interface
   ----------------------------------------------------------- */
export interface FormActions<Model, CreateInput, UpdateInput> {
	create: (data: CreateInput) => Promise<void> | void;
	update: (args: { id: string; data: UpdateInput }) => Promise<void> | void;
}

/* -----------------------------------------------------------
   Form options and callbacks
   ----------------------------------------------------------- */
export interface UseFormOptions<Model> {
	onSuccess?: (result: Model | null) => void;
	onError?: (error: any) => void;
	resetOnSuccess?: boolean;
	mode?: "onChange" | "onBlur" | "onSubmit" | "onTouched" | "all";
	transform?: {
		toCreateInput?: (data: any) => any;
		toUpdateInput?: (data: any) => any;
		fromModelType?: (model: Model) => any;
	};
}

/* -----------------------------------------------------------
   Enhanced form return interface
   ----------------------------------------------------------- */
export interface UseModelFormReturn<CreateInput, UpdateInput> extends UseFormReturn<CreateInput | UpdateInput> {
	handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
	isSubmitting: boolean;
	isCreating: boolean;
	isUpdating: boolean;
	mode: "create" | "update";
	submitError: any;
}

/* -----------------------------------------------------------
   Default transformation function for common patterns
   ----------------------------------------------------------- */
function defaultModelTypeTransform(instance: any): any {
	if (!instance) return {};

	const { id, createdAt, updatedAt, ...rest } = instance;
	const transformed: any = {};

	// Transform each field
	for (const [key, value] of Object.entries(rest)) {
		if (value && typeof value === 'object' && 'id' in value) {
			// This is a relation object, extract the ID
			transformed[`${key}Id`] = value.id;
		} else if (!Array.isArray(value)) {
			// Regular field (skip arrays like comments)
			transformed[key] = value;
		}
	}

	return transformed;
}

/* -----------------------------------------------------------
   Factory that returns a model-specific hook with integrated actions.
   ----------------------------------------------------------- */
export function makeUseFormHook<Model, CreateInput, UpdateInput>(
	schemas: FormSchemas<CreateInput, UpdateInput>,
	actions: FormActions<Model, CreateInput, UpdateInput>
) {
	return function useModelForm(
		instance?: Model,
		options: UseFormOptions<Model> = {}
	): UseModelFormReturn<CreateInput, UpdateInput> {
		const {
			onSuccess,
			onError,
			resetOnSuccess = true,
			mode = "onChange",
			transform = {},
		} = options;

		const [isSubmitting, setIsSubmitting] = useState(false);
		const [submitError, setSubmitError] = useState<any>(null);

		// Determine form mode and schema
		const isUpdateMode = Boolean(instance);
		const { schema, defaults } = useMemo(() => {
			if (isUpdateMode && instance) {
				// Transform ModelType to UpdateInput format
				const transformedData = transform.fromModelType 
					? transform.fromModelType(instance)
					: defaultModelTypeTransform(instance);

				return {
					schema: schemas.update,
					defaults: transformedData as Partial<UpdateInput>,
				};
			}
			return { schema: schemas.create, defaults: {} };
		}, [instance, isUpdateMode, schemas.create, schemas.update, transform.fromModelType]);

		/* --- Initialize form with proper schema and defaults ---- */
		const form = useForm({
			resolver: zodResolver(schema),
			defaultValues: defaults,
			mode,
		});

		/* --- Keep form in sync with instance changes ------------- */
		useEffect(() => {
			form.reset(defaults);
			setSubmitError(null);
		}, [defaults, form]);

		/* --- Enhanced submit handler with integrated actions ----- */
		const handleSubmit = useCallback(
			async (e?: React.BaseSyntheticEvent) => {
				if (e) {
					e.preventDefault();
					e.stopPropagation();
				}

				return form.handleSubmit(async (data) => {
					setIsSubmitting(true);
					setSubmitError(null);

					try {
						if (isUpdateMode && instance) {
							// Update mode
							const transformedData = transform.toUpdateInput 
								? transform.toUpdateInput(data) 
								: data;
							
							await actions.update({
								id: (instance as any).id,
								data: transformedData as UpdateInput,
							});
						} else {
							// Create mode
							const transformedData = transform.toCreateInput 
								? transform.toCreateInput(data) 
								: data;
							
							await actions.create(transformedData as CreateInput);
						}

						// Handle success
						onSuccess?.(isUpdateMode ? instance : null);
						
						if (resetOnSuccess && !isUpdateMode) {
							form.reset();
						}
					} catch (error) {
						console.error("Form submission error:", error);
						setSubmitError(error);
						onError?.(error);
					} finally {
						setIsSubmitting(false);
					}
				})(e);
			},
			[form, isUpdateMode, instance, actions, transform, onSuccess, onError, resetOnSuccess]
		);

		return {
			...form,
			handleSubmit,
			isSubmitting,
			isCreating: isSubmitting && !isUpdateMode,
			isUpdating: isSubmitting && isUpdateMode,
			mode: isUpdateMode ? "update" : "create",
			submitError,
		};
	};
}

/* -----------------------------------------------------------
   Utility for creating action integration
   ----------------------------------------------------------- */
export function createFormActions<Model, CreateInput, UpdateInput>(
	createAtom: any,
	updateAtom: any
) {
	return {
		create: createAtom,
		update: updateAtom,
	} as FormActions<Model, CreateInput, UpdateInput>;
}