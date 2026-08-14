import PublicCustomPage from "@/components/public/PublicCustomPage";
import type { PremiumTemplateCustomPageRendererProps } from "@/lib/public-site/premium-template-custom-page-runtime-adapter";

export default function AlignPilatesCustomPage(props: PremiumTemplateCustomPageRendererProps) {
  return <PublicCustomPage site={props.site} page={props.page} />;
}
