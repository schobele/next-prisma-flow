import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../../config";
import { write } from "../../fs";
import { header } from "../../strings";

export async function emitServerBarrel({
  modelDir,
  model,
}: {
  modelDir: string;
  model: DMMF.Model;
  cfg: FlowConfig;
}) {
  const content = [];
  content.push(header("server/index.ts"));
  content.push(``);
  content.push(`export * from "./methods";`);
  content.push(`export * from "./actions";`);
  content.push(`export * from "./queries";`);
  content.push(`export * from "./selects";`);

  const serverDir = join(modelDir, "server");
  await write(join(serverDir, "index.ts"), content.join("\n"));
}