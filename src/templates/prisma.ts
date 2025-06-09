import type { GeneratorContext } from "../types.js";

export function generatePrismaTemplate(context: GeneratorContext): string {
	const { config } = context;

	if (config.prismaClientPath?.trim()) {
		return `export * from "${config.prismaClientPath}";
`;
	}

	return `import { PrismaClient } from "@prisma/client";
export * from "@prisma/client";

export const prisma = new PrismaClient();
`;
}
