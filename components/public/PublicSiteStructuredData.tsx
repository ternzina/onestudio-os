import { SITE_URL } from "@/app/_seo/site";
import {
  cleanPublicSitePath,
  publicSitePath,
} from "@/lib/public-site/metadata";
import { getPublicSiteRequestContext } from "@/lib/public-site/request-context";
import type { PublicSiteData } from "@/lib/public-site/types";

export default async function PublicSiteStructuredData({
  site,
}: {
  site: PublicSiteData;
}) {
  const context = await getPublicSiteRequestContext();
  const locale =
    site.business.locale === site.business.primary_locale
      ? null
      : site.business.locale;
  const path = context.cleanUrls
    ? cleanPublicSitePath(locale)
    : publicSitePath(site.business.slug, locale);
  const url = new URL(path, context.origin || SITE_URL).toString();
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${url}#business`,
    name: site.company.display_name || site.business.name,
    url,
    email: site.company.email || undefined,
    telephone: site.company.phone || undefined,
    address: site.content.contact_address || site.company.address || undefined,
    image:
      site.content.seo_image_url ||
      site.content.hero_image_url ||
      site.portfolio.find((project) => project.image_url)?.image_url ||
      undefined,
    makesOffer: site.services.map((service) => ({
      "@type": "Offer",
      name: service.title,
      description: service.description || undefined,
      price:
        service.price_minor === null
          ? undefined
          : (service.price_minor / 100).toFixed(2),
      priceCurrency: service.currency,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
