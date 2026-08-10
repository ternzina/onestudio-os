import { PREMIUM_TEMPLATE_PACKAGES } from "./premium-template-package-catalog";
import {
  createPremiumTemplateRuntimeResolver,
  validatePremiumTemplateRuntimeAdapterRegistry,
  type PremiumTemplateRuntimeAdapter,
} from "./premium-template-runtime-adapter";
import {
  getPremiumTemplateDefinition,
  PREMIUM_TEMPLATE_DEFINITIONS,
} from "./premium-template-registry";

/** Compatibility view derived from package bindings (formerly NOIR_PREMIUM_TEMPLATE_RUNTIME_ADAPTER and GLOSS_PREMIUM_TEMPLATE_RUNTIME_ADAPTER registrations). */
export const PREMIUM_TEMPLATE_RUNTIME_ADAPTERS = PREMIUM_TEMPLATE_PACKAGES.map(({ bindings }) => bindings.publicHome) satisfies readonly PremiumTemplateRuntimeAdapter[];

const registryErrors = validatePremiumTemplateRuntimeAdapterRegistry(
  PREMIUM_TEMPLATE_RUNTIME_ADAPTERS,
  PREMIUM_TEMPLATE_DEFINITIONS,
  getPremiumTemplateDefinition,
);
if (registryErrors.length) {
  throw new Error(`Invalid premium public runtime registry: ${registryErrors.join("; ")}`);
}

const resolveRuntime = createPremiumTemplateRuntimeResolver(
  PREMIUM_TEMPLATE_RUNTIME_ADAPTERS,
  getPremiumTemplateDefinition,
);

export function getPremiumTemplatePublicRuntime(templateKey: string | null | undefined) {
  return resolveRuntime(templateKey);
}
