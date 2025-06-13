import type { ComparisonResult } from "./diff-formatter";

/**
 * Print usage information
 */
export function printUsage(): void {
	console.log(`
📊 Baseline Comparison Tool

USAGE:
  bun run test:baseline [MODEL] [FILE_TYPE]

ARGUMENTS:
  MODEL      Optional model filter (post, author, category, comment)
  FILE_TYPE  File type to compare (hooks, atoms, actions, derived, fx, types, schemas, config, index, all)

EXAMPLES:
  bun run test:baseline hooks          # Compare all hooks.ts files
  bun run test:baseline atoms          # Compare all atoms.ts files  
  bun run test:baseline post hooks     # Compare only post/hooks.ts
  bun run test:baseline all            # Compare all files
  bun run test:baseline post all       # Compare all post files

EXIT CODES:
  0  No differences found
  1  Differences found between baseline and generated code
  2  Script error (build failed, invalid arguments, etc.)

WORKFLOW:
  1. Builds the generator
  2. Generates code in examples/blog
  3. Compares generated files with baseline
  4. Shows colored diff output
  5. Reports summary statistics
`);
}

/**
 * Format and display summary of comparison results
 */
export function formatSummary(results: ComparisonResult[]): void {
	const totalFiles = results.length;
	const failedFiles = results.filter((r) => r.hasDifferences);
	const passedFiles = totalFiles - failedFiles.length;
	const totalDiffLines = results.reduce((sum, r) => sum + Math.max(0, r.diffLines), 0);

	console.log("═".repeat(60));
	console.log("📊 COMPARISON SUMMARY");
	console.log("═".repeat(60));

	if (failedFiles.length === 0) {
		console.log("🎉 PERFECT BASELINE MATCH! 🎉");
		console.log(`✅ All ${totalFiles} files match baseline perfectly!`);
		console.log("🚀 Generated code is identical to reference implementation");
	} else {
		console.log(`❌ ${failedFiles.length}/${totalFiles} files have differences`);
		console.log(`📝 Total difference lines: ${totalDiffLines}`);
		console.log("");

		console.log("Files with differences:");
		for (const result of failedFiles) {
			const diffInfo = result.diffLines > 0 ? ` (${result.diffLines} lines)` : " (error)";
			console.log(`  • ${result.model}/${result.fileType}.ts${diffInfo}`);
		}
	}

	console.log("");
	console.log(`📈 Pass rate: ${Math.round((passedFiles / totalFiles) * 100)}% (${passedFiles}/${totalFiles})`);
}
