import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { TEST_CONFIG } from "../config";
import { GeneratorTestRunner, type GeneratedCode } from "../utils/generator";

describe("TypeScript Compilation Validation", () => {
	const TEST_NAME = "types";
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

	trackingTest("generated code has valid TypeScript structure", async () => {
		// Test basic TypeScript syntax validation
		for (const [filename, content] of generated.files) {
			if (filename.endsWith(".ts") || filename.endsWith(".tsx")) {
				// Basic structural checks - should have exports
				expect(content).toMatch(/export/); // Should have exports

				// Check for common syntax errors
				expect(content).not.toContain(";;"); // No double semicolons
				expect(content).not.toContain("export export"); // No duplicate exports
			}
		}
	});

	trackingTest("has TypeScript type definitions", async () => {
		const typesFile = generated.files.get("todo/types.ts");
		expect(typesFile).toBeDefined();

		// Check for key types - flexible matching
		expect(typesFile).toMatch(/Todo/); // Has Todo type
		expect(typesFile).toMatch(/CreateInput/); // Has create input type
		expect(typesFile).toMatch(/UpdateInput/); // Has update input type
		expect(typesFile).toMatch(/Result/); // Has result types

		// Check that it has proper TypeScript structure
		expect(typesFile).toMatch(/export\s+(type|interface)/);
	});

	trackingTest("action functions are properly structured", async () => {
		const actionsFile = generated.files.get("todo/actions.ts");
		expect(actionsFile).toBeDefined();

		// Check for server action directive
		expect(actionsFile).toContain("use server");

		// Check for CRUD operations
		expect(actionsFile).toContain("export async function create");
		expect(actionsFile).toContain("export async function update");
		expect(actionsFile).toContain("export async function delete");
		expect(actionsFile).toContain("export async function find");
	});

	trackingTest("hooks follow React patterns", async () => {
		const hooksFile = generated.files.get("todo/hooks.ts");
		expect(hooksFile).toBeDefined();

		// Check for React hooks
		expect(hooksFile).toContain("export function use");
		expect(hooksFile).toContain("useAtom");
		expect(hooksFile).toContain("useCallback");

		// Check for hook naming conventions
		expect(hooksFile).toMatch(/export function use\w+/);
	});

	trackingTest("React components use proper typing", async () => {
		const formProviderFile = generated.files.get("todo/form-provider.tsx");
		expect(formProviderFile).toBeDefined();

		// Check for React patterns
		expect(formProviderFile).toMatch(/React/); // Uses React
		expect(formProviderFile).toMatch(/interface|type/); // Has type definitions
		expect(formProviderFile).toMatch(/children/); // Has children prop
		expect(formProviderFile).toMatch(/Provider/); // Is a Provider component
	});

	trackingTest("has consistent file structure", async () => {
		// Check that all expected files exist
		const expectedFiles = [
			"todo/actions.ts",
			"todo/atoms.ts",
			"todo/hooks.ts",
			"todo/types.ts",
			"todo/routes.ts",
			"todo/form-provider.tsx",
			"todo/smart-form.ts",
			"todo/namespace.ts",
			"todo/index.ts",
		];

		for (const expectedFile of expectedFiles) {
			expect(generated.files.has(expectedFile)).toBe(true);
		}

		// Check that files have content
		for (const [filename, content] of generated.files) {
			expect(content.length).toBeGreaterThan(0);
		}
	});

	trackingTest("follows naming conventions", async () => {
		// Check that file contents use consistent naming
		for (const [filename, content] of generated.files) {
			if (filename.includes("todo")) {
				// Should use consistent Todo naming
				expect(content).toMatch(/[Tt]odo/);

				// Should not have generic placeholders
				expect(content).not.toContain("{{");
				expect(content).not.toContain("}}");
			}
		}
	});
});
