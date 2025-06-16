import { spawn } from "bun";
import { describe, expect, test } from "bun:test";
import { join } from "node:path";

const PROJECT_ROOT = join(import.meta.dir, "..");
const TEST_SCRIPT = join(PROJECT_ROOT, "scripts", "test-baseline.ts");

// Utility function to run the baseline comparison script
async function runBaselineTest(args: string[] = []): Promise<{
	exitCode: number;
	stdout: string;
	stderr: string;
}> {
	const proc = spawn(["bun", "run", TEST_SCRIPT, ...args], {
		cwd: PROJECT_ROOT,
		stdio: ["inherit", "pipe", "pipe"],
	});

	const [stdout, stderr, exitCode] = await Promise.all([
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
		proc.exited,
	]);

	return { exitCode, stdout, stderr };
}

describe("Baseline Comparison Script", () => {
	test("should show help when --help flag is used", async () => {
		const result = await runBaselineTest(["--help"]);

		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain("📊 Baseline Comparison Tool");
		expect(result.stdout).toContain("USAGE:");
		expect(result.stdout).toContain("EXAMPLES:");
		expect(result.stdout).toContain("EXIT CODES:");
	});

	test("should show help when -h flag is used", async () => {
		const result = await runBaselineTest(["-h"]);

		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain("📊 Baseline Comparison Tool");
	});

	test("should fail with too many arguments", async () => {
		const result = await runBaselineTest(["post", "hooks", "extra", "arg"]);

		expect(result.exitCode).toBe(2);
		expect(result.stderr).toContain("Too many arguments");
	});

	test("should fail with invalid model filter", async () => {
		const result = await runBaselineTest(["invalidmodel", "hooks"]);

		expect(result.exitCode).toBe(2);
		expect(result.stderr).toContain("Model 'invalidmodel' not found");
	});

	test("should fail with invalid file type filter", async () => {
		const result = await runBaselineTest(["invalidfiletype"]);

		expect(result.exitCode).toBe(2);
		expect(result.stderr).toContain("File type 'invalidfiletype' not found");
	});
});

describe("File Type Comparisons", () => {
	test("should compare atoms files across all models", async () => {
		const result = await runBaselineTest(["atoms"]);

		// Should complete successfully (exit code 0 or 1 are both valid)
		expect([0, 1]).toContain(result.exitCode);
		expect(result.stdout).toContain("🔧 Building generator...");
		expect(result.stdout).toContain("⚡ Generating code...");
		expect(result.stdout).toContain("🔍 Discovering files to compare...");
		expect(result.stdout).toContain("📊 Found");
		expect(result.stdout).toContain("atoms.ts");
		expect(result.stdout).toContain("📊 COMPARISON SUMMARY");
	});

	test("should compare actions files across all models", async () => {
		const result = await runBaselineTest(["actions"]);

		expect([0, 1]).toContain(result.exitCode);
		expect(result.stdout).toContain("actions.ts");
		expect(result.stdout).toContain("📊 COMPARISON SUMMARY");
	});

	test("should compare hooks files across all models", async () => {
		const result = await runBaselineTest(["hooks"]);

		expect([0, 1]).toContain(result.exitCode);
		expect(result.stdout).toContain("hooks.ts");
		expect(result.stdout).toContain("📊 COMPARISON SUMMARY");
	});

	test("should compare derived files across all models", async () => {
		const result = await runBaselineTest(["derived"]);

		expect([0, 1]).toContain(result.exitCode);
		expect(result.stdout).toContain("derived.ts");
		expect(result.stdout).toContain("📊 COMPARISON SUMMARY");
	});

	test("should compare fx files across all models", async () => {
		const result = await runBaselineTest(["fx"]);

		expect([0, 1]).toContain(result.exitCode);
		expect(result.stdout).toContain("fx.ts");
		expect(result.stdout).toContain("📊 COMPARISON SUMMARY");
	});

	test("should compare types files across all models", async () => {
		const result = await runBaselineTest(["types"]);

		expect([0, 1]).toContain(result.exitCode);
		expect(result.stdout).toContain("types.ts");
		expect(result.stdout).toContain("📊 COMPARISON SUMMARY");
	});

	test("should compare schemas files across all models", async () => {
		const result = await runBaselineTest(["schemas"]);

		expect([0, 1]).toContain(result.exitCode);
		expect(result.stdout).toContain("schemas.ts");
		expect(result.stdout).toContain("📊 COMPARISON SUMMARY");
	});

	test("should compare index files across all models", async () => {
		const result = await runBaselineTest(["index"]);

		expect([0, 1]).toContain(result.exitCode);
		expect(result.stdout).toContain("index.ts");
		expect(result.stdout).toContain("📊 COMPARISON SUMMARY");
	});
});

describe("Model-Specific Comparisons", () => {
	test("should compare specific post model hooks file", async () => {
		const result = await runBaselineTest(["post", "hooks"]);

		expect([0, 1]).toContain(result.exitCode);
		expect(result.stdout).toContain("post/hooks.ts");
		expect(result.stdout).toContain("📊 Found 1 files to compare across 1 models");
		expect(result.stdout).toContain("📊 COMPARISON SUMMARY");
	});

	test("should compare specific post model atoms file", async () => {
		const result = await runBaselineTest(["post", "atoms"]);

		expect([0, 1]).toContain(result.exitCode);
		expect(result.stdout).toContain("post/atoms.ts");
		expect(result.stdout).toContain("📊 Found 1 files to compare across 1 models");
	});

	test("should compare specific post model actions file", async () => {
		const result = await runBaselineTest(["post", "actions"]);

		expect([0, 1]).toContain(result.exitCode);
		expect(result.stdout).toContain("post/actions.ts");
		expect(result.stdout).toContain("📊 Found 1 files to compare across 1 models");
	});

	test("should compare all files for post model", async () => {
		const result = await runBaselineTest(["post", "all"]);

		expect([0, 1]).toContain(result.exitCode);
		expect(result.stdout).toContain("📊 Found");
		expect(result.stdout).toContain("files to compare across 1 models");
		expect(result.stdout).toContain("post/");
	});
});

describe("Output Quality Validation", () => {
	test("should show colored diff output when differences exist", async () => {
		const result = await runBaselineTest(["hooks"]);

		// Hooks files should match perfectly now (exit code 0 or 1 are both valid)
		expect([0, 1]).toContain(result.exitCode);

		// If there are differences, should show them
		if (result.exitCode === 1) {
			expect(result.stdout).toContain("❌");
			expect(result.stdout).toContain("differences");
			expect(result.stdout).toContain("Files with differences:");
		} else {
			// If no differences, should show perfect match
			expect(result.stdout).toContain("🎉 PERFECT BASELINE MATCH! 🎉");
		}
	});

	test("should show perfect match message for atoms files", async () => {
		// Atoms files should have perfect match after normalization
		const result = await runBaselineTest(["post", "atoms"]);

		// Should exit with code 0 for perfect match
		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain("🎉 PERFECT BASELINE MATCH! 🎉");
		expect(result.stdout).toContain("✅ All 1 files match baseline perfectly!");
		expect(result.stdout).toContain("🚀 Generated code is identical to reference implementation");
		expect(result.stdout).toContain("📈 Pass rate: 100%");
	});

	test("should show perfect match message for actions files", async () => {
		// Actions files should have perfect match after normalization
		const result = await runBaselineTest(["post", "actions"]);

		// Should exit with code 0 for perfect match
		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain("🎉 PERFECT BASELINE MATCH! 🎉");
		expect(result.stdout).toContain("✅ All 1 files match baseline perfectly!");
		expect(result.stdout).toContain("📈 Pass rate: 100%");
	});

	test("should show perfect match message for hooks files", async () => {
		// Actions files should have perfect match after normalization
		const result = await runBaselineTest(["post", "hooks"]);

		// Should exit with code 0 for perfect match
		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain("🎉 PERFECT BASELINE MATCH! 🎉");
		expect(result.stdout).toContain("✅ All 1 files match baseline perfectly!");
		expect(result.stdout).toContain("📈 Pass rate: 100%");
	});

	test("should show perfect match message for derived files", async () => {
		// Actions files should have perfect match after normalization
		const result = await runBaselineTest(["post", "derived"]);

		// Should exit with code 0 for perfect match
		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain("🎉 PERFECT BASELINE MATCH! 🎉");
		expect(result.stdout).toContain("✅ All 1 files match baseline perfectly!");
		expect(result.stdout).toContain("📈 Pass rate: 100%");
	});

	test("should show perfect match message for fx files", async () => {
		// Actions files should have perfect match after normalization
		const result = await runBaselineTest(["post", "fx"]);

		// Should exit with code 0 for perfect match
		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain("🎉 PERFECT BASELINE MATCH! 🎉");
		expect(result.stdout).toContain("✅ All 1 files match baseline perfectly!");
		expect(result.stdout).toContain("📈 Pass rate: 100%");
	});

	test("should show perfect match message for types files", async () => {
		// Actions files should have perfect match after normalization
		const result = await runBaselineTest(["post", "types"]);

		// Should exit with code 0 for perfect match
		expect(result.exitCode).toBe(0);
		expect(result.stdout).toContain("🎉 PERFECT BASELINE MATCH! 🎉");
		expect(result.stdout).toContain("✅ All 1 files match baseline perfectly!");
		expect(result.stdout).toContain("📈 Pass rate: 100%");
	});

	test("should include summary statistics", async () => {
		const result = await runBaselineTest(["post", "atoms"]);

		expect(result.stdout).toContain("📊 COMPARISON SUMMARY");
		expect(result.stdout).toContain("📈 Pass rate:");
		expect(result.stdout).toContain("(1/1)");
	});

	test("should normalize generated timestamps", async () => {
		const result = await runBaselineTest(["atoms"]);

		// The script should normalize timestamps, so we shouldn't see actual timestamps in diffs
		if (result.stdout.includes("Generated at:")) {
			expect(result.stdout).toContain("[TIMESTAMP]");
		}
	});
});

describe("Comprehensive Comparison", () => {
	test("should compare all files across all models", async () => {
		const result = await runBaselineTest(["all"]);

		expect([0, 1]).toContain(result.exitCode);
		expect(result.stdout).toContain("🔧 Building generator...");
		expect(result.stdout).toContain("✅ Generator built successfully");
		expect(result.stdout).toContain("⚡ Generating code...");
		expect(result.stdout).toContain("✅ Code generated successfully");
		expect(result.stdout).toContain("🔍 Discovering files to compare...");

		// Should find multiple files across multiple models
		expect(result.stdout).toMatch(/📊 Found \d+ files to compare across \d+ models/);

		// Should have comprehensive summary
		expect(result.stdout).toContain("📊 COMPARISON SUMMARY");
		expect(result.stdout).toContain("📈 Pass rate:");

		// Should show at least some file comparisons
		expect(result.stdout).toMatch(/(✅|❌).*\.ts/);
	}, 60000); // Longer timeout for comprehensive test

	test("should handle empty comparison gracefully", async () => {
		// This shouldn't happen in normal operation, but test robustness
		const result = await runBaselineTest(["post", "nonexistent"]);

		expect(result.exitCode).toBe(2);
		expect(result.stderr).toContain("not found");
	});
});

describe("Performance and Reliability", () => {
	test("should complete atoms comparison within reasonable time", async () => {
		const startTime = Date.now();
		const result = await runBaselineTest(["atoms"]);
		const duration = Date.now() - startTime;

		expect([0, 1]).toContain(result.exitCode);
		expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
	});

	test("should handle multiple consecutive runs", async () => {
		// Run the same test sequentially to avoid build conflicts
		const result1 = await runBaselineTest(["post", "atoms"]);
		const result2 = await runBaselineTest(["post", "atoms"]);

		// Both runs should complete successfully (0 or 1 are valid)
		expect([0, 1]).toContain(result1.exitCode);
		expect([0, 1]).toContain(result2.exitCode);

		// Both should contain similar content structure
		expect(result1.stdout).toContain("📊 COMPARISON SUMMARY");
		expect(result1.stdout).toContain("post/atoms.ts");
		expect(result2.stdout).toContain("📊 COMPARISON SUMMARY");
		expect(result2.stdout).toContain("post/atoms.ts");
	});
});
