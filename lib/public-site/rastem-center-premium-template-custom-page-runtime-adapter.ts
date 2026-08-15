import dynamic from "next/dynamic.js";
import { RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT } from "./rastem-center-premium-template-contract.ts";
import type { PremiumTemplateCustomPageRendererProps, PremiumTemplateCustomPageRuntimeAdapter } from "./premium-template-custom-page-runtime-adapter.ts";
const RastemCenterPage = dynamic<PremiumTemplateCustomPageRendererProps>(() => import("@/components/public/rastem-center/RastemCenterCustomPage"));
export const RASTEM_CENTER_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER = { templateKey: "rastem-center", definition: RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT, customPageRenderer: RastemCenterPage } satisfies PremiumTemplateCustomPageRuntimeAdapter;
