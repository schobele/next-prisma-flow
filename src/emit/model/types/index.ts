import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../../config";
import { write } from "../../fs";
import { header } from "../../strings";

export async function emitTypesBarrel({
  modelDir,
  model,
}: {
  modelDir: string;
  model: DMMF.Model;
  cfg: FlowConfig;
}) {
  const content = [];
  content.push(header("types/index.ts"));
  content.push(``);
  content.push(`export * from "./schemas";`);
  content.push(`export * from "./transforms";`);
  content.push(`export * from "./types";`);

  const typesDir = join(modelDir, "types");
  await write(join(typesDir, "index.ts"), content.join("\n"));
}