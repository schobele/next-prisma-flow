import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../config";
import { write } from "./fs";
import { header, impType } from "./strings";

export async function emitPoliciesScaffold({
	outDir,
	models,
	cfg,
}: {
	outDir: string;
	models: DMMF.Model[];
	cfg: FlowConfig;
}) {
	const content = [];
	content.push(header("policies.ts"));
	content.push(impType("./core", ["FlowCtx"]));
	content.push(``);

	content.push(`/**`);
	content.push(` * Policy result that controls data access`);
	content.push(` * - ok: Whether the operation is allowed`);
	content.push(` * - message: Error message if denied`);
	content.push(` * - where: Additional conditions for queries`);
	content.push(` * - data: Data to merge into mutations (uses deep merge for nested operations)`);
	content.push(` */`);
	content.push(`type PolicyResult = {`);
	content.push(`  ok: boolean;`);
	content.push(`  message?: string;`);
	content.push(`  where?: any;`);
	content.push(`  data?: any;`);
	content.push(`};`);
	content.push(``);

	content.push(
		`type PolicyAction = "list" | "read" | "create" | "update" | "delete";`,
	);
	content.push(``);
	
	if (cfg.tenantField) {
		content.push(`/**`);
		content.push(` * Multi-tenancy configuration`);
		content.push(` * Tenant field: ${cfg.tenantField}`);
		if (cfg.tenantModel) {
			content.push(` * Tenant model: ${cfg.tenantModel}`);
		}
		content.push(` * `);
		content.push(` * The policy data is deeply merged with operation data, ensuring`);
		content.push(` * tenant isolation even for nested creates and updates.`);
		content.push(` * `);
		content.push(` * Example: When creating a Todo with a nested List creation,`);
		content.push(` * both the Todo AND the nested List will receive the tenant connection.`);
		content.push(` */`);
		content.push(``);
	}

	for (const model of models) {
		const tenantField = cfg.tenantField || "tenantId";
		const hasTenantField = model.fields.some((f) => f.name === tenantField);
		const idField = model.fields.find((f) => f.isId);
		const idType = idField?.type === "String" ? "string" : "number";
		
		// Find the relation name for the tenant field
		// If tenantModel is specified, use it to find the correct relation
		let tenantRelationName: string | undefined;
		
		if (cfg.tenantModel) {
			// Find relation that points to the tenant model and uses the tenant field
			const tenantRelation = model.fields.find(
				(f) => f.type === cfg.tenantModel && 
				       f.relationFromFields?.includes(tenantField)
			);
			tenantRelationName = tenantRelation?.name;
		} else {
			// Fallback: find any relation that uses the tenant field
			const tenantRelation = model.fields.find(
				(f) => f.relationFromFields?.includes(tenantField)
			);
			tenantRelationName = tenantRelation?.name;
		}

		content.push(`export async function can${model.name}(`);
		content.push(`  action: PolicyAction,`);
		content.push(`  ctx: FlowCtx,`);
		content.push(`  id?: ${idType}`);
		content.push(`): Promise<PolicyResult> {`);
		content.push(`  // Default: allow all for authenticated users`);
		content.push(`  if (!ctx.userId) {`);
		content.push(
			`    return { ok: false, message: "Authentication required" };`,
		);
		content.push(`  }`);
		content.push(``);
		content.push(`  switch (action) {`);
		content.push(`    case "list":`);
		content.push(`    case "read":`);
		content.push(`      // Tenant filtering if model has tenant field`);
		if (hasTenantField) {
			content.push(
				`      return { ok: true, where: ctx.tenantId ? { ${tenantField}: ctx.tenantId } : {} };`,
			);
		} else {
			content.push(`      return { ok: true, where: {} };`);
		}
		content.push(``);
		content.push(`    case "create":`);
		if (hasTenantField && tenantRelationName) {
			content.push(`      // Tenant connection will be deep-merged into nested creates as well`);
			// Use relation operation instead of foreign key
			content.push(
				`      return { ok: true, data: ctx.tenantId ? { ${tenantRelationName}: { connect: { id: ctx.tenantId } } } : {} };`,
			);
		} else if (hasTenantField) {
			// Fallback to foreign key if relation name not found
			content.push(
				`      return { ok: true, data: ctx.tenantId ? { ${tenantField}: ctx.tenantId } : {} };`,
			);
		} else {
			content.push(`      return { ok: true, data: {} };`);
		}
		content.push(``);
		content.push(`    case "update":`);
		content.push(`      // For update, provide both where (for filtering) and data (for nested creates)`);
		if (hasTenantField && tenantRelationName) {
			content.push(
				`      return { `,
			);
			content.push(
				`        ok: true, `,
			);
			content.push(
				`        where: ctx.tenantId ? { ${tenantField}: ctx.tenantId } : {},`,
			);
			content.push(
				`        data: ctx.tenantId ? { ${tenantRelationName}: { connect: { id: ctx.tenantId } } } : {}`,
			);
			content.push(
				`      };`,
			);
		} else if (hasTenantField) {
			content.push(
				`      return { `,
			);
			content.push(
				`        ok: true, `,
			);
			content.push(
				`        where: ctx.tenantId ? { ${tenantField}: ctx.tenantId } : {},`,
			);
			content.push(
				`        data: ctx.tenantId ? { ${tenantField}: ctx.tenantId } : {}`,
			);
			content.push(
				`      };`,
			);
		} else {
			content.push(`      return { ok: true, where: {}, data: {} };`);
		}
		content.push(``);
		content.push(`    case "delete":`);
		content.push(`      // Ownership check could be added here`);
		if (hasTenantField) {
			content.push(
				`      return { ok: true, where: ctx.tenantId ? { ${tenantField}: ctx.tenantId } : {} };`,
			);
		} else {
			content.push(`      return { ok: true, where: {} };`);
		}
		content.push(``);
		content.push(`    default:`);
		content.push(`      return { ok: false, message: "Unknown action" };`);
		content.push(`  }`);
		content.push(`}`);
		content.push(``);
	}

	await write(join(outDir, "policies.ts"), content.join("\n"));
}
