import { join } from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { formatGeneratedFileHeader, writeFile } from "../utils.js";

export async function generateModelIndex(
	modelInfo: ModelInfo,
	_context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName, lowerName, pluralName, lowerPluralName } = modelInfo;

	const template = `${formatGeneratedFileHeader()}import * as Actions from "./actions";
import * as baseAtoms from "./atoms";
import * as derived from "./derived";
import * as fx from "./fx";
import * as Hooks from "./hooks";
import * as Schemas from "./schemas";
import * as Types from "./types";

export type { CreateInput, ModelType as ${modelName}, UpdateInput, WhereUniqueInput } from "./types";

const Atoms = {
	...baseAtoms,
	...derived,
	...fx,
};

export const ${lowerPluralName} = {
	atoms: Atoms,
	hooks: Hooks,
	actions: Actions,
	schemas: Schemas,
	types: Types,
} as const;

export const { use${pluralName}List, use${modelName}, use${modelName}Form } = Hooks;
`;

	const filePath = join(modelDir, "index.ts");
	await writeFile(filePath, template);
}
