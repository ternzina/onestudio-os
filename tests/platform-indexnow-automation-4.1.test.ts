import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const moduleUrl = new URL("../scripts/platform-indexnow-release.mjs", import.meta.url);

test("platform source changes map to canonical platform URLs", async () => {
  const { platformUrlsForChangedFiles } = await import(moduleUrl.href);
  assert.deepEqual(platformUrlsForChangedFiles(["lib/seo/features.ts"]), [
    "https://onestudioos.com/features/crm",
    "https://onestudioos.com/features/online-booking",
  ]);
  const solutions = platformUrlsForChangedFiles(["lib/seo/solutions.ts"]);
  assert.equal(solutions.includes("https://onestudioos.com/solutions"), true);
  assert.equal(solutions.filter((url: string) => url.startsWith("https://onestudioos.com/solutions/")).length, 5);
  assert.equal(platformUrlsForChangedFiles(["lib/seo/journal-articles.ts"]).length, 4);
  assert.deepEqual(platformUrlsForChangedFiles(["app/admin/site/page.tsx", "lib/supabase.ts", "components/editor/Editor.tsx"]), []);
});

test("platform URL output is canonical, unique, and host restricted", async () => {
  const { normalizePlatformUrls } = await import(moduleUrl.href);
  assert.deepEqual(normalizePlatformUrls([
    "https://onestudioos.com/features/crm",
    "https://onestudioos.com/features/crm",
    "https://www.onestudioos.com/features/crm",
    "https://bembi.biz/",
    "https://preview.vercel.app/",
    "http://onestudioos.com/",
  ]), ["https://onestudioos.com/features/crm"]);
});

test("release workflow deploys before the production-env IndexNow child process", async () => {
  const source = await readFile(moduleUrl, "utf8");
  assert.ok(source.indexOf('"vercel@latest", "--prod"') < source.indexOf('"vercel@latest", "env", "run"'));
  assert.match(source, /if \(!run\("npx"/);
  assert.match(source, /process\.exit\(1\)/);
  assert.match(source, /INDEXNOW_KEY/);
  assert.doesNotMatch(source, /console\.log\([^\n]*INDEXNOW_KEY/);
});
