import {
  validatePremiumTemplateContractRegistry,
  type PremiumTemplateContract,
} from "./premium-template-contract.ts";
import { NOIR_PREMIUM_TEMPLATE_CONTRACT } from "./noir-premium-template-contract.ts";

export const PREMIUM_TEMPLATE_DEFINITIONS = [
  NOIR_PREMIUM_TEMPLATE_CONTRACT,
] as const satisfies readonly PremiumTemplateContract[];

const registryErrors = validatePremiumTemplateContractRegistry(PREMIUM_TEMPLATE_DEFINITIONS);
if (registryErrors.length) {
  throw new Error(`Invalid premium template registry: ${registryErrors.join("; ")}`);
}

const definitionsByKey = new Map<string, PremiumTemplateContract>(
  PREMIUM_TEMPLATE_DEFINITIONS.map((definition) => [definition.templateKey, definition]),
);

export function getPremiumTemplateDefinition(templateKey: string | null | undefined) {
  return templateKey ? definitionsByKey.get(templateKey) : undefined;
}
