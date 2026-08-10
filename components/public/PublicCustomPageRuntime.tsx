import BembiCustomPage from "@/components/public/BembiCustomPage";
import PublicCustomPage from "@/components/public/PublicCustomPage";
import { publicSitePath } from "@/lib/public-site/metadata";
import { getPremiumTemplateCustomPageRuntime } from "@/lib/public-site/premium-template-custom-page-runtime-registry";
import { resolveSiteTemplateKey } from "@/lib/public-site/template-registry";
import type { PublicSiteData, PublicSitePage } from "@/lib/public-site/types";

export default function PublicCustomPageRuntime({ site, page, basePath }: { site: PublicSiteData; page: PublicSitePage; basePath?: string }) {
  const templateKey = resolveSiteTemplateKey(site.content.template_id);
  const localized = site.business.locale === site.business.primary_locale ? null : site.business.locale;
  const resolvedBasePath = basePath ?? publicSitePath(site.business.slug, localized);

  if (templateKey === "premium-kids-center") {
    return <BembiCustomPage site={site} page={page} basePath={resolvedBasePath} />;
  }

  const premiumRuntime = getPremiumTemplateCustomPageRuntime(templateKey);
  if (premiumRuntime) {
    const PremiumCustomPageRenderer = premiumRuntime.customPageRenderer;
    return <PremiumCustomPageRenderer site={site} page={page} basePath={resolvedBasePath} />;
  }

  return <PublicCustomPage site={site} page={page} />;
}
