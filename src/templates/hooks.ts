import { join } from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { formatGeneratedFileHeader, writeFile } from "../utils.js";

export async function generateReactHooks(
	modelInfo: ModelInfo,
	context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName, lowerName, pluralName, lowerPluralName } = modelInfo;

	const template = `${formatGeneratedFileHeader()}import { useAtomValue, useSetAtom } from "jotai";
import { entityAtomFamily, errorAtom } from "./atoms";
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
import { makeUseFormHook } from "../shared/hooks/use-form-factory";
import { createAtom, deleteAtom, loadEntityAtom, loadsListAtom, updateAtom, upsertAtom } from "./fx";
import { schemas } from "./schemas";
import type { CreateInput, ModelType, Relationships, UpdateInput } from "./types";

/**
 * Hook for managing the complete ${lowerPluralName} collection with comprehensive state management.
 *
 * Provides access to the full ${lowerPluralName} list along with loading states, error handling,
 * and all necessary CRUD operations. This hook manages the global state for ${lowerPluralName}
 * and automatically handles loading indicators and error states.
 */
export function use${pluralName}() {
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
 */
export function use${modelName}(id: string) {
	const entity = useAtomValue(entityAtomFamily(id));
	const loadable = useAtomValue(entityLoadableFamily(id));
	const isBusy = useAtomValue(entityBusyFamily(id));
	const lastError = useAtomValue(errorAtom);

	const update${modelName} = useSetAtom(updateAtom);
	const delete${modelName} = useSetAtom(deleteAtom);
	const upsert${modelName} = useSetAtom(upsertAtom);
	const fetchById = useSetAtom(loadEntityAtom);

	const update = (data: UpdateInput) => update${modelName}({ id, data });
	const remove = () => delete${modelName}(id);
	const upsert = (payload: { create: CreateInput; update: UpdateInput }) =>
		upsert${modelName}({ id }, payload);

	const relations = makeRelationHelpers<Relationships>(id, update${modelName});

	return {
		/* data */
		data: entity || null,
		loading: isBusy || loadable.state === "loading",
		error: loadable.state === "hasError" ? loadable.error : lastError,

		/* entity actions */
		update${modelName}: update,
		delete${modelName}: remove,
		upsert${modelName}: upsert,
		fetchById: () => fetchById({ id }),

		/* relation helpers */
		relations,
	};
}

export const use${modelName}Form = makeUseFormHook<ModelType, CreateInput, UpdateInput>({
	create: schemas.create,
	update: schemas.update,
});
`;

	const filePath = join(modelDir, "hooks.ts");
	await writeFile(filePath, template);
}
