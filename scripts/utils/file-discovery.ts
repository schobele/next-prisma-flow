import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

export interface FileComparison {
	model: string;
	fileType: string;
	baselinePath: string;
	generatedPath: string;
}

export interface DiscoveryResult {
	models: Set<string>;
	fileTypes: Set<string>;
	comparisons: FileComparison[];
}

const KNOWN_FILE_TYPES = ["hooks", "atoms", "actions", "derived", "fx", "types", "schemas", "config", "index"];
const IGNORED_DIRS = ["zod"];

/**
 * Discover available models and file types for comparison
 */
export async function discoverModelsAndFiles(
	baselineDir: string,
	generatedDir: string,
	modelFilter?: string,
	fileTypeFilter?: string,
): Promise<DiscoveryResult> {
	const models = new Set<string>();
	const fileTypes = new Set<string>();
	const comparisons: FileComparison[] = [];

	// Discover models from baseline directory
	try {
		const baselineEntries = await readdir(baselineDir, { withFileTypes: true });

		for (const entry of baselineEntries) {
			if (entry.isDirectory()) {
				// Skip shared directory
				if (entry.name === "shared") continue;

				// Apply model filter if specified
				if (modelFilter && entry.name !== modelFilter) continue;

				models.add(entry.name);

				// Discover file types for this model
				const modelDir = join(baselineDir, entry.name);

				if (IGNORED_DIRS.includes(entry.name)) continue;

				const files = await readdir(modelDir);

				for (const file of files) {
					if (!file.endsWith(".ts")) continue;

					const fileType = file.replace(".ts", "");

					// Skip unknown file types
					if (!KNOWN_FILE_TYPES.includes(fileType)) continue;

					// Apply file type filter if specified
					if (fileTypeFilter && fileTypeFilter !== "all" && fileType !== fileTypeFilter) continue;

					fileTypes.add(fileType);

					// Check if corresponding generated file exists
					const baselinePath = join(modelDir, file);
					const generatedPath = join(generatedDir, entry.name, file);

					if (existsSync(generatedPath)) {
						comparisons.push({
							model: entry.name,
							fileType,
							baselinePath,
							generatedPath,
						});
					} else {
						console.warn(`⚠️  Generated file not found: ${generatedPath}`);
					}
				}
			}
		}
	} catch (error) {
		throw new Error(`Failed to discover files: ${error}`);
	}

	// Validate filters
	if (modelFilter && !models.has(modelFilter)) {
		throw new Error(`Model '${modelFilter}' not found. Available models: ${Array.from(models).join(", ")}`);
	}

	if (fileTypeFilter && fileTypeFilter !== "all" && !fileTypes.has(fileTypeFilter)) {
		throw new Error(`File type '${fileTypeFilter}' not found. Available types: ${Array.from(fileTypes).join(", ")}`);
	}

	return { models, fileTypes, comparisons };
}
