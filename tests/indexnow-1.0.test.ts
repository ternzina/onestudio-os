import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("IndexNow uses the native API contract and server-side publish hook", async () => {
  const [integration, publish, proxy, editor, keyRoute] = await Promise.all([
    readFile(new URL("../lib/public-site/indexnow.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/public-site/publish/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../proxy.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/public/indexnow-key/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(integration, /https:\/\/api\.indexnow\.org\/indexnow/);
  assert.match(integration, /\^\[A-Za-z0-9-\]\{8,128\}\$/);
  assert.match(integration, /INDEXNOW_PUBLISH_MAX_URLS = 500/);
  assert.match(integration, /response\.status === 200/);
  assert.match(integration, /response\.status === 202/);
  assert.match(publish, /getFreshPublicSite\(slug, body\.locale\)/);
  assert.match(publish, /submitIndexNow\(\[\.\.\.oldUrls, \.\.\.newUrls\]\)/);
  assert.match(editor, /\/api\/admin\/public-site\/publish/);
  assert.match(proxy, /x-onestudio-indexnow-key/);
  assert.match(keyRoute, /isTechnicalPlatformHostname/);
  assert.doesNotMatch(`${integration}\n${publish}\n${editor}`, /cashpath\.org/);
});

test("editor explains IndexNow without claiming Google indexing", async () => {
  const [page, dialog] = await Promise.all([
    readFile(new URL("../app/admin/site/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/admin/OneStudioSystemDialogs.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(`${page}\n${dialog}`, /Автоматические уведомления Bing включены/);
  assert.match(`${page}\n${dialog}`, /IndexNow не настроен на сервере/);
});
