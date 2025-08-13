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
  
  // Handle both @prisma/client and relative paths
  if (cfg.prismaImport.startsWith("@")) {
    // For package imports like "@prisma/client"
    content.push(`export * from "${cfg.prismaImport}";`);
  } else {
    // For relative paths like "../../../lib/prisma"
    content.push(`export * from "${cfg.prismaImport}";`);
    content.push(`export { Prisma } from "@prisma/client";`);
  }

  await write(join(outputDir, "prisma.ts"), content.join("\n"));
}