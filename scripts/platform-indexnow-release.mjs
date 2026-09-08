import { execFileSync, spawnSync } from "node:child_process";

export const PLATFORM_HOST = "onestudioos.com";
const PLATFORM_ORIGIN = `https://${PLATFORM_HOST}`;
const JOURNAL_PATHS = [
  "/blog/how-online-booking-works-for-service-businesses",
  "/blog/website-builder-with-crm-guide",
  "/blog/beauty-salon-website-booking-guide",
];
const STATIC_PATHS = [
  "/", "/features", "/solutions", "/demos", "/components", "/pricing",
  "/website", "/about", "/faq", "/blog", "/contact",
];
const SOLUTION_PATHS = [
  "/solutions/photography-studio-website", "/solutions/beauty-salon-website",
  "/solutions/pet-grooming-website", "/solutions/pilates-studio-website",
  "/solutions/kids-center-website",
];
const DEMO_PATHS = [
  "/demos/frame-house", "/demos/lumiere", "/demos/north-flow", "/demos/bloom-room",
  "/demos/little-orbit", "/demos/black-ink", "/demos/vow-films", "/demos/paw-club",
];

const allPlatformPaths = () => [...STATIC_PATHS, "/features/online-booking", "/features/crm", ...SOLUTION_PATHS, ...JOURNAL_PATHS];
const add = (set, paths) => paths.forEach((path) => set.add(`${PLATFORM_ORIGIN}${path}`));

export function platformUrlsForChangedFiles(files) {
  const urls = new Set();
  for (const file of files) {
    if (/^(app\/|components\/|lib\/seo\/|lib\/demo-catalog\.ts$|lib\/public-site\/premium-route-metadata\.ts$|lib\/i18n\/locales\/)/.test(file)) {
      if (file === "lib/seo/features.ts" || /features\/online-booking/.test(file)) add(urls, ["/features/online-booking"]);
      if (file === "lib/seo/features.ts" || /features\/crm/.test(file)) add(urls, ["/features/crm"]);
      if (file === "lib/seo/solutions.ts" || /solutions/.test(file)) add(urls, ["/solutions", ...SOLUTION_PATHS]);
      if (file === "lib/seo/journal-articles.ts" || /blog/.test(file)) add(urls, ["/blog", ...JOURNAL_PATHS]);
      if (file === "lib/demo-catalog.ts" || /demo-catalog|premium-route-metadata/.test(file)) add(urls, ["/demos", ...DEMO_PATHS]);
      if (file === "app/_seo/platform.ts" || /app\/layout|app\/opengraph-image|app\/twitter-image/.test(file)) add(urls, allPlatformPaths());
      for (const path of STATIC_PATHS) {
        const segment = path === "/" ? "page" : path.slice(1);
        if (file === `app/${segment}/page.tsx` || file === `lib/i18n/locales/en/${segment}.ts`) add(urls, [path]);
      }
    }
  }
  return [...urls].sort();
}

export function normalizePlatformUrls(urls) {
  return [...new Set(urls)].filter((url) => {
    try { const parsed = new URL(url); return parsed.protocol === "https:" && parsed.host === PLATFORM_HOST; }
    catch { return false; }
  }).sort();
}

function changedFiles(base) {
  return execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], { encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
}

function run(command, args) {
  return spawnSync(command, args, { stdio: "inherit", shell: false }).status === 0;
}

async function submit(urls) {
  if (!process.env.INDEXNOW_KEY) { console.log("IndexNow: SKIPPED / disabled (missing production key)"); return true; }
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST", headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: PLATFORM_HOST, key: process.env.INDEXNOW_KEY, urlList: urls }),
  });
  console.log(`IndexNow: ${response.status} ${response.status === 202 ? "accepted_pending" : response.ok ? "accepted" : "failed"}`);
  return response.ok;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const submitOnly = process.argv.includes("--submit-only");
  const baseArg = process.argv.find((arg) => arg.startsWith("--base="));
  const base = baseArg?.slice("--base=".length) || process.env.INDEXNOW_BASE || (execFileSync("git", ["rev-parse", "HEAD^1"], { encoding: "utf8" }).trim());
  const urls = submitOnly ? process.argv.slice(process.argv.indexOf("--urls") + 1) : normalizePlatformUrls(platformUrlsForChangedFiles(changedFiles(base)));
  if (!submitOnly) { console.log(`Changed platform URLs (${urls.length}):`); urls.forEach((url) => console.log(url)); }
  if (!submitOnly) {
    if (!run("npx", ["vercel@latest", "--prod", "--yes", "--scope", "onestudioos"])) process.exit(1);
    if (urls.length === 0) { console.log("IndexNow: SKIPPED / no changed platform URLs"); process.exit(0); }
    const result = spawnSync("npx", ["vercel@latest", "env", "run", "-e", "production", "--", "node", "scripts/platform-indexnow-release.mjs", "--submit-only", "--urls", ...urls], { stdio: "inherit", shell: false });
    process.exit(result.status ?? 1);
  }
  submit(urls).then((ok) => process.exit(ok ? 0 : 1));
}
