import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../../config";
import { write } from "../../fs";
import { header, imp } from "../../strings";

export async function emitClientField({
  modelDir,
  model,
  cfg,
}: {
  modelDir: string;
  model: DMMF.Model;
  cfg: FlowConfig;
}) {
  const content = [];
  content.push(header("client/field.tsx"));
  content.push(`"use client";`);
  content.push(``);
  
  // Imports
  content.push(imp("react", []));
  content.push(`import { type Path } from "react-hook-form";`);
  content.push(`import { FlowField, type FlowFieldProps, FlowFieldTransforms } from "../../core/field-wrapper";`);
  content.push(`import { useFlowFormContext } from "../../core/form-provider";`);
  content.push(`import type { Flow${model.name}Create, Flow${model.name}Update } from "../types/schemas";`);
  content.push(``);

  // ============================================================================
  // Type Definitions
  // ============================================================================

  content.push(`/**`);
  content.push(` * Valid field names for ${model.name} forms`);
  content.push(` */`);
  content.push(`export type ${model.name}FieldName = `);
  content.push(`  | Path<Flow${model.name}Create>`);
  content.push(`  | Path<Flow${model.name}Update>;`);
  content.push(``);

  content.push(`/**`);
  content.push(` * Props for ${model.name}FormField component`);
  content.push(` */`);
  content.push(`export interface ${model.name}FormFieldProps extends Omit<FlowFieldProps, "name"> {`);
  content.push(`  /**`);
  content.push(`   * The field name - type-safe with autocomplete`);
  content.push(`   */`);
  content.push(`  name: ${model.name}FieldName;`);
  content.push(`}`);
  content.push(``);

  // ============================================================================
  // Main Field Component
  // ============================================================================

  content.push(`/**`);
  content.push(` * Type-safe form field for ${model.name}`);
  content.push(` * Works seamlessly with shadcn/ui form components`);
  content.push(` * `);
  content.push(` * @example`);
  content.push(` * \`\`\`tsx`);
  content.push(` * <${model.name}FormField`);
  content.push(` *   name="title"`);
  content.push(` *   render={({ field }) => (`);
  content.push(` *     <FormItem>`);
  content.push(` *       <FormLabel>Title</FormLabel>`);
  content.push(` *       <FormControl>`);
  content.push(` *         <Input {...field} />`);
  content.push(` *       </FormControl>`);
  content.push(` *       <FormDescription>`);
  content.push(` *         Enter a descriptive title`);
  content.push(` *       </FormDescription>`);
  content.push(` *       <FormMessage />`);
  content.push(` *     </FormItem>`);
  content.push(` *   )}`);
  content.push(` * />`);
  content.push(` * \`\`\``);
  content.push(` */`);
  content.push(`export function ${model.name}FormField({`);
  content.push(`  name,`);
  content.push(`  ...props`);
  content.push(`}: ${model.name}FormFieldProps) {`);
  content.push(`  return (`);
  content.push(`    <FlowField`);
  content.push(`      name={name as any}`);
  content.push(`      {...props}`);
  content.push(`    />`);
  content.push(`  );`);
  content.push(`}`);
  content.push(``);

  // ============================================================================
  // Field-specific Transforms
  // ============================================================================

  content.push(`/**`);
  content.push(` * Common field transforms for ${model.name}`);
  content.push(` * `);
  content.push(` * @example`);
  content.push(` * \`\`\`tsx`);
  content.push(` * <${model.name}FormField`);
  content.push(` *   name="price"`);
  content.push(` *   transform={${model.name}FieldTransforms.number}`);
  content.push(` *   render={({ field }) => <Input type="number" {...field} />}`);
  content.push(` * />`);
  content.push(` * \`\`\``);
  content.push(` */`);
  content.push(`export const ${model.name}FieldTransforms = {`);
  
  // Add model-specific transforms based on field types
  const hasDateFields = model.fields.some(f => f.type === "DateTime");
  const hasNumberFields = model.fields.some(f => ["Int", "Float", "Decimal"].includes(f.type));
  const hasOptionalFields = model.fields.some(f => !f.isRequired);
  
  if (hasDateFields) {
    content.push(`  /**`);
    content.push(`   * Transform for date fields`);
    content.push(`   */`);
    content.push(`  date: FlowFieldTransforms.dateToISO,`);
    content.push(``);
  }
  
  if (hasNumberFields) {
    content.push(`  /**`);
    content.push(`   * Transform for number fields`);
    content.push(`   */`);
    content.push(`  number: FlowFieldTransforms.stringToNumber,`);
    content.push(``);
  }
  
  if (hasOptionalFields) {
    content.push(`  /**`);
    content.push(`   * Transform for optional string fields`);
    content.push(`   */`);
    content.push(`  optional: FlowFieldTransforms.emptyToNull,`);
    content.push(``);
  }
  
  content.push(`  /**`);
  content.push(`   * Trim whitespace from text fields`);
  content.push(`   */`);
  content.push(`  text: FlowFieldTransforms.trim,`);
  content.push(`};`);
  content.push(``);

  // ============================================================================
  // Utility Hooks
  // ============================================================================

  content.push(`/**`);
  content.push(` * Hook to get field value and setter`);
  content.push(` * `);
  content.push(` * @example`);
  content.push(` * \`\`\`tsx`);
  content.push(` * function MyComponent() {`);
  content.push(` *   const [title, setTitle] = use${model.name}FieldValue("title");`);
  content.push(` *   return <input value={title} onChange={e => setTitle(e.target.value)} />;`);
  content.push(` * }`);
  content.push(` * \`\`\``);
  content.push(` */`);
  content.push(`export function use${model.name}FieldValue(name: ${model.name}FieldName) {`);
  content.push(`  const { form } = useFlowFormContext();`);
  content.push(`  const value = form.watch(name as any);`);
  content.push(`  const setValue = (newValue: any) => {`);
  content.push(`    form.setValue(name as any, newValue, {`);
  content.push(`      shouldValidate: true,`);
  content.push(`      shouldDirty: true,`);
  content.push(`      shouldTouch: true`);
  content.push(`    });`);
  content.push(`  };`);
  content.push(`  return [value, setValue] as const;`);
  content.push(`}`);
  content.push(``);

  content.push(`/**`);
  content.push(` * Hook to get field state`);
  content.push(` * `);
  content.push(` * @example`);
  content.push(` * \`\`\`tsx`);
  content.push(` * function MyField() {`);
  content.push(` *   const fieldState = use${model.name}FieldState("title");`);
  content.push(` *   return (`);
  content.push(` *     <div>`);
  content.push(` *       {fieldState.isDirty && <span>Modified</span>}`);
  content.push(` *       {fieldState.error && <span>{fieldState.error.message}</span>}`);
  content.push(` *     </div>`);
  content.push(` *   );`);
  content.push(` * }`);
  content.push(` * \`\`\``);
  content.push(` */`);
  content.push(`export function use${model.name}FieldState(name: ${model.name}FieldName) {`);
  content.push(`  const { form } = useFlowFormContext();`);
  content.push(`  return form.getFieldState(name as any);`);
  content.push(`}`);
  content.push(``);

  content.push(`/**`);
  content.push(` * Hook to get field error`);
  content.push(` * `);
  content.push(` * @example`);
  content.push(` * \`\`\`tsx`);
  content.push(` * function MyField() {`);
  content.push(` *   const error = use${model.name}FieldError("email");`);
  content.push(` *   if (error) {`);
  content.push(` *     return <span className="text-red-500">{error.message}</span>;`);
  content.push(` *   }`);
  content.push(` *   return null;`);
  content.push(` * }`);
  content.push(` * \`\`\``);
  content.push(` */`);
  content.push(`export function use${model.name}FieldError(name: ${model.name}FieldName) {`);
  content.push(`  const { form } = useFlowFormContext();`);
  content.push(`  const fieldState = form.getFieldState(name as any);`);
  content.push(`  return fieldState.error;`);
  content.push(`}`);

  const clientDir = join(modelDir, "client");
  await write(join(clientDir, "field.tsx"), content.join("\n"));
}