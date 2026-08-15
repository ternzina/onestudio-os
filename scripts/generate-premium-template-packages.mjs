import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PREMIUM_TEMPLATE_PACKAGE_SOURCE } from "../lib/public-site/premium-template-package-source.mjs";
import { PREMIUM_TEMPLATE_DATABASE_REGISTRY_FILE, planPremiumTemplateRegistryMigrations, renderPremiumTemplatePackageFiles } from "./premium-template-package-generator.mjs";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = resolve(rootDir, "lib/public-site");
const files = renderPremiumTemplatePackageFiles(PREMIUM_TEMPLATE_PACKAGE_SOURCE, { rootDir, outputDir });
const generatedSqlDir = resolve(rootDir, "supabase/generated");
const migrationsDir = resolve(rootDir, "supabase/migrations");
const check = process.argv.includes("--check");
const stale = [];
for (const [name, content] of files) {
  const path = name === PREMIUM_TEMPLATE_DATABASE_REGISTRY_FILE
    ? resolve(generatedSqlDir, name)
    : resolve(outputDir, name);
  if (check) {
    const current = await readFile(path, "utf8").catch(() => "");
    if (current !== content) stale.push(name);
  } else {
    if (name === PREMIUM_TEMPLATE_DATABASE_REGISTRY_FILE) await mkdir(generatedSqlDir, { recursive: true });
    await writeFile(path, content);
  }
}
const migrationNames = await readdir(migrationsDir);
const migrations = await Promise.all(migrationNames.filter((name) => name.endsWith(".sql")).map(async (name) => ({
  name,
  content: await readFile(resolve(migrationsDir, name), "utf8"),
})));
const migrationPlan = planPremiumTemplateRegistryMigrations(PREMIUM_TEMPLATE_PACKAGE_SOURCE, migrations);
if (migrationPlan.migrationName) {
  if (check) {
    stale.push(`supabase/migrations/${migrationPlan.migrationName}`);
  } else {
    await writeFile(resolve(migrationsDir, migrationPlan.migrationName), migrationPlan.migrationContent, { flag: "wx" });
  }
}
if (stale.length) {
  console.error(`Generated premium template registries are stale: ${stale.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log(check ? "Premium template registries are current." : "Generated premium template registries.");
}
