import { getTemplateCatalogRecord, type TemplateCreationMode } from "./template-catalog.ts";
import { createTemplateSeed } from "./template-seeds.ts";

export function resolveCreationContract(input: { creation_mode: TemplateCreationMode; template_key?: string | null; locales?: readonly string[] }) {
  const key = input.creation_mode === "blank" ? "standard" : input.template_key;
  const template = getTemplateCatalogRecord(key);
  if (!template || !template.capabilities.customerCreatable || (input.creation_mode === "blank" && !template.capabilities.createFromScratch)) {
    throw new Error("invalid_template_creation_contract");
  }
  const locales = [...new Set((input.locales ?? []).map((locale) => locale.trim().toLowerCase()).filter(Boolean))];
  const localizedSeeds = Object.fromEntries(locales.map((locale) => [locale, createTemplateSeed(template.key, locale)]));
  return {
    creation_mode: input.creation_mode,
    template_key: template.key,
    seed: createTemplateSeed(template.key, locales[0]),
    localizedSeeds,
  } as const;
}
