import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createCanonicalGlossDemoSite, GLOSS_DEMO_BASE_PATH } from "../lib/public-site/gloss-demo.ts";
import { TEMPLATE_CATALOG } from "../lib/public-site/template-catalog.ts";
import { createTemplateSeed } from "../lib/public-site/template-seeds.ts";
import { getSiteTemplateDefinition } from "../lib/public-site/template-registry.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("catalog exposes one canonical customer-facing GLOSS identity and premium route", () => {
  const gloss = TEMPLATE_CATALOG.filter(item => item.key === "gloss-nail-studio" || item.aliases.includes("gloss"));
  assert.equal(gloss.length, 1);
  assert.equal(gloss[0].key, "gloss-nail-studio");
  assert.equal(gloss[0].gallery.previewRoute, GLOSS_DEMO_BASE_PATH);
  assert.deepEqual(gloss[0].integration, { kind: "premium-package" });
});

test("standalone GLOSS demo uses the canonical full seed and runtime", async () => {
  const [route, runtime] = await Promise.all([
    read("../app/demos/gloss-nail-studio/[[...templatePath]]/page.tsx"),
    read("../components/public/PublicSiteTemplateRuntime.tsx"),
  ]);
  const demo = createCanonicalGlossDemoSite();
  const seed = createTemplateSeed("gloss-nail-studio");
  assert.deepEqual(demo.content, seed);
  assert.equal(demo.content.template_id, "gloss-nail-studio");
  assert.ok(demo.services.length >= 6);
  assert.ok(demo.portfolio.length >= 10);
  assert.ok((demo.content.section_order ?? []).includes("membership"));
  assert.match(route, /PublicSiteTemplateRuntime/);
  assert.match(runtime, /getPremiumTemplatePublicRuntime/);
  assert.doesNotMatch(runtime, /GlossBusinessSite|gloss-nail-studio/);
  assert.equal(getSiteTemplateDefinition(demo.content.template_id)?.key, "gloss-nail-studio");
});

test("new-site preview is catalog-derived, read-only, and selection keeps canonical identity", async () => {
  const wizard = await read("../app/new-site/CanonicalSiteCreationWizard.tsx");
  assert.match(wizard, /href=\{item\.gallery\.previewRoute\}/);
  assert.match(wizard, /target="_blank"/);
  assert.doesNotMatch(wizard, /\/demos\/gloss-nail-studio/);
  assert.doesNotMatch(wizard, /previewRoute.*\.rpc|onClick=.*create_template_workspace/s);
  assert.match(wizard, /chooseTemplate\("template", item\.key\)/);
  assert.match(wizard, /template_key: templateKey/);
  assert.match(wizard, /template_seed: creation\.seed/);
});

test("unified editor and other canonical designs remain registered", async () => {
  const editor = await read("../app/admin/site/page.tsx");
  assert.match(editor, /OneStudio Site Editor/);
  for (const key of ["standard", "premium-kids-center", "premium-studio"] as const) {
    const template = getSiteTemplateDefinition(key);
    assert.equal(template?.key, key);
    assert.equal(template?.runtime.editorSelectable, true);
    assert.equal(template?.runtime.previewSelectable, true);
    assert.equal(template?.runtime.publicRenderable, true);
  }
});
