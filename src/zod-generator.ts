import { spawn } from "node:child_process";
import { readFile, writeFile, ensureDirectory, fileExists, deleteFile } from "./utils.js";
import { join, dirname } from "node:path";
import type { GeneratorOptions } from "@prisma/generator-helper";
import { FlowGeneratorError } from "./errors.js";

export class ZodGenerationError extends FlowGeneratorError {
	constructor(message: string, cause?: unknown) {
		super(`Zod generation failed: ${message}`, cause);
		this.name = "ZodGenerationError";
	}
}

/**
 * Generates Zod schemas using zod-prisma-types by creating a temporary schema
 * and executing the generator as a subprocess.
 */
export async function generateZodSchemas(
	options: GeneratorOptions,
	outputDir: string,
	models: string[],
): Promise<void> {
	console.log("📦 Generating integrated Zod schemas...");

	const zodOutputDir = join(outputDir, "zod");

	// Ensure zod output directory exists
	try {
		await ensureDirectory(zodOutputDir);
	} catch (error) {
		throw new ZodGenerationError(`Failed to create zod output directory: ${zodOutputDir}`, error);
	}

	// Create a temporary schema file with zod-prisma-types generator configuration
	const tempSchemaPath = await createTempSchemaWithZodGenerator(options, zodOutputDir, models);

	try {
		// Execute zod-prisma-types generator
		await executeZodPrismaTypes(tempSchemaPath);

		// Verify that the expected schemas were generated
		await validateGeneratedSchemas(zodOutputDir, models);

		console.log("✅ Integrated Zod schemas generated successfully");
	} catch (error) {
		throw new ZodGenerationError("Failed to generate Zod schemas", error);
	} finally {
		// Clean up temporary schema file
		try {
			await deleteFile(tempSchemaPath);
		} catch {
			// Ignore cleanup errors
		}
	}
}

/**
 * Creates a temporary Prisma schema file with zod-prisma-types generator configuration.
 */
async function createTempSchemaWithZodGenerator(
	options: GeneratorOptions,
	zodOutputDir: string,
	models: string[],
): Promise<string> {
	try {
		// Create temporary schema for zod generation

		// Read the original schema content
		const originalSchemaContent = await readFile(options.schemaPath);

		// Remove any existing flow generator to avoid conflicts
		const schemaWithoutFlowGenerator = originalSchemaContent.replace(/generator\s+flow\s*\{[\s\S]*?\}/g, "");

		// Create a modified schema with only zod-prisma-types generator
		const zodGeneratorConfig = `
generator zod {
  provider = "zod-prisma-types"
  output   = "${zodOutputDir}"
}
`;

		// Add the zod generator to the schema
		const modifiedSchema = `${schemaWithoutFlowGenerator}\n${zodGeneratorConfig}`;

		// Create temporary schema file
		const tempSchemaPath = join(dirname(options.schemaPath), ".temp-zod-schema.prisma");
		await writeFile(tempSchemaPath, modifiedSchema);

		// Temporary schema created for zod generation
		return tempSchemaPath;
	} catch (error) {
		throw new ZodGenerationError("Failed to create temporary schema file", error);
	}
}

/**
 * Executes the zod-prisma-types generator using Prisma CLI.
 */
async function executeZodPrismaTypes(schemaPath: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const child = spawn("npx", ["prisma", "generate", "--schema", schemaPath], {
			stdio: ["ignore", "pipe", "pipe"],
			shell: true,
		});

		let stdout = "";
		let stderr = "";

		child.stdout?.on("data", (data) => {
			stdout += data.toString();
		});

		child.stderr?.on("data", (data) => {
			stderr += data.toString();
		});

		child.on("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Zod generation failed with code ${code}:\nSTDOUT: ${stdout}\nSTDERR: ${stderr}`));
			}
		});

		child.on("error", (error) => {
			reject(new Error(`Failed to spawn zod generation process: ${error.message}`));
		});
	});
}

/**
 * Validates that the expected Zod schemas were generated successfully.
 */
async function validateGeneratedSchemas(zodOutputDir: string, models: string[]): Promise<void> {
	try {
		// Check if the main index file was created
		const indexPath = join(zodOutputDir, "index.ts");
		const indexExists = await fileExists(indexPath);

		if (!indexExists) {
			throw new Error("Zod index file was not generated");
		}

		// Read the generated index file to verify schemas for our models
		const indexContent = await readFile(indexPath);

		// Check that schemas for our specified models were generated
		const missingSchemas: string[] = [];
		for (const modelName of models) {
			const hasCreateSchema = indexContent.includes(`${modelName}CreateInputSchema`);
			const hasUpdateSchema = indexContent.includes(`${modelName}UpdateInputSchema`);

			if (!hasCreateSchema || !hasUpdateSchema) {
				missingSchemas.push(modelName);
			}
		}

		if (missingSchemas.length > 0) {
			throw new Error(`Missing Zod schemas for models: ${missingSchemas.join(", ")}`);
		}
	} catch (error) {
		throw new ZodGenerationError("Generated Zod schemas validation failed", error);
	}
}
