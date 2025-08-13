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
import { write } from "../fs";
import { header } from "../strings";

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

  // Emit main barrel with tree-shakeable exports
  await emitModelBarrel({ modelDir, model });
}

async function emitModelBarrel({
  modelDir,
  model,
}: {
  modelDir: string;
  model: DMMF.Model;
}) {
  const content = [];
  content.push(header("index.ts"));
  content.push(``);
  content.push(`// Tree-shakeable named exports`);
  content.push(`export * as ${model.name}Server from './server';`);
  content.push(`export * as ${model.name}Client from './client';`);
  content.push(`export * as ${model.name}Types from './types';`);
  content.push(``);
  content.push(`// Direct exports for common usage`);
  content.push(`export {`);
  content.push(`  // Hooks`);
  content.push(`  use${model.name},`);
  content.push(`  use${model.name}List,`);
  content.push(`  useCreate${model.name},`);
  content.push(`  useUpdate${model.name},`);
  content.push(`  useDelete${model.name},`);
  content.push(`  use${model.name}Mutation,`);
  content.push(`} from './client/hooks';`);
  content.push(``);
  content.push(`export {`);
  content.push(`  // Forms`);
  content.push(`  use${model.name}Form,`);
  content.push(`  use${model.name}QuickForm,`);
  content.push(`  type ${model.name}FormOptions,`);
  content.push(`  type ${model.name}FormProps,`);
  content.push(`} from './client/forms';`);
  content.push(``);
  content.push(`export {`);
  content.push(`  // Schemas`);
  content.push(`  ${model.name}CreateSchema,`);
  content.push(`  ${model.name}UpdateSchema,`);
  content.push(`  ${model.name}FilterSchema,`);
  content.push(`  type Flow${model.name},`);
  content.push(`  type Flow${model.name}Create,`);
  content.push(`  type Flow${model.name}Update,`);
  content.push(`  type Flow${model.name}Filter,`);
  content.push(`} from './types/schemas';`);
  content.push(``);
  content.push(`export {`);
  content.push(`  // Types`);
  content.push(`  type ${model.name}WithRelations,`);
  content.push(`  type ${model.name}ListItem,`);
  content.push(`  type ${model.name}Page,`);
  content.push(`  type ${model.name}Cursor,`);
  content.push(`} from './types/types';`);
  content.push(``);
  content.push(`// Server-only exports (for server components/actions)`);
  content.push(`export type {`);
  content.push(`  ${model.name}ListParams,`);
  content.push(`} from './server/queries';`);

  await write(join(modelDir, "index.ts"), content.join("\n"));
}