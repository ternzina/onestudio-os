import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const PLATFORM_HOST = "onestudioos.com";
const ORIGIN = `https://${PLATFORM_HOST}`;
const MAX_URLS = 500;
const KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = (file) => readFileSync(resolve(root, file), "utf8");
const matches = (text, pattern) => [...text.matchAll(pattern)].map((m) => m[1]);

export function canonicalPlatformPaths() {
  const platform = source("app/_seo/platform.ts");
  const marketing = matches(platform.match(/PLATFORM_MARKETING_PATHS\s*=\s*\[(.*?)\]\s*as const/s)?.[1] ?? "", /["']([^"']+)["']/g);
  const solutions = ["/solutions", ...matches(source("lib/seo/solutions.ts"), /slug:\s*["']([^"']+)["']/g).map((s) => `/solutions/${s}`)];
  const guideSourceFiles = ["lib/guides/content/en/articles.ts", "lib/guides/content/en/articles-2026-09-12.ts"];
  const guides = ["/guides", ...guideSourceFiles.flatMap((file) => matches(source(file), /["']?path["']?\s*:\s*["'](\/guides\/[^"']+)["']/g))];
  const demos = ["/demos", ...matches(source("lib/demo-catalog.ts"), /slug:\s*["']([^"']+)["']/g).map((s) => `/demos/${s}`)];
  const previewRoutes = matches(source("lib/public-site/premium-template-package-catalog.ts"), /["']route["']:\s*["'](\/demos\/[^"']+)["']/g);
  return [...new Set([...marketing, ...solutions, ...guides, ...demos, ...previewRoutes])];
}

export function normalizePlatformUrls(urls) {
  return [...new Set(urls)].filter((value) => {
    try { const url = new URL(value); return url.protocol === "https:" && url.hostname === PLATFORM_HOST && url.port === "" && !url.username && !url.password; }
    catch { return false; }
  }).sort();
}

const addPaths = (set, paths) => paths.forEach((path) => set.add(new URL(path, ORIGIN).toString()));
export function platformUrlsForChangedFiles(files, paths = canonicalPlatformPaths()) {
  const result = new Set();
  const solutions = paths.filter((p) => p === "/solutions" || p.startsWith("/solutions/"));
  const guides = paths.filter((p) => p === "/guides" || p.startsWith("/guides/"));
  const demos = paths.filter((p) => p === "/demos" || p.startsWith("/demos/"));
  for (const file of files) {
    if (file === "app/page.tsx") addPaths(result, ["/"]);
    if (file === "components/marketing/OneStudioGuidesPreview.tsx") addPaths(result, ["/"]);
    if (file === "lib/seo/features.ts") addPaths(result, ["/features/online-booking", "/features/crm"]);
    if (file === "lib/seo/solutions.ts") addPaths(result, solutions);
    if (file === "lib/seo/guide-articles.ts" || file.startsWith("lib/guides/") || file.startsWith("app/guides/") || /^lib\/i18n\/locales\/[^/]+\/guides\.ts$/.test(file)) addPaths(result, ["/", ...guides]);
    if (file.startsWith("lib/journal/") || /^lib\/i18n\/locales\/[^/]+\/(updates|journal)\.ts$/.test(file)) addPaths(result, ["/journal"]);
    if (["lib/demo-catalog.ts", "lib/public-site/template-catalog.ts", "lib/public-site/premium-template-package-catalog.ts"].includes(file)) addPaths(result, demos);
    if (file === "lib/i18n/locales/en/common.ts") addPaths(result, [...paths, "/privacy", "/terms"]);
    if (file === "app/_seo/platform.ts" || /^app\/(layout|opengraph-image|twitter-image)\./.test(file)) addPaths(result, paths);
    const route = file.match(/^app\/(.+)\/page\.tsx$/)?.[1];
    if (route) { const path = `/${route}`; if (paths.includes(path)) addPaths(result, [path]); }
  }
  return normalizePlatformUrls([...result]);
}

export function validateIndexNowKey(value) { const key = value?.trim(); return key && KEY_PATTERN.test(key) ? key : null; }
export async function submitPlatformIndexNow(urls, { fetcher = fetch, env = process.env } = {}) {
  const unique = normalizePlatformUrls(urls);
  const key = validateIndexNowKey(env.INDEXNOW_KEY);
  if (!key) return { ok: false, status: "invalid_key", urlCount: unique.length };
  if (!unique.length) return { ok: true, status: "skipped", urlCount: 0 };
  if (unique.length > MAX_URLS) return { ok: false, status: "invalid", urlCount: unique.length };
  try {
    const response = await fetcher("https://api.indexnow.org/indexnow", { method: "POST", headers: { "content-type": "application/json; charset=utf-8" }, body: JSON.stringify({ host: PLATFORM_HOST, key, urlList: unique }), signal: AbortSignal.timeout(8000) });
    return { ok: response.status === 200 || response.status === 202, status: response.status === 202 ? "accepted_pending" : response.status === 200 ? "accepted" : "failed", httpStatus: response.status, urlCount: unique.length };
  } catch { return { ok: false, status: "failed", urlCount: unique.length }; }
}

export function assertProductionReleaseGuard({ branch, status, head, originMain }) {
  if (status) throw new Error("deploy:seo requires a clean working tree");
  if (branch !== "main") throw new Error("deploy:seo must run from main");
  if (!head || head !== originMain) throw new Error("deploy:seo requires HEAD to match origin/main");
}
export async function runSeoRelease({ urls, dryRun = false, deploy, submit }) {
  if (dryRun) return { deployed: false, submitted: false, skipped: "dry-run" };
  if (!await deploy()) return { deployed: false, submitted: false, skipped: "deploy-failed" };
  if (!urls.length) return { deployed: true, submitted: false, skipped: "no-changed-platform-urls" };
  const result = await submit(urls);
  return { deployed: true, submitted: result.ok, result };
}
const git = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
const run = (command, args) => spawnSync(command, args, { cwd: root, stdio: "inherit", shell: false }).status === 0;
const changedFiles = (base) => git(["diff", "--name-only", `${base}...HEAD`]).split(/\r?\n/).filter(Boolean);
const isCli = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isCli) {
  if (process.argv.includes("--submit-only")) {
    const supplied = process.argv.slice(process.argv.indexOf("--urls") + 1);
    const result = await submitPlatformIndexNow(supplied);
    console.log(`IndexNow: ${result.status}${result.httpStatus ? ` (${result.httpStatus})` : ""}`);
    console.log(`IndexNow URLs: ${result.urlCount}`);
    process.exit(result.ok ? 0 : 1);
  }
  const dryRun = process.argv.includes("--dry-run");
  const baseArg = process.argv.find((arg) => arg.startsWith("--base="));
  const base = baseArg?.slice(7) || process.env.INDEXNOW_BASE || git(["rev-parse", "HEAD^1"]);
  const urls = platformUrlsForChangedFiles(changedFiles(base));
  console.log("===== PLATFORM SEO RELEASE ====="); console.log(`Base: ${base}`); console.log(`HEAD: ${git(["rev-parse", "HEAD"])}`); console.log(`Changed platform URLs: ${urls.length}`); urls.forEach((url) => console.log(url));
  try {
    if (dryRun) { if (git(["status", "--porcelain"])) throw new Error("dry run requires a clean working tree"); console.log("DRY RUN: no production changes"); process.exit(0); }
    assertProductionReleaseGuard({ branch: git(["branch", "--show-current"]), status: git(["status", "--porcelain"]), head: git(["rev-parse", "HEAD"]), originMain: git(["rev-parse", "origin/main"]) });
    const result = await runSeoRelease({ urls, deploy: () => run("npx", ["vercel@latest", "--prod", "--yes", "--scope", "onestudioos"]), submit: (changed) => new Promise((resolveResult) => { const child = spawnSync("npx", ["vercel@latest", "env", "run", "-e", "production", "--scope", "onestudioos", "--", "node", "scripts/platform-indexnow-release.mjs", "--submit-only", "--urls", ...changed], { cwd: root, stdio: "inherit", shell: false }); resolveResult({ ok: child.status === 0 }); }) });
    if (!result.deployed) throw new Error("Production deploy failed");
    console.log("Production deploy: SUCCESS"); console.log(result.skipped ? "IndexNow: SKIPPED / no changed platform URLs" : `IndexNow: ${result.submitted ? "submitted" : "FAILED"}`); process.exit(result.submitted || result.skipped ? 0 : 1);
  } catch (error) { console.error(error.message); process.exit(1); }
}
