import dynamic from "next/dynamic.js";
import type { PremiumTemplateKey } from "./premium-template-package-catalog.ts";
import { createPremiumTemplateRuntimeResolver, validatePremiumTemplateRuntimeAdapterRegistry, type PremiumTemplateRuntimeAdapter, type PremiumTemplatePublicHomeRendererProps } from "./premium-template-runtime-adapter.ts";
import { getPremiumTemplateDefinition, PREMIUM_TEMPLATE_DEFINITIONS } from "./premium-template-registry.ts";

const GlossHome = dynamic<PremiumTemplatePublicHomeRendererProps>(() => import("@/components/public/GlossBusinessSite"));
const NoirHome = dynamic<PremiumTemplatePublicHomeRendererProps>(() => import("@/app/demos/premium-studio/PremiumStudioExperience"));
export const GLOSS_PREMIUM_TEMPLATE_RUNTIME_ADAPTER = { templateKey: "gloss-nail-studio", definition: getPremiumTemplateDefinition("gloss-nail-studio")!, publicHomeRenderer: GlossHome } satisfies PremiumTemplateRuntimeAdapter;
export const NOIR_PREMIUM_TEMPLATE_RUNTIME_ADAPTER = { templateKey: "premium-studio", definition: getPremiumTemplateDefinition("premium-studio")!, publicHomeRenderer: NoirHome } satisfies PremiumTemplateRuntimeAdapter;
const runtimes = { "gloss-nail-studio": GLOSS_PREMIUM_TEMPLATE_RUNTIME_ADAPTER, "premium-studio": NOIR_PREMIUM_TEMPLATE_RUNTIME_ADAPTER } satisfies Record<PremiumTemplateKey, PremiumTemplateRuntimeAdapter>;
export const PREMIUM_TEMPLATE_RUNTIME_ADAPTERS = Object.values(runtimes);
const errors = validatePremiumTemplateRuntimeAdapterRegistry(PREMIUM_TEMPLATE_RUNTIME_ADAPTERS, PREMIUM_TEMPLATE_DEFINITIONS, getPremiumTemplateDefinition);
if (errors.length) throw new Error(`Invalid premium public runtime registry: ${errors.join("; ")}`);
const resolveRuntime = createPremiumTemplateRuntimeResolver(PREMIUM_TEMPLATE_RUNTIME_ADAPTERS, getPremiumTemplateDefinition);
export function getPremiumTemplatePublicRuntime(templateKey: string | null | undefined) { return resolveRuntime(templateKey); }
