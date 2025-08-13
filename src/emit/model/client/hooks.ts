import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../../config";
import { write } from "../../fs";
import { header, imp, impType } from "../../strings";

export async function emitClientHooks({
  modelDir,
  model,
  cfg,
}: {
  modelDir: string;
  model: DMMF.Model;
  cfg: FlowConfig;
}) {
  const idField = model.fields.find((f) => f.isId);
  const idType = idField?.type === "String" ? "string" : "number";

  const content = [];
  content.push(header("client/hooks.ts"));
  content.push(`"use client";`);
  content.push(``);
  content.push(imp("@tanstack/react-query", ["useQuery", "useMutation", "useQueryClient", "UseQueryOptions", "UseMutationOptions"]));
  content.push(imp("react", ["useState", "useCallback"]));
  content.push(imp("../../core/keys", ["keys"]));
  content.push(imp("../../core/provider", ["useFlowCtx"]));
  content.push(impType(`../server/queries`, [`${model.name}ListParams`]));
  content.push(impType(`../types/schemas`, [`Flow${model.name}`, `Flow${model.name}Create`, `Flow${model.name}Update`]));
  content.push(``);

  // usePost hook
  content.push(`export function use${model.name}(`);
  content.push(`  id: ${idType},`);
  content.push(`  options?: Omit<UseQueryOptions<Flow${model.name} | null>, 'queryKey' | 'queryFn'>`);
  content.push(`) {`);
  content.push(`  const ctx = useFlowCtx();`);
  content.push(`  `);
  content.push(`  return useQuery({`);
  content.push(`    queryKey: keys.m("${model.name}").byId(String(id)),`);
  content.push(`    queryFn: async () => {`);
  content.push(`      const { get${model.name}ById } = await import("../server/queries");`);
  content.push(`      return get${model.name}ById(id, ctx);`);
  content.push(`    },`);
  content.push(`    ...options`);
  content.push(`  });`);
  content.push(`}`);
  content.push(``);

  // usePostList hook
  content.push(`export function use${model.name}List(`);
  content.push(`  params?: ${model.name}ListParams,`);
  content.push(`  options?: Omit<UseQueryOptions<{ items: Flow${model.name}[]; total: number }>, 'queryKey' | 'queryFn'>`);
  content.push(`) {`);
  content.push(`  const ctx = useFlowCtx();`);
  content.push(`  const [localParams, setLocalParams] = useState(params || {});`);
  content.push(``);
  content.push(`  const query = useQuery({`);
  content.push(`    queryKey: keys.m("${model.name}").list(localParams),`);
  content.push(`    queryFn: async () => {`);
  content.push(`      const { list${model.name}s } = await import("../server/queries");`);
  content.push(`      return list${model.name}s(localParams, ctx);`);
  content.push(`    },`);
  content.push(`    ...options`);
  content.push(`  });`);
  content.push(``);
  content.push(`  return {`);
  content.push(`    ...query,`);
  content.push(`    params: localParams,`);
  content.push(`    setParams: setLocalParams,`);
  content.push(`    nextPage: useCallback(() => {`);
  content.push(`      if (query.data && localParams.take) {`);
  content.push(`        const skip = (localParams.skip || 0) + localParams.take;`);
  content.push(`        if (skip < query.data.total) {`);
  content.push(`          setLocalParams(prev => ({ ...prev, skip }));`);
  content.push(`        }`);
  content.push(`      }`);
  content.push(`    }, [query.data, localParams]),`);
  content.push(`    previousPage: useCallback(() => {`);
  content.push(`      if (localParams.skip && localParams.take) {`);
  content.push(`        const skip = Math.max(0, localParams.skip - localParams.take);`);
  content.push(`        setLocalParams(prev => ({ ...prev, skip }));`);
  content.push(`      }`);
  content.push(`    }, [localParams])`);
  content.push(`  };`);
  content.push(`}`);
  content.push(``);

  // useCreatePost mutation
  content.push(`export function useCreate${model.name}(`);
  content.push(`  options?: UseMutationOptions<Flow${model.name}, Error, Flow${model.name}Create>`);
  content.push(`) {`);
  content.push(`  const ctx = useFlowCtx();`);
  content.push(`  const queryClient = useQueryClient();`);
  content.push(``);
  content.push(`  return useMutation({`);
  content.push(`    mutationFn: async (data: Flow${model.name}Create) => {`);
  content.push(`      const { create${model.name} } = await import("../server/actions");`);
  content.push(`      return create${model.name}(data, ctx);`);
  content.push(`    },`);
  content.push(`    onSuccess: (data, variables, context) => {`);
  content.push(`      queryClient.invalidateQueries({ queryKey: [keys.m("${model.name}").tag()] });`);
  content.push(`      options?.onSuccess?.(data, variables, context);`);
  content.push(`    },`);
  content.push(`    ...options`);
  content.push(`  });`);
  content.push(`}`);
  content.push(``);

  // useUpdatePost mutation
  content.push(`export function useUpdate${model.name}(`);
  content.push(`  id: ${idType},`);
  content.push(`  options?: UseMutationOptions<Flow${model.name}, Error, Flow${model.name}Update>`);
  content.push(`) {`);
  content.push(`  const ctx = useFlowCtx();`);
  content.push(`  const queryClient = useQueryClient();`);
  content.push(``);
  content.push(`  return useMutation({`);
  content.push(`    mutationFn: async (data: Flow${model.name}Update) => {`);
  content.push(`      const { update${model.name} } = await import("../server/actions");`);
  content.push(`      return update${model.name}(id, data, ctx);`);
  content.push(`    },`);
  content.push(`    onMutate: async (newData) => {`);
  content.push(`      // Optimistic update`);
  content.push(`      await queryClient.cancelQueries({ queryKey: keys.m("${model.name}").byId(String(id)) });`);
  content.push(`      const previousData = queryClient.getQueryData(keys.m("${model.name}").byId(String(id)));`);
  content.push(`      `);
  content.push(`      queryClient.setQueryData(`);
  content.push(`        keys.m("${model.name}").byId(String(id)),`);
  content.push(`        (old: any) => old ? { ...old, ...newData } : old`);
  content.push(`      );`);
  content.push(`      `);
  content.push(`      return { previousData };`);
  content.push(`    },`);
  content.push(`    onError: (err, newData, context: any) => {`);
  content.push(`      // Revert optimistic update on error`);
  content.push(`      if (context?.previousData) {`);
  content.push(`        queryClient.setQueryData(`);
  content.push(`          keys.m("${model.name}").byId(String(id)),`);
  content.push(`          context.previousData`);
  content.push(`        );`);
  content.push(`      }`);
  content.push(`      options?.onError?.(err, newData, context);`);
  content.push(`    },`);
  content.push(`    onSettled: () => {`);
  content.push(`      queryClient.invalidateQueries({ queryKey: keys.m("${model.name}").byId(String(id)) });`);
  content.push(`      queryClient.invalidateQueries({ queryKey: [keys.m("${model.name}").tag()] });`);
  content.push(`    },`);
  content.push(`    ...options`);
  content.push(`  });`);
  content.push(`}`);
  content.push(``);

  // useDeletePost mutation
  content.push(`export function useDelete${model.name}(`);
  content.push(`  options?: UseMutationOptions<void, Error, ${idType}>`);
  content.push(`) {`);
  content.push(`  const ctx = useFlowCtx();`);
  content.push(`  const queryClient = useQueryClient();`);
  content.push(``);
  content.push(`  return useMutation({`);
  content.push(`    mutationFn: async (id: ${idType}) => {`);
  content.push(`      const { delete${model.name} } = await import("../server/actions");`);
  content.push(`      return delete${model.name}(id, ctx);`);
  content.push(`    },`);
  content.push(`    onSuccess: (data, id, context) => {`);
  content.push(`      queryClient.invalidateQueries({ queryKey: keys.m("${model.name}").byId(String(id)) });`);
  content.push(`      queryClient.invalidateQueries({ queryKey: [keys.m("${model.name}").tag()] });`);
  content.push(`      options?.onSuccess?.(data, id, context);`);
  content.push(`    },`);
  content.push(`    ...options`);
  content.push(`  });`);
  content.push(`}`);
  content.push(``);

  // Combined mutation hook for create/update
  content.push(`export function use${model.name}Mutation(options?: {`);
  content.push(`  mode: 'create' | 'update';`);
  content.push(`  id?: ${idType};`);
  content.push(`  onSuccess?: (data: Flow${model.name}) => void;`);
  content.push(`  onError?: (error: Error) => void;`);
  content.push(`}) {`);
  content.push(`  const { mode = 'create', id, onSuccess, onError } = options || {};`);
  content.push(`  `);
  content.push(`  const createMutation = useCreate${model.name}({`);
  content.push(`    onSuccess,`);
  content.push(`    onError`);
  content.push(`  });`);
  content.push(`  `);
  content.push(`  const updateMutation = useUpdate${model.name}(id!, {`);
  content.push(`    onSuccess,`);
  content.push(`    onError`);
  content.push(`  });`);
  content.push(`  `);
  content.push(`  if (mode === 'update' && id) {`);
  content.push(`    return updateMutation;`);
  content.push(`  }`);
  content.push(`  `);
  content.push(`  return createMutation as typeof createMutation;`);
  content.push(`}`);

  const clientDir = join(modelDir, "client");
  await write(join(clientDir, "hooks.ts"), content.join("\n"));
}