import { createElement } from "react";
import dynamic from "next/dynamic.js";
import { GLOSS_PREMIUM_TEMPLATE_CONTRACT } from "./gloss-premium-template-contract.ts";
import type { PremiumTemplateCustomPageRendererProps, PremiumTemplateCustomPageRuntimeAdapter } from "./premium-template-custom-page-runtime-adapter.ts";

const GlossPage = dynamic<PremiumTemplateCustomPageRendererProps>(() => import("@/components/public/PublicCustomPage"));

export const GLOSS_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER = {
  templateKey: GLOSS_PREMIUM_TEMPLATE_CONTRACT.templateKey,
  definition: GLOSS_PREMIUM_TEMPLATE_CONTRACT,
  customPageRenderer: (props: PremiumTemplateCustomPageRendererProps) => createElement(GlossPage, { ...props, brandTagline: "NAIL STUDIO" } as PremiumTemplateCustomPageRendererProps),
} satisfies PremiumTemplateCustomPageRuntimeAdapter;
