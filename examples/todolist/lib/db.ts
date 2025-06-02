import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// Re-export Prisma types for use in generated code
export type { Prisma } from "@prisma/client";
