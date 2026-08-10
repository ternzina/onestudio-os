import { GLOSS_PREMIUM_TEMPLATE_CONTRACT } from "./gloss-premium-template-contract.ts";
import { NOIR_PREMIUM_TEMPLATE_CONTRACT } from "./noir-premium-template-contract.ts";
import { type PremiumTemplateKey } from "./premium-template-package-catalog.ts";
import { validatePremiumTemplateContractRegistry, type PremiumTemplateContract } from "./premium-template-contract.ts";

const definitions = {
  "gloss-nail-studio": GLOSS_PREMIUM_TEMPLATE_CONTRACT,
  "premium-studio": NOIR_PREMIUM_TEMPLATE_CONTRACT,
} satisfies Record<PremiumTemplateKey, PremiumTemplateContract>;

export const PREMIUM_TEMPLATE_DEFINITIONS = Object.values(definitions);
const registryErrors = validatePremiumTemplateContractRegistry(PREMIUM_TEMPLATE_DEFINITIONS);
if (registryErrors.length) throw new Error(`Invalid premium template registry: ${registryErrors.join("; ")}`);

export function getPremiumTemplateDefinition(templateKey: string | null | undefined): PremiumTemplateContract | undefined {
  return templateKey && templateKey in definitions ? definitions[templateKey as PremiumTemplateKey] : undefined;
}
