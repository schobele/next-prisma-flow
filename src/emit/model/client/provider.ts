import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../../config";
import { write } from "../../fs";
import { header, imp, impType } from "../../strings";
import { isScalar, isEnum } from "../../../dmmf";

export async function emitClientProvider({
  modelDir,
  model,
  cfg,
}: {
  modelDir: string;
  model: DMMF.Model;
  cfg: FlowConfig;
}) {
  const content = [];
  content.push(header("client/provider.tsx"));
  content.push(`"use client";`);
  content.push(``);
  
  // Imports
  content.push(imp("react", ["type ReactNode", "useEffect", "useMemo", "useCallback", "useRef"]));
  content.push(`import { useForm } from "react-hook-form";`);
  content.push(`import { zodResolver } from "@hookform/resolvers/zod";`);
  content.push(`import { FlowFormProvider, useFlowFormContext, type FlowFormFeatures, type FlowFormMode } from "../../core/form-provider";`);
  content.push(`import { ${model.name}CreateSchema, ${model.name}UpdateSchema } from "../types/schemas";`);
  content.push(impType(`../types/schemas`, [`Flow${model.name}`, `Flow${model.name}Create`, `Flow${model.name}Update`]));
  content.push(`import { use${model.name}, useCreate${model.name}, useUpdate${model.name} } from "./hooks";`);
  content.push(``);

  // ============================================================================
  // Form Props
  // ============================================================================
  
  content.push(`/**`);
  content.push(` * Props for the ${model.name} form component`);
  content.push(` */`);
  content.push(`export interface Flow${model.name}FormProps {`);
  content.push(`  children: ReactNode;`);
  content.push(`  `);
  content.push(`  /**`);
  content.push(`   * Form mode - determines behavior and data handling`);
  content.push(`   * - "create": New entity creation`);
  content.push(`   * - "update": Edit existing entity (requires id)`);
  content.push(`   * - "view": Read-only display`);
  content.push(`   */`);
  content.push(`  mode: FlowFormMode;`);
  content.push(`  `);
  content.push(`  /**`);
  content.push(`   * Entity ID for update mode`);
  content.push(`   */`);
  content.push(`  id?: string;`);
  content.push(`  `);
  content.push(`  /**`);
  content.push(`   * Default values for form fields`);
  content.push(`   */`);
  content.push(`  defaultValues?: Partial<Flow${model.name}Create | Flow${model.name}Update>;`);
  content.push(`  `);
  content.push(`  /**`);
  content.push(`   * Callback when form is successfully submitted`);
  content.push(`   */`);
  content.push(`  onSuccess?: (data: Flow${model.name}) => void | Promise<void>;`);
  content.push(`  `);
  content.push(`  /**`);
  content.push(`   * Callback when form submission fails`);
  content.push(`   */`);
  content.push(`  onError?: (error: Error) => void;`);
  content.push(`  `);
  content.push(`  /**`);
  content.push(`   * Form features configuration`);
  content.push(`   */`);
  content.push(`  features?: FlowFormFeatures;`);
  content.push(`  `);
  content.push(`  /**`);
  content.push(`   * Additional form element props`);
  content.push(`   */`);
  content.push(`  className?: string;`);
  content.push(`  style?: React.CSSProperties;`);
  content.push(`}`);
  content.push(``);

  // ============================================================================
  // Helper Functions
  // ============================================================================
  
  content.push(`/**`);
  content.push(` * Extract scalar fields from entity (removes relations)`);
  content.push(` */`);
  content.push(`function extractScalarFields(data: any): any {`);
  content.push(`  if (!data) return {};`);
  content.push(`  const result: any = {};`);
  content.push(`  Object.keys(data).forEach((key) => {`);
  content.push(`    const value = data[key];`);
  content.push(`    if (value === null || value === undefined) {`);
  content.push(`      result[key] = value;`);
  content.push(`    } else if (typeof value !== "object" || value instanceof Date) {`);
  content.push(`      result[key] = value;`);
  content.push(`    } else if (!Array.isArray(value) && !value.id) {`);
  content.push(`      // Include simple objects without id (like JSON fields)`);
  content.push(`      result[key] = value;`);
  content.push(`    }`);
  content.push(`  });`);
  content.push(`  return result;`);
  content.push(`}`);
  content.push(``);

  // ============================================================================
  // Main Form Component
  // ============================================================================
  
  content.push(`/**`);
  content.push(` * Type-safe form component for ${model.name}`);
  content.push(` * `);
  content.push(` * @example`);
  content.push(` * \`\`\`tsx`);
  content.push(` * <Flow${model.name}Form mode="create">`);
  content.push(` *   <${model.name}FormField`);
  content.push(` *     name="title"`);
  content.push(` *     render={({ field }) => (`);
  content.push(` *       <FormItem>`);
  content.push(` *         <FormLabel>Title</FormLabel>`);
  content.push(` *         <FormControl>`);
  content.push(` *           <Input {...field} />`);
  content.push(` *         </FormControl>`);
  content.push(` *         <FormMessage />`);
  content.push(` *       </FormItem>`);
  content.push(` *     )}`);
  content.push(` *   />`);
  content.push(` *   <Button type="submit">Submit</Button>`);
  content.push(` * </Flow${model.name}Form>`);
  content.push(` * \`\`\``);
  content.push(` */`);
  content.push(`export function Flow${model.name}Form({`);
  content.push(`  children,`);
  content.push(`  mode,`);
  content.push(`  id,`);
  content.push(`  defaultValues,`);
  content.push(`  onSuccess,`);
  content.push(`  onError,`);
  content.push(`  features,`);
  content.push(`  className,`);
  content.push(`  style`);
  content.push(`}: Flow${model.name}FormProps) {`);
  content.push(`  // Validate props`);
  content.push(`  if (mode === "update" && !id) {`);
  content.push(`    throw new Error(\`Flow${model.name}Form: id is required when mode is "update"\`);`);
  content.push(`  }`);
  content.push(``);

  // Fetch existing data for update mode
  content.push(`  // Fetch existing data for update mode`);
  content.push(`  const { data: existingData, isLoading: isLoadingData } = use${model.name}(id || "", {`);
  content.push(`    enabled: mode === "update" && !!id`);
  content.push(`  });`);
  content.push(``);

  // Initialize form based on mode
  content.push(`  // Initialize form with proper schema based on mode`);
  content.push(`  const form = useForm<Flow${model.name}Create | Flow${model.name}Update>({`);
  content.push(`    resolver: zodResolver(mode === "create" ? ${model.name}CreateSchema : ${model.name}UpdateSchema),`);
  content.push(`    defaultValues: defaultValues as any,`);
  content.push(`    mode: "onChange" // Enable real-time validation`);
  content.push(`  });`);
  content.push(``);

  // Track if form has been reset with existing data
  content.push(`  // Track if we've loaded existing data`);
  content.push(`  const hasLoadedData = useRef(false);`);
  content.push(``);

  // Update form when existing data loads
  content.push(`  // Update form when existing data loads (for update mode)`);
  content.push(`  useEffect(() => {`);
  content.push(`    if (mode === "update" && existingData && !hasLoadedData.current) {`);
  content.push(`      const scalarData = extractScalarFields(existingData);`);
  content.push(`      form.reset(scalarData, {`);
  content.push(`        keepDefaultValues: false`);
  content.push(`      });`);
  content.push(`      hasLoadedData.current = true;`);
  content.push(`    }`);
  content.push(`  }, [mode, existingData, form]);`);
  content.push(``);

  // Setup mutations
  content.push(`  // Setup mutations`);
  content.push(`  const createMutation = useCreate${model.name}({`);
  content.push(`    onSuccess: async (data) => {`);
  content.push(`      form.reset();`);
  content.push(`      hasLoadedData.current = false;`);
  content.push(`      await onSuccess?.(data);`);
  content.push(`    },`);
  content.push(`    onError`);
  content.push(`  });`);
  content.push(``);
  content.push(`  const updateMutation = useUpdate${model.name}(id!, {`);
  content.push(`    onSuccess: async (data) => {`);
  content.push(`      // Reset form with new data to clear dirty state`);
  content.push(`      const scalarData = extractScalarFields(data);`);
  content.push(`      form.reset(scalarData, {`);
  content.push(`        keepDefaultValues: false`);
  content.push(`      });`);
  content.push(`      await onSuccess?.(data);`);
  content.push(`    },`);
  content.push(`    onError`);
  content.push(`  });`);
  content.push(``);

  // Submit handler
  content.push(`  // Form submission handler`);
  content.push(`  const handleSubmit = useCallback(async (data: Flow${model.name}Create | Flow${model.name}Update) => {`);
  content.push(`    try {`);
  content.push(`      if (mode === "create") {`);
  content.push(`        await createMutation.mutateAsync(data as Flow${model.name}Create);`);
  content.push(`      } else if (mode === "update") {`);
  content.push(`        await updateMutation.mutateAsync(data as Flow${model.name}Update);`);
  content.push(`      }`);
  content.push(`    } catch (error) {`);
  content.push(`      // Error is already handled by mutation callbacks`);
  content.push(`      console.error("Form submission error:", error);`);
  content.push(`    }`);
  content.push(`  }, [mode, createMutation, updateMutation]);`);
  content.push(``);

  // Autosave handler for partial updates
  content.push(`  // Autosave handler (for partial field updates)`);
  content.push(`  const handleAutosave = useCallback(async (data: Partial<Flow${model.name}Update>) => {`);
  content.push(`    if (mode === "update" && id) {`);
  content.push(`      try {`);
  content.push(`        await updateMutation.mutateAsync(data as Flow${model.name}Update);`);
  content.push(`      } catch (error) {`);
  content.push(`        console.error("Autosave error:", error);`);
  content.push(`        throw error;`);
  content.push(`      }`);
  content.push(`    }`);
  content.push(`  }, [mode, id, updateMutation]);`);
  content.push(``);

  // Loading state for update mode
  content.push(`  // Show loading state while fetching data in update mode`);
  content.push(`  if (mode === "update" && isLoadingData) {`);
  content.push(`    return (`);
  content.push(`      <div className={className} style={style}>`);
  content.push(`        <div className="flex items-center justify-center p-8">`);
  content.push(`          <span>Loading...</span>`);
  content.push(`        </div>`);
  content.push(`      </div>`);
  content.push(`    );`);
  content.push(`  }`);
  content.push(``);

  // Render form
  content.push(`  return (`);
  content.push(`    <form`);
  content.push(`      className={className}`);
  content.push(`      style={style}`);
  content.push(`      onSubmit={(e) => {`);
  content.push(`        e.preventDefault();`);
  content.push(`        e.stopPropagation();`);
  content.push(`      }}`);
  content.push(`    >`);
  content.push(`      <FlowFormProvider`);
  content.push(`        form={form as any}`);
  content.push(`        mode={mode}`);
  content.push(`        modelName="${model.name}"`);
  content.push(`        features={features}`);
  content.push(`        onSubmit={handleSubmit}`);
  content.push(`        onSave={features?.autosave ? handleAutosave : undefined}`);
  content.push(`      >`);
  content.push(`        {children}`);
  content.push(`      </FlowFormProvider>`);
  content.push(`    </form>`);
  content.push(`  );`);
  content.push(`}`);
  content.push(``);

  // ============================================================================
  // Utility Components
  // ============================================================================
  
  content.push(`/**`);
  content.push(` * Submit button that automatically shows loading state`);
  content.push(` */`);
  content.push(`export function Flow${model.name}FormSubmit({`);
  content.push(`  children = "Submit",`);
  content.push(`  className,`);
  content.push(`  ...props`);
  content.push(`}: React.ButtonHTMLAttributes<HTMLButtonElement>) {`);
  content.push(`  const { submit, isSubmitting } = useFlowFormContext();`);
  content.push(`  `);
  content.push(`  return (`);
  content.push(`    <button`);
  content.push(`      type="button"`);
  content.push(`      onClick={submit}`);
  content.push(`      disabled={isSubmitting}`);
  content.push(`      className={className}`);
  content.push(`      {...props}`);
  content.push(`    >`);
  content.push(`      {isSubmitting ? "Submitting..." : children}`);
  content.push(`    </button>`);
  content.push(`  );`);
  content.push(`}`);
  content.push(``);

  content.push(`/**`);
  content.push(` * Reset button to clear form`);
  content.push(` */`);
  content.push(`export function Flow${model.name}FormReset({`);
  content.push(`  children = "Reset",`);
  content.push(`  className,`);
  content.push(`  ...props`);
  content.push(`}: React.ButtonHTMLAttributes<HTMLButtonElement>) {`);
  content.push(`  const { reset } = useFlowFormContext();`);
  content.push(`  `);
  content.push(`  return (`);
  content.push(`    <button`);
  content.push(`      type="button"`);
  content.push(`      onClick={reset}`);
  content.push(`      className={className}`);
  content.push(`      {...props}`);
  content.push(`    >`);
  content.push(`      {children}`);
  content.push(`    </button>`);
  content.push(`  );`);
  content.push(`}`);
  content.push(``);

  content.push(`/**`);
  content.push(` * Form state indicator`);
  content.push(` */`);
  content.push(`export function Flow${model.name}FormState({`);
  content.push(`  className`);
  content.push(`}: {`);
  content.push(`  className?: string;`);
  content.push(`}) {`);
  content.push(`  const { hasUnsavedChanges, isSaving, autosave } = useFlowFormContext();`);
  content.push(`  `);
  content.push(`  if (!hasUnsavedChanges && !isSaving) {`);
  content.push(`    return null;`);
  content.push(`  }`);
  content.push(`  `);
  content.push(`  return (`);
  content.push(`    <div className={className}>`);
  content.push(`      {isSaving && <span>Saving...</span>}`);
  content.push(`      {!isSaving && hasUnsavedChanges && <span>Unsaved changes</span>}`);
  content.push(`      {autosave?.lastSaved && (`);
  content.push(`        <span>Last saved: {autosave.lastSaved.toLocaleTimeString()}</span>`);
  content.push(`      )}`);
  content.push(`    </div>`);
  content.push(`  );`);
  content.push(`}`);

  const clientDir = join(modelDir, "client");
  await write(join(clientDir, "provider.tsx"), content.join("\n"));
}

// Re-export for backward compatibility
export { emitClientProvider as emitClientFormProvider };