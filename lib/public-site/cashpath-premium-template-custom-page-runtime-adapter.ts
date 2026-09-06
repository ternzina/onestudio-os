import PublicCustomPage from "@/components/public/PublicCustomPage";
import { createElement } from "react";
import { CASHPATH_PREMIUM_TEMPLATE_CONTRACT } from "./cashpath-premium-template-contract.ts";
import type { PremiumTemplateCustomPageRuntimeAdapter } from "./premium-template-custom-page-runtime-adapter.ts";
export const CASHPATH_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER = { templateKey: "cashpath", definition: CASHPATH_PREMIUM_TEMPLATE_CONTRACT, customPageRenderer: ({ site, page, basePath }) => createElement(PublicCustomPage, { site, page, basePath }) } satisfies PremiumTemplateCustomPageRuntimeAdapter;
