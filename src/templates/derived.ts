import { join } from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { formatGeneratedFileHeader, writeFile } from "../utils.js";

export async function generateDerivedAtoms(
	modelInfo: ModelInfo,
	_context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName } = modelInfo;

	const template = `${formatGeneratedFileHeader()}import { atom } from "jotai";
import { atomFamily, loadable } from "jotai/utils";
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

/* local search */
export const searchAtom = atomFamily((query: string) =>
	atom<ModelType[]>((get) => get(listAtom).filter((e) => JSON.stringify(e).toLowerCase().includes(query.toLowerCase()))),
);
`;

	const filePath = join(modelDir, "derived.ts");
	await writeFile(filePath, template);
}
