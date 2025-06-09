import { promises as fs } from "node:fs";
import { resolve } from "node:path";
import { createTwoFilesPatch } from "diff";
import chalk from "chalk";
import { TEST_CONFIG } from "../config";

export interface TestResults {
	summary: {
		total: number;
		passed: number;
		failed: number;
		skipped: number;
		duration: number;
	};
	byCategory: {
		structural: CategoryResults;
		content: CategoryResults;
		types: CategoryResults;
		functional: CategoryResults;
		integration: CategoryResults;
	};
	failed: FailedTest[];
	performance: PerformanceMetrics;
}

export interface CategoryResults {
	total: number;
	passed: number;
	failed: number;
	duration: number;
}

export interface FailedTest {
	name: string;
	category: string;
	error: string;
	file: string;
	line?: number;
	diff?: string;
	suggestions: string[];
	autoFixable: boolean;
}

export interface PerformanceMetrics {
	generationTime: number;
	compilationTime: number;
	testExecutionTime: number;
	memoryUsage?: number;
}

/**
 * Comprehensive test reporter for baseline validation results
 */
export class TestReporter {
	private outputDir: string;

	constructor(outputDir?: string) {
		this.outputDir = outputDir || resolve(__dirname, "../reports");
	}

	/**
	 * Generate comprehensive HTML report with visual diffs and insights
	 */
	async generateHTMLReport(results: TestResults): Promise<string> {
		await this.ensureOutputDir();

		const template = await this.loadHTMLTemplate();
		const reportData = {
			summary: this.createSummaryData(results),
			failedTests: this.formatFailedTests(results.failed),
			visualDiffs: await this.generateVisualDiffs(results.failed),
			performance: this.analyzePerformance(results),
			suggestions: this.generateActionableSuggestions(results),
			charts: this.generateChartData(results),
			timestamp: new Date().toISOString(),
			metadata: {
				generator: "next-prisma-flow",
				version: "0.2.1",
				baseline: "todo",
			},
		};

		const html = this.renderTemplate(template, reportData);
		const reportPath = resolve(this.outputDir, "baseline-validation-report.html");

		await fs.writeFile(reportPath, html);
		return reportPath;
	}

	/**
	 * Generate markdown summary for PRs and CLI output
	 */
	generateMarkdownSummary(results: TestResults): string {
		const { passed, failed, total } = results.summary;
		const passRate = Math.round((passed / total) * 100);
		const emoji = failed === 0 ? "✅" : "❌";

		let markdown = `
# 🧪 Baseline Validation Results ${emoji}

**Overall Score:** ${passRate}% (${passed}/${total} tests passed)

## 📊 Test Breakdown

| Category | Passed | Failed | Total | Success Rate |
|----------|---------|---------|-------|--------------|
| **Structural** | ${results.byCategory.structural.passed} | ${results.byCategory.structural.failed} | ${results.byCategory.structural.total} | ${this.calculateSuccessRate(results.byCategory.structural)}% |
| **Content** | ${results.byCategory.content.passed} | ${results.byCategory.content.failed} | ${results.byCategory.content.total} | ${this.calculateSuccessRate(results.byCategory.content)}% |
| **Types** | ${results.byCategory.types.passed} | ${results.byCategory.types.failed} | ${results.byCategory.types.total} | ${this.calculateSuccessRate(results.byCategory.types)}% |
| **Functional** | ${results.byCategory.functional.passed} | ${results.byCategory.functional.failed} | ${results.byCategory.functional.total} | ${this.calculateSuccessRate(results.byCategory.functional)}% |
| **Integration** | ${results.byCategory.integration.passed} | ${results.byCategory.integration.failed} | ${results.byCategory.integration.total} | ${this.calculateSuccessRate(results.byCategory.integration)}% |

## ⚡ Performance

- **Generation Time:** ${results.performance.generationTime}ms
- **Compilation Time:** ${results.performance.compilationTime}ms
- **Test Execution:** ${results.performance.testExecutionTime}ms
- **Total Duration:** ${results.summary.duration}ms
`;

		if (failed > 0) {
			markdown += this.formatFailureSummary(results.failed);
		}

		markdown += this.generateRecommendations(results);

		return markdown;
	}

	/**
	 * Generate detailed console output with colors
	 */
	generateConsoleOutput(results: TestResults): string {
		const { passed, failed, total } = results.summary;

		let output = "";

		// Header
		output += chalk.bold.cyan("\n🧪 Baseline Validation Results\n");
		output += `${"=".repeat(50)}\n\n`;

		// Summary
		if (failed === 0) {
			output += chalk.green.bold(`✅ All tests passed! (${passed}/${total})\n`);
		} else {
			output += chalk.red.bold(`❌ ${failed} test(s) failed (${passed}/${total} passed)\n`);
		}

		// Category breakdown
		output += `\n${chalk.bold("Test Categories:\n")}`;

		const categories = [
			{ name: "Structural", data: results.byCategory.structural },
			{ name: "Content", data: results.byCategory.content },
			{ name: "Types", data: results.byCategory.types },
			{ name: "Functional", data: results.byCategory.functional },
			{ name: "Integration", data: results.byCategory.integration },
		];

		for (const category of categories) {
			const successRate = this.calculateSuccessRate(category.data);
			const status = category.data.failed === 0 ? "✅" : "❌";
			const color = category.data.failed === 0 ? chalk.green : chalk.red;

			output += color(`  ${status} ${category.name}: ${category.data.passed}/${category.data.total} (${successRate}%)\n`);
		}

		// Performance
		output += `\n${chalk.bold("Performance:\n")}`;
		output += `  Generation: ${chalk.cyan(`${results.performance.generationTime}ms`)}\n`;
		output += `  Compilation: ${chalk.cyan(`${results.performance.compilationTime}ms`)}\n`;
		output += `  Tests: ${chalk.cyan(`${results.performance.testExecutionTime}ms`)}\n`;

		// Failed tests
		if (failed > 0) {
			output += `\n${chalk.bold.red("Failed Tests:\n")}`;

			for (const failure of results.failed.slice(0, 5)) {
				// Show first 5 failures
				output += chalk.red(`  ❌ ${failure.category}/${failure.name}\n`);
				output += chalk.gray(`     ${failure.error}\n`);

				if (failure.suggestions.length > 0) {
					output += chalk.yellow(`     💡 ${failure.suggestions[0]}\n`);
				}
			}

			if (results.failed.length > 5) {
				output += chalk.gray(`     ... and ${results.failed.length - 5} more failures\n`);
			}
		}

		// Recommendations
		const recommendations = this.generateRecommendations(results);
		if (recommendations.trim()) {
			output += `\n${chalk.bold.yellow("Recommendations:\n")}`;
			output += chalk.yellow(recommendations.replace(/^##? /gm, "  "));
		}

		return output;
	}

	/**
	 * Generate JSON report for CI/CD integration
	 */
	async generateJSONReport(results: TestResults): Promise<string> {
		const reportData = {
			version: "1.0",
			timestamp: new Date().toISOString(),
			results,
			metadata: {
				generator: "next-prisma-flow",
				baseline: "todo",
				configuration: TEST_CONFIG.validation,
			},
		};

		const reportPath = resolve(this.outputDir, "baseline-validation.json");
		await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));

		return reportPath;
	}

	/**
	 * Generate test coverage report
	 */
	async generateCoverageReport(results: TestResults): Promise<void> {
		const coverage = this.analyzeCoverage(results);
		const reportPath = resolve(this.outputDir, "coverage.json");

		await fs.writeFile(reportPath, JSON.stringify(coverage, null, 2));
	}

	/**
	 * Private helper methods
	 */

	private async ensureOutputDir(): Promise<void> {
		await fs.mkdir(this.outputDir, { recursive: true });
	}

	private async loadHTMLTemplate(): Promise<string> {
		// In a real implementation, this would load from a template file
		return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Baseline Validation Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; }
        .metric-value { font-size: 24px; font-weight: bold; color: #495057; }
        .metric-label { color: #6c757d; margin-top: 5px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #495057; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; }
        .failed-test { background: #fff5f5; border-left: 4px solid #e53e3e; padding: 15px; margin-bottom: 10px; border-radius: 4px; }
        .suggestion { background: #fffbeb; border-left: 4px solid #f6ad55; padding: 10px; margin-top: 10px; border-radius: 4px; }
        .diff { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; font-family: monospace; font-size: 12px; }
        .chart-container { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Baseline Validation Report</h1>
        <p>Generated on {{timestamp}} for {{metadata.generator}} v{{metadata.version}}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <div class="metric-value">{{summary.passRate}}%</div>
            <div class="metric-label">Pass Rate</div>
        </div>
        <div class="metric">
            <div class="metric-value">{{summary.passed}}/{{summary.total}}</div>
            <div class="metric-label">Tests Passed</div>
        </div>
        <div class="metric">
            <div class="metric-value">{{performance.totalTime}}ms</div>
            <div class="metric-label">Total Duration</div>
        </div>
        <div class="metric">
            <div class="metric-value">{{summary.score}}</div>
            <div class="metric-label">Quality Score</div>
        </div>
    </div>

    {{#if failedTests.length}}
    <div class="section">
        <h2>Failed Tests</h2>
        {{#each failedTests}}
        <div class="failed-test">
            <h3>{{category}}/{{name}}</h3>
            <p><strong>Error:</strong> {{error}}</p>
            {{#if diff}}
            <div class="diff">{{diff}}</div>
            {{/if}}
            {{#each suggestions}}
            <div class="suggestion">💡 {{this}}</div>
            {{/each}}
        </div>
        {{/each}}
    </div>
    {{/if}}

    <div class="section">
        <h2>Performance Analysis</h2>
        <div class="chart-container">
            <!-- Performance charts would go here -->
            <p>Generation: {{performance.generationTime}}ms</p>
            <p>Compilation: {{performance.compilationTime}}ms</p>
            <p>Test Execution: {{performance.testExecutionTime}}ms</p>
        </div>
    </div>

    <div class="section">
        <h2>Recommendations</h2>
        {{#each suggestions}}
        <div class="suggestion">{{this}}</div>
        {{/each}}
    </div>
</body>
</html>
    `;
	}

	private renderTemplate(template: string, data: any): string {
		// Simple template rendering - in production, use a proper template engine
		let result = template;

		// Replace simple variables
		result = result.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
			const value = this.getNestedValue(data, path);
			return value !== undefined ? String(value) : match;
		});

		return result;
	}

	private getNestedValue(obj: any, path: string): any {
		return path.split(".").reduce((current, key) => current?.[key], obj);
	}

	private createSummaryData(results: TestResults) {
		const { passed, failed, total } = results.summary;
		const passRate = Math.round((passed / total) * 100);

		return {
			...results.summary,
			passRate,
			score: this.calculateOverallScore(results),
		};
	}

	private formatFailedTests(failed: FailedTest[]) {
		return failed.map((test) => ({
			...test,
			diff: test.diff ? this.formatDiff(test.diff) : undefined,
		}));
	}

	private async generateVisualDiffs(failed: FailedTest[]): Promise<string[]> {
		const diffs = [];

		for (const test of failed) {
			if (test.diff) {
				diffs.push(this.formatDiff(test.diff));
			}
		}

		return diffs;
	}

	private formatDiff(diff: string): string {
		// Format diff for HTML display
		return diff
			.replace(/^-(.*)$/gm, '<span style="color: #e53e3e; background: #fff5f5;">-$1</span>')
			.replace(/^\+(.*)$/gm, '<span style="color: #38a169; background: #f0fff4;">+$1</span>')
			.replace(/\n/g, "<br>");
	}

	private analyzePerformance(results: TestResults): any {
		return {
			...results.performance,
			totalTime: results.summary.duration,
			efficiency: this.calculateEfficiency(results),
			bottlenecks: this.identifyBottlenecks(results),
		};
	}

	private generateActionableSuggestions(results: TestResults): string[] {
		const suggestions = [];

		// Performance suggestions
		if (results.performance.generationTime > 10000) {
			suggestions.push("Consider optimizing generator templates for better performance");
		}

		if (results.performance.compilationTime > 30000) {
			suggestions.push("TypeScript compilation is slow - check for complex type definitions");
		}

		// Quality suggestions
		const failureRate = results.summary.failed / results.summary.total;
		if (failureRate > 0.1) {
			suggestions.push("High failure rate detected - review generator logic and templates");
		}

		// Category-specific suggestions
		if (results.byCategory.structural.failed > 0) {
			suggestions.push("Fix structural issues first - they often cascade to other problems");
		}

		if (results.byCategory.types.failed > 0) {
			suggestions.push("Type errors can be fixed by updating generator type definitions");
		}

		return suggestions;
	}

	private generateChartData(results: TestResults) {
		return {
			categories: Object.entries(results.byCategory).map(([name, data]) => ({
				name,
				passed: data.passed,
				failed: data.failed,
				total: data.total,
			})),
			performance: [
				{ name: "Generation", time: results.performance.generationTime },
				{ name: "Compilation", time: results.performance.compilationTime },
				{ name: "Tests", time: results.performance.testExecutionTime },
			],
		};
	}

	private formatFailureSummary(failed: FailedTest[]): string {
		if (failed.length === 0) return "";

		let summary = "\n## ❌ Failed Tests\n\n";

		// Group by category
		const byCategory = failed.reduce(
			(acc, test) => {
				acc[test.category] = acc[test.category] || [];
				acc[test.category]?.push(test);
				return acc;
			},
			{} as Record<string, FailedTest[]>,
		);

		for (const [category, tests] of Object.entries(byCategory)) {
			summary += `### ${category}\n\n`;

			for (const test of tests.slice(0, 3)) {
				// Show first 3 per category
				summary += `- **${test.name}**: ${test.error}\n`;

				if (test.suggestions.length > 0) {
					summary += `  - 💡 ${test.suggestions[0]}\n`;
				}
			}

			if (tests.length > 3) {
				summary += `  - ... and ${tests.length - 3} more failures\n`;
			}

			summary += "\n";
		}

		return summary;
	}

	private generateRecommendations(results: TestResults): string {
		const recommendations = [];

		// Immediate actions
		if (results.summary.failed > 0) {
			recommendations.push("🔧 **Immediate Actions:**");
			recommendations.push("- Review failed tests above and fix generator templates");
			recommendations.push("- Run `bun run baseline:compare` to see detailed diffs");
		}

		// Performance improvements
		if (results.performance.generationTime > 5000) {
			recommendations.push("\n⚡ **Performance:**");
			recommendations.push("- Generator is running slowly - consider template optimizations");
		}

		// Quality improvements
		const passRate = (results.summary.passed / results.summary.total) * 100;
		if (passRate < 90) {
			recommendations.push("\n📈 **Quality:**");
			recommendations.push("- Consider updating baseline to match current best practices");
			recommendations.push("- Review generator configuration and template logic");
		}

		return recommendations.join("\n");
	}

	private calculateSuccessRate(category: CategoryResults): number {
		return category.total === 0 ? 100 : Math.round((category.passed / category.total) * 100);
	}

	private calculateOverallScore(results: TestResults): string {
		const passRate = (results.summary.passed / results.summary.total) * 100;

		if (passRate >= 95) return "A+";
		if (passRate >= 90) return "A";
		if (passRate >= 85) return "B+";
		if (passRate >= 80) return "B";
		if (passRate >= 75) return "C+";
		if (passRate >= 70) return "C";
		return "D";
	}

	private calculateEfficiency(results: TestResults): number {
		const totalTime = results.summary.duration;
		const testCount = results.summary.total;

		return Math.round(testCount / (totalTime / 1000)); // Tests per second
	}

	private identifyBottlenecks(results: TestResults): string[] {
		const bottlenecks = [];

		if (results.performance.generationTime > results.performance.compilationTime * 2) {
			bottlenecks.push("Code generation is the primary bottleneck");
		}

		if (results.performance.compilationTime > results.performance.testExecutionTime * 5) {
			bottlenecks.push("TypeScript compilation is slow");
		}

		return bottlenecks;
	}

	private analyzeCoverage(results: TestResults): any {
		return {
			files: {
				tested: TEST_CONFIG.validation.compareFiles.length,
				total: TEST_CONFIG.validation.compareFiles.length,
				percentage: 100,
			},
			functions: {
				tested: results.byCategory.functional.passed,
				total: results.byCategory.functional.total,
				percentage: this.calculateSuccessRate(results.byCategory.functional),
			},
			types: {
				tested: results.byCategory.types.passed,
				total: results.byCategory.types.total,
				percentage: this.calculateSuccessRate(results.byCategory.types),
			},
		};
	}
}
