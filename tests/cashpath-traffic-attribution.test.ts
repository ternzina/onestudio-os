import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyCashPathTraffic,
  detectCashPathClickMarker,
  normalizedReferrerHost,
} from "../lib/public-site/cashpath-traffic-attribution.ts";

test("cashpath source discovery prefers explicit UTM over referrer", () => {
  assert.deepEqual(
    classifyCashPathTraffic({
      utmSource: "chatgpt.com",
      utmMedium: "",
      referrerHost: "www.google.com",
    }),
    { trafficSource: "chatgpt.com", trafficChannel: "ai_referral", attributionEvidence: "utm" },
  );
});

test("cashpath search, AI and social referrals are labelled by actual referrer", () => {
  assert.deepEqual(
    classifyCashPathTraffic({ referrerHost: "www.google.com" }),
    { trafficSource: "google", trafficChannel: "organic_search", attributionEvidence: "referrer" },
  );
  assert.deepEqual(
    classifyCashPathTraffic({ referrerHost: "chatgpt.com" }),
    { trafficSource: "chatgpt.com", trafficChannel: "ai_referral", attributionEvidence: "referrer" },
  );
  assert.deepEqual(
    classifyCashPathTraffic({ referrerHost: "old.reddit.com" }),
    { trafficSource: "reddit", trafficChannel: "social", attributionEvidence: "referrer" },
  );
});

test("cashpath tagged ads use medium only when it is supplied", () => {
  assert.deepEqual(
    classifyCashPathTraffic({ utmSource: "facebook", utmMedium: "paid_social" }),
    { trafficSource: "facebook", trafficChannel: "paid_social", attributionEvidence: "utm" },
  );
  assert.deepEqual(
    classifyCashPathTraffic({ utmSource: "newsletter", utmMedium: "email" }),
    { trafficSource: "newsletter", trafficChannel: "email", attributionEvidence: "utm" },
  );
});

test("cashpath records only the name of click parameters, never the IDs", () => {
  const params = new URLSearchParams("gclid=secret123&utm_campaign=anything");
  assert.equal(detectCashPathClickMarker(params), "gclid");
  const classification = classifyCashPathTraffic({ clickMarkerType: "gclid" });
  assert.deepEqual(classification, {
    trafficSource: "google",
    trafficChannel: "click_tagged",
    attributionEvidence: "click_marker",
  });
  assert.equal(JSON.stringify(classification).includes("secret123"), false);
});

test("cashpath does not invent a source if referrer and UTM are missing", () => {
  assert.deepEqual(classifyCashPathTraffic({}), {
    trafficSource: "unknown",
    trafficChannel: "unknown",
    attributionEvidence: "none",
  });
  assert.deepEqual(
    classifyCashPathTraffic({ utmSource: "someone@example.com" }),
    { trafficSource: "unknown", trafficChannel: "unknown", attributionEvidence: "none" },
  );
  assert.equal(normalizedReferrerHost("example.com?email=person@example.com"), "");
});
