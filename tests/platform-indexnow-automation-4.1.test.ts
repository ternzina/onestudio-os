import assert from "node:assert/strict";
import test from "node:test";

const script = new URL("../scripts/platform-indexnow-release.mjs", import.meta.url);

test("platform URL mapping uses current public registries", async () => {
  const { platformUrlsForChangedFiles, canonicalPlatformPaths } = await import(script.href);
  assert.deepEqual(platformUrlsForChangedFiles(["app/page.tsx"]), ["https://onestudioos.com/"]);
  assert.deepEqual(platformUrlsForChangedFiles(["lib/seo/features.ts"]), ["https://onestudioos.com/features/crm", "https://onestudioos.com/features/online-booking"]);
  assert.ok(platformUrlsForChangedFiles(["lib/seo/solutions.ts"]).includes("https://onestudioos.com/solutions"));
  assert.ok(platformUrlsForChangedFiles(["lib/seo/guide-articles.ts"]).includes("https://onestudioos.com/guides"));
  assert.ok(platformUrlsForChangedFiles(["lib/seo/guide-articles.ts"]).every((url: string) => !url.includes("/blog")));
  assert.ok(platformUrlsForChangedFiles(["lib/demo-catalog.ts"]).some((url: string) => url.includes("/demos/")));
  assert.ok(canonicalPlatformPaths().includes("/demos/bloom-floral-studio"));
  assert.deepEqual(platformUrlsForChangedFiles(["app/admin/site/page.tsx", "components/puck-site-editor/editor.tsx"]), []);
});

test("platform URL normalization and release ordering are safe", async () => {
  const { normalizePlatformUrls, runSeoRelease, assertProductionReleaseGuard, submitPlatformIndexNow } = await import(script.href);
  assert.deepEqual(normalizePlatformUrls(["https://onestudioos.com/", "https://onestudioos.com/", "http://onestudioos.com/x", "https://bembi.biz/"]), ["https://onestudioos.com/"]);
  const events: Array<"deploy" | "submit"> = [];
  await runSeoRelease({ urls: ["https://onestudioos.com/"], deploy: async () => { events.push("deploy"); return true; }, submit: async () => { events.push("submit"); return { ok: true }; } });
  assert.deepEqual(events, ["deploy", "submit"]);
  events.length = 0;
  await runSeoRelease({ urls: ["https://onestudioos.com/"], deploy: async () => false, submit: async () => { events.push("submit"); return { ok: true }; } });
  assert.deepEqual(events, [] as Array<"deploy" | "submit">);
  await runSeoRelease({ urls: [], deploy: async () => { events.push("deploy"); return true; }, submit: async () => { events.push("submit"); return { ok: true }; } });
  assert.deepEqual(events, ["deploy"]);
  assert.throws(() => assertProductionReleaseGuard({ branch: "feature/x", status: "", head: "a", originMain: "a" }));
  let requested = false;
  const invalid = await submitPlatformIndexNow(["https://onestudioos.com/"], { env: { INDEXNOW_KEY: "bad key" }, fetcher: async () => { requested = true; return new Response(null, { status: 200 }); } });
  assert.equal(invalid.ok, false); assert.equal(requested, false);
  for (const status of [200, 202]) {
    const result = await submitPlatformIndexNow(["https://onestudioos.com/"], { env: { INDEXNOW_KEY: "valid-key-123" }, fetcher: async () => new Response(null, { status }) });
    assert.equal(result.ok, true); assert.equal(result.status, status === 202 ? "accepted_pending" : "accepted");
  }
  const failed = await submitPlatformIndexNow(["https://onestudioos.com/"], { env: { INDEXNOW_KEY: "valid-key-123" }, fetcher: async () => new Response(null, { status: 500 }) });
  assert.equal(failed.ok, false);
});
