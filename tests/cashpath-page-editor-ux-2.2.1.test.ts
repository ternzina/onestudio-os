import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { CASH_PATH_FINAL_SEO_PAGES } from "../lib/public-site/cashpath-final-seo-content.generated.ts";
import { createCashPathPremiumTemplateSeed } from "../lib/public-site/cashpath-premium-template-seed.ts";

test("all editor page covers render rich and legacy page intros through PublicRichText", async () => {
  const source = await readFile(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8");
  const customPreview = source.slice(source.indexOf("function CustomPagePreview"));
  assert.match(customPreview, /<PublicRichText\s+value=\{page\.intro\}/);
  assert.doesNotMatch(customPreview, /<p[^>]*>\s*\{page\.intro\}\s*<\/p>/);
  assert.doesNotMatch(customPreview, />\s*\{page\.intro\}\s*</);
  assert.match(source, /<PublicRichText value=\{page\.intro\}/);
});

test("page navigator selections use stable anchors in the editor canvas", async () => {
  const source = await readFile(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8");
  assert.match(source, /window\.requestAnimationFrame/);
  assert.match(source, /workspaceCanvasRef\.current/);
  assert.match(source, /canvas\.scrollTo/);
  assert.match(source, /data-editor-anchor=\{`page:\$\{page\.id\}:intro`\}/);
  assert.match(source, /data-editor-anchor=\{`custom:\$\{block\.id\}`\}/);
  assert.match(source, /setSelectedPagePart\("intro"\); setSelectedCustomBlockId\(""\)/);
});

test("FAQ remains a single selectable custom page and long CashPath page endpoints remain intact", () => {
  const seed = createCashPathPremiumTemplateSeed();
  assert.equal(seed.pages?.filter((page) => page.slug === "faq").length, 1);
  assert.deepEqual(
    ["about", "faq", "privacy-policy", "terms-of-use"].map((slug) => {
      const page = CASH_PATH_FINAL_SEO_PAGES.find((candidate) => candidate.slug === slug);
      assert.ok(page);
      return [page.slug, page.blocks.length];
    }),
    [["about", 7], ["faq", 15], ["privacy-policy", 16], ["terms-of-use", 18]],
  );
});
