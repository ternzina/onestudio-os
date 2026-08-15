import { createPremiumTemplateRenderPlan, type PremiumTemplateRenderPlanItem } from "./premium-template-render-plan.ts";
import { PAWHAUS_GROOMING_STUDIO_PREMIUM_TEMPLATE_CONTRACT } from "./pawhaus-grooming-studio-premium-template-contract.ts";
import type { PublicSiteContent } from "./types.ts";
export type PawhausRenderPlanItem = PremiumTemplateRenderPlanItem;
export function createPawhausGroomingStudioRenderPlan(content: PublicSiteContent): PawhausRenderPlanItem[] {
  return createPremiumTemplateRenderPlan(content, PAWHAUS_GROOMING_STUDIO_PREMIUM_TEMPLATE_CONTRACT);
}
