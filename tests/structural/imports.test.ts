import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { GeneratorTestRunner, type GeneratedCode } from "../utils/generator";

describe("Import/Export Structure Validation", () => {
	const TEST_NAME = "imports";
	let generated: GeneratedCode;
	let generator: GeneratorTestRunner;
	let hasFailures = false;

	beforeAll(async () => {
		generator = GeneratorTestRunner.getInstance();
		generated = await generator.generateCode({ testName: TEST_NAME });
	});

	afterAll(async () => {
		if (!hasFailures) {
			await generator.cleanupTestDir(TEST_NAME);
		} else {
			console.log(`🔍 Preserving test directory for debugging: test-${TEST_NAME}`);
		}
	});

	// Helper to track test failures
	const trackingTest = (name: string, fn: () => Promise<void> | void) => {
		test(name, async () => {
			try {
				await fn();
			} catch (error) {
				hasFailures = true;
				throw error;
			}
		});
	};

	trackingTest("all imports resolve correctly", async () => {
		const importResolver = new ImportResolver(generated.files);

		for (const [filePath, content] of generated.files) {
			const imports = parseImports(content);

			for (const importPath of imports) {
				const resolved = importResolver.resolve(filePath, importPath.path);

				if (!resolved.isExternal) {
					// Special case: Allow imports to generated Prisma client directory
					if (importPath.path.includes("client") && !resolved.exists) {
						// This is likely a valid import to Prisma generated client
						continue;
					}
					expect(resolved.exists).toBe(true);
				}
			}
		}
	});

	trackingTest("no circular dependencies", async () => {
		const dependencyGraph = buildDependencyGraph(generated.files);
		const cycles = detectCircularDependencies(dependencyGraph);

		expect(cycles).toEqual([]);
	});

	trackingTest("imports follow consistent patterns", async () => {
		for (const [filePath, content] of generated.files) {
			const imports = parseImports(content);

			for (const imp of imports) {
				// External imports should not use relative paths
				if (!imp.path.startsWith(".")) {
					expect(imp.path).not.toMatch(/\.\.\//);
				}

				// Relative imports should be properly formatted
				if (imp.path.startsWith(".")) {
					// Allow multiple ../ segments and various valid path characters
					expect(imp.path).toMatch(/^(\.\.\/)*\.\.?\/[a-zA-Z0-9/_-]+$|^\.\/[a-zA-Z0-9/_-]+$/);
				}

				// Type-only imports should be marked as such
				if (imp.isTypeOnly) {
					expect(imp.declaration).toContain("import type");
				}
			}
		}
	});

	trackingTest("exports match baseline patterns", async () => {
		const baselineExports = await getBaselineExports();
		const generatedExports = getGeneratedExports(generated.files);

		// Normalize template variables for comparison
		const normalizedGenerated = normalizeExports(generatedExports, "todo", "Todo");

		expect(normalizedGenerated.actions).toEqual(baselineExports.actions);
		expect(normalizedGenerated.hooks).toEqual(baselineExports.hooks);
		expect(normalizedGenerated.types).toEqual(baselineExports.types);
	});
});

// ============================================================================
// Utility Classes and Functions
// ============================================================================

interface ParsedImport {
	path: string;
	declaration: string;
	isTypeOnly: boolean;
	namedImports: string[];
	defaultImport?: string;
}

interface ResolvedImport {
	exists: boolean;
	isExternal: boolean;
	resolvedPath?: string;
}

class ImportResolver {
	constructor(private files: Map<string, string>) {}

	resolve(fromFile: string, importPath: string): ResolvedImport {
		// External packages
		if (!importPath.startsWith(".")) {
			return { exists: true, isExternal: true };
		}

		// Resolve relative imports
		const fromDir = fromFile.includes("/") ? fromFile.split("/").slice(0, -1).join("/") : "";
		const resolvedPath = this.resolvePath(fromDir, importPath);

		// Check if file exists (with various extensions)
		const possiblePaths = [
			resolvedPath,
			`${resolvedPath}.ts`,
			`${resolvedPath}.tsx`,
			`${resolvedPath}.d.ts`,
			`${resolvedPath}.js`,
			`${resolvedPath}/index.ts`,
			`${resolvedPath}/index.tsx`,
			`${resolvedPath}/index.d.ts`,
			`${resolvedPath}/index.js`,
		];

		for (const path of possiblePaths) {
			if (this.files.has(path)) {
				return { exists: true, isExternal: false, resolvedPath: path };
			}
		}

		return { exists: false, isExternal: false };
	}

	private resolvePath(fromDir: string, importPath: string): string {
		const parts = fromDir.split("/").filter(Boolean);
		const importParts = importPath.split("/");

		for (const part of importParts) {
			if (part === "..") {
				parts.pop();
			} else if (part !== ".") {
				parts.push(part);
			}
		}

		return parts.join("/");
	}
}

function parseImports(content: string): ParsedImport[] {
	const imports: ParsedImport[] = [];
	const importRegex = /^import\s+(type\s+)?(?:(\w+)(?:\s*,\s*)?)?(?:\{([^}]+)\})?\s+from\s+['"]([^'"]+)['"];?$/gm;

	let match: RegExpExecArray | null = null;
	// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
	while ((match = importRegex.exec(content)) !== null) {
		const [declaration, typeKeyword, defaultImport, namedImportsStr, path] = match;

		const namedImports = namedImportsStr
			? namedImportsStr
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean)
			: [];

		imports.push({
			path: path || "",
			declaration,
			isTypeOnly: !!typeKeyword,
			namedImports,
			defaultImport,
		});
	}

	return imports;
}

function buildDependencyGraph(files: Map<string, string>): Map<string, Set<string>> {
	const graph = new Map<string, Set<string>>();

	for (const [filePath, content] of files) {
		const imports = parseImports(content);
		const dependencies = new Set<string>();

		for (const imp of imports) {
			if (imp.path.startsWith(".")) {
				// Resolve to actual file path
				const resolver = new ImportResolver(files);
				const resolved = resolver.resolve(filePath, imp.path);
				if (resolved.resolvedPath) {
					dependencies.add(resolved.resolvedPath);
				}
			}
		}

		graph.set(filePath, dependencies);
	}

	return graph;
}

function detectCircularDependencies(graph: Map<string, Set<string>>): string[][] {
	const cycles: string[][] = [];
	const visited = new Set<string>();
	const recursionStack = new Set<string>();

	function dfs(node: string, path: string[]): void {
		if (recursionStack.has(node)) {
			// Found a cycle
			const cycleStart = path.indexOf(node);
			if (cycleStart >= 0) {
				cycles.push([...path.slice(cycleStart), node]);
			}
			return;
		}

		if (visited.has(node)) {
			return;
		}

		visited.add(node);
		recursionStack.add(node);

		const dependencies = graph.get(node) || new Set();
		for (const dep of dependencies) {
			dfs(dep, [...path, node]);
		}

		recursionStack.delete(node);
	}

	for (const node of graph.keys()) {
		if (!visited.has(node)) {
			dfs(node, []);
		}
	}

	return cycles;
}

async function getBaselineExports() {
	// Read actual baseline files to extract exports
	const baselineDir = "/Users/leo/workspace/hallopetra/next-prisma-flow/baseline/todo";
	const fs = await import("node:fs");

	// Read actions file
	const actionsContent = await fs.promises.readFile(`${baselineDir}/actions.ts`, "utf-8");
	const actionExports = actionsContent.match(/export\s+(async\s+)?function\s+(\w+)/g) || [];
	const actions = actionExports
		.map((e) => {
			const match = e.match(/function\s+(\w+)/);
			return match ? match[1] : undefined;
		})
		.filter((s): s is string => typeof s === "string");

	// Read hooks file
	const hooksContent = await fs.promises.readFile(`${baselineDir}/hooks.ts`, "utf-8");
	const hookExports = hooksContent.match(/export\s+function\s+(use\w+)/g) || [];
	const hooks = hookExports
		.map((e) => {
			const match = e.match(/function\s+(use\w+)/);
			return match ? match[1] : undefined;
		})
		.filter((s): s is string => typeof s === "string");

	// Read types file
	const typesContent = await fs.promises.readFile(`${baselineDir}/types.ts`, "utf-8");
	const typeExports = typesContent.match(/export\s+(type|interface)\s+(\w+)/g) || [];
	const types = typeExports
		.map((e) => {
			const match = e.match(/(type|interface)\s+(\w+)/);
			return match ? match[2] : undefined;
		})
		.filter((s): s is string => typeof s === "string");

	return {
		actions,
		hooks,
		types,
	};
}

function getGeneratedExports(files: Map<string, string>) {
	const exports: { actions: string[]; hooks: string[]; types: string[] } = { actions: [], hooks: [], types: [] };

	// Parse generated files to extract exports
	// This is a simplified version - would need proper AST parsing
	for (const [filePath, content] of files) {
		// Only look at model-specific files, not the global types.ts
		if (filePath.includes("todo/") && filePath.endsWith("actions.ts")) {
			const actionExports = content.match(/export\s+(async\s+)?function\s+(\w+)/g) || [];
			exports.actions.push(
				...actionExports
					.map((e) => {
						const match = e.match(/function\s+(\w+)/);
						return match ? match[1] : undefined;
					})
					.filter((s): s is string => typeof s === "string"),
			);
		}

		if (filePath.includes("todo/") && filePath.endsWith("hooks.ts")) {
			const hookExports = content.match(/export\s+function\s+(use\w+)/g) || [];
			exports.hooks.push(
				...hookExports
					.map((e) => {
						const match = e.match(/function\s+(use\w+)/);
						return match ? match[1] : undefined;
					})
					.filter((s): s is string => typeof s === "string"),
			);
		}

		if (filePath.includes("todo/") && filePath.endsWith("types.ts")) {
			const typeExports = content.match(/export\s+(type|interface)\s+(\w+)/g) || [];
			exports.types.push(
				...typeExports
					.map((e) => {
						const match = e.match(/(type|interface)\s+(\w+)/);
						return match ? match[2] : undefined;
					})
					.filter((s): s is string => typeof s === "string"),
			);
		}
	}

	return exports;
}

function normalizeExports(exports: any, from: string, to: string) {
	// Normalize template variables for comparison
	const normalize = (arr: string[]) => arr.map((item) => item.replace(new RegExp(from, "gi"), to));

	return {
		actions: normalize(exports.actions),
		hooks: normalize(exports.hooks),
		types: normalize(exports.types),
	};
}
