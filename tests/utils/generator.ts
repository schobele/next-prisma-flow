import { dirname, resolve } from "node:path";
import { TEST_CONFIG } from "../config";

export interface GeneratedCode {
	files: Map<string, string>;
	outputDir: string;
	metadata: {
		generationTime: number;
		errors: string[];
		warnings: string[];
	};
}

export interface GenerationOptions {
	schema?: string;
	config?: Record<string, any>;
	outputDir?: string;
	cleanOutput?: boolean;
}

/**
 * Generator test utilities for running and validating code generation
 */
export class GeneratorTestRunner {
	private static instance: GeneratorTestRunner;
	private cache = new Map<string, GeneratedCode>();

	static getInstance(): GeneratorTestRunner {
		if (!GeneratorTestRunner.instance) {
			GeneratorTestRunner.instance = new GeneratorTestRunner();
		}
		return GeneratorTestRunner.instance;
	}

	/**
	 * Generate code using the current generator
	 */
	async generateCode(options: GenerationOptions & { testName?: string } = {}): Promise<GeneratedCode> {
		const cacheKey = this.computeCacheKey(options);

		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey) as GeneratedCode;
		}

		const startTime = Date.now();
		const outputDir = options.outputDir || (await this.createTempOutputDir(options.testName));

		try {
			// Clean output directory if requested
			if (options.cleanOutput !== false) {
				await this.cleanDirectory(outputDir);
			}

			// Write schema file
			const schemaPath = resolve(outputDir, "schema.prisma");
			const schema = options.schema || (await Bun.file(TEST_CONFIG.generator.testSchema).text());
			await Bun.write(schemaPath, schema);

			// Run prisma generate
			const result = await this.runPrismaGenerate(schemaPath);

			if (result.exitCode !== 0) {
				throw new Error(`Generation failed: ${result.stderr}`);
			}

			// Read generated files
			const files = await this.readGeneratedFiles(outputDir);

			const generatedCode: GeneratedCode = {
				files,
				outputDir,
				metadata: {
					generationTime: Date.now() - startTime,
					errors: result.stderr ? [result.stderr] : [],
					warnings: result.stdout ? [result.stdout] : [],
				},
			};

			this.cache.set(cacheKey, generatedCode);
			return generatedCode;
		} catch (error) {
			throw new Error(`Code generation failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	/**
	 * Generate code for a specific model with template substitution
	 */
	async generateForModel(modelName: string, schema?: string): Promise<GeneratedCode> {
		const modelSchema = schema || this.createModelSchema(modelName);
		return this.generateCode({ schema: modelSchema });
	}

	/**
	 * Run Prisma generate with our actual generator
	 */
	private async runPrismaGenerate(schemaPath: string): Promise<{
		exitCode: number;
		stdout: string;
		stderr: string;
	}> {
		const generatorPath = resolve(__dirname, "../../dist/index.js");

		// Update the schema to point to our built generator
		await this.updateSchemaGeneratorPath(schemaPath, generatorPath);

		try {
			const proc = Bun.spawn(["bunx", "prisma", "generate", "--schema", schemaPath], {
				cwd: dirname(schemaPath),
				env: {
					...process.env,
					// Ensure Node can find our generator
					NODE_PATH: dirname(generatorPath),
				},
				stdout: "pipe",
				stderr: "pipe",
			});

			// Wait for process to complete
			const exitCode = await proc.exited;

			// Read output
			const stdout = await new Response(proc.stdout).text();
			const stderr = await new Response(proc.stderr).text();

			return {
				exitCode,
				stdout,
				stderr,
			};
		} catch (error) {
			return {
				exitCode: 1,
				stdout: "",
				stderr: error instanceof Error ? error.message : String(error),
			};
		}
	}

	/**
	 * Update schema file to use our built generator
	 */
	private async updateSchemaGeneratorPath(schemaPath: string, generatorPath: string): Promise<void> {
		const schemaContent = await Bun.file(schemaPath).text();
		const updatedSchema = schemaContent.replace(/provider\s*=\s*"next-prisma-flow"/, `provider = "${generatorPath}"`);
		await Bun.write(schemaPath, updatedSchema);
	}

	/**
	 * Read all generated files from output directory
	 */
	private async readGeneratedFiles(outputDir: string): Promise<Map<string, string>> {
		const files = new Map<string, string>();
		const flowDir = resolve(outputDir, "generated/flow");

		if (!(await this.directoryExists(flowDir))) {
			return files;
		}

		const entries = await this.readDirectoryRecursive(flowDir);

		for (const entry of entries) {
			if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
				const { readFile } = await import("node:fs/promises");
				const content = await readFile(entry, "utf-8");
				const relativePath = entry.replace(`${flowDir}/`, "");
				files.set(relativePath, content);
			}
		}

		return files;
	}

	/**
	 * Recursively read directory contents
	 */
	private async readDirectoryRecursive(dir: string): Promise<string[]> {
		const entries: string[] = [];

		try {
			const { readdir, stat } = await import("node:fs/promises");

			const items = await readdir(dir, { withFileTypes: true });

			for (const item of items) {
				const fullPath = resolve(dir, item.name);

				if (item.isDirectory()) {
					const subEntries = await this.readDirectoryRecursive(fullPath);
					entries.push(...subEntries);
				} else {
					entries.push(fullPath);
				}
			}
		} catch (error) {
			// Directory might not exist or be empty
		}

		return entries;
	}

	/**
	 * Create a temporary output directory
	 */
	private async createTempOutputDir(testName?: string): Promise<string> {
		const dirName = testName ? `test-${testName}` : `test-${Date.now()}`;
		const tempDir = resolve(TEST_CONFIG.generated.root, "../temp", dirName);
		await Bun.write(resolve(tempDir, ".gitkeep"), ""); // Creates directory
		return tempDir;
	}

	/**
	 * Clean directory contents
	 */
	private async cleanDirectory(dir: string): Promise<void> {
		try {
			//const result = await Bun.$`rm -rf ${dir}/* 2>/dev/null || true`;
		} catch (error) {
			// Directory might not exist, that's okay
		}
	}

	/**
	 * Check if directory exists
	 */
	private async directoryExists(dir: string): Promise<boolean> {
		try {
			const { stat } = await import("node:fs/promises");
			const statResult = await stat(dir);
			return statResult.isDirectory();
		} catch {
			return false;
		}
	}

	/**
	 * Create a basic model schema for testing
	 */
	private createModelSchema(modelName: string): string {
		return `
generator client {
  provider = "prisma-client-js"
}

generator flow {
  provider = "next-prisma-flow"
  output   = "./generated/flow"
  models   = ["${modelName}"]
}

datasource db {
  provider = "sqlite"
  url      = "file:./test.db"
}

model ${modelName} {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
    `.trim();
	}

	/**
	 * Compute cache key for generation options
	 */
	private computeCacheKey(options: GenerationOptions): string {
		const key = {
			schema: options.schema || "default",
			config: options.config || {},
			outputDir: options.outputDir || "temp",
		};
		return Buffer.from(JSON.stringify(key)).toString("base64");
	}

	/**
	 * Clear generation cache
	 */
	clearCache(): void {
		this.cache.clear();
	}

	/**
	 * Clean up specific test directory
	 */
	async cleanupTestDir(testName: string): Promise<void> {
		const testDir = resolve(TEST_CONFIG.generated.root, "../temp", `test-${testName}`);
		try {
			const { rm } = await import("node:fs/promises");
			await rm(testDir, { recursive: true, force: true });
			console.log(`🧹 Cleaned up test directory: ${testDir}`);
		} catch (error) {
			// Directory might not exist, that's okay
		}
	}
}
