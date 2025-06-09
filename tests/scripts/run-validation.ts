#!/usr/bin/env bun

import chalk from "chalk";
import ora from "ora";
import { spawn, type ChildProcess } from "node:child_process";
import { resolve } from "node:path";
import { TEST_CONFIG } from "../config";
import { TestReporter, type TestResults } from "../tools/reporter";

interface ValidationOptions {
	category?: string;
	verbose?: boolean;
	watch?: boolean;
	output?: string;
	quick?: boolean;
	parallel?: boolean;
	coverage?: boolean;
}

/**
 * Main validation runner script
 */
class ValidationRunner {
	private reporter: TestReporter;
	private startTime: number;

	constructor() {
		this.reporter = new TestReporter();
		this.startTime = Date.now();
	}

	/**
	 * Main entry point
	 */
	async run(args: string[]): Promise<void> {
		const options = this.parseArgs(args);

		console.log(chalk.bold.cyan("🧪 Baseline Validation Suite\n"));

		try {
			if (options.watch) {
				await this.runWatchMode(options);
			} else if (options.quick) {
				await this.runQuickValidation(options);
			} else {
				await this.runFullValidation(options);
			}
		} catch (error) {
			console.error(chalk.red(`❌ Validation failed: ${error instanceof Error ? error.message : String(error)}`));
			process.exit(1);
		}
	}

	/**
	 * Run quick validation (structural + types only)
	 */
	async runQuickValidation(options: ValidationOptions): Promise<void> {
		console.log(chalk.blue("⚡ Running quick validation (structural + types)...\n"));

		const results = await this.runTestCategories(["structural", "types"], options);
		await this.generateReport(results, options);

		this.displayFinalSummary(results);
	}

	/**
	 * Run full validation suite
	 */
	async runFullValidation(options: ValidationOptions): Promise<void> {
		console.log(chalk.blue("🔍 Running full validation suite...\n"));

		const categories = options.category
			? [options.category]
			: ["structural", "content", "types", "functional", "integration"];

		const results = await this.runTestCategories(categories, options);
		await this.generateReport(results, options);

		this.displayFinalSummary(results);
	}

	/**
	 * Run specific test categories
	 */
	private async runTestCategories(categories: string[], options: ValidationOptions): Promise<TestResults> {
		const results: TestResults = {
			summary: { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 },
			byCategory: {
				structural: { total: 0, passed: 0, failed: 0, duration: 0 },
				content: { total: 0, passed: 0, failed: 0, duration: 0 },
				types: { total: 0, passed: 0, failed: 0, duration: 0 },
				functional: { total: 0, passed: 0, failed: 0, duration: 0 },
				integration: { total: 0, passed: 0, failed: 0, duration: 0 },
			},
			failed: [],
			performance: {
				generationTime: 0,
				compilationTime: 0,
				testExecutionTime: 0,
			},
		};

		if (options.parallel) {
			await this.runCategoriesInParallel(categories, results, options);
		} else {
			await this.runCategoriesSequentially(categories, results, options);
		}

		// Calculate summary
		results.summary.duration = Date.now() - this.startTime;

		return results;
	}

	/**
	 * Run test categories in parallel
	 */
	private async runCategoriesInParallel(
		categories: string[],
		results: TestResults,
		options: ValidationOptions,
	): Promise<void> {
		console.log(chalk.blue("🚀 Running tests in parallel...\n"));

		const promises = categories.map((category) => this.runCategory(category, options));
		const categoryResults = await Promise.allSettled(promises);

		for (let i = 0; i < categories.length; i++) {
			const category = categories[i];
			const result = categoryResults[i];

			if (result?.status === "fulfilled") {
				this.mergeResults(results, category || "unknown", result.value);
			} else if (result?.status === "rejected") {
				console.error(chalk.red(`❌ ${category} tests failed: ${result.reason}`));
				results.byCategory[category as keyof typeof results.byCategory].failed += 1;
				results.failed.push({
					name: `${category || "unknown"}-suite`,
					category: category || "unknown",
					error: result.reason instanceof Error ? result.reason.message : String(result.reason),
					file: `tests/${category || "unknown"}/`,
					suggestions: [`Review ${category} test configuration`],
					autoFixable: false,
				});
			}
		}
	}

	/**
	 * Run test categories sequentially
	 */
	private async runCategoriesSequentially(
		categories: string[],
		results: TestResults,
		options: ValidationOptions,
	): Promise<void> {
		for (const category of categories) {
			try {
				const categoryResult = await this.runCategory(category, options);
				this.mergeResults(results, category, categoryResult);
			} catch (error) {
				console.error(chalk.red(`❌ ${category} tests failed: ${error instanceof Error ? error.message : String(error)}`));
				results.byCategory[category as keyof typeof results.byCategory].failed += 1;
				results.failed.push({
					name: `${category}-suite`,
					category,
					error: error instanceof Error ? error.message : String(error),
					file: `tests/${category}/`,
					suggestions: [`Review ${category} test configuration`],
					autoFixable: false,
				});
			}
		}
	}

	/**
	 * Run tests for a specific category
	 */
	private async runCategory(category: string, options: ValidationOptions): Promise<any> {
		const spinner = ora(`Running ${category} tests...`).start();

		try {
			const startTime = Date.now();
			const result = await this.executeTests(`tests/${category}/`, options);
			const duration = Date.now() - startTime;

			spinner.succeed(`${category} tests completed (${duration}ms)`);

			return {
				...result,
				duration,
			};
		} catch (error) {
			spinner.fail(`${category} tests failed`);
			throw error;
		}
	}

	/**
	 * Execute tests using Bun test runner
	 */
	private async executeTests(testPath: string, options: ValidationOptions): Promise<any> {
		return new Promise((resolve, reject) => {
			const args = ["test", testPath];

			if (options.verbose) {
				args.push("--verbose");
			}

			if (options.coverage) {
				args.push("--coverage");
			}

			// Set timeout based on category
			const timeout = this.getTimeoutForPath(testPath);
			args.push("--timeout", timeout.toString());

			const child: ChildProcess = spawn("bun", args, {
				stdio: options.verbose ? "inherit" : "pipe",
				cwd: process.cwd(),
			});

			let stdout = "";
			let stderr = "";

			if (!options.verbose && child.stdout && child.stderr) {
				child.stdout.on("data", (data: Buffer) => {
					stdout += data.toString();
				});

				child.stderr.on("data", (data: Buffer) => {
					stderr += data.toString();
				});
			}

			child.on("close", (code: number | null) => {
				if (code === 0) {
					resolve(this.parseTestOutput(stdout));
				} else {
					reject(new Error(stderr || stdout || `Tests failed with exit code ${code}`));
				}
			});

			child.on("error", reject);
		});
	}

	/**
	 * Parse test output to extract results
	 */
	private parseTestOutput(output: string): any {
		// Parse Bun test output - this is simplified
		// In a real implementation, you'd parse the actual test results

		const lines = output.split("\n");
		const passedMatch = output.match(/(\d+) passed/);
		const failedMatch = output.match(/(\d+) failed/);
		const totalMatch = output.match(/(\d+) total/);

		return {
			passed: passedMatch ? Number.parseInt(passedMatch[1] || "0", 10) : 0,
			failed: failedMatch ? Number.parseInt(failedMatch[1] || "0", 10) : 0,
			total: totalMatch ? Number.parseInt(totalMatch[1] || "0", 10) : 0,
			output: output || "",
		};
	}

	/**
	 * Get timeout for specific test category
	 */
	private getTimeoutForPath(testPath: string): number {
		if (testPath.includes("integration")) {
			return TEST_CONFIG.timeouts.integration;
		} else if (testPath.includes("functional")) {
			return 120000; // 2 minutes
		} else if (testPath.includes("types")) {
			return TEST_CONFIG.timeouts.compilation;
		} else {
			return 60000; // 1 minute
		}
	}

	/**
	 * Merge category results into overall results
	 */
	private mergeResults(results: TestResults, category: string, categoryResult: any): void {
		const categoryKey = category as keyof typeof results.byCategory;

		if (results.byCategory[categoryKey]) {
			results.byCategory[categoryKey] = {
				total: categoryResult.total || 0,
				passed: categoryResult.passed || 0,
				failed: categoryResult.failed || 0,
				duration: categoryResult.duration || 0,
			};

			results.summary.total += categoryResult.total || 0;
			results.summary.passed += categoryResult.passed || 0;
			results.summary.failed += categoryResult.failed || 0;
		}
	}

	/**
	 * Generate comprehensive report
	 */
	private async generateReport(results: TestResults, options: ValidationOptions): Promise<void> {
		if (!options.output) return;

		const spinner = ora("Generating report...").start();

		try {
			if (options.output.endsWith(".html")) {
				const reportPath = await this.reporter.generateHTMLReport(results);
				spinner.succeed(`HTML report generated: ${reportPath}`);
			} else if (options.output.endsWith(".json")) {
				const reportPath = await this.reporter.generateJSONReport(results);
				spinner.succeed(`JSON report generated: ${reportPath}`);
			} else {
				const markdown = this.reporter.generateMarkdownSummary(results);
				const { promises: fs } = await import("node:fs");
				await fs.writeFile(options.output, markdown);
				spinner.succeed(`Markdown report generated: ${options.output}`);
			}
		} catch (error) {
			spinner.fail(`Report generation failed: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	/**
	 * Display final summary
	 */
	private displayFinalSummary(results: TestResults): void {
		console.log(`\n${"=".repeat(60)}`);
		console.log(chalk.bold.cyan("🎯 Validation Summary"));
		console.log("=".repeat(60));

		const consoleOutput = this.reporter.generateConsoleOutput(results);
		console.log(consoleOutput);

		// Exit with appropriate code
		if (results.summary.failed > 0) {
			process.exit(1);
		}
	}

	/**
	 * Watch mode for continuous validation
	 */
	private async runWatchMode(options: ValidationOptions): Promise<void> {
		console.log(chalk.blue("👀 Watch mode - running continuous validation...\n"));

		// Initial run
		await this.runQuickValidation(options);

		console.log(chalk.gray("\nWatching for changes... (Press Ctrl+C to exit)"));

		// In a real implementation, this would use fs.watch or chokidar
		// For now, simulate watch mode with periodic runs
		setInterval(async () => {
			console.log(chalk.blue("\n🔄 Detected changes, re-running validation..."));
			try {
				await this.runQuickValidation(options);
			} catch (error) {
				console.error(chalk.red(`Watch mode error: ${error instanceof Error ? error.message : String(error)}`));
			}
		}, 10000); // Check every 10 seconds
	}

	/**
	 * Parse command line arguments
	 */
	private parseArgs(args: string[]): ValidationOptions {
		const options: ValidationOptions = {};

		for (let i = 0; i < args.length; i++) {
			const arg = args[i];

			switch (arg) {
				case "--category":
				case "-c":
					options.category = args[++i];
					break;
				case "--output":
				case "-o":
					options.output = args[++i];
					break;
				case "--verbose":
				case "-v":
					options.verbose = true;
					break;
				case "--watch":
				case "-w":
					options.watch = true;
					break;
				case "--quick":
				case "-q":
					options.quick = true;
					break;
				case "--parallel":
				case "-p":
					options.parallel = true;
					break;
				case "--coverage":
					options.coverage = true;
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
${chalk.bold.cyan("Baseline Validation Runner")}

Run comprehensive validation tests against the baseline implementation.

${chalk.bold("Usage:")}
  bun run validation [options]

${chalk.bold("Options:")}
  -c, --category <name>   Run specific category (structural/content/types/functional/integration)
  -o, --output <path>     Generate report (html/json/md)
  -v, --verbose           Show detailed test output
  -w, --watch             Watch for changes and re-run
  -q, --quick             Run quick validation (structural + types only)
  -p, --parallel          Run test categories in parallel
  --coverage              Generate code coverage report
  -h, --help              Show this help message

${chalk.bold("Examples:")}
  bun run validation                           # Run full validation
  bun run validation --quick                   # Quick validation
  bun run validation --category types          # Types only
  bun run validation --output report.html     # With HTML report
  bun run validation --watch --quick          # Watch mode
  bun run validation --parallel --verbose     # Parallel with details

${chalk.bold("Categories:")}
  structural    File structure and imports
  content       AST comparison and template matching
  types         TypeScript compilation and type safety
  functional    Hook behavior and API functionality  
  integration   End-to-end Next.js integration
    `);
	}
}

// CLI Entry Point
if (import.meta.main) {
	const runner = new ValidationRunner();
	runner.run(process.argv.slice(2));
}

export { ValidationRunner };
