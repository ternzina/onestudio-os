import type { PremiumTemplateEditorAdapter } from "./premium-template-editor-adapter.ts";
import { PREMIUM_TEMPLATE_PACKAGES, getPremiumTemplatePackage } from "./premium-template-package-catalog.ts";
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

/** Compatibility view derived from the package catalog. */
export const PREMIUM_TEMPLATE_EDITOR_ADAPTERS = PREMIUM_TEMPLATE_PACKAGES.map(({ bindings }) => bindings.editor) satisfies readonly PremiumTemplateEditorAdapter[];

const registryErrors = validatePremiumTemplateEditorAdapterRegistry(PREMIUM_TEMPLATE_EDITOR_ADAPTERS);
if (registryErrors.length) throw new Error(`Invalid premium editor adapter registry: ${registryErrors.join("; ")}`);

export function getPremiumTemplateEditorAdapter(templateKey: string | null | undefined) {
  return getPremiumTemplatePackage(templateKey)?.bindings.editor;
}
