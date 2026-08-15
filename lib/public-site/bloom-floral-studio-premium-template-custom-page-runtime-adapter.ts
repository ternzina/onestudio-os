import dynamic from "next/dynamic.js";
import type { PremiumTemplateCustomPageRendererProps, PremiumTemplateCustomPageRuntimeAdapter } from "./premium-template-custom-page-runtime-adapter.ts";
import { BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_CONTRACT } from "./bloom-floral-studio-premium-template-contract.ts";
const BloomPage = dynamic<PremiumTemplateCustomPageRendererProps>(() => import("@/components/public/bloom-floral-studio/BloomFloralStudioCustomPage"));
export const BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER = { templateKey: "bloom-floral-studio", definition: BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_CONTRACT, customPageRenderer: BloomPage } satisfies PremiumTemplateCustomPageRuntimeAdapter;
