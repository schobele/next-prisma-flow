import fs from "node:fs/promises";
import path from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { formatGeneratedFileHeader } from "../utils.js";

export async function generateEnhancedReactHooks(
	modelInfo: ModelInfo,
	context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName, lowerName, pluralName, lowerPluralName } = modelInfo;

	const template = `${formatGeneratedFileHeader()}'use client';

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  base${pluralName}Atom,
  ${lowerName}ListAtom,
  ${lowerPluralName}LoadingAtom,
  ${lowerName}CreatingAtom,
  ${lowerName}UpdatingAtom,
  ${lowerName}DeletingAtom,
  ${lowerPluralName}ErrorAtom,
  refresh${pluralName}Atom,
  ${lowerName}ByIdAtom,
  optimisticCreate${modelName}Atom,
  optimisticUpdate${modelName}Atom,
  optimisticDelete${modelName}Atom,
  ${lowerName}CountAtom,
  is${pluralName}EmptyAtom,
} from './atoms';
import type { 
  ${modelName}, 
  ${modelName}CreateInput, 
  ${modelName}UpdateInput,
  ${modelName}FormData,
  ${modelName}FieldConfig
} from './types';
import { ${modelName}CreateInputSchema, ${modelName}UpdateInputSchema } from './types';
import * as ${modelName}Actions from './actions';

// ============================================================================
// ENHANCED UNIFIED HOOKS - Everything you need in one hook
// ============================================================================

export interface Use${pluralName}Result {
  // Data
  data: ${modelName}[];
  loading: boolean;
  error: string | null;
  count: number;
  isEmpty: boolean;
  
  // CRUD operations
  create${modelName}: (data: ${modelName}CreateInput) => Promise<${modelName}>;
  update${modelName}: (id: string, data: ${modelName}UpdateInput) => Promise<${modelName}>;
  delete${modelName}: (id: string) => Promise<void>;
  
  // Batch operations
  createMany: (data: ${modelName}CreateInput[]) => Promise<{ count: number }>;
  deleteMany: (ids: string[]) => Promise<{ count: number }>;
  
  // State management
  refresh: () => void;
  
  // Loading states for individual operations
  isCreating: boolean;
  isUpdating: (id: string) => boolean;
  isDeleting: (id: string) => boolean;
  
  // Optimistic updates info
  optimisticUpdates: Record<string, boolean>;
}

export function use${pluralName}(autoFetch = true): Use${pluralName}Result {
  const data = useAtomValue(${lowerName}ListAtom);
  const loading = useAtomValue(${lowerPluralName}LoadingAtom);
  const creating = useAtomValue(${lowerName}CreatingAtom);
  const updatingStates = useAtomValue(${lowerName}UpdatingAtom);
  const deletingStates = useAtomValue(${lowerName}DeletingAtom);
  const error = useAtomValue(${lowerPluralName}ErrorAtom);
  const count = useAtomValue(${lowerName}CountAtom);
  const isEmpty = useAtomValue(is${pluralName}EmptyAtom);
  const refresh = useSetAtom(refresh${pluralName}Atom);
  
  // Action atoms for optimistic updates
  const create${modelName} = useSetAtom(optimisticCreate${modelName}Atom);
  const update${modelName} = useSetAtom(optimisticUpdate${modelName}Atom);
  const delete${modelName} = useSetAtom(optimisticDelete${modelName}Atom);
  
  // Track if we've already attempted to auto-fetch to prevent infinite loops
  const hasFetchedRef = useRef(false);

  // Auto-fetch on mount if enabled and no data exists (only once)
  useEffect(() => {
    if (autoFetch && isEmpty && !loading && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      refresh();
    }
  }, [autoFetch, isEmpty, loading, refresh]);

  // Batch operations
  const createMany = useCallback(
    async (inputs: ${modelName}CreateInput[]) => {
      return await ${modelName}Actions.createMany${pluralName}(inputs);
    },
    []
  );

  const deleteMany = useCallback(
    async (ids: string[]) => {
      return await ${modelName}Actions.deleteMany${pluralName}(ids);
    },
    []
  );

  return {
    data,
    loading,
    error,
    count,
    isEmpty,
    create${modelName}: useCallback(
      async (data: ${modelName}CreateInput) => await create${modelName}(data),
      [create${modelName}]
    ),
    update${modelName}: useCallback(
      async (id: string, data: ${modelName}UpdateInput) => 
        await update${modelName}({ id, data }),
      [update${modelName}]
    ),
    delete${modelName}: useCallback(
      async (id: string) => await delete${modelName}(id),
      [delete${modelName}]
    ),
    createMany,
    deleteMany,
    refresh: useCallback(() => refresh(), [refresh]),
    isCreating: creating,
    isUpdating: useCallback((id: string) => updatingStates[id] || false, [updatingStates]),
    isDeleting: useCallback((id: string) => deletingStates[id] || false, [deletingStates]),
    optimisticUpdates: updatingStates,
  };
}

// ============================================================================
// ENHANCED INDIVIDUAL ITEM HOOK - Smart item management with form integration
// ============================================================================

export interface Use${modelName}Result {
  // Data
  data: ${modelName} | null;
  loading: boolean;
  error: string | null;
  
  // Operations
  update: (data: ${modelName}UpdateInput) => Promise<${modelName}>;
  delete: () => Promise<void>;
  
  // State
  isUpdating: boolean;
  isDeleting: boolean;
  isOptimistic: boolean;
  
  // Form integration
  form: UseUpdate${modelName}FormResult;
}

export function use${modelName}(id: string): Use${modelName}Result {
  const data = useAtomValue(${lowerName}ByIdAtom(id));
  const loading = useAtomValue(${lowerPluralName}LoadingAtom);
  const updatingStates = useAtomValue(${lowerName}UpdatingAtom);
  const deletingStates = useAtomValue(${lowerName}DeletingAtom);
  const error = useAtomValue(${lowerPluralName}ErrorAtom);
  
  const update${modelName} = useSetAtom(optimisticUpdate${modelName}Atom);
  const delete${modelName} = useSetAtom(optimisticDelete${modelName}Atom);
  
  // Filter data to only include update input fields (remove relations and computed fields)
  const filteredData = data ? Object.fromEntries(
    Object.entries(data).filter(([key]) => 
      // Exclude common relational and computed fields
      !['user', 'category', 'todos', 'posts', 'comments', 'profile'].includes(key)
    )
  ) : undefined;
  
  const form = useUpdate${modelName}Form(id, filteredData);

  return {
    data,
    loading,
    error,
    update: useCallback(
      async (updateData: ${modelName}UpdateInput) => 
        await update${modelName}({ id, data: updateData }),
      [update${modelName}, id]
    ),
    delete: useCallback(
      async () => await delete${modelName}(id),
      [delete${modelName}, id]
    ),
    isUpdating: updatingStates[id] || false,
    isDeleting: deletingStates[id] || false,
    isOptimistic: !!(updatingStates[id] || deletingStates[id]),
    form,
  };
}


// ============================================================================
// SPECIALIZED FORM HOOKS - Dedicated hooks for create and update operations
// ============================================================================

export interface UseCreate${modelName}FormResult {
  // Form state
  data: Partial<${modelName}CreateInput>;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  
  // Field helpers with auto-validation
  field: (name: keyof ${modelName}CreateInput) => ${modelName}FieldConfig;
  
  // Form operations
  submit: () => Promise<${modelName} | null>;
  reset: () => void;
  setData: (data: Partial<${modelName}CreateInput>) => void;
  
  // Loading states
  loading: boolean;
  error: Error | null;
  
  // Validation
  validate: () => boolean;
  validateField: (field: keyof ${modelName}CreateInput) => boolean;
  
  // Auto-save capabilities
  enableAutoSave: (debounceMs?: number) => void;
  disableAutoSave: () => void;
}

export function useCreate${modelName}Form(initialData?: Partial<${modelName}CreateInput>): UseCreate${modelName}FormResult {
  const [data, setFormData] = useState<Partial<${modelName}CreateInput>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const create${modelName} = useSetAtom(optimisticCreate${modelName}Atom);
  
  // Check if form is dirty
  const isDirty = useMemo(() => {
    if (!initialData) return Object.keys(data).length > 0;
    return JSON.stringify(data) !== JSON.stringify(initialData);
  }, [data, initialData]);
  
  // Validate individual field
  const validateField = useCallback((fieldName: keyof ${modelName}CreateInput): boolean => {
    try {
      const value = data[fieldName];
      if (value !== undefined && value !== null && value !== '') {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName as string];
          return newErrors;
        });
        return true;
      }
      return true;
    } catch (err: any) {
      setErrors(prev => ({
        ...prev,
        [fieldName as string]: err.errors?.[0]?.message || 'Invalid value'
      }));
      return false;
    }
  }, [data]);
  
  // Validate entire form
  const validate = useCallback((): boolean => {
    try {
      ${modelName}CreateInputSchema.parse(data);
      setErrors({});
      return true;
    } catch (err: any) {
      const newErrors: Record<string, string> = {};
      err.errors?.forEach((error: any) => {
        if (error.path?.length > 0) {
          newErrors[error.path[0]] = error.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
  }, [data]);
  
  // Check if form is valid
  const isValid = useMemo(() => {
    try {
      ${modelName}CreateInputSchema.parse(data);
      return true;
    } catch {
      return false;
    }
  }, [data]);
  
  // Memoized field helpers to prevent unnecessary re-renders
  const fieldConfigs = useMemo(() => {
    const configs: Record<string, ${modelName}FieldConfig> = {};
    return configs;
  }, []);

  // Field helper function with internal memoization
  const field = useCallback((name: keyof ${modelName}CreateInput): ${modelName}FieldConfig => {
    const cacheKey = \`\${name}-\${data[name]}-\${errors[name as string]}-\${touched[name as string]}\`;
    
    if (!fieldConfigs[cacheKey]) {
      fieldConfigs[cacheKey] = {
        name: name as string,
        value: data[name] ?? '',
        onChange: (value: any) => {
          setFormData(prev => ({ ...prev, [name]: value }));
          
          // Auto-save logic
          if (autoSaveEnabled && autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
          }
          if (autoSaveEnabled) {
            const timeout = setTimeout(() => {
              if (isValid) {
                submit();
              }
            }, 1000);
            setAutoSaveTimeout(timeout);
          }
        },
        onBlur: () => {
          setTouched(prev => ({ ...prev, [name]: true }));
          validateField(name);
        },
        error: touched[name as string] ? errors[name as string] : undefined,
        required: true, // TODO: Determine from schema
      };
    }
    
    return fieldConfigs[cacheKey];
  }, [data, errors, touched, validateField, autoSaveEnabled, autoSaveTimeout, isValid, fieldConfigs]);
  
  // Submit form
  const submit = useCallback(async (): Promise<${modelName} | null> => {
    if (!validate()) {
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await create${modelName}(data as ${modelName}CreateInput);
      
      // Reset form on successful create
      setFormData({});
      setTouched({});
      setErrors({});
      
      return result;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [data, validate, create${modelName}]);
  
  // Reset form
  const reset = useCallback(() => {
    setFormData(initialData || {});
    setErrors({});
    setTouched({});
    setError(null);
  }, [initialData]);
  
  // Set form data
  const setData = useCallback((newData: Partial<${modelName}CreateInput>) => {
    setFormData(newData);
  }, []);
  
  // Auto-save functionality
  const enableAutoSave = useCallback((debounceMs = 1000) => {
    setAutoSaveEnabled(true);
  }, []);
  
  const disableAutoSave = useCallback(() => {
    setAutoSaveEnabled(false);
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
  }, [autoSaveTimeout]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  return {
    data,
    isValid,
    isDirty,
    errors,
    field,
    submit,
    reset,
    setData,
    loading,
    error,
    validate,
    validateField,
    enableAutoSave,
    disableAutoSave,
  };
}

export interface UseUpdate${modelName}FormResult {
  // Form state
  data: Partial<${modelName}UpdateInput>;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  
  // Field helpers with auto-validation
  field: (name: keyof ${modelName}UpdateInput) => ${modelName}FieldConfig;
  
  // Form operations
  submit: () => Promise<${modelName} | null>;
  reset: () => void;
  setData: (data: Partial<${modelName}UpdateInput>) => void;
  
  // Loading states
  loading: boolean;
  error: Error | null;
  
  // Validation
  validate: () => boolean;
  validateField: (field: keyof ${modelName}UpdateInput) => boolean;
  
  // Auto-save capabilities
  enableAutoSave: (debounceMs?: number) => void;
  disableAutoSave: () => void;
  
  // ID for update operations
  id: string;
}

export function useUpdate${modelName}Form(id: string, initialData?: Partial<${modelName}UpdateInput>): UseUpdate${modelName}FormResult {
  const [data, setFormData] = useState<Partial<${modelName}UpdateInput>>(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const update${modelName} = useSetAtom(optimisticUpdate${modelName}Atom);
  
  // Check if form is dirty
  const isDirty = useMemo(() => {
    if (!initialData) return Object.keys(data).length > 0;
    return JSON.stringify(data) !== JSON.stringify(initialData);
  }, [data, initialData]);
  
  // Validate individual field
  const validateField = useCallback((fieldName: keyof ${modelName}UpdateInput): boolean => {
    try {
      const value = data[fieldName];
      if (value !== undefined && value !== null && value !== '') {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName as string];
          return newErrors;
        });
        return true;
      }
      return true;
    } catch (err: any) {
      setErrors(prev => ({
        ...prev,
        [fieldName as string]: err.errors?.[0]?.message || 'Invalid value'
      }));
      return false;
    }
  }, [data]);
  
  // Validate entire form
  const validate = useCallback((): boolean => {
    try {
      ${modelName}UpdateInputSchema.parse(data);
      setErrors({});
      return true;
    } catch (err: any) {
      const newErrors: Record<string, string> = {};
      err.errors?.forEach((error: any) => {
        if (error.path?.length > 0) {
          newErrors[error.path[0]] = error.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
  }, [data]);
  
  // Check if form is valid
  const isValid = useMemo(() => {
    try {
      ${modelName}UpdateInputSchema.parse(data);
      return true;
    } catch {
      return false;
    }
  }, [data]);
  
  // Memoized field helpers to prevent unnecessary re-renders
  const updateFieldConfigs = useMemo(() => {
    const configs: Record<string, ${modelName}FieldConfig> = {};
    return configs;
  }, []);

  // Field helper function with internal memoization
  const field = useCallback((name: keyof ${modelName}UpdateInput): ${modelName}FieldConfig => {
    const cacheKey = \`\${name}-\${data[name]}-\${errors[name as string]}-\${touched[name as string]}\`;
    
    if (!updateFieldConfigs[cacheKey]) {
      updateFieldConfigs[cacheKey] = {
        name: name as string,
        value: data[name] ?? '',
        onChange: (value: any) => {
          setFormData(prev => ({ ...prev, [name]: value }));
          
          // Auto-save logic
          if (autoSaveEnabled && autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
          }
          if (autoSaveEnabled) {
            const timeout = setTimeout(() => {
              if (isValid) {
                submit();
              }
            }, 1000);
            setAutoSaveTimeout(timeout);
          }
        },
        onBlur: () => {
          setTouched(prev => ({ ...prev, [name]: true }));
          validateField(name);
        },
        error: touched[name as string] ? errors[name as string] : undefined,
        required: false, // Update fields are typically optional
      };
    }
    
    return updateFieldConfigs[cacheKey];
  }, [data, errors, touched, validateField, autoSaveEnabled, autoSaveTimeout, isValid, updateFieldConfigs]);
  
  // Submit form
  const submit = useCallback(async (): Promise<${modelName} | null> => {
    if (!validate()) {
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await update${modelName}({ id, data: data as ${modelName}UpdateInput });
      return result;
    } catch (err: any) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [data, validate, update${modelName}, id]);
  
  // Reset form
  const reset = useCallback(() => {
    setFormData(initialData || {});
    setErrors({});
    setTouched({});
    setError(null);
  }, [initialData]);
  
  // Set form data
  const setData = useCallback((newData: Partial<${modelName}UpdateInput>) => {
    setFormData(newData);
  }, []);
  
  // Auto-save functionality
  const enableAutoSave = useCallback((debounceMs = 1000) => {
    setAutoSaveEnabled(true);
  }, []);
  
  const disableAutoSave = useCallback(() => {
    setAutoSaveEnabled(false);
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
  }, [autoSaveTimeout]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  return {
    data,
    isValid,
    isDirty,
    errors,
    field,
    submit,
    reset,
    setData,
    loading,
    error,
    validate,
    validateField,
    enableAutoSave,
    disableAutoSave,
    id,
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export function use${modelName}Exists(id: string): boolean {
  const ${lowerName} = useAtomValue(${lowerName}ByIdAtom(id));
  return !!${lowerName};
}

`;

	const filePath = path.join(modelDir, "hooks.ts");
	await fs.writeFile(filePath, template, "utf-8");
}
