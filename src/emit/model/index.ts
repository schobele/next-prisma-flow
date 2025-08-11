import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../config";
import { emitActions } from "./actions";
import { emitBarrel } from "./barrel";
import { emitForms } from "./forms";
import { emitHooks } from "./hooks";
import { emitQueries } from "./queries";
import { emitSelects } from "./selects";
import { emitWrites } from "./writes";
import { emitZod } from "./zod";

export async function emitModel({
	outDir,
	dmmf,
	model,
	cfg,
}: {
	outDir: string;
	dmmf: DMMF.Document;
	model: DMMF.Model;
	cfg: FlowConfig;
}) {
	const modelDir = join(outDir, model.name.toLowerCase());

	await emitSelects({ modelDir, dmmf, model, cfg });
	await emitZod({ modelDir, dmmf, model, cfg });
	await emitWrites({ modelDir, dmmf, model, cfg });
	await emitQueries({ modelDir, dmmf, model, cfg });
	await emitActions({ modelDir, dmmf, model, cfg });
	await emitHooks({ modelDir, dmmf, model, cfg });
	await emitForms({ modelDir, model, cfg });
	await emitBarrel({ modelDir, model });
}
