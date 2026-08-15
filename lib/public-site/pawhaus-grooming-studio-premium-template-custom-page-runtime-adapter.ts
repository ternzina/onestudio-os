import dynamic from "next/dynamic.js";
import type { PremiumTemplateCustomPageRendererProps, PremiumTemplateCustomPageRuntimeAdapter } from "./premium-template-custom-page-runtime-adapter.ts";
import { PAWHAUS_GROOMING_STUDIO_PREMIUM_TEMPLATE_CONTRACT } from "./pawhaus-grooming-studio-premium-template-contract.ts";
const PawhausPage = dynamic<PremiumTemplateCustomPageRendererProps>(() => import("@/components/public/pawhaus-grooming-studio/PawhausCustomPage"));
export const PAWHAUS_GROOMING_STUDIO_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER = { templateKey: "pawhaus-grooming-studio", definition: PAWHAUS_GROOMING_STUDIO_PREMIUM_TEMPLATE_CONTRACT, customPageRenderer: PawhausPage } satisfies PremiumTemplateCustomPageRuntimeAdapter;
