import dynamic from "next/dynamic.js";
import { GLOSS_PREMIUM_TEMPLATE_CONTRACT } from "./gloss-premium-template-contract.ts";
import type { PremiumTemplatePublicHomeRendererProps, PremiumTemplateRuntimeAdapter } from "./premium-template-runtime-adapter.ts";

const GlossHome = dynamic<PremiumTemplatePublicHomeRendererProps>(() => import("@/components/public/GlossBusinessSite"));

export const GLOSS_PREMIUM_TEMPLATE_RUNTIME_ADAPTER = {
  templateKey: GLOSS_PREMIUM_TEMPLATE_CONTRACT.templateKey,
  definition: GLOSS_PREMIUM_TEMPLATE_CONTRACT,
  publicHomeRenderer: GlossHome,
} satisfies PremiumTemplateRuntimeAdapter;
