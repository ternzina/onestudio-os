import dynamic from "next/dynamic.js";
import { BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_CONTRACT } from "./bloom-floral-studio-premium-template-contract.ts";
import type { PremiumTemplatePublicHomeRendererProps, PremiumTemplateRuntimeAdapter } from "./premium-template-runtime-adapter.ts";
const BloomHome = dynamic<PremiumTemplatePublicHomeRendererProps>(() => import("@/components/public/bloom-floral-studio/BloomFloralStudioSite"));
export const BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_RUNTIME_ADAPTER = { templateKey: "bloom-floral-studio", definition: BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_CONTRACT, publicHomeRenderer: BloomHome } satisfies PremiumTemplateRuntimeAdapter;
