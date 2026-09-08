import assert from "node:assert/strict";
import test from "node:test";

const moduleUrl = new URL("../scripts/platform-indexnow-release.mjs", import.meta.url);

test("platform source changes map to canonical platform URLs", async () => {
  const { platformUrlsForChangedFiles, canonicalPlatformPaths } = await import(moduleUrl.href);
  assert.deepEqual(platformUrlsForChangedFiles(["app/page.tsx"]), ["https://onestudioos.com/"]);
  assert.deepEqual(platformUrlsForChangedFiles(["lib/seo/features.ts"]), [
    "https://onestudioos.com/features/crm",
    "https://onestudioos.com/features/online-booking",
  ]);
  const solutions = platformUrlsForChangedFiles(["lib/seo/solutions.ts"]);
  assert.equal(solutions.includes("https://onestudioos.com/solutions"), true);
  assert.equal(solutions.filter((url: string) => url.startsWith("https://onestudioos.com/solutions/")).length, 5);
  assert.equal(platformUrlsForChangedFiles(["lib/seo/journal-articles.ts"]).length, 4);
  const common = platformUrlsForChangedFiles(["lib/i18n/locales/en/common.ts"]);
  for (const path of ["/", "/features", "/demos", "/components", "/pricing", "/website", "/about", "/faq", "/blog", "/contact"]) {
    assert.ok(common.includes(`https://onestudioos.com${path}`));
  }
  assert.ok(common.includes("https://onestudioos.com/privacy"));
  assert.ok(common.includes("https://onestudioos.com/terms"));
  const paths = canonicalPlatformPaths();
  assert.ok(paths.includes("/demos/rastem-center"));
  assert.ok(paths.includes("/demos/cashpath"));
  assert.ok(paths.includes("/demos/bloom-floral-studio"));
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

test("release workflow is ordered, guarded, and testable without network calls", async () => {
  const { runSeoRelease, assertProductionReleaseGuard, submitPlatformIndexNow } = await import(moduleUrl.href);
  const events: string[] = [];
  const deploy = async () => { events.push("deploy"); return true; };
  const submit = async () => { events.push("submit"); return { ok: true }; };
  await runSeoRelease({ urls: ["https://onestudioos.com/"], deploy, submit });
  assert.deepEqual(events, ["deploy", "submit"]);
  events.length = 0;
  await runSeoRelease({ urls: ["https://onestudioos.com/"], deploy: async () => false, submit });
  assert.deepEqual(events, []);
  await runSeoRelease({ urls: [], deploy, submit });
  assert.deepEqual(events, ["deploy"]);
  events.length = 0;
  await runSeoRelease({ urls: ["https://onestudioos.com/"], dryRun: true, deploy, submit });
  assert.deepEqual(events, []);
  assert.throws(() => assertProductionReleaseGuard({ branch: "feature/x", status: "", head: "a", originMain: "a" }), /main/);
  assert.throws(() => assertProductionReleaseGuard({ branch: "main", status: " M file", head: "a", originMain: "a" }), /clean/);
  assert.throws(() => assertProductionReleaseGuard({ branch: "main", status: "", head: "a", originMain: "b" }), /origin\/main/);
  let requested = false;
  const disabled = await submitPlatformIndexNow(["https://onestudioos.com/"], { env: { INDEXNOW_KEY: "not valid" }, fetcher: async () => { requested = true; return new Response(null, { status: 200 }); } });
  assert.equal(disabled.status, "disabled");
  assert.equal(requested, false);
  for (const status of [200, 202]) {
    const accepted = await submitPlatformIndexNow(["https://onestudioos.com/"], { env: { INDEXNOW_KEY: "valid-key-123" }, fetcher: async (_url: string, init: RequestInit) => {
      const payload = JSON.parse(String(init.body));
      assert.equal(payload.host, "onestudioos.com");
      assert.deepEqual(payload.urlList, ["https://onestudioos.com/"]);
      return new Response(null, { status });
    } });
    assert.equal(accepted.ok, true);
    assert.equal(accepted.status, status);
  }
  const failed = await submitPlatformIndexNow(["https://onestudioos.com/"], { env: { INDEXNOW_KEY: "valid-key-123" }, fetcher: async () => new Response(null, { status: 500 }) });
  assert.equal(failed.ok, false);
});
