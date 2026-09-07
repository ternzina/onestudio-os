import { SITE_URL } from "@/app/_seo/site";
import { cleanPublicPagePath, cleanPublicSitePath, publicCustomPagePath, publicSitePagePath, publicSitePath } from "./metadata";
import { premiumPublicSitemapPaths } from "./premium-route-metadata";
import type { PublicSiteData } from "./types";

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const INDEXNOW_PROTOCOL_MAX_URLS = 10_000;
export const INDEXNOW_PUBLISH_MAX_URLS = 500;
const KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;

export type IndexNowResult = { status: "disabled" | "submitted" | "accepted" | "accepted_pending" | "failed"; host: string | null; urlCount: number; httpStatus?: number };

export function indexNowKey(env: NodeJS.ProcessEnv = process.env) {
  const key = env.INDEXNOW_KEY?.trim();
  return key && KEY_PATTERN.test(key) ? key : null;
}

export function isIndexNowConfigured() { return Boolean(indexNowKey()); }

export function indexNowUrls(site: PublicSiteData, locale: string, options: { customDomain?: string | null; indexable?: boolean } = {}) {
  if (options.indexable === false) return [];
  const clean = Boolean(options.customDomain);
  const origin = clean ? `https://${options.customDomain}` : SITE_URL.toString();
  const localePath = site.business.primary_locale === locale ? null : locale;
  const root = clean ? cleanPublicSitePath(localePath) : publicSitePath(site.business.slug, localePath);
  const pages = (site.content.pages ?? []).filter((page) => page.is_visible !== false && page.seo_no_index !== true).map((page) => clean
    ? cleanPublicPagePath(page.slug, localePath, page.type === "custom")
    : page.type === "portfolio" ? publicSitePagePath(site.business.slug, page.slug, localePath) : publicCustomPagePath(site.business.slug, page.slug, localePath));
  const premium = premiumPublicSitemapPaths(site, site.business.locale, clean);
  return [...new Set([root, ...pages, ...premium].map((path) => new URL(path, origin).toString()))];
}

export async function submitIndexNow(urls: string[], fetcher: typeof fetch = fetch, env: NodeJS.ProcessEnv = process.env): Promise<IndexNowResult> {
  const key = indexNowKey(env);
  const unique = [...new Set(urls)].filter((url) => { try { return new URL(url).protocol === "https:"; } catch { return false; } });
  const host = unique[0] ? new URL(unique[0]).host : null;
  if (!key || !host || unique.length === 0) return { status: "disabled", host, urlCount: unique.length };
  if (unique.length > INDEXNOW_PUBLISH_MAX_URLS || unique.some((url) => new URL(url).host !== host)) return { status: "failed", host, urlCount: unique.length };
  try {
    const response = await fetcher(INDEXNOW_ENDPOINT, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList: unique }), signal: AbortSignal.timeout(8_000) });
    const status = response.status === 200 ? "accepted" : response.status === 202 ? "accepted_pending" : response.ok ? "submitted" : "failed";
    return { status, host, urlCount: unique.length, httpStatus: response.status };
  } catch { return { status: "failed", host, urlCount: unique.length }; }
}
