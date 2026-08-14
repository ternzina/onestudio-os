import dynamic from "next/dynamic.js";
import { RITMO_DANCE_STUDIO_PREMIUM_TEMPLATE_CONTRACT } from "./ritmo-dance-studio-premium-template-contract.ts";
import type { PremiumTemplatePublicHomeRendererProps, PremiumTemplateRuntimeAdapter } from "./premium-template-runtime-adapter.ts";
const RitmoDanceStudioHome = dynamic<PremiumTemplatePublicHomeRendererProps>(() => import("@/components/public/ritmo-dance-studio/RitmoDanceSite"));
export const RITMO_DANCE_STUDIO_PREMIUM_TEMPLATE_RUNTIME_ADAPTER = { templateKey: "ritmo-dance-studio", definition: RITMO_DANCE_STUDIO_PREMIUM_TEMPLATE_CONTRACT, publicHomeRenderer: RitmoDanceStudioHome } satisfies PremiumTemplateRuntimeAdapter;
