import type { DMMF } from "@prisma/generator-helper";
import { write } from "../fs";
import { header, expAll } from "../strings";
import { join } from "node:path";

export async function emitBarrel({
  modelDir,
  model
}: {
  modelDir: string;
  model: DMMF.Model;
}) {
  const content = [];
  content.push(header("index.ts"));
  content.push(expAll("./selects"));
  content.push(expAll("./zod"));
  content.push(expAll("./writes"));
  content.push(expAll("./queries.server"));
  content.push(expAll("./actions.server"));
  content.push(expAll("./hooks"));
  content.push(expAll("./forms"));
  
  await write(join(modelDir, "index.ts"), content.join("\n"));
}