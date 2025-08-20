import { header } from "../strings";

export function emitFieldWrapper() {
  const content = [];
  
  content.push(header("core/field-wrapper.tsx"));
  content.push(`"use client";`);
  content.push(``);
  content.push(`import * as React from "react";`);
  content.push(`import { Controller, useFormContext, type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form";`);
  content.push(``);
  
  // ============================================================================
  // Type Definitions
  // ============================================================================
  
  content.push(`/**`);
  content.push(` * Extended controller props with Flow-specific features`);
  content.push(` */`);
  content.push(`export interface FlowFieldProps<`);
  content.push(`  TFieldValues extends FieldValues = FieldValues,`);
  content.push(`  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>`);
  content.push(`> extends ControllerProps<TFieldValues, TName> {`);
  content.push(`  /**`);
  content.push(`   * Transform value before setting in form`);
  content.push(`   */`);
  content.push(`  transform?: {`);
  content.push(`    input?: (value: any) => any;`);
  content.push(`    output?: (value: any) => any;`);
  content.push(`  };`);
  content.push(`  `);
  content.push(`  /**`);
  content.push(`   * Whether to trigger autosave on this field`);
  content.push(`   */`);
  content.push(`  autosave?: boolean;`);
  content.push(`  `);
  content.push(`  /**`);
  content.push(`   * Debounce delay for this specific field (overrides global setting)`);
  content.push(`   */`);
  content.push(`  debounceMs?: number;`);
  content.push(`}`);
  content.push(``);
  
  // ============================================================================
  // FlowField Component
  // ============================================================================
  
  content.push(`/**`);
  content.push(` * Enhanced field wrapper that extends react-hook-form's Controller`);
  content.push(` * with Flow-specific features while maintaining compatibility with shadcn/ui`);
  content.push(` */`);
  content.push(`export function FlowField<`);
  content.push(`  TFieldValues extends FieldValues = FieldValues,`);
  content.push(`  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>`);
  content.push(`>({`);
  content.push(`  transform,`);
  content.push(`  autosave = true,`);
  content.push(`  debounceMs,`);
  content.push(`  render,`);
  content.push(`  ...props`);
  content.push(`}: FlowFieldProps<TFieldValues, TName>) {`);
  content.push(`  const form = useFormContext<TFieldValues>();`);
  content.push(`  `);
  content.push(`  // Create enhanced render function that applies transforms`);
  content.push(`  const enhancedRender = React.useCallback<NonNullable<typeof render>>(({ field, fieldState, formState }) => {`);
  content.push(`    // Apply input transform to displayed value`);
  content.push(`    const transformedField = {`);
  content.push(`      ...field,`);
  content.push(`      value: transform?.input ? transform.input(field.value) : field.value,`);
  content.push(`      onChange: (value: any) => {`);
  content.push(`        // Apply output transform before setting in form`);
  content.push(`        const transformedValue = transform?.output ? transform.output(value) : value;`);
  content.push(`        field.onChange(transformedValue);`);
  content.push(`      }`);
  content.push(`    };`);
  content.push(`    `);
  content.push(`    // Call original render with transformed field`);
  content.push(`    return render!({ field: transformedField, fieldState, formState });`);
  content.push(`  }, [render, transform]);`);
  content.push(`  `);
  content.push(`  return (`);
  content.push(`    <Controller`);
  content.push(`      {...props}`);
  content.push(`      render={enhancedRender}`);
  content.push(`    />`);
  content.push(`  );`);
  content.push(`}`);
  content.push(``);
  
  // ============================================================================
  // Context for Field Metadata
  // ============================================================================
  
  content.push(`/**`);
  content.push(` * Field metadata that can be provided by model-specific components`);
  content.push(` */`);
  content.push(`export interface FlowFieldMeta {`);
  content.push(`  label?: string;`);
  content.push(`  description?: string;`);
  content.push(`  placeholder?: string;`);
  content.push(`  required?: boolean;`);
  content.push(`  disabled?: boolean;`);
  content.push(`  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "date" | "datetime-local" | "time" | "checkbox" | "radio" | "select" | "textarea";`);
  content.push(`  min?: number | string;`);
  content.push(`  max?: number | string;`);
  content.push(`  step?: number;`);
  content.push(`  pattern?: string;`);
  content.push(`  options?: Array<{ value: string; label: string; disabled?: boolean }>;`);
  content.push(`}`);
  content.push(``);
  
  content.push(`const FlowFieldMetaContext = React.createContext<FlowFieldMeta | null>(null);`);
  content.push(``);
  
  content.push(`/**`);
  content.push(` * Provider for field metadata`);
  content.push(` */`);
  content.push(`export function FlowFieldMetaProvider({`);
  content.push(`  children,`);
  content.push(`  value`);
  content.push(`}: {`);
  content.push(`  children: React.ReactNode;`);
  content.push(`  value: FlowFieldMeta;`);
  content.push(`}) {`);
  content.push(`  return (`);
  content.push(`    <FlowFieldMetaContext.Provider value={value}>`);
  content.push(`      {children}`);
  content.push(`    </FlowFieldMetaContext.Provider>`);
  content.push(`  );`);
  content.push(`}`);
  content.push(``);
  
  content.push(`/**`);
  content.push(` * Hook to access field metadata`);
  content.push(` */`);
  content.push(`export function useFlowFieldMeta() {`);
  content.push(`  return React.useContext(FlowFieldMetaContext);`);
  content.push(`}`);
  content.push(``);
  
  // ============================================================================
  // Utility Hooks
  // ============================================================================
  
  content.push(`/**`);
  content.push(` * Hook to get field state and helpers`);
  content.push(` */`);
  content.push(`export function useFlowField<`);
  content.push(`  TFieldValues extends FieldValues = FieldValues,`);
  content.push(`  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>`);
  content.push(`>(name: TName) {`);
  content.push(`  const form = useFormContext<TFieldValues>();`);
  content.push(`  const meta = useFlowFieldMeta();`);
  content.push(`  `);
  content.push(`  const fieldState = form.getFieldState(name);`);
  content.push(`  const value = form.watch(name);`);
  content.push(`  `);
  content.push(`  return {`);
  content.push(`    // Form methods`);
  content.push(`    setValue: (value: any) => form.setValue(name, value),`);
  content.push(`    getValue: () => form.getValues(name),`);
  content.push(`    reset: () => form.resetField(name),`);
  content.push(`    trigger: () => form.trigger(name),`);
  content.push(`    setError: (error: any) => form.setError(name, error),`);
  content.push(`    clearErrors: () => form.clearErrors(name),`);
  content.push(`    `);
  content.push(`    // Field state`);
  content.push(`    fieldState,`);
  content.push(`    value,`);
  content.push(`    `);
  content.push(`    // Metadata`);
  content.push(`    meta,`);
  content.push(`    `);
  content.push(`    // Computed properties`);
  content.push(`    isDirty: fieldState.isDirty,`);
  content.push(`    isTouched: fieldState.isTouched,`);
  content.push(`    isValid: !fieldState.invalid,`);
  content.push(`    error: fieldState.error`);
  content.push(`  };`);
  content.push(`}`);
  content.push(``);
  
  // ============================================================================
  // Transform Utilities
  // ============================================================================
  
  content.push(`/**`);
  content.push(` * Common transform functions for field values`);
  content.push(` */`);
  content.push(`export const FlowFieldTransforms = {`);
  content.push(`  /**`);
  content.push(`   * Transform empty strings to null`);
  content.push(`   */`);
  content.push(`  emptyToNull: {`);
  content.push(`    output: (value: any) => value === "" ? null : value,`);
  content.push(`    input: (value: any) => value === null ? "" : value`);
  content.push(`  },`);
  content.push(`  `);
  content.push(`  /**`);
  content.push(`   * Transform strings to numbers`);
  content.push(`   */`);
  content.push(`  stringToNumber: {`);
  content.push(`    output: (value: any) => {`);
  content.push(`      const num = Number(value);`);
  content.push(`      return isNaN(num) ? value : num;`);
  content.push(`    },`);
  content.push(`    input: (value: any) => String(value)`);
  content.push(`  },`);
  content.push(`  `);
  content.push(`  /**`);
  content.push(`   * Transform boolean to checkbox value`);
  content.push(`   */`);
  content.push(`  booleanToCheckbox: {`);
  content.push(`    output: (value: any) => Boolean(value),`);
  content.push(`    input: (value: any) => Boolean(value)`);
  content.push(`  },`);
  content.push(`  `);
  content.push(`  /**`);
  content.push(`   * Transform Date to ISO string`);
  content.push(`   */`);
  content.push(`  dateToISO: {`);
  content.push(`    output: (value: any) => {`);
  content.push(`      if (!value) return null;`);
  content.push(`      const date = value instanceof Date ? value : new Date(value);`);
  content.push(`      return date.toISOString();`);
  content.push(`    },`);
  content.push(`    input: (value: any) => {`);
  content.push(`      if (!value) return "";`);
  content.push(`      const date = value instanceof Date ? value : new Date(value);`);
  content.push(`      return date.toISOString().split("T")[0];`);
  content.push(`    }`);
  content.push(`  },`);
  content.push(`  `);
  content.push(`  /**`);
  content.push(`   * Trim whitespace from strings`);
  content.push(`   */`);
  content.push(`  trim: {`);
  content.push(`    output: (value: any) => typeof value === "string" ? value.trim() : value,`);
  content.push(`    input: (value: any) => value`);
  content.push(`  }`);
  content.push(`};`);
  
  return content.join("\n");
}