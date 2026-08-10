import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PREMIUM_TEMPLATE_PACKAGE_SOURCE } from "../lib/public-site/premium-template-package-source.mjs";
import { renderPremiumTemplatePackageFiles } from "./premium-template-package-generator.mjs";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = resolve(rootDir, "lib/public-site");
const files = renderPremiumTemplatePackageFiles(PREMIUM_TEMPLATE_PACKAGE_SOURCE, { rootDir, outputDir });
const check = process.argv.includes("--check");
const stale = [];
for (const [name, content] of files) {
  const path = resolve(outputDir, name);
  if (check) {
    const current = await readFile(path, "utf8").catch(() => "");
    if (current !== content) stale.push(name);
  } else {
    await writeFile(path, content);
  }
}
if (stale.length) {
  console.error(`Generated premium template registries are stale: ${stale.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log(check ? "Premium template registries are current." : "Generated premium template registries.");
}
