import { NOIR_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER } from "./noir-premium-template-custom-page-runtime-adapter";
import { GLOSS_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER } from "./gloss-premium-template-custom-page-runtime-adapter";
import {
  createPremiumTemplateCustomPageRuntimeResolver,
  validatePremiumTemplateCustomPageRuntimeRegistry,
  type PremiumTemplateCustomPageRuntimeAdapter,
} from "./premium-template-custom-page-runtime-adapter";
import {
  getPremiumTemplateDefinition,
  PREMIUM_TEMPLATE_DEFINITIONS,
} from "./premium-template-registry";

export const PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTERS = [
  GLOSS_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER,
  NOIR_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER,
] as const satisfies readonly PremiumTemplateCustomPageRuntimeAdapter[];

const registryErrors = validatePremiumTemplateCustomPageRuntimeRegistry(
  PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTERS,
  PREMIUM_TEMPLATE_DEFINITIONS,
  getPremiumTemplateDefinition,
);
if (registryErrors.length) {
  throw new Error(`Invalid premium custom-page runtime registry: ${registryErrors.join("; ")}`);
}

const resolveRuntime = createPremiumTemplateCustomPageRuntimeResolver(
  PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTERS,
  getPremiumTemplateDefinition,
);

export function getPremiumTemplateCustomPageRuntime(templateKey: string | null | undefined) {
  return resolveRuntime(templateKey);
}
