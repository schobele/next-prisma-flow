import { spawn } from "node:child_process";
import { promises as fs } from "node:fs";
import { resolve, dirname } from "node:path";
import { TEST_CONFIG } from "../config";

export interface CompilationResult {
	success: boolean;
	errors: TypeScriptError[];
	warnings: TypeScriptError[];
	diagnostics: TypeScriptDiagnostic[];
	performance: {
		compilationTime: number;
		memoryUsage?: number;
	};
}

export interface TypeScriptError {
	file: string;
	line: number;
	column: number;
	code: number;
	message: string;
	severity: "error" | "warning" | "info";
	category: string;
}

export interface TypeScriptDiagnostic {
	file: string;
	messageText: string;
	category: "error" | "warning" | "suggestion" | "message";
	code: number;
	start?: number;
	length?: number;
}

export interface TypeCheckOptions {
	strict?: boolean;
	noImplicitAny?: boolean;
	strictNullChecks?: boolean;
	exactOptionalPropertyTypes?: boolean;
	noUncheckedIndexedAccess?: boolean;
	noImplicitReturns?: boolean;
	skipLibCheck?: boolean;
	isolatedModules?: boolean;
}

/**
 * Advanced TypeScript compiler integration for validation
 */
export class TypeScriptCompiler {
	private tempDir: string;
	private initialized = false;

	constructor(tempDir?: string) {
		this.tempDir = tempDir || resolve(__dirname, "../temp/ts-compilation");
	}

	/**
	 * Initialize the compilation environment
	 */
	async initialize(): Promise<void> {
		if (this.initialized) return;

		await fs.mkdir(this.tempDir, { recursive: true });
		await this.createBaseTsConfig();
		this.initialized = true;
	}

	/**
	 * Compile TypeScript files with specified options
	 */
	async compile(files: Map<string, string>, options: TypeCheckOptions = {}): Promise<CompilationResult> {
		await this.initialize();

		const startTime = Date.now();

		try {
			// Write files to temp directory
			await this.writeFiles(files);

			// Create tsconfig with options
			const tsConfigPath = await this.createTsConfig(options);

			// Run TypeScript compiler
			const result = await this.runTypeScriptCompiler(tsConfigPath);

			// Parse compiler output
			const parsed = this.parseCompilerOutput(result.stdout, result.stderr);

			return {
				success: result.exitCode === 0 && parsed.errors.length === 0,
				errors: parsed.errors,
				warnings: parsed.warnings,
				diagnostics: parsed.diagnostics,
				performance: {
					compilationTime: Date.now() - startTime,
				},
			};
		} catch (error) {
			return {
				success: false,
				errors: [
					{
						file: "compiler",
						line: 0,
						column: 0,
						code: -1,
						message: error instanceof Error ? error.message : String(error),
						severity: "error",
						category: "system",
					},
				],
				warnings: [],
				diagnostics: [],
				performance: {
					compilationTime: Date.now() - startTime,
				},
			};
		}
	}

	/**
	 * Check specific type compatibility between generated and baseline
	 */
	async checkTypeCompatibility(
		generated: Map<string, string>,
		baseline: Map<string, string>,
	): Promise<CompilationResult> {
		// Combine files for cross-compatibility checking
		const combinedFiles = new Map([...baseline, ...generated]);

		// Use strict compilation options for compatibility testing
		const strictOptions: TypeCheckOptions = {
			strict: true,
			noImplicitAny: true,
			strictNullChecks: true,
			exactOptionalPropertyTypes: true,
			noUncheckedIndexedAccess: true,
			noImplicitReturns: true,
		};

		return this.compile(combinedFiles, strictOptions);
	}

	/**
	 * Validate that generated types can be used interchangeably with baseline
	 */
	async validateTypeInteroperability(
		generatedTypes: string,
		baselineTypes: string,
	): Promise<{ compatible: boolean; issues: string[] }> {
		// Create test files that try to use types interchangeably
		const testCode = this.generateInteroperabilityTest(generatedTypes, baselineTypes);

		const testFiles = new Map([
			["baseline-types.ts", baselineTypes],
			["generated-types.ts", generatedTypes],
			["interoperability-test.ts", testCode],
		]);

		const result = await this.compile(testFiles, { strict: true });

		return {
			compatible: result.success,
			issues: result.errors.map((e) => `${e.file}:${e.line}:${e.column} - ${e.message}`),
		};
	}

	/**
	 * Extract type information from compiled code
	 */
	async extractTypeInformation(files: Map<string, string>): Promise<TypeInformation> {
		const tempFiles = await this.writeFiles(files);

		// Use TypeScript compiler API to extract type information
		const typeInfo = await this.runTypeExtraction(tempFiles);

		return typeInfo;
	}

	/**
	 * Write files to temporary directory
	 */
	private async writeFiles(files: Map<string, string>): Promise<string[]> {
		const writtenFiles: string[] = [];

		for (const [fileName, content] of files) {
			const filePath = resolve(this.tempDir, fileName);
			const fileDir = dirname(filePath);

			// Ensure directory exists
			await fs.mkdir(fileDir, { recursive: true });

			// Write file
			await fs.writeFile(filePath, content, "utf-8");
			writtenFiles.push(filePath);
		}

		return writtenFiles;
	}

	/**
	 * Create base tsconfig.json
	 */
	private async createBaseTsConfig(): Promise<void> {
		const tsConfig = {
			compilerOptions: {
				target: "ES2020",
				module: "ESNext",
				moduleResolution: "bundler",
				allowImportingTsExtensions: true,
				noEmit: true,
				strict: true,
				skipLibCheck: true,
				jsx: "react-jsx",
				baseUrl: ".",
				paths: {
					"@/*": ["./src/*"],
				},
				types: ["node", "react"],
			},
			include: ["**/*.ts", "**/*.tsx"],
			exclude: ["node_modules", "dist"],
		};

		const configPath = resolve(this.tempDir, "tsconfig.base.json");
		await fs.writeFile(configPath, JSON.stringify(tsConfig, null, 2));
	}

	/**
	 * Create tsconfig with specific options
	 */
	private async createTsConfig(options: TypeCheckOptions): Promise<string> {
		const baseConfig = JSON.parse(await fs.readFile(resolve(this.tempDir, "tsconfig.base.json"), "utf-8"));

		// Merge with provided options
		baseConfig.compilerOptions = {
			...baseConfig.compilerOptions,
			...options,
		};

		const configPath = resolve(this.tempDir, "tsconfig.json");
		await fs.writeFile(configPath, JSON.stringify(baseConfig, null, 2));

		return configPath;
	}

	/**
	 * Run TypeScript compiler
	 */
	private async runTypeScriptCompiler(tsConfigPath: string): Promise<{
		exitCode: number;
		stdout: string;
		stderr: string;
	}> {
		return new Promise((resolve, reject) => {
			const child = spawn("npx", ["tsc", "--project", tsConfigPath, "--pretty", "false"], {
				stdio: ["pipe", "pipe", "pipe"],
				cwd: dirname(tsConfigPath),
			});

			let stdout = "";
			let stderr = "";

			child.stdout?.on("data", (data) => {
				stdout += data.toString();
			});

			child.stderr?.on("data", (data) => {
				stderr += data.toString();
			});

			child.on("close", (exitCode) => {
				resolve({
					exitCode: exitCode || 0,
					stdout,
					stderr,
				});
			});

			child.on("error", reject);

			// Set timeout
			setTimeout(() => {
				child.kill();
				reject(new Error("TypeScript compilation timeout"));
			}, TEST_CONFIG.timeouts.compilation);
		});
	}

	/**
	 * Parse TypeScript compiler output
	 */
	private parseCompilerOutput(
		stdout: string,
		stderr: string,
	): {
		errors: TypeScriptError[];
		warnings: TypeScriptError[];
		diagnostics: TypeScriptDiagnostic[];
	} {
		const errors: TypeScriptError[] = [];
		const warnings: TypeScriptError[] = [];
		const diagnostics: TypeScriptDiagnostic[] = [];

		// Parse stdout for TypeScript diagnostics
		const lines = stdout.split("\n").filter((line) => line.trim());

		for (const line of lines) {
			const parsed = this.parseCompilerLine(line);
			if (parsed) {
				if (parsed.severity === "error") {
					errors.push(parsed);
				} else if (parsed.severity === "warning") {
					warnings.push(parsed);
				}

				diagnostics.push({
					file: parsed.file,
					messageText: parsed.message,
					category: parsed.severity as "error" | "warning" | "message" | "suggestion",
					code: parsed.code,
				});
			}
		}

		return { errors, warnings, diagnostics };
	}

	/**
	 * Parse individual compiler output line
	 */
	private parseCompilerLine(line: string): TypeScriptError | null {
		// Parse format: file.ts(line,col): error TSnnnn: message
		const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+TS(\d+):\s+(.+)$/);

		if (match) {
			const [, file, lineStr, colStr, severity, codeStr, message] = match;

			return {
				file: file?.replace(`${this.tempDir}/`, "") || "",
				line: Number.parseInt(lineStr || "0", 10),
				column: Number.parseInt(colStr || "0", 10),
				code: Number.parseInt(codeStr || "0", 10),
				message: message || "",
				severity: (severity as "error" | "warning") || "error",
				category: this.categorizeError(Number.parseInt(codeStr || "0", 10)),
			};
		}

		return null;
	}

	/**
	 * Categorize TypeScript error by code
	 */
	private categorizeError(code: number): string {
		const categories: Record<number, string> = {
			2339: "property-missing",
			2345: "argument-type",
			2554: "argument-count",

			// Import/Export errors
			2307: "module-not-found",
			2306: "not-module",
			2348: "import-type",

			// Declaration errors
			2300: "duplicate-identifier",
			2304: "name-not-found",
			2394: "overload-signature",

			// Async/Promise errors
			2322: "promise-type",
			2571: "async-iteration",
		};

		return categories[code] || "other";
	}

	/**
	 * Generate interoperability test code
	 */
	private generateInteroperabilityTest(generatedTypes: string, baselineTypes: string): string {
		return `
// Import types from both files
import * as Generated from './generated-types';
import * as Baseline from './baseline-types';

// Test type compatibility
function testTypeCompatibility() {
  // Test if generated types can be assigned to baseline types
  const testGeneratedToBaseline = (generated: Generated.Todo): Baseline.Todo => {
    return generated;
  };
  
  // Test if baseline types can be assigned to generated types  
  const testBaselineToGenerated = (baseline: Baseline.Todo): Generated.Todo => {
    return baseline;
  };
  
  // Test input types
  const testCreateInputCompatibility = (
    generatedInput: Generated.TodoCreateInput
  ): Baseline.TodoCreateInput => {
    return generatedInput;
  };
  
  // Test function signatures
  const testFunctionCompatibility = (
    generatedCreate: typeof Generated.createTodo,
    baselineCreate: typeof Baseline.createTodo
  ) => {
    // Should be able to use functions interchangeably
    const genAsBase: typeof baselineCreate = generatedCreate;
    const baseAsGen: typeof generatedCreate = baselineCreate;
  };
}
    `;
	}

	/**
	 * Run type extraction using TypeScript compiler API
	 */
	private async runTypeExtraction(files: string[]): Promise<TypeInformation> {
		// This would use the TypeScript compiler API to extract detailed type information
		// For now, return a placeholder structure
		return {
			types: [],
			functions: [],
			interfaces: [],
			enums: [],
		};
	}

	/**
	 * Cleanup temporary files
	 */
	async cleanup(): Promise<void> {
		try {
			await fs.rm(this.tempDir, { recursive: true, force: true });
		} catch {
			// Ignore cleanup errors
		}
	}
}

export interface TypeInformation {
	types: Array<{
		name: string;
		definition: string;
		exported: boolean;
	}>;
	functions: Array<{
		name: string;
		signature: string;
		exported: boolean;
	}>;
	interfaces: Array<{
		name: string;
		properties: Array<{
			name: string;
			type: string;
			optional: boolean;
		}>;
		exported: boolean;
	}>;
	enums: Array<{
		name: string;
		values: string[];
		exported: boolean;
	}>;
}
