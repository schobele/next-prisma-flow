import { header } from "../strings";

export function emitFormProvider() {
  const content = [];
  
  content.push(header("core/form-provider.tsx"));
  content.push(`"use client";`);
  content.push(``);
  content.push(`import * as React from "react";`);
  content.push(`import { FormProvider, useFormContext as useRHFContext, useFormState, useWatch } from "react-hook-form";`);
  content.push(`import type { UseFormReturn, Path, PathValue, FieldValues } from "react-hook-form";`);
  content.push(``);
  
  // ============================================================================
  // Types
  // ============================================================================
  
  content.push(`/**`);
  content.push(` * Autosave configuration for forms`);
  content.push(` */`);
  content.push(`export interface FlowFormAutosaveConfig {`);
  content.push(`  enabled: boolean;`);
  content.push(`  debounceMs?: number;`);
  content.push(`  fields?: string[];`);
  content.push(`  onSave?: (data: any) => Promise<void>;`);
  content.push(`  onFieldSave?: (field: string, value: any) => Promise<void>;`);
  content.push(`  onError?: (error: Error) => void;`);
  content.push(`}`);
  content.push(``);
  
  content.push(`/**`);
  content.push(` * Form mode - determines behavior and data handling`);
  content.push(` */`);
  content.push(`export type FlowFormMode = "create" | "update" | "view";`);
  content.push(``);
  
  content.push(`/**`);
  content.push(` * Form features configuration`);
  content.push(` */`);
  content.push(`export interface FlowFormFeatures {`);
  content.push(`  autosave?: FlowFormAutosaveConfig | boolean;`);
  content.push(`  optimisticUpdates?: boolean;`);
  content.push(`  dirtyFieldTracking?: boolean;`);
  content.push(`  fieldValidation?: {`);
  content.push(`    onChange?: boolean;`);
  content.push(`    onBlur?: boolean;`);
  content.push(`    onSubmit?: boolean;`);
  content.push(`    onTouched?: boolean;`);
  content.push(`  };`);
  content.push(`}`);
  content.push(``);
  
  content.push(`/**`);
  content.push(` * Extended form context with Flow-specific features`);
  content.push(` */`);
  content.push(`export interface FlowFormContextValue<TFieldValues extends FieldValues = FieldValues> {`);
  content.push(`  // Core form instance from react-hook-form`);
  content.push(`  form: UseFormReturn<TFieldValues>;`);
  content.push(`  `);
  content.push(`  // Form metadata`);
  content.push(`  mode: FlowFormMode;`);
  content.push(`  modelName: string;`);
  content.push(`  `);
  content.push(`  // State`);
  content.push(`  isSubmitting: boolean;`);
  content.push(`  isSaving: boolean;`);
  content.push(`  hasUnsavedChanges: boolean;`);
  content.push(`  `);
  content.push(`  // Features`);
  content.push(`  features: FlowFormFeatures;`);
  content.push(`  `);
  content.push(`  // Actions`);
  content.push(`  submit: (e?: React.BaseSyntheticEvent) => Promise<void>;`);
  content.push(`  save: () => Promise<void>;`);
  content.push(`  reset: () => void;`);
  content.push(`  setFieldValue: <TFieldName extends Path<TFieldValues>>(`);
  content.push(`    name: TFieldName,`);
  content.push(`    value: PathValue<TFieldValues, TFieldName>,`);
  content.push(`    options?: {`);
  content.push(`      shouldValidate?: boolean;`);
  content.push(`      shouldDirty?: boolean;`);
  content.push(`      shouldTouch?: boolean;`);
  content.push(`    }`);
  content.push(`  ) => void;`);
  content.push(`  `);
  content.push(`  // Autosave`);
  content.push(`  autosave?: {`);
  content.push(`    isPending: boolean;`);
  content.push(`    lastSaved?: Date;`);
  content.push(`    error?: Error;`);
  content.push(`    trigger: () => void;`);
  content.push(`  };`);
  content.push(`}`);  
  content.push(``);
  
  // ============================================================================
  // Context
  // ============================================================================
  
  content.push(`const FlowFormContext = React.createContext<FlowFormContextValue | null>(null);`);
  content.push(``);
  
  content.push(`/**`);
  content.push(` * Hook to access the Flow form context`);
  content.push(` * @throws {Error} If used outside of a FlowFormProvider`);
  content.push(` */`);
  content.push(`export function useFlowFormContext<TFieldValues extends FieldValues = FieldValues>(): FlowFormContextValue<TFieldValues> {`);
  content.push(`  const context = React.useContext(FlowFormContext);`);
  content.push(`  if (!context) {`);
  content.push(`    throw new Error(`);
  content.push(`      "useFlowFormContext must be used within a FlowFormProvider. " +`);
  content.push(`      "Make sure your component is wrapped with a Flow[Model]Form component."`);
  content.push(`    );`);
  content.push(`  }`);
  content.push(`  return context as FlowFormContextValue<TFieldValues>;`);
  content.push(`}`);
  content.push(``);
  
  content.push(`/**`);
  content.push(` * Re-export react-hook-form's useFormContext for convenience`);
  content.push(` */`);
  content.push(`export { useRHFContext as useFormContext };`);
  content.push(``);
  
  // ============================================================================
  // AutosaveWatcher Component
  // ============================================================================
  
  content.push(`/**`);
  content.push(` * Internal component to handle autosave without causing re-renders`);
  content.push(` */`);
  content.push(`function AutosaveWatcher<TFieldValues extends FieldValues = FieldValues>({`);
  content.push(`  enabled,`);
  content.push(`  onSave,`);
  content.push(`  debounceMs = 1000,`);
  content.push(`  onError,`);
  content.push(`  onSuccess,`);
  content.push(`}: {`);
  content.push(`  enabled: boolean;`);
  content.push(`  onSave?: (data: Partial<TFieldValues>) => Promise<void>;`);
  content.push(`  debounceMs?: number;`);
  content.push(`  onError?: (error: Error) => void;`);
  content.push(`  onSuccess?: () => void;`);
  content.push(`}) {`);
  content.push(`  const form = useRHFContext<TFieldValues>();`);
  content.push(`  const { dirtyFields } = useFormState({ control: form.control });`);
  content.push(`  const watchedValues = useWatch({ control: form.control });`);
  content.push(`  const timeoutRef = React.useRef<NodeJS.Timeout>();`);
  content.push(`  `);
  content.push(`  React.useEffect(() => {`);
  content.push(`    if (!enabled || !onSave) return;`);
  content.push(`    `);
  content.push(`    clearTimeout(timeoutRef.current);`);
  content.push(`    timeoutRef.current = setTimeout(async () => {`);
  content.push(`      try {`);
  content.push(`        // Only save dirty fields`);
  content.push(`        const dataToSave: any = {};`);
  content.push(`        Object.keys(dirtyFields).forEach(key => {`);
  content.push(`          if (dirtyFields[key as keyof typeof dirtyFields]) {`);
  content.push(`            dataToSave[key] = watchedValues?.[key as keyof typeof watchedValues] ?? form.getValues(key as Path<TFieldValues>);`);
  content.push(`          }`);
  content.push(`        });`);
  content.push(`        `);
  content.push(`        if (Object.keys(dataToSave).length > 0) {`);
  content.push(`          await onSave(dataToSave as Partial<TFieldValues>);`);
  content.push(`          onSuccess?.();`);
  content.push(`        }`);
  content.push(`      } catch (error) {`);
  content.push(`        onError?.(error as Error);`);
  content.push(`      }`);
  content.push(`    }, debounceMs);`);
  content.push(``);
  content.push(`    return () => {`);
  content.push(`      clearTimeout(timeoutRef.current);`);
  content.push(`    };`);
  content.push(`  }, [watchedValues, dirtyFields, enabled, onSave, debounceMs, form, onError, onSuccess]);`);
  content.push(``);
  content.push(`  return null;`);
  content.push(`}`);
  content.push(``);
  
  // ============================================================================
  // Provider
  // ============================================================================
  
  content.push(`export interface FlowFormProviderProps<TFieldValues extends FieldValues = FieldValues> {`);
  content.push(`  children: React.ReactNode;`);
  content.push(`  form: UseFormReturn<TFieldValues>;`);
  content.push(`  mode: FlowFormMode;`);
  content.push(`  modelName: string;`);
  content.push(`  features?: FlowFormFeatures;`);
  content.push(`  onSubmit: (data: TFieldValues) => Promise<void>;`);
  content.push(`  onSave?: (data: Partial<TFieldValues>) => Promise<void>;`);
  content.push(`}`);
  content.push(``);
  
  content.push(`/**`);
  content.push(` * Flow Form Provider - Wraps react-hook-form with additional features`);
  content.push(` */`);
  content.push(`export function FlowFormProvider<TFieldValues extends FieldValues = FieldValues>({`);
  content.push(`  children,`);
  content.push(`  form,`);
  content.push(`  mode,`);
  content.push(`  modelName,`);
  content.push(`  features = {},`);
  content.push(`  onSubmit,`);
  content.push(`  onSave`);
  content.push(`}: FlowFormProviderProps<TFieldValues>) {`);
  content.push(`  const [isSubmitting, setIsSubmitting] = React.useState(false);`);
  content.push(`  const [isSaving, setIsSaving] = React.useState(false);`);
  content.push(`  const [lastSaved, setLastSaved] = React.useState<Date>();`);
  content.push(`  const [autosaveError, setAutosaveError] = React.useState<Error>();`);
  content.push(`  `);
  content.push(`  // Parse features`);
  content.push(`  const autosaveConfig = React.useMemo(() => {`);
  content.push(`    if (!features.autosave) return null;`);
  content.push(`    if (typeof features.autosave === "boolean") {`);
  content.push(`      return { enabled: true, debounceMs: 1000 };`);
  content.push(`    }`);
  content.push(`    return features.autosave;`);
  content.push(`  }, [features.autosave]);`);
  content.push(`  `);
  content.push(`  // Autosave is now handled by the AutosaveWatcher component`);
  content.push(`  `);
  content.push(`  // Form submission`);
  content.push(`  const handleSubmit = React.useCallback(async (e?: React.BaseSyntheticEvent) => {`);
  content.push(`    e?.preventDefault();`);
  content.push(`    `);
  content.push(`    try {`);
  content.push(`      setIsSubmitting(true);`);
  content.push(`      await form.handleSubmit(async (data) => {`);
  content.push(`        await onSubmit(data);`);
  content.push(`      })(e);`);
  content.push(`    } catch (error) {`);
  content.push(`      console.error("Form submission error:", error);`);
  content.push(`      throw error;`);
  content.push(`    } finally {`);
  content.push(`      setIsSubmitting(false);`);
  content.push(`    }`);
  content.push(`  }, [form, onSubmit]);`);
  content.push(`  `);
  content.push(`  // Manual save`);
  content.push(`  const handleSave = React.useCallback(async () => {`);
  content.push(`    if (!onSave) return;`);
  content.push(`    `);
  content.push(`    try {`);
  content.push(`      setIsSaving(true);`);
  content.push(`      const values = form.getValues();`);
  content.push(`      await onSave(values);`);
  content.push(`      setLastSaved(new Date());`);
  content.push(`    } catch (error) {`);
  content.push(`      console.error("Save error:", error);`);
  content.push(`      throw error;`);
  content.push(`    } finally {`);
  content.push(`      setIsSaving(false);`);
  content.push(`    }`);
  content.push(`  }, [form, onSave]);`);
  content.push(`  `);
  content.push(`  // Reset form`);
  content.push(`  const handleReset = React.useCallback(() => {`);
  content.push(`    form.reset();`);
  content.push(`    setLastSaved(undefined);`);
  content.push(`    setAutosaveError(undefined);`);
  content.push(`  }, [form]);`);
  content.push(`  `);
  content.push(`  // Set field value with proper typing`);
  content.push(`  const setFieldValue = React.useCallback(<TFieldName extends Path<TFieldValues>>(`);
  content.push(`    name: TFieldName,`);
  content.push(`    value: PathValue<TFieldValues, TFieldName>,`);
  content.push(`    options?: {`);
  content.push(`      shouldValidate?: boolean;`);
  content.push(`      shouldDirty?: boolean;`);
  content.push(`      shouldTouch?: boolean;`);
  content.push(`    }`);
  content.push(`  ) => {`);
  content.push(`    form.setValue(name, value, options);`);
  content.push(`  }, [form]);`);
  content.push(`  `);
  content.push(`  // Build context value`);
  content.push(`  const contextValue = React.useMemo<FlowFormContextValue<TFieldValues>>(() => ({`);
  content.push(`    // Core`);
  content.push(`    form,`);
  content.push(`    mode,`);
  content.push(`    modelName,`);
  content.push(`    `);
  content.push(`    // State`);
  content.push(`    isSubmitting,`);
  content.push(`    isSaving,`);
  content.push(`    hasUnsavedChanges: false, // This is now tracked separately to avoid re-renders`);
  content.push(`    `);
  content.push(`    // Features`);
  content.push(`    features,`);
  content.push(`    `);
  content.push(`    // Actions`);
  content.push(`    submit: handleSubmit,`);
  content.push(`    save: handleSave,`);
  content.push(`    reset: handleReset,`);
  content.push(`    setFieldValue,`);
  content.push(`    `);
  content.push(`    // Autosave`);
  content.push(`    ...(autosaveConfig?.enabled ? {`);
  content.push(`      autosave: {`);
  content.push(`        isPending: isSaving,`);
  content.push(`        lastSaved,`);
  content.push(`        error: autosaveError,`);
  content.push(`        trigger: () => {} // Trigger is now handled by AutosaveWatcher`);
  content.push(`      }`);
  content.push(`    } : {})`);
  content.push(`  }), [`);
  content.push(`    form,`);
  content.push(`    mode,`);
  content.push(`    modelName,`);
  content.push(`    isSubmitting,`);
  content.push(`    isSaving,`);
  content.push(`    features,`);
  content.push(`    handleSubmit,`);
  content.push(`    handleSave,`);
  content.push(`    handleReset,`);
  content.push(`    setFieldValue,`);
  content.push(`    autosaveConfig?.enabled,`);
  content.push(`    lastSaved,`);
  content.push(`    autosaveError`);
  content.push(`  ]);`);
  content.push(`  `);
  content.push(`  return (`);
  content.push(`    <FormProvider {...form}>`);
  content.push(`      <FlowFormContext.Provider value={contextValue}>`);
  content.push(`        {children}`);
  content.push(`        {autosaveConfig?.enabled && (`);
  content.push(`          <AutosaveWatcher`);
  content.push(`            enabled={autosaveConfig.enabled}`);
  content.push(`            onSave={onSave}`);
  content.push(`            debounceMs={autosaveConfig.debounceMs}`);
  content.push(`            onError={autosaveConfig.onError}`);
  content.push(`            onSuccess={() => setLastSaved(new Date())}`);
  content.push(`          />`);
  content.push(`        )}`);
  content.push(`      </FlowFormContext.Provider>`);
  content.push(`    </FormProvider>`);
  content.push(`  );`);
  content.push(`}`);
  content.push(``);
  // ============================================================================
  // Utility Hooks
  // ============================================================================
  
  content.push(`/**`);
  content.push(` * Hook to get form submission state with proper subscriptions`);
  content.push(` */`);
  content.push(`export function useFlowFormState() {`);
  content.push(`  const { isSubmitting, isSaving, form } = useFlowFormContext();`);
  content.push(`  const { isDirty, dirtyFields } = useFormState({ control: form.control });`);
  content.push(`  const hasUnsavedChanges = isDirty || Object.keys(dirtyFields).length > 0;`);
  content.push(`  return { isSubmitting, isSaving, hasUnsavedChanges };`);
  content.push(`}`);
  content.push(``);
  
  content.push(`/**`);
  content.push(` * Hook to get autosave state`);
  content.push(` */`);
  content.push(`export function useFlowFormAutosave() {`);
  content.push(`  const { autosave } = useFlowFormContext();`);
  content.push(`  return autosave;`);
  content.push(`}`);
  content.push(``);
  
  content.push(`/**`);
  content.push(` * Hook to get form actions`);
  content.push(` */`);
  content.push(`export function useFlowFormActions() {`);
  content.push(`  const { submit, save, reset, setFieldValue } = useFlowFormContext();`);
  content.push(`  return { submit, save, reset, setFieldValue };`);
  content.push(`}`);
  
  return content.join("\n");
}