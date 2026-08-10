import type { ComponentType } from "react";
import type { PremiumTemplateContract } from "./premium-template-contract.ts";
import type { PublicSiteData } from "./types.ts";

export type PremiumTemplatePublicHomeRendererProps = {
  site: PublicSiteData;
  basePath: string;
};

export type PremiumTemplatePublicHomeRenderer = ComponentType<PremiumTemplatePublicHomeRendererProps>;

export type PremiumTemplateRuntimeAdapter = {
  templateKey: string;
  definition: PremiumTemplateContract;
  publicHomeRenderer: PremiumTemplatePublicHomeRenderer;
};

export type PremiumTemplateDefinitionLookup = (
  templateKey: string,
) => PremiumTemplateContract | undefined;

export function validatePremiumTemplateRuntimeAdapterRegistry(
  adapters: readonly PremiumTemplateRuntimeAdapter[],
  definitions: readonly PremiumTemplateContract[],
  definitionLookup: PremiumTemplateDefinitionLookup,
): readonly string[] {
  const errors: string[] = [];
  const keys = new Set<string>();

  adapters.forEach((adapter, index) => {
    if (keys.has(adapter.templateKey)) {
      errors.push(`duplicate runtime templateKey "${adapter.templateKey}" at adapter[${index}]`);
    }
    keys.add(adapter.templateKey);

    if (adapter.templateKey !== adapter.definition.templateKey) {
      errors.push(`adapter[${index}] templateKey does not match definition templateKey`);
    }
    if (!definitionLookup(adapter.templateKey)) {
      errors.push(`adapter[${index}] has no premium definition for "${adapter.templateKey}"`);
    }
  });

  for (const definition of definitions) {
    if (!keys.has(definition.templateKey)) {
      errors.push(`premium definition "${definition.templateKey}" has no public runtime adapter`);
    }
  }

  return errors;
}

export function createPremiumTemplateRuntimeResolver(
  adapters: readonly PremiumTemplateRuntimeAdapter[],
  definitionLookup: PremiumTemplateDefinitionLookup,
) {
  const adaptersByKey = new Map<string, PremiumTemplateRuntimeAdapter>();
  for (const adapter of adapters) {
    if (adaptersByKey.has(adapter.templateKey)) {
      throw new Error(`Duplicate premium public runtime adapter for "${adapter.templateKey}"`);
    }
    if (adapter.templateKey !== adapter.definition.templateKey) {
      throw new Error(`Premium public runtime adapter "${adapter.templateKey}" does not match its definition`);
    }
    if (!definitionLookup(adapter.templateKey)) {
      throw new Error(`Premium public runtime adapter "${adapter.templateKey}" has no premium definition`);
    }
    adaptersByKey.set(adapter.templateKey, adapter);
  }

  return (templateKey: string | null | undefined) => {
    if (!templateKey) return undefined;
    const definition = definitionLookup(templateKey);
    if (!definition) return undefined;
    const adapter = adaptersByKey.get(templateKey);
    if (!adapter) {
      throw new Error(`Premium template "${templateKey}" is missing its public runtime adapter`);
    }
    return adapter;
  };
}
