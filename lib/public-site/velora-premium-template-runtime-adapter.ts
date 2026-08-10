import dynamic from "next/dynamic.js";
import { VELORA_PREMIUM_TEMPLATE_CONTRACT } from "./velora-premium-template-contract.ts";
import type { PremiumTemplatePublicHomeRendererProps, PremiumTemplateRuntimeAdapter } from "./premium-template-runtime-adapter.ts";
const VeloraHome = dynamic<PremiumTemplatePublicHomeRendererProps>(() => import("@/components/public/velora/VeloraSite"));
export const VELORA_PREMIUM_TEMPLATE_RUNTIME_ADAPTER = { templateKey: "velora-event-venue", definition: VELORA_PREMIUM_TEMPLATE_CONTRACT, publicHomeRenderer: VeloraHome } satisfies PremiumTemplateRuntimeAdapter;
