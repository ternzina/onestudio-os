import type { PremiumTemplateEditorAdapter } from "./premium-template-editor-adapter.ts";
import { getPremiumTemplateDefinition } from "./premium-template-registry.ts";
import {
  clearPremiumNativeActionStyles,
  withPremiumActionAppearances,
} from "./premium-action-style.ts";
import { createPremiumTemplateCompositionAdapter } from "./premium-template-composition.ts";

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

  const enhancedAdapters = adapters.map((adapter): PremiumTemplateEditorAdapter => {
    const buildInspectorFields = adapter.buildInspectorFields;
    const composition = adapter.contract.compositionMode === "canonical"
      ? createPremiumTemplateCompositionAdapter(adapter.contract)
      : null;
    return {
      ...adapter,
      ...(composition ?? {}),
      resetSection(content, sectionId) {
        return clearPremiumNativeActionStyles(
          adapter.resetSection(content, sectionId),
          adapter.templateKey,
          String(sectionId),
        );
      },
      restoreTemplate(content) {
        return clearPremiumNativeActionStyles(
          adapter.restoreTemplate(content),
          adapter.templateKey,
        );
      },
      buildInspectorFields(input) {
        return withPremiumActionAppearances({
          fields: buildInspectorFields(input),
          content: input.content,
          templateKey: adapter.templateKey,
          sectionId: String(input.sectionId),
          disabled: input.disabled,
          onChange: input.onChange,
        });
      },
    };
  });

  const byKey = new Map(
    enhancedAdapters.map((adapter) => [adapter.templateKey, adapter]),
  );
  return {
    adapters: enhancedAdapters,
    get: (templateKey: string | null | undefined) =>
      templateKey ? byKey.get(templateKey) : undefined,
  } as const;
}
