import NoirCustomPage from "@/components/public/NoirCustomPage";
import { NOIR_PREMIUM_TEMPLATE_CONTRACT } from "./noir-premium-template-contract";
import type { PremiumTemplateCustomPageRuntimeAdapter } from "./premium-template-custom-page-runtime-adapter";

export const NOIR_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER = {
  templateKey: NOIR_PREMIUM_TEMPLATE_CONTRACT.templateKey,
  definition: NOIR_PREMIUM_TEMPLATE_CONTRACT,
  customPageRenderer: NoirCustomPage,
} satisfies PremiumTemplateCustomPageRuntimeAdapter;
