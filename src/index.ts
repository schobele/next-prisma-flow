import {
	type DMMF,
	type GeneratorOptions,
	generatorHandler,
} from "@prisma/generator-helper";
import { parseConfig } from "./config";
import { getModels } from "./dmmf";
import { emitModel } from "./emit/model/index";
import { emitPoliciesScaffold } from "./emit/policies";
import { emitPrisma } from "./emit/prisma";
import { emitRuntime } from "./emit/runtime";
import { emitCheatSheet } from "./emit/cheatsheet";

const PRETTY_NAME = "next-prisma-flow-state-engine";

generatorHandler({
	onManifest() {
		return {
			prettyName: PRETTY_NAME,
			requiresGenerators: ["prisma-client-js"],
			defaultOutput: "./generated/flow",
		};
	},
	async onGenerate(options: GeneratorOptions) {
		const cfg = parseConfig(options);
		const outDir = options.generator.output?.value!;

		const models = getModels(options.dmmf);
		
		// Set default scalar-only selects for models without explicit config
		for (const model of models) {
			if (!cfg.perModelSelect[model.name]) {
				cfg.perModelSelect[model.name] = model.fields
					.filter(f => f.kind === "scalar" || f.kind === "enum")
					.map(f => f.name);
			}
		}
		
		const selectedModels =
			cfg.models === "all"
				? models
				: models.filter((m) => cfg.models.includes(m.name));

		await emitPrisma({ outputDir: outDir, cfg });
		await emitRuntime({ outDir, cfg, models: selectedModels as DMMF.Model[] });
		await emitCheatSheet({ outDir });
		await emitPoliciesScaffold({
			outDir,
			models: selectedModels as DMMF.Model[],
			cfg,
		});

		for (const model of selectedModels) {
			await emitModel({ outDir, dmmf: options.dmmf, model, cfg });
		}
	},
});
