import { PREMIUM_TEMPLATE_DEFINITIONS, getPremiumTemplateDefinition } from "./premium-template-registry.ts";
import { createPremiumTemplateRuntimeResolver, validatePremiumTemplateRuntimeAdapterRegistry, type PremiumTemplateRuntimeAdapter } from "./premium-template-runtime-adapter.ts";

export function createPremiumTemplatePublicRuntimeRegistry(
  runtimes: readonly PremiumTemplateRuntimeAdapter[],
  definitions = PREMIUM_TEMPLATE_DEFINITIONS,
  definitionLookup = getPremiumTemplateDefinition,
) {
  const errors = validatePremiumTemplateRuntimeAdapterRegistry(runtimes, definitions, definitionLookup);
  if (errors.length) throw new Error(`Invalid premium public runtime registry: ${errors.join("; ")}`);
  return { runtimes, get: createPremiumTemplateRuntimeResolver(runtimes, definitionLookup) } as const;
}
