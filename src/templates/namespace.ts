import { writeFile } from "../utils.js";
import { join } from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { formatGeneratedFileHeader } from "../utils.js";

export async function generateNamespaceExports(
	modelInfo: ModelInfo,
	context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName, lowerName, pluralName, lowerPluralName } = modelInfo;

	const template = `${formatGeneratedFileHeader()}// Model-specific namespace export for ${modelName}
// Provides organized access to all ${modelName} functionality

import * as hooks from './hooks';
import * as actions from './actions';
import * as atoms from './atoms';
import * as types from './types';
import * as providers from './form-provider';
import { ${modelName}CreateInputSchema, ${modelName}UpdateInputSchema } from './types';

// Main namespace export
export const ${lowerName} = {
  hooks,
  actions,
  atoms,
  types,
  providers,
  
  schemas: {
    create: ${modelName}CreateInputSchema,
    update: ${modelName}UpdateInputSchema,
  },
} as const;

// Export the namespace as default for convenience
export default ${lowerName};

// Also export all the individual pieces for direct access
export { hooks, actions, atoms, types, providers };
`;

	const filePath = join(modelDir, "namespace.ts");
	await writeFile(filePath, template);
}
