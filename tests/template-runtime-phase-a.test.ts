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
  for (const key of ["standard", "gloss-nail-studio", "premium-kids-center"]) {
    test(`${key} has complete executable runtime support`, () => {
      assert.equal(isExecutableSiteTemplate(key), true);
      assert.deepEqual(getSiteTemplateDefinition(key)?.runtime, { editorSelectable: true, previewSelectable: true, publicRenderable: true, legacy: false });
    });
  }

  test("demo-only and unknown keys are not executable", () => {
    assert.equal(isExecutableSiteTemplate("gloss-nail-studio"), true);
    assert.equal(isPublicRenderableSiteTemplate("gloss-nail-studio"), true);
    assert.equal(getSiteTemplateDefinition("gloss-nail-studio")?.runtime.legacy, false);
    assert.equal(isExecutableSiteTemplate("premium-studio"), false);
    assert.equal(isExecutableSiteTemplate("unknown"), false);
    assert.equal(getSiteTemplateDefinition("premium-studio"), null);
  });

  test("legacy public resolution retains its explicit Standard fallback", () => {
    assert.equal(resolveSiteTemplateKey("legacy-unknown"), "standard");
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

  test("BEMBI → Standard → BEMBI retains prior BEMBI content", () => {
    const standard = selectExecutableTemplate(current, "standard");
    const bembi = selectExecutableTemplate(standard, "premium-kids-center");
    assert.deepEqual(bembi.template_content?.["premium-kids-center"], current.template_content?.["premium-kids-center"]);
    assert.deepEqual(bembi.template_content?.["future-template"], { retained: true });
  });

  test("required namespace is initialized once and invalid selection is rejected", () => {
    const initialized = selectExecutableTemplate({ template_id: "standard", template_content: { other: 1 } } as unknown as PublicSiteContent, "premium-kids-center");
    assert.deepEqual(initialized.template_content, { other: 1, "premium-kids-center": {} });
    assert.throws(() => selectExecutableTemplate(current, "premium-studio"), /not executable/);
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
    assert.deepEqual(decidePreviewTemplate({ template_id: "premium-studio" } as PublicSiteContent, "premium-studio"), { kind: "reject", reason: "non-executable-template" });
  });

  test("generated preview URL carries locale and preserves nested runtime paths", () => {
    assert.equal(
      buildSitePreviewHref({ templateKey: "premium-kids-center", businessSlug: "my studio", locale: "en", templatePath: ["articles", "hello"] }),
      "/site-preview/premium-kids-center/my%20studio/_locale/en/articles/hello",
    );
  });
});
