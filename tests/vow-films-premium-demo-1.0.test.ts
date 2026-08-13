import assert from "node:assert/strict";
import test from "node:test";
import { PREMIUM_DEMOS } from "../lib/demo-catalog.ts";
import { getPremiumTemplateCustomPageRuntime } from "../lib/public-site/premium-template-custom-page-runtime-registry.ts";
import { getPremiumTemplateEditorAdapter } from "../lib/public-site/premium-template-editor-registry.ts";
import { getPremiumTemplatePackage } from "../lib/public-site/premium-template-package-catalog.ts";
import { getPremiumTemplateDefinition } from "../lib/public-site/premium-template-registry.ts";
import { getPremiumTemplatePublicRuntime } from "../lib/public-site/premium-template-runtime-registry.ts";
import { createTemplateSeed } from "../lib/public-site/template-seeds.ts";
import { createCanonicalVowDemoSite } from "../lib/public-site/vow-demo.ts";
import { VOW_EDITOR_SPECS } from "../lib/public-site/vow-editor-schema.ts";
import { resolveVowContent } from "../lib/public-site/vow-premium-template-content.ts";
import { VOW_PREMIUM_TEMPLATE_CONTRACT } from "../lib/public-site/vow-premium-template-contract.ts";

const KEY = "vow-films";
const IDS = [
  "hero",
  "manifesto",
  "films",
  "story",
  "experience",
  "process",
  "packages",
  "gallery",
  "reviews",
  "availability",
  "faq",
  "contact",
  "footer",
] as const;

test("VOW FILMS is a complete premium package", () => {
  const manifest = getPremiumTemplatePackage(KEY);
  assert.equal(manifest?.templateKey, KEY);
  assert.equal(manifest?.library.tier, "premium");
  assert.equal(manifest?.preview.route, "/demos/vow-films");
  assert.equal(manifest?.capabilities.customerCreatable, true);
  assert.equal(manifest?.capabilities.editorSelectable, true);
  assert.equal(manifest?.capabilities.previewRenderable, true);
  assert.deepEqual(manifest?.nativeSectionIds, IDS);
  assert.deepEqual(VOW_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map(({ id }) => id), IDS);
});

test("VOW FILMS resolves through every universal premium registry", () => {
  assert.equal(getPremiumTemplateDefinition(KEY)?.templateKey, KEY);
  assert.equal(getPremiumTemplateEditorAdapter(KEY)?.templateKey, KEY);
  assert.equal(getPremiumTemplatePublicRuntime(KEY)?.templateKey, KEY);
  assert.equal(getPremiumTemplateCustomPageRuntime(KEY)?.templateKey, KEY);
  assert.equal(createTemplateSeed(KEY).template_id, KEY);
  assert.equal(PREMIUM_DEMOS.find(({ slug }) => slug === KEY)?.collection, "premium-template-package");
});

test("VOW FILMS seeds Russian and English independently", () => {
  const ru = createCanonicalVowDemoSite("ru");
  const en = createCanonicalVowDemoSite("en");
  const ruContent = resolveVowContent(ru.content);
  const enContent = resolveVowContent(en.content);
  assert.match(ruContent.hero.title, /Ваш день/);
  assert.match(enContent.hero.title, /Your day/);
  assert.equal(ru.business.currency, "EUR");
  assert.deepEqual(ru.available_locales, ["ru", "en"]);
  assert.equal(ru.content.layout_order?.length, IDS.length);
  assert.equal(en.content.layout_order?.length, IDS.length);
  assert.ok(ru.content.pages?.some((page) => page.slug === "films"));
  assert.ok(en.content.pages?.some((page) => page.slug === "packages"));
});

test("VOW native sections expose meaningful editor controls", () => {
  for (const id of IDS) assert.ok(VOW_EDITOR_SPECS[id].length > 0, `${id} has editor fields`);
  assert.ok(VOW_EDITOR_SPECS.hero.some((field) => field.path === "hero.image" && field.group === "media"));
  assert.ok(VOW_EDITOR_SPECS.hero.some((field) => field.path === "hero.primaryLabel"));
  assert.ok(VOW_EDITOR_SPECS.films.some((field) => field.path.startsWith("films.0.image")));
  assert.ok(VOW_EDITOR_SPECS.packages.some((field) => field.path.startsWith("packages.0.price")));
  assert.ok(VOW_EDITOR_SPECS.availability.some((field) => field.path === "availability.submit"));
});

test("VOW editor composition keeps hero/footer pinned and allows custom blocks", () => {
  const adapter = getPremiumTemplateEditorAdapter(KEY)!;
  const seed = createTemplateSeed(KEY);
  const custom = {
    id: "vow-custom-note",
    kind: "text" as const,
    eyebrow: "NOTE",
    title: "A custom chapter",
    text: "Shared OneStudio custom block.",
    items: "",
    button_label: "",
    button_url: "",
    tone: "light" as const,
    is_visible: true,
  };
  const next = adapter.insertCustomBlock(seed, custom);
  assert.equal(next.layout_order?.at(0), `native:${KEY}:hero`);
  assert.equal(next.layout_order?.at(-1), `native:${KEY}:footer`);
  assert.ok(next.layout_order?.includes(`custom:${custom.id}`));
});
