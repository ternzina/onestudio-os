import dynamic from "next/dynamic.js";
import { NOIR_PREMIUM_TEMPLATE_CONTRACT } from "./noir-premium-template-contract.ts";
import type { PremiumTemplateCustomPageRendererProps, PremiumTemplateCustomPageRuntimeAdapter } from "./premium-template-custom-page-runtime-adapter.ts";

const NoirPage = dynamic<PremiumTemplateCustomPageRendererProps>(() => import("@/components/public/NoirCustomPage"));

export const NOIR_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER = {
  templateKey: NOIR_PREMIUM_TEMPLATE_CONTRACT.templateKey,
  definition: NOIR_PREMIUM_TEMPLATE_CONTRACT,
  customPageRenderer: NoirPage,
} satisfies PremiumTemplateCustomPageRuntimeAdapter;
