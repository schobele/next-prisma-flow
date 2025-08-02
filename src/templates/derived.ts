import { join } from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { formatGeneratedFileHeader, writeFile } from "../utils.js";

export async function generateDerivedAtoms(
	modelInfo: ModelInfo,
	_context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName, analyzed } = modelInfo;

	// Extract searchable string fields from the model
	const searchableFields = analyzed.stringFields
		.map((field) => field.name)
		.filter((name) => !["id", "password", "hash", "token"].includes(name.toLowerCase()));

	const template = `${formatGeneratedFileHeader()}import { atom } from "jotai";
import { atomFamily, loadable } from "jotai/utils";
import Fuse, { type IFuseOptions } from "fuse.js";
import { entitiesAtom, entityAtomFamily, pendingPatchesAtom } from "./atoms";
import type { ModelType } from "./types";

export const listAtom = atom<ModelType[]>((g) => Object.values(g(entitiesAtom)));
export const loadingAtom = atom((g) => Object.keys(g(pendingPatchesAtom)).length > 0);
export const listLoadable = loadable(listAtom);
export const countAtom = atom((get) => get(listAtom).length);
export const hasAnyAtom = atom((get) => get(countAtom) > 0);

/** Loadable wrapper around a single entity */
export const entityLoadableFamily = atomFamily((id: string) => loadable(entityAtomFamily(id)));

/** true if loadable is loading **or** optimistic patch in flight */
export const entityBusyFamily = atomFamily((id: string) =>
	atom((get) => {
		const load = get(entityLoadableFamily(id));
		const isFetching = load.state === "loading";
		const isOptimistic = Boolean(get(pendingPatchesAtom)[id]);
		return isFetching || isOptimistic;
	}),
);

/* selection helpers */
export const selectedIdAtom = atom<string | null>(null);
export const selectedAtom = atom<ModelType | null>((get) => {
	const id = get(selectedIdAtom);
	if (!id) return null;
	return get(entitiesAtom)[id] ?? null;
});

/** Creates a family of count atoms keyed by an arbitrary property value. */
export const countByFieldAtomFamily = <K extends keyof ModelType>(field: K) =>
	atomFamily((value: ModelType[K]) => atom((get) => get(listAtom).filter((item) => item[field] === value).length));

/** Family that returns a *list* of entities matching a given field value. */
export const listByFieldAtomFamily = <K extends keyof ModelType>(field: K) =>
	atomFamily((value: ModelType[K]) => atom<ModelType[]>((get) => get(listAtom).filter((item) => item[field] === value)));

/* simple paging */
export const pagedAtom = atomFamily(({ page, pageSize }: { page: number; pageSize: number }) =>
	atom<ModelType[]>((get) => {
		const list = get(listAtom);
		const start = (page - 1) * pageSize;
		return list.slice(start, start + pageSize);
	}),
);

/* Enhanced search with Fuse.js */
interface SearchParams {
	query: string;
	options?: IFuseOptions<ModelType>;
}

// Default search keys - all string fields commonly searched
const defaultSearchKeys = ${JSON.stringify(searchableFields)};

// Cache Fuse instances to avoid recreation
interface FuseCache {
	fuse: Fuse<ModelType>;
	list: ModelType[];
}
const fuseCache = new Map<string, FuseCache>();

export const searchAtom = atomFamily(
	(params: SearchParams | string) => 
		atom<ModelType[]>((get) => {
			const list = get(listAtom);
			
			// Handle backward compatibility for string-only parameter
			const { query, options } = typeof params === "string" 
				? { query: params, options: undefined }
				: params;
			
			// Return all items if query is empty
			if (!query || query.trim() === "") {
				return list;
			}
			
			// Create cache key based on options
			const cacheKey = JSON.stringify(options?.keys || defaultSearchKeys);
			
			// Get or create Fuse instance
			let cached = fuseCache.get(cacheKey);
			if (!cached || cached.list !== list) {
				const fuseOptions: IFuseOptions<ModelType> = {
					keys: defaultSearchKeys,
					threshold: 0.3,
					ignoreLocation: true,
					...options,
				};
				const fuse = new Fuse(list, fuseOptions);
				cached = { fuse, list };
				fuseCache.set(cacheKey, cached);
			}
			
			// Perform search
			const results = cached.fuse.search(query);
			
			// Return just the items (not the Fuse result objects)
			return results.map(result => result.item);
		}),
	// Custom equality function to ensure stable keys
	(a, b) => {
		const aKey = typeof a === "string" ? a : JSON.stringify(a);
		const bKey = typeof b === "string" ? b : JSON.stringify(b);
		return aKey === bKey;
	}
);
`;

	const filePath = join(modelDir, "derived.ts");
	await writeFile(filePath, template);
}
