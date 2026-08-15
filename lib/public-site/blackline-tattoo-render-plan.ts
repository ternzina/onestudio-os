import { createPremiumTemplateRenderPlan, type PremiumTemplateRenderPlanItem } from "./premium-template-render-plan.ts";
import { BLACKLINE_TATTOO_PREMIUM_TEMPLATE_CONTRACT } from "./blackline-tattoo-premium-template-contract.ts";
import type { PublicSiteContent } from "./types.ts";
export type BlacklineTattooRenderPlanItem = PremiumTemplateRenderPlanItem;
export function createBlacklineTattooRenderPlan(content: PublicSiteContent): BlacklineTattooRenderPlanItem[] { return createPremiumTemplateRenderPlan(content, BLACKLINE_TATTOO_PREMIUM_TEMPLATE_CONTRACT); }
