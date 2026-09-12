import test from "node:test";
import assert from "node:assert/strict";
import { SOLUTIONS, SOLUTION_PATHS } from "../lib/seo/solutions.ts";

test("SEO Solutions Network 2.0 derives canonical paths and keeps metadata unique", () => {
  assert.equal(SOLUTION_PATHS.length, SOLUTIONS.length + 1);
  assert.equal(new Set(SOLUTION_PATHS).size, SOLUTION_PATHS.length);
  assert.equal(new Set(SOLUTIONS.map((s) => s.title)).size, SOLUTIONS.length);
  for (const solution of SOLUTIONS) {
    if (solution.demo) assert.match(solution.demo.href, /^\/demos\//);
    assert.ok(solution.related.length >= 1);
    assert.ok(solution.faqs.length >= 2);
  }
  assert.ok(!SOLUTION_PATHS.some((path) => path === "/en" || path === "/ru"));
});
