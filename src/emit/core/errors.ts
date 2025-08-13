import { header } from "../strings";

export function emitErrors() {
  const content = [];
  content.push(header("core/errors.ts"));
  content.push(``);
  content.push(`import type { ZodIssue } from "zod";`);
  content.push(``);
  content.push(`export class FlowError extends Error {`);
  content.push(`  constructor(message: string, public code: string) {`);
  content.push(`    super(message);`);
  content.push(`    this.name = 'FlowError';`);
  content.push(`  }`);
  content.push(`}`);
  content.push(``);
  content.push(`export class FlowPolicyError extends FlowError {`);
  content.push(`  constructor(message: string = "Permission denied") {`);
  content.push(`    super(message, 'POLICY_DENIED');`);
  content.push(`    this.name = 'FlowPolicyError';`);
  content.push(`  }`);
  content.push(`}`);
  content.push(``);
  content.push(`export class FlowValidationError extends FlowError {`);
  content.push(`  constructor(public issues: ZodIssue[]) {`);
  content.push(`    const message = issues.map(i => \`\${i.path.join('.')}: \${i.message}\`).join(', ');`);
  content.push(`    super(message || 'Validation failed', 'VALIDATION_ERROR');`);
  content.push(`    this.name = 'FlowValidationError';`);
  content.push(`  }`);
  content.push(`}`);
  content.push(``);
  content.push(`export class FlowNotFoundError extends FlowError {`);
  content.push(`  constructor(resource: string, id?: string | number) {`);
  content.push(`    const message = id ? \`\${resource} with id \${id} not found\` : \`\${resource} not found\`;`);
  content.push(`    super(message, 'NOT_FOUND');`);
  content.push(`    this.name = 'FlowNotFoundError';`);
  content.push(`  }`);
  content.push(`}`);

  return content.join("\n");
}