import dynamic from "next/dynamic.js";
import { RITMO_DANCE_STUDIO_PREMIUM_TEMPLATE_CONTRACT } from "./ritmo-dance-studio-premium-template-contract.ts";
import type { PremiumTemplateCustomPageRendererProps, PremiumTemplateCustomPageRuntimeAdapter } from "./premium-template-custom-page-runtime-adapter.ts";
const RitmoDanceStudioPage = dynamic<PremiumTemplateCustomPageRendererProps>(() => import("@/components/public/ritmo-dance-studio/RitmoDanceCustomPage"));
export const RITMO_DANCE_STUDIO_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER = { templateKey: "ritmo-dance-studio", definition: RITMO_DANCE_STUDIO_PREMIUM_TEMPLATE_CONTRACT, customPageRenderer: RitmoDanceStudioPage } satisfies PremiumTemplateCustomPageRuntimeAdapter;
