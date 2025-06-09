// @ts-nocheck
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
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
   Factory that returns a model-specific hook.
   ----------------------------------------------------------- */
export function makeUseFormHook<Model, CreateInput, UpdateInput>(schemas: FormSchemas<CreateInput, UpdateInput>) {
	return function useModelForm(instance?: Model): UseFormReturn<CreateInput | UpdateInput> {
		// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
		const { schema, defaults } = useMemo(() => {
			if (instance) {
				const { id, createdAt, updatedAt, ...rest } = instance as any;
				return {
					schema: schemas.update,
					defaults: rest as Partial<UpdateInput>,
				};
			}
			return { schema: schemas.create, defaults: {} };
		}, [instance]);

		/* --- init form ------------------------------------------- */
		const form = useForm({
			resolver: zodResolver(schema),
			defaultValues: defaults,
			mode: "onChange",
		});

		/* --- keep in sync on instance changes -------------------- */
		useEffect(() => {
			form.reset(defaults);
		}, [defaults, form]);

		return form;
	};
}
