import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  editorActionHrefKind,
  safePublicActionHref,
} from "../lib/public-site/editor-actions.ts";
import { buildGlossInspectorFields } from "../lib/public-site/gloss-editor-schema.ts";
import { NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/noir-premium-template-editor-adapter.ts";
import { createNoirPremiumTemplateSeed } from "../lib/public-site/noir-premium-template-seed.ts";
import { createTemplateSeed } from "../lib/public-site/template-seeds.ts";
import { VELORA_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "../lib/public-site/velora-premium-template-editor-adapter.ts";
import { resolveVeloraContent } from "../lib/public-site/velora-premium-template-content.ts";
import type { EditorInspectorPlacedField } from "../lib/public-site/editor-spec.ts";
import type { PublicSiteContent } from "../lib/public-site/types.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

function action(fields: readonly EditorInspectorPlacedField[], id: string) {
  const field = fields.find((item) => item.id === id);
  assert.ok(field && field.type === "action", `${id} must use the shared action field`);
  return field;
}

test("button destinations share one bounded link contract", () => {
  assert.equal(editorActionHrefKind(""), "default");
  assert.equal(editorActionHrefKind("#contact"), "section");
  assert.equal(editorActionHrefKind("/site/page?ref=hero"), "page");
  assert.equal(editorActionHrefKind("https://example.com/book"), "external");
  assert.equal(editorActionHrefKind("javascript:alert(1)"), "invalid");
  assert.equal(editorActionHrefKind("//example.com"), "invalid");
  assert.equal(editorActionHrefKind("http://example.com"), "invalid");
  assert.equal(editorActionHrefKind("mailto:hello@example.com"), "invalid");
  assert.equal(editorActionHrefKind("mailto:hello@example.com", true), "email");
  assert.equal(safePublicActionHref("javascript:alert(1)", "#contact"), "#contact");
  assert.equal(safePublicActionHref("//example.com", "#contact"), "#contact");
  assert.equal(safePublicActionHref("https://example.com/book", "#contact"), "https://example.com/book");
});

test("GLOSS pairs existing label and URL paths without changing persistence", () => {
  let content = createTemplateSeed("gloss-nail-studio");
  const build = () => buildGlossInspectorFields(content, "hero", false, (next) => { content = next; }, createTemplateSeed("gloss-nail-studio"));
  const primary = action(build(), "gloss-hero-primary-action");
  assert.equal(primary.text, content.hero_primary_label);
  assert.equal(primary.href, content.hero_primary_url);
  primary.onTextChange("Новая запись");
  assert.equal(content.hero_primary_label, "Новая запись");
  action(build(), "gloss-hero-primary-action").onHrefChange?.("#contact");
  assert.equal(content.hero_primary_url, "#contact");
  assert.ok(!build().some((field) => field.id === "gloss-hero-primary-url"));
});

test("VELORA hero uses the same action editor and retains native content paths", () => {
  let content = createTemplateSeed("velora-event-venue");
  const build = () => VELORA_PREMIUM_TEMPLATE_EDITOR_ADAPTER.buildInspectorFields({
    content,
    sectionId: "hero",
    disabled: false,
    onChange(next) { content = next; },
  });
  const primary = action(build(), "velora-hero-primary-action");
  primary.onTextChange("Проверить свободную дату");
  assert.equal(resolveVeloraContent(content).hero.primaryLabel, "Проверить свободную дату");
  action(build(), "velora-hero-primary-action").onHrefChange?.("#availability");
  assert.equal(resolveVeloraContent(content).hero.primaryUrl, "#availability");
  assert.equal(action(build(), "header-cta").onHrefChange, undefined);
});

test("NOIR preserves template-owned destinations as fixed actions", () => {
  let content: PublicSiteContent | undefined;
  const fields = NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER.buildInspectorFields({
    content: createNoirPremiumTemplateSeed(),
    sectionId: "hero",
    disabled: false,
    onChange(next) { content = next; },
  });
  const hero = action(fields, "hero-cta");
  assert.equal(hero.destinationHint, "Световая история");
  assert.equal(hero.onHrefChange, undefined);
  hero.onTextChange("Смотреть свет");
  assert.ok(content);
});

test("one shared component owns Standard, Premium and structured card button UI", async () => {
  const [spec, inspector, standard, bembi, universal, gloss] = await Promise.all([
    read("../lib/public-site/editor-spec.ts"),
    read("../components/admin/SharedEditorInspector.tsx"),
    read("../app/admin/site/page.tsx"),
    read("../components/admin/PremiumTemplateEditor.tsx"),
    read("../components/admin/PremiumUniversalBlockSettings.tsx"),
    read("../components/admin/gloss/GlossNativeSectionControls.tsx"),
  ]);
  assert.match(spec, /type: "action"/);
  assert.match(inspector, /field\.type === "action"[^\n]+SiteEditorActionField/);
  for (const source of [standard, gloss]) assert.match(source, /SiteEditorActionField/);
  for (const source of [bembi, universal]) assert.match(source, /type: "action"/);
});

test("public button runtimes reject unsafe stored destinations", async () => {
  for (const path of [
    "../components/public/PublicBusinessSite.tsx",
    "../components/public/GlossBusinessSite.tsx",
    "../components/public/PublicCustomBlock.tsx",
    "../components/public/velora/VeloraSite.tsx",
    "../app/demos/premium-kids-center/PremiumUniversalBlock.tsx",
  ]) {
    assert.match(await read(path), /safePublicActionHref/);
  }
});
