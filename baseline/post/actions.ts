"use server";

import { createModelActions } from "../shared/actions/factory";
import { modelPrismaClient, select } from "./config";
import { schemas } from "./schemas";
import type { ModelType } from "./types";

const modelActions = createModelActions<ModelType, typeof schemas, typeof select>(modelPrismaClient, schemas, select);

export const {
	findUnique,
	findMany,
	findFirst,
	create,
	createMany,
	update,
	updateMany,
	upsert,
	remove,
	removeMany,
	count,
} = modelActions;
