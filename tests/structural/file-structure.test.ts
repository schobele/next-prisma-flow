import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { promises as fs } from "node:fs";
import { resolve } from "node:path";
import { TEST_CONFIG } from "../config";
import { GeneratorTestRunner, type GeneratedCode } from "../utils/generator";

describe("File Structure Validation", () => {
	const TEST_NAME = "file-structure";
	let generated: GeneratedCode;
	let generator: GeneratorTestRunner;
	let hasFailures = false;

	beforeAll(async () => {
		generator = GeneratorTestRunner.getInstance();
		generator.clearCache(); // Clear cache to ensure fresh generation
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

	trackingTest("generates all required baseline files", async () => {
		const expectedFiles = TEST_CONFIG.validation.compareFiles;

		// Check that each expected file exists in generated code
		for (const expectedFile of expectedFiles) {
			const modelFiles = Array.from(generated.files.keys()).filter(
				(path) => path.includes("todo/") && path.endsWith(expectedFile),
			);

			expect(modelFiles.length).toBeGreaterThan(0);
		}
	});

	trackingTest("follows consistent naming conventions", async () => {
		const files = Array.from(generated.files.keys());

		for (const file of files) {
			// File names should be lowercase with dashes or dots
			const fileName = file.split("/").pop();
			if (!fileName) {
				throw new Error(`File name is undefined for ${file}`);
			}
			const nameWithoutExt = fileName.replace(/\.(ts|tsx)$/, "");

			expect(nameWithoutExt).toMatch(/^[a-z]([a-z0-9-]*[a-z0-9])?$/);

			// TypeScript React files should end with .tsx for components
			if (fileName.endsWith(".tsx")) {
				expect(fileName).toMatch(/(component|provider|form)\.tsx$/);
			}
		}
	});

	trackingTest("maintains directory organization", async () => {
		const files = Array.from(generated.files.keys());

		// Should have model-specific directories
		const modelDirs = new Set(files.filter((file) => file.includes("/")).map((file) => file.split("/")[0]));

		expect(modelDirs.has("todo")).toBe(true);

		// Each model directory should have required files
		const todoFiles = files.filter((file) => file.startsWith("todo/"));
		const requiredFiles = ["actions.ts", "atoms.ts", "hooks.ts", "types.ts"];

		for (const required of requiredFiles) {
			expect(todoFiles.some((file) => file.endsWith(required))).toBe(true);
		}
	});

	trackingTest("has correct export structure", async () => {
		// Main index file should exist
		expect(generated.files.has("index.ts")).toBe(true);

		// Model namespace files should exist
		expect(generated.files.has("todo/namespace.ts")).toBe(true);
		expect(generated.files.has("todo/index.ts")).toBe(true);

		// Check main index exports models
		const mainIndex = generated.files.get("index.ts");
		if (!mainIndex) {
			throw new Error("Main index file not found");
		}
		expect(mainIndex).toContain("import { todo } from './todo/namespace'");
		expect(mainIndex).toContain("export { todo }");
	});

	trackingTest("no orphaned or unexpected files", async () => {
		const files = Array.from(generated.files.keys());
		const allowedPatterns = [
			/^index\.ts$/,
			/^types\.ts$/,
			/^store\.ts$/,
			/^prisma-client\.ts$/,
			/^cache\.ts$/,
			/^prisma\.ts$/,
			/^server\.ts$/,
			/^flow-config\.ts$/,
			/^flow-context\.ts$/,
			/^flow-provider\.tsx$/,
			/^zod\/index\.ts$/,
			/^todo\/(actions|atoms|hooks|types|routes|form-provider|smart-form|namespace|index)\.(ts|tsx)$/,
		];

		for (const file of files) {
			const isAllowed = allowedPatterns.some((pattern) => pattern.test(file));
			expect(isAllowed).toBe(true);
		}
	});

	trackingTest("baseline files exist for comparison", async () => {
		const baselineFiles = TEST_CONFIG.validation.compareFiles;

		for (const file of baselineFiles) {
			const baselinePath = resolve(TEST_CONFIG.baseline.todo, file);
			const exists = await fs
				.access(baselinePath)
				.then(() => true)
				.catch(() => false);

			expect(exists).toBe(true);
		}
	});
});
