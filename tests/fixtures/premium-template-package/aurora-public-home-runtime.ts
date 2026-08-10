import { AURORA_PREMIUM_TEMPLATE_CONTRACT } from "./aurora-contract.ts";
import type { PremiumTemplateRuntimeAdapter } from "../../../lib/public-site/premium-template-runtime-adapter.ts";

export const AURORA_PREMIUM_TEMPLATE_RUNTIME_ADAPTER = {
  templateKey: "aurora-wellness", definition: AURORA_PREMIUM_TEMPLATE_CONTRACT,
  publicHomeRenderer: () => null, fixture: "aurora-home",
} as unknown as PremiumTemplateRuntimeAdapter;
