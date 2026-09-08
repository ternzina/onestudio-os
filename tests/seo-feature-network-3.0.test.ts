import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { FEATURE_PATHS, FEATURE_SEO } from "../lib/seo/features.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("Feature Network 3.0 has two canonical feature entries", async () => {
  assert.deepEqual(FEATURE_PATHS, ["/features/online-booking", "/features/crm"]);
  assert.equal(new Set(FEATURE_PATHS).size, 2);
  assert.equal(new Set(FEATURE_SEO.map((feature) => feature.title)).size, 2);
  const [booking, crm] = FEATURE_SEO;
  assert.match(booking.h1, /booking/i);
  assert.match(booking.sections.map((section) => section.body).join(" "), /available time|booking flow/i);
  assert.match(crm.h1, /client record/i);
  assert.match(crm.sections.map((section) => section.body).join(" "), /client|booking history/i);
  assert.ok(booking.links.some((link) => link.href === "/solutions"));
  assert.ok(crm.links.some((link) => link.href === "/pricing"));
  assert.doesNotMatch(JSON.stringify(FEATURE_SEO), /\u2014/);
  assert.doesNotMatch(JSON.stringify(FEATURE_SEO), /\/en|\/ru|hreflang/);
  for (const path of ["../app/features/online-booking/page.tsx", "../app/features/crm/page.tsx"]) {
    const source = await read(path);
    assert.match(source, /alternates/);
    assert.match(source, /robots: \{ index: true, follow: true \}/);
  }
  const hub = await read("../app/features/FeaturesPageClient.tsx");
  assert.match(hub, /FEATURE_SEO/);
  assert.match(hub, /feature\.path/);
});
