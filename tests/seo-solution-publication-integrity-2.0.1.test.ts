import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { SITE_URL } from "../app/_seo/site.ts";
import { DEMOS, PREMIUM_DEMOS } from "../lib/demo-catalog.ts";
import { GUIDE_ARTICLES } from "../lib/seo/guide-articles.ts";
import { FEATURE_PATHS } from "../lib/seo/features.ts";
import { SOLUTIONS, SOLUTION_PATHS } from "../lib/seo/solutions.ts";

const EXPLICIT_RESOLVABLE_PATHS = ["/new-site", "/privacy", "/terms"] as const;

const platformSource = readFileSync(
  new URL("../app/_seo/platform.ts", import.meta.url),
  "utf8",
);
const platformMarker = "export const PLATFORM_MARKETING_PATHS = [";
const platformStart = platformSource.indexOf(platformMarker);
const platformEnd = platformSource.indexOf("] as const;", platformStart);

assert.ok(
  platformStart >= 0 && platformEnd > platformStart,
  "PLATFORM_MARKETING_PATHS block not found",
);

const PLATFORM_MARKETING_PATHS = [
  ...platformSource
    .slice(platformStart + platformMarker.length, platformEnd)
    .matchAll(/"([^"]+)"/g),
].map((match) => match[1]!);

function normalizePath(path: string) {
  if (path === "/") return path;
  return path.replace(/\/+$/, "");
}

const RESOLVABLE_INTERNAL_PATHS = new Set(
  [
    ...PLATFORM_MARKETING_PATHS,
    ...FEATURE_PATHS,
    ...SOLUTION_PATHS,
    ...GUIDE_ARTICLES.map((article) => article.path),
    ...DEMOS.map((demo) => `/demos/${demo.slug}`),
    ...PREMIUM_DEMOS.map((demo) => demo.href),
    ...EXPLICIT_RESOLVABLE_PATHS,
  ].map(normalizePath),
);

function internalPathFromHref(href: string, slug: string) {
  assert.equal(
    href,
    href.trim(),
    `${slug}: internal link href must not contain surrounding whitespace: ${JSON.stringify(href)}`,
  );
  assert.ok(href.length > 0, `${slug}: internal link href must not be empty`);
  assert.ok(href.startsWith("/"), `${slug}: internal links must be root-relative: ${href}`);
  assert.ok(!href.startsWith("//"), `${slug}: protocol-relative links are not allowed: ${href}`);

  if (/^https?:\/\//i.test(href)) {
    assert.fail(`${slug}: same-origin OneStudio links must be root-relative: ${href}`);
  }

  const path = normalizePath(new URL(href, SITE_URL).pathname);
  assert.doesNotMatch(path, /^\/(?:blog|help)(?:\/|$)/, `${slug}: retired route ${path}`);
  return path;
}

function assertUnique(values: readonly string[], label: string) {
  assert.equal(new Set(values).size, values.length, `${label} values must be unique`);
}

test("Solution publication integrity keeps canonical identity, graph and FAQ data valid", () => {
  assert.deepEqual(
    [...SOLUTION_PATHS],
    ["/solutions", ...SOLUTIONS.map((solution) => `/solutions/${solution.slug}`)],
    "SOLUTION_PATHS must derive from the Solution registry",
  );

  assertUnique(SOLUTIONS.map((solution) => solution.slug), "Solution slug");
  assertUnique(SOLUTIONS.map((solution) => solution.title.trim().toLowerCase()), "Solution title");
  assertUnique(SOLUTIONS.map((solution) => solution.h1.trim().toLowerCase()), "Solution H1");
  assertUnique(SOLUTIONS.map((solution) => solution.description.trim().toLowerCase()), "Solution description");

  const solutionSlugs = new Set(SOLUTIONS.map((solution) => solution.slug));

  for (const solution of SOLUTIONS) {
    assert.match(solution.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${solution.slug}: slug must be lowercase kebab-case`);
    assert.equal(solution.slug, solution.slug.toLowerCase());
    assert.equal(solution.title.trim().length > 0, true, `${solution.slug}: title must not be empty`);
    assert.equal(solution.h1.trim().length > 0, true, `${solution.slug}: h1 must not be empty`);
    assert.equal(solution.description.trim().length > 0, true, `${solution.slug}: description must not be empty`);
    assert.equal(solution.eyebrow.trim().length > 0, true, `${solution.slug}: eyebrow must not be empty`);
    assert.equal(solution.intro.trim().length > 0, true, `${solution.slug}: intro must not be empty`);
    assert.equal(solution.problem.trim().length > 0, true, `${solution.slug}: problem must not be empty`);
    assert.doesNotMatch(solution.title, /\|\s*OneStudio OS/i, `${solution.slug}: title must not embed the brand suffix`);

    assert.ok(solution.related.length >= 1, `${solution.slug}: at least one related Solution is required`);
    assertUnique(solution.related, `${solution.slug}: related Solution`);
    for (const relatedSlug of solution.related) {
      assert.notEqual(relatedSlug, solution.slug, `${solution.slug}: related Solutions cannot self-reference`);
      assert.ok(solutionSlugs.has(relatedSlug), `${solution.slug}: related Solution ${relatedSlug} is not in the registry`);
    }

    assert.ok(solution.faqs.length >= 2, `${solution.slug}: at least two FAQs are required`);
    assertUnique(solution.faqs.map((faq) => faq.q.trim().toLowerCase()), `${solution.slug}: FAQ question`);
    for (const faq of solution.faqs) {
      assert.ok(faq.q.trim().length > 0, `${solution.slug}: FAQ question must not be empty`);
      assert.ok(faq.a.trim().length > 0, `${solution.slug}: FAQ answer must not be empty`);
    }
  }
});

test("Solution internal links resolve against the current canonical publication graph", () => {
  for (const solution of SOLUTIONS) {
    for (const link of solution.internalLinks ?? []) {
      assert.ok(link.label.trim().length > 0, `${solution.slug}: internal link label must not be empty`);
      const path = internalPathFromHref(link.href, solution.slug);
      assert.ok(
        RESOLVABLE_INTERNAL_PATHS.has(path),
        `${solution.slug}: unresolved same-origin link ${path}. Add the route in the same branch or link only to an existing canonical path.`,
      );
    }
  }
});

test("Solution publication integrity fixtures distinguish live and invalid internal links", () => {
  assert.doesNotThrow(() => {
    const path = internalPathFromHref("/features/online-booking", "fixture-live-feature");
    assert.ok(RESOLVABLE_INTERNAL_PATHS.has(path));
  });

  assert.throws(
    () => {
      const path = internalPathFromHref("/guides/not-published-yet", "fixture-unpublished-guide");
      assert.ok(RESOLVABLE_INTERNAL_PATHS.has(path), `fixture route is unexpectedly resolvable: ${path}`);
    },
    /unexpectedly resolvable/,
  );
  assert.throws(
    () => internalPathFromHref("https://onestudioos.com/features/online-booking", "fixture-absolute-same-origin"),
    /root-relative|same-origin/,
  );
  assert.throws(
    () => internalPathFromHref("/blog/retired-post", "fixture-retired-blog"),
    /retired route/,
  );
});
