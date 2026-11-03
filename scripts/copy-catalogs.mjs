import { copyFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const sourceDir = "public";
const outputDir = "dist";

mkdirSync(outputDir, { recursive: true });

for (const name of readdirSync(sourceDir)) {
  const sourcePath = path.join(sourceDir, name);
  const outputPath = path.join(outputDir, name);

  if (statSync(sourcePath).isFile()) {
    copyFileSync(sourcePath, outputPath);
    console.log(`Copied ${name}`);
  }
}
