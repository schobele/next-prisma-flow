import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db",
    },
  },
});

// Re-export Prisma types for use in generated code
export type { Prisma } from "@prisma/client";
