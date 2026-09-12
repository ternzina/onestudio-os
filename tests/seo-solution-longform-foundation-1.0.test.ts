import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Solution } from "../lib/seo/solutions.ts";

const rendererSource = readFileSync(
  new URL("../app/solutions/SolutionPage.tsx", import.meta.url),
  "utf8",
);

test("Solution long-form foundation supports a truthful no-demo solution", () => {
  const solution: Solution = {
    slug: "fixture-no-demo",
    title: "Fixture",
    description: "Fixture description",
    eyebrow: "FIXTURE",
    h1: "Fixture no-demo solution",
    intro: "Fixture intro",
    problem: "Fixture problem",
    workflow: ["One", "Two"],
    capabilities: ["Booking"],
    detailSections: [
      {
        title: "Long-form section",
        paragraphs: ["A paragraph."],
        bullets: ["A bullet."],
        steps: ["A step."],
      },
    ],
    internalLinks: [{ label: "Online Booking", href: "/features/online-booking" }],
    setup: ["Configure"],
    faqs: [
      { q: "Question one?", a: "Answer one." },
      { q: "Question two?", a: "Answer two." },
    ],
    related: ["beauty-salon-website"],
  };

  assert.equal(solution.demo, undefined);
  assert.equal(solution.detailSections?.[0]?.title, "Long-form section");
  assert.equal(solution.internalLinks?.[0]?.href, "/features/online-booking");
});

test("generic solution renderer guards optional demo and renders optional long-form fields", () => {
  assert.match(rendererSource, /solution\.demo\?<section/);
  assert.match(rendererSource, /solution\.detailSections\?\.map/);
  assert.match(rendererSource, /section\.paragraphs\?\.map/);
  assert.match(rendererSource, /section\.bullets\?\.length/);
  assert.match(rendererSource, /section\.steps\?\.length/);
  assert.match(rendererSource, /solution\.internalLinks\?\.length/);
  assert.ok(!rendererSource.includes("automotive-scheduling-software"));
});
