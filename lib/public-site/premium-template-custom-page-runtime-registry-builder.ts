import { PREMIUM_TEMPLATE_DEFINITIONS, getPremiumTemplateDefinition } from "./premium-template-registry.ts";
import { createPremiumTemplateCustomPageRuntimeResolver, validatePremiumTemplateCustomPageRuntimeRegistry, type PremiumTemplateCustomPageRuntimeAdapter } from "./premium-template-custom-page-runtime-adapter.ts";

export function createPremiumTemplateCustomPageRuntimeRegistry(
  runtimes: readonly PremiumTemplateCustomPageRuntimeAdapter[],
  definitions = PREMIUM_TEMPLATE_DEFINITIONS,
  definitionLookup = getPremiumTemplateDefinition,
) {
  const errors = validatePremiumTemplateCustomPageRuntimeRegistry(runtimes, definitions, definitionLookup);
  if (errors.length) throw new Error(`Invalid premium custom-page runtime registry: ${errors.join("; ")}`);
  return { runtimes, get: createPremiumTemplateCustomPageRuntimeResolver(runtimes, definitionLookup) } as const;
}
