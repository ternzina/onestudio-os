/**
 * CashPath first-touch attribution.
 *
 * Never store click IDs or the full incoming URL. Click-marker *names* only
 * distinguish traffic with known tracking parameters from truly unattributed
 * sessions. No result here proves that traffic was paid or organic.
 */

export const CASH_PATH_CLICK_MARKERS = [
  "gclid",
  "gbraid",
  "wbraid",
  "msclkid",
  "fbclid",
  "ttclid",
  "li_fat_id",
] as const;

export type CashPathClickMarker = (typeof CASH_PATH_CLICK_MARKERS)[number];
export type SourceEvidence = "utm" | "referrer" | "click_marker" | "none";

export type TrafficChannel =
  | "organic_search"
  | "paid_search"
  | "paid_social"
  | "ai_referral"
  | "social"
  | "email"
  | "referral"
  | "tagged"
  | "click_tagged"
  | "unknown";

type TrafficAttributionInput = {
  referrerHost?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  clickMarkerType?: string | null;
};

export type ClassifiedTraffic = {
  trafficSource: string;
  trafficChannel: TrafficChannel;
  attributionEvidence: SourceEvidence;
};

function normalized(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function identifiableSource(value?: string | null) {
  const clean = normalized(value);
  // UTM values are publisher-defined. Do not echo emails, URLs, free text or
  // identifiers into an additional public-facing source field.
  return /^[a-z0-9][a-z0-9._-]{0,79}$/.test(clean) ? clean : "";
}

export function detectCashPathClickMarker(
  params: URLSearchParams,
): CashPathClickMarker | "" {
  return CASH_PATH_CLICK_MARKERS.find((marker) => params.has(marker)) ?? "";
}

export function normalizedReferrerHost(value?: string | null) {
  const host = normalized(value);
  return /^[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?$/.test(host) && !host.includes("..")
    ? host
    : "";
}

function knownSourceFromHost(host: string): string {
  const matches = (domain: string) =>
    host === domain || host.endsWith("." + domain);

  if (matches("google.com") || /^google\.[a-z]{2,3}(?:\.[a-z]{2})?$/.test(host)) {
    return "google";
  }
  if (matches("bing.com")) return "bing";
  if (matches("yahoo.com")) return "yahoo";
  if (matches("duckduckgo.com")) return "duckduckgo";
  if (matches("chatgpt.com") || matches("chat.openai.com")) return "chatgpt.com";
  if (matches("perplexity.ai")) return "perplexity.ai";
  if (matches("copilot.microsoft.com")) return "copilot.microsoft.com";
  if (matches("facebook.com") || matches("fb.com")) return "facebook";
  if (matches("instagram.com")) return "instagram";
  if (matches("reddit.com")) return "reddit";
  if (matches("tiktok.com")) return "tiktok";
  if (matches("linkedin.com")) return "linkedin";
  if (matches("youtube.com")) return "youtube";
  if (matches("x.com") || matches("twitter.com")) return "x.com";
  return host;
}

const SEARCH = new Set(["google", "bing", "yahoo", "duckduckgo"]);
const AI = new Set(["chatgpt.com", "perplexity.ai", "copilot.microsoft.com"]);
const SOCIAL = new Set([
  "facebook", "instagram", "reddit", "tiktok", "linkedin", "youtube", "x.com",
]);

function sourceFromClickMarker(marker: string): string {
  if (["gclid", "gbraid", "wbraid"].includes(marker)) return "google";
  if (marker === "msclkid") return "bing";
  if (marker === "fbclid") return "facebook";
  if (marker === "ttclid") return "tiktok";
  if (marker === "li_fat_id") return "linkedin";
  return "unknown";
}

function channelFromUtm(medium: string, source: string): TrafficChannel {
  if (["email", "e-mail", "newsletter"].includes(medium)) return "email";
  if (["paid_social", "paid-social", "paidsocial"].includes(medium)) return "paid_social";
  if (["cpc", "ppc", "paid", "paid_search", "paid-search"].includes(medium)) {
    return SOCIAL.has(source) ? "paid_social" : "paid_search";
  }
  if (["organic", "seo", "organic_search"].includes(medium)) return "organic_search";
  if (["social", "organic_social", "social-network"].includes(medium)) return "social";
  if (["ai", "ai_search", "ai-referral"].includes(medium)) return "ai_referral";
  if (["referral", "referrer"].includes(medium)) return "referral";
  if (AI.has(source)) return "ai_referral";
  if (SOCIAL.has(source)) return "social";
  return "tagged";
}

/**
 * UTM > external referrer > recognized click-marker *presence* > unknown.
 *
 * "unknown" deliberately does not mean "typed the URL". Tracking parameters
 * may be absent for messengers, email apps, redirects and privacy settings.
 */
export function classifyCashPathTraffic(
  input: TrafficAttributionInput,
): ClassifiedTraffic {
  const utmSource = identifiableSource(input.utmSource);
  const utmMedium = identifiableSource(input.utmMedium);
  const referrer = normalizedReferrerHost(input.referrerHost);
  const marker = normalized(input.clickMarkerType);
  const knownMarker = CASH_PATH_CLICK_MARKERS.some((value) => value === marker);

  if (utmSource || utmMedium) {
    const source = utmSource || (referrer ? knownSourceFromHost(referrer) : "tagged");
    return {
      trafficSource: source,
      trafficChannel: channelFromUtm(utmMedium, source),
      attributionEvidence: "utm",
    };
  }

  if (referrer) {
    const source = knownSourceFromHost(referrer);
    return {
      trafficSource: source,
      trafficChannel: AI.has(source) ? "ai_referral"
        : SEARCH.has(source) ? "organic_search"
        : SOCIAL.has(source) ? "social"
        : "referral",
      attributionEvidence: "referrer",
    };
  }

  if (knownMarker) {
    return {
      trafficSource: sourceFromClickMarker(marker),
      trafficChannel: "click_tagged",
      attributionEvidence: "click_marker",
    };
  }

  return {
    trafficSource: "unknown",
    trafficChannel: "unknown",
    attributionEvidence: "none",
  };
}
