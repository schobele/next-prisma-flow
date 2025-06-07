/**
 * GENERATOR VALIDATION TEST SUITE
 *
 * This test suite validates the generator output against the golden baseline implementation.
 * It ensures that generated code meets quality standards and maintains consistency.
 *
 * Test Categories:
 * 1. Structure Validation - File structure and organization
 * 2. Type Safety - TypeScript compilation and type correctness
 * 3. Functionality Testing - API and behavior validation
 * 4. Performance Benchmarking - Optimization and efficiency
 * 5. Integration Testing - Real-world usage scenarios
 */

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import * as ts from "typescript";

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const TEST_CONFIG = {
	// Paths
	generatorPath: join(process.cwd(), "dist", "index.js"),
	baselinePath: join(process.cwd(), "baseline", "todo-golden"),
	testOutputPath: join(process.cwd(), "test-output", "generated"),
	exampleProjectPath: join(process.cwd(), "examples", "todolist"),

	// Generated files to test
	requiredFiles: [
		"actions.ts",
		"atoms.ts",
		"hooks.ts",
		"types.ts",
		"routes.ts",
		"form-provider.tsx",
		"smart-form.ts",
		"namespace.ts",
		"index.ts",
	],

	// TypeScript configuration
	tsConfigPath: join(process.cwd(), "tsconfig.json"),

	// Performance thresholds
	performanceThresholds: {
		maxCompileTime: 5000, // 5 seconds
		maxFileSize: 100000, // 100KB
		maxComplexity: 50, // Cyclomatic complexity
	},
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate test code using the generator
 */
async function generateTestCode(): Promise<void> {
	try {
		// Ensure clean output directory
		execSync(`rm -rf ${TEST_CONFIG.testOutputPath}`, { stdio: "ignore" });
		execSync(`mkdir -p ${TEST_CONFIG.testOutputPath}`, { stdio: "ignore" });

		// Run the generator
		const result = execSync(`cd ${TEST_CONFIG.exampleProjectPath} && bunx prisma generate`, {
			encoding: "utf-8",
			timeout: 30000,
		});

		console.log("Generator output:", result);
	} catch (error) {
		console.error("Failed to generate test code:", error);
		throw error;
	}
}

/**
 * Read file content safely
 */
function readFileContent(filePath: string): string {
	try {
		return readFileSync(filePath, "utf-8");
	} catch (error) {
		throw new Error(`Failed to read file: ${filePath}`);
	}
}

/**
 * Check TypeScript compilation
 */
function compileTypeScript(content: string, fileName: string): ts.Diagnostic[] {
	const options: ts.CompilerOptions = {
		target: ts.ScriptTarget.ES2020,
		module: ts.ModuleKind.ESNext,
		strict: true,
		esModuleInterop: true,
		skipLibCheck: true,
		moduleResolution: ts.ModuleResolutionKind.NodeJs,
	};

	const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.ES2020, true);

	const program = ts.createProgram([fileName], options, {
		getSourceFile: (name) => (name === fileName ? sourceFile : undefined),
		writeFile: () => {},
		getCurrentDirectory: () => process.cwd(),
		getDirectories: () => [],
		fileExists: (name) => name === fileName,
		readFile: (name) => (name === fileName ? content : undefined),
		getCanonicalFileName: (name) => name,
		useCaseSensitiveFileNames: () => true,
		getNewLine: () => "\n",
	});

	return ts.getPreEmitDiagnostics(program);
}

/**
 * Calculate cyclomatic complexity (simplified)
 */
function calculateComplexity(content: string): number {
	const complexityKeywords = [
		"if",
		"else",
		"for",
		"while",
		"do",
		"switch",
		"case",
		"catch",
		"try",
		"&&",
		"||",
		"?",
		":",
	];

	let complexity = 1; // Base complexity

	for (const keyword of complexityKeywords) {
		const regex = new RegExp(`\\b${keyword}\\b`, "g");
		const matches = content.match(regex);
		if (matches) {
			complexity += matches.length;
		}
	}

	return complexity;
}

/**
 * Extract exports from TypeScript file
 */
function extractExports(content: string): string[] {
	const exportRegex = /export\s+(?:const|function|class|interface|type|enum)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
	const exports: string[] = [];
	let match: RegExpExecArray | null;

	// biome-ignore lint/suspicious/noAssignInExpressions: ...
	while ((match = exportRegex.exec(content)) !== null) {
		const exportName = match[1];
		if (exportName) {
			exports.push(exportName);
		}
	}

	return exports;
}

/**
 * Compare two arrays for similarity
 */
function compareArrays<T>(
	arr1: T[],
	arr2: T[],
): {
	similarity: number;
	missing: T[];
	extra: T[];
} {
	const set1 = new Set(arr1);
	const set2 = new Set(arr2);

	const intersection = new Set([...set1].filter((x) => set2.has(x)));
	const union = new Set([...set1, ...set2]);

	const similarity = intersection.size / union.size;
	const missing = [...set2].filter((x) => !set1.has(x));
	const extra = [...set1].filter((x) => !set2.has(x));

	return { similarity, missing, extra };
}

// ============================================================================
// TEST SETUP AND TEARDOWN
// ============================================================================

describe("Generator Validation Tests", () => {
	beforeAll(async () => {
		console.log("Setting up generator validation tests...");
		await generateTestCode();
	});

	afterAll(() => {
		console.log("Cleaning up generator validation tests...");
		// Keep test output for debugging
		// execSync(`rm -rf ${TEST_CONFIG.testOutputPath}`, { stdio: "ignore" });
	});

	// ============================================================================
	// STRUCTURE VALIDATION TESTS
	// ============================================================================

	describe("Structure Validation", () => {
		it("should generate all required files", () => {
			const generatedTodoPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo");

			for (const fileName of TEST_CONFIG.requiredFiles) {
				const filePath = join(generatedTodoPath, fileName);
				expect(existsSync(filePath)).toBe(true);
			}
		});

		it("should have consistent file structure with baseline", () => {
			const generatedTodoPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo");

			// Check that all baseline files have corresponding generated files
			for (const fileName of TEST_CONFIG.requiredFiles) {
				const baselinePath = join(TEST_CONFIG.baselinePath, fileName);
				const generatedPath = join(generatedTodoPath, fileName);

				if (existsSync(baselinePath)) {
					expect(existsSync(generatedPath)).toBe(true);
				}
			}
		});

		it("should generate valid file headers", () => {
			const generatedTodoPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo");

			for (const fileName of TEST_CONFIG.requiredFiles) {
				const filePath = join(generatedTodoPath, fileName);

				if (existsSync(filePath)) {
					const content = readFileContent(filePath);

					// Check for auto-generation notice
					expect(content).toContain("auto-generated");
					expect(content).toContain("Do not edit this file manually");
				}
			}
		});
	});

	// ============================================================================
	// TYPE SAFETY TESTS
	// ============================================================================

	describe("Type Safety", () => {
		it("should compile without TypeScript errors", () => {
			const generatedTodoPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo");

			for (const fileName of TEST_CONFIG.requiredFiles) {
				const filePath = join(generatedTodoPath, fileName);

				if (existsSync(filePath) && fileName.endsWith(".ts")) {
					const content = readFileContent(filePath);
					const diagnostics = compileTypeScript(content, fileName);

					// Filter out only errors (not warnings)
					const errors = diagnostics.filter((d) => d.category === ts.DiagnosticCategory.Error);

					if (errors.length > 0) {
						console.error(`TypeScript errors in ${fileName}:`, errors);
					}

					expect(errors.length).toBe(0);
				}
			}
		});

		it("should have proper type exports", () => {
			const generatedTypesPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo", "types.ts");
			const baselineTypesPath = join(TEST_CONFIG.baselinePath, "types.ts");

			if (existsSync(generatedTypesPath) && existsSync(baselineTypesPath)) {
				const generatedContent = readFileContent(generatedTypesPath);
				const baselineContent = readFileContent(baselineTypesPath);

				const generatedExports = extractExports(generatedContent);
				const baselineExports = extractExports(baselineContent);

				const comparison = compareArrays(generatedExports, baselineExports);

				// Should have at least 80% similarity in exports
				expect(comparison.similarity).toBeGreaterThan(0.8);

				// Check for essential types
				const essentialTypes = ["Todo", "TodoCreateInput", "TodoUpdateInput"];
				for (const type of essentialTypes) {
					expect(generatedExports).toContain(type);
				}
			}
		});

		it("should have consistent import/export patterns", () => {
			const generatedTodoPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo");

			for (const fileName of TEST_CONFIG.requiredFiles) {
				const filePath = join(generatedTodoPath, fileName);

				if (existsSync(filePath)) {
					const content = readFileContent(filePath);

					// Check for proper import syntax
					const imports = content.match(/^import\s+.*$/gm) || [];
					for (const importLine of imports) {
						// Should not have relative imports going too far up
						expect(importLine).not.toMatch(/\.\.\/(\.\.\/){3,}/);

						// Should use proper quote style
						expect(importLine).toMatch(/["'].*["']/);
					}

					// Check for proper export syntax
					const exports = content.match(/^export\s+.*$/gm) || [];
					expect(exports.length).toBeGreaterThan(0);
				}
			}
		});
	});

	// ============================================================================
	// FUNCTIONALITY TESTS
	// ============================================================================

	describe("Functionality Validation", () => {
		it("should have all required CRUD operations in actions", () => {
			const generatedActionsPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo", "actions.ts");

			if (existsSync(generatedActionsPath)) {
				const content = readFileContent(generatedActionsPath);

				const requiredFunctions = [
					"getAllTodos",
					"getTodo",
					"createTodo",
					"updateTodo",
					"deleteTodo",
					"createManyTodos",
					"deleteManyTodos",
				];

				for (const func of requiredFunctions) {
					expect(content).toContain(`export async function ${func}`);
				}

				// Should have proper error handling
				expect(content).toContain("try");
				expect(content).toContain("catch");

				// Should have cache invalidation
				expect(content).toContain("revalidateTag");
			}
		});

		it("should have comprehensive atoms structure", () => {
			const generatedAtomsPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo", "atoms.ts");

			if (existsSync(generatedAtomsPath)) {
				const content = readFileContent(generatedAtomsPath);

				const requiredAtoms = [
					"baseTodosAtom",
					"todoListAtom",
					"todosLoadingAtom",
					"optimisticCreateTodoAtom",
					"optimisticUpdateTodoAtom",
					"optimisticDeleteTodoAtom",
				];

				for (const atom of requiredAtoms) {
					expect(content).toContain(atom);
				}

				// Should use proper Jotai patterns
				expect(content).toContain("atomWithImmer");
				expect(content).toContain("atom(");
			}
		});

		it("should have unified hooks with proper return types", () => {
			const generatedHooksPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo", "hooks.ts");

			if (existsSync(generatedHooksPath)) {
				const content = readFileContent(generatedHooksPath);

				const requiredHooks = ["useTodos", "useTodo", "useCreateTodoForm", "useUpdateTodoForm"];

				for (const hook of requiredHooks) {
					expect(content).toContain(`export function ${hook}`);
				}

				// Should have proper TypeScript interfaces
				expect(content).toContain("interface UseTodosResult");
				expect(content).toContain("interface UseTodoResult");
			}
		});

		it("should have proper API routes", () => {
			const generatedRoutesPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo", "routes.ts");

			if (existsSync(generatedRoutesPath)) {
				const content = readFileContent(generatedRoutesPath);

				const requiredMethods = ["GET", "POST", "PATCH", "DELETE"];

				for (const method of requiredMethods) {
					expect(content).toContain(`async function ${method}`);
				}

				// Should have proper error handling
				expect(content).toContain("NextResponse.json");
				expect(content).toContain("status:");
			}
		});
	});

	// ============================================================================
	// PERFORMANCE TESTS
	// ============================================================================

	describe("Performance Validation", () => {
		it("should have reasonable file sizes", () => {
			const generatedTodoPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo");

			for (const fileName of TEST_CONFIG.requiredFiles) {
				const filePath = join(generatedTodoPath, fileName);

				if (existsSync(filePath)) {
					const stats = require("node:fs").statSync(filePath);
					expect(stats.size).toBeLessThan(TEST_CONFIG.performanceThresholds.maxFileSize);
				}
			}
		});

		it("should have reasonable complexity", () => {
			const generatedTodoPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo");

			for (const fileName of TEST_CONFIG.requiredFiles) {
				const filePath = join(generatedTodoPath, fileName);

				if (existsSync(filePath) && fileName.endsWith(".ts")) {
					const content = readFileContent(filePath);
					const complexity = calculateComplexity(content);

					expect(complexity).toBeLessThan(TEST_CONFIG.performanceThresholds.maxComplexity);
				}
			}
		});

		it("should compile within reasonable time", () => {
			const startTime = Date.now();

			const generatedTodoPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo");

			for (const fileName of TEST_CONFIG.requiredFiles) {
				const filePath = join(generatedTodoPath, fileName);

				if (existsSync(filePath) && fileName.endsWith(".ts")) {
					const content = readFileContent(filePath);
					compileTypeScript(content, fileName);
				}
			}

			const compileTime = Date.now() - startTime;
			expect(compileTime).toBeLessThan(TEST_CONFIG.performanceThresholds.maxCompileTime);
		});
	});

	// ============================================================================
	// INTEGRATION TESTS
	// ============================================================================

	describe("Integration Validation", () => {
		it("should work with real Prisma schema", async () => {
			// This test verifies that the generated code works with an actual Prisma setup
			const schemaPath = join(TEST_CONFIG.exampleProjectPath, "prisma", "schema.prisma");
			expect(existsSync(schemaPath)).toBe(true);

			// Verify that the generator config is valid
			const schemaContent = readFileContent(schemaPath);
			expect(schemaContent).toContain("generator flow");
			expect(schemaContent).toContain('provider = "next-prisma-flow"');
		});

		it("should have proper namespace exports", () => {
			const generatedIndexPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "index.ts");

			if (existsSync(generatedIndexPath)) {
				const content = readFileContent(generatedIndexPath);

				// Should export model namespaces
				expect(content).toContain("todos");
				expect(content).toMatch(/todos\s*:\s*\{/);

				// Should have nested exports
				expect(content).toContain("hooks:");
				expect(content).toContain("actions:");
				expect(content).toContain("atoms:");
				expect(content).toContain("types:");
			}
		});

		it("should be compatible with Next.js App Router", () => {
			const generatedRoutesPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo", "routes.ts");

			if (existsSync(generatedRoutesPath)) {
				const content = readFileContent(generatedRoutesPath);

				// Should use Next.js 13+ patterns
				expect(content).toContain("NextRequest");
				expect(content).toContain("NextResponse");

				// Should not use old patterns
				expect(content).not.toContain("req.body");
				expect(content).not.toContain("res.json");
			}
		});

		it("should work with React 18+ patterns", () => {
			const generatedHooksPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo", "hooks.ts");

			if (existsSync(generatedHooksPath)) {
				const content = readFileContent(generatedHooksPath);

				// Should use modern React patterns
				expect(content).toContain("useCallback");
				expect(content).toContain("useMemo");

				// Should have proper dependency arrays
				expect(content).toMatch(/useCallback\([^,]+,\s*\[[^\]]*\]/);
			}
		});
	});

	// ============================================================================
	// QUALITY ASSURANCE TESTS
	// ============================================================================

	describe("Quality Assurance", () => {
		it("should have consistent code style", () => {
			const generatedTodoPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo");

			for (const fileName of TEST_CONFIG.requiredFiles) {
				const filePath = join(generatedTodoPath, fileName);

				if (existsSync(filePath)) {
					const content = readFileContent(filePath);

					// Should use consistent indentation
					const lines = content.split("\n");
					const indentedLines = lines.filter((line) => line.match(/^\s+/));

					if (indentedLines.length > 0) {
						// Check for consistent indentation (2 or 4 spaces)
						const firstIndent = indentedLines[0].match(/^(\s+)/)?.[1];
						if (firstIndent) {
							const indentLength = firstIndent.length;
							expect([2, 4]).toContain(indentLength);
						}
					}

					// Should not have trailing whitespace
					const trailingWhitespace = lines.filter((line) => line.match(/\s+$/));
					expect(trailingWhitespace.length).toBe(0);
				}
			}
		});

		it("should have proper JSDoc comments", () => {
			const generatedActionsPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo", "actions.ts");

			if (existsSync(generatedActionsPath)) {
				const content = readFileContent(generatedActionsPath);

				// Should have function documentation
				const functionMatches = content.match(/export async function \w+/g) || [];
				const jsdocMatches = content.match(/\/\*\*[\s\S]*?\*\//g) || [];

				// Should have at least some documentation
				expect(jsdocMatches.length).toBeGreaterThan(0);
			}
		});

		it("should follow naming conventions", () => {
			const generatedTodoPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo");

			for (const fileName of TEST_CONFIG.requiredFiles) {
				const filePath = join(generatedTodoPath, fileName);

				if (existsSync(filePath)) {
					const content = readFileContent(filePath);

					// Function names should be camelCase
					const functionMatches = content.match(/export (?:async )?function (\w+)/g) || [];
					for (const match of functionMatches) {
						const name = match.match(/function (\w+)/)?.[1];
						if (name) {
							expect(name).toMatch(/^[a-z][a-zA-Z0-9]*$/);
						}
					}

					// Type names should be PascalCase
					const typeMatches = content.match(/export (?:type|interface) (\w+)/g) || [];
					for (const match of typeMatches) {
						const name = match.match(/(?:type|interface) (\w+)/)?.[1];
						if (name) {
							expect(name).toMatch(/^[A-Z][a-zA-Z0-9]*$/);
						}
					}
				}
			}
		});
	});
});

// ============================================================================
// BASELINE COMPARISON TESTS
// ============================================================================

describe("Baseline Comparison", () => {
	it("should match baseline export signatures", () => {
		const generatedActionsPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo", "actions.ts");
		const baselineActionsPath = join(TEST_CONFIG.baselinePath, "actions.ts");

		if (existsSync(generatedActionsPath) && existsSync(baselineActionsPath)) {
			const generatedContent = readFileContent(generatedActionsPath);
			const baselineContent = readFileContent(baselineActionsPath);

			const generatedExports = extractExports(generatedContent);
			const baselineExports = extractExports(baselineContent);

			const comparison = compareArrays(generatedExports, baselineExports);

			// Should have high similarity
			expect(comparison.similarity).toBeGreaterThan(0.7);

			if (comparison.missing.length > 0) {
				console.warn("Missing exports compared to baseline:", comparison.missing);
			}

			if (comparison.extra.length > 0) {
				console.warn("Extra exports compared to baseline:", comparison.extra);
			}
		}
	});

	it("should maintain baseline quality standards", () => {
		// This is a meta-test that ensures the generated code meets the same
		// quality standards as our golden baseline

		const generatedTodoPath = join(TEST_CONFIG.exampleProjectPath, "generated", "flow", "todo");
		const requiredQualityMetrics = {
			hasErrorHandling: false,
			hasTypeAnnotations: false,
			hasOptimisticUpdates: false,
			hasCacheInvalidation: false,
			hasValidation: false,
		};

		// Check actions.ts for quality metrics
		const actionsPath = join(generatedTodoPath, "actions.ts");
		if (existsSync(actionsPath)) {
			const content = readFileContent(actionsPath);

			if (content.includes("try") && content.includes("catch")) {
				requiredQualityMetrics.hasErrorHandling = true;
			}

			if (content.includes(": Promise<") || content.includes(": string")) {
				requiredQualityMetrics.hasTypeAnnotations = true;
			}

			if (content.includes("revalidateTag")) {
				requiredQualityMetrics.hasCacheInvalidation = true;
			}

			if (content.includes("Schema.parse")) {
				requiredQualityMetrics.hasValidation = true;
			}
		}

		// Check atoms.ts for optimistic updates
		const atomsPath = join(generatedTodoPath, "atoms.ts");
		if (existsSync(atomsPath)) {
			const content = readFileContent(atomsPath);

			if (content.includes("optimistic")) {
				requiredQualityMetrics.hasOptimisticUpdates = true;
			}
		}

		// Verify all quality metrics are met
		for (const [metric, value] of Object.entries(requiredQualityMetrics)) {
			expect(value).toBe(true);
		}
	});
});

/**
 * This test suite provides comprehensive validation of the generator output:
 *
 * STRUCTURE VALIDATION:
 * - File existence and organization
 * - Consistent structure with baseline
 * - Proper file headers
 *
 * TYPE SAFETY:
 * - TypeScript compilation without errors
 * - Proper type exports and imports
 * - Consistent import/export patterns
 *
 * FUNCTIONALITY:
 * - Required CRUD operations
 * - Comprehensive atoms structure
 * - Unified hooks with proper types
 * - Proper API routes
 *
 * PERFORMANCE:
 * - Reasonable file sizes
 * - Low complexity
 * - Fast compilation
 *
 * INTEGRATION:
 * - Compatibility with Prisma
 * - Next.js App Router patterns
 * - React 18+ compatibility
 *
 * QUALITY ASSURANCE:
 * - Consistent code style
 * - Proper documentation
 * - Naming conventions
 *
 * BASELINE COMPARISON:
 * - Export signature matching
 * - Quality standards maintenance
 *
 * This ensures that generated code maintains high quality and consistency
 * with the manually crafted golden baseline implementation.
 */
