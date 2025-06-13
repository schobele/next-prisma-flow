import { join } from "node:path";
import type { GeneratorContext } from "../types.js";
import { formatGeneratedFileHeader, writeFile, plural } from "../utils.js";

export async function generateRootIndex(context: GeneratorContext): Promise<void> {
	const { config } = context;

	// Generate imports for all models
	const modelImports = config.models
		.map((modelName) => {
			const lowerModelName = modelName.toLowerCase();
			const pluralName = plural(lowerModelName);
			return `import { ${pluralName} } from "./${lowerModelName}";`;
		})
		.join("\n");

	// Generate type imports for all models
	const typeImports = config.models
		.map((modelName) => {
			const lowerModelName = modelName.toLowerCase();
			return `import type { ModelType as ${modelName} } from "./${lowerModelName}/types";`;
		})
		.join("\n");

	// Generate exports
	const modelExports = config.models
		.map((modelName) => {
			const lowerModelName = modelName.toLowerCase();
			const pluralName = plural(lowerModelName);
			return `\t${pluralName},`;
		})
		.join("\n");

	// Generate type exports
	const typeExports = config.models
		.map((modelName) => {
			return `\ttype ${modelName},`;
		})
		.join("\n");

	const template = `${formatGeneratedFileHeader()}${modelImports}

${typeImports}

// Export all models
export {
${modelExports}
};

// Export all types
export {
${typeExports}
};

// Export shared utilities
export { prisma } from "./prisma";
export * as zod from "./zod";
`;

	const filePath = join(context.outputDir, "index.ts");
	await writeFile(filePath, template);
}
