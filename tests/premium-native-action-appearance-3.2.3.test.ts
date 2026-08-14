import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  clearPremiumNativeActionStyles,
  premiumNativeActionKey,
  premiumNativeActionStyleSheet,
  withPremiumActionAppearances,
} from "../lib/public-site/premium-action-style.ts";
import { PREMIUM_TEMPLATE_EDITOR_ADAPTERS } from "../lib/public-site/premium-template-editor-registry.ts";
import { createTemplateSeed } from "../lib/public-site/template-seeds.ts";
import type { EditorInspectorPlacedField } from "../lib/public-site/editor-spec.ts";
import type { PublicSiteContent } from "../lib/public-site/types.ts";

const actionField = {
  id: "velora-hero-primary-action",
  group: "content",
  type: "action",
  label: "Primary",
  text: "Check date",
  href: "#availability",
  onTextChange: () => {},
  onHrefChange: () => {},
} as EditorInspectorPlacedField;

test("premium action editor decorates any premium action with shared appearance", () => {
  let changed: PublicSiteContent | undefined;
  const content = {
    theme_accent: "#d6b56e",
    theme_dark: "#07101e",
    theme_surface: "#f6f0e5",
  } as unknown as PublicSiteContent;

  const fields = withPremiumActionAppearances({
    fields: [actionField],
    content,
    templateKey: "velora-event-venue",
    sectionId: "hero",
    disabled: false,
    onChange: (next) => { changed = next; },
  });

  const action = fields[0];
  assert.equal(action.type, "action");
  if (action.type !== "action") throw new Error("Expected action");
  assert.ok(action.appearance);
  assert.equal(action.appearance?.backgroundColor, "#d6b56e");
  action.appearance?.onSizeChange("large");

  assert.equal(
    changed?.native_action_styles?.[
      "velora-event-venue:hero:velora-hero-primary-action"
    ]?.size,
    "large",
  );
});

test("premium native action stylesheet is isolated by template", () => {
  const content = {
    native_action_styles: {
      "velora-event-venue:hero:velora-hero-primary-action": {
        size: "large",
        background_color: "#123456",
        text_color: "#abcdef",
      },
      "gloss-nail-studio:hero:gloss-hero-primary-action": {
        background_color: "#654321",
      },
    },
  } as unknown as PublicSiteContent;

  const css = premiumNativeActionStyleSheet(content, "velora-event-venue");
  assert.match(css, /velora-event-venue:hero:velora-hero-primary-action/);
  assert.match(css, /background-color:#123456/);
  assert.match(css, /color:#abcdef/);
  assert.match(css, /min-height:56px/);
  assert.doesNotMatch(css, /gloss-nail-studio/);
});

test("every registered premium editor action has an exact runtime marker contract", async () => {
  const [gloss, velora, footer, noir, vow, registry, preview, genericPreview] = await Promise.all([
    readFile(new URL("../components/public/GlossBusinessSite.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/public/velora/VeloraSite.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/public/velora/VeloraFooter.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/demos/premium-studio/PremiumStudioExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/public/vow/VowSite.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/public-site/premium-template-editor-registry-builder.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/public-site/premium-template-editor-canvas-registry.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8"),
  ]);
  const runtimeSource = [gloss, velora, footer, noir, vow].join("\n");
  const actionKeys: string[] = [];

  for (const adapter of PREMIUM_TEMPLATE_EDITOR_ADAPTERS) {
    const content = createTemplateSeed(adapter.templateKey);
    for (const section of [...(adapter.fixedEditorSections ?? []), ...adapter.contract.nativeSections]) {
      const fields = adapter.buildInspectorFields({
        content,
        sectionId: section.id,
        disabled: false,
        onChange: () => undefined,
      });
      for (const field of fields) {
        if (field.type !== "action") continue;
        const key = premiumNativeActionKey(adapter.templateKey, section.id, field.id);
        actionKeys.push(key);
        const literalMarker = `data-premium-action="${key}"`;
        const helperMarker = `premiumNativeActionKey("${adapter.templateKey}", "${section.id}", "${field.id}")`;
        assert.ok(
          runtimeSource.includes(literalMarker) || runtimeSource.includes(helperMarker),
          `${key} must have a matching public runtime marker`,
        );
        if (adapter.templateKey === "gloss-nail-studio") {
          assert.ok(
            genericPreview.includes(literalMarker) || genericPreview.includes(helperMarker),
            `${key} must have a matching GLOSS editor preview marker`,
          );
        }
      }
    }
  }

  assert.deepEqual(actionKeys.sort(), [
    "gloss-nail-studio:about:gloss-about-action",
    "gloss-nail-studio:hero:gloss-hero-primary-action",
    "gloss-nail-studio:hero:gloss-hero-secondary-action",
    "premium-studio:contact:contact-cta",
    "premium-studio:hero:hero-cta",
    "velora-event-venue:footer:cta",
    "velora-event-venue:hero:header-cta",
    "velora-event-venue:hero:velora-hero-primary-action",
    "velora-event-venue:hero:velora-hero-secondary-action",
    "vow-films:hero:primary-action",
    "vow-films:hero:secondary-action",
  ].sort());
  assert.match(registry, /withPremiumActionAppearances/);
  assert.match(preview, /PublicPremiumActionStyles/);
  assert.match(genericPreview, /PublicPremiumActionStyles/);
});

test("premium action persistence, section reset and template restore share one map contract", () => {
  const content = {
    ...createTemplateSeed("gloss-nail-studio"),
    native_action_styles: {
      "gloss-nail-studio:about:gloss-about-action": { size: "large" as const, background_color: "#123456", text_color: "#abcdef" },
      "gloss-nail-studio:hero:gloss-hero-primary-action": { size: "small" as const },
      "velora-event-venue:hero:header-cta": { text_color: "#fedcba" },
    },
  };
  const reloaded = JSON.parse(JSON.stringify(content)) as PublicSiteContent;
  assert.deepEqual(reloaded.native_action_styles, content.native_action_styles);

  const gloss = PREMIUM_TEMPLATE_EDITOR_ADAPTERS.find(
    (adapter) => adapter.templateKey === "gloss-nail-studio",
  );
  assert.ok(gloss);
  const reset = gloss.resetSection(reloaded, "about");
  assert.equal(reset.native_action_styles?.["gloss-nail-studio:about:gloss-about-action"], undefined);
  assert.ok(reset.native_action_styles?.["gloss-nail-studio:hero:gloss-hero-primary-action"]);
  assert.ok(reset.native_action_styles?.["velora-event-venue:hero:header-cta"]);

  const restored = gloss.restoreTemplate(reset);
  assert.equal(restored.native_action_styles?.["gloss-nail-studio:hero:gloss-hero-primary-action"], undefined);
  assert.ok(restored.native_action_styles?.["velora-event-venue:hero:header-cta"]);
  assert.equal(premiumNativeActionStyleSheet(createTemplateSeed("gloss-nail-studio"), "gloss-nail-studio"), "");
  assert.equal(clearPremiumNativeActionStyles(content, "gloss-nail-studio", "about").native_action_styles?.["gloss-nail-studio:about:gloss-about-action"], undefined);
});
