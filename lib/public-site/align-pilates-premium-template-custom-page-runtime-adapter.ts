import dynamic from "next/dynamic.js";
import { ALIGN_PILATES_PREMIUM_TEMPLATE_CONTRACT } from "./align-pilates-premium-template-contract.ts";
import type { PremiumTemplateCustomPageRendererProps, PremiumTemplateCustomPageRuntimeAdapter } from "./premium-template-custom-page-runtime-adapter.ts";

const AlignPilatesPage = dynamic<PremiumTemplateCustomPageRendererProps>(() => import("@/components/public/align-pilates/AlignPilatesCustomPage"));
export const ALIGN_PILATES_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER = { templateKey: "align-pilates-studio", definition: ALIGN_PILATES_PREMIUM_TEMPLATE_CONTRACT, customPageRenderer: AlignPilatesPage } satisfies PremiumTemplateCustomPageRuntimeAdapter;
