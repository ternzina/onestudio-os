import { NOIR_PREMIUM_TEMPLATE_RUNTIME_ADAPTER } from "./noir-premium-template-runtime-adapter";
import { GLOSS_PREMIUM_TEMPLATE_RUNTIME_ADAPTER } from "./gloss-premium-template-runtime-adapter";
import {
  createPremiumTemplateRuntimeResolver,
  validatePremiumTemplateRuntimeAdapterRegistry,
  type PremiumTemplateRuntimeAdapter,
} from "./premium-template-runtime-adapter";
import {
  getPremiumTemplateDefinition,
  PREMIUM_TEMPLATE_DEFINITIONS,
} from "./premium-template-registry";

export const PREMIUM_TEMPLATE_RUNTIME_ADAPTERS = [
  GLOSS_PREMIUM_TEMPLATE_RUNTIME_ADAPTER,
  NOIR_PREMIUM_TEMPLATE_RUNTIME_ADAPTER,
] as const satisfies readonly PremiumTemplateRuntimeAdapter[];

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
