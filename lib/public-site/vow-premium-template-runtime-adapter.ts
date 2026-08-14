import dynamic from "next/dynamic.js";
import { VOW_PREMIUM_TEMPLATE_CONTRACT } from "./vow-premium-template-contract.ts";
import type {
  PremiumTemplatePublicHomeRendererProps,
  PremiumTemplateRuntimeAdapter,
} from "./premium-template-runtime-adapter.ts";

const VowHome = dynamic<PremiumTemplatePublicHomeRendererProps>(() =>
  import("@/components/public/vow/VowSite"),
);

export const VOW_PREMIUM_TEMPLATE_RUNTIME_ADAPTER = {
  templateKey: "vow-films",
  definition: VOW_PREMIUM_TEMPLATE_CONTRACT,
  publicHomeRenderer: VowHome,
} satisfies PremiumTemplateRuntimeAdapter;
