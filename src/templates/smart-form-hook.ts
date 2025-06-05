import fs from "node:fs/promises";
import path from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { formatGeneratedFileHeader } from "../utils.js";

export async function generateSmartFormHook(
	modelInfo: ModelInfo,
	context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName, lowerName, pluralName, lowerPluralName } = modelInfo;

	const template = `${formatGeneratedFileHeader()}'use client';

import { useMemo, useCallback } from 'react';
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
// SMART FORM HOOK - Handles create/update mode detection and field memoization
// ============================================================================

export interface Use${modelName}SmartFormOptions {
  mode?: 'create' | 'update';
  initialData?: any; // Flexible to accept various data shapes
  id?: string;
  autoDetectMode?: boolean; // Default true
}

export interface Use${modelName}SmartFormResult {
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
  
  // Optimized field accessor (memoized internally)
  field: (name: keyof ${modelName}CreateInput) => ${modelName}FieldConfig;
  
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

export function use${modelName}SmartForm({
  mode,
  initialData,
  id,
  autoDetectMode = true,
}: Use${modelName}SmartFormOptions = {}): Use${modelName}SmartFormResult {
  
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

  // Optimized field accessor with internal memoization
  const field = useCallback((fieldName: keyof ${modelName}CreateInput): ${modelName}FieldConfig => {
    // The hooks already provide internal memoization
    return activeForm.field(fieldName);
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

  return {
    isCreateMode,
    isUpdateMode,
    data: activeForm.data,
    isValid: activeForm.isValid,
    isDirty: activeForm.isDirty,
    errors: activeForm.errors,
    loading: activeForm.loading,
    error: activeForm.error,
    field,
    submit,
    reset,
    setData,
    enableAutoSave: activeForm.enableAutoSave,
    disableAutoSave: activeForm.disableAutoSave,
    id: isUpdateMode ? updateId : undefined,
  };
}

// ============================================================================
// CONVENIENCE HOOKS FOR COMMON PATTERNS  
// ============================================================================

export function use${modelName}CreateForm(initialData?: any) {
  return use${modelName}SmartForm({ 
    mode: 'create', 
    initialData, 
    autoDetectMode: false 
  });
}

export function use${modelName}UpdateForm(id: string, initialData?: any) {
  return use${modelName}SmartForm({ 
    mode: 'update', 
    id, 
    initialData, 
    autoDetectMode: false 
  });
}
`;

	const filePath = path.join(modelDir, "smart-form.ts");
	await fs.writeFile(filePath, template, "utf-8");
}
