import { join } from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { formatGeneratedFileHeader, writeFile } from "../utils.js";

export async function generateReactHooks(
	modelInfo: ModelInfo,
	_context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName, lowerName, pluralName, lowerPluralName } = modelInfo;

	const template = `${formatGeneratedFileHeader()}import { useCallback, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import type { IFuseOptions } from "fuse.js";
import { entityAtomFamily, errorAtom, pendingPatchesAtom } from "./atoms";
import {
	countAtom,
	countByFieldAtomFamily,
	entityBusyFamily,
	entityLoadableFamily,
	hasAnyAtom,
	listByFieldAtomFamily,
	listLoadable,
	loadingAtom,
	pagedAtom,
	searchAtom,
	selectedAtom,
	selectedIdAtom,
} from "./derived";

import { makeRelationHelpers } from "../shared/hooks/relation-helper";
import { createFormActions, makeUseFormHook, type UseFormOptions } from "../shared/hooks/use-form-factory";
import { useAutoload } from "../shared/hooks/useAutoload";
import { createAtom, deleteAtom, loadEntityAtom, loadsListAtom, updateAtom, upsertAtom } from "./fx";
import { schemas } from "./schemas";
import type { CreateInput, ModelType, Relationships, UpdateInput } from "./types";

/**
 * Hook for managing the complete ${lowerPluralName} collection with comprehensive state management.
 *
 * Provides access to the full ${lowerPluralName} list along with loading states, error handling,
 * and all necessary CRUD operations. This hook manages the global state for ${lowerPluralName}
 * and automatically handles loading indicators and error states.
 *
 * @param {Object} opts - Configuration options
 * @param {boolean} [opts.autoLoad=true] - Whether to automatically load data when component mounts
 *
 * @returns {Object} Complete ${lowerPluralName} management interface
 * @returns {Array} data - Array of ${lowerPluralName} (empty array when loading or on error)
 * @returns {number} count - Total number of ${lowerPluralName} available
 * @returns {boolean} hasAny - Quick check if any ${lowerPluralName} exist
 * @returns {boolean} loading - True when fetching data or performing operations
 * @returns {Error|null} error - Last error that occurred, null if no errors
 * @returns {Function} create${modelName} - Creates a new ${lowerName}
 * @returns {Function} update${modelName} - Updates an existing ${lowerName}
 * @returns {Function} upsert${modelName} - Upserts a ${lowerName}
 * @returns {Function} delete${modelName} - Deletes a ${lowerName} by ID
 * @returns {Function} fetchAll - Refreshes the entire ${lowerPluralName} list
 *
 * @example
 * \`\`\`tsx
 * function ${pluralName}List() {
 *   const { data, loading, error, create${modelName}, update${modelName}, delete${modelName} } = use${pluralName}List();
 *
 *   if (loading) return <div>Loading ${lowerPluralName}...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       {data.map(${lowerName} => (
 *         <${modelName}Item key={${lowerName}.id} ${lowerName}={${lowerName}} onUpdate={update${modelName}} onDelete={delete${modelName}} />
 *       ))}
 *     </div>
 *   );
 * }
 * \`\`\`
 */
export function use${pluralName}List(opts: { autoLoad?: boolean } = { autoLoad: true }) {
	const loadable = useAtomValue(listLoadable);
	const busy = useAtomValue(loadingAtom);
	const count = useAtomValue(countAtom);
	const hasAny = useAtomValue(hasAnyAtom);
	const lastError = useAtomValue(errorAtom);

	const create${modelName} = useSetAtom(createAtom);
	const update${modelName} = useSetAtom(updateAtom);
	const delete${modelName} = useSetAtom(deleteAtom);
	const upsert${modelName} = useSetAtom(upsertAtom);
	const fetchAll = useSetAtom(loadsListAtom);
	const fetchById = useSetAtom(loadEntityAtom);

	useAutoload(
		() => opts.autoLoad !== false && !busy && !hasAny,
		() => fetchAll(),
	);

	return {
		/* data */
		data: loadable.state === "hasData" ? loadable.data : [],
		count,
		hasAny,

		/* meta */
		loading: busy || loadable.state === "loading",
		error: loadable.state === "hasError" ? loadable.error : lastError,

		/* actions */
		create${modelName},
		update${modelName},
		delete${modelName},
		upsert${modelName},
		fetchAll,
		fetchById,
	};
}

/**
 * Hook for managing a specific ${lowerName} by ID with optimistic updates and error handling.
 *
 * Provides granular control over individual ${lowerPluralName}, including fetching, updating, and deleting.
 * The hook automatically manages loading states and errors specific to this ${lowerName} instance.
 * Actions are pre-bound with the ${lowerName} ID for convenience.
 *
 * @param {string} id - The unique identifier of the ${lowerName} to manage
 * @param {Object} opts - Configuration options
 * @param {boolean} [opts.autoLoad=true] - Whether to automatically load data when component mounts
 *
 * @returns {Object} Single ${lowerName} management interface
 * @returns {Object|null} data - The ${lowerName} data object, null if not found or loading
 * @returns {boolean} loading - True when fetching or performing operations on this ${lowerName}
 * @returns {Error|null} error - Last error related to operations on this ${lowerName}
 * @returns {Function} update${modelName} - Updates this specific ${lowerName} with provided data
 * @returns {Function} delete${modelName} - Deletes this specific ${lowerName}
 * @returns {Function} fetch - Fetches/refreshes this specific ${lowerName} from the server
 * @returns {Object} relations - relationship helpers
 *
 * @example
 * \`\`\`tsx
 * function ${modelName}Detail({ ${lowerName}Id }: { ${lowerName}Id: string }) {
 *   const { data, loading, error, update${modelName}, delete${modelName} } = use${modelName}(${lowerName}Id);
 *
 *   if (loading) return <div>Loading ${lowerName}...</div>;
 *   if (error) return <div>Error loading ${lowerName}: {error.message}</div>;
 *   if (!data) return <div>${modelName} not found</div>;
 *
 *   const handleSave = (formData) => {
 *     update${modelName}(formData); // ID is automatically included
 *   };
 *
 *   return (
 *     <div>
 *       <h1>{data.title}</h1>
 *       <p>{data.content}</p>
 *       <button onClick={() => delete${modelName}()}>Delete</button>
 *     </div>
 *   );
 * }
 * \`\`\`
 */
export function use${modelName}(id: string, opts: { autoLoad?: boolean } = { autoLoad: true }) {
	const ${lowerName} = useAtomValue(entityAtomFamily(id));
	const loadable = useAtomValue(entityLoadableFamily(id));
	const busyItem = useAtomValue(entityBusyFamily(id));
	const lastError = useAtomValue(errorAtom);
	const pendingPatches = useAtomValue(pendingPatchesAtom);

	const update${modelName} = useSetAtom(updateAtom);
	const delete${modelName} = useSetAtom(deleteAtom);
	const fetch = useSetAtom(loadEntityAtom);

	const relations = makeRelationHelpers<Relationships>(id, update${modelName});

	useAutoload(
		() =>
			opts.autoLoad !== false &&
			!busyItem &&
			!${lowerName} &&
			!pendingPatches[id],
		() => fetch({ id }),
	);

	return {
		/* data */
		data: ${lowerName},

		/* meta */
		loading: busyItem || loadable.state === "loading",
		error: lastError,

		/* actions */
		update${modelName}: (data: UpdateInput) => update${modelName}({ id, data }),
		delete${modelName}: () => delete${modelName}(id),
		fetch: () => fetch({ id }),

		/* relations */
		relations,
	};
}

/**
 * Enhanced form hook with integrated CRUD operations and optimistic updates.
 * 
 * Automatically detects create vs update mode based on whether an instance is provided.
 * Integrates directly with the ${lowerName} atoms for seamless state management.
 *
 * @param {ModelType} [instance] - ${modelName} instance for update mode, undefined for create mode
 * @param {Object} [options] - Form options and callbacks
 * @param {Function} [options.onSuccess] - Callback fired on successful submission
 * @param {Function} [options.onError] - Callback fired on submission error
 * @param {boolean} [options.resetOnSuccess=true] - Whether to reset form after successful creation
 * @param {Object} [options.transform] - Data transformation functions
 *
 * @returns {Object} Enhanced form interface with submission handling
 * @returns {Function} handleSubmit - Form submission handler
 * @returns {boolean} isSubmitting - Whether form is currently submitting
 * @returns {boolean} isCreating - Whether form is in create mode and submitting
 * @returns {boolean} isUpdating - Whether form is in update mode and submitting
 * @returns {string} mode - Current form mode: 'create' | 'update'
 * @returns {any} submitError - Last submission error, if any
 * @returns {*} ...formMethods - All react-hook-form methods and state
 *
 * @example
 * \`\`\`tsx
 * function ${modelName}Form({ ${lowerName}, onClose }) {
 *   const form = use${modelName}Form(${lowerName}, {
 *     onSuccess: () => onClose(),
 *     onError: (error) => toast.error(error.message),
 *     transform: {
 *       toCreateInput: (data) => ({
 *         ...data,
 *         authorId: data.author?.id || data.authorId,
 *         categoryId: data.category?.id || data.categoryId,
 *       }),
 *     },
 *   });
 *
 *   return (
 *     <form onSubmit={form.handleSubmit}>
 *       <input {...form.register('title')} placeholder="Title" />
 *       <textarea {...form.register('description')} placeholder="Description" />
 *       <button type="submit" disabled={form.isSubmitting}>
 *         {form.isSubmitting 
 *           ? (form.mode === 'create' ? 'Creating...' : 'Updating...') 
 *           : (form.mode === 'create' ? 'Create ${modelName}' : 'Update ${modelName}')
 *         }
 *       </button>
 *     </form>
 *   );
 * }
 * \`\`\`
 */
export function use${modelName}Form(instance?: ModelType, options: UseFormOptions<ModelType> = {}) {
	const create${modelName}Action = useSetAtom(createAtom);
	const update${modelName}Action = useSetAtom(updateAtom);
	
	const formActions = createFormActions(create${modelName}Action, update${modelName}Action);
	
	return makeUseFormHook<ModelType, CreateInput, UpdateInput>(
		{
			create: schemas.createInput,
			update: schemas.updateInput,
		},
		formActions
	)(instance, options);
}

export const useSelectedId = () => useAtomValue(selectedIdAtom);
export const useSelected = () => useAtomValue(selectedAtom);
export const useSetSelectedId = () => useSetAtom(selectedIdAtom);

export function useListByFieldValue<K extends keyof ModelType>(field: K, value: ModelType[K]) {
	const fam = listByFieldAtomFamily(field);
	return useAtomValue(fam(value));
}

export function usePagedList(page: number, pageSize = 10) {
	return useAtomValue(pagedAtom({ page, pageSize }));
}

// Type helper to extract all string paths from a type
type PathsToStringProps<T, P extends string = ""> = T extends string | number | boolean | Date | null | undefined
	? P
	: T extends Array<infer U>
	? PathsToStringProps<U, P>
	: T extends object
	? {
			[K in keyof T]: PathsToStringProps<T[K], P extends "" ? K & string : \`\${P}.\${K & string}\`>
	  }[keyof T]
	: never;

// Get all valid search keys for ModelType
type SearchKeys = PathsToStringProps<ModelType>;

interface UseSearchOptions extends Omit<IFuseOptions<ModelType>, 'keys'> {
	keys?: SearchKeys[];
}

interface UseSearchReturn<T> {
	search: (query: string) => void;
	results: T[];
	query: string;
}

export function useSearch(options?: UseSearchOptions): UseSearchReturn<ModelType> {
	const [query, setQuery] = useState("");
	const results = useAtomValue(searchAtom({ query, options }));
	
	const search = useCallback((newQuery: string) => {
		setQuery(newQuery);
	}, []);
	
	return {
		search,
		results,
		query,
	};
}

export function useCountByFieldValue<K extends keyof ModelType>(field: K, value: ModelType[K]) {
	const fam = countByFieldAtomFamily(field);
	return useAtomValue(fam(value));
}
`;

	const filePath = join(modelDir, "hooks.ts");
	await writeFile(filePath, template);
}
