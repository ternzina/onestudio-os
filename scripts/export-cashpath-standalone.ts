import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildSiteExport } from "../lib/site-export/assemble.ts";
import type { PublicSiteData } from "../lib/public-site/types.ts";

const source = process.argv[2];
const destination = process.argv[3] || "/tmp/cashpath-standalone";
if (!source) {
  console.error("Pass a published get_public_site JSON file. The repository seed is not production.");
  process.exit(1);
}
const site = JSON.parse(readFileSync(source, "utf8")) as PublicSiteData;
site.company = {
  display_name: site.company?.display_name,
  logo_url: site.company?.logo_url,
  website_url: site.company?.website_url,
};
const exported = await buildSiteExport(site, "next", {
  canonicalOrigin: "https://cashpath.org",
  projectRoot: process.cwd(),
  allowRemoteFetch: false,
});
for (const file of exported.files) {
  const target = path.join(destination, file.path);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, file.body);
}
console.log(`wrote ${exported.files.length} files to ${destination}`);
console.log(`warnings ${exported.snapshot.warnings.map((item) => item.code).join(",")}`);
