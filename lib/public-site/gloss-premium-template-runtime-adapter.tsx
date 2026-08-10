import GlossBusinessSite from "@/components/public/GlossBusinessSite";
import { GLOSS_PREMIUM_TEMPLATE_CONTRACT } from "./gloss-premium-template-contract";
import type { PremiumTemplateRuntimeAdapter } from "./premium-template-runtime-adapter";

export const GLOSS_PREMIUM_TEMPLATE_RUNTIME_ADAPTER = {
  templateKey: GLOSS_PREMIUM_TEMPLATE_CONTRACT.templateKey,
  definition: GLOSS_PREMIUM_TEMPLATE_CONTRACT,
  publicHomeRenderer: GlossBusinessSite,
} satisfies PremiumTemplateRuntimeAdapter;
