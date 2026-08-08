import { headers } from "next/headers";
import { requestHostname, resolvePublicSiteDomain } from "@/lib/public-site/domain-resolution";
import { getPublicSite } from "@/lib/public-site/data";
import { classifyHostname } from "@/lib/seo/request";
import { platformManifest, tenantManifest, tenantSiteManifest } from "@/lib/seo/manifest";

export default async function manifest() {
  const headerStore = await headers();
  const hostname = requestHostname(headerStore);
  if (classifyHostname(hostname) !== "tenant") return platformManifest();
  const resolution = await resolvePublicSiteDomain(hostname);
  if (!resolution) return tenantManifest({ name: hostname, locale: "en" });
  const site = await getPublicSite(resolution.business_slug);
  if (!site) return tenantManifest({ name: hostname, locale: resolution.primary_locale });
  return tenantSiteManifest(site);
}
