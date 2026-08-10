import type { PremiumTemplateEditorAdapter } from "./premium-template-editor-adapter.ts";
import { getPremiumTemplateDefinition } from "./premium-template-registry.ts";

export function validatePremiumTemplateEditorAdapterRegistry(
  adapters: readonly PremiumTemplateEditorAdapter[],
  definitionLookup: (templateKey: string) => { templateKey: string } | undefined = getPremiumTemplateDefinition,
): readonly string[] {
  const errors: string[] = [];
  const keys = new Set<string>();
  adapters.forEach((adapter, index) => {
    if (keys.has(adapter.templateKey)) errors.push(`duplicate adapter templateKey "${adapter.templateKey}" at adapter[${index}]`);
    keys.add(adapter.templateKey);
    if (adapter.templateKey !== adapter.contract.templateKey) errors.push(`adapter[${index}] templateKey does not match contract templateKey`);
    if (!definitionLookup(adapter.templateKey)) errors.push(`adapter[${index}] has no premium definition for "${adapter.templateKey}"`);
  });
  return errors;
}

export function createPremiumTemplateEditorRegistry(
  adapters: readonly PremiumTemplateEditorAdapter[],
  definitionLookup: (templateKey: string) => { templateKey: string } | undefined = getPremiumTemplateDefinition,
) {
  const errors = validatePremiumTemplateEditorAdapterRegistry(adapters, definitionLookup);
  if (errors.length) throw new Error(`Invalid premium editor adapter registry: ${errors.join("; ")}`);
  const byKey = new Map(adapters.map((adapter) => [adapter.templateKey, adapter]));
  return { adapters, get: (templateKey: string | null | undefined) => templateKey ? byKey.get(templateKey) : undefined } as const;
}
