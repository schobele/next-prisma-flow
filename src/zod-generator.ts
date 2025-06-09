// Using Bun.spawn instead of node:child_process
import type { GeneratorOptions } from "@prisma/generator-helper";
import { dirname, join } from "node:path";
import { FlowGeneratorError } from "./errors.js";
import { deleteFile, ensureDirectory, fileExists, readFile, writeFile } from "./utils.js";

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
		console.log("🔧 Executing zod-prisma-types generator...");
		console.log("Temp schema path:", tempSchemaPath);
		console.log("Zod output dir:", zodOutputDir);

		// Execute zod-prisma-types generator
		await executeZodPrismaTypes(tempSchemaPath);

		console.log("🔍 Validating generated schemas...");
		// Verify that the expected schemas were generated
		await validateGeneratedSchemas(zodOutputDir, models);

		console.log("✅ Integrated Zod schemas generated successfully");
	} catch (error) {
		console.error("❌ Zod generation error:", error);
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
		console.log("📝 Creating temporary schema for zod generation...");

		// Read the original schema content
		console.log(`🔍 Reading original schema... ${options.schemaPath}`);
		const originalSchemaContent = await readFile(options.schemaPath);
		console.log("📖 Original schema read successfully");
		console.log("📄 Schema path:", options.schemaPath);
		console.log(`📝 Schema content preview: ${originalSchemaContent.substring(0, 200)}...`);

		// Remove any existing flow generator to avoid conflicts
		const schemaWithoutFlowGenerator = originalSchemaContent.replace(/generator\s+flow\s*\{[\s\S]*?\}/g, "");
		console.log("🧹 Removed flow generator from schema");

		// Create a modified schema with only zod-prisma-types generator
		const zodGeneratorConfig = `
generator zod {
  provider = "zod-prisma-types"
  output   = "${zodOutputDir}"
}
`;

		// Add the zod generator to the schema
		const modifiedSchema = `${schemaWithoutFlowGenerator}\n${zodGeneratorConfig}`;
		console.log(`🔧 Modified schema preview: ${modifiedSchema.substring(0, 300)}...`);

		// Create temporary schema file
		const tempSchemaPath = join(dirname(options.schemaPath), ".temp-zod-schema.prisma");
		await writeFile(tempSchemaPath, modifiedSchema);
		console.log("📁 Temporary schema written to:", tempSchemaPath);
		console.log("📂 Temp schema dir:", dirname(options.schemaPath));

		// Temporary schema created for zod generation
		return tempSchemaPath;
	} catch (error) {
		console.error("❌ Failed to create temp schema:", error);
		throw new ZodGenerationError("Failed to create temporary schema file", error);
	}
}

/**
 * Executes the zod-prisma-types generator using Prisma CLI.
 */
async function executeZodPrismaTypes(schemaPath: string): Promise<void> {
	console.log(`🚀 Starting zod generation with schema: ${schemaPath}`);
	console.log(`🔍 Runtime check - Bun available: ${typeof Bun !== "undefined"}`);
	console.log(`🔍 Runtime check - Process version: ${process.version}`);

	// Check if we're running in Bun or Node.js context
	if (typeof Bun !== "undefined") {
		// Use Bun.spawn
		try {
			const proc = Bun.spawn(["bunx", "prisma", "generate", "--schema", schemaPath], {
				cwd: process.cwd(),
				env: {
					...process.env,
					NODE_PATH: `${process.cwd()}/node_modules`,
				},
				stdout: "pipe",
				stderr: "pipe",
			});

			// Wait for process to complete
			const exitCode = await proc.exited;

			// Read output
			const stdout = await new Response(proc.stdout).text();
			const stderr = await new Response(proc.stderr).text();

			console.log(`🔧 Zod generation process completed with code: ${exitCode}`);
			console.log(`📤 STDOUT: ${stdout}`);
			console.log(`📥 STDERR: ${stderr}`);

			if (exitCode !== 0) {
				throw new Error(`Zod generation failed with code ${exitCode}:\nSTDOUT: ${stdout}\nSTDERR: ${stderr}`);
			}
		} catch (error) {
			throw new Error(
				`Failed to execute zod generation process: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	} else {
		// Use Node.js spawn
		const { spawn } = await import("node:child_process");

		return new Promise((resolve, reject) => {
			const child = spawn("bunx", ["prisma", "generate", "--schema", schemaPath], {
				stdio: ["ignore", "pipe", "pipe"],
				shell: true,
				cwd: process.cwd(),
				env: {
					...process.env,
					NODE_PATH: `${process.cwd()}/node_modules`,
				},
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
				console.log(`🔧 Zod generation process completed with code: ${code}`);
				console.log(`📤 STDOUT: ${stdout}`);
				console.log(`📥 STDERR: ${stderr}`);

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
