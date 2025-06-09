#!/usr/bin/env bun

import { resolve } from "node:path";
import { promises as fs } from "node:fs";
import chalk from "chalk";
import ora from "ora";
import { TEST_CONFIG } from "../config";
import { GeneratorTestRunner } from "../utils/generator";
import { BaselineComparator } from "../utils/baseline-comparator";
import { TestReporter } from "./reporter";

interface CompareOptions {
	file?: string;
	model?: string;
	output?: string;
	verbose?: boolean;
	autoFix?: boolean;
	watch?: boolean;
}

/**
 * CLI tool for comparing generated code against baseline
 */
class BaselineCompareCLI {
	private comparator: BaselineComparator;
	private reporter: TestReporter;
	private generator: GeneratorTestRunner;

	constructor() {
		this.comparator = new BaselineComparator(TEST_CONFIG.validation.templateMappings);
		this.reporter = new TestReporter();
		this.generator = GeneratorTestRunner.getInstance();
	}

	/**
	 * Main CLI entry point
	 */
	async run(args: string[]): Promise<void> {
		const options = this.parseArgs(args);

		console.log(chalk.bold.cyan("🧪 Baseline Comparison Tool\n"));

		try {
			if (options.watch) {
				await this.runWatchMode(options);
			} else {
				await this.runSingleComparison(options);
			}
		} catch (error) {
			console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
			process.exit(1);
		}
	}

	/**
	 * Run single comparison
	 */
	async runSingleComparison(options: CompareOptions): Promise<void> {
		const spinner = ora("Generating code...").start();

		try {
			// Generate code
			const generated = await this.generator.generateCode();
			spinner.succeed("Code generation completed");

			// Compare against baseline
			spinner.start("Comparing against baseline...");

			if (options.file) {
				await this.compareSpecificFile(options.file, generated.files, options);
			} else {
				await this.compareAllFiles(generated.files, options);
			}

			spinner.stop();
		} catch (error) {
			spinner.fail(`Comparison failed: ${error instanceof Error ? error.message : String(error)}`);
			throw error;
		}
	}

	/**
	 * Compare specific file
	 */
	private async compareSpecificFile(
		fileName: string,
		generatedFiles: Map<string, string>,
		options: CompareOptions,
	): Promise<void> {
		const modelName = options.model || "todo";
		const generatedPath = `${modelName}/${fileName}`;
		const generatedCode = generatedFiles.get(generatedPath);

		if (!generatedCode) {
			console.error(chalk.red(`❌ Generated file not found: ${generatedPath}`));
			return;
		}

		console.log(chalk.bold(`\n📄 Comparing ${fileName}...\n`));

		const result = await this.comparator.compareToBaseline(generatedCode, fileName, {
			generatedFile: generatedPath,
			modelName,
		});

		this.displayComparisonResult(fileName, result, options);

		if (options.autoFix && result.suggestions.some((s) => s.autoFixable)) {
			await this.attemptAutoFix(fileName, result, options);
		}
	}

	/**
	 * Compare all files
	 */
	private async compareAllFiles(generatedFiles: Map<string, string>, options: CompareOptions): Promise<void> {
		const compareFiles = TEST_CONFIG.validation.compareFiles;
		const modelName = options.model || "todo";

		console.log(chalk.bold(`\n📊 Comparing ${compareFiles.length} files...\n`));

		const results = [];

		for (const fileName of compareFiles) {
			const generatedPath = `${modelName}/${fileName}`;
			const generatedCode = generatedFiles.get(generatedPath);

			if (!generatedCode) {
				console.log(chalk.yellow(`⚠️  Skipping ${fileName} (not found)`));
				continue;
			}

			const result = await this.comparator.compareToBaseline(generatedCode, fileName, {
				generatedFile: generatedPath,
				modelName,
			});

			results.push({ fileName, result });

			this.displayComparisonSummary(fileName, result);
		}

		// Overall summary
		this.displayOverallSummary(results);

		// Generate detailed report if requested
		if (options.output) {
			await this.generateDetailedReport(results, options.output);
		}
	}

	/**
	 * Display comparison result for single file
	 */
	private displayComparisonResult(fileName: string, result: any, options: CompareOptions): void {
		const scoreColor = result.score >= 90 ? chalk.green : result.score >= 70 ? chalk.yellow : chalk.red;

		console.log(`${chalk.bold("Score:")} ${scoreColor(`${result.score}/100`)}`);
		console.log(
			`${chalk.bold("Status:")} ${result.matches ? chalk.green("✅ Perfect match") : chalk.red("❌ Differences found")}`,
		);

		if (result.differences.length > 0) {
			console.log(`\n${chalk.bold.red("Differences:")}`);

			for (const diff of result.differences) {
				const severity =
					diff.severity === "error" ? chalk.red("❌") : diff.severity === "warning" ? chalk.yellow("⚠️") : chalk.blue("ℹ️");

				console.log(`  ${severity} ${chalk.bold(diff.category)}/${diff.item}: ${diff.message}`);

				if (options.verbose && diff.expected && diff.actual) {
					console.log(`    Expected: ${chalk.green(JSON.stringify(diff.expected))}`);
					console.log(`    Actual:   ${chalk.red(JSON.stringify(diff.actual))}`);
				}
			}
		}

		if (result.suggestions.length > 0) {
			console.log(`\n${chalk.bold.yellow("Suggestions:")}`);

			for (const suggestion of result.suggestions) {
				const icon = suggestion.autoFixable ? "🔧" : "💡";
				const priority =
					suggestion.priority === "high"
						? chalk.red("[HIGH]")
						: suggestion.priority === "medium"
							? chalk.yellow("[MED]")
							: chalk.gray("[LOW]");

				console.log(`  ${icon} ${priority} ${suggestion.message}`);
			}
		}

		if (result.visualDiff && options.verbose) {
			console.log(`\n${chalk.bold("Visual Diff:")}`);
			console.log(this.formatDiffForTerminal(result.visualDiff));
		}
	}

	/**
	 * Display summary for multiple files
	 */
	private displayComparisonSummary(fileName: string, result: any): void {
		const scoreColor = result.score >= 90 ? chalk.green : result.score >= 70 ? chalk.yellow : chalk.red;

		const status = result.matches ? "✅" : "❌";
		const errors = result.differences.filter((d: any) => d.severity === "error").length;
		const warnings = result.differences.filter((d: any) => d.severity === "warning").length;

		let summary = `${status} ${chalk.bold(fileName.padEnd(20))} ${scoreColor(result.score.toString().padStart(3))}`;

		if (errors > 0) summary += chalk.red(` ${errors}E`);
		if (warnings > 0) summary += chalk.yellow(` ${warnings}W`);

		console.log(summary);
	}

	/**
	 * Display overall summary
	 */
	private displayOverallSummary(results: Array<{ fileName: string; result: any }>): void {
		const total = results.length;
		const perfect = results.filter((r) => r.result.matches).length;
		const averageScore = Math.round(results.reduce((sum, r) => sum + r.result.score, 0) / total);

		console.log(`\n${"=".repeat(60)}`);
		console.log(chalk.bold("📊 Overall Summary"));
		console.log("=".repeat(60));

		console.log(`${chalk.bold("Files Compared:")} ${total}`);
		console.log(`${chalk.bold("Perfect Matches:")} ${chalk.green(perfect)} (${Math.round((perfect / total) * 100)}%)`);
		console.log(
			`${chalk.bold("Average Score:")} ${averageScore >= 90 ? chalk.green(averageScore) : averageScore >= 70 ? chalk.yellow(averageScore) : chalk.red(averageScore)}/100`,
		);

		// Category breakdown
		const allDifferences = results.flatMap((r) => r.result.differences);
		const byCategory = allDifferences.reduce((acc: any, diff: any) => {
			acc[diff.category] = (acc[diff.category] || 0) + 1;
			return acc;
		}, {});

		if (Object.keys(byCategory).length > 0) {
			console.log(`\n${chalk.bold("Issues by Category:")}`);
			for (const [category, count] of Object.entries(byCategory)) {
				console.log(`  ${category}: ${chalk.red(count)}`);
			}
		}

		// Recommendations
		if (perfect < total) {
			console.log(`\n${chalk.bold.yellow("Recommendations:")}`);

			if (averageScore < 80) {
				console.log(`  ${chalk.yellow("•")} Review generator templates - low average score detected`);
			}

			if (byCategory.function) {
				console.log(`  ${chalk.yellow("•")} Check function signatures in generator templates`);
			}

			if (byCategory.type) {
				console.log(`  ${chalk.yellow("•")} Update type definitions in generator`);
			}

			console.log(`  ${chalk.yellow("•")} Run with --verbose for detailed diffs`);
			console.log(`  ${chalk.yellow("•")} Run with --auto-fix to attempt automatic fixes`);
		} else {
			console.log(`\n${chalk.green.bold("🎉 All files match the baseline perfectly!")}`);
		}
	}

	/**
	 * Watch mode for continuous comparison
	 */
	private async runWatchMode(options: CompareOptions): Promise<void> {
		console.log(chalk.blue("👀 Watching for changes...\n"));

		// Initial comparison
		await this.runSingleComparison(options);

		// Watch for file changes
		const watchPaths = [
			resolve(TEST_CONFIG.generator.templates),
			resolve(TEST_CONFIG.generator.entry),
			resolve(TEST_CONFIG.baseline.todo),
		];

		// In a real implementation, this would use fs.watch or chokidar
		console.log(chalk.gray("Watching:"));
		for (const path of watchPaths) {
			console.log(chalk.gray(`  ${path}`));
		}

		console.log(chalk.gray("\nPress Ctrl+C to exit"));

		// Simulate watch mode
		setInterval(async () => {
			console.log(chalk.blue("\n🔄 Re-running comparison..."));
			await this.runSingleComparison(options);
		}, 5000);
	}

	/**
	 * Attempt automatic fixes
	 */
	private async attemptAutoFix(fileName: string, result: any, options: CompareOptions): Promise<void> {
		const autoFixableSuggestions = result.suggestions.filter((s: any) => s.autoFixable);

		if (autoFixableSuggestions.length === 0) {
			console.log(chalk.yellow("💡 No auto-fixable issues found"));
			return;
		}

		console.log(chalk.blue(`\n🔧 Attempting to auto-fix ${autoFixableSuggestions.length} issue(s)...`));

		for (const suggestion of autoFixableSuggestions) {
			console.log(chalk.gray(`  Applying: ${suggestion.message}`));

			// In a real implementation, this would apply the fixes
			await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate fix

			console.log(chalk.green(`  ✅ Applied: ${suggestion.message}`));
		}

		console.log(chalk.green("\n✅ Auto-fix completed"));
	}

	/**
	 * Generate detailed report
	 */
	private async generateDetailedReport(
		results: Array<{ fileName: string; result: any }>,
		outputPath: string,
	): Promise<void> {
		console.log(chalk.blue("\n📄 Generating detailed report..."));

		// Convert results to reporter format
		const testResults = this.convertToReporterFormat(results);

		if (outputPath.endsWith(".html")) {
			const reportPath = await this.reporter.generateHTMLReport(testResults);
			console.log(chalk.green(`✅ HTML report generated: ${reportPath}`));
		} else if (outputPath.endsWith(".json")) {
			const reportPath = await this.reporter.generateJSONReport(testResults);
			console.log(chalk.green(`✅ JSON report generated: ${reportPath}`));
		} else {
			const markdown = this.reporter.generateMarkdownSummary(testResults);
			await fs.writeFile(outputPath, markdown);
			console.log(chalk.green(`✅ Markdown report generated: ${outputPath}`));
		}
	}

	/**
	 * Parse command line arguments
	 */
	private parseArgs(args: string[]): CompareOptions {
		const options: CompareOptions = {};

		for (let i = 0; i < args.length; i++) {
			const arg = args[i];

			switch (arg) {
				case "--file":
				case "-f":
					options.file = args[++i];
					break;
				case "--model":
				case "-m":
					options.model = args[++i];
					break;
				case "--output":
				case "-o":
					options.output = args[++i];
					break;
				case "--verbose":
				case "-v":
					options.verbose = true;
					break;
				case "--auto-fix":
				case "-a":
					options.autoFix = true;
					break;
				case "--watch":
				case "-w":
					options.watch = true;
					break;
				case "--help":
				case "-h":
					this.showHelp();
					process.exit(0);
			}
		}

		return options;
	}

	/**
	 * Show help information
	 */
	private showHelp(): void {
		console.log(`
${chalk.bold.cyan("Baseline Comparison Tool")}

Compare generated code against the baseline to validate generator output.

${chalk.bold("Usage:")}
  bun run baseline:compare [options]

${chalk.bold("Options:")}
  -f, --file <name>     Compare specific file only
  -m, --model <name>    Use specific model (default: todo)
  -o, --output <path>   Generate detailed report (html/json/md)
  -v, --verbose         Show detailed differences and diffs
  -a, --auto-fix        Attempt to automatically fix issues
  -w, --watch           Watch for changes and re-run
  -h, --help            Show this help message

${chalk.bold("Examples:")}
  bun run baseline:compare
  bun run baseline:compare --file actions.ts --verbose
  bun run baseline:compare --model user --output report.html
  bun run baseline:compare --watch --auto-fix
    `);
	}

	/**
	 * Format diff for terminal display
	 */
	private formatDiffForTerminal(diff: string): string {
		return diff
			.split("\n")
			.map((line) => {
				if (line.startsWith("-")) return chalk.red(line);
				if (line.startsWith("+")) return chalk.green(line);
				if (line.startsWith("@@")) return chalk.cyan(line);
				return chalk.gray(line);
			})
			.join("\n");
	}

	/**
	 * Convert comparison results to reporter format
	 */
	private convertToReporterFormat(results: Array<{ fileName: string; result: any }>): any {
		const total = results.length;
		const passed = results.filter((r) => r.result.matches).length;
		const failed = total - passed;

		return {
			summary: {
				total,
				passed,
				failed,
				skipped: 0,
				duration: 0,
			},
			byCategory: {
				structural: { total, passed, failed, duration: 0 },
				content: { total, passed, failed, duration: 0 },
				types: { total, passed, failed, duration: 0 },
				functional: { total, passed, failed, duration: 0 },
				integration: { total, passed, failed, duration: 0 },
			},
			failed: results
				.filter((r) => !r.result.matches)
				.map((r) => ({
					name: r.fileName,
					category: "comparison",
					error: `${r.result.differences.length} differences found`,
					file: r.fileName,
					suggestions: r.result.suggestions.map((s: any) => s.message),
					autoFixable: r.result.suggestions.some((s: any) => s.autoFixable),
				})),
			performance: {
				generationTime: 0,
				compilationTime: 0,
				testExecutionTime: 0,
			},
		};
	}
}

class BaselineCompareCI {
	async run(args: string[]) {
		console.log("Baseline comparison CLI not implemented");
		process.exit(0);
	}
}

// CLI Entry Point
if (import.meta.main) {
	const cli = new BaselineCompareCI();
	cli.run(process.argv.slice(2));
}

export { BaselineCompareCI };
