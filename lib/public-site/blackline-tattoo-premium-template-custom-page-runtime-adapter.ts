import dynamic from "next/dynamic.js";
import { BLACKLINE_TATTOO_PREMIUM_TEMPLATE_CONTRACT } from "./blackline-tattoo-premium-template-contract.ts";
import type { PremiumTemplateCustomPageRendererProps, PremiumTemplateCustomPageRuntimeAdapter } from "./premium-template-custom-page-runtime-adapter.ts";
const BlacklineTattooPage = dynamic<PremiumTemplateCustomPageRendererProps>(() => import("@/components/public/blackline-tattoo/BlacklineTattooCustomPage"));
export const BLACKLINE_TATTOO_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER = { templateKey: "blackline-tattoo", definition: BLACKLINE_TATTOO_PREMIUM_TEMPLATE_CONTRACT, customPageRenderer: BlacklineTattooPage } satisfies PremiumTemplateCustomPageRuntimeAdapter;
