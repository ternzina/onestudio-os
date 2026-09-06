import CashPathSite from "@/components/public/cashpath/CashPathSite";
import { CASHPATH_PREMIUM_TEMPLATE_CONTRACT } from "./cashpath-premium-template-contract.ts";
import type { PremiumTemplateRuntimeAdapter } from "./premium-template-runtime-adapter.ts";
export const CASHPATH_PREMIUM_TEMPLATE_RUNTIME_ADAPTER = { templateKey: "cashpath", definition: CASHPATH_PREMIUM_TEMPLATE_CONTRACT, publicHomeRenderer: CashPathSite } satisfies PremiumTemplateRuntimeAdapter;
