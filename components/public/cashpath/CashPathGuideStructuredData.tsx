import { SITE_URL } from "@/app/_seo/site";
import { richTextPlainText } from "@/lib/public-site/rich-text";
import { CASH_PATH_GEO_V1_GUIDE_SLUGS } from "@/lib/public-site/cashpath-guides";
import { getPublicSiteRequestContext } from "@/lib/public-site/request-context";
import type { PublicSiteData, PublicSitePage } from "@/lib/public-site/types";

export default async function CashPathGuideStructuredData({
  site,
  page,
  basePath,
}: {
  site: PublicSiteData;
  page: PublicSitePage;
  basePath: string;
}) {
  if (
    site.content.template_id !== "cashpath" ||
    page.type !== "custom" ||
    page.is_visible === false ||
    page.seo_no_index === true ||
    !CASH_PATH_GEO_V1_GUIDE_SLUGS.has(page.slug)
  ) {
    return null;
  }

  const context = await getPublicSiteRequestContext();
  const origin = context.origin || SITE_URL;
  const pagePath = `${basePath === "/" ? "" : basePath}/p/${encodeURIComponent(page.slug)}`;
  const canonical = new URL(pagePath, origin).toString();
  const website = new URL(basePath, origin).toString();
  const name = site.company.display_name || site.business.name;
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: page.title,
    description: page.seo_description || richTextPlainText(page.intro),
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    isPartOf: { "@type": "WebSite", "@id": `${website}#website` },
    publisher: {
      "@type": "Organization",
      "@id": `${website}#organization`,
      name,
      url: website,
    },
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
