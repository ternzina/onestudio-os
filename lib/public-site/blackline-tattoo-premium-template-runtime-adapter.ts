import dynamic from "next/dynamic.js";
import { BLACKLINE_TATTOO_PREMIUM_TEMPLATE_CONTRACT } from "./blackline-tattoo-premium-template-contract.ts";
import type { PremiumTemplatePublicHomeRendererProps, PremiumTemplateRuntimeAdapter } from "./premium-template-runtime-adapter.ts";
const BlacklineTattooHome = dynamic<PremiumTemplatePublicHomeRendererProps>(() => import("@/components/public/blackline-tattoo/BlacklineTattooSite"));
export const BLACKLINE_TATTOO_PREMIUM_TEMPLATE_RUNTIME_ADAPTER = { templateKey: "blackline-tattoo", definition: BLACKLINE_TATTOO_PREMIUM_TEMPLATE_CONTRACT, publicHomeRenderer: BlacklineTattooHome } satisfies PremiumTemplateRuntimeAdapter;
