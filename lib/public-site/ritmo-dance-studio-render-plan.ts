import { createPremiumTemplateRenderPlan, type PremiumTemplateRenderPlanItem } from "./premium-template-render-plan.ts";
import { RITMO_DANCE_STUDIO_PREMIUM_TEMPLATE_CONTRACT } from "./ritmo-dance-studio-premium-template-contract.ts";
import type { PublicSiteContent } from "./types.ts";

export type RitmoDanceStudioRenderPlanItem = PremiumTemplateRenderPlanItem;

export function createRitmoDanceStudioRenderPlan(
  content: PublicSiteContent,
): RitmoDanceStudioRenderPlanItem[] {
  return createPremiumTemplateRenderPlan(content, RITMO_DANCE_STUDIO_PREMIUM_TEMPLATE_CONTRACT);
}
