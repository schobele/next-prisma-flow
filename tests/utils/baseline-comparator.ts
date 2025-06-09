import { promises as fs } from "node:fs";
import { resolve } from "node:path";
import { createTwoFilesPatch } from "diff";
import { ASTParser, type ASTAnalysis, type FunctionInfo, type TypeInfo } from "./ast-parser";
import { TEST_CONFIG } from "../config";

export interface ComparisonResult {
	matches: boolean;
	differences: Difference[];
	suggestions: FixSuggestion[];
	visualDiff?: string;
	score: number; // 0-100, where 100 is perfect match
}

export interface Difference {
	type: "missing" | "extra" | "modified" | "structural";
	category: "function" | "type" | "import" | "export" | "content";
	item: string;
	expected?: any;
	actual?: any;
	severity: "error" | "warning" | "info";
	message: string;
}

export interface FixSuggestion {
	type: string;
	message: string;
	autoFixable: boolean;
	codeAction?: string;
	priority: "high" | "medium" | "low";
}

export interface TemplateMap {
	[from: string]: string;
}

/**
 * Advanced baseline comparison utility that performs deep semantic analysis
 */
export class BaselineComparator {
	private templateMap: TemplateMap;

	constructor(templateMap: TemplateMap = {}) {
		this.templateMap = {
			Todo: "{{ModelName}}",
			todo: "{{modelName}}",
			todos: "{{modelNamePlural}}",
			TodoCreateInput: "{{ModelName}}CreateInput",
			TodoUpdateInput: "{{ModelName}}UpdateInput",
			...templateMap,
		};
	}

	/**
	 * Compare generated code against baseline with comprehensive analysis
	 */
	async compareToBaseline(
		generatedCode: string,
		baselineFile: string,
		context: ComparisonContext = {},
	): Promise<ComparisonResult> {
		const baselineCode = await this.loadBaselineFile(baselineFile);

		// Parse both files into AST first (without normalization to preserve syntax)
		const generatedAST = ASTParser.parseCode(generatedCode, context.generatedFile || "generated.ts");
		const baselineAST = ASTParser.parseCode(baselineCode, baselineFile);

		// Apply normalization for content comparison only
		const normalizedGenerated = this.normalizeTemplate(generatedCode);
		const normalizedBaseline = this.normalizeTemplate(baselineCode);

		// Perform multi-level comparison
		const differences: Difference[] = [];

		// 1. Structural comparison
		differences.push(...this.compareStructure(generatedAST, baselineAST));

		// 2. Function comparison
		differences.push(...this.compareFunctions(generatedAST.functions, baselineAST.functions));

		// 3. Type comparison
		differences.push(...this.compareTypes(generatedAST.types, baselineAST.types));

		// 4. Import/Export comparison
		differences.push(...this.compareImportsExports(generatedAST, baselineAST));

		// 5. Content-level comparison for things AST might miss
		differences.push(...this.compareContent(normalizedGenerated, normalizedBaseline));

		// Generate suggestions
		const suggestions = this.generateFixSuggestions(differences);

		// Calculate match score
		const score = this.calculateMatchScore(differences, generatedAST, baselineAST);

		// Generate visual diff if there are differences
		const visualDiff =
			differences.length > 0
				? createTwoFilesPatch(
						baselineFile,
						context.generatedFile || "generated.ts",
						normalizedBaseline,
						normalizedGenerated,
						"baseline",
						"generated",
					)
				: undefined;

		return {
			matches: differences.length === 0,
			differences,
			suggestions,
			visualDiff,
			score,
		};
	}

	/**
	 * Compare multiple files in parallel
	 */
	async compareFiles(fileMapping: Record<string, string>): Promise<Record<string, ComparisonResult>> {
		const results: Record<string, ComparisonResult> = {};

		const comparisons = Object.entries(fileMapping).map(async ([baselineFile, generatedCode]) => {
			const result = await this.compareToBaseline(generatedCode, baselineFile, {
				generatedFile: baselineFile.replace("baseline", "generated"),
			});
			return [baselineFile, result] as const;
		});

		const completed = await Promise.all(comparisons);

		for (const [file, result] of completed) {
			results[file] = result;
		}

		return results;
	}

	/**
	 * Normalize template variables while preserving semantics
	 */
	private normalizeTemplate(code: string): string {
		let normalized = code;

		// Apply template mappings
		for (const [from, to] of Object.entries(this.templateMap)) {
			// Handle different contexts with word boundaries
			normalized = normalized.replace(new RegExp(`\\b${this.escapeRegex(from)}\\b`, "g"), to);
		}

		// Clean up generated timestamps and other dynamic content
		for (const pattern of TEST_CONFIG.validation.ignorePatterns) {
			normalized = normalized.replace(pattern, "");
		}

		// Normalize whitespace and formatting
		normalized = this.normalizeWhitespace(normalized);

		return normalized;
	}

	/**
	 * Compare structural elements (high-level organization)
	 */
	private compareStructure(generated: ASTAnalysis, baseline: ASTAnalysis): Difference[] {
		const differences: Difference[] = [];

		// Check export count
		if (generated.exports.length !== baseline.exports.length) {
			differences.push({
				type: "modified",
				category: "export",
				item: "export count",
				expected: baseline.exports.length,
				actual: generated.exports.length,
				severity: "error",
				message: `Expected ${baseline.exports.length} exports, got ${generated.exports.length}`,
			});
		}

		// Check function count
		if (generated.functions.length !== baseline.functions.length) {
			differences.push({
				type: "modified",
				category: "function",
				item: "function count",
				expected: baseline.functions.length,
				actual: generated.functions.length,
				severity: "warning",
				message: `Expected ${baseline.functions.length} functions, got ${generated.functions.length}`,
			});
		}

		return differences;
	}

	/**
	 * Compare function signatures and implementations
	 */
	private compareFunctions(generated: FunctionInfo[], baseline: FunctionInfo[]): Difference[] {
		const differences: Difference[] = [];
		const generatedMap = new Map(generated.map((f) => [f.name, f]));
		const baselineMap = new Map(baseline.map((f) => [f.name, f]));

		// Check for missing functions
		for (const [name, baselineFunc] of baselineMap) {
			if (!generatedMap.has(name)) {
				differences.push({
					type: "missing",
					category: "function",
					item: name,
					expected: baselineFunc,
					severity: "error",
					message: `Missing function: ${name}`,
				});
			}
		}

		// Check for extra functions
		for (const [name, generatedFunc] of generatedMap) {
			if (!baselineMap.has(name)) {
				differences.push({
					type: "extra",
					category: "function",
					item: name,
					actual: generatedFunc,
					severity: "warning",
					message: `Unexpected function: ${name}`,
				});
			}
		}

		// Compare matching functions
		for (const [name, generatedFunc] of generatedMap) {
			const baselineFunc = baselineMap.get(name);
			if (!baselineFunc) continue;

			// Compare function signatures
			if (generatedFunc.async !== baselineFunc.async) {
				differences.push({
					type: "modified",
					category: "function",
					item: `${name}.async`,
					expected: baselineFunc.async,
					actual: generatedFunc.async,
					severity: "error",
					message: `Function ${name} async mismatch`,
				});
			}

			if (generatedFunc.parameters.length !== baselineFunc.parameters.length) {
				differences.push({
					type: "modified",
					category: "function",
					item: `${name}.parameters`,
					expected: baselineFunc.parameters.length,
					actual: generatedFunc.parameters.length,
					severity: "error",
					message: `Function ${name} parameter count mismatch`,
				});
			}

			// Compare parameter types
			for (let i = 0; i < Math.min(generatedFunc.parameters.length, baselineFunc.parameters.length); i++) {
				const genParam = generatedFunc.parameters[i];
				const baseParam = baselineFunc.parameters[i];

				if (genParam?.type !== baseParam?.type) {
					differences.push({
						type: "modified",
						category: "function",
						item: `${name}.parameters[${i}].type`,
						expected: baseParam?.type,
						actual: genParam?.type,
						severity: "error",
						message: `Parameter ${genParam?.name} type mismatch in function ${name}`,
					});
				}
			}
		}

		return differences;
	}

	/**
	 * Compare type definitions
	 */
	private compareTypes(generated: TypeInfo[], baseline: TypeInfo[]): Difference[] {
		const differences: Difference[] = [];
		const generatedMap = new Map(generated.map((t) => [t.name, t]));
		const baselineMap = new Map(baseline.map((t) => [t.name, t]));

		// Check for missing types
		for (const [name, baselineType] of baselineMap) {
			if (!generatedMap.has(name)) {
				differences.push({
					type: "missing",
					category: "type",
					item: name,
					expected: baselineType,
					severity: "error",
					message: `Missing type: ${name}`,
				});
			}
		}

		// Check for extra types
		for (const [name, generatedType] of generatedMap) {
			if (!baselineMap.has(name)) {
				differences.push({
					type: "extra",
					category: "type",
					item: name,
					actual: generatedType,
					severity: "info",
					message: `Extra type: ${name}`,
				});
			}
		}

		// Compare matching types
		for (const [name, generatedType] of generatedMap) {
			const baselineType = baselineMap.get(name);
			if (!baselineType) continue;

			if (generatedType.kind !== baselineType.kind) {
				differences.push({
					type: "modified",
					category: "type",
					item: `${name}.kind`,
					expected: baselineType.kind,
					actual: generatedType.kind,
					severity: "error",
					message: `Type ${name} kind mismatch (expected ${baselineType.kind}, got ${generatedType.kind})`,
				});
			}

			// Compare properties
			this.compareTypeProperties(name, generatedType.properties, baselineType.properties, differences);
		}

		return differences;
	}

	/**
	 * Compare type properties
	 */
	private compareTypeProperties(typeName: string, generated: any[], baseline: any[], differences: Difference[]): void {
		const generatedMap = new Map(generated.map((p) => [p.name, p]));
		const baselineMap = new Map(baseline.map((p) => [p.name, p]));

		for (const [propName, baselineProp] of baselineMap) {
			const generatedProp = generatedMap.get(propName);

			if (!generatedProp) {
				differences.push({
					type: "missing",
					category: "type",
					item: `${typeName}.${propName}`,
					expected: baselineProp,
					severity: "error",
					message: `Missing property ${propName} in type ${typeName}`,
				});
				continue;
			}

			if (generatedProp.type !== baselineProp.type) {
				differences.push({
					type: "modified",
					category: "type",
					item: `${typeName}.${propName}.type`,
					expected: baselineProp.type,
					actual: generatedProp.type,
					severity: "error",
					message: `Property ${propName} type mismatch in ${typeName}`,
				});
			}

			if (generatedProp.optional !== baselineProp.optional) {
				differences.push({
					type: "modified",
					category: "type",
					item: `${typeName}.${propName}.optional`,
					expected: baselineProp.optional,
					actual: generatedProp.optional,
					severity: "warning",
					message: `Property ${propName} optionality mismatch in ${typeName}`,
				});
			}
		}
	}

	/**
	 * Compare imports and exports
	 */
	private compareImportsExports(generated: ASTAnalysis, baseline: ASTAnalysis): Difference[] {
		const differences: Difference[] = [];

		// Compare exports
		const generatedExports = new Set(generated.exports);
		const baselineExports = new Set(baseline.exports);

		for (const exp of baselineExports) {
			if (!generatedExports.has(exp)) {
				differences.push({
					type: "missing",
					category: "export",
					item: exp,
					severity: "error",
					message: `Missing export: ${exp}`,
				});
			}
		}

		for (const exp of generatedExports) {
			if (!baselineExports.has(exp)) {
				differences.push({
					type: "extra",
					category: "export",
					item: exp,
					severity: "info",
					message: `Extra export: ${exp}`,
				});
			}
		}

		return differences;
	}

	/**
	 * Compare content for patterns AST might miss
	 */
	private compareContent(generated: string, baseline: string): Difference[] {
		const differences: Difference[] = [];

		// Check for specific patterns or comments that indicate proper implementation
		const patterns = [
			{ name: "optimistic updates", pattern: /optimistic/i },
			{ name: "error handling", pattern: /catch|error|throw/i },
			{ name: "cache invalidation", pattern: /revalidate|invalidate/i },
			{ name: "type safety", pattern: /type\s+\w+/i },
		];

		for (const { name, pattern } of patterns) {
			const inBaseline = pattern.test(baseline);
			const inGenerated = pattern.test(generated);

			if (inBaseline && !inGenerated) {
				differences.push({
					type: "missing",
					category: "content",
					item: name,
					severity: "warning",
					message: `Generated code missing ${name} implementation`,
				});
			}
		}

		return differences;
	}

	/**
	 * Generate actionable fix suggestions
	 */
	private generateFixSuggestions(differences: Difference[]): FixSuggestion[] {
		const suggestions: FixSuggestion[] = [];

		for (const diff of differences) {
			const suggestion = this.createSuggestion(diff);
			if (suggestion) {
				suggestions.push(suggestion);
			}
		}

		// Sort by priority and group by type
		return suggestions.sort((a, b) => {
			const priorityOrder = { high: 0, medium: 1, low: 2 };
			return priorityOrder[a.priority] - priorityOrder[b.priority];
		});
	}

	/**
	 * Create specific suggestion for a difference
	 */
	private createSuggestion(diff: Difference): FixSuggestion | null {
		switch (diff.type) {
			case "missing":
				if (diff.category === "function") {
					return {
						type: "add_function",
						message: `Add missing function: ${diff.item}`,
						autoFixable: false,
						priority: "high",
					};
				} else if (diff.category === "type") {
					return {
						type: "add_type",
						message: `Add missing type: ${diff.item}`,
						autoFixable: false,
						priority: "high",
					};
				}
				break;

			case "modified":
				if (diff.category === "function") {
					return {
						type: "fix_function",
						message: `Fix function signature: ${diff.item}`,
						autoFixable: false,
						priority: "high",
					};
				}
				break;

			case "extra":
				return {
					type: "remove_extra",
					message: `Consider removing extra ${diff.category}: ${diff.item}`,
					autoFixable: false,
					priority: "low",
				};
		}

		return null;
	}

	/**
	 * Calculate overall match score
	 */
	private calculateMatchScore(differences: Difference[], generated: ASTAnalysis, baseline: ASTAnalysis): number {
		if (differences.length === 0) return 100;

		const totalElements = baseline.functions.length + baseline.types.length + baseline.exports.length;
		const errorCount = differences.filter((d) => d.severity === "error").length;
		const warningCount = differences.filter((d) => d.severity === "warning").length;

		// Weight errors more heavily than warnings
		const penalty = errorCount * 10 + warningCount * 3;
		const score = Math.max(0, 100 - (penalty / totalElements) * 100);

		return Math.round(score);
	}

	/**
	 * Load baseline file content
	 */
	private async loadBaselineFile(fileName: string): Promise<string> {
		const fullPath = resolve(TEST_CONFIG.baseline.todo, fileName);
		return fs.readFile(fullPath, "utf-8");
	}

	/**
	 * Utility methods
	 */
	private escapeRegex(str: string): string {
		return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}

	private normalizeWhitespace(code: string): string {
		return code
			.replace(/\r\n/g, "\n") // Normalize line endings
			.replace(/\t/g, "  ") // Convert tabs to spaces
			.replace(/[ \t]+$/gm, "") // Remove trailing whitespace
			.replace(/\n{3,}/g, "\n\n"); // Collapse multiple blank lines
	}
}

export interface ComparisonContext {
	generatedFile?: string;
	modelName?: string;
	templateVars?: TemplateMap;
}
