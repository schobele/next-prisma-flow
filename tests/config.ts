import { resolve } from "node:path";

export const TEST_CONFIG = {
	// Paths
	baseline: {
		root: resolve(__dirname, "../baseline"),
		todo: resolve(__dirname, "../baseline/todo"),
		golden: resolve(__dirname, "../baseline/todo-golden"),
	},

	generated: {
		root: resolve(__dirname, "../examples/todolist/generated/flow"),
		models: ["todo", "category", "user"],
	},

	generator: {
		entry: resolve(__dirname, "../index.ts"),
		templates: resolve(__dirname, "../src/templates"),
		testSchema: resolve(__dirname, "./fixtures/test-schema.prisma"),
	},

	debug: {
		preserveOnFailure: true,
	},

	// Test configuration
	timeouts: {
		generation: 30000, // 30s for code generation
		compilation: 60000, // 60s for TypeScript compilation
		integration: 300000, // 5m for integration tests
	},

	// Validation settings
	validation: {
		// Which files to compare against baseline
		compareFiles: [
			"actions.ts",
			"atoms.ts",
			"hooks.ts",
			"types.ts",
			"routes.ts",
			"form-provider.tsx",
			"smart-form.ts",
			"namespace.ts",
			"index.ts",
		],

		// Template variable mappings for normalization
		templateMappings: {
			Todo: "{{ModelName}}",
			todo: "{{modelName}}",
			todos: "{{modelNamePlural}}",
			TodoCreateInput: "{{ModelName}}CreateInput",
			TodoUpdateInput: "{{ModelName}}UpdateInput",
		},

		// Ignore patterns for content comparison
		ignorePatterns: [
			/\/\/ Generated at: .*/, // Timestamps
			/\/\* .* \*\//, // Block comments
			/^\s*\/\/.*$/m, // Line comments
			// NOTE: Don't ignore import statements as they're essential for syntax validity
		],
	},
} as const;

export type TestConfig = typeof TEST_CONFIG;
