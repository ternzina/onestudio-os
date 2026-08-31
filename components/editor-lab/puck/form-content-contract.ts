import type {
  PuckMediaField,
  PuckTextField,
} from "./field-helpers";
import { fields } from "./field-helpers";

export type FormContentFieldType = "text" | "textarea" | "mediaUrl";

export type FormContentSlot = {
  slot: string;
  label: string;
  type: FormContentFieldType;
  defaultValue: string;
};

/** Metadata-only contract for editor-owned, serializable form copy. */
export type FormContentContract = {
  slots: readonly FormContentSlot[];
};

export function defineFormContentContract(contract: FormContentContract) {
  return contract;
}

type FormContentField = PuckTextField | PuckMediaField;

function createField(slot: FormContentSlot): FormContentField {
  if (slot.type === "textarea") {
    return fields.textarea(slot.label, { contentEditable: false });
  }
  if (slot.type === "mediaUrl") {
    return fields.imageUrl(slot.label);
  }
  return fields.text(slot.label, { contentEditable: false });
}

/**
 * Materialize form-copy metadata at the generic Puck boundary. Explicit
 * registry fields/defaults win so existing contracts remain stable.
 */
export function bindFormContentContract(
  contract: FormContentContract | undefined,
  explicitFields: Record<string, unknown>,
  explicitDefaults: Record<string, unknown>,
) {
  const generatedFields: Record<string, FormContentField> = {};
  const generatedDefaults: Record<string, string> = {};

  for (const slot of contract?.slots ?? []) {
    if (slot.slot in explicitFields || slot.slot in explicitDefaults) continue;
    generatedFields[slot.slot] = createField(slot);
    generatedDefaults[slot.slot] = slot.defaultValue;
  }

  return {
    fields: { ...generatedFields, ...explicitFields },
    defaults: { ...generatedDefaults, ...explicitDefaults },
  };
}
