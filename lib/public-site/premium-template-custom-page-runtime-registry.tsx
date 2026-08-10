import { PREMIUM_TEMPLATE_PACKAGES } from "./premium-template-package-catalog";
import {
  createPremiumTemplateCustomPageRuntimeResolver,
  validatePremiumTemplateCustomPageRuntimeRegistry,
  type PremiumTemplateCustomPageRuntimeAdapter,
} from "./premium-template-custom-page-runtime-adapter";
import {
  getPremiumTemplateDefinition,
  PREMIUM_TEMPLATE_DEFINITIONS,
} from "./premium-template-registry";

/** Compatibility view derived from package bindings (formerly NOIR_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER and GLOSS_PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTER registrations). */
export const PREMIUM_TEMPLATE_CUSTOM_PAGE_RUNTIME_ADAPTERS = PREMIUM_TEMPLATE_PACKAGES.map(({ bindings }) => bindings.customPage) satisfies readonly PremiumTemplateCustomPageRuntimeAdapter[];

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
