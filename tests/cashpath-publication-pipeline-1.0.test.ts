import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  eligibleCashPathGuideLinks,
  installMissingCashPathGuides,
  missingCashPathGuides,
} from "../lib/public-site/cashpath-guides.ts";
import { CASH_PATH_GUIDES } from "../lib/public-site/cashpath-guides.generated.ts";
import type { PublicSiteContent } from "../lib/public-site/types.ts";

const fixture = (body: string) => `---
slug: parser-fixture
nav_label: Parser fixture
eyebrow: GUIDE
seo_title: Parser fixture | CashPath
seo_description: A parser fixture.
---

# Parser fixture

Intro paragraph with [a safe link](/p/faq).

## First section

${body}
`;

function generateFixture(body: string) {
  const directory = mkdtempSync(join(tmpdir(), "cashpath-guide-"));
  const source = join(directory, "fixture.md");
  const output = join(directory, "generated.ts");
  writeFileSync(source, fixture(body));
  try {
    const generated = execFileSync(
      "node",
      ["scripts/generate-cashpath-guides.mjs", "--input-dir", directory, "--output-file", output],
      { cwd: new URL("..", import.meta.url), encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
    return { generated, output: readFileSync(output, "utf8") };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function rejectFixture(body: string) {
  assert.throws(
    () => generateFixture(body),
    (error: unknown) => {
      const stderr = error && typeof error === "object" && "stderr" in error
        ? String((error as { stderr?: string }).stderr)
        : "";
      return /uses unsupported Markdown/.test(stderr);
    },
  );
}

test("guide parser preserves only renderer-supported flat lists and inline content", () => {
  const result = generateFixture("- One\n- Two\n\n1. First\n2. Second\n\n**Important** and *emphasized*.");
  assert.match(result.generated, /Generated/);
  assert.match(result.output, /\\"type\\":\\"ul\\"/);
  assert.match(result.output, /\\"type\\":\\"ol\\"/);
  assert.match(result.output, /\\"type\\":\\"strong\\"/);
});

test("guide parser fails closed for Markdown the public renderer does not model", () => {
  for (const unsupported of [
    "### Unsupported heading",
    "| Head | Value |\n| --- | --- |\n| A | B |",
    "> A blockquote",
    "```text\ncode\n```",
    "- Parent\n  - Nested child",
    "![Image](https://example.test/image.png)",
    "Inline `code`",
  ]) rejectFixture(unsupported);
});

test("guide release gate is append-only, idempotent, and public links require an eligible custom page", () => {
  const guide = CASH_PATH_GUIDES[0];
  const content = {
    template_id: "cashpath",
    seo_title: "CashPath",
    seo_description: "",
    pages: [{ ...guide, type: "portfolio", is_visible: true, seo_no_index: false }],
  } as unknown as PublicSiteContent;
  assert.equal(eligibleCashPathGuideLinks(content).length, 0);
  assert.equal(missingCashPathGuides(content).length, CASH_PATH_GUIDES.length - 1);

  const eligible = {
    ...content,
    pages: [{ ...guide, type: "custom", is_visible: true, seo_no_index: false }],
  } as unknown as PublicSiteContent;
  assert.deepEqual(eligibleCashPathGuideLinks(eligible).map((page) => page.slug), [guide.slug]);
  assert.equal(eligibleCashPathGuideLinks({ ...eligible, pages: [{ ...guide, seo_no_index: true }] }).length, 0);
  assert.equal(eligibleCashPathGuideLinks({ ...eligible, pages: [{ ...guide, is_visible: false }] }).length, 0);

  const installed = installMissingCashPathGuides(eligible);
  assert.equal(installed.pages?.length, CASH_PATH_GUIDES.length);
  assert.equal(installMissingCashPathGuides(installed), installed);
});

test("owned-domain and tenant custom-page routes preserve their distinct base paths", () => {
  const route = readFileSync(new URL("../app/site/[businessSlug]/p/[pageSlug]/page.tsx", import.meta.url), "utf8");
  const localizedRoute = readFileSync(new URL("../app/site/[businessSlug]/[locale]/p/[pageSlug]/page.tsx", import.meta.url), "utf8");
  const runtime = readFileSync(new URL("../components/public/PublicCustomPageRuntime.tsx", import.meta.url), "utf8");
  assert.match(route, /basePath=\{context\.cleanUrls \? "\/" : `\/site\/\$\{businessSlug\}`\}/);
  assert.match(localizedRoute, /context\.cleanUrls\s*\? `\/\$\{normalizedLocale\}`\s*: `\/site\/\$\{businessSlug\}\/\$\{normalizedLocale\}`/);
  assert.match(runtime, /basePath=\{resolvedBasePath\}/);
});

test("editor exposes a separate, explicit sync-to-draft release gate", () => {
  const editor = readFileSync(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8");
  assert.match(editor, /SYNC TO DRAFT/);
  assert.match(editor, /missingGuides\.length/);
  assert.match(editor, /guide\.nav_label/);
  assert.match(editor, /installMissingCashPathGuides\(draft\)/);
  assert.doesNotMatch(editor, /Sync and publish/);
});
