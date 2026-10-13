import assert from "node:assert/strict";
import test from "node:test";
import revisions from "../lib/guides/metadata-revisions.json" with { type: "json" };
import {
  getGuideSeoFields,
  GUIDE_TITLE_LIMIT,
  GUIDE_DESCRIPTION_LIMIT,
} from "../lib/guides/metadata.ts";

test("17hats search copy is concise without changing the article input", () => {
  const article = Object.freeze({
    title: "17hats Alternative for Service Businesses: Website + Booking + CRM",
    description: "Compare 17hats with OneStudio for service businesses that want an owned website, online booking and connected client records without a full document and workflow suite.",
  });
  const result = getGuideSeoFields(article);
  assert.equal(result.title, "17hats Alternative: Website, Booking & CRM | OneStudio OS");
  assert.ok(result.description.includes("17hats"));
  assert.ok(Array.from(result.description).length <= GUIDE_DESCRIPTION_LIMIT);
  assert.notEqual(result.description, article.description);
  assert.equal(article.title, "17hats Alternative for Service Businesses: Website + Booking + CRM");
});

test("branding is added once only when the complete title fits", () => {
  const short = getGuideSeoFields({ title: "Booking Tips | OneStudio OS | OneStudio OS", description: "Booking tips." });
  assert.equal(short.title, "Booking Tips | OneStudio OS");
  const title = "A clear service business website and appointment booking guide";
  assert.equal(getGuideSeoFields({ title, description: "A guide." }).title, title);
});

test("reviewed revisions are complete, distinct and fit the editorial budgets", () => {
  for (const [field, values, limit] of [
    ["title", revisions.titles, GUIDE_TITLE_LIMIT],
    ["description", revisions.descriptions, GUIDE_DESCRIPTION_LIMIT],
  ] as const) {
    const seen = new Set<string>();
    for (const [original, revised] of Object.entries(values)) {
      assert.notEqual(original, revised);
      assert.ok(Array.from(revised).length <= limit, `${field}: ${revised}`);
      assert.doesNotMatch(revised, /…|\u2014|\| OneStudio OS/);
      assert.ok(!seen.has(revised.toLowerCase()), `duplicate ${field}: ${revised}`);
      seen.add(revised.toLowerCase());
      const result = getGuideSeoFields(field === "title"
        ? { title: original, description: "A description." }
        : { title: "A guide", description: original });
      assert.ok(Array.from(result[field]).length <= limit);
      if (field === "description") assert.equal(result.description, revised);
    }
  }
});

test("a later CMS edit does not reuse an old source-text revision", () => {
  const title = "17hats Alternative: Updated Comparison";
  const description = "New comparison text with a different editorial scope.";
  assert.deepEqual(getGuideSeoFields({ title, description }), {
    title: `${title} | OneStudio OS`, description,
  });
});

test("unreviewed CMS content has a word-safe and Unicode-safe fallback", () => {
  const result = getGuideSeoFields({ title: "Useful appointment scheduling advice ".repeat(5), description: "A clear description of booking choices for service businesses. ".repeat(5) });
  assert.ok(Array.from(result.title).length <= GUIDE_TITLE_LIMIT);
  assert.ok(Array.from(result.description).length <= GUIDE_DESCRIPTION_LIMIT);
  assert.match(result.title, /(?:Useful|appointment|scheduling|advice)…$/);
  const unicode = getGuideSeoFields({ title: "😀".repeat(100), description: "😀".repeat(200) });
  assert.equal(Array.from(unicode.title).length, GUIDE_TITLE_LIMIT);
  assert.equal(Array.from(unicode.description).length, GUIDE_DESCRIPTION_LIMIT);
  assert.ok(unicode.title.isWellFormed());
  assert.ok(unicode.description.isWellFormed());
});
