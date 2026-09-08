import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { FEATURE_SEO } from "../lib/seo/features.ts";
import { SOLUTIONS } from "../lib/seo/solutions.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");
const sourceTitles = [...FEATURE_SEO.map((entry) => entry.title), "Website Builder for Service Businesses | Booking & CRM", ...SOLUTIONS.map((entry) => entry.title)];

test("SEO Title Brand Fix 3.0.1 keeps one global platform brand suffix", async () => {
  const [platform, bookingPage, crmPage, hub, sitemap] = await Promise.all([
    read("../app/_seo/platform.ts"), read("../app/features/online-booking/page.tsx"),
    read("../app/features/crm/page.tsx"), read("../app/solutions/page.tsx"), read("../app/sitemap.ts"),
  ]);
  assert.match(platform, /template: "%s \| OneStudio OS"/);
  for (const title of sourceTitles) assert.doesNotMatch(title, /\| OneStudio(?: OS)?$/);
  for (const title of sourceTitles) assert.equal(`${title} | OneStudio OS`.match(/OneStudio OS/g)?.length, 1);
  for (const page of [bookingPage, crmPage, hub]) assert.doesNotMatch(page, /\| OneStudio \| OneStudio OS/);
  assert.match(bookingPage, /canonical/); assert.match(crmPage, /canonical/); assert.match(hub, /canonical/);
  assert.match(hub, /new URL\("\/solutions",\s*SITE_URL\)/);
  assert.match(sitemap, /platformMarketingEntries/);
  assert.doesNotMatch(JSON.stringify(sourceTitles), /\u2014/);
});
