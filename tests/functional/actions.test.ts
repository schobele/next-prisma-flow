import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { TEST_CONFIG } from "../config";
import { GeneratorTestRunner, type GeneratedCode } from "../utils/generator";

describe("Generated Server Actions Validation", () => {
	const TEST_NAME = "actions";
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

	test("actions file contains required exports", () => {
		const actionsCode = generated.files.get("todo/actions.ts");
		expect(actionsCode).toBeDefined();

		// Check for standard CRUD operations
		expect(actionsCode).toContain("export async function create");
		expect(actionsCode).toContain("export async function update");
		expect(actionsCode).toContain("export async function deleteRecord");
		expect(actionsCode).toContain("export async function findMany");
		expect(actionsCode).toContain("export async function findUnique");
	});

	test("actions file imports required dependencies", () => {
		const actionsCode = generated.files.get("todo/actions.ts");
		expect(actionsCode).toBeDefined();

		// Check for required imports
		expect(actionsCode).toContain("use server");
		expect(actionsCode).toContain("import");
		expect(actionsCode).toContain("invalidateTag");
	});

	test("actions file has proper TypeScript types", () => {
		const actionsCode = generated.files.get("todo/actions.ts");
		expect(actionsCode).toBeDefined();

		// Check for type annotations
		expect(actionsCode).toContain(": Promise<");
		expect(actionsCode).toContain("TodoCreateInputSchema");
		expect(actionsCode).toContain("TodoUpdateInputSchema");
	});

	test("actions use validation schemas", () => {
		const actionsCode = generated.files.get("todo/actions.ts");
		expect(actionsCode).toBeDefined();

		// Check for schema validation
		expect(actionsCode).toContain(".parse(");
		expect(actionsCode).toContain("TodoCreateInputSchema");
		expect(actionsCode).toContain("TodoUpdateInputSchema");
	});

	test("actions include cache invalidation", () => {
		const actionsCode = generated.files.get("todo/actions.ts");
		expect(actionsCode).toBeDefined();

		// Check for cache invalidation calls
		expect(actionsCode).toContain("invalidateTag");
	});

	test("actions handle errors properly", () => {
		const actionsCode = generated.files.get("todo/actions.ts");
		expect(actionsCode).toBeDefined();

		// Check for error handling
		expect(actionsCode).toContain("catch");
		expect(actionsCode).toContain("throw");
	});
});
