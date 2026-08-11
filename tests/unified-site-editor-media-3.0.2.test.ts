import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/noir-premium-template-editor-adapter.ts";
import { createNoirPremiumTemplateSeed } from "../lib/public-site/noir-premium-template-seed.ts";
import { resolvePremiumStudioContent } from "../lib/public-site/premium-studio-content.ts";
import { VELORA_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/velora-premium-template-editor-adapter.ts";
import { createVeloraPremiumTemplateSeed } from "../lib/public-site/velora-premium-template-seed.ts";
import { resolveVeloraContent } from "../lib/public-site/velora-premium-template-content.ts";
import type { EditorInspectorPlacedField } from "../lib/public-site/editor-spec.ts";
import type { PublicSiteContent } from "../lib/public-site/types.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");
const media = (fields: readonly EditorInspectorPlacedField[], id: string) => {
  const field = fields.find(item => item.id === id);
  assert.ok(field && field.type === "media", `${id} must use the shared media field`);
  return field;
};

test("one OneStudio media field owns template and manually assembled image UI", async () => {
  const [spec, inspector, standard, list, universal, bembi, gloss] = await Promise.all([
    read("../lib/public-site/editor-spec.ts"),
    read("../components/admin/SharedEditorInspector.tsx"),
    read("../app/admin/site/page.tsx"),
    read("../components/admin/MediaListEditor.tsx"),
    read("../components/admin/PremiumUniversalBlockSettings.tsx"),
    read("../components/admin/PremiumTemplateEditor.tsx"),
    read("../components/admin/gloss/GlossNativeSectionControls.tsx"),
  ]);
  assert.match(spec, /type: "media"/);
  assert.match(inspector, /field\.type === "media"[^\n]+SiteEditorMediaField/);
  for (const source of [standard, list, universal, gloss]) assert.match(source, /SiteEditorMediaField/);
  assert.match(bembi, /type: "media"/);
  assert.doesNotMatch(bembi, /PremiumKidsNativeMediaEditor/);
});

test("NOIR scalar and nested demo images use the shared picker and restore their package original", () => {
  const seed = createNoirPremiumTemplateSeed();
  let changed: PublicSiteContent | undefined;
  const targets: string[] = [];
  const heroFields = NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER.buildInspectorFields({
    content: seed,
    sectionId: "hero",
    disabled: false,
    onChange(next) { changed = next; },
    onChooseMedia(target) { if (target.kind === "template-content") targets.push(target.path); },
  });
  const hero = media(heroFields, "hero-image");
  assert.equal(hero.value, hero.originalValue);
  hero.onChoose();
  assert.deepEqual(targets, ["hero.image"]);
  hero.onChange("https://cdn.example.test/noir-hero.webp");
  assert.equal(resolvePremiumStudioContent(changed).hero.image, "https://cdn.example.test/noir-hero.webp");
  hero.onChange(hero.originalValue!);
  assert.equal(resolvePremiumStudioContent(changed).hero.image, hero.originalValue);

  const serviceFields = NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER.buildInspectorFields({
    content: seed,
    sectionId: "services",
    disabled: false,
    onChange() {},
    onChooseMedia() {},
  });
  assert.ok(serviceFields.some(field => field.type === "media" && field.id === "services-list-0-image"));
  assert.ok(serviceFields.some(field => field.type === "media" && field.id === "services-list-0-hoverImage"));
});

test("VELORA demo images use the same media field and restore one path without resetting its section", () => {
  const seed = createVeloraPremiumTemplateSeed();
  let changed: PublicSiteContent | undefined;
  const fields = VELORA_PREMIUM_TEMPLATE_EDITOR_ADAPTER.buildInspectorFields({
    content: seed,
    sectionId: "hero",
    disabled: false,
    onChange(next) { changed = next; },
    onChooseMedia() {},
  });
  const hero = media(fields, "image");
  assert.equal(hero.value, hero.originalValue);
  hero.onChange("https://cdn.example.test/velora-hero.webp");
  assert.equal(resolveVeloraContent(changed).hero.image, "https://cdn.example.test/velora-hero.webp");
  hero.onChange(hero.originalValue!);
  assert.equal(resolveVeloraContent(changed).hero.image, hero.originalValue);
});
