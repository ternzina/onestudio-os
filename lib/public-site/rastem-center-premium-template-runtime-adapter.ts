import dynamic from "next/dynamic.js";
import { RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT } from "./rastem-center-premium-template-contract.ts";
import type { PremiumTemplatePublicHomeRendererProps, PremiumTemplateRuntimeAdapter } from "./premium-template-runtime-adapter.ts";
const RastemCenterHome = dynamic<PremiumTemplatePublicHomeRendererProps>(() => import("@/components/public/rastem-center/RastemCenterSite"));
export const RASTEM_CENTER_PREMIUM_TEMPLATE_RUNTIME_ADAPTER = { templateKey: "rastem-center", definition: RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT, publicHomeRenderer: RastemCenterHome } satisfies PremiumTemplateRuntimeAdapter;
