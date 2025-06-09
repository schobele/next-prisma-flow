#!/usr/bin/env bun

/**
 * Baseline Comparison Script
 *
 * This script builds the generator, regenerates the example code,
 * and compares the baseline with generated files.
 *
 * Usage:
 *   bun tests/scripts/compare-baseline.ts [file-type]
 *
 * Examples:
 *   bun tests/scripts/compare-baseline.ts hooks
 *   bun tests/scripts/compare-baseline.ts actions
 *   bun tests/scripts/compare-baseline.ts atoms
 *   bun tests/scripts/compare-baseline.ts all
 */

import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const BASELINE_DIR = "/Users/leo/workspace/hallopetra/next-prisma-flow/baseline/todo";
const GENERATED_DIR = "/Users/leo/workspace/hallopetra/next-prisma-flow/examples/todolist/generated/flow/todo";
const PROJECT_ROOT = "/Users/leo/workspace/hallopetra/next-prisma-flow";
const EXAMPLE_DIR = "/Users/leo/workspace/hallopetra/next-prisma-flow/examples/todolist";

const AVAILABLE_FILES = [
	"actions.ts",
	"atoms.ts",
	"form-provider.tsx",
	"hooks.ts",
	"index.ts",
	"namespace.ts",
	"routes.ts",
	"smart-form.ts",
	"types.ts",
];

interface CompareOptions {
	fileType: string;
	showContext?: boolean;
	unified?: boolean;
}

function executeCommand(command: string, cwd: string = PROJECT_ROOT): string {
	try {
		console.log(`🔧 Running: ${command}`);
		const result = execSync(command, {
			cwd,
			encoding: "utf-8",
			stdio: ["inherit", "pipe", "inherit"],
		});
		return result;
	} catch (error: any) {
		console.error(`❌ Command failed: ${command}`);
		console.error(error.message);
		process.exit(1);
	}
}

function executeDiffCommand(command: string, cwd: string = PROJECT_ROOT): string {
	try {
		console.log(`🔧 Running: ${command}`);
		const result = execSync(command, {
			cwd,
			encoding: "utf-8",
		});
		return result;
	} catch (error: any) {
		// git diff returns exit code 1 when files differ, which is expected
		return error.stdout || "";
	}
}

function buildGenerator(): void {
	console.log("📦 Building generator...");
	executeCommand("bun run build", PROJECT_ROOT);
	console.log("✅ Generator built successfully");
}

function generateExample(): void {
	console.log("🔄 Regenerating example code...");
	executeCommand("bun run generate", EXAMPLE_DIR);
	console.log("✅ Example code regenerated");
}

function compareFiles(fileName: string, options: CompareOptions): void {
	const baselinePath = join(BASELINE_DIR, fileName);
	const generatedPath = join(GENERATED_DIR, fileName);

	if (!existsSync(baselinePath)) {
		console.error(`❌ Baseline file not found: ${fileName}`);
		return;
	}

	if (!existsSync(generatedPath)) {
		console.error(`❌ Generated file not found: ${fileName}`);
		return;
	}

	console.log(`\n📋 Comparing: ${fileName}`);
	console.log("=".repeat(80));

	try {
		const baselineContent = readFileSync(baselinePath, "utf-8");
		const generatedContent = readFileSync(generatedPath, "utf-8");

		if (baselineContent === generatedContent) {
			console.log("✅ Files are identical");
			return;
		}

		console.log("🔍 Files differ - running diff...");

		// Use git diff for better output
		const diffCommand = options.unified
			? `git diff --no-index --unified=3 "${baselinePath}" "${generatedPath}"`
			: `git diff --no-index "${baselinePath}" "${generatedPath}"`;

		const diffOutput = executeDiffCommand(diffCommand, PROJECT_ROOT);
		if (diffOutput) {
			console.log(diffOutput);
		}
	} catch (error: any) {
		console.error(`❌ Error comparing files: ${error.message}`);
	}
}

function showFileStats(fileName: string): void {
	const baselinePath = join(BASELINE_DIR, fileName);
	const generatedPath = join(GENERATED_DIR, fileName);

	if (!existsSync(baselinePath) || !existsSync(generatedPath)) {
		return;
	}

	const baselineContent = readFileSync(baselinePath, "utf-8");
	const generatedContent = readFileSync(generatedPath, "utf-8");

	const baselineLines = baselineContent.split("\n").length;
	const generatedLines = generatedContent.split("\n").length;
	const baselineSize = Buffer.byteLength(baselineContent, "utf-8");
	const generatedSize = Buffer.byteLength(generatedContent, "utf-8");

	console.log(`📊 ${fileName}:`);
	console.log(`   Baseline:  ${baselineLines} lines, ${baselineSize} bytes`);
	console.log(`   Generated: ${generatedLines} lines, ${generatedSize} bytes`);
	console.log(
		`   Diff:      ${generatedLines - baselineLines > 0 ? "+" : ""}${generatedLines - baselineLines} lines, ${generatedSize - baselineSize > 0 ? "+" : ""}${generatedSize - baselineSize} bytes`,
	);
}

function main(): void {
	const args = process.argv.slice(2);
	const fileType = args[0] || "all";
	const showStats = args.includes("--stats");
	const unified = args.includes("--unified") || args.includes("-u");
	const skipBuild = args.includes("--skip-build");
	const skipGenerate = args.includes("--skip-generate");

	console.log("🚀 Baseline Comparison Tool");
	console.log(`📁 Comparing: ${fileType}`);

	if (!skipBuild) {
		buildGenerator();
	}

	if (!skipGenerate) {
		generateExample();
	}

	const options: CompareOptions = {
		fileType,
		unified,
	};

	if (fileType === "all") {
		console.log("\n📊 File Statistics:");
		console.log("=".repeat(80));
		for (const fileName of AVAILABLE_FILES) {
			showFileStats(fileName);
		}

		console.log("\n🔍 Detailed Comparisons:");
		for (const fileName of AVAILABLE_FILES) {
			compareFiles(fileName, options);
		}
	} else {
		const fileName = fileType.endsWith(".ts") || fileType.endsWith(".tsx") ? fileType : `${fileType}.ts`;

		if (!AVAILABLE_FILES.includes(fileName) && !AVAILABLE_FILES.includes(`${fileType}.tsx`)) {
			console.error(`❌ Invalid file type: ${fileType}`);
			console.log(`📋 Available files: ${AVAILABLE_FILES.join(", ")}`);
			process.exit(1);
		}

		const actualFileName = AVAILABLE_FILES.find(
			(f) => f === fileName || f === `${fileType}.tsx` || f.startsWith(fileType),
		);

		if (!actualFileName) {
			console.error(`❌ File not found: ${fileType}`);
			process.exit(1);
		}

		if (showStats) {
			showFileStats(actualFileName);
		}

		compareFiles(actualFileName, options);
	}

	console.log("\n✨ Comparison complete!");
}

// Help text
if (process.argv.includes("--help") || process.argv.includes("-h")) {
	console.log(`
🚀 Baseline Comparison Tool

Usage: bun tests/scripts/compare-baseline.ts [file-type] [options]

File Types:
  hooks          Compare hooks.ts
  actions        Compare actions.ts  
  atoms          Compare atoms.ts
  types          Compare types.ts
  routes         Compare routes.ts
  form-provider  Compare form-provider.tsx
  smart-form     Compare smart-form.ts
  namespace      Compare namespace.ts
  index          Compare index.ts
  all            Compare all files (default)

Options:
  --stats           Show file statistics
  --unified, -u     Use unified diff format
  --skip-build      Skip building the generator
  --skip-generate   Skip regenerating example code
  --help, -h        Show this help

Examples:
  bun tests/scripts/compare-baseline.ts hooks
  bun tests/scripts/compare-baseline.ts actions --unified
  bun tests/scripts/compare-baseline.ts all --stats
  bun tests/scripts/compare-baseline.ts hooks --skip-build --skip-generate
`);
	process.exit(0);
}

main();
