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

	for (const model of models) {
		const tenantField = cfg.tenantField || "tenantId";
		const hasTenantField = model.fields.some((f) => f.name === tenantField);
		const idField = model.fields.find((f) => f.isId);
		const idType = idField?.type === "String" ? "string" : "number";

		content.push(`export async function can${model.name}(`);
		content.push(`  action: PolicyAction,`);
		content.push(`  ctx: FlowCtx,`);
		content.push(`  id?: ${idType}`);
		content.push(`): Promise<PolicyResult> {`);
		content.push(`  // Default: allow all for authenticated users`);
		content.push(`  if (!ctx.user) {`);
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
		if (hasTenantField) {
			content.push(
				`      return { ok: true, data: ctx.tenantId ? { ${tenantField}: ctx.tenantId } : {} };`,
			);
		} else {
			content.push(`      return { ok: true, data: {} };`);
		}
		content.push(``);
		content.push(`    case "update":`);
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
