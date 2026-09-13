import assert from "node:assert/strict";
import test from "node:test";
import {
  buildImportDraftsSql,
  buildPublishSql,
  buildUnpublishSql,
  cleanInlineMarkdown,
  parseGuideMarkdown,
  validateGuideDrafts,
} from "../lib/guides/publisher/core.mjs";

const sample = `# Booking Page Best Practices: A Practical Checklist

**Status:** QA PASS - Ready to Publish
**Target query:** booking page best practices
**SEO title:** Booking Page Best Practices: 15 Ways to Reduce Friction
**Meta description:** Improve a booking page by reducing friction and clarifying the next step.
**Slug:** \`/guides/booking-page-best-practices\`
**H1:** Booking Page Best Practices for Service Businesses
**OneStudio claim boundary:** Do not invent product capabilities.

---

## Start with one job

A booking page should make the next action obvious.

- Choose a service
- Choose a time

### Quick audit

1. Is the action visible?
2. Does the label describe the action?

## Measure the flow

| Metric | Formula |
|---|---|
| Conversion | Bookings / visits |

\`\`\`text
H1: [Service]
CTA: [Book]
\`\`\`

## FAQ

### What should a booking page include?

Clear service information and a clear next step.

### Should it work on mobile?

Yes. Test the full booking path on a phone.

## CTA

### Make booking easier

**Primary CTA:** Explore [OneStudio online booking](/features/online-booking)
**Secondary CTA:** Use the calculator once live and only after the Tools foundation is published

## Internal-link suggestions

- /features/online-booking
- /guides/appointment-booking-form-template
- /guides/not-live-yet

## Research / claim notes for Content QA

This text must never be public.
`;

const options = {
  primaryCategory: "Booking",
  topics: ["Booking", "Marketing", "Websites"],
};

const knownPaths = new Set([
  "/features/online-booking",
  "/guides/appointment-booking-form-template",
]);

test("Publisher parses Ready-to-Publish metadata and rich Guide content", () => {
  const draft = parseGuideMarkdown(sample, options);
  assert.equal(draft.slug, "booking-page-best-practices");
  assert.equal(draft.title, "Booking Page Best Practices: 15 Ways to Reduce Friction");
  assert.equal(draft.h1, "Booking Page Best Practices for Service Businesses");
  assert.equal(draft.searchIntent, "booking page best practices");
  assert.equal(draft.primaryCategory, "Booking");
  assert.deepEqual(draft.topics, ["Booking", "Marketing", "Websites"]);
  assert.ok(draft.sections.length >= 3);
  assert.equal(draft.faq.length, 2);
  assert.ok(draft.sections.some((section) => section.table));
  assert.ok(draft.sections.some((section) => section.template));
});

test("Publisher removes editorial-only sections and pending secondary CTA text", () => {
  const draft = parseGuideMarkdown(sample, options);
  const visible = JSON.stringify(draft.sections);
  assert.doesNotMatch(visible, /Research \/ claim notes/);
  assert.doesNotMatch(visible, /This text must never be public/);
  assert.doesNotMatch(visible, /calculator once live/);
  assert.match(visible, /Primary CTA: Explore/);
  assert.deepEqual(draft.removedEditorialHeadings, [
    "Internal-link suggestions",
    "Research / claim notes for Content QA",
  ]);
});

test("Publisher converts safe Markdown links into renderer inline links", () => {
  assert.equal(
    cleanInlineMarkdown("Read [Online Booking](/features/online-booking)."),
    "Read [[Online Booking|/features/online-booking]].",
  );
  assert.equal(cleanInlineMarkdown("See [Google](https://google.com)."), "See Google.");
});

test("Publisher auto-selects only live internal-link suggestions", () => {
  const draft = parseGuideMarkdown(sample, options);
  const result = validateGuideDrafts([draft], { knownPaths });
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.deepEqual(result.articles[0].relatedLinks, [
    { label: "Online Booking", href: "/features/online-booking" },
    { label: "Appointment Booking Form Template", href: "/guides/appointment-booking-form-template" },
  ]);
});

test("Publisher rejects unresolved, help/blog, self, and unsafe links", () => {
  const base = parseGuideMarkdown(sample, {
    ...options,
    relatedLinks: [{ label: "Bad", href: "/help/not-allowed" }],
  });
  const result = validateGuideDrafts([base], { knownPaths });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => /cannot point to \/help/.test(error)));

  const unsafe = parseGuideMarkdown(sample.replace(
    "A booking page should make the next action obvious.",
    "Read [[bad|javascript:alert(1)]].",
  ), options);
  const unsafeResult = validateGuideDrafts([unsafe], { knownPaths });
  assert.equal(unsafeResult.ok, false);
});

test("Publisher allows same-batch Guide cross-links before publication", () => {
  const first = parseGuideMarkdown(sample, {
    ...options,
    relatedLinks: [{ label: "Second", href: "/guides/second-guide" }],
  });
  const second = parseGuideMarkdown(sample
    .replaceAll("booking-page-best-practices", "second-guide")
    .replace("Booking Page Best Practices: 15 Ways to Reduce Friction", "Second Guide")
    .replace("Booking Page Best Practices for Service Businesses", "Second Guide H1")
    .replace("Improve a booking page by reducing friction and clarifying the next step.", "A distinct second description.")
    .replace("booking page best practices", "second guide query"), {
      ...options,
      relatedLinks: [{ label: "First", href: "/guides/booking-page-best-practices" }],
    });
  const result = validateGuideDrafts([first, second], { knownPaths });
  assert.equal(result.ok, true, result.errors.join("\n"));
});

test("Publisher rejects duplicate identities inside one batch", () => {
  const first = parseGuideMarkdown(sample, options);
  const second = parseGuideMarkdown(sample, options);
  const result = validateGuideDrafts([first, second], { knownPaths });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => /duplicate slug/.test(error)));
  assert.ok(result.errors.some((error) => /duplicate title/.test(error)));
});

test("Import SQL is atomic and creates only draft rows", () => {
  const draft = parseGuideMarkdown(sample, options);
  const result = validateGuideDrafts([draft], { knownPaths });
  assert.equal(result.ok, true);
  const sql = buildImportDraftsSql(result.articles);
  assert.match(sql, /^BEGIN;/);
  assert.match(sql, /COMMIT;/);
  assert.match(sql, /'draft'/);
  assert.doesNotMatch(sql, /publication_status[^\n]*'published'/);
  assert.match(sql, /locale .* already exists/);
  assert.match(sql, /duplicate Guide identity/);
});

test("Publish SQL publishes locale and parent in one transaction and uses database current_date", () => {
  const sql = buildPublishSql(["one", "two"]);
  assert.match(sql, /^BEGIN;/);
  assert.match(sql, /translation_status = 'published'/);
  assert.match(sql, /publication_status = 'published'/);
  assert.match(sql, /v_publish_date date := current_date/);
  assert.match(sql, /v_publish_date > current_date/);
  assert.match(sql, /a\.original_locale = 'en'/);
  assert.match(sql, /a\.original_locale <> 'en' AND a\.publication_status <> 'published'/);
  assert.match(sql, /COMMIT;/);
});

test("Publish SQL rejects an explicit future date at database time", () => {
  const sql = buildPublishSql(["one"], { publishedAt: "2099-01-01" });
  assert.match(sql, /'2099-01-01'::date/);
  assert.match(sql, /publication date % is in the future/);
});

test("Unpublish is reversible and does not delete Guide content", () => {
  const sql = buildUnpublishSql(["one"]);
  assert.match(sql, /publication_status = 'draft'/);
  assert.match(sql, /translation_status = 'draft'/);
  assert.match(sql, /a\.original_locale = 'en'/);
  assert.doesNotMatch(sql, /DELETE\s+FROM/i);
});
