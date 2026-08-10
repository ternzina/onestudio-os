import { validatePremiumTemplateContractRegistry, type PremiumTemplateContract } from "./premium-template-contract.ts";

export function createPremiumTemplateContractRegistry(contracts: readonly PremiumTemplateContract[]) {
  const errors = validatePremiumTemplateContractRegistry(contracts);
  if (errors.length) throw new Error(`Invalid premium template registry: ${errors.join("; ")}`);
  const byKey = new Map(contracts.map((contract) => [contract.templateKey, contract]));
  return { contracts, get: (templateKey: string | null | undefined) => templateKey ? byKey.get(templateKey) : undefined } as const;
}
