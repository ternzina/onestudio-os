import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PublicRichText from "../components/public/PublicRichText.tsx";
import { encodeRichText, richTextPlainText } from "../lib/public-site/rich-text.ts";
import { publicTypographyStyle } from "../lib/public-site/typography.ts";
import { premiumNativeActionKey, premiumNativeActionStyleSheet } from "../lib/public-site/premium-action-style.ts";
import { getPremiumTemplatePackage } from "../lib/public-site/premium-template-package-catalog.ts";
import { getPremiumTemplateDefinition } from "../lib/public-site/premium-template-registry.ts";
import { getPremiumTemplateEditorAdapter } from "../lib/public-site/premium-template-editor-registry.ts";
import { getPremiumTemplatePublicRuntime } from "../lib/public-site/premium-template-runtime-registry.ts";
import { getPremiumTemplateSeedFactory } from "../lib/public-site/premium-template-seed-registry.ts";
import { createBlacklineTattooPremiumTemplateSeed } from "../lib/public-site/blackline-tattoo-premium-template-seed.ts";
import { createBlacklineTattooRenderPlan } from "../lib/public-site/blackline-tattoo-render-plan.ts";
import { BLACKLINE_TATTOO_EDITOR_SPECS, buildBlacklineTattooInspectorFields } from "../lib/public-site/blackline-tattoo-editor-schema.ts";
import { resolveBlacklineTattooContent } from "../lib/public-site/blackline-tattoo-premium-template-content.ts";
const key = "blackline-tattoo";
const sections = ["hero", "styles", "artists", "portfolio", "consultation", "process", "safety", "care", "testimonials", "faq", "contact", "footer"];
test("BLACKLINE is a free canonical bilingual package", () => { const pkg = getPremiumTemplatePackage(key)!; assert.ok(pkg); assert.equal(pkg.preview.route, "/demos/blackline-tattoo"); assert.equal(pkg.access, "free"); assert.deepEqual(pkg.nativeSectionIds, sections); assert.ok(pkg.capabilities.customerCreatable && pkg.capabilities.editorSelectable && pkg.capabilities.previewRenderable && pkg.capabilities.publicHome && pkg.capabilities.customPages && pkg.capabilities.seoMetadata && pkg.capabilities.nativeSections && pkg.capabilities.customBlocks); assert.equal(getPremiumTemplateDefinition(key)?.compositionMode, "canonical"); assert.ok(getPremiumTemplateEditorAdapter(key)); assert.ok(getPremiumTemplatePublicRuntime(key)); assert.ok(getPremiumTemplateSeedFactory(key)); });
test("BLACKLINE pins hero/footer and supports shared custom composition", () => { const adapter = getPremiumTemplateEditorAdapter(key)!; const contract = adapter.contract; assert.equal(contract.nativeSections[0].pinning, "start"); assert.equal(contract.nativeSections.at(-1)?.pinning, "end"); assert.ok(contract.nativeSections.slice(1, -1).every((section) => section.capabilities.reorder)); const seed = createBlacklineTattooPremiumTemplateSeed(); const plan = createBlacklineTattooRenderPlan({ ...seed, custom_blocks: [{ id: "custom-note", kind: "text", eyebrow: "", title: "", text: "", items: "", button_label: "", button_url: "", tone: "light" }] }); assert.equal(plan[0].key, "native:blackline-tattoo:hero"); assert.equal(plan.at(-1)?.key, "native:blackline-tattoo:footer"); assert.ok(plan.some((item) => item.key === "custom:custom-note")); });
test("BLACKLINE has isolated assets and complete English content", async () => { const files = await readdir(new URL("../public/templates/blackline-tattoo/", import.meta.url)); assert.equal(files.length, 8); const pkg = getPremiumTemplatePackage(key)!; assert.equal(pkg.assets.length, 8); assert.ok(pkg.assets.every((asset) => asset.startsWith(`/templates/${key}/`))); const source = await readFile(new URL("../lib/public-site/blackline-tattoo-premium-template-content.ts", import.meta.url), "utf8"); assert.doesNotMatch(source, /\/images\/demos\//); const strings: string[] = []; const collect = (value: unknown) => { if (typeof value === "string") strings.push(value); else if (Array.isArray(value)) value.forEach(collect); else if (value && typeof value === "object") Object.values(value).forEach(collect); }; collect(createBlacklineTattooPremiumTemplateSeed("en")); assert.deepEqual(strings.filter((value) => /[А-Яа-яЁёІіЇїЄє]/u.test(value)), []); });

test("BLACKLINE schema covers all native sections and standard bindings", () => {
  assert.deepEqual(Object.keys(BLACKLINE_TATTOO_EDITOR_SPECS), sections);
  const content = resolveBlacklineTattooContent(createBlacklineTattooPremiumTemplateSeed());
  const fieldsFor = (section: typeof sections[number]) => buildBlacklineTattooInspectorFields(content, section as never, false, () => {});
  const paths = (section: typeof sections[number]) => BLACKLINE_TATTOO_EDITOR_SPECS[section as keyof typeof BLACKLINE_TATTOO_EDITOR_SPECS].map((field) => field.path);
  assert.ok(paths("hero").includes("hero.title") && paths("hero").includes("hero.text") && paths("hero").includes("hero.image"));
  assert.ok(paths("hero").includes("hero.primaryLabel") && paths("hero").includes("hero.secondaryLabel"));
  assert.equal(fieldsFor("hero").filter((field) => field.type === "media").length, 1);
  assert.equal(fieldsFor("styles").filter((field) => field.type === "media").length, 4);
  assert.equal(fieldsFor("artists").filter((field) => field.type === "media").length, 4);
  assert.equal(fieldsFor("portfolio").filter((field) => field.type === "media").length, 8);
  assert.equal(fieldsFor("consultation").filter((field) => field.type === "media").length, 1);
  assert.equal(fieldsFor("contact").filter((field) => field.type === "media").length, 1);
  for (const section of ["process", "safety", "care", "testimonials", "faq", "contact", "footer"] as const) assert.ok(fieldsFor(section).some((field) => field.group === "content"));
  const all = sections.flatMap((section) => fieldsFor(section));
  assert.ok(all.some((field) => field.type === "typography"));
  assert.ok(all.some((field) => field.type === "action"));
  const media = all.filter((field) => field.type === "media");
  assert.equal(new Set(media.map((field) => field.id)).size, media.length);
  assert.ok(media.every((field) => field.originalValue?.startsWith(`/templates/${key}/`)));
  assert.ok(media.every((field) => !field.originalValue?.includes("/images/demos/")));
});

test("BLACKLINE uses the standard adapter package binding", () => {
  const adapter = getPremiumTemplateEditorAdapter(key)!;
  assert.equal(adapter.templateKey, key);
  assert.equal(typeof adapter.buildInspectorFields, "function");
  assert.equal(adapter.contract.nativeSections.length, 12);
});

test("BLACKLINE decodes rich text through the shared public renderer", async () => {
  const encoded = encodeRichText({ version: 1, root: { type: "root", children: [{ type: "p", children: [{ type: "text", text: "Readable portfolio description" }] }] } });
  const html = renderToStaticMarkup(createElement(PublicRichText, { value: encoded }));
  assert.match(html, /Readable portfolio description/);
  assert.doesNotMatch(html, /__osrt1__|\\\{"version":1/);
  assert.equal(richTextPlainText(encoded), "Readable portfolio description");

  const source = await readFile(new URL("../components/public/blackline-tattoo/BlacklineTattooSite.tsx", import.meta.url), "utf8");
  assert.match(source, /PublicRichText/);
  assert.match(source, /<PublicRichText value=\{c\.hero\.text\}/);
  assert.doesNotMatch(source, /PublicRichHeading/);
  assert.match(source, /<h1 style=\{heroStyle\}>\{c\.hero\.title\}<\/h1>/);
});

test("BLACKLINE keeps plain fields plain and supports heading typography", () => {
  const plainPaths = ["announcement", "hero.eyebrow", "hero.trust.0", "portfolio.items.0.category", "contact.phone", "footer.title"];
  for (const path of plainPaths) {
    const spec = sections.flatMap((section) => BLACKLINE_TATTOO_EDITOR_SPECS[section as keyof typeof BLACKLINE_TATTOO_EDITOR_SPECS]).find((item) => item.path === path);
    assert.notEqual(spec?.kind, "richText", path);
  }
  const style = publicTypographyStyle({ font_family: "system", font_size: 72, color: "#c8ef22" });
  assert.equal(style.fontSize, "72px");
  assert.equal(style.color, "#c8ef22");
  assert.equal(style.fontFamily, "Inter, ui-sans-serif, system-ui, sans-serif");
});

test("BLACKLINE uses shared premium action appearance and exact runtime keys", async () => {
  const content = resolveBlacklineTattooContent(createBlacklineTattooPremiumTemplateSeed());
  let changed = createBlacklineTattooPremiumTemplateSeed();
  const fields = buildBlacklineTattooInspectorFields(content, "hero", false, () => {});
  const adapter = getPremiumTemplateEditorAdapter(key)!;

  const getPrimary = () => {
    const decorated = adapter.buildInspectorFields({
      content: changed,
      sectionId: "hero",
      disabled: false,
      onChange: (next) => { changed = next; },
    });
    const primary = decorated.find((field) => field.id === "primary");
    assert.equal(primary?.type, "action");
    if (primary?.type !== "action") throw new Error("Expected BLACKLINE primary action");
    assert.ok(primary.appearance);
    return primary;
  };

  getPrimary().appearance?.onBackgroundColorChange("#123456");
  getPrimary().appearance?.onTextColorChange("#abcdef");
  getPrimary().appearance?.onSizeChange("large");

  const actionKey = premiumNativeActionKey(key, "hero", "primary");
  assert.deepEqual(changed.native_action_styles?.[actionKey], {
    background_color: "#123456",
    text_color: "#abcdef",
    size: "large",
  });
  assert.ok(fields.some((field) => field.type === "action" && field.id === "primary"));
  const source = await readFile(new URL("../components/public/blackline-tattoo/BlacklineTattooSite.tsx", import.meta.url), "utf8");
  for (const [section, id] of [
    ["hero", "header-cta"], ["hero", "primary"], ["hero", "secondary"],
    ["consultation", "cta"], ["contact", "cta"], ["footer", "cta"],
  ] as const) {
    assert.match(source, new RegExp(`premiumNativeActionKey\\(\\"${key}\\", \\"${section}\\", \\"${id}\\"`));
  }
  assert.match(source, /premiumNativeActionKey\("blackline-tattoo", "artists", `artist-\$\{index\}-cta`\)/);
  const css = premiumNativeActionStyleSheet(changed, key);
  assert.match(css, /blackline-tattoo:hero:primary/);
  assert.match(css, /background-color:#123456!important/);
  assert.match(css, /color:#abcdef!important/);
  assert.match(css, /min-height:56px!important/);
});

test("BLACKLINE resolves old stored content without optional fields", () => {
  const oldContent = { template_content: { "blackline-tattoo": { hero: { title: encodeRichText({ version: 1, root: { type: "root", children: [{ type: "p", children: [{ type: "text", text: "Legacy title" }] }] } }) } } } } as never;
  const resolved = resolveBlacklineTattooContent(oldContent);
  assert.equal(resolved.hero.title, "Legacy title");
  assert.equal(typeof resolved.faqPresentation.text, "string");
  assert.doesNotThrow(() => richTextPlainText(resolved.hero.text));
});
