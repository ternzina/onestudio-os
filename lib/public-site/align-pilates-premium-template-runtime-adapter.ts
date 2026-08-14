import dynamic from "next/dynamic.js";
import { ALIGN_PILATES_PREMIUM_TEMPLATE_CONTRACT } from "./align-pilates-premium-template-contract.ts";
import type { PremiumTemplatePublicHomeRendererProps, PremiumTemplateRuntimeAdapter } from "./premium-template-runtime-adapter.ts";

const AlignPilatesHome = dynamic<PremiumTemplatePublicHomeRendererProps>(() => import("@/components/public/align-pilates/AlignPilatesSite"));
export const ALIGN_PILATES_PREMIUM_TEMPLATE_RUNTIME_ADAPTER = { templateKey: "align-pilates-studio", definition: ALIGN_PILATES_PREMIUM_TEMPLATE_CONTRACT, publicHomeRenderer: AlignPilatesHome } satisfies PremiumTemplateRuntimeAdapter;
