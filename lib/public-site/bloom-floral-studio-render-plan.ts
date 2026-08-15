import { createPremiumTemplateRenderPlan, type PremiumTemplateRenderPlanItem } from "./premium-template-render-plan.ts";
import { BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_CONTRACT } from "./bloom-floral-studio-premium-template-contract.ts";
import type { PublicSiteContent } from "./types.ts";
export type BloomFloralStudioRenderPlanItem = PremiumTemplateRenderPlanItem;
export function createBloomFloralStudioRenderPlan(content: PublicSiteContent): BloomFloralStudioRenderPlanItem[] { return createPremiumTemplateRenderPlan(content, BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_CONTRACT); }
