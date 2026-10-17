import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildSiteExport } from "../lib/site-export/assemble.ts";
import { createCashPathPremiumTemplateSeed } from "../lib/public-site/cashpath-premium-template-seed.ts";
import type { PublicSiteData } from "../lib/public-site/types.ts";

const destination = process.argv[2] || "/tmp/cashpath-standalone";
const content = createCashPathPremiumTemplateSeed();
const site: PublicSiteData = {
  business: {
    id: "cashpath-909c00c9",
    slug: "cashpath-909c00c9",
    name: "CashPath",
    locale: "en",
    primary_locale: "en",
    currency: "USD",
    timezone: "America/New_York",
  },
  content,
  company: { display_name: "CashPath", email: "contact@cashpath.org", website_url: "https://cashpath.org" },
  services: [],
  portfolio: [],
  capabilities: { booking: false, catalog: false, portfolio: false },
  available_locales: ["en"],
  published_at: "2026-09-10T00:00:00.000Z",
};
const exported = await buildSiteExport(site, "next", { canonicalOrigin: "https://cashpath.org", projectRoot: process.cwd() });
for (const file of exported.files) {
  const target = path.join(destination, file.path);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, file.body);
}
console.log(`wrote ${exported.files.length} files to ${destination}`);
console.log(`warnings ${exported.snapshot.warnings.length}`);
