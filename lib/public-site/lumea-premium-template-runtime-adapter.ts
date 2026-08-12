import dynamic from "next/dynamic.js";
import { LUMEA_PREMIUM_TEMPLATE_CONTRACT } from "./lumea-premium-template-contract.ts";
import type {
  PremiumTemplatePublicHomeRendererProps,
  PremiumTemplateRuntimeAdapter,
} from "./premium-template-runtime-adapter.ts";

const LumeaHome = dynamic<PremiumTemplatePublicHomeRendererProps>(
  () => import("@/components/public/lumea/LumeaSite"),
);

export const LUMEA_PREMIUM_TEMPLATE_RUNTIME_ADAPTER = {
  templateKey: "lumea-beauty",
  definition: LUMEA_PREMIUM_TEMPLATE_CONTRACT,
  publicHomeRenderer: LumeaHome,
} satisfies PremiumTemplateRuntimeAdapter;
