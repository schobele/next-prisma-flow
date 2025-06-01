import fs from "node:fs/promises";
import path from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { formatGeneratedFileHeader } from "../utils.js";

export async function generateJotaiAtoms(
	modelInfo: ModelInfo,
	context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName, lowerName, pluralName, lowerPluralName } = modelInfo;

	const template = `${formatGeneratedFileHeader()}import { atom } from 'jotai';
import { atomWithImmer } from 'jotai-immer';
import type { ${modelName} } from './types';
import * as ${modelName}Actions from './actions';

// Base atom to store all ${lowerPluralName} by ID for efficient updates
export const base${pluralName}Atom = atomWithImmer<Record<string, ${modelName}>>({});

// Derived atom for the list of ${lowerPluralName}
export const ${lowerName}ListAtom = atom((get) => {
  const ${lowerPluralName}Map = get(base${pluralName}Atom);
  return Object.values(${lowerPluralName}Map);
});

// Loading state atoms
export const ${lowerPluralName}LoadingAtom = atom<boolean>(false);
export const ${lowerName}CreatingAtom = atom<boolean>(false);
export const ${lowerName}UpdatingAtom = atom<Record<string, boolean>>({});
export const ${lowerName}DeletingAtom = atom<Record<string, boolean>>({});

// Error state atoms
export const ${lowerPluralName}ErrorAtom = atom<string | null>(null);

// Refresh action atom - when written to, fetches fresh data
export const refresh${pluralName}Atom = atom(
  null,
  async (_get, set) => {
    set(${lowerPluralName}LoadingAtom, true);
    set(${lowerPluralName}ErrorAtom, null);
    
    try {
      const ${lowerPluralName} = await ${modelName}Actions.getAll${pluralName}();
      const ${lowerPluralName}Map = Object.fromEntries(
        ${lowerPluralName}.map(${lowerName} => [${lowerName}.id, ${lowerName}])
      );
      set(base${pluralName}Atom, ${lowerPluralName}Map);
    } catch (error) {
      set(${lowerPluralName}ErrorAtom, error instanceof Error ? error.message : 'Failed to fetch ${lowerPluralName}');
    } finally {
      set(${lowerPluralName}LoadingAtom, false);
    }
  }
);

// Individual ${lowerName} atom by ID
export const ${lowerName}ByIdAtom = (id: string) => atom((get) => {
  const ${lowerPluralName}Map = get(base${pluralName}Atom);
  return ${lowerPluralName}Map[id] || null;
});

// Optimistic create atom
export const optimisticCreate${modelName}Atom = atom(
  null,
  async (get, set, ${lowerName}Data: Parameters<typeof ${modelName}Actions.create${modelName}>[0]) => {
    const tempId = \`temp-\${Date.now()}-\${Math.random()}\`;
    
    // Create optimistic model with defaults for required fields
    const scalarFields = Object.fromEntries(
      Object.entries(${lowerName}Data).filter(([key, value]) => 
        typeof value !== 'object' || value instanceof Date || value === null
      )
    );
    
    const optimistic${modelName} = { 
      ...scalarFields,
      id: tempId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any; // Will be replaced with server response
    
    // Optimistic update
    set(base${pluralName}Atom, (draft) => {
      draft[tempId] = optimistic${modelName} as ${modelName};
    });
    set(${lowerName}CreatingAtom, true);
    set(${lowerPluralName}ErrorAtom, null);
    
    try {
      const created${modelName} = await ${modelName}Actions.create${modelName}(${lowerName}Data);
      
      // Replace optimistic entry with real data
      set(base${pluralName}Atom, (draft) => {
        delete draft[tempId];
        draft[created${modelName}.id] = created${modelName};
      });
      
      return created${modelName};
    } catch (error) {
      // Rollback optimistic update
      set(base${pluralName}Atom, (draft) => {
        delete draft[tempId];
      });
      set(${lowerPluralName}ErrorAtom, error instanceof Error ? error.message : 'Failed to create ${lowerName}');
      throw error;
    } finally {
      set(${lowerName}CreatingAtom, false);
    }
  }
);

// Optimistic update atom
export const optimisticUpdate${modelName}Atom = atom(
  null,
  async (get, set, { id, data }: { id: string; data: Parameters<typeof ${modelName}Actions.update${modelName}>[1] }) => {
    const current${modelName} = get(base${pluralName}Atom)[id];
    if (!current${modelName}) {
      throw new Error('${modelName} not found');
    }
    
    // Set loading state
    set(${lowerName}UpdatingAtom, (prev) => ({ ...prev, [id]: true }));
    set(${lowerPluralName}ErrorAtom, null);
    
    try {
      const updated${modelName} = await ${modelName}Actions.update${modelName}(id, data);
      
      // Update with server response
      set(base${pluralName}Atom, (draft) => {
        draft[id] = updated${modelName};
      });
      
      return updated${modelName};
    } catch (error) {
      set(${lowerPluralName}ErrorAtom, error instanceof Error ? error.message : 'Failed to update ${lowerName}');
      throw error;
    } finally {
      set(${lowerName}UpdatingAtom, (prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    }
  }
);

// Optimistic delete atom
export const optimisticDelete${modelName}Atom = atom(
  null,
  async (get, set, id: string) => {
    const ${lowerName}ToDelete = get(base${pluralName}Atom)[id];
    if (!${lowerName}ToDelete) {
      throw new Error('${modelName} not found');
    }
    
    // Optimistic removal
    set(base${pluralName}Atom, (draft) => {
      delete draft[id];
    });
    set(${lowerName}DeletingAtom, (prev) => ({ ...prev, [id]: true }));
    set(${lowerPluralName}ErrorAtom, null);
    
    try {
      await ${modelName}Actions.delete${modelName}(id);
    } catch (error) {
      // Rollback: restore the deleted item
      set(base${pluralName}Atom, (draft) => {
        draft[id] = ${lowerName}ToDelete;
      });
      set(${lowerPluralName}ErrorAtom, error instanceof Error ? error.message : 'Failed to delete ${lowerName}');
      throw error;
    } finally {
      set(${lowerName}DeletingAtom, (prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    }
  }
);

// Utility atoms for computed state
export const ${lowerName}CountAtom = atom((get) => {
  const ${lowerPluralName} = get(${lowerName}ListAtom);
  return ${lowerPluralName}.length;
});

export const is${pluralName}EmptyAtom = atom((get) => {
  const count = get(${lowerName}CountAtom);
  return count === 0;
});
`;

	const filePath = path.join(modelDir, "atoms.ts");
	await fs.writeFile(filePath, template, "utf-8");
}
