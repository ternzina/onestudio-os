import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { TEMPLATE_CATALOG, newSitePathForTemplate } from "../lib/public-site/template-catalog.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("all customer entrances converge on canonical /new-site", async () => {
  const [dashboard, demos, showcase, noir, bembi, launch, bootstrap, configure] = await Promise.all([
    read("../app/dashboard/page.tsx"), read("../app/demos/page.tsx"),
    read("../app/demos/[demoSlug]/DemoShowcaseClient.tsx"), read("../app/demos/premium-studio/page.tsx"),
    read("../app/demos/premium-kids-center/page.tsx"), read("../app/launch/page.tsx"),
    read("../app/admin/bootstrap/page.tsx"), read("../app/configure/[demoSlug]/page.tsx"),
  ]);
  assert.match(dashboard, /href="\/new-site"/);
  assert.match(demos, /newSitePathForTemplate/);
  assert.match(showcase, /newSitePathForTemplate/);
  assert.match(noir, /newSitePathForTemplate\("premium-studio"\)/);
  assert.match(bembi, /newSitePathForTemplate\("premium-kids-center"\)/);
  assert.match(launch, /redirect\("\/new-site"\)/);
  assert.match(bootstrap, /redirect\("\/new-site"\)/);
  assert.match(configure, /redirect\(newSitePathForTemplate/);
  assert.doesNotMatch(launch, /\.rpc\(/);
  assert.doesNotMatch(bootstrap, /launch_first_workspace|\.rpc\(/);
});

test("registration and auth preserve explicit canonical template intent", async () => {
  const [register, login, callback, returns, proxy] = await Promise.all([
    read("../app/register/page.tsx"), read("../app/login/page.tsx"), read("../app/auth/callback/page.tsx"),
    read("../lib/auth/return-path.ts"), read("../lib/supabase/proxy.ts"),
  ]);
  assert.match(register, /safeAuthReturnPath/);
  assert.match(register, /startsWith\("\/new-site"\)/);
  assert.match(login, /nextPath\.startsWith\("\/new-site"\)/);
  assert.match(callback, /safeAuthReturnPath/);
  assert.match(returns, /parsed\.pathname === "\/new-site"/);
  assert.match(proxy, /next\?\.startsWith\("\/new-site"\)/);
  assert.equal(newSitePathForTemplate("premium-studio"), "/new-site?template=premium-studio&mode=template");
});

test("one wizard sends design and Client Launch business setup in one canonical call", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");
  assert.equal((wizard.match(/\.rpc\("create_template_workspace"/g) ?? []).length, 1);
  assert.match(wizard, /resolveCreationContract/);
  assert.doesNotMatch(wizard, /from "@\/lib\/public-site\/template-seeds"/);
  assert.doesNotMatch(wizard, /create_configured_workspace|launch_first_workspace/);
  for (const field of ["creation_mode", "template_key", "template_seed", "business_type", "timezone", "country_code", "email", "phone", "address", "service_title", "resource_name", "work_days", "enabled_modules"]) {
    assert.match(wizard, new RegExp(`${field}:`));
  }
  for (const key of ["standard", "gloss-nail-studio", "premium-kids-center", "premium-studio", "velora-event-venue"]) {
    assert.ok(TEMPLATE_CATALOG.some(item => item.key === key));
  }
});

test("forward SQL is atomic, idempotent, unpublished, qualified, and retains the three-site trigger", async () => {
  const [migration, applied, limit] = await Promise.all([
    read("../supabase/migrations/20260809130000_canonical_site_creation_flow_1_0.sql"),
    read("../supabase/migrations/20260809120000_template_catalog_recovery_1_0.sql"),
    read("../supabase/migrations/20260802224500_block_colors_workspace_limit_1.sql"),
  ]);
  assert.match(migration, /create or replace function public\.create_template_workspace/);
  assert.match(migration, /launch_profile\.launch_key = v_launch_key/);
  assert.match(migration, /'launch_id', v_launch_key/);
  assert.match(migration, /public\.create_configured_workspace/);
  assert.match(migration, /company_profiles/);
  assert.match(migration, /public\.services/);
  assert.match(migration, /public\.resources/);
  assert.match(migration, /public\.availability_rules/);
  assert.match(migration, /configure_business_modules/);
  assert.match(migration, /site_locale\.business_id = v_result\.business_id/);
  assert.match(migration, /is_published = false/);
  assert.doesNotMatch(migration, /where business_id = v_result\.business_id/);
  assert.match(applied, /where business_id = v_result\.business_id/);
  assert.match(limit, /v_owned_count >= 3/);
  assert.match(limit, /workspace_limit_reached/);
});

test("catalog previews are read-only routes and selection never bypasses business setup", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");
  for (const template of TEMPLATE_CATALOG.filter(item => item.gallery.previewRoute)) {
    assert.ok(template.gallery.previewRoute?.startsWith("/demos/"));
  }
  assert.match(wizard, /href=\{item\.gallery\.previewRoute\}/);
  assert.match(wizard, /target="_blank"/);
  assert.match(wizard, /chooseTemplate\("template", item\.key\)/);
  assert.doesNotMatch(wizard, /onClick=\{\(\) => submit/);
});

test("canonical creation errors return to the wizard itself", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");
  assert.match(wizard, /Не удалось создать сайт/);
  assert.match(wizard, /Назад/);
  assert.doesNotMatch(wizard, /Вернуться к демо/);
});
