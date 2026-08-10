import type { ComponentType } from "react";
import type { PremiumTemplateContract } from "./premium-template-contract.ts";
import type { PublicSiteData, PublicSitePage } from "./types.ts";

export type PremiumTemplateCustomPageRendererProps = {
  site: PublicSiteData;
  page: PublicSitePage;
  basePath: string;
};

export type PremiumTemplateCustomPageRenderer =
  ComponentType<PremiumTemplateCustomPageRendererProps>;

export type PremiumTemplateCustomPageRuntimeAdapter = {
  templateKey: string;
  definition: PremiumTemplateContract;
  customPageRenderer: PremiumTemplateCustomPageRenderer;
};

export type PremiumTemplateCustomPageDefinitionLookup = (
  templateKey: string,
) => PremiumTemplateContract | undefined;

function validateAdapter(
  adapter: PremiumTemplateCustomPageRuntimeAdapter,
  index: number,
  definitionLookup: PremiumTemplateCustomPageDefinitionLookup,
): readonly string[] {
  const errors: string[] = [];
  if (adapter.templateKey !== adapter.definition.templateKey) {
    errors.push(`adapter[${index}] templateKey does not match definition templateKey`);
  }

  const canonicalDefinition = definitionLookup(adapter.templateKey);
  if (!canonicalDefinition) {
    errors.push(`adapter[${index}] has no premium definition for "${adapter.templateKey}"`);
    return errors;
  }

  const adapterSupportsCustomPages = adapter.definition.customPages?.supported === true;
  const canonicalSupportsCustomPages = canonicalDefinition.customPages?.supported === true;
  if (adapterSupportsCustomPages !== canonicalSupportsCustomPages) {
    errors.push(`adapter[${index}] custom-page capability is inconsistent with premium definition "${adapter.templateKey}"`);
  }
  if (!canonicalSupportsCustomPages) {
    errors.push(`adapter[${index}] registers a custom-page renderer for unsupported premium definition "${adapter.templateKey}"`);
  }
  return errors;
}

export function validatePremiumTemplateCustomPageRuntimeRegistry(
  adapters: readonly PremiumTemplateCustomPageRuntimeAdapter[],
  definitions: readonly PremiumTemplateContract[],
  definitionLookup: PremiumTemplateCustomPageDefinitionLookup,
): readonly string[] {
  const errors: string[] = [];
  const keys = new Set<string>();

  adapters.forEach((adapter, index) => {
    if (keys.has(adapter.templateKey)) {
      errors.push(`duplicate custom-page runtime templateKey "${adapter.templateKey}" at adapter[${index}]`);
    }
    keys.add(adapter.templateKey);
    errors.push(...validateAdapter(adapter, index, definitionLookup));
  });

  for (const definition of definitions) {
    if (definition.customPages?.supported === true && !keys.has(definition.templateKey)) {
      errors.push(`premium definition "${definition.templateKey}" supports custom pages but has no custom-page runtime adapter`);
    }
  }

  return errors;
}

export function createPremiumTemplateCustomPageRuntimeResolver(
  adapters: readonly PremiumTemplateCustomPageRuntimeAdapter[],
  definitionLookup: PremiumTemplateCustomPageDefinitionLookup,
) {
  const adaptersByKey = new Map<string, PremiumTemplateCustomPageRuntimeAdapter>();
  adapters.forEach((adapter, index) => {
    if (adaptersByKey.has(adapter.templateKey)) {
      throw new Error(`Duplicate premium custom-page runtime adapter for "${adapter.templateKey}"`);
    }
    const errors = validateAdapter(adapter, index, definitionLookup);
    if (errors.length) {
      throw new Error(`Invalid premium custom-page runtime adapter: ${errors.join("; ")}`);
    }
    adaptersByKey.set(adapter.templateKey, adapter);
  });

  return (templateKey: string | null | undefined) => {
    if (!templateKey) return undefined;
    const definition = definitionLookup(templateKey);
    if (!definition) return undefined;
    if (definition.customPages?.supported !== true) return undefined;
    const adapter = adaptersByKey.get(templateKey);
    if (!adapter) {
      throw new Error(`Premium template "${templateKey}" supports custom pages but is missing its custom-page runtime adapter`);
    }
    return adapter;
  };
}
