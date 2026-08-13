import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  premiumNativeActionStyleSheet,
  withPremiumActionAppearances,
} from "../lib/public-site/premium-action-style.ts";
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

test("all registered premium native actions have stable runtime markers", async () => {
  const [gloss, velora, footer, noir, registry] = await Promise.all([
    readFile(new URL("../components/public/GlossBusinessSite.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/public/velora/VeloraSite.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/public/velora/VeloraFooter.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/demos/premium-studio/PremiumStudioExperience.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/public-site/premium-template-editor-registry-builder.ts", import.meta.url), "utf8"),
  ]);

  for (const marker of [
    "gloss-nail-studio:hero:gloss-hero-primary-action",
    "gloss-nail-studio:hero:gloss-hero-secondary-action",
  ]) assert.match(gloss, new RegExp(marker));

  for (const marker of [
    "velora-event-venue:hero:header-cta",
    "velora-event-venue:hero:velora-hero-primary-action",
    "velora-event-venue:hero:velora-hero-secondary-action",
  ]) assert.match(velora, new RegExp(marker));

  assert.match(footer, /velora-event-venue:footer:cta/);
  assert.match(noir, /premium-studio:hero:hero-cta/);
  assert.match(noir, /premium-studio:contact:contact-cta/);
  assert.match(registry, /withPremiumActionAppearances/);
});
