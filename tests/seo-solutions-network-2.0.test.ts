import test from "node:test";
import assert from "node:assert/strict";
import { SOLUTIONS, SOLUTION_PATHS } from "../lib/seo/solutions.ts";

test("SEO Solutions Network 2.0 has six canonical paths and unique metadata", () => {
  assert.equal(SOLUTION_PATHS.length, 6);
  assert.equal(new Set(SOLUTION_PATHS).size, 6);
  assert.equal(new Set(SOLUTIONS.map((s) => s.title)).size, 5);
  for (const solution of SOLUTIONS) {
    assert.match(solution.demo.href, /^\/demos\//);
    assert.ok(solution.related.length >= 1);
    assert.ok(solution.faqs.length >= 2);
  }
  assert.ok(!SOLUTION_PATHS.some((path) => path === "/en" || path === "/ru"));
});
