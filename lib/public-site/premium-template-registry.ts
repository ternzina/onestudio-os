import {
  validatePremiumTemplateContractRegistry,
  type PremiumTemplateContract,
} from "./premium-template-contract.ts";
import { PREMIUM_TEMPLATE_PACKAGES, getPremiumTemplatePackage } from "./premium-template-package-catalog.ts";

/** Compatibility view derived from the package catalog. */
export const PREMIUM_TEMPLATE_DEFINITIONS = PREMIUM_TEMPLATE_PACKAGES.map(({ bindings }) => bindings.contract) satisfies readonly PremiumTemplateContract[];

const registryErrors = validatePremiumTemplateContractRegistry(PREMIUM_TEMPLATE_DEFINITIONS);
if (registryErrors.length) {
  throw new Error(`Invalid premium template registry: ${registryErrors.join("; ")}`);
}

export function getPremiumTemplateDefinition(templateKey: string | null | undefined) {
  return getPremiumTemplatePackage(templateKey)?.bindings.contract;
}
