import dynamic from "next/dynamic.js";
import { VOW_PREMIUM_TEMPLATE_CONTRACT } from "./vow-premium-template-contract.ts";
import type {
  PremiumTemplateCustomPageRendererProps,
  PremiumTemplateCustomPageRuntimeAdapter,
} from "./premium-template-custom-page-runtime-adapter.ts";

const VowPage = dynamic<PremiumTemplateCustomPageRendererProps>(() =>
  import("@/components/public/vow/VowCustomPage"),
);

export const VOW_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER = {
  templateKey: "vow-films",
  definition: VOW_PREMIUM_TEMPLATE_CONTRACT,
  customPageRenderer: VowPage,
} satisfies PremiumTemplateCustomPageRuntimeAdapter;
