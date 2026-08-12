import PublicCustomPage from "@/components/public/PublicCustomPage";
import type { PremiumTemplateCustomPageRendererProps } from "@/lib/public-site/premium-template-custom-page-runtime-adapter";

export default function LumeaCustomPage({
  site,
  page,
}: PremiumTemplateCustomPageRendererProps) {
  return (
    <PublicCustomPage
      site={site}
      page={page}
      brandTagline="BEAUTY STUDIO"
    />
  );
}
