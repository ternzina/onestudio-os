import { GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "./gloss-premium-template-editor-adapter.ts";
import { NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER } from "./noir-premium-template-editor-adapter.ts";
import type { PremiumTemplateEditorAdapter } from "./premium-template-editor-adapter.ts";
import type { PremiumTemplateKey } from "./premium-template-package-catalog.ts";
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

const adapters = {
  "gloss-nail-studio": GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER,
  "premium-studio": NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER,
} satisfies Record<PremiumTemplateKey, PremiumTemplateEditorAdapter>;
export const PREMIUM_TEMPLATE_EDITOR_ADAPTERS = Object.values(adapters);
const errors = validatePremiumTemplateEditorAdapterRegistry(PREMIUM_TEMPLATE_EDITOR_ADAPTERS);
if (errors.length) throw new Error(`Invalid premium editor adapter registry: ${errors.join("; ")}`);

export function getPremiumTemplateEditorAdapter(templateKey: string | null | undefined): PremiumTemplateEditorAdapter | undefined {
  return templateKey && templateKey in adapters ? adapters[templateKey as PremiumTemplateKey] : undefined;
}
