import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../config";
import { write } from "../fs";
import { header, imp, impType } from "../strings";

export async function emitForms({
	modelDir,
	model,
	cfg: _cfg,
}: {
	modelDir: string;
	model: DMMF.Model;
	cfg: FlowConfig;
}) {
	const content = [];
	content.push(header("forms.ts"));
	content.push(`"use client";`);
	content.push(``);
  content.push(imp("react", ["useCallback", "useState"]));
  content.push(imp("zod", ["z"]));
  content.push(imp("react-hook-form", ["useForm", "UseFormReturn", "UseFormProps"]));
	content.push(imp("@hookform/resolvers/zod", ["zodResolver"]));
  content.push(imp(`./zod`, [`${model.name}CreateSchema`, `${model.name}UpdateSchema`]));
  content.push(impType(`./zod`, [`Flow${model.name}Write`, `Flow${model.name}Create`, `Flow${model.name}Update`]));
	content.push(
		imp(`./hooks`, [`useCreate${model.name}`, `useUpdate${model.name}`]),
	);
	content.push(``);

	const idField = model.fields.find((f) => f.isId);
	const idType = idField?.type === "String" ? "string" : "number";

  content.push(
    `export function use${model.name}Form(params?: { id?: ${idType}; mode?: "create" | "update"; defaultValues?: Partial<Flow${model.name}Create> | Partial<Flow${model.name}Update>; form?: Omit<UseFormProps<Flow${model.name}Write>, "resolver" | "defaultValues"> }) {`,
  );
  content.push(`  const mode = params?.mode || "create";`);
  content.push(`  const id = params?.id as ${idType} | undefined;`);
  content.push(`  // Use mode-specific schemas for better client-side validation`);
	content.push(``);
  content.push(`  const schema = mode === "create"`);
  content.push(`    ? z.object({ flowWriteMode: z.literal("create"), ...${model.name}CreateSchema.shape })`);
  content.push(`    : z.object({ flowWriteMode: z.literal("update"), ...${model.name}UpdateSchema.shape });`);
  // Build client-side relational requirements: require either FK or relation payload for required relations
  const requiredRelationChecks: string[] = [];
  for (const f of model.fields) {
    if (f.kind === "object" && f.isRequired && f.relationFromFields && f.relationFromFields.length) {
      const fk = f.relationFromFields[0];
      requiredRelationChecks.push(`if (val.${f.name} == null && (val as any).${fk} == null) { ctx.addIssue({ code: 'custom', path: ['${f.name}'], message: '${f.name} is required' }); }`);
    }
  }
  if (requiredRelationChecks.length) {
    content.push(`  const refinedSchema = (mode === "create"`);
    content.push(`    ? schema.superRefine((val, ctx) => {`);
    for (const line of requiredRelationChecks) content.push(`      ${line}`);
    content.push(`    })`);
    content.push(`    : schema);`);
  } else {
    content.push(`  const refinedSchema = schema;`);
  }
  content.push(`  const userFormOpts = params?.form || {};`);
  content.push(`  const mergedDefaults: any = { ...(userFormOpts as any).defaultValues, ...(params?.defaultValues || {}) };`);
  content.push(`  mergedDefaults.flowWriteMode = mode;`);
  content.push(`  const form = useForm<Flow${model.name}Write>({`);
  content.push(`    ...(userFormOpts as any),`);
  content.push(`    resolver: zodResolver(refinedSchema),`);
  content.push(`    defaultValues: mergedDefaults,`);
  content.push(`  });`);
  content.push(`  const [serverError, setServerError] = useState<string | null>(null);`);
	content.push(``);
	content.push(`  const createMutation = useCreate${model.name}();`);
	content.push(
		`  const updateMutation = id ? useUpdate${model.name}(id) : null;`,
	);
	content.push(``);
  content.push(`  const onSubmit = useCallback(async (data: Flow${model.name}Write) => {`);
  content.push(`    try {`);
  content.push(`      setServerError(null);`);
  content.push(`      if (mode === "update" && updateMutation) {`);
  content.push(`        await updateMutation.mutateAsync(data);`);
  content.push(`      } else {`);
  content.push(`        await createMutation.mutateAsync(data);`);
  content.push(`        form.reset({ ...(data as any), flowWriteMode: mode } as any);`);
  content.push(`      }`);
  content.push(`    } catch (error: any) {`);
  content.push(`      console.error("Form submission error:", error);`);
  content.push(`      const msg = typeof error?.error === 'string' ? error.error : (error?.message || 'Request failed');`);
  content.push(`      setServerError(msg);`);
	content.push(`    }`);
  content.push(`  }, [mode, createMutation, updateMutation, form]);`);
	content.push(``);
	content.push(`  return {`);
	content.push(`    form,`);
	content.push(`    onSubmit,`);
	content.push(
		`    isSubmitting: createMutation.isPending || (updateMutation?.isPending ?? false),`,
	);
  content.push(`    mode,`);
  content.push(`    serverError`);
	content.push(`  };`);
	content.push(`}`);
	content.push(``);

	content.push(
		`export type ${model.name}FormReturn = ReturnType<typeof use${model.name}Form>;`,
	);

	await write(join(modelDir, "forms.ts"), content.join("\n"));
}
