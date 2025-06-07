export class FlowGeneratorError extends Error {
	constructor(
		message: string,
		public override cause?: unknown,
	) {
		super(message);
		this.name = "FlowGeneratorError";
	}
}

export class ConfigurationError extends FlowGeneratorError {
	constructor(
		message: string,
		public configKey?: string,
	) {
		super(message);
		this.name = "ConfigurationError";
	}
}

export class ModelNotFoundError extends FlowGeneratorError {
	constructor(modelName: string) {
		super(`Model "${modelName}" not found in Prisma schema`);
		this.name = "ModelNotFoundError";
	}
}

export class InvalidFieldError extends FlowGeneratorError {
	constructor(fieldName: string, modelName: string) {
		super(`Field "${fieldName}" not found in model "${modelName}"`);
		this.name = "InvalidFieldError";
	}
}

export class TemplateGenerationError extends FlowGeneratorError {
	constructor(templateName: string, modelName: string, cause?: unknown) {
		super(`Failed to generate ${templateName} template for model "${modelName}"`);
		this.name = "TemplateGenerationError";
		this.cause = cause;
	}
}

export class FileSystemError extends FlowGeneratorError {
	constructor(operation: string, filePath: string, cause?: unknown) {
		super(`Failed to ${operation} file at "${filePath}"`);
		this.name = "FileSystemError";
		this.cause = cause;
	}
}

export function handleGeneratorError(error: unknown): never {
	if (error instanceof FlowGeneratorError) {
		throw error;
	}

	if (error instanceof Error) {
		throw new FlowGeneratorError(`Unexpected error: ${error.message}`, error);
	}

	throw new FlowGeneratorError(`Unknown error occurred: ${String(error)}`, error);
}
