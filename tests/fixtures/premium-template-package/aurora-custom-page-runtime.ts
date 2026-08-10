import { AURORA_PREMIUM_TEMPLATE_CONTRACT } from "./aurora-contract.ts";
import type { PremiumTemplateCustomPageRuntimeAdapter } from "../../../lib/public-site/premium-template-custom-page-runtime-adapter.ts";

export const AURORA_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER = {
  templateKey: "aurora-wellness", definition: AURORA_PREMIUM_TEMPLATE_CONTRACT,
  customPageRenderer: () => null, fixture: "aurora-page",
} as unknown as PremiumTemplateCustomPageRuntimeAdapter;
