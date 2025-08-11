import {
	type DMMF,
	type GeneratorOptions,
	generatorHandler,
} from "@prisma/generator-helper";
import { parseConfig } from "./config";
import { getModels } from "./dmmf";
import { emitModel } from "./emit/model/index";
import { emitPoliciesScaffold } from "./emit/policies";
import { emitRuntime } from "./emit/runtime";

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
		const selectedModels =
			cfg.models === "all"
				? models
				: models.filter((m) => cfg.models.includes(m.name));

		await emitRuntime({ outDir, cfg });
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
