import { join } from "node:path";
import type { FlowConfig } from "../config";
import { write } from "./fs";
import { header } from "./strings";

export async function emitRuntime({
	outDir,
	cfg,
}: {
	outDir: string;
	cfg: FlowConfig;
}) {
	await write(
		join(outDir, "core/ctx.ts"),
		header("core/ctx.ts") +
			`
export type FlowCtx = {
  user?: { id: string; roles?: string[] } | null;
  tenantId?: string | null; // value that should match the DB's ${cfg.tenantField || "tenantId"} column on your models
};
export type CtxProvider = () => Promise<FlowCtx> | FlowCtx;
`,
	);

	await write(
		join(outDir, "core/cache.ts"),
		header("core/cache.ts") +
			`
import { revalidateTag } from "next/cache";
import { cache } from "react";

export function cacheTagged<T extends (...args: any[]) => Promise<any>>(fn: T){
  return cache(fn);
}
export async function invalidateTags(tags: string[]){
  for (const t of tags) revalidateTag(t);
}
`,
	);

	await write(
		join(outDir, "core/keys.ts"),
		header("core/keys.ts") +
			`
export const keys = {
  m: (name: string) => ({
    byId: (id: string) => [name, "byId", id] as const,
    list: (p?: any) => [name, "list", p||{}] as const,
    tag: (sub?: string) => \`\${name}\${sub?":"+sub:""}\`,
  })
};
`,
	);

	await write(
		join(outDir, "core/http.ts"),
		header("core/http.ts") +
			`
export function ok(data: any){ return Response.json({ ok: true, data }); }
export function bad(message: string, status=400){ return Response.json({ ok: false, error: message }, { status }); }
`,
	);

	await write(
		join(outDir, "core/provider.tsx"),
		header("core/provider.tsx") +
			`
"use client";
import { createContext, useContext } from "react";
import type { FlowCtx } from "./ctx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const Ctx = createContext<FlowCtx | null>(null);
let qc: QueryClient | null = null;

export function FlowProvider({ ctx, children }: { ctx: FlowCtx; children: any }){
  if(!qc) qc = new QueryClient();
  return (
    <Ctx.Provider value={ctx}>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </Ctx.Provider>
  );
}
export function useFlowCtx(){
  const c = useContext(Ctx);
  if(!c) throw new Error("FlowProvider missing");
  return c;
}
`,
	);

	await write(
		join(outDir, "core/utils.ts"),
		header("core/utils.ts") +
			`
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj } as any;
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const output = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
        (output as any)[key] = deepMerge(target[key] as any, source[key] as any);
      } else {
        (output as any)[key] = source[key];
      }
    } else {
      (output as any)[key] = source[key];
    }
  }
  return output;
}
`,
	);

	await write(
		join(outDir, "core/index.ts"),
		header("core/index.ts") +
			`
export * from "./ctx";
export * from "./cache";
export * from "./keys";
export * from "./http";
export * from "./utils";
export { FlowProvider, useFlowCtx } from "./provider";
`,
	);

	// Create a client-safe index that doesn't include server-only imports
	await write(
		join(outDir, "core/index.client.ts"),
		header("core/index.client.ts") +
			`
export * from "./ctx";
export * from "./keys";
export * from "./utils";
export { FlowProvider, useFlowCtx } from "./provider";
`,
	);
}
