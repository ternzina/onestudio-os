import { createElement } from "react";
import dynamic from "next/dynamic.js";
import type { PremiumTemplateKey } from "./premium-template-package-catalog.ts";
import { createPremiumTemplateCustomPageRuntimeResolver, validatePremiumTemplateCustomPageRuntimeRegistry, type PremiumTemplateCustomPageRuntimeAdapter, type PremiumTemplateCustomPageRendererProps } from "./premium-template-custom-page-runtime-adapter.ts";
import { getPremiumTemplateDefinition, PREMIUM_TEMPLATE_DEFINITIONS } from "./premium-template-registry.ts";

const GlossPage = dynamic<PremiumTemplateCustomPageRendererProps>(() => import("@/components/public/PublicCustomPage"));
const NoirPage = dynamic<PremiumTemplateCustomPageRendererProps>(() => import("@/components/public/NoirCustomPage"));
export const GLOSS_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER = { templateKey: "gloss-nail-studio", definition: getPremiumTemplateDefinition("gloss-nail-studio")!, customPageRenderer: (props: PremiumTemplateCustomPageRendererProps) => createElement(GlossPage, { ...props, brandTagline: "NAIL STUDIO" } as PremiumTemplateCustomPageRendererProps) } satisfies PremiumTemplateCustomPageRuntimeAdapter;
export const NOIR_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER = { templateKey: "premium-studio", definition: getPremiumTemplateDefinition("premium-studio")!, customPageRenderer: NoirPage } satisfies PremiumTemplateCustomPageRuntimeAdapter;
const runtimes = { "gloss-nail-studio": GLOSS_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER, "premium-studio": NOIR_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER } satisfies Record<PremiumTemplateKey, PremiumTemplateCustomPageRuntimeAdapter>;
export const PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTERS = Object.values(runtimes);
const errors = validatePremiumTemplateCustomPageRuntimeRegistry(PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTERS, PREMIUM_TEMPLATE_DEFINITIONS, getPremiumTemplateDefinition);
if (errors.length) throw new Error(`Invalid premium custom-page runtime registry: ${errors.join("; ")}`);
const resolveRuntime = createPremiumTemplateCustomPageRuntimeResolver(PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTERS, getPremiumTemplateDefinition);
export function getPremiumTemplateCustomPageRuntime(templateKey: string | null | undefined) { return resolveRuntime(templateKey); }
