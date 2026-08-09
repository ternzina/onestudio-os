import BembiCustomPage from "@/components/public/BembiCustomPage";
import PublicCustomPage from "@/components/public/PublicCustomPage";
import { publicSitePath } from "@/lib/public-site/metadata";
import { resolveSiteTemplateKey } from "@/lib/public-site/template-registry";
import type { PublicSiteData, PublicSitePage } from "@/lib/public-site/types";

export default function PublicCustomPageRuntime({ site, page, basePath }: { site: PublicSiteData; page: PublicSitePage; basePath?: string }) {
  if (resolveSiteTemplateKey(site.content.template_id) === "premium-kids-center") {
    const localized = site.business.locale === site.business.primary_locale ? null : site.business.locale;
    return <BembiCustomPage site={site} page={page} basePath={basePath ?? publicSitePath(site.business.slug, localized)} />;
  }
  return <PublicCustomPage site={site} page={page} />;
}
