import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { TEST_CONFIG } from "../config";
import { GeneratorTestRunner, type GeneratedCode } from "../utils/generator";

describe("Generated React Hooks Validation", () => {
	const TEST_NAME = "hooks";
	let generated: GeneratedCode;
	let generator: GeneratorTestRunner;
	const hasFailures = false;

	beforeAll(async () => {
		generator = GeneratorTestRunner.getInstance();
		generated = await generator.generateCode({ testName: TEST_NAME });
	});

	afterAll(async () => {
		if (hasFailures && TEST_CONFIG.debug.preserveOnFailure) {
			console.log(`🔍 Preserving test directory for debugging: ${TEST_NAME}`);
		} else {
			try {
				await generator.cleanupTestDir(TEST_NAME);
				console.log(`🧹 Cleaned up test directory: ${TEST_NAME}`);
			} catch (error) {
				console.warn(`⚠️  Failed to clean up test directory: ${error}`);
			}
		}
	});

	// Simplified tests - focus on code structure rather than runtime behavior

	test("hooks file contains required exports", () => {
		const hooksCode = generated.files.get("todo/hooks.ts");
		expect(hooksCode).toBeDefined();

		// Check for hook exports
		expect(hooksCode).toContain("export function useTodos");
		expect(hooksCode).toContain("export function useTodo");
		expect(hooksCode).toContain("export function useCreateTodoForm");
		expect(hooksCode).toContain("export function useUpdateTodoForm");
	});

	test("hooks use React and Jotai imports", () => {
		const hooksCode = generated.files.get("todo/hooks.ts");
		expect(hooksCode).toBeDefined();

		// Check for required imports
		expect(hooksCode).toContain("import");
		expect(hooksCode).toContain("useAtom");
		expect(hooksCode).toContain("useCallback");
	});

	test("hooks have proper TypeScript types", () => {
		const hooksCode = generated.files.get("todo/hooks.ts");
		expect(hooksCode).toBeDefined();

		// Check for type annotations
		expect(hooksCode).toContain("Todo");
		expect(hooksCode).toContain("CreateInput");
		expect(hooksCode).toContain("UpdateInput");
	});

	test("hooks integrate with atoms", () => {
		const hooksCode = generated.files.get("todo/hooks.ts");
		expect(hooksCode).toBeDefined();

		// Check for atom imports/usage (modern pattern)
		expect(hooksCode).toContain("optimisticCreateTodoAtom");
		expect(hooksCode).toContain("optimisticUpdateTodoAtom");
		expect(hooksCode).toContain("optimisticDeleteTodoAtom");
	});

	test("hooks provide CRUD operations", () => {
		const hooksCode = generated.files.get("todo/hooks.ts");
		expect(hooksCode).toBeDefined();

		// Check for CRUD method names
		expect(hooksCode).toContain("create");
		expect(hooksCode).toContain("update");
		expect(hooksCode).toContain("delete");
		expect(hooksCode).toContain("data");
		expect(hooksCode).toContain("loading");
		expect(hooksCode).toContain("error");
	});

	test("hooks use optimistic updates", () => {
		const hooksCode = generated.files.get("todo/hooks.ts");
		expect(hooksCode).toBeDefined();

		// Check for optimistic update patterns (atoms-based optimistic updates)
		expect(hooksCode).toContain("optimisticCreateTodoAtom");
		expect(hooksCode).toContain("optimisticUpdateTodoAtom");
		expect(hooksCode).toContain("optimisticDeleteTodoAtom");
	});
});
