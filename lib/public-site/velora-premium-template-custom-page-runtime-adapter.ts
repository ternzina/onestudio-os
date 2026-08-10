import dynamic from "next/dynamic.js";
import { VELORA_PREMIUM_TEMPLATE_CONTRACT } from "./velora-premium-template-contract.ts";
import type { PremiumTemplateCustomPageRendererProps, PremiumTemplateCustomPageRuntimeAdapter } from "./premium-template-custom-page-runtime-adapter.ts";
const VeloraPage = dynamic<PremiumTemplateCustomPageRendererProps>(() => import("@/components/public/velora/VeloraCustomPage"));
export const VELORA_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER = { templateKey: "velora-event-venue", definition: VELORA_PREMIUM_TEMPLATE_CONTRACT, customPageRenderer: VeloraPage } satisfies PremiumTemplateCustomPageRuntimeAdapter;
