import { writeFile } from "../utils.js";
import { join } from "node:path";
import type { GeneratorContext, ModelInfo } from "../types.js";
import { formatGeneratedFileHeader } from "../utils.js";

export async function generateApiRoutes(
	modelInfo: ModelInfo,
	context: GeneratorContext,
	modelDir: string,
): Promise<void> {
	const { name: modelName, lowerName, pluralName } = modelInfo;

	const template = `${formatGeneratedFileHeader()}import { type NextRequest, NextResponse } from 'next/server';
import * as ${modelName}Actions from './actions';

async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const result = await ${modelName}Actions.get${modelName}(id);
      if (!result) {
        return NextResponse.json(
          { error: '${modelName} not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(result);
    } else {
      const results = await ${modelName}Actions.getAll${pluralName}();
      return NextResponse.json(results);
    }
  } catch (error) {
    console.error('GET /${lowerName} error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const result = await ${modelName}Actions.create${modelName}(data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST /${lowerName} error:', error);
    const status = (error as any)?.code === 'P2002' ? 409 : 400;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid request' },
      { status }
    );
  }
}

async function PATCH(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing id in request body' },
        { status: 400 }
      );
    }
    
    const result = await ${modelName}Actions.update${modelName}(id, updateData);
    return NextResponse.json(result);
  } catch (error) {
    console.error('PATCH /${lowerName} error:', error);
    let status = 400;
    if ((error as any)?.code === 'P2025') status = 404;
    if ((error as any)?.code === 'P2002') status = 409;
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update failed' },
      { status }
    );
  }
}

async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }
    
    await ${modelName}Actions.delete${modelName}(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /${lowerName} error:', error);
    const status = (error as any)?.code === 'P2025' ? 404 : 500;
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Delete failed' },
      { status }
    );
  }
}

export const routesHandlers = {
	GET,
	POST,
	PATCH,
	DELETE,
};
`;

	const filePath = join(modelDir, "routes.ts");
	await writeFile(filePath, template);
}
