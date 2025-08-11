import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../config";
import { write } from "../fs";
import { header, imp, impType } from "../strings";

export async function emitHooks({
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
	const idField = model.fields.find((f) => f.isId);
	const idType = idField?.type === "String" ? "string" : "number";

	const content = [];
	content.push(header("hooks.ts"));
	content.push(`"use client";`);
	content.push(``);
	content.push(
		imp("@tanstack/react-query", ["useQuery", "useMutation", "useQueryClient"]),
	);
	content.push(imp("react", ["useState"]));
	content.push(imp("../core/keys", ["keys"]));
	content.push(imp("../core/provider", ["useFlowCtx"]));
	content.push(impType(`./queries.server`, [`${model.name}ListParams`]));
	content.push(
		impType(`./zod`, [`Flow${model.name}`, `Flow${model.name}Write`]),
	);
	content.push(``);

	content.push(`export function use${model.name}(id: ${idType}) {`);
	content.push(`  const ctx = useFlowCtx();`);
	content.push(`  return useQuery({`);
	content.push(`    queryKey: keys.m("${model.name}").byId(String(id)),`);
	content.push(`    queryFn: async () => {`);
	content.push(
		`      const { get${model.name}ById } = await import("./queries.server");`,
	);
	content.push(`      return get${model.name}ById(id, ctx);`);
	content.push(`    }`);
	content.push(`  });`);
	content.push(`}`);
	content.push(``);

	content.push(
		`export function use${model.name}List(params?: ${model.name}ListParams) {`,
	);
	content.push(`  const ctx = useFlowCtx();`);
	content.push(
		`  const [localParams, setLocalParams] = useState(params || {});`,
	);
	content.push(``);
	content.push(`  const query = useQuery({`);
	content.push(`    queryKey: keys.m("${model.name}").list(localParams),`);
	content.push(`    queryFn: async () => {`);
	content.push(
		`      const { list${model.name}s } = await import("./queries.server");`,
	);
	content.push(`      return list${model.name}s(localParams, ctx);`);
	content.push(`    }`);
	content.push(`  });`);
	content.push(``);
	content.push(`  return {`);
	content.push(`    ...query,`);
	content.push(`    params: localParams,`);
	content.push(`    setParams: setLocalParams`);
	content.push(`  };`);
	content.push(`}`);
	content.push(``);

	content.push(`export function useCreate${model.name}() {`);
	content.push(`  const ctx = useFlowCtx();`);
	content.push(`  const queryClient = useQueryClient();`);
	content.push(``);
	content.push(`  return useMutation({`);
	content.push(`    mutationFn: async (data: Flow${model.name}Write) => {`);
	content.push(
		`      const { create${model.name} } = await import("./actions.server");`,
	);
	content.push(`      const result = await create${model.name}(data, ctx);`);
	content.push(`      if (!result.ok) throw result;`);
	content.push(`      return result.data;`);
	content.push(`    },`);
	content.push(`    onSuccess: () => {`);
	content.push(
		`      queryClient.invalidateQueries({ queryKey: [keys.m("${model.name}").tag()] });`,
	);
	content.push(`    }`);
	content.push(`  });`);
	content.push(`}`);
	content.push(``);

	content.push(`export function useUpdate${model.name}(id: ${idType}) {`);
	content.push(`  const ctx = useFlowCtx();`);
	content.push(`  const queryClient = useQueryClient();`);
	content.push(``);
	content.push(`  return useMutation({`);
	content.push(
		`    mutationFn: async (data: Partial<Flow${model.name}Write>) => {`,
	);
	content.push(
		`      const { update${model.name} } = await import("./actions.server");`,
	);
	content.push(
		`      const result = await update${model.name}(id, data, ctx);`,
	);
	content.push(`      if (!result.ok) throw result;`);
	content.push(`      return result.data;`);
	content.push(`    },`);
	content.push(`    onSuccess: () => {`);
	content.push(
		`      queryClient.invalidateQueries({ queryKey: keys.m("${model.name}").byId(String(id)) });`,
	);
	content.push(
		`      queryClient.invalidateQueries({ queryKey: [keys.m("${model.name}").tag()] });`,
	);
	content.push(`    }`);
	content.push(`  });`);
	content.push(`}`);
	content.push(``);

	content.push(`export function useDelete${model.name}() {`);
	content.push(`  const ctx = useFlowCtx();`);
	content.push(`  const queryClient = useQueryClient();`);
	content.push(``);
	content.push(`  return useMutation({`);
	content.push(`    mutationFn: async (id: ${idType}) => {`);
	content.push(
		`      const { delete${model.name} } = await import("./actions.server");`,
	);
	content.push(`      const result = await delete${model.name}(id, ctx);`);
	content.push(`      if (!result.ok) throw result;`);
	content.push(`    },`);
	content.push(`    onSuccess: (_, id) => {`);
	content.push(
		`      queryClient.invalidateQueries({ queryKey: keys.m("${model.name}").byId(String(id)) });`,
	);
	content.push(
		`      queryClient.invalidateQueries({ queryKey: [keys.m("${model.name}").tag()] });`,
	);
	content.push(`    }`);
	content.push(`  });`);
	content.push(`}`);

	await write(join(modelDir, "hooks.ts"), content.join("\n"));
}
