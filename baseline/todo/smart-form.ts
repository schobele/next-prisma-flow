import { z } from "zod";
import {
	TodoCreateInputSchema,
	TodoUpdateInputSchema,
	type Todo,
	type TodoFieldConfig,
	type TodoFormValidation,
} from "./types";

// ============================================================================
// TYPES - Smart form specific types and interfaces
// ============================================================================

/** Configuration for auto-save behavior */
export interface AutoSaveConfig {
	/** Enable auto-save functionality */
	enabled: boolean;

	/** Debounce delay in milliseconds */
	debounceMs: number;

	/** Auto-save trigger events */
	triggers: ("change" | "blur" | "interval")[];

	/** Interval for periodic auto-save (ms) */
	intervalMs?: number;

	/** Callback when auto-save succeeds */
	onSuccess?: (data: any) => void;

	/** Callback when auto-save fails */
	onError?: (error: Error) => void;

	/** Custom validation before auto-save */
	validateBeforeSave?: (data: any) => boolean;
}

/** Field metadata for smart form generation */
export interface FieldMetadata {
	/** Field name */
	name: string;

	/** Display label */
	label: string;

	/** Field type for rendering */
	type: "text" | "textarea" | "select" | "checkbox" | "date" | "number" | "email" | "password";

	/** Whether field is required */
	required: boolean;

	/** Placeholder text */
	placeholder?: string;

	/** Help text or description */
	description?: string;

	/** Validation schema for this field */
	schema: z.ZodSchema<any>;

	/** Options for select fields */
	options?: Array<{ value: any; label: string }>;

	/** Default value */
	defaultValue?: any;

	/** Field group for organization */
	group?: string;

	/** Display order */
	order?: number;

	/** Field visibility condition */
	condition?: (formData: any) => boolean;
}

/** Smart form configuration */
export interface SmartFormConfig {
	/** Form schema for validation */
	schema: z.ZodSchema<any>;

	/** Field metadata definitions */
	fields: FieldMetadata[];

	/** Auto-save configuration */
	autoSave?: AutoSaveConfig;

	/** Form layout configuration */
	layout?: {
		/** Number of columns */
		columns?: number;

		/** Field grouping */
		groups?: Array<{
			name: string;
			label: string;
			fields: string[];
		}>;
	};

	/** Custom validation rules */
	customValidation?: Array<{
		name: string;
		validator: (value: any, formData: any) => string | null;
		fields: string[];
	}>;
}

/** Result of smart form generation */
export interface SmartFormResult<T> {
	/** Generated field configurations */
	fields: Record<keyof T, TodoFieldConfig>;

	/** Form validation state */
	validation: TodoFormValidation;

	/** Form submission handler */
	submit: () => Promise<T | null>;

	/** Form reset handler */
	reset: () => void;

	/** Auto-save controls */
	autoSave: {
		/** Enable auto-save */
		enable: () => void;

		/** Disable auto-save */
		disable: () => void;

		/** Trigger manual save */
		save: () => Promise<void>;

		/** Get auto-save status */
		isEnabled: boolean;

		/** Get last save timestamp */
		lastSaved: Date | null;
	};

	/** Form data access */
	data: Partial<T>;

	/** Set form data */
	setData: (data: Partial<T>) => void;

	/** Get field by name */
	getField: (name: keyof T) => TodoFieldConfig;

	/** Validate specific field */
	validateField: (name: keyof T) => boolean;

	/** Validate entire form */
	validateForm: () => boolean;
}

// ============================================================================
// SCHEMA ANALYSIS - Extract field metadata from Zod schemas
// ============================================================================

/**
 * Analyze a Zod schema to extract field metadata for smart form generation.
 * This function introspects the schema structure to determine field types and requirements.
 */
export function analyzeSchema(schema: z.ZodSchema<any>): FieldMetadata[] {
	const fields: FieldMetadata[] = [];

	// Handle ZodObject schemas
	if (schema instanceof z.ZodObject) {
		const shape = schema.shape;

		for (const [fieldName, fieldSchema] of Object.entries(shape)) {
			const metadata = analyzeFieldSchema(fieldName, fieldSchema as z.ZodSchema<any>);
			if (metadata) {
				fields.push(metadata);
			}
		}
	}

	return fields.sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * Analyze individual field schema to determine field metadata.
 */
function analyzeFieldSchema(name: string, schema: z.ZodSchema<any>): FieldMetadata | null {
	let baseSchema = schema;
	let required = true;

	// Unwrap optional and nullable schemas
	if (schema instanceof z.ZodOptional) {
		required = false;
		baseSchema = schema._def.innerType;
	}

	if (schema instanceof z.ZodNullable) {
		required = false;
		baseSchema = schema._def.innerType;
	}

	// Determine field type and configuration
	let fieldType: FieldMetadata["type"] = "text";
	let options: FieldMetadata["options"];
	let placeholder: string | undefined;

	if (baseSchema instanceof z.ZodString) {
		// Handle string fields
		const checks = baseSchema._def.checks || [];

		if (checks.some((check: any) => check.kind === "email")) {
			fieldType = "email";
		} else if (name.toLowerCase().includes("password")) {
			fieldType = "password";
		} else if (
			name.toLowerCase().includes("description") ||
			checks.some((check: any) => check.kind === "min" && check.value > 100)
		) {
			fieldType = "textarea";
		}
	} else if (baseSchema instanceof z.ZodNumber) {
		fieldType = "number";
	} else if (baseSchema instanceof z.ZodBoolean) {
		fieldType = "checkbox";
	} else if (baseSchema instanceof z.ZodDate) {
		fieldType = "date";
	} else if (baseSchema instanceof z.ZodEnum) {
		fieldType = "select";
		options = baseSchema._def.values.map((value: any) => ({
			value,
			label: value.toString(),
		}));
	}

	return {
		name,
		label: formatFieldLabel(name),
		type: fieldType,
		required,
		placeholder,
		schema: baseSchema,
		options,
		order: getFieldOrder(name),
	};
}

/**
 * Generate human-readable label from field name.
 */
function formatFieldLabel(fieldName: string): string {
	return fieldName
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, (str) => str.toUpperCase())
		.trim();
}

/**
 * Determine field display order based on common patterns.
 */
function getFieldOrder(fieldName: string): number {
	const orderMap: Record<string, number> = {
		title: 10,
		name: 10,
		description: 20,
		status: 30,
		priority: 31,
		dueDate: 40,
		userId: 50,
		categoryId: 51,
		createdAt: 90,
		updatedAt: 91,
	};

	return orderMap[fieldName] || 50;
}

// ============================================================================
// SMART FORM BUILDERS - Generate forms from schemas
// ============================================================================

/**
 * Create a smart form for Todo creation with auto-generated fields and validation.
 * Uses schema introspection to build form configuration automatically.
 */
export function createTodoCreateForm(config: Partial<SmartFormConfig> = {}): SmartFormConfig {
	// Analyze the schema to extract field metadata
	const fields = analyzeSchema(TodoCreateInputSchema);

	// Apply configuration overrides
	const enhancedFields = fields.map((field) => {
		// Add Todo-specific enhancements
		switch (field.name) {
			case "title":
				return {
					...field,
					placeholder: "What needs to be done?",
					description: "A clear, concise title for your todo",
				};

			case "description":
				return {
					...field,
					placeholder: "Add additional details...",
					description: "Optional details about this todo",
				};

			case "status":
				return {
					...field,
					options: [
						{ value: "PENDING", label: "Pending" },
						{ value: "IN_PROGRESS", label: "In Progress" },
						{ value: "COMPLETED", label: "Completed" },
					],
					defaultValue: "PENDING",
				};

			case "priority":
				return {
					...field,
					options: [
						{ value: "LOW", label: "Low" },
						{ value: "MEDIUM", label: "Medium" },
						{ value: "HIGH", label: "High" },
					],
					defaultValue: "MEDIUM",
				};

			case "dueDate":
				return {
					...field,
					placeholder: "Select due date",
					description: "When should this be completed?",
				};

			default:
				return field;
		}
	});

	return {
		schema: TodoCreateInputSchema,
		fields: enhancedFields,
		autoSave: {
			enabled: true,
			debounceMs: 1000,
			triggers: ["change", "blur"],
			...config.autoSave,
		},
		layout: {
			columns: 1,
			groups: [
				{
					name: "basic",
					label: "Basic Information",
					fields: ["title", "description"],
				},
				{
					name: "details",
					label: "Details",
					fields: ["status", "priority", "dueDate"],
				},
				{
					name: "organization",
					label: "Organization",
					fields: ["userId", "categoryId"],
				},
			],
			...config.layout,
		},
		customValidation: [
			{
				name: "futureDate",
				validator: (value: any, formData: any) => {
					if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
						return "Due date cannot be in the past";
					}
					return null;
				},
				fields: ["dueDate"],
			},
			...(config.customValidation || []),
		],
		...config,
	};
}

/**
 * Create a smart form for Todo updates with conditional field visibility.
 */
export function createTodoUpdateForm(originalTodo: Todo, config: Partial<SmartFormConfig> = {}): SmartFormConfig {
	// Analyze the schema to extract field metadata
	const fields = analyzeSchema(TodoUpdateInputSchema);

	// Apply configuration overrides and conditional visibility
	const enhancedFields = fields.map((field) => {
		const baseField = {
			...field,
			defaultValue: originalTodo[field.name as keyof Todo],
		};

		// Add Todo-specific enhancements
		switch (field.name) {
			case "title":
				return {
					...baseField,
					placeholder: originalTodo.title,
					description: "Update the todo title",
				};

			case "description":
				return {
					...baseField,
					placeholder: originalTodo.description || "Add description...",
					description: "Update todo details",
				};

			case "status":
				return {
					...baseField,
					options: [
						{ value: "PENDING", label: "Pending" },
						{ value: "IN_PROGRESS", label: "In Progress" },
						{ value: "COMPLETED", label: "Completed" },
					],
				};

			case "priority":
				return {
					...baseField,
					options: [
						{ value: "LOW", label: "Low" },
						{ value: "MEDIUM", label: "Medium" },
						{ value: "HIGH", label: "High" },
					],
				};

			case "completedAt":
				return {
					...baseField,
					condition: (formData: any) => formData.status === "COMPLETED",
					description: "Automatically set when status is completed",
				};

			default:
				return baseField;
		}
	});

	return {
		schema: TodoUpdateInputSchema,
		fields: enhancedFields,
		autoSave: {
			enabled: true,
			debounceMs: 2000,
			triggers: ["change", "blur"],
			...config.autoSave,
		},
		layout: {
			columns: 1,
			groups: [
				{
					name: "basic",
					label: "Basic Information",
					fields: ["title", "description"],
				},
				{
					name: "status",
					label: "Status & Progress",
					fields: ["status", "priority", "completedAt"],
				},
				{
					name: "scheduling",
					label: "Scheduling",
					fields: ["dueDate"],
				},
			],
			...config.layout,
		},
		customValidation: [
			{
				name: "completedAtValidation",
				validator: (value: any, formData: any) => {
					if (formData.status === "COMPLETED" && !formData.completedAt) {
						return "Completed date is required when status is completed";
					}
					if (formData.status !== "COMPLETED" && formData.completedAt) {
						return "Completed date should only be set when status is completed";
					}
					return null;
				},
				fields: ["status", "completedAt"],
			},
			{
				name: "futureDueDate",
				validator: (value: any, formData: any) => {
					if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
						return "Due date cannot be in the past";
					}
					return null;
				},
				fields: ["dueDate"],
			},
			...(config.customValidation || []),
		],
		...config,
	};
}

// ============================================================================
// VALIDATION UTILITIES - Enhanced validation with custom rules
// ============================================================================

/**
 * Create a comprehensive validation function from smart form configuration.
 */
export function createValidator<T>(
	config: SmartFormConfig,
): (data: Partial<T>) => { isValid: boolean; errors: Record<string, string> } {
	return (data: Partial<T>) => {
		const errors: Record<string, string> = {};

		try {
			// Run Zod schema validation
			config.schema.parse(data);
		} catch (error) {
			if (error instanceof z.ZodError) {
				for (const issue of error.issues) {
					const path = issue.path.join(".");
					errors[path] = issue.message;
				}
			}
		}

		// Run custom validation rules
		if (config.customValidation) {
			for (const rule of config.customValidation) {
				for (const fieldName of rule.fields) {
					const validationError = rule.validator(data[fieldName as keyof T], data);
					if (validationError) {
						errors[fieldName] = validationError;
					}
				}
			}
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors,
		};
	};
}

/**
 * Create field-specific validation function.
 */
export function createFieldValidator<T>(
	config: SmartFormConfig,
	fieldName: keyof T,
): (value: any, formData: Partial<T>) => string | null {
	return (value: any, formData: Partial<T>) => {
		// Find field metadata
		const fieldMeta = config.fields.find((f) => f.name === fieldName);
		if (!fieldMeta) {
			return null;
		}

		// Run Zod validation for this field
		try {
			fieldMeta.schema.parse(value);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return error.issues[0]?.message || "Validation failed";
			}
		}

		// Run custom validation rules for this field
		if (config.customValidation) {
			for (const rule of config.customValidation) {
				if (rule.fields.includes(fieldName as string)) {
					const validationError = rule.validator(value, formData);
					if (validationError) {
						return validationError;
					}
				}
			}
		}

		return null;
	};
}

// ============================================================================
// AUTO-SAVE UTILITIES - Smart auto-save with conflict resolution
// ============================================================================

/** Auto-save manager for handling automated form persistence */
export class AutoSaveManager<T> {
	private config: AutoSaveConfig;
	private saveFunction: (data: Partial<T>) => Promise<T>;
	private validateFunction: (data: Partial<T>) => boolean;
	private debounceTimer: NodeJS.Timeout | null = null;
	private intervalTimer: NodeJS.Timeout | null = null;
	private lastSaved: Date | null = null;
	private isEnabled = false;

	constructor(
		config: AutoSaveConfig,
		saveFunction: (data: Partial<T>) => Promise<T>,
		validateFunction: (data: Partial<T>) => boolean,
	) {
		this.config = config;
		this.saveFunction = saveFunction;
		this.validateFunction = validateFunction;
		this.isEnabled = config.enabled;
	}

	/**
	 * Enable auto-save functionality
	 */
	enable(): void {
		this.isEnabled = true;

		// Start interval-based auto-save if configured
		if (this.config.triggers.includes("interval") && this.config.intervalMs) {
			this.intervalTimer = setInterval(() => {
				this.triggerSave();
			}, this.config.intervalMs);
		}
	}

	/**
	 * Disable auto-save functionality
	 */
	disable(): void {
		this.isEnabled = false;

		// Clear timers
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
			this.debounceTimer = null;
		}

		if (this.intervalTimer) {
			clearInterval(this.intervalTimer);
			this.intervalTimer = null;
		}
	}

	/**
	 * Trigger auto-save with debouncing
	 */
	triggerSave(data?: Partial<T>): void {
		if (!this.isEnabled) {
			return;
		}

		// Clear existing debounce timer
		if (this.debounceTimer) {
			clearTimeout(this.debounceTimer);
		}

		// Set new debounce timer
		this.debounceTimer = setTimeout(async () => {
			if (data) {
				await this.performSave(data);
			}
		}, this.config.debounceMs);
	}

	/**
	 * Perform immediate save without debouncing
	 */
	async save(data: Partial<T>): Promise<void> {
		if (!this.isEnabled) {
			return;
		}

		await this.performSave(data);
	}

	/**
	 * Internal save implementation
	 */
	private async performSave(data: Partial<T>): Promise<void> {
		try {
			// Validate before save if configured
			if (this.config.validateBeforeSave && !this.validateFunction(data)) {
				return;
			}

			// Perform the save
			await this.saveFunction(data);

			// Update last saved timestamp
			this.lastSaved = new Date();

			// Call success callback
			this.config.onSuccess?.(data);
		} catch (error) {
			const err = error instanceof Error ? error : new Error("Auto-save failed");
			this.config.onError?.(err);
		}
	}

	/**
	 * Get auto-save status
	 */
	getStatus(): { isEnabled: boolean; lastSaved: Date | null } {
		return {
			isEnabled: this.isEnabled,
			lastSaved: this.lastSaved,
		};
	}

	/**
	 * Cleanup resources
	 */
	destroy(): void {
		this.disable();
	}
}

// ============================================================================
// FORM FIELD UTILITIES - Helper functions for field management
// ============================================================================

/**
 * Create field configuration from metadata and current form state.
 */
export function createFieldConfig<T>(
	metadata: FieldMetadata,
	formData: Partial<T>,
	errors: Record<string, string>,
	touched: Record<string, boolean>,
	onChange: (field: keyof T, value: any) => void,
	onBlur: (field: keyof T) => void,
): TodoFieldConfig {
	const fieldName = metadata.name as keyof T;

	return {
		name: metadata.name,
		value: formData[fieldName] ?? metadata.defaultValue ?? "",
		onChange: (value: any) => onChange(fieldName, value),
		onBlur: () => onBlur(fieldName),
		error: errors[metadata.name],
		required: metadata.required,
		isValid: !errors[metadata.name],
		touched: touched[metadata.name] || false,
	};
}

/**
 * Filter fields based on conditional visibility rules.
 */
export function getVisibleFields(fields: FieldMetadata[], formData: any): FieldMetadata[] {
	return fields.filter((field) => {
		if (!field.condition) {
			return true;
		}
		return field.condition(formData);
	});
}

/**
 * Group fields according to layout configuration.
 */
export function groupFields(
	fields: FieldMetadata[],
	layout: SmartFormConfig["layout"],
): Record<string, FieldMetadata[]> {
	if (!layout?.groups) {
		return { default: fields };
	}

	const grouped: Record<string, FieldMetadata[]> = {};

	for (const group of layout.groups) {
		grouped[group.name] = fields.filter((field) => group.fields.includes(field.name));
	}

	// Add ungrouped fields to default group
	const groupedFieldNames = new Set(layout.groups.flatMap((group) => group.fields));
	const ungroupedFields = fields.filter((field) => !groupedFieldNames.has(field.name));

	if (ungroupedFields.length > 0) {
		grouped.default = ungroupedFields;
	}

	return grouped;
}
