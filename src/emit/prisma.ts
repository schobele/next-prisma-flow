import { join } from "node:path";
import type { FlowConfig } from "../config";
import { write } from "./fs";
import { header } from "./strings";

export async function emitPrisma({
  outputDir,
  cfg,
}: {
  outputDir: string;
  cfg: FlowConfig;
}) {
  const content = [];
  content.push(header("prisma.ts"));
  
  const isDirectClient = !cfg.prismaImport || cfg.prismaImport === "@prisma/client";
  
  if (isDirectClient) {
    // Scenario 2: No custom path, create default instance
    content.push(`import { PrismaClient } from "@prisma/client";`);
    content.push(`export * from "@prisma/client";`);
    content.push(``);
    content.push(`const globalForPrisma = global as unknown as { prisma: PrismaClient };`);
    content.push(``);
    content.push(`export const prisma =`);
    content.push(`  globalForPrisma.prisma ||`);
    content.push(`  new PrismaClient({`);
    content.push(`    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],`);
    content.push(`  });`);
    content.push(``);
    content.push(`if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;`);
  } else {
    // Scenario 1: Custom path provided
    content.push(`import { prisma } from "${cfg.prismaImport}";`);
    content.push(`export { prisma };`);
    content.push(`export * from "${cfg.prismaImport}";`);
  }

  await write(join(outputDir, "prisma.ts"), content.join("\n"));
}