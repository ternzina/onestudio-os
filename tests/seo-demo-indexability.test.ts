import assert from "node:assert/strict";
import test from "node:test";
import { createDemoMetadata, LOCALIZED_DEMOS, LOCALIZED_DEMO_PATHS } from "../lib/seo/demo-metadata.ts";

test("each translated demo has its own indexable canonical and reciprocal language alternates", () => {
  const canonicals = new Set<string>();
  const titles = new Set<string>();
  for (const slug of Object.keys(LOCALIZED_DEMOS) as (keyof typeof LOCALIZED_DEMOS)[]) {
    for (const locale of ["ru", "en"] as const) {
      const metadata = createDemoMetadata(slug, locale);
      const expected = `/demos/${slug}${locale === "en" ? "/en" : ""}`;
      assert.equal(metadata.alternates?.canonical, expected);
      assert.deepEqual(metadata.robots, { index: true, follow: true });
      assert.equal(metadata.alternates?.languages?.ru, `/demos/${slug}`);
      assert.equal(metadata.alternates?.languages?.en, `/demos/${slug}/en`);
      assert.equal(metadata.openGraph?.url, expected);
      assert.ok(LOCALIZED_DEMO_PATHS.includes(expected));
      assert.match(String(metadata.description), /OneStudio OS/);
      canonicals.add(expected);
      titles.add(String(metadata.title));
    }
  }
  assert.equal(canonicals.size, 16);
  assert.equal(titles.size, 16);
  assert.equal(new Set(LOCALIZED_DEMO_PATHS).size, 16);
});
