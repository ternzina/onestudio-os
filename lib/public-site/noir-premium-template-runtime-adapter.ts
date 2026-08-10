import dynamic from "next/dynamic.js";
import { NOIR_PREMIUM_TEMPLATE_CONTRACT } from "./noir-premium-template-contract.ts";
import type { PremiumTemplatePublicHomeRendererProps, PremiumTemplateRuntimeAdapter } from "./premium-template-runtime-adapter.ts";

const NoirHome = dynamic<PremiumTemplatePublicHomeRendererProps>(() => import("@/app/demos/premium-studio/PremiumStudioExperience"));

export const NOIR_PREMIUM_TEMPLATE_RUNTIME_ADAPTER = {
  templateKey: NOIR_PREMIUM_TEMPLATE_CONTRACT.templateKey,
  definition: NOIR_PREMIUM_TEMPLATE_CONTRACT,
  publicHomeRenderer: NoirHome,
} satisfies PremiumTemplateRuntimeAdapter;
