import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { translateAdmin, type AdminMessage } from "../lib/i18n/admin.ts";
import { PREMIUM_UNIVERSAL_BLOCK_LIBRARY, PUBLIC_SITE_CUSTOM_BLOCK_REGISTRY } from "../lib/public-site/custom-block-registry.ts";
import { PREMIUM_KIDS_BLOCK_REGISTRY, parsePremiumDelimitedItem, serializePremiumDelimitedItem } from "../lib/public-site/premium-kids-content.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("Premium semantic navigator names follow the selected Admin locale", () => {
  const header = PREMIUM_KIDS_BLOCK_REGISTRY.find((item) => item.type === "header")!;
  const final = PREMIUM_KIDS_BLOCK_REGISTRY.find((item) => item.type === "final")!;
  assert.equal(translateAdmin("ru", header.label as AdminMessage), "Шапка сайта");
  assert.equal(translateAdmin("en", header.label as AdminMessage), "Site header");
  assert.equal(translateAdmin("ru", final.label as AdminMessage), "Финальный призыв");
  assert.equal(translateAdmin("en", final.label as AdminMessage), "Final call to action");
  assert.ok(!PREMIUM_KIDS_BLOCK_REGISTRY.some((item) => item.label === "Header / Brand" || item.label === "Final CTA"));
});

test("Premium universal library derives its safe presets from the canonical registry", () => {
  assert.equal(PUBLIC_SITE_CUSTOM_BLOCK_REGISTRY.length, 10);
  assert.deepEqual([...new Set(PREMIUM_UNIVERSAL_BLOCK_LIBRARY.map((item) => item.kind))], PUBLIC_SITE_CUSTOM_BLOCK_REGISTRY.map(item => item.kind));
  assert.deepEqual(PREMIUM_UNIVERSAL_BLOCK_LIBRARY.filter((item) => item.kind === "media_text").map((item) => item.mediaPosition), ["right", "left"]);
  for (const item of PREMIUM_UNIVERSAL_BLOCK_LIBRARY) assert.ok(PUBLIC_SITE_CUSTOM_BLOCK_REGISTRY.some((canonical) => canonical.kind === item.kind && canonical.premiumSupported));
  assert.ok(!PUBLIC_SITE_CUSTOM_BLOCK_REGISTRY.some((item) => item.kind === ("faq" as never)));
});

test("Standard FAQ stays a system section and Premium FAQ stays semantic", async () => {
  const standard = await read("../app/admin/site/page.tsx");
  assert.match(standard, /faq: "show_faq"/);
  assert.match(standard, /faq: "FAQ"/);
  assert.ok(PREMIUM_KIDS_BLOCK_REGISTRY.some((item) => item.type === "faq" && item.fieldKeys.includes("faq")));
});

test("Premium structured helpers parse legacy delimiters and round-trip formatted bodies", () => {
  for (const [source, fromEnd] of [["Question · Answer", false], ["Review text · Author", true]] as const) {
    const parsed = parsePremiumDelimitedItem(source, "·", fromEnd);
    const serialized = serializePremiumDelimitedItem(parsed.primary, `<p><strong>${parsed.secondary}</strong></p>`);
    assert.deepEqual(parsePremiumDelimitedItem(serialized), { primary: parsed.primary, secondary: `<p><strong>${parsed.secondary}</strong></p>` });
  }
  assert.match(serializePremiumDelimitedItem("Name", "<p>Role</p>"), /^onestudio:rich-item:v1:/);
});

test("shared chrome, localized editor dependencies and independent scroll remain wired", async () => {
  const premium = await read("../components/admin/PremiumTemplateEditor.tsx");
  const standard = await read("../app/admin/site/page.tsx");
  const runtime = await read("../components/admin/TemplateEditorRuntime.tsx");
  const globals = await read("../app/globals.css");
  for (const component of ["PremiumDelimitedListEditor", "navigatorModel", "inspectorModel"]) assert.match(premium, new RegExp(component));
  for (const file of ["RichTextEditor.tsx", "TypographyControls.tsx", "MediaLibraryPicker.tsx"]) assert.match(await read(`../components/admin/${file}`), /useAdminI18n/);
  assert.match(await read("../components/admin/PremiumUniversalBlockSettings.tsx"), /t: Translate/);
  assert.match(runtime, /useAdminI18n/);
  assert.doesNotMatch(premium, /TemplateEditorShell/);
  assert.match(premium, /<TemplateEditorRuntime/);
  assert.match(standard, /<TemplateEditorRuntime/);
  assert.match(runtime, /<EditorBlockLibrary/);
  assert.doesNotMatch(premium, /<EditorBlockLibrary/);
  assert.doesNotMatch(standard, /<EditorBlockLibrary/);
  for (const primitive of ["OneStudioEditorToolbar", "OneStudioEditorCommandBar", "OneStudioEditorWorkspace"]) assert.match(runtime, new RegExp(`export function ${primitive}`));
  assert.doesNotMatch(standard, /<OneStudioEditorWorkspace/);
  assert.match(globals, /template-editor-settings[^}]*overflow-y: auto/s);
});

test("Premium structured prose uses rich editing and safe public rendering", async () => {
  const editor = await read("../components/admin/PremiumDelimitedListEditor.tsx");
  const renderer = await read("../app/demos/premium-kids-center/CenterExperience.tsx");
  assert.match(editor, /primaryLabel === "Review text"/);
  assert.match(editor, /secondaryLabel === "Answer" \|\| secondaryLabel === "Role"/);
  assert.match(editor, /<RichTextEditor/);
  assert.match(renderer, /parsePremiumDelimitedItem/);
  assert.match(renderer, /<PublicRichText value=\{quote\}/);
  assert.match(renderer, /<PublicRichText value=\{answer\}/);
  assert.match(renderer, /<PublicRichText value=\{teacher\.role\}/);
});

test("required block normalization and renderer separation remain intact", async () => {
  const content = await read("../lib/public-site/premium-kids-content.ts");
  const renderer = await read("../app/demos/premium-kids-center/PremiumUniversalBlock.tsx");
  assert.match(content, /requiredTypes = new Set<PremiumKidsBlockType>\(\["header", "hero", "footer"\]\)/);
  assert.match(content, /from < 2 \|\| to < 2/);
  assert.match(renderer, /PremiumUniversalBlock/);
});
