import PremiumStudioExperience from "@/app/demos/premium-studio/PremiumStudioExperience";
import { NOIR_PREMIUM_TEMPLATE_CONTRACT } from "./noir-premium-template-contract";
import type { PremiumTemplateRuntimeAdapter } from "./premium-template-runtime-adapter";

export const NOIR_PREMIUM_TEMPLATE_RUNTIME_ADAPTER = {
  templateKey: NOIR_PREMIUM_TEMPLATE_CONTRACT.templateKey,
  definition: NOIR_PREMIUM_TEMPLATE_CONTRACT,
  publicHomeRenderer: PremiumStudioExperience,
} satisfies PremiumTemplateRuntimeAdapter;
