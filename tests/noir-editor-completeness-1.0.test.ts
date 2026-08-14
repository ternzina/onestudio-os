import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { buildNoirInspectorFields, NOIR_EDITOR_SECTIONS } from "../lib/public-site/noir-editor-schema.ts";
import { DEFAULT_PREMIUM_STUDIO_CONTENT, resolvePremiumStudioContent } from "../lib/public-site/premium-studio-content.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("NOIR exposes every meaningful home section through canonical inspector groups", () => {
  const expected = ["hero", "manifest", "light", "services", "portfolio", "retouch", "film", "team", "process", "equipment", "tour", "reviews", "faq", "contact", "footer"];
  assert.deepEqual(NOIR_EDITOR_SECTIONS.map(([id]) => id), expected);
  for (const [section] of NOIR_EDITOR_SECTIONS) {
    const fields = buildNoirInspectorFields(DEFAULT_PREMIUM_STUDIO_CONTENT, section, false, () => undefined);
    assert.ok(fields.length, `${section} must expose inspector fields`);
    assert.ok(fields.every(field => ["content", "typography", "media", "layout"].includes(field.group)));
  }
});

test("reported gaps have editable headings, scene captions, equipment, retouch and interaction copy", () => {
  const fields = NOIR_EDITOR_SECTIONS.flatMap(([section]) => buildNoirInspectorFields(DEFAULT_PREMIUM_STUDIO_CONTENT, section, false, () => undefined));
  const ids = new Set(fields.map(field => field.id));
  for (const id of ["intro-title", "services-title", "portfolio-title", "team-title", "faq-title", "light-scenes", "equipment-title", "equipment-list", "retouch-title", "before-label", "after-label", "film-hint", "tour-text", "tour-zones"]) assert.ok(ids.has(id), `${id} is bound`);
});

test("NOIR list and scalar inspector bindings update PremiumStudioContent", () => {
  let next = DEFAULT_PREMIUM_STUDIO_CONTENT;
  const commit = (value: typeof next) => { next = value; };
  const light = buildNoirInspectorFields(next, "light", false, commit).find(field => field.id === "light-scenes");
  assert.equal(light?.type, "textarea");
  if (light?.type === "textarea") light.onChange("рассвет | 06:30 | золотой контур | /custom-morning.webp");
  assert.equal(next.lightScene.scenes[0].caption, "золотой контур");
  assert.equal(next.lightScene.scenes[0].image, "/custom-morning.webp");
  const retouch = buildNoirInspectorFields(next, "retouch", false, commit).find(field => field.id === "retouch-title");
  if (retouch?.type === "textarea") retouch.onChange("До\nПосле");
  assert.equal(next.retouch.title, "До\nПосле");
});

test("standalone NOIR resolves the original demo defaults", () => {
  const resolved = resolvePremiumStudioContent();
  assert.deepEqual(resolved, DEFAULT_PREMIUM_STUDIO_CONTENT);
  assert.equal(resolved.hero.eyebrow, "Фотостудия · Киев · 2026");
  assert.equal(resolved.lightScene.scenes[0].caption, "мягкий контур");
  assert.equal(resolved.retouch.beforeLabel, "До обработки");
  assert.equal(resolved.tour.zones[0].title, "Белая циклорама");
});

test("tenant NOIR runtime consumes namespace values and preserves original interactions", async () => {
  const [experience, interactions, tour, scene] = await Promise.all([
    read("../app/demos/premium-studio/PremiumStudioExperience.tsx"),
    read("../app/demos/premium-studio/PremiumInteractions.tsx"),
    read("../app/demos/premium-studio/StudioTour.tsx"),
    read("../app/demos/premium-studio/StudioTourScene.tsx"),
  ]);
  for (const binding of ["tenantContent.lightScene", "tenantContent.servicesPresentation", "tenantContent.portfolioPresentation", "tenantContent.teamPresentation", "tenantContent.equipmentPresentation", "tenantContent.faqPresentation", "tenantContent.contact", "tenantContent.footer"]) assert.match(experience, new RegExp(binding.replace(".", "\\.")));
  assert.match(experience, /<BeforeAfter content=\{tenantContent\.retouch\}/);
  assert.match(experience, /<FilmStrip[\s\S]*portfolio=\{portfolio\}/);
  assert.match(experience, /<StudioTour content=\{tenantContent\.tour\}/);
  assert.match(experience, /usePointerGlow|useScroll|useTransform/);
  assert.match(interactions, /type="range"/);
  assert.match(interactions, /ProjectViewer/);
  assert.match(tour, /DynamicStudioTour/);
  assert.match(scene, /data-tour-interactive/);
});

test("NOIR is a registered shared navigator/inspector data adapter without owned editor UI", async () => {
  const [editor, adapter, canvasRegistry, schema, runtime] = await Promise.all([
    read("../app/admin/site/page.tsx"),
    read("../lib/public-site/noir-premium-template-editor-adapter.ts"),
    read("../lib/public-site/premium-template-editor-canvas-registry.tsx"),
    read("../lib/public-site/noir-editor-schema.ts"),
    read("../components/admin/TemplateEditorRuntime.tsx"),
  ]);
  assert.match(editor, /getPremiumTemplateEditorAdapter/);
  assert.match(editor, /getPremiumTemplateEditorCanvasRenderer/);
  assert.doesNotMatch(editor, /PremiumStudioExperience|draft\.template_id === ["']premium-studio["']/);
  assert.doesNotMatch(editor, /noir-editor-schema|noir-premium-template-contract|noir-premium-template-compat/);
  assert.match(adapter, /buildNoirInspectorFields/);
  assert.match(canvasRegistry, /getPremiumTemplatePublicRuntime\(templateKey\)/);
  assert.match(canvasRegistry, /runtime\.publicHomeRenderer/);
  assert.doesNotMatch(canvasRegistry, /PremiumStudioExperience|premium-studio/);
  assert.match(runtime, /<SharedEditorNavigator model=\{navigatorModel\}/);
  assert.match(runtime, /<SharedEditorInspector model=\{inspectorModel\}/);
  assert.doesNotMatch(schema, /<aside|<nav|<dialog|modal|sidebar|toolbar/i);
  assert.doesNotMatch(editor, /<Noir(Editor|Inspector|Navigator|Sidebar|Modal)(?:\s|>)/);
});

test("NOIR keeps common pages, design, SEO, Preview and universal blocks", async () => {
  const editor = await read("../app/admin/site/page.tsx");
  for (const contract of ["+ Add page", "onOpenDesign", "onOpenSeo", "buildSitePreviewHref", "PUBLIC_SITE_CORE_BLOCK_LIBRARY", "PublicCustomPageRuntime"]) {
    if (contract === "PublicCustomPageRuntime") continue;
    assert.match(editor, new RegExp(contract.replace(/[+]/g, "\\+")));
  }
  const [customRuntime, customAdapter, noirPage] = await Promise.all([
    read("../components/public/PublicCustomPageRuntime.tsx"),
    read("../lib/public-site/noir-premium-template-custom-page-runtime-adapter.ts"),
    read("../components/public/NoirCustomPage.tsx"),
  ]);
  assert.match(customRuntime, /getPremiumTemplateCustomPageRuntime\(templateKey\)/);
  assert.doesNotMatch(customRuntime, /import NoirCustomPage|templateKey === ["']premium-studio/);
  assert.match(customAdapter, /import\("@\/components\/public\/NoirCustomPage"\)/);
  assert.match(customAdapter, /customPageRenderer: NoirPage/);
  assert.match(noirPage, /resolvePremiumStudioContent|PublicCustomBlock|show_in_navigation/);
});
