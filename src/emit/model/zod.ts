import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../config";
// avoid Node types dependency here
import {
	isEnum,
	isRelation,
	isScalar,
	scalarZodFor,
	targetModel,
} from "../../dmmf";
import { write } from "../fs";
import { header, imp, impType } from "../strings";

export async function emitZod({
	modelDir,
	dmmf,
	model,
	cfg,
}: {
	modelDir: string;
	dmmf: DMMF.Document;
	model: DMMF.Model;
	cfg: FlowConfig;
}) {
	const content: string[] = [];
	content.push(header("zod.ts"));
	content.push(imp("zod", ["z"]));
  // No Prisma type exports: consumers should infer from Zod schemas directly
	content.push(
		impType(`./selects`, [
			`${model.name}DeepSelect`,
			`${model.name}ShallowSelect`,
		]),
	);
	content.push("");

	// Reusable helpers per file
	content.push(`// Reusable scalar field helpers for ${model.name}`);
	content.push(
		`// Note: Relations are added via named schemas to avoid cycles`,
	);
	content.push("");

	// Deep (default) schemas with named relation components
	const deepSections = generateDeepSchemasNamed(model, dmmf, cfg);
	content.push(...deepSections);
	content.push("");

	// Shallow schema (scalars/enums only)
	content.push(generateShallowSchema(model, dmmf, cfg));
	content.push("");

	// Write schema with discriminated unions and named relation components (no z.any())
	const writeSections = generateWriteSchemasNamed(model, dmmf);
	content.push(...writeSections);
	content.push("");

  // No separate create/update schemas; use WriteSchema for both flows to keep API lean

	await write(`${modelDir}/zod.ts`, content.join("\n"));
}

function generateDeepSchemasNamed(
	model: DMMF.Model,
	dmmf: DMMF.Document,
	cfg: FlowConfig,
): string[] {
	const out: string[] = [];
	const emitted = new Set<string>();

	function configuredFieldsFor(m: DMMF.Model) {
		const configured = cfg.perModelSelect[m.name] || [];
		return configured.length > 0
			? m.fields.filter((f) => configured.includes(f.name))
			: m.fields;
	}

	function schemaNameForPath(path: string[]) {
		// Root path: [Model] => FlowModelSchema; nested: FlowA_B where names concatenated
		if (path.length === 1) return `Flow${path[0]}Schema`;
		return `Flow${path.join("")}`;
	}

	function ensureSchema(path: string[], ancestors: Set<string>) {
		const currentModelName = path[path.length - 1];
		const currentModel = dmmf.datamodel.models.find(
			(m) => m.name === currentModelName,
		);
		if (!currentModel)
			throw new Error(`Model ${currentModelName} not found in DMMF`);
		const name = schemaNameForPath(path);
		if (emitted.has(name)) return;

		const lines: string[] = [];
    lines.push(`export const ${name} = z.object({`);

		const fields = configuredFieldsFor(currentModel);
		for (const field of fields) {
			if (isScalar(field)) {
				let zodType = scalarZodFor(field);
				if (field.isList) zodType = `z.array(${zodType})`;
				if (
					!field.isRequired &&
					!field.isList &&
					!zodType.includes(".optional()")
				)
					zodType = `${zodType}.optional()`;
				lines.push(`  ${field.name}: ${zodType},`);
			} else if (isEnum(field)) {
				const enumDef = dmmf.datamodel.enums.find((e) => e.name === field.type);
				if (enumDef) {
					const enumValues = enumDef.values
						.map((v) => `"${v.name}"`)
						.join(", ");
					let enumSchema = `z.enum([${enumValues}])`;
					if (field.isList) enumSchema = `z.array(${enumSchema})`;
					if (!field.isRequired && !field.isList)
						enumSchema = `${enumSchema}.optional()`;
					lines.push(`  ${field.name}: ${enumSchema},`);
				}
			} else if (isRelation(field)) {
				// Only include relations that are enabled via select config
				const configured = cfg.perModelSelect[currentModel.name] || [];
				const includeRelation =
					configured.length === 0 ? false : configured.includes(field.name);
				if (!includeRelation) continue;

				const target = targetModel(field);
				if (ancestors.has(target)) continue; // avoid cycles
				const childPath = [...path, target];
				const childName = schemaNameForPath(childPath);
				// emit child first
				const nextAnc = new Set(ancestors);
				nextAnc.add(currentModel.name);
				ensureSchema(childPath, nextAnc);

				const ref = `z.lazy(() => ${childName})`;
				if (field.isList)
					lines.push(
						`  ${field.name}: z.array(${ref})${field.isRequired ? "" : ".optional()"},`,
					);
				else
					lines.push(
						`  ${field.name}: ${ref}${field.isRequired ? "" : ".optional()"},`,
					);
			}
		}
		lines.push(`});`);
		out.push(lines.join("\n"));
		emitted.add(name);
	}

	ensureSchema([model.name], new Set());
	out.push(
		`export type Flow${model.name} = z.infer<typeof Flow${model.name}Schema>;`,
	);
  // Back-compat alias (kept simple)
  out.push(`export const ${model.name}DeepSchema = Flow${model.name}Schema;`);
	return out;
}

function generateShallowSchema(
	model: DMMF.Model,
	dmmf: DMMF.Document,
	cfg: FlowConfig,
): string {
	const lines: string[] = [];
	const schemaName = `${model.name}ShallowSchema`;

	lines.push(`export const ${schemaName} = z.object({`);

	const configuredFields = cfg.perModelSelect[model.name] || [];
	const fieldsToInclude =
		configuredFields.length > 0
			? model.fields.filter((f) => configuredFields.includes(f.name))
			: model.fields;

	for (const field of fieldsToInclude) {
		if (isScalar(field)) {
			let zodType = scalarZodFor(field);
			if (field.isList) zodType = `z.array(${zodType})`;
			if (
				!field.isRequired &&
				!field.isList &&
				!zodType.includes(".optional()")
			) {
				zodType = `${zodType}.optional()`;
			}
			lines.push(`  ${field.name}: ${zodType},`);
		} else if (isEnum(field)) {
			const enumDef = dmmf.datamodel.enums.find((e) => e.name === field.type);
			if (enumDef) {
				const enumValues = enumDef.values.map((v) => `"${v.name}"`).join(", ");
				let enumSchema = `z.enum([${enumValues}])`;
				if (field.isList) enumSchema = `z.array(${enumSchema})`;
				if (!field.isRequired && !field.isList)
					enumSchema = `${enumSchema}.optional()`;
				lines.push(`  ${field.name}: ${enumSchema},`);
			}
		}
		// Skip relations in shallow schema
	}

	lines.push(`});`);
	lines.push(
		`export type Flow${model.name}Shallow = z.infer<typeof ${schemaName}>;`,
	);
	lines.push(
    `// Shallow Prisma payload type removed; prefer inferring from Zod schema`,
	);

	return lines.join("\n");
}

function generateWriteSchemasNamed(
	model: DMMF.Model,
	dmmf: DMMF.Document,
): string[] {
	const out: string[] = [];
	const emittedCreateData = new Set<string>();
	const emittedUpdateData = new Set<string>();
	const emittedWriteUnion = new Set<string>();

	function pathName(path: string[]) {
		return `Flow${path.join("")}`;
	}
	function createDataName(path: string[]) {
		return `${pathName(path)}CreateData`;
	}
	function updateDataName(path: string[]) {
		return `${pathName(path)}UpdateData`;
	}
	function writeUnionName(path: string[]) {
		return `${pathName(path)}Write`;
	}

	function emitCreateData(path: string[], ancestors: Set<string>) {
		const currentModelName = path[path.length - 1];
		const currentModel = dmmf.datamodel.models.find(
			(m) => m.name === currentModelName,
		);
		if (!currentModel)
			throw new Error(`Model ${currentModelName} not found in DMMF`);
		const name = createDataName(path);
		if (emittedCreateData.has(name)) return;

		const lines: string[] = [];
		lines.push(`export const ${name} = z.object({`);
		for (const field of currentModel.fields) {
			// scalars/enums writable
			if (
				(isScalar(field) || isEnum(field)) &&
				!field.isId &&
				!field.isReadOnly &&
				!field.isGenerated &&
				!field.isUpdatedAt
			) {
				let t = scalarZodFor(field);
				if (!field.isRequired || field.hasDefaultValue) t = `${t}.optional()`;
				lines.push(`  ${field.name}: ${t},`);
			} else if (isRelation(field) && !field.isReadOnly) {
				const target = targetModel(field);
				if (ancestors.has(target)) continue; // avoid cycles
				const nextPath = [...path, target];
				const unionName = writeUnionName(nextPath);
				// ensure nested unions are emitted
				const nextAnc = new Set(ancestors);
				nextAnc.add(currentModelName);
				emitWriteUnion(nextPath, nextAnc, field.isList, /*forUpdate*/ false);
				const ref = `z.lazy(() => ${unionName})`;
				lines.push(
					`  ${field.name}: ${field.isList ? `z.array(${ref}).optional()` : `${ref}.optional()`},`,
				);
			}
		}
		lines.push(`});`);
		out.push(lines.join("\n"));
		emittedCreateData.add(name);
	}

	function emitUpdateData(path: string[], ancestors: Set<string>) {
		const currentModelName = path[path.length - 1];
		const currentModel = dmmf.datamodel.models.find(
			(m) => m.name === currentModelName,
		);
		if (!currentModel)
			throw new Error(`Model ${currentModelName} not found in DMMF`);
		const name = updateDataName(path);
		if (emittedUpdateData.has(name)) return;

		const lines: string[] = [];
		lines.push(`export const ${name} = z.object({`);
		for (const field of currentModel.fields) {
			if (
				(isScalar(field) || isEnum(field)) &&
				!field.isId &&
				!field.isReadOnly &&
				!field.isGenerated
			) {
				let t = scalarZodFor(field);
				if (!t.includes(".optional()")) t = `${t}.optional()`;
				lines.push(`  ${field.name}: ${t},`);
			} else if (isRelation(field) && !field.isReadOnly) {
				const target = targetModel(field);
				if (ancestors.has(target)) continue;
				const nextPath = [...path, target];
				const unionName = writeUnionName(nextPath);
				const nextAnc = new Set(ancestors);
				nextAnc.add(currentModelName);
				emitWriteUnion(nextPath, nextAnc, field.isList, /*forUpdate*/ true);
				const ref = `z.lazy(() => ${unionName})`;
				lines.push(
					`  ${field.name}: ${field.isList ? `z.array(${ref}).optional()` : `${ref}.optional()`},`,
				);
			}
		}
		lines.push(`});`);
		out.push(lines.join("\n"));
		emittedUpdateData.add(name);
	}

	function emitWriteUnion(
		path: string[],
		ancestors: Set<string>,
		isList: boolean,
		forUpdate: boolean,
	) {
		const currentModelName = path[path.length - 1];
		const currentModel = dmmf.datamodel.models.find(
			(m) => m.name === currentModelName,
		);
		if (!currentModel)
			throw new Error(`Model ${currentModelName} not found in DMMF`);
		const name = writeUnionName(path);
		if (emittedWriteUnion.has(name)) return;

		// id and uniques
		const idField = currentModel.fields.find((f) => f.isId);
		const uniqueFields = currentModel.fields.filter(
			(f) => f.isUnique && isScalar(f),
		);

		// ensure data schemas exist
		emitCreateData(path, ancestors);
		if (forUpdate) emitUpdateData(path, ancestors);

		const parts: string[] = [];
		// connect
		if (idField || uniqueFields.length) {
			const fields: string[] = [
				`    flowRelationStrategy: z.literal("connect")`,
			];
			if (idField)
				fields.push(`    ${idField.name}: ${scalarZodFor(idField)}.optional()`);
			for (const uf of uniqueFields)
				fields.push(`    ${uf.name}: ${scalarZodFor(uf)}.optional()`);
			parts.push(`z.object({\n${fields.join(",\n")}\n  })`);
		}
		// create
		parts.push(
			`z.object({\n    flowRelationStrategy: z.literal("create"),\n    ...${createDataName(path)}.shape\n  })`,
		);
		// connectOrCreate
		{
			const fields: string[] = [
				`    flowRelationStrategy: z.literal("connectOrCreate")`,
			];
			if (idField)
				fields.push(`    ${idField.name}: ${scalarZodFor(idField)}.optional()`);
			for (const uf of uniqueFields)
				fields.push(`    ${uf.name}: ${scalarZodFor(uf)}.optional()`);
			// allow create subset fields optionally
			for (const f of currentModel.fields) {
				if (
					isScalar(f) &&
					!f.isId &&
					!f.isReadOnly &&
					!f.isGenerated &&
					!f.isUpdatedAt &&
					!uniqueFields.includes(f)
				) {
					fields.push(`    ${f.name}: ${scalarZodFor(f)}.optional()`);
				}
			}
			parts.push(`z.object({\n${fields.join(",\n")}\n  })`);
		}
		if (forUpdate) {
			// update
			parts.push(
				`z.object({\n    flowRelationStrategy: z.literal("update"),\n    ...${updateDataName(path)}.shape\n  })`,
			);
			// upsert
			const upsertFields: string[] = [
				`    flowRelationStrategy: z.literal("upsert")`,
			];
			if (idField)
				upsertFields.push(
					`    ${idField.name}: ${scalarZodFor(idField)}.optional()`,
				);
			for (const uf of uniqueFields)
				upsertFields.push(`    ${uf.name}: ${scalarZodFor(uf)}.optional()`);
			parts.push(
				`z.object({\n${upsertFields.join(",\n")},\n    create: ${createDataName(path)},\n    update: ${updateDataName(path)}\n  })`,
			);
			// disconnect/delete
			parts.push(`z.object({ flowRelationStrategy: z.literal("disconnect") })`);
			if (!isList)
				parts.push(`z.object({ flowRelationStrategy: z.literal("delete") })`);
			// set (list-only)
			if (isList)
				parts.push(
					`z.object({ flowRelationStrategy: z.literal("set"), ${idField ? `${idField.name}: ${scalarZodFor(idField)}.optional()` : ""} })`.replace(
						/, \}/,
						" }",
					),
				);
		}

		const defaultFields: string[] = [];
		if (idField)
			defaultFields.push(
				`    ${idField.name}: ${scalarZodFor(idField)}.optional()`,
			);
		for (const uf of uniqueFields)
			defaultFields.push(`    ${uf.name}: ${scalarZodFor(uf)}.optional()`);
		for (const f of currentModel.fields) {
			if (
				isScalar(f) &&
				!f.isId &&
				!f.isReadOnly &&
				!f.isGenerated &&
				!f.isUpdatedAt &&
				!uniqueFields.includes(f)
			) {
				defaultFields.push(`    ${f.name}: ${scalarZodFor(f)}.optional()`);
			}
		}

		const def = `export const ${name} = z.discriminatedUnion("flowRelationStrategy", [${parts.join(", ")}] ).or(z.object({\n${defaultFields.join(",\n")}\n  }))`;
		out.push(def + ";");
		emittedWriteUnion.add(name);
	}

  // Ensure root create/update data schemas exist for top-level exports
  emitCreateData([model.name], new Set());
  emitUpdateData([model.name], new Set());

  // Export top-level create/update schemas inferred from named data
  out.push(`export const ${model.name}CreateSchema = Flow${model.name}CreateData;`);
  out.push(`export type Flow${model.name}Create = z.infer<typeof ${model.name}CreateSchema>;`);
  out.push(`export const ${model.name}UpdateSchema = Flow${model.name}UpdateData;`);
  out.push(`export type Flow${model.name}Update = z.infer<typeof ${model.name}UpdateSchema>;`);

  // Type-only convenience alias for write inputs
  out.push(`export type Flow${model.name}Write = Flow${model.name}Create | Flow${model.name}Update;`);

	return out;
}

// removed: legacy generator for inline flexible relation schemas (superseded by named write unions)

// No separate create/update schemas (lean API)
