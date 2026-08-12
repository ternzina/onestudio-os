import dynamic from "next/dynamic.js";
import { LUMEA_PREMIUM_TEMPLATE_CONTRACT } from "./lumea-premium-template-contract.ts";
import type {
  PremiumTemplateCustomPageRendererProps,
  PremiumTemplateCustomPageRuntimeAdapter,
} from "./premium-template-custom-page-runtime-adapter.ts";

const LumeaCustomPage = dynamic<PremiumTemplateCustomPageRendererProps>(
  () => import("@/components/public/lumea/LumeaCustomPage"),
);

export const LUMEA_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER = {
  templateKey: "lumea-beauty",
  definition: LUMEA_PREMIUM_TEMPLATE_CONTRACT,
  customPageRenderer: LumeaCustomPage,
} satisfies PremiumTemplateCustomPageRuntimeAdapter;
