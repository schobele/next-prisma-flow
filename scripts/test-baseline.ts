#!/usr/bin/env bun

import { spawn } from "bun";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { compareFiles, type ComparisonResult } from "./utils/diff-formatter";
import { discoverModelsAndFiles } from "./utils/file-discovery";
import { formatSummary, printUsage } from "./utils/output-formatter";

const PROJECT_ROOT = join(import.meta.dir, "..");
const BASELINE_DIR = join(PROJECT_ROOT, "baseline");
const GENERATED_DIR = join(PROJECT_ROOT, "examples", "blog", "flow");

async function buildGenerator(): Promise<boolean> {
	console.log("🔧 Building generator...");
	const proc = spawn(["bun", "run", "build"], {
		cwd: PROJECT_ROOT,
		stdio: ["inherit", "pipe", "pipe"],
	});

	const result = await proc.exited;
	if (result !== 0) {
		console.error("❌ Generator build failed");
		return false;
	}
	console.log("✅ Generator built successfully");
	return true;
}

async function generateCode(): Promise<boolean> {
	console.log("⚡ Generating code...");
	const blogDir = join(PROJECT_ROOT, "examples", "blog");

	const proc = spawn(["bunx", "prisma", "generate"], {
		cwd: blogDir,
		stdio: ["inherit", "pipe", "pipe"],
	});

	const result = await proc.exited;
	if (result !== 0) {
		console.error("❌ Code generation failed");
		return false;
	}
	console.log("✅ Code generated successfully");
	return true;
}

async function formatCode(): Promise<boolean> {
	console.log("🔍 Formatting code...");

	const proc = spawn(["bun", "run", "check:fix"], {
		cwd: PROJECT_ROOT,
		stdio: ["inherit", "pipe", "pipe"],
	});

	const result = await proc.exited;
	if (result !== 0) {
		console.error("❌ Code formatting failed");
		return false;
	}
	console.log("✅ Code formatted successfully");

	return true;
}

async function main() {
	const args = process.argv.slice(2);

	// Handle help
	if (args.includes("--help") || args.includes("-h")) {
		printUsage();
		process.exit(0);
	}

	// Parse arguments
	let modelFilter: string | undefined;
	let fileTypeFilter: string | undefined;

	if (args.length === 1) {
		fileTypeFilter = args[0];
	} else if (args.length === 2) {
		modelFilter = args[0];
		fileTypeFilter = args[1];
	} else if (args.length > 2) {
		console.error("❌ Too many arguments. Use --help for usage information.");
		process.exit(2);
	}

	// Validate directories exist
	if (!existsSync(BASELINE_DIR)) {
		console.error(`❌ Baseline directory not found: ${BASELINE_DIR}`);
		process.exit(2);
	}

	// Build and generate
	if (!(await buildGenerator())) {
		process.exit(2);
	}

	if (!(await generateCode())) {
		process.exit(2);
	}

	// Discover available files
	console.log("🔍 Discovering files to compare...");
	const { models, fileTypes, comparisons } = await discoverModelsAndFiles(
		BASELINE_DIR,
		GENERATED_DIR,
		modelFilter,
		fileTypeFilter,
	);

	if (comparisons.length === 0) {
		console.log("⚠️  No files found to compare");
		process.exit(0);
	}

	console.log(`📊 Found ${comparisons.length} files to compare across ${models.size} models`);
	console.log("");

	// Perform comparisons
	const results: ComparisonResult[] = [];

	for (const { model, fileType, baselinePath, generatedPath } of comparisons) {
		const result = await compareFiles(model, fileType, baselinePath, generatedPath);
		results.push(result);
	}

	// Output summary
	formatSummary(results);

	// Exit with appropriate code
	const hasFailures = results.some((r) => r.hasDifferences);
	process.exit(hasFailures ? 1 : 0);
}

// Handle errors gracefully
process.on("unhandledRejection", (error) => {
	console.error("❌ Unhandled error:", error);
	process.exit(2);
});

main().catch((error) => {
	console.error("❌ Script failed:", error);
	process.exit(2);
});
