import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../../config";
import { write } from "../../fs";
import { header, imp, impType } from "../../strings";

export async function emitClientForms({
  modelDir,
  model,
  cfg,
}: {
  modelDir: string;
  model: DMMF.Model;
  cfg: FlowConfig;
}) {
  const idField = model.fields.find((f) => f.isId);
  const idType = idField?.type === "String" ? "string" : "number";

  const content = [];
  content.push(header("client/forms.ts"));
  content.push(`"use client";`);
  content.push(``);
  content.push(imp("react", ["useCallback", "useEffect"]));
  content.push(`import { useForm, type UseFormReturn, type UseFormProps } from "react-hook-form";`);
  content.push(imp("@hookform/resolvers/zod", ["zodResolver"]));
  content.push(imp(`../types/schemas`, [`${model.name}CreateSchema`, `${model.name}UpdateSchema`]));
  content.push(impType(`../types/schemas`, [`Flow${model.name}`, `Flow${model.name}Create`, `Flow${model.name}Update`]));
  content.push(imp(`./hooks`, [`use${model.name}`, `useCreate${model.name}`, `useUpdate${model.name}`]));
  content.push(``);

  // Form options type
  content.push(`export type ${model.name}FormOptions = {`);
  content.push(`  id?: ${idType};`);
  content.push(`  defaultValues?: Partial<Flow${model.name}Create> | Partial<Flow${model.name}Update>;`);
  content.push(`  onSuccess?: (data: Flow${model.name}) => void;`);
  content.push(`  onError?: (error: Error) => void;`);
  content.push(`  formOptions?: Omit<UseFormProps<Flow${model.name}Create | Flow${model.name}Update>, 'resolver' | 'defaultValues'>;`);
  content.push(`};`);
  content.push(``);

  // Main form hook
  content.push(`export function use${model.name}Form(options?: ${model.name}FormOptions) {`);
  content.push(`  const { id, defaultValues, onSuccess, onError, formOptions } = options || {};`);
  content.push(`  `);
  content.push(`  // Smart mode detection`);
  content.push(`  const mode = id ? 'update' : 'create';`);
  content.push(`  `);
  content.push(`  // Fetch existing data if updating`);
  content.push(`  const { data: existingData } = use${model.name}(id || '', {`);
  content.push(`    enabled: !!id`);
  content.push(`  });`);
  content.push(`  `);
  content.push(`  // Choose appropriate schema`);
  content.push(`  const schema = mode === 'create' ? ${model.name}CreateSchema : ${model.name}UpdateSchema;`);
  content.push(`  `);
  content.push(`  // Initialize form with proper defaults`);
  content.push(`  const form = useForm<Flow${model.name}Create | Flow${model.name}Update>({`);
  content.push(`    ...formOptions,`);
  content.push(`    resolver: zodResolver(schema),`);
  content.push(`    defaultValues: {`);
  content.push(`      ...defaultValues,`);
  content.push(`      ...(existingData || {})`);
  content.push(`    } as Flow${model.name}Create | Flow${model.name}Update`);
  content.push(`  });`);
  content.push(`  `);
  content.push(`  // Update form when existing data loads, preserving user changes`);
  content.push(`  useEffect(() => {`);
  content.push(`    if (existingData && mode === 'update') {`);
  content.push(`      // Extract only scalar fields for update forms`);
  content.push(`      const updateData: any = {};`);
  content.push(`      `);
  content.push(`      // Copy scalar fields only, skip relations (arrays and objects)`);
  content.push(`      Object.keys(existingData).forEach(key => {`);
  content.push(`        const value = (existingData as any)[key];`);
  content.push(`        // Include scalar values and nulls, skip arrays and objects (relations)`);
  content.push(`        if (value === null || (typeof value !== 'object' && !Array.isArray(value))) {`);
  content.push(`          updateData[key] = value;`);
  content.push(`        }`);
  content.push(`      });`);
  content.push(`      `);
  content.push(`      console.log('[${model.name}Form] Resetting form with scalar data only:', updateData);`);
  content.push(`      form.reset(updateData as Flow${model.name}Update, {`);
  content.push(`        keepDirtyValues: true,  // Preserve user-modified fields`);
  content.push(`        keepErrors: true         // Keep validation errors for dirty fields`);
  content.push(`      });`);
  content.push(`    }`);
  content.push(`  }, [existingData, mode, form]);`);
  content.push(`  `);
  content.push(`  // Get appropriate mutation`);
  content.push(`  const createMutation = useCreate${model.name}({`);
  content.push(`    onSuccess: (data) => {`);
  content.push(`      form.reset();`);
  content.push(`      onSuccess?.(data);`);
  content.push(`    },`);
  content.push(`    onError`);
  content.push(`  });`);
  content.push(`  `);
  content.push(`  const updateMutation = useUpdate${model.name}(id || '', {`);
  content.push(`    onSuccess: (data) => {`);
  content.push(`      onSuccess?.(data);`);
  content.push(`    },`);
  content.push(`    onError`);
  content.push(`  });`);
  content.push(`  `);
  content.push(`  const mutation = mode === 'update' ? updateMutation : createMutation;`);
  content.push(`  `);
  content.push(`  // Submit handler`);
  content.push(`  const submit = useCallback(`);
  content.push(`    (data: Flow${model.name}Create | Flow${model.name}Update) => {`);
  content.push(`      console.log('[${model.name}Form] Submitting ' + mode + ' form:', data);`);
  content.push(`      if (mode === 'update') {`);
  content.push(`        return updateMutation.mutate(data as Flow${model.name}Update);`);
  content.push(`      } else {`);
  content.push(`        return createMutation.mutate(data as Flow${model.name}Create);`);
  content.push(`      }`);
  content.push(`    },`);
  content.push(`    [createMutation, updateMutation, mode]`);
  content.push(`  );`);
  content.push(`  `);
  content.push(`  // Validation error handler`);
  content.push(`  const onInvalid = useCallback((errors: any) => {`);
  content.push(`    console.error('[${model.name}Form] Validation failed:', errors);`);
  content.push(`  }, []);`);
  content.push(`  `);
  content.push(`  return {`);
  content.push(`    form,`);
  content.push(`    submit: form.handleSubmit(submit, onInvalid),`);
  content.push(`    isSubmitting: mutation.isPending,`);
  content.push(`    error: mutation.error,`);
  content.push(`    isSuccess: mutation.isSuccess,`);
  content.push(`    mode,`);
  content.push(`    reset: () => form.reset()`);
  content.push(`  };`);
  content.push(`}`);
  content.push(``);

  // Quick form hook for simple use cases
  content.push(`export function use${model.name}QuickForm(id?: ${idType}) {`);
  content.push(`  return use${model.name}Form({ id });`);
  content.push(`}`);
  content.push(``);

  // Form component type helper
  content.push(`export type ${model.name}FormProps = {`);
  content.push(`  form: UseFormReturn<Flow${model.name}Create | Flow${model.name}Update>;`);
  content.push(`  onSubmit: () => void;`);
  content.push(`  isSubmitting: boolean;`);
  content.push(`  error?: Error | null;`);
  content.push(`};`);

  const clientDir = join(modelDir, "client");
  await write(join(clientDir, "forms.ts"), content.join("\n"));
}