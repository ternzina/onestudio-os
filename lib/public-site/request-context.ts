import { headers } from "next/headers";
import { getPublicSite } from "./data";
import { requestHtmlLang, safeLocale } from "../seo/request";

export type PublicSiteRequestContext = {
  customDomain: string | null;
  origin: string | null;
  cleanUrls: boolean;
};

export async function getPublicSiteRequestContext(): Promise<PublicSiteRequestContext> {
  const headerStore = await headers();
  const customDomain = headerStore.get("x-onestudio-custom-domain");

  if (!customDomain) {
    return { customDomain: null, origin: null, cleanUrls: false };
  }

  const protocol = headerStore.get("x-forwarded-proto") || "https";
  return {
    customDomain,
    origin: `${protocol}://${customDomain}`,
    cleanUrls: true,
  };
}

export async function getRequestHtmlLang() {
  const headerStore = await headers();
  const explicitLocale = headerStore.get("x-onestudio-request-locale") || headerStore.get("x-onestudio-primary-locale");
  if (explicitLocale) return requestHtmlLang(headerStore);

  const businessSlug = headerStore.get("x-onestudio-business-slug");
  if (!businessSlug) return requestHtmlLang(headerStore);
  const site = await getPublicSite(businessSlug);
  return safeLocale(site?.business.locale || site?.business.primary_locale);
}
