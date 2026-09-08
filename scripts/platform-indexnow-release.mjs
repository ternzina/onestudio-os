import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const PLATFORM_HOST = "onestudioos.com";
const PLATFORM_ORIGIN = `https://${PLATFORM_HOST}`;
const MAX_SUBMIT_URLS = 500;
const KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;
const COMMON_METADATA_EXTRA_PATHS = ["/privacy", "/terms"];

// Keep this command's URL inventory coupled to the registries used by app/sitemap.ts.
// Node 25's type stripping lets the release command consume the existing TS sources
// without maintaining a second list of slugs.
export function canonicalPlatformPaths() {
  const root = resolve(new URL("..", import.meta.url).pathname);
  const read = (file) => readFileSync(resolve(root, file), "utf8");
  const quotedPaths = (text, pattern) => [...text.matchAll(pattern)].map((match) => match[1]);
  const marketingSource = read("app/_seo/platform.ts");
  const marketingBlock = marketingSource.match(/export const PLATFORM_MARKETING_PATHS = \[(.*?)\] as const/s)?.[1] ?? "";
  const marketing = quotedPaths(marketingBlock, /"([^"\n]+)"/g);
  const solutions = quotedPaths(read("lib/seo/solutions.ts"), /slug:\s*"([^"]+)"/g).map((slug) => `/solutions/${slug}`);
  const journal = quotedPaths(read("lib/seo/journal-articles.ts"), /path:\s*"([^"]+)"/g);
  const demos = quotedPaths(read("lib/demo-catalog.ts"), /slug:\s*"([^"]+)"/g).map((slug) => `/demos/${slug}`);
  const previews = quotedPaths(read("lib/public-site/premium-template-package-catalog.ts"), /["']route["']:\s*"(\/demos\/[^"\n]+)"/g);
  return [...new Set([...marketing, ...solutions, ...journal, ...demos, ...previews])];
}

function add(set, paths) { paths.forEach((path) => set.add(`${PLATFORM_ORIGIN}${path}`)); }

export function platformUrlsForChangedFiles(files, paths = canonicalPlatformPaths()) {
  const urls = new Set();
  const solutionPaths = paths.filter((path) => path === "/solutions" || path.startsWith("/solutions/"));
  const journalPaths = paths.filter((path) => path === "/blog" || path.startsWith("/blog/"));
  const demoPaths = paths.filter((path) => path === "/demos" || path.startsWith("/demos/"));

  for (const file of files) {
    if (file === "app/page.tsx") add(urls, ["/"]);
    if (file === "lib/i18n/locales/en/common.ts") add(urls, [...paths, ...COMMON_METADATA_EXTRA_PATHS]);
    if (file === "lib/seo/features.ts") add(urls, ["/features/online-booking", "/features/crm"]);
    if (file === "lib/seo/solutions.ts") add(urls, solutionPaths);
    if (file === "lib/seo/journal-articles.ts") add(urls, journalPaths);
    if (file === "lib/demo-catalog.ts" || file === "lib/public-site/template-catalog.ts" || file === "lib/public-site/premium-template-package-catalog.ts") add(urls, demoPaths);
    if (file === "app/_seo/platform.ts" || /^app\/(layout|opengraph-image|twitter-image)\./.test(file)) add(urls, paths);

    const routeMatch = file.match(/^app\/(.+)\/page\.tsx$/);
    if (routeMatch) {
      const path = `/${routeMatch[1]}`;
      if (paths.includes(path)) add(urls, [path]);
    }
  }
  return normalizePlatformUrls([...urls]);
}

export function normalizePlatformUrls(urls) {
  return [...new Set(urls)].filter((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" && parsed.hostname === PLATFORM_HOST && parsed.port === "";
    } catch { return false; }
  }).sort();
}

export function validateIndexNowKey(value) {
  const key = value?.trim();
  return key && KEY_PATTERN.test(key) ? key : null;
}

function changedFiles(base) {
  return execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], { encoding: "utf8" }).split(/\r?\n/).filter(Boolean);
}

function run(command, args) { return spawnSync(command, args, { stdio: "inherit", shell: false }).status === 0; }

export async function submitPlatformIndexNow(urls, { fetcher = fetch, env = process.env } = {}) {
  const key = validateIndexNowKey(env.INDEXNOW_KEY);
  const unique = normalizePlatformUrls(urls);
  if (!key) return { ok: true, status: "disabled", urlCount: unique.length };
  if (unique.length === 0 || unique.length > MAX_SUBMIT_URLS) return { ok: false, status: "invalid", urlCount: unique.length };
  try {
    const response = await fetcher("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: PLATFORM_HOST, key, urlList: unique }),
      signal: AbortSignal.timeout(8_000),
    });
    return { ok: response.ok, status: response.status, urlCount: unique.length };
  } catch {
    return { ok: false, status: "failed", urlCount: unique.length };
  }
}

export async function runSeoRelease({ urls, dryRun = false, deploy, submit }) {
  if (dryRun) return { deployed: false, submitted: false, skipped: "dry-run" };
  const deployed = await deploy();
  if (!deployed) return { deployed: false, submitted: false, skipped: "deploy-failed" };
  if (urls.length === 0) return { deployed: true, submitted: false, skipped: "no-changed-platform-urls" };
  const result = await submit(urls);
  return { deployed: true, submitted: result.ok, result };
}

export function assertProductionReleaseGuard({ branch, status, head, originMain }) {
  if (status) throw new Error("deploy:seo requires a clean working tree");
  if (branch !== "main") throw new Error("deploy:seo must run from main");
  if (!head || !originMain || head !== originMain) throw new Error("deploy:seo requires HEAD to match origin/main");
}

function gitValue(args) { return execFileSync("git", args, { encoding: "utf8" }).trim(); }

if (import.meta.url === `file://${process.argv[1]}`) {
  const submitOnly = process.argv.includes("--submit-only");
  const dryRun = process.argv.includes("--dry-run");
  const baseArg = process.argv.find((arg) => arg.startsWith("--base="));
  const base = baseArg?.slice("--base=".length) || process.env.INDEXNOW_BASE || gitValue(["rev-parse", "HEAD^1"]);
  const supplied = process.argv.includes("--urls") ? process.argv.slice(process.argv.indexOf("--urls") + 1) : [];
  const urls = submitOnly ? normalizePlatformUrls(supplied) : platformUrlsForChangedFiles(changedFiles(base));

  if (submitOnly) {
    submitPlatformIndexNow(urls).then((result) => process.exit(result.ok ? 0 : 1));
  } else {
    try {
      assertProductionReleaseGuard({ branch: gitValue(["branch", "--show-current"]), status: gitValue(["status", "--porcelain"]), head: gitValue(["rev-parse", "HEAD"]), originMain: gitValue(["rev-parse", "origin/main"]) });
    } catch (error) { console.error(error.message); process.exit(1); }
    runSeoRelease({
      urls,
      dryRun,
      deploy: async () => run("npx", ["vercel@latest", "--prod", "--yes", "--scope", "onestudioos"]),
      submit: async (changed) => {
        const result = spawnSync("npx", ["vercel@latest", "env", "run", "-e", "production", "--scope", "onestudioos", "--", "node", "scripts/platform-indexnow-release.mjs", "--submit-only", "--urls", ...changed], { stdio: "inherit", shell: false });
        return { ok: result.status === 0 };
      },
    }).then((result) => process.exit(result.deployed && (result.submitted || result.skipped) ? 0 : 1));
  }
}
