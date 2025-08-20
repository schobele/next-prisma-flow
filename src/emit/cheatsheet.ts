import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

export async function emitCheatSheet({ outDir }: { outDir: string }) {
	try {
		// Navigate to package root from compiled dist directory
		// __dirname in dist/emit/ -> go up to package root
		const packageRoot = join(__dirname, "../..");
		const sourceFile = join(packageRoot, "cheat-sheet.md");
		
		// Read the cheat sheet content
		const content = await readFile(sourceFile, "utf8");
		
		// Write to output directory as README.md
		const targetFile = join(outDir, "README.md");
		await mkdir(dirname(targetFile), { recursive: true });
		await writeFile(targetFile, content, "utf8");
		
		console.log(`✓ Copied cheat sheet to ${targetFile}`);
	} catch (error: any) {
		// If file doesn't exist or other error, log but don't fail generation
		console.warn("Warning: Could not copy cheat-sheet.md:", error?.message || error);
	}
}