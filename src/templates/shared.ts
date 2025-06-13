import { join } from "node:path";
import type { GeneratorContext } from "../types.js";
import { ensureDirectory, writeFile } from "../utils.js";

export async function generateSharedInfrastructure(context: GeneratorContext): Promise<void> {
	// Create shared directory structure
	const sharedDir = join(context.outputDir, "shared");
	const actionsDir = join(sharedDir, "actions");
	const hooksDir = join(sharedDir, "hooks");

	await ensureDirectory(sharedDir);
	await ensureDirectory(actionsDir);
	await ensureDirectory(hooksDir);

	// Copy the shared files from baseline
	const baselineSharedPath = join(process.cwd(), "baseline", "shared");

	// Generate factory.ts for actions
	const factoryContent = `import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";

export type ActionResult<T> =
	| { success: true; data: T }
	| { success: false; error: { message: string; code: string; details?: any } };

export const handleAction = async <T>(operation: () => Promise<T>): Promise<ActionResult<T>> => {
	try {
		const data = await operation();
		return {
			success: true,
			data,
		};
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				success: false,
				error: {
					message: error.message,
					code: "VALIDATION_ERROR",
					details: error.errors,
				},
			};
		} else if (error instanceof PrismaClientKnownRequestError) {
			return {
				success: false,
				error: {
					message: error.message,
					code: error.code,
					details: error.meta,
				},
			};
		}
		return {
			success: false,
			error: { message: "Unknown error", code: "UNKNOWN_ERROR" },
		};
	}
};

// Schema types for validation
export type ModelSchemas = {
	whereUnique: z.ZodSchema<any>;
	where: z.ZodSchema<any>;
	createInput: z.ZodSchema<any>;
	createManyInput: z.ZodSchema<any>;
	updateInput: z.ZodSchema<any>;
	findFirstArgs?: z.ZodSchema<any>;
	findManyArgs?: z.ZodSchema<any>;
};

// Generic CRUD operations factory
export function createModelActions<T, S extends ModelSchemas, Select>(model: any, schemas: S, select: Select) {
	return {
		findUnique: async (filter: z.infer<S["whereUnique"]>): Promise<ActionResult<T | null>> => {
			return handleAction(async () => {
				const parsed = schemas.whereUnique.parse(filter);
				const result = await model.findUniqueOrThrow({
					where: parsed,
					select,
				});
				return result as T | null;
			});
		},

		findMany: async (
			filter: z.infer<S["where"]>,
			options?: S["findManyArgs"] extends z.ZodSchema ? z.infer<S["findManyArgs"]> : any,
		): Promise<ActionResult<T[]>> => {
			return handleAction(async () => {
				const parsed = schemas.where.parse(filter);
				const result = await model.findMany({
					...options,
					where: parsed,
					select,
				});
				return result as T[];
			});
		},

		findFirst: async (
			filter: z.infer<S["where"]>,
			options?: S["findFirstArgs"] extends z.ZodSchema ? z.infer<S["findFirstArgs"]> : any,
		): Promise<ActionResult<T | null>> => {
			return handleAction(async () => {
				const parsed = schemas.where.parse(filter);
				const result = await model.findFirst({
					...options,
					where: parsed,
					select,
				});
				return result as T | null;
			});
		},

		create: async (data: z.infer<S["createInput"]>): Promise<ActionResult<T>> => {
			return handleAction(async () => {
				const parsed = schemas.createInput.parse(data);
				const result = await model.create({
					data: parsed,
					select,
				});
				return result as T;
			});
		},

		createMany: async (data: z.infer<S["createManyInput"]>[]): Promise<ActionResult<{ count: number }>> => {
			return handleAction(async () => {
				const parsed = data.map((item) => schemas.createManyInput.parse(item));
				const result = await model.createMany({
					data: parsed,
				});
				return result;
			});
		},

		update: async (where: z.infer<S["whereUnique"]>, data: z.infer<S["updateInput"]>): Promise<ActionResult<T>> => {
			return handleAction(async () => {
				const parsedWhere = schemas.whereUnique.parse(where);
				const parsedData = schemas.updateInput.parse(data);
				const result = await model.update({
					where: parsedWhere,
					data: parsedData,
					select,
				});
				return result as T;
			});
		},

		updateMany: async (
			where: z.infer<S["where"]>,
			data: z.infer<S["updateInput"]>,
		): Promise<ActionResult<{ count: number }>> => {
			return handleAction(async () => {
				const parsedWhere = schemas.where.parse(where);
				const parsedData = schemas.updateInput.parse(data);
				const result = await model.updateMany({
					where: parsedWhere,
					data: parsedData,
				});
				return result;
			});
		},

		upsert: async (
			where: z.infer<S["whereUnique"]>,
			create: z.infer<S["createInput"]>,
			update: z.infer<S["updateInput"]>,
		): Promise<ActionResult<T>> => {
			return handleAction(async () => {
				const parsedWhere = schemas.whereUnique.parse(where);
				const parsedCreate = schemas.createInput.parse(create);
				const parsedUpdate = schemas.updateInput.parse(update);
				const result = await model.upsert({
					where: parsedWhere,
					create: parsedCreate,
					update: parsedUpdate,
					select,
				});
				return result as T;
			});
		},

		remove: async (where: z.infer<S["whereUnique"]>): Promise<ActionResult<T>> => {
			return handleAction(async () => {
				const parsed = schemas.whereUnique.parse(where);
				const result = await model.delete({
					where: parsed,
					select,
				});
				return result as T;
			});
		},

		removeMany: async (where: z.infer<S["where"]>): Promise<ActionResult<{ count: number }>> => {
			return handleAction(async () => {
				const parsed = schemas.where.parse(where);
				const result = await model.deleteMany({
					where: parsed,
				});
				return result;
			});
		},

		count: async (where?: z.infer<S["where"]>): Promise<ActionResult<number>> => {
			return handleAction(async () => {
				const parsed = where ? schemas.where.parse(where) : undefined;
				const result = await model.count({
					where: parsed,
				});
				return result;
			});
		},
	};
}
`;

	await writeFile(join(actionsDir, "factory.ts"), factoryContent);

	// Generate unwrap.ts for actions
	const unwrapContent = `import type { ActionResult } from "./factory";

export function unwrap<T>(result: ActionResult<T>): T {
	if (result.success) {
		return result.data;
	}
	
	const error = new Error(result.error.message);
	(error as any).code = result.error.code;
	(error as any).details = result.error.details;
	
	throw error;
}
`;

	await writeFile(join(actionsDir, "unwrap.ts"), unwrapContent);

	// Generate relation-helper.ts
	const relationHelperContent = `/**
 * Build a typed relation-helper object
 */
export function makeRelationHelpers<R extends Record<string, { where: any; many: boolean }>>(
	id: string,
	update: (arg: { id: string; data: any }) => Promise<unknown>,
) {
	type Helpers = {
		[K in keyof R]: R[K] extends { where: infer Where; many: infer M }
			? M extends true
				? {
						connect: (where: Where | Where[]) => Promise<void>;
						disconnect: (where: Where | Where[]) => Promise<void>;
						set: (where: Where[]) => Promise<void>;
						clear: () => Promise<void>;
					}
				: {
						connect: (where: Where) => Promise<void>;
						disconnect: () => Promise<void>;
					}
			: never;
	};

	const factory = {} as Helpers;

	for (const key of Object.keys({}) as (keyof R)[]) {
		const relation = key as string;

		(factory as any)[relation] = {
			connect: (where: any) => update({ id, data: { [relation]: { connect: where } } }),
			disconnect: (arg?: any) => {
				const disconnectPayload = Array.isArray(arg) || arg ? { disconnect: arg } : { disconnect: true };
				return update({ id, data: { [relation]: disconnectPayload } });
			},
			set: (whereArr: any[]) => update({ id, data: { [relation]: { set: whereArr } } }),
			clear: () => update({ id, data: { [relation]: { set: [] } } }),
		};
	}

	return factory as Helpers;
}
`;

	await writeFile(join(hooksDir, "relation-helper.ts"), relationHelperContent);

	// Generate use-form-factory.ts
	const useFormFactoryContent = `// @ts-nocheck
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
			transformed[\`\${key}Id\`] = value.id;
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
}`;

	await writeFile(join(hooksDir, "use-form-factory.ts"), useFormFactoryContent);

	// Generate useAutoload.ts hook
	const useAutoloadContent = `import { useEffect, useRef, startTransition } from "react";
import type { StartTransitionOptions } from "react";

/**
 * Fire \`action()\` exactly once per component when \`shouldLoad()\` is true.
 * 
 * This hook provides automatic data loading with the following guarantees:
 * - Only fires once per component instance lifecycle
 * - Respects concurrent mode with startTransition for smoother UX
 * - Prevents loading loops and duplicate requests
 * 
 * @param shouldLoad - Function that returns true when loading should occur
 * @param action - Action to execute (can be sync/async)
 * @param options - Optional startTransition options for concurrent mode
 */
export function useAutoload(
	shouldLoad: () => boolean,
	action: () => void | Promise<unknown>,
	options?: StartTransitionOptions,
) {
	const fired = useRef(false);

	useEffect(() => {
		if (!fired.current && shouldLoad()) {
			fired.current = true;
			// Keep UI responsive; polyfills to direct call in non-concurrent envs
			startTransition(() => {
				action();
			}, options);
		}
	}, [shouldLoad, action, options]);
}`;

	await writeFile(join(hooksDir, "useAutoload.ts"), useAutoloadContent);
}
