import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  publicSiteAdSenseConfig,
  publicSiteAdSenseScriptAttributes,
  publicSiteAdSenseScriptSrc,
} from "../lib/public-site/adsense.ts";

test("enabled premium/template site receives its own official AdSense loader", () => {
  const config = publicSiteAdSenseConfig({
    enabled: true,
    publisher_id: "ca-pub-1663424635036809",
  });

  assert.deepEqual(config, {
    enabled: true,
    publisherId: "ca-pub-1663424635036809",
  });
  assert.equal(
    publicSiteAdSenseScriptSrc(config.publisherId!),
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1663424635036809",
  );
  assert.deepEqual(publicSiteAdSenseScriptAttributes(config.publisherId!), {
    async: true,
    src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1663424635036809",
    crossOrigin: "anonymous",
  });
  const attributes = publicSiteAdSenseScriptAttributes(config.publisherId!);
  assert.deepEqual(Object.keys(attributes).sort(), ["async", "crossOrigin", "src"]);
  assert.equal(Object.keys(attributes).some((name) => name.startsWith("data-") || name.toLowerCase().includes("next")), false);
});

test("different sites remain isolated by their resolved publisher ID", () => {
  const first = publicSiteAdSenseConfig({ enabled: true, publisher_id: "ca-pub-1663424635036809" });
  const second = publicSiteAdSenseConfig({ enabled: true, publisher_id: "ca-pub-1234567890123456" });

  assert.notEqual(first.publisherId, second.publisherId);
  assert.notEqual(publicSiteAdSenseScriptSrc(first.publisherId!), publicSiteAdSenseScriptSrc(second.publisherId!));
});

test("disabled or invalid settings cannot render an AdSense loader", () => {
  assert.deepEqual(
    publicSiteAdSenseConfig({ enabled: false, publisher_id: "ca-pub-1663424635036809" }),
    { enabled: false, publisherId: "ca-pub-1663424635036809" },
  );
  assert.deepEqual(
    publicSiteAdSenseConfig({ enabled: true, publisher_id: "ca-pub-not-a-publisher" }),
    { enabled: false, publisherId: null },
  );
});

test("loader is server-rendered only from the tenant root layout with the official native script attributes", async () => {
  const [layout, runtime, analytics, domainRouting] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/public/PublicSiteAdSense.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/public/PublicSiteAnalytics.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/public-site/domain-routing.ts", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /tenantRoute\s*\?\s*await resolvePublicSiteAdSense/);
  assert.match(layout, /<head>[\s\S]*<PublicSiteAdSense config=\{adSense\}/);
  assert.match(runtime, /<script \{\.\.\.publicSiteAdSenseScriptAttributes\(config\.publisherId\)\} \/>/);
  assert.doesNotMatch(runtime, /next\/script|strategy=|data-nscript|"use client"|document\.head|fetch\("\/api\/public\/adsense/);
  assert.doesNotMatch(analytics, /PublicSiteAdSense/);
  assert.match(domainRouting, /"\/admin"/);
  assert.match(domainRouting, /"\/site-preview"/);
});
