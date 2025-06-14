import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import type { ModelType } from "./types";

/** Source-of-truth — keyed by primary id */
export const entitiesAtom = atom<Record<string, ModelType>>({});

/** Pending optimistic operations */
export const pendingPatchesAtom = atom<Record<string, { type: "create" | "update" | "delete" | "upsert" }>>({});

/** Last error surfaced by any action */
export const errorAtom = atom<null | { message: string; code: string; details?: any }>(null);

/** Fine-grained atom per entity */
export const entityAtomFamily = atomFamily((id: string) =>
	atom(
		(get) => get(entitiesAtom)[id],
		(_get, set, next: ModelType) => set(entitiesAtom, (m) => ({ ...m, [id]: next })),
	),
);
