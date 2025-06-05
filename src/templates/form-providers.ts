import fs from "node:fs/promises";
import path from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { formatGeneratedFileHeader } from "../utils.js";

export async function generateFormProviders(
	modelInfo: ModelInfo,
	context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName, lowerName, pluralName, lowerPluralName } = modelInfo;

	const template = `${formatGeneratedFileHeader()}'use client';

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { 
  useCreate${modelName}Form, 
  useUpdate${modelName}Form,
  type UseCreate${modelName}FormResult,
  type UseUpdate${modelName}FormResult,
} from './hooks';
import type { 
  ${modelName},
  ${modelName}CreateInput,
  ${modelName}UpdateInput,
  ${modelName}FieldConfig
} from './types';

// ============================================================================
// SMART FORM PROVIDER - Handles create/update logic with optimized field access
// ============================================================================

interface ${modelName}FormContextValue {
  // Mode detection
  isCreateMode: boolean;
  isUpdateMode: boolean;
  
  // Form state (unified interface)
  data: Partial<${modelName}CreateInput | ${modelName}UpdateInput>;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  loading: boolean;
  error: Error | null;
  
  // Optimized field accessors (memoized internally)
  fields: {
    [K in keyof ${modelName}CreateInput]: () => ${modelName}FieldConfig;
  };
  
  // Actions
  submit: () => Promise<${modelName} | null>;
  reset: () => void;
  setData: (data: Partial<${modelName}CreateInput | ${modelName}UpdateInput>) => void;
  
  // Auto-save
  enableAutoSave: (debounceMs?: number) => void;
  disableAutoSave: () => void;
  
  // Form-specific data (when in update mode)
  id?: string;
}

const ${modelName}FormContext = createContext<${modelName}FormContextValue | null>(null);

export interface ${modelName}FormProviderProps {
  children: React.ReactNode;
  mode?: 'create' | 'update';
  initialData?: Partial<${modelName}> | ${modelName};
  id?: string;
  autoDetectMode?: boolean; // Default true - detect mode from initialData
}

export function ${modelName}FormProvider({
  children,
  mode,
  initialData,
  id,
  autoDetectMode = true,
}: ${modelName}FormProviderProps) {
  // Smart mode detection
  const detectedMode = useMemo(() => {
    if (mode) return mode;
    if (autoDetectMode && initialData && 'id' in initialData && initialData.id) {
      return 'update';
    }
    return 'create';
  }, [mode, initialData, autoDetectMode]);

  const isCreateMode = detectedMode === 'create';
  const isUpdateMode = detectedMode === 'update';

  // Filter initial data to remove read-only fields
  const filteredInitialData = useMemo(() => {
    if (!initialData) return undefined;
    
    // Remove read-only and relational fields
    const { 
      createdAt, 
      updatedAt, 
      user, 
      category, 
      todos, 
      posts, 
      comments, 
      profile,
      ...cleanData 
    } = initialData as any;
    
    return cleanData;
  }, [initialData]);

  // Get the ID for update operations
  const updateId = useMemo(() => {
    if (id) return id;
    if (initialData && 'id' in initialData) return initialData.id as string;
    return 'temp-id'; // Fallback for hooks
  }, [id, initialData]);

  // Always call both hooks (Rules of Hooks compliance)
  const createForm = useCreate${modelName}Form(
    isCreateMode ? filteredInitialData : undefined
  );
  
  const updateForm = useUpdate${modelName}Form(
    updateId,
    isUpdateMode ? filteredInitialData : undefined
  );

  // Select the active form
  const activeForm = isUpdateMode ? updateForm : createForm;

  // Memoized field accessors to prevent unnecessary re-renders
  const fields = useMemo(() => {
    // Create a proxy that generates field accessors on demand
    return new Proxy({}, {
      get: (target: any, fieldName: string | symbol) => {
        if (typeof fieldName === 'string') {
          return () => activeForm.field(fieldName as keyof ${modelName}CreateInput);
        }
        return undefined;
      }
    }) as { [K in keyof ${modelName}CreateInput]: () => ${modelName}FieldConfig };
  }, [activeForm]);

  // Unified submit that works for both create and update
  const submit = useCallback(async () => {
    return await activeForm.submit();
  }, [activeForm.submit]);

  // Unified reset
  const reset = useCallback(() => {
    activeForm.reset();
  }, [activeForm.reset]);

  // Unified setData with type safety
  const setData = useCallback((newData: Partial<${modelName}CreateInput | ${modelName}UpdateInput>) => {
    activeForm.setData(newData as any);
  }, [activeForm.setData]);

  const contextValue: ${modelName}FormContextValue = {
    isCreateMode,
    isUpdateMode,
    data: activeForm.data,
    isValid: activeForm.isValid,
    isDirty: activeForm.isDirty,
    errors: activeForm.errors,
    loading: activeForm.loading,
    error: activeForm.error,
    fields,
    submit,
    reset,
    setData,
    enableAutoSave: activeForm.enableAutoSave,
    disableAutoSave: activeForm.disableAutoSave,
    id: isUpdateMode ? updateId : undefined,
  };

  return (
    <${modelName}FormContext.Provider value={contextValue}>
      {children}
    </${modelName}FormContext.Provider>
  );
}

// ============================================================================
// HOOK FOR CONSUMING FORM CONTEXT
// ============================================================================

export function use${modelName}FormContext(): ${modelName}FormContextValue {
  const context = useContext(${modelName}FormContext);
  if (!context) {
    throw new Error('use${modelName}FormContext must be used within a ${modelName}FormProvider');
  }
  return context;
}

// ============================================================================
// OPTIMIZED FIELD HOOK - Returns stable field configs
// ============================================================================

export function use${modelName}Field(fieldName: keyof ${modelName}CreateInput): ${modelName}FieldConfig {
  const context = use${modelName}FormContext();
  const { isUpdateMode } = context;
  
  // Get the active form directly from hooks
  const createForm = useCreate${modelName}Form(
    !isUpdateMode ? context.data as Partial<${modelName}CreateInput> : undefined
  );
  const updateForm = useUpdate${modelName}Form(
    context.id || 'temp-id',
    isUpdateMode ? context.data as Partial<${modelName}UpdateInput> : undefined
  );
  
  const activeForm = isUpdateMode ? updateForm : createForm;
  
  // Return the field configuration with internal memoization from hooks
  return useMemo(() => activeForm.field(fieldName), [
    activeForm.data[fieldName],
    activeForm.errors[fieldName as string],
    fieldName
  ]);
}

// ============================================================================
// CONVENIENCE HOOKS FOR COMMON PATTERNS
// ============================================================================

export function use${modelName}FormSubmit() {
  const { submit, loading, isValid } = use${modelName}FormContext();
  
  return {
    submit,
    loading,
    isValid,
    canSubmit: isValid && !loading,
  };
}

export function use${modelName}FormState() {
  const { data, isValid, isDirty, errors, loading, error, isCreateMode, isUpdateMode } = use${modelName}FormContext();
  
  return {
    data,
    isValid,
    isDirty,
    errors,
    loading,
    error,
    isCreateMode,
    isUpdateMode,
  };
}
`;

	const filePath = path.join(modelDir, "form-provider.tsx");
	await fs.writeFile(filePath, template, "utf-8");
}
