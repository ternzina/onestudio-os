import { createPremiumTemplateRenderPlan, type PremiumTemplateRenderPlanItem } from "./premium-template-render-plan.ts";
import { RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT } from "./rastem-center-premium-template-contract.ts";
import type { PublicSiteContent } from "./types.ts";

export type RastemCenterRenderPlanItem = PremiumTemplateRenderPlanItem;
export function createRastemCenterRenderPlan(content: PublicSiteContent): RastemCenterRenderPlanItem[] {
  return createPremiumTemplateRenderPlan(content, RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT);
}
