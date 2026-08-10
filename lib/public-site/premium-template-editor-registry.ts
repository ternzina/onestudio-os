import type { PremiumTemplateEditorAdapter } from "./premium-template-editor-adapter.ts";
import { NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "./noir-premium-template-editor-adapter.ts";
import { GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "./gloss-premium-template-editor-adapter.ts";
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
    if (adapter.templateKey !== adapter.contract.templateKey) {
      errors.push(`adapter[${index}] templateKey does not match contract templateKey`);
    }
    if (!definitionLookup(adapter.templateKey)) {
      errors.push(`adapter[${index}] has no premium definition for "${adapter.templateKey}"`);
    }
  });
  return errors;
}

export const PREMIUM_TEMPLATE_EDITOR_ADAPTERS = [
  GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER,
  NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER,
] as const satisfies readonly PremiumTemplateEditorAdapter[];

const registryErrors = validatePremiumTemplateEditorAdapterRegistry(PREMIUM_TEMPLATE_EDITOR_ADAPTERS);
if (registryErrors.length) throw new Error(`Invalid premium editor adapter registry: ${registryErrors.join("; ")}`);

const adaptersByKey = new Map<string, PremiumTemplateEditorAdapter>(
  PREMIUM_TEMPLATE_EDITOR_ADAPTERS.map((adapter) => [adapter.templateKey, adapter]),
);

export function getPremiumTemplateEditorAdapter(templateKey: string | null | undefined) {
  return templateKey ? adaptersByKey.get(templateKey) : undefined;
}
