import type { Metadata } from "next";
import { headers } from "next/headers";
import CashPathNotFound from "@/components/public/cashpath/CashPathNotFound";
import PublicSiteNotFoundClient from "@/components/public/PublicSiteNotFound";
import { requestHostname, resolvePublicSiteDomain } from "@/lib/public-site/domain-resolution";
import { getPublicSite } from "@/lib/public-site/data";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PublicSiteNotFound() {
  const headerStore = await headers();
  const hostname = requestHostname(headerStore);
  const resolution = hostname ? await resolvePublicSiteDomain(hostname) : null;
  const site = resolution ? await getPublicSite(resolution.business_slug, resolution.primary_locale) : null;

  if (site?.content.template_id === "cashpath") return <CashPathNotFound />;

  return <PublicSiteNotFoundClient />;
}
