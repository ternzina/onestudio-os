import assert from "node:assert/strict";
import test from "node:test";
import { SOLUTIONS, SOLUTION_PATHS } from "../lib/seo/solutions.ts";

const expected = {
  "photo-booth-booking-software": {
    title: "Photo Booth Booking Software for Direct Event Bookings",
    links: [
      "/features/online-booking",
      "/features/crm",
      "/pricing",
      "/solutions/photography-studio-website",
    ],
    related: "photography-studio-website",
  },
  "dog-trainer-booking-software": {
    title: "Dog Trainer Booking Software for Private Sessions",
    links: [
      "/features/online-booking",
      "/features/crm",
      "/pricing",
      "/solutions/pet-grooming-website",
    ],
    related: "pet-grooming-website",
  },
} as const;

function copyOf(solution: (typeof SOLUTIONS)[number]) {
  return [
    solution.title,
    solution.description,
    solution.eyebrow,
    solution.h1,
    solution.intro,
    solution.problem,
    ...solution.workflow,
    ...solution.capabilities,
    ...(solution.detailSections?.flatMap((section) => [
      section.title,
      ...(section.paragraphs ?? []),
      ...(section.bullets ?? []),
      ...(section.steps ?? []),
    ]) ?? []),
    ...(solution.internalLinks?.flatMap((link) => [link.label, link.href]) ?? []),
    ...solution.setup,
    ...solution.faqs.map((faq) => faq.a),
    ...solution.related,
  ].join("\n");
}

function assertedFeatureFields(solution: (typeof SOLUTIONS)[number]) {
  return [
    ...solution.capabilities,
    ...solution.setup,
  ].join("\n");
}

test("Photo Booth and Dog Trainer Solutions are registered exactly once with approved identity", () => {
  for (const [slug, record] of Object.entries(expected)) {
    const matches = SOLUTIONS.filter((solution) => solution.slug === slug);
    assert.equal(matches.length, 1, `${slug} must exist exactly once`);
    const solution = matches[0]!;

    assert.equal(solution.title, record.title);
    assert.ok((SOLUTION_PATHS as readonly string[]).includes(`/solutions/${slug}`));
    assert.doesNotMatch(solution.title, /\|\s*OneStudio(?: OS)?$/i);
    assert.equal(solution.demo, undefined, `${slug} must not fabricate a demo`);
    assert.deepEqual(
      solution.internalLinks?.map((link) => link.href),
      record.links,
      `${slug} must use only its approved stable internal links`,
    );
    assert.ok(solution.related.includes(record.related));
    assert.ok(solution.faqs.length >= 2);
  }
});

test("Solution records keep the approved Google Calendar limitation visible", () => {
  for (const slug of Object.keys(expected)) {
    const solution = SOLUTIONS.find((candidate) => candidate.slug === slug)!;
    const copy = copyOf(solution);
    assert.match(copy, /separate connected OneStudio work calendar in Google Calendar/i);
    assert.match(copy, /unrelated personal Google calendars are not read/i);
    assert.doesNotMatch(copy, /OneStudio\s+(?:reads?|accesses?|syncs?)\s+(?:unrelated\s+)?personal Google calendars/i);
  }
});

test("Photo Booth copy does not turn specialist features into OneStudio claims", () => {
  const photo = SOLUTIONS.find((solution) => solution.slug === "photo-booth-booking-software")!;
  const assertedFields = assertedFeatureFields(photo);
  const copy = copyOf(photo);

  assert.doesNotMatch(assertedFields, /automated proposals?|contracts?|e-signatures?|gallery delivery|backdrop|prop selectors?|quote rules?/i);
  assert.doesNotMatch(copy, /OneStudio\s+(?:(?:can\s+(?:provide|support|manage|handle))|(?:supports?|includes?|offers?|provides?|has|delivers?|manages?|handles?))\s+(?:automated\s+)?(?:proposals?|contracts?|e-signatures?|gallery delivery|backdrop|prop selectors?|quote rules?)/i);
});

test("Dog Trainer copy does not turn specialist pet features into OneStudio claims", () => {
  const dogTrainer = SOLUTIONS.find((solution) => solution.slug === "dog-trainer-booking-software")!;
  const assertedFields = assertedFeatureFields(dogTrainer);
  const copy = copyOf(dogTrainer);

  assert.doesNotMatch(assertedFields, /dog profiles?|vaccination(?: records?)?|progress tracking|homework|group-class capacity|package credits?|kennel|boarding/i);
  assert.doesNotMatch(copy, /OneStudio\s+(?:(?:can\s+(?:store|track|manage|provide|support|handle))|(?:supports?|includes?|offers?|provides?|has|stores?|tracks?|manages?|handles?))\s+(?:dog profiles?|vaccination(?: records?)?|progress tracking|homework|group-class capacity|package credits?|kennel|boarding)/i);
});
