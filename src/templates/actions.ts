import fs from "node:fs/promises";
import path from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { createSelectObjectWithRelations, formatGeneratedFileHeader, getPrismaImportPath } from "../utils.js";

export async function generateServerActions(
	modelInfo: ModelInfo,
	context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName, lowerName, pluralName, lowerPluralName, selectFields } = modelInfo;
	const selectObject = createSelectObjectWithRelations(modelInfo, context);

	const template = `${formatGeneratedFileHeader()}'use server';

import { prisma } from '${getPrismaImportPath(context, 1)}';
import { revalidateTag } from 'next/cache';
import { 
  ${lowerName}Schema, 
  type ${modelName}, 
  type ${modelName}CreateInput, 
  type ${modelName}UpdateInput,
  type ${modelName}CreateManyInput,
  ${modelName}CreateInputSchema,
  ${modelName}UpdateInputSchema,
  ${modelName}CreateManyInputSchema
} from './types';

const ${lowerName}Select = ${selectObject};

export async function getAll${pluralName}(): Promise<${modelName}[]> {
  const ${lowerPluralName} = await prisma.${lowerName}.findMany({ 
    select: ${lowerName}Select 
  });
  return ${lowerPluralName} as ${modelName}[];
}

export async function get${modelName}(id: string): Promise<${modelName} | null> {
  const ${lowerName} = await prisma.${lowerName}.findUnique({ 
    where: { id }, 
    select: ${lowerName}Select 
  });
  return ${lowerName} as ${modelName} | null;
}

export async function create${modelName}(input: ${modelName}CreateInput): Promise<${modelName}> {
  const data = ${modelName}CreateInputSchema.parse(input);
  const new${modelName} = await prisma.${lowerName}.create({ 
    data, 
    select: ${lowerName}Select 
  });
  
  // Invalidate cache tags
  revalidateTag('${modelName}');
  
  return new${modelName} as ${modelName};
}

export async function update${modelName}(
  id: string, 
  input: ${modelName}UpdateInput
): Promise<${modelName}> {
  const data = ${modelName}UpdateInputSchema.parse(input);
  const updated${modelName} = await prisma.${lowerName}.update({
    where: { id },
    data,
    select: ${lowerName}Select,
  });
  
  // Invalidate cache tags
  revalidateTag('${modelName}');
  revalidateTag(\`${modelName}:\${id}\`);
  
  return updated${modelName} as ${modelName};
}

export async function delete${modelName}(id: string): Promise<void> {
  await prisma.${lowerName}.delete({ where: { id } });
  
  // Invalidate cache tags
  revalidateTag('${modelName}');
  revalidateTag(\`${modelName}:\${id}\`);
}

// Batch operations
export async function createMany${pluralName}(
  inputs: ${modelName}CreateManyInput[]
): Promise<{ count: number }> {
  const data = inputs.map(input => ${modelName}CreateManyInputSchema.parse(input));
  const result = await prisma.${lowerName}.createMany({ data });
  
  // Invalidate cache tags
  revalidateTag('${modelName}');
  
  return result;
}

export async function deleteMany${pluralName}(ids: string[]): Promise<{ count: number }> {
  const result = await prisma.${lowerName}.deleteMany({
    where: { id: { in: ids } }
  });
  
  // Invalidate cache tags
  revalidateTag('${modelName}');
  ids.forEach(id => revalidateTag(\`${modelName}:\${id}\`));
  
  return result;
}
`;

	const filePath = path.join(modelDir, "actions.ts");
	await fs.writeFile(filePath, template, "utf-8");
}
