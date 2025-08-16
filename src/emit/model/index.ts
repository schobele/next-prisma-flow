import { join } from "node:path";
import type { DMMF } from "@prisma/generator-helper";
import type { FlowConfig } from "../../config";
import { emitServerMethods } from "./server/methods";
import { emitServerActions } from "./server/actions";
import { emitServerQueries } from "./server/queries";
import { emitServerSelects } from "./server/selects";
import { emitServerBarrel } from "./server";
import { emitClientHooks } from "./client/hooks";
import { emitClientForms } from "./client/forms";
import { emitClientBarrel } from "./client";
import { emitTypesSchemas } from "./types/schemas";
import { emitTypesTransforms } from "./types/transforms";
import { emitTypesTypes } from "./types/types";
import { emitTypesBarrel } from "./types";

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

  // Emit server components
  await emitServerMethods({ modelDir, model, cfg });
  await emitServerActions({ modelDir, model, cfg });
  await emitServerQueries({ modelDir, model, cfg });
  await emitServerSelects({ modelDir, dmmf, model, cfg });
  await emitServerBarrel({ modelDir, model, cfg });

  // Emit client components
  await emitClientHooks({ modelDir, model, cfg });
  await emitClientForms({ modelDir, model, cfg });
  await emitClientBarrel({ modelDir, model, cfg });

  // Emit types
  await emitTypesSchemas({ modelDir, dmmf, model, cfg });
  await emitTypesTransforms({ modelDir, dmmf, model, cfg });
  await emitTypesTypes({ modelDir, model, cfg });
  await emitTypesBarrel({ modelDir, model, cfg });
}