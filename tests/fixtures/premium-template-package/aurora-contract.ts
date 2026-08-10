import type { PremiumTemplateContract } from "../../../lib/public-site/premium-template-contract.ts";

export const AURORA_PREMIUM_TEMPLATE_CONTRACT = {
  templateKey: "aurora-wellness",
  contractVersion: "1.0",
  nativeSections: [{
    id: "hero", label: "Aurora hero", anchor: "aurora-hero", defaultOrder: 0, pinning: "start",
    capabilities: { visibility: true, reorder: false, reset: true }, visibilityAfterReset: "visible",
  }],
  customPages: { supported: true },
} satisfies PremiumTemplateContract;
