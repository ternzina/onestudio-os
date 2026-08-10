import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PREMIUM_DEMOS } from "../lib/demo-catalog.ts";
import { getPremiumTemplateCustomPageRuntime } from "../lib/public-site/premium-template-custom-page-runtime-registry.ts";
import { getPremiumTemplateEditorAdapter } from "../lib/public-site/premium-template-editor-registry.ts";
import { getPremiumTemplatePackage } from "../lib/public-site/premium-template-package-catalog.ts";
import { PREMIUM_TEMPLATE_PACKAGE_SOURCE } from "../lib/public-site/premium-template-package-source.mjs";
import { getPremiumTemplateDefinition } from "../lib/public-site/premium-template-registry.ts";
import { getPremiumTemplatePublicRuntime } from "../lib/public-site/premium-template-runtime-registry.ts";
import { TEMPLATE_KEYS, getCustomerTemplateChoices, getEditorTemplateChoices } from "../lib/public-site/template-catalog.ts";
import { createTemplateSeed } from "../lib/public-site/template-seeds.ts";
import { resolveVeloraContent, withVeloraContent } from "../lib/public-site/velora-premium-template-content.ts";

const KEY = "velora-event-venue";
test("VELORA is one canonical package entry with complete manifest metadata", () => {
  assert.equal(PREMIUM_TEMPLATE_PACKAGE_SOURCE.filter(item => item.manifest.templateKey === KEY).length, 1);
  const manifest = getPremiumTemplatePackage(KEY)!;
  assert.deepEqual({ name: manifest.name, category: manifest.category, route: manifest.preview.route, image: manifest.preview.image }, { name: "VELORA HOUSE", category: "events", route: "/demos/velora-event-venue", image: "/templates/velora/hero.svg" });
  const demo = PREMIUM_DEMOS.find(item => item.slug === KEY)!;
  assert.equal(demo.href, manifest.preview.route); assert.deepEqual(demo.title, manifest.preview.title); assert.deepEqual(demo.description, manifest.preview.description); assert.equal(demo.previewImage, manifest.preview.image); assert.equal(demo.group, "events");
});
test("all generated capability lookups resolve isolated VELORA implementations", () => {
  assert.ok(TEMPLATE_KEYS.includes(KEY)); assert.ok(getCustomerTemplateChoices().some(item => item.key === KEY)); assert.ok(getEditorTemplateChoices().some(item => item.key === KEY));
  assert.equal(getPremiumTemplateDefinition(KEY)?.templateKey, KEY); assert.equal(getPremiumTemplateEditorAdapter(KEY)?.templateKey, KEY); assert.equal(getPremiumTemplatePublicRuntime(KEY)?.templateKey, KEY); assert.equal(getPremiumTemplateCustomPageRuntime(KEY)?.templateKey, KEY);
  assert.notEqual(getPremiumTemplateEditorAdapter(KEY), getPremiumTemplateEditorAdapter("gloss-nail-studio")); assert.notEqual(getPremiumTemplatePublicRuntime(KEY), getPremiumTemplatePublicRuntime("premium-studio"));
  for (const lookup of [getPremiumTemplatePackage, getPremiumTemplateDefinition, getPremiumTemplateEditorAdapter, getPremiumTemplatePublicRuntime, getPremiumTemplateCustomPageRuntime]) { assert.equal(lookup("unknown"), undefined); assert.equal(lookup("premium-kids-center"), undefined); }
});
test("VELORA seed, normalization and JSON reload preserve namespace, layout, pages and custom blocks", () => {
  const seed = createTemplateSeed(KEY); assert.equal(seed.template_id, KEY); const velora = resolveVeloraContent(seed); assert.equal(velora.brand, "VELORA HOUSE"); assert.equal(seed.pages?.length, 2); assert.deepEqual(seed.pages?.map(page => page.slug), ["venues", "packages"]);
  velora.hero.title = "Свой заголовок"; const custom = { id: "velora-story", kind: "text" as const, eyebrow: "", title: "История", text: "Сохранить", items: "", button_label: "", button_url: "", tone: "light" as const, is_visible: true };
  const changed = withVeloraContent({ ...seed, custom_blocks: [custom], layout_order: [...(seed.layout_order ?? []), "custom:velora-story"] }, velora); const adapter = getPremiumTemplateEditorAdapter(KEY)!; const normalized = { ...changed, layout_order: adapter.normalizeLayout(changed.layout_order ?? [], [custom.id]) }; const reload = JSON.parse(JSON.stringify(normalized));
  assert.equal(resolveVeloraContent(reload).hero.title, "Свой заголовок"); assert.deepEqual(reload.custom_blocks, [custom]); assert.ok(reload.layout_order.includes("custom:velora-story")); assert.deepEqual(reload.pages.map((page: { slug: string }) => page.slug), ["venues", "packages"]);
});
test("VELORA public graph is lazy and demo catalog graph cannot reach implementations", async () => {
  const runtime = await readFile(new URL("../lib/public-site/velora-premium-template-runtime-adapter.ts", import.meta.url), "utf8"); const demos = await readFile(new URL("../lib/demo-catalog.ts", import.meta.url), "utf8");
  assert.match(runtime, /dynamic</); assert.doesNotMatch(demos, /velora-premium-template-(seed|editor|runtime)/); assert.doesNotMatch(runtime, /velora-premium-template-seed/);
});
