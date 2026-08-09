import PublicBusinessSite from "@/components/public/PublicBusinessSite";
import GlossBusinessSite from "@/components/public/GlossBusinessSite";
import HomeExperience from "@/app/demos/premium-kids-center/HomeExperience";
import PremiumStudioExperience from "@/app/demos/premium-studio/PremiumStudioExperience";
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
  if (templateKey === "gloss-nail-studio") {
    return <GlossBusinessSite site={site} basePath={basePath} />;
  }
  if (templateKey === "premium-studio") {
    return <PremiumStudioExperience site={site} basePath={basePath} />;
  }
  return <PublicBusinessSite site={site} />;
}
