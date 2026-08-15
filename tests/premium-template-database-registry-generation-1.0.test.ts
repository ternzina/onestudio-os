import assert from "node:assert/strict";
import test from "node:test";
import { PREMIUM_TEMPLATE_PACKAGE_SOURCE } from "../lib/public-site/premium-template-package-source.mjs";
import {
  findPremiumTemplateRegistryMigrationCoverage,
  planPremiumTemplateRegistryMigrations,
  renderPremiumTemplateDatabaseRegistry,
  renderPremiumTemplatePackageFiles,
  validatePremiumTemplatePackageSource,
} from "../scripts/premium-template-package-generator.mjs";
import { readdir, readFile } from "node:fs/promises";

const rootDir = process.cwd();
const outputDir = `${rootDir}/lib/public-site`;

test("every canonical customer-creatable package has generated database registration metadata", () => {
  const sql = renderPremiumTemplateDatabaseRegistry(PREMIUM_TEMPLATE_PACKAGE_SOURCE);
  for (const { manifest } of PREMIUM_TEMPLATE_PACKAGE_SOURCE) {
    assert.equal(manifest.database.templateKey, manifest.templateKey);
    assert.equal(manifest.database.installable, manifest.capabilities.customerCreatable);
    if (manifest.capabilities.customerCreatable) {
      assert.match(sql, new RegExp(`\\('${manifest.templateKey}', '${manifest.templateKey}', true, true\\)`));
    }
  }
});

test("non-customer-creatable packages are excluded from generated database registration", () => {
  const legacy = {
    ...PREMIUM_TEMPLATE_PACKAGE_SOURCE[0],
    manifest: {
      ...PREMIUM_TEMPLATE_PACKAGE_SOURCE[0].manifest,
      templateKey: "legacy-package",
      capabilities: { ...PREMIUM_TEMPLATE_PACKAGE_SOURCE[0].manifest.capabilities, customerCreatable: false },
      database: { templateKey: "legacy-package", installable: false },
    },
  };
  const sql = renderPremiumTemplateDatabaseRegistry([legacy]);
  assert.doesNotMatch(sql, /legacy-package/);
});

test("database registration output is deterministic and synthetic packages participate automatically", () => {
  const synthetic = {
    ...PREMIUM_TEMPLATE_PACKAGE_SOURCE[0],
    manifest: {
      ...PREMIUM_TEMPLATE_PACKAGE_SOURCE[0].manifest,
      templateKey: "aurora-wellness",
      database: { templateKey: "aurora-wellness", installable: true },
    },
  };
  const packages = [...PREMIUM_TEMPLATE_PACKAGE_SOURCE, synthetic];
  const first = renderPremiumTemplateDatabaseRegistry(packages);
  const second = renderPremiumTemplateDatabaseRegistry(packages);
  assert.equal(first, second);
  assert.match(first, /\('aurora-wellness', 'aurora-wellness', true, true\)/);
  assert.match(first, /insert into public\.site_template_registry/);
  assert.match(first, /on conflict \(template_key\) do update set/);
  assert.doesNotMatch(first, /legacy_demo_slug/);
  assert.ok(renderPremiumTemplatePackageFiles(packages, { rootDir, outputDir }).has("premium-template-registry.sql"));
});

test("canonical and database template keys cannot diverge silently", () => {
  const divergent = {
    ...PREMIUM_TEMPLATE_PACKAGE_SOURCE[0],
    manifest: {
      ...PREMIUM_TEMPLATE_PACKAGE_SOURCE[0].manifest,
      database: { templateKey: "other-template", installable: true },
    },
  };
  assert.throws(() => validatePremiumTemplatePackageSource([divergent]), /database templateKey diverges/);
});

test("current migration history covers every canonical customer-creatable template without a duplicate BLOOM migration", async () => {
  const names = (await readdir(`${rootDir}/supabase/migrations`)).filter((name) => name.endsWith(".sql"));
  const migrations = await Promise.all(names.map(async (name) => ({ name, content: await readFile(`${rootDir}/supabase/migrations/${name}`, "utf8") })));
  const covered = findPremiumTemplateRegistryMigrationCoverage(migrations);
  assert.ok(covered.has("bloom-floral-studio"));
  const plan = planPremiumTemplateRegistryMigrations(PREMIUM_TEMPLATE_PACKAGE_SOURCE, migrations);
  assert.deepEqual(plan.missingTemplateKeys, []);
  assert.equal(plan.migrationName, null);
  assert.equal(migrations.filter(({ name }) => name.includes("bloom_floral_studio_template_registry")).length, 1);
});

test("future canonical package plans one deterministic idempotent migration and repeats cleanly", async () => {
  const names = (await readdir(`${rootDir}/supabase/migrations`)).filter((name) => name.endsWith(".sql"));
  const historical = await Promise.all(names.map(async (name) => ({ name, content: await readFile(`${rootDir}/supabase/migrations/${name}`, "utf8") })));
  const bloomMigration = historical.find(({ name }) => name.includes("bloom_floral_studio_template_registry"));
  assert.ok(bloomMigration);
  const bloomContent = bloomMigration.content;
  const synthetic = {
    ...PREMIUM_TEMPLATE_PACKAGE_SOURCE[0],
    manifest: {
      ...PREMIUM_TEMPLATE_PACKAGE_SOURCE[0].manifest,
      templateKey: "aurora-wellness",
      database: { templateKey: "aurora-wellness", installable: true },
    },
  };
  const packages = [...PREMIUM_TEMPLATE_PACKAGE_SOURCE, synthetic];
  const first = planPremiumTemplateRegistryMigrations(packages, historical);
  assert.deepEqual(first.missingTemplateKeys, ["aurora-wellness"]);
  assert.ok(first.migrationName);
  assert.ok(first.migrationContent);
  assert.match(first.migrationName, /^\d+_generated_premium_template_registry\.sql$/);
  assert.match(first.migrationContent, /'aurora-wellness', 'aurora-wellness', true, true/);
  assert.match(first.migrationContent, /insert into public\.site_template_registry/);
  assert.match(first.migrationContent, /on conflict \(template_key\) do update set/);
  const second = planPremiumTemplateRegistryMigrations(packages, [...historical, { name: first.migrationName, content: first.migrationContent }]);
  assert.deepEqual(second.missingTemplateKeys, []);
  assert.equal(second.migrationName, null);
  assert.equal(bloomMigration.content, bloomContent);
});

test("non-customer-creatable packages never plan database migrations", () => {
  const legacy = {
    ...PREMIUM_TEMPLATE_PACKAGE_SOURCE[0],
    manifest: {
      ...PREMIUM_TEMPLATE_PACKAGE_SOURCE[0].manifest,
      templateKey: "aurora-preview",
      capabilities: { ...PREMIUM_TEMPLATE_PACKAGE_SOURCE[0].manifest.capabilities, customerCreatable: false },
      database: { templateKey: "aurora-preview", installable: false },
    },
  };
  const plan = planPremiumTemplateRegistryMigrations([legacy], []);
  assert.deepEqual(plan.missingTemplateKeys, []);
  assert.equal(plan.migrationName, null);
});
