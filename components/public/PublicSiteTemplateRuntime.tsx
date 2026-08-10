import PublicBusinessSite from "@/components/public/PublicBusinessSite";
import HomeExperience from "@/app/demos/premium-kids-center/HomeExperience";
import { getPremiumTemplatePublicRuntime } from "@/lib/public-site/premium-template-runtime-registry";
import { resolveSiteTemplateKey } from "@/lib/public-site/template-registry";
import type { PublicSiteData } from "@/lib/public-site/types";

export default function PublicSiteTemplateRuntime({
  site,
  basePath,
}: {
  site: PublicSiteData;
  basePath: string;
}) {
  const templateKey = resolveSiteTemplateKey(site.content.template_id);

  if (templateKey === "premium-kids-center") {
    return <HomeExperience basePath={basePath} site={site} />;
  }
  const premiumRuntime = getPremiumTemplatePublicRuntime(templateKey);
  if (premiumRuntime) {
    const PremiumHomeRenderer = premiumRuntime.publicHomeRenderer;
    return <PremiumHomeRenderer site={site} basePath={basePath} />;
  }
  return <PublicBusinessSite site={site} />;
}
