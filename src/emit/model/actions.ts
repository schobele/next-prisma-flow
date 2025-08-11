import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../config";
import { write } from "../fs";
import { header, imp, impType } from "../strings";

export async function emitActions({
	modelDir,
	dmmf: _dmmf,
	model,
	cfg,
}: {
	modelDir: string;
	dmmf: DMMF.Document;
	model: DMMF.Model;
	cfg: FlowConfig;
}) {
	const modelLower = model.name.toLowerCase();
	const idField = model.fields.find((f) => f.isId);
	const idType = idField?.type === "String" ? "string" : "number";

	const content = [];
	content.push(header("actions.server.ts"));
	content.push(`"use server";`);
	content.push(``);
	content.push(imp(cfg.prismaImport, ["prisma"]));
	content.push(imp("zod", ["z"]));
	content.push(imp("../core", ["invalidateTags", "keys", "FlowCtx"]));
	content.push(imp("../policies", [`can${model.name}`]));
  content.push(imp(`./selects`, [`${model.name}DeepSelect`]));
  content.push(imp(`./zod`, [`${model.name}CreateSchema`, `${model.name}UpdateSchema`]));
  content.push(impType(`./zod`, [`Flow${model.name}Create`, `Flow${model.name}Update`]));
	content.push(
		imp(`./writes`, [
			`transform${model.name}Create`,
			`transform${model.name}Update`,
		]),
	);
	content.push(``);

  content.push(`export async function create${model.name}(data: Flow${model.name}Create, ctx: FlowCtx) {`);
	content.push(`  const policy = await can${model.name}("create", ctx);`);
	content.push(
		`  if (!policy.ok) return { ok: false, error: policy.message };`,
	);
	content.push(``);
  content.push(`  const parsed = ${model.name}CreateSchema.safeParse(data);`);
	content.push(`  if (!parsed.success) {`);
	content.push(
		`    return { ok: false, error: "Invalid data", issues: parsed.error.issues };`,
	);
	content.push(`  }`);
	content.push(``);
	content.push(`  try {`);
  content.push(`    const createData = transform${model.name}Create(parsed.data as any);`);
	content.push(`    const item = await prisma.${modelLower}.create({`);
	content.push(`      data: { ...createData, ...policy.data },`);
	content.push(`      select: ${model.name}DeepSelect`);
	content.push(`    });`);
	content.push(``);
	content.push(`    await invalidateTags([keys.m("${model.name}").tag()]);`);
	content.push(`    return { ok: true, data: item };`);
	content.push(`  } catch (error) {`);
	content.push(`    console.error("Error creating ${model.name}:", error);`);
	content.push(`    return { ok: false, error: "Failed to create" };`);
	content.push(`  }`);
	content.push(`}`);
	content.push(``);

  content.push(`export async function update${model.name}(id: ${idType}, data: Flow${model.name}Update, ctx: FlowCtx) {`);
	content.push(`  const policy = await can${model.name}("update", ctx, id);`);
	content.push(
		`  if (!policy.ok) return { ok: false, error: policy.message };`,
	);
	content.push(``);
  content.push(`  // Validate update payload against UpdateSchema (all fields optional)`);
  content.push(`  const parsedUpdate = ${model.name}UpdateSchema.safeParse(data);`);
  content.push(`  if (!parsedUpdate.success) {`);
  content.push(`    return { ok: false, error: "Invalid data", issues: parsedUpdate.error.issues };`);
  content.push(`  }`);
  content.push(`  try {`);
  content.push(`    const updateData = transform${model.name}Update(parsedUpdate.data as any);`);
	content.push(`    const item = await prisma.${modelLower}.update({`);
	content.push(
		`      where: { ${idField?.name || "id"}: id, ...policy.where },`,
	);
	content.push(`      data: { ...updateData, ...policy.data },`);
	content.push(`      select: ${model.name}DeepSelect`);
	content.push(`    });`);
	content.push(``);
	content.push(`    await invalidateTags([`);
	content.push(`      keys.m("${model.name}").tag(),`);
	content.push(`      keys.m("${model.name}").tag(String(id))`);
	content.push(`    ]);`);
	content.push(`    return { ok: true, data: item };`);
	content.push(`  } catch (error) {`);
	content.push(`    console.error("Error updating ${model.name}:", error);`);
	content.push(`    return { ok: false, error: "Failed to update" };`);
	content.push(`  }`);
	content.push(`}`);
	content.push(``);

	content.push(
		`export async function delete${model.name}(id: ${idType}, ctx: FlowCtx) {`,
	);
	content.push(`  const policy = await can${model.name}("delete", ctx, id);`);
	content.push(
		`  if (!policy.ok) return { ok: false, error: policy.message };`,
	);
	content.push(``);
	content.push(`  try {`);
	content.push(`    await prisma.${modelLower}.delete({`);
	content.push(
		`      where: { ${idField?.name || "id"}: id, ...policy.where }`,
	);
	content.push(`    });`);
	content.push(``);
	content.push(`    await invalidateTags([`);
	content.push(`      keys.m("${model.name}").tag(),`);
	content.push(`      keys.m("${model.name}").tag(String(id))`);
	content.push(`    ]);`);
	content.push(`    return { ok: true };`);
	content.push(`  } catch (error) {`);
	content.push(`    console.error("Error deleting ${model.name}:", error);`);
	content.push(`    return { ok: false, error: "Failed to delete" };`);
	content.push(`  }`);
	content.push(`}`);

	await write(join(modelDir, "actions.server.ts"), content.join("\n"));
}
