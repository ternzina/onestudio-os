import { assertValidPremiumTemplateContract, type PremiumTemplateContract } from "./premium-template-contract.ts";
export const CASHPATH_PREMIUM_TEMPLATE_CONTRACT = { templateKey: "cashpath", contractVersion: "1.0", compositionMode: "canonical", nativeSections: [
  { id: "hero", label: "Hero", anchor: "top", defaultOrder: 0, pinning: "start", capabilities: { visibility: true, reorder: false, reset: true }, visibilityAfterReset: "visible" },
  { id: "footer", label: "Footer", anchor: "footer", defaultOrder: 1, pinning: "end", capabilities: { visibility: true, reorder: false, reset: true }, visibilityAfterReset: "visible" },
], customPages: { supported: true }, internalRoutes: { supported: true, routeKinds: ["custom"] } } as const satisfies PremiumTemplateContract;
assertValidPremiumTemplateContract(CASHPATH_PREMIUM_TEMPLATE_CONTRACT);
export type CashPathNativeSectionId = (typeof CASHPATH_PREMIUM_TEMPLATE_CONTRACT.nativeSections)[number]["id"];
