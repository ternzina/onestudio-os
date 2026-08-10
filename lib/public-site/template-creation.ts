import { getTemplateCatalogRecord, type TemplateCreationMode } from "./template-catalog.ts";
import { createTemplateSeed } from "./template-seeds.ts";

export function resolveCreationContract(input: { creation_mode: TemplateCreationMode; template_key?: string | null }) {
  const key = input.creation_mode === "blank" ? "standard" : input.template_key;
  const template = getTemplateCatalogRecord(key);
  if (!template || !template.capabilities.customerCreatable || (input.creation_mode === "blank" && !template.capabilities.createFromScratch)) {
    throw new Error("invalid_template_creation_contract");
  }
  return { creation_mode: input.creation_mode, template_key: template.key, seed: createTemplateSeed(template.key) } as const;
}
