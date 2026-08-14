import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  getSiteTemplateDefinition,
  isPublicRenderableSiteTemplate,
  isExecutableSiteTemplate,
  resolveSiteTemplateKey,
} from "../lib/public-site/template-registry.ts";
import { selectExecutableTemplate } from "../lib/public-site/template-selection.ts";
import {
  buildSitePreviewHref,
  decidePreviewTemplate,
  getLocalePreviewContent,
} from "../lib/public-site/preview-contract.ts";
import type { PublicSiteContent, PublicSiteEditorData } from "../lib/public-site/types.ts";

describe("Phase A executable registry", () => {
  for (const key of ["standard", "gloss-nail-studio", "premium-kids-center", "premium-studio", "velora-event-venue"]) {
    test(`${key} has complete executable runtime support`, () => {
      assert.equal(isExecutableSiteTemplate(key), true);
      const runtime = getSiteTemplateDefinition(key)?.runtime;
      assert.equal(runtime?.previewSelectable, true);
      assert.equal(runtime?.publicRenderable, true);
      assert.equal(runtime?.legacy, key === "premium-kids-center");
      assert.equal(runtime?.editorSelectable, key !== "premium-kids-center");
    });
  }

  test("NOIR is executable and unknown keys are not", () => {
    assert.equal(isExecutableSiteTemplate("gloss-nail-studio"), true);
    assert.equal(isPublicRenderableSiteTemplate("gloss-nail-studio"), true);
    assert.equal(getSiteTemplateDefinition("gloss-nail-studio")?.runtime.legacy, false);
    assert.equal(isExecutableSiteTemplate("premium-studio"), true);
    assert.equal(isExecutableSiteTemplate("unknown"), false);
    assert.deepEqual(getSiteTemplateDefinition("premium-studio")?.integration, { kind: "premium-package" });
  });

  test("unknown runtime adapters fail clearly in development", () => {
    assert.throws(() => resolveSiteTemplateKey("legacy-unknown"), /No canonical template adapter/);
  });
});

describe("Phase A template selection", () => {
  const current = {
    template_id: "premium-kids-center",
    brand_name: "Latest unsaved name",
    hero_title: "Latest unsaved hero",
    template_content: {
      "premium-kids-center": { brand_name: "Preserved BEMBI", blocks: [{ id: "hero" }] },
      "future-template": { retained: true },
    },
  } as unknown as PublicSiteContent;

  test("saves the complete latest in-memory draft and preserves every namespace", () => {
    const selected = selectExecutableTemplate(current, "standard");
    assert.equal(selected.template_id, "standard");
    assert.equal(selected.brand_name, "Latest unsaved name");
    assert.equal(selected.hero_title, "Latest unsaved hero");
    assert.deepEqual(selected.template_content, current.template_content);
  });

  test("legacy BEMBI namespace survives switching away, but cannot be newly selected", () => {
    const standard = selectExecutableTemplate(current, "standard");
    assert.deepEqual(standard.template_content?.["premium-kids-center"], current.template_content?.["premium-kids-center"]);
    assert.deepEqual(standard.template_content?.["future-template"], { retained: true });
    assert.throws(() => selectExecutableTemplate(standard, "premium-kids-center"), /not selectable/);
  });

  test("new package namespaces initialize while legacy BEMBI selection is rejected", () => {
    assert.throws(() => selectExecutableTemplate({ template_id: "standard" } as PublicSiteContent, "premium-kids-center"), /not selectable/);
    assert.equal(selectExecutableTemplate(current, "premium-studio").template_id, "premium-studio");
  });
});

function editorWithLocaleDrafts(): PublicSiteEditorData {
  const content = (template_id: string, marker: string): PublicSiteContent => ({ template_id, brand_name: marker } as PublicSiteContent);
  return {
    business: { id: "business", slug: "studio", name: "Studio", default_locale: "ru", default_currency: "UAH" },
    site: { is_published: true, primary_locale: "ru", published_at: null },
    locales: [
      { locale: "ru", draft_content: content("standard", "RU draft"), published_content: content("gloss-nail-studio", "RU published"), published_at: null },
      { locale: "en", draft_content: content("premium-kids-center", "EN draft"), published_content: content("standard", "EN published"), published_at: null },
    ],
  };
}

describe("Phase A locale and preview contract", () => {
  test("locale-specific drafts independently select their templates", () => {
    const editor = editorWithLocaleDrafts();
    assert.equal(getLocalePreviewContent(editor, "ru")?.template_id, "standard");
    assert.equal(getLocalePreviewContent(editor, "en")?.template_id, "premium-kids-center");
  });

  test("draft wins over published without changing published selection", () => {
    const editor = editorWithLocaleDrafts();
    assert.equal(getLocalePreviewContent(editor, "ru")?.template_id, "standard");
    assert.equal(editor.locales[0].published_content?.template_id, "gloss-nail-studio");
  });

  test("stored draft is canonical and a URL mismatch redirects", () => {
    assert.deepEqual(decidePreviewTemplate({ template_id: "standard" } as PublicSiteContent, "standard"), { kind: "render", templateKey: "standard" });
    assert.deepEqual(decidePreviewTemplate({ template_id: "premium-kids-center" } as PublicSiteContent, "standard"), { kind: "redirect", templateKey: "premium-kids-center" });
    assert.deepEqual(decidePreviewTemplate({ template_id: "premium-studio" } as PublicSiteContent, "premium-studio"), { kind: "render", templateKey: "premium-studio" });
  });

  test("generated preview URL carries locale and preserves nested runtime paths", () => {
    assert.equal(
      buildSitePreviewHref({ templateKey: "premium-kids-center", businessSlug: "my studio", locale: "en", templatePath: ["articles", "hello"] }),
      "/site-preview/premium-kids-center/my%20studio/_locale/en/articles/hello",
    );
  });
});
