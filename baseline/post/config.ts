import { prisma } from "../prisma";
import type { SelectInput } from "./types";

export const model = "post" as const;
export const modelPrismaClient = prisma[model];
export const select: SelectInput = {
	id: true,
	title: true,
	description: true,
	status: true,
	publishedAt: true,
	createdAt: true,
	updatedAt: true,
	author: {
		select: {
			id: true,
			email: true,
			name: true,
			avatar: true,
			createdAt: true,
			updatedAt: true,
		},
	},
	category: {
		select: {
			id: true,
			name: true,
			color: true,
			createdAt: true,
		},
	},
	comments: {
		select: {
			id: true,
			content: true,
			createdAt: true,
			updatedAt: true,
		},
	},
};
