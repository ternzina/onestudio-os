import PublicCustomPage from "@/components/public/PublicCustomPage";
import { GLOSS_PREMIUM_TEMPLATE_CONTRACT } from "./gloss-premium-template-contract";
import type { PremiumTemplateCustomPageRuntimeAdapter } from "./premium-template-custom-page-runtime-adapter";

const GlossCustomPage: PremiumTemplateCustomPageRuntimeAdapter["customPageRenderer"] = ({ site, page }) => (
  <PublicCustomPage site={site} page={page} brandTagline="NAIL STUDIO" />
);

export const GLOSS_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER = {
  templateKey: GLOSS_PREMIUM_TEMPLATE_CONTRACT.templateKey,
  definition: GLOSS_PREMIUM_TEMPLATE_CONTRACT,
  customPageRenderer: GlossCustomPage,
} satisfies PremiumTemplateCustomPageRuntimeAdapter;
