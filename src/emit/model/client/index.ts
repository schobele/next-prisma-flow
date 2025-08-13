import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../../config";
import { write } from "../../fs";
import { header } from "../../strings";

export async function emitClientBarrel({
  modelDir,
  model,
}: {
  modelDir: string;
  model: DMMF.Model;
  cfg: FlowConfig;
}) {
  const content = [];
  content.push(header("client/index.ts"));
  content.push(``);
  content.push(`export * from "./hooks";`);
  content.push(`export * from "./forms";`);

  const clientDir = join(modelDir, "client");
  await write(join(clientDir, "index.ts"), content.join("\n"));
}