import fs from "node:fs/promises";
import path from "node:path";
import type { ModelInfo, GeneratorContext } from "../types.js";
import { formatGeneratedFileHeader } from "../utils.js";

export async function generateReactHooks(
	modelInfo: ModelInfo,
	context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName, lowerName, pluralName, lowerPluralName } = modelInfo;

	const template = `${formatGeneratedFileHeader()}'use client';

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
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
import type { ${modelName} } from './types';
import * as ${modelName}Actions from './actions';

export interface Use${pluralName}Result {
  ${lowerPluralName}: ${modelName}[];
  loading: boolean;
  creating: boolean;
  error: string | null;
  count: number;
  isEmpty: boolean;
  refresh: () => void;
}

export function use${pluralName}(autoFetch = true): Use${pluralName}Result {
  const ${lowerPluralName} = useAtomValue(${lowerName}ListAtom);
  const loading = useAtomValue(${lowerPluralName}LoadingAtom);
  const creating = useAtomValue(${lowerName}CreatingAtom);
  const error = useAtomValue(${lowerPluralName}ErrorAtom);
  const count = useAtomValue(${lowerName}CountAtom);
  const isEmpty = useAtomValue(is${pluralName}EmptyAtom);
  const refresh = useSetAtom(refresh${pluralName}Atom);
  
  // Track if we've already attempted to auto-fetch to prevent infinite loops
  const hasFetchedRef = useRef(false);

  // Auto-fetch on mount if enabled and no data exists (only once)
  useEffect(() => {
    if (autoFetch && isEmpty && !loading && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      refresh();
    }
  }, [autoFetch, isEmpty, loading, refresh]);

  return {
    ${lowerPluralName},
    loading,
    creating,
    error,
    count,
    isEmpty,
    refresh: useCallback(() => refresh(), [refresh]),
  };
}

export interface Use${modelName}Result {
  ${lowerName}: ${modelName} | null;
  loading: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
}

export function use${modelName}(id: string): Use${modelName}Result {
  const ${lowerName} = useAtomValue(${lowerName}ByIdAtom(id));
  const loading = useAtomValue(${lowerPluralName}LoadingAtom);
  const updatingStates = useAtomValue(${lowerName}UpdatingAtom);
  const deletingStates = useAtomValue(${lowerName}DeletingAtom);
  const error = useAtomValue(${lowerPluralName}ErrorAtom);

  return {
    ${lowerName},
    loading,
    updating: updatingStates[id] || false,
    deleting: deletingStates[id] || false,
    error,
  };
}

export interface UseCreate${modelName}Result {
  create${modelName}: (data: Parameters<typeof ${modelName}Actions.create${modelName}>[0]) => Promise<${modelName}>;
  creating: boolean;
  error: string | null;
}

export function useCreate${modelName}(): UseCreate${modelName}Result {
  const creating = useAtomValue(${lowerName}CreatingAtom);
  const error = useAtomValue(${lowerPluralName}ErrorAtom);
  const create${modelName} = useSetAtom(optimisticCreate${modelName}Atom);

  return {
    create${modelName}: useCallback(
      async (data: Parameters<typeof ${modelName}Actions.create${modelName}>[0]) => {
        return await create${modelName}(data);
      },
      [create${modelName}]
    ),
    creating,
    error,
  };
}

export interface UseUpdate${modelName}Result {
  update${modelName}: (id: string, data: Parameters<typeof ${modelName}Actions.update${modelName}>[1]) => Promise<${modelName}>;
  updating: (id: string) => boolean;
  error: string | null;
}

export function useUpdate${modelName}(): UseUpdate${modelName}Result {
  const updatingStates = useAtomValue(${lowerName}UpdatingAtom);
  const error = useAtomValue(${lowerPluralName}ErrorAtom);
  const update${modelName} = useSetAtom(optimisticUpdate${modelName}Atom);

  return {
    update${modelName}: useCallback(
      async (id: string, data: Parameters<typeof ${modelName}Actions.update${modelName}>[1]) => {
        return await update${modelName}({ id, data });
      },
      [update${modelName}]
    ),
    updating: useCallback((id: string) => updatingStates[id] || false, [updatingStates]),
    error,
  };
}

export interface UseDelete${modelName}Result {
  delete${modelName}: (id: string) => Promise<void>;
  deleting: (id: string) => boolean;
  error: string | null;
}

export function useDelete${modelName}(): UseDelete${modelName}Result {
  const deletingStates = useAtomValue(${lowerName}DeletingAtom);
  const error = useAtomValue(${lowerPluralName}ErrorAtom);
  const delete${modelName} = useSetAtom(optimisticDelete${modelName}Atom);

  return {
    delete${modelName}: useCallback(
      async (id: string) => {
        await delete${modelName}(id);
      },
      [delete${modelName}]
    ),
    deleting: useCallback((id: string) => deletingStates[id] || false, [deletingStates]),
    error,
  };
}

// Combined mutation hook for convenience
export interface Use${modelName}MutationsResult {
  create${modelName}: (data: Parameters<typeof ${modelName}Actions.create${modelName}>[0]) => Promise<${modelName}>;
  update${modelName}: (id: string, data: Parameters<typeof ${modelName}Actions.update${modelName}>[1]) => Promise<${modelName}>;
  delete${modelName}: (id: string) => Promise<void>;
  creating: boolean;
  updating: (id: string) => boolean;
  deleting: (id: string) => boolean;
  error: string | null;
}

export function use${modelName}Mutations(): Use${modelName}MutationsResult {
  const { create${modelName}, creating } = useCreate${modelName}();
  const { update${modelName}, updating } = useUpdate${modelName}();
  const { delete${modelName}, deleting } = useDelete${modelName}();
  const error = useAtomValue(${lowerPluralName}ErrorAtom);

  return {
    create${modelName},
    update${modelName},
    delete${modelName},
    creating,
    updating,
    deleting,
    error,
  };
}

// Batch operations hooks
export interface UseBatch${modelName}OperationsResult {
  createMany${pluralName}: (data: Parameters<typeof ${modelName}Actions.createMany${pluralName}>[0]) => Promise<{ count: number }>;
  deleteMany${pluralName}: (ids: string[]) => Promise<{ count: number }>;
  processing: boolean;
  error: string | null;
}

export function useBatch${modelName}Operations(): UseBatch${modelName}OperationsResult {
  const [processing, setProcessing] = useAtom(${lowerPluralName}LoadingAtom);
  const error = useAtomValue(${lowerPluralName}ErrorAtom);
  const refresh = useSetAtom(refresh${pluralName}Atom);

  const createMany${pluralName} = useCallback(
    async (data: Parameters<typeof ${modelName}Actions.createMany${pluralName}>[0]) => {
      setProcessing(true);
      try {
        const result = await ${modelName}Actions.createMany${pluralName}(data);
        refresh(); // Refresh the list after batch create
        return result;
      } finally {
        setProcessing(false);
      }
    },
    [setProcessing, refresh]
  );

  const deleteMany${pluralName} = useCallback(
    async (ids: string[]) => {
      setProcessing(true);
      try {
        const result = await ${modelName}Actions.deleteMany${pluralName}(ids);
        refresh(); // Refresh the list after batch delete
        return result;
      } finally {
        setProcessing(false);
      }
    },
    [setProcessing, refresh]
  );

  return {
    createMany${pluralName},
    deleteMany${pluralName},
    processing,
    error,
  };
}

// Utility hook for ${lowerName} existence check
export function use${modelName}Exists(id: string): boolean {
  const ${lowerName} = useAtomValue(${lowerName}ByIdAtom(id));
  return !!${lowerName};
}
`;

	const filePath = path.join(modelDir, "hooks.ts");
	await fs.writeFile(filePath, template, "utf-8");
}
