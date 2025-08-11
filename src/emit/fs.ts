import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import prettier from "prettier";

export async function write(outPath: string, content: string){
  await mkdir(dirname(outPath), { recursive: true });
  const formatted = await format(content);
  await writeFile(outPath, formatted, "utf8");
}

async function format(code: string){
  try{
    const p = await prettier.resolveConfig(process.cwd());
    return await prettier.format(code, { ...(p||{}), parser: "typescript" });
  }catch{
    return code;
  }
}