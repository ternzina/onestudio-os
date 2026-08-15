import dynamic from "next/dynamic.js";
import { PAWHAUS_GROOMING_STUDIO_PREMIUM_TEMPLATE_CONTRACT } from "./pawhaus-grooming-studio-premium-template-contract.ts";
import type { PremiumTemplatePublicHomeRendererProps, PremiumTemplateRuntimeAdapter } from "./premium-template-runtime-adapter.ts";
const PawhausHome = dynamic<PremiumTemplatePublicHomeRendererProps>(() => import("@/components/public/pawhaus-grooming-studio/PawhausGroomingStudioSite"));
export const PAWHAUS_GROOMING_STUDIO_PREMIUM_TEMPLATE_RUNTIME_ADAPTER = { templateKey: "pawhaus-grooming-studio", definition: PAWHAUS_GROOMING_STUDIO_PREMIUM_TEMPLATE_CONTRACT, publicHomeRenderer: PawhausHome } satisfies PremiumTemplateRuntimeAdapter;
