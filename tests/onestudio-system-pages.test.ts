import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { addOneStudioPage, createOneStudioPage, normalizeOneStudioPageSlug, updateOneStudioPage } from "../lib/public-site/one-studio-pages.ts";
import type { PublicSiteContent } from "../lib/public-site/types.ts";

const empty = { pages: [] } as unknown as PublicSiteContent;

test("OneStudio owns page creation and produces a real editable record", () => {
  const page = createOneStudioPage(empty, () => "page-id");
  assert.equal(page.id, "page-id");
  assert.equal(page.slug, "page-1");
  assert.equal(page.blocks?.length, 1);
  assert.equal(page.blocks?.[0].kind, "text");
  assert.equal(page.is_visible, true);
  assert.equal(page.show_in_navigation, true);
});

test("system updates preserve template namespaces and normalize page URLs", () => {
  const content = { ...empty, template_content: { "premium-kids-center": { blocks: ["preserved"] } } };
  const page = createOneStudioPage(content, () => "page-id");
  const added = addOneStudioPage(content, page);
  const updated = updateOneStudioPage(added, page.id, { slug: "  New Page!  ", seo_title: "SEO" });
  assert.equal(updated.pages?.[0].slug, "new-page");
  assert.equal(updated.pages?.[0].seo_title, "SEO");
  assert.deepEqual(updated.template_content, content.template_content);
  assert.equal(normalizeOneStudioPageSlug("---"), "page");
});

test("Base, GLOSS, and BEMBI receive the same system add-page command", async () => {
  const [base, premium, runtime] = await Promise.all([
    readFile(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/admin/PremiumTemplateEditor.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/admin/TemplateEditorRuntime.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(base, /createOneStudioPage/);
  assert.match(premium, /createOneStudioPage/);
  assert.match(base, /addPage: \{ id: "add-page"/);
  assert.match(premium, /addPage: \{ id: "add-page"/);
  assert.match(runtime, /spec\.commandModel\.addPage/);
});

test("BEMBI preview and published custom pages use its design renderer", async () => {
  const [runtime, registry, preview, renderer] = await Promise.all([
    readFile(new URL("../components/public/PublicCustomPageRuntime.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/public-site/premium-template-custom-page-runtime-registry.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/site-preview/[templateKey]/[businessSlug]/[[...templatePath]]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/public/BembiCustomPage.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(runtime, /premium-kids-center/);
  assert.match(runtime, /BembiCustomPage/);
  assert.match(runtime, /getPremiumTemplateCustomPageRuntime/);
  assert.doesNotMatch(runtime, /NoirCustomPage|templateKey === ["']premium-studio/);
  assert.doesNotMatch(registry, /premium-kids-center/);
  assert.match(preview, /runtimePath\[0\] === "p"/);
  assert.match(renderer, /PlatformLayout/);
  assert.match(renderer, /PremiumUniversalBlock/);
});
