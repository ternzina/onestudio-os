import type { PuckArrayField, PuckPrimitiveArrayItem } from "./field-helpers";

export type PrimitiveArrayItem = PuckPrimitiveArrayItem;

/** Metadata-only contract for serializable, editor-owned repeated content. */
export type ArrayItemsContract<Item extends PrimitiveArrayItem> = {
  slot: string;
  label: string;
  defaults: readonly Item[];
  fields: PuckArrayField["arrayFields"];
  itemLabel(item: Item, index?: number): string;
};

export function defineArrayItemsContract<Item extends PrimitiveArrayItem>(
  contract: ArrayItemsContract<Item>,
) {
  return contract;
}

/**
 * Bind editor metadata without replacing explicit registry fields. Explicit
 * fields/defaults win on conflicts, so existing contracts stay stable.
 */
export function bindArrayItemsContracts(
  contracts: readonly ArrayItemsContract<PrimitiveArrayItem>[] | undefined,
  explicitFields: Record<string, unknown>,
  explicitDefaults: Record<string, unknown>,
) {
  const generatedFields: Record<string, PuckArrayField> = {};
  const generatedDefaults: Record<string, unknown> = {};
  for (const contract of contracts ?? []) {
    if (contract.slot in explicitFields || contract.slot in explicitDefaults) continue;
    generatedFields[contract.slot] = {
      type: "array",
      label: contract.label,
      arrayFields: contract.fields,
      getItemSummary: contract.itemLabel,
    };
    generatedDefaults[contract.slot] = contract.defaults;
  }
  return { fields: { ...generatedFields, ...explicitFields }, defaults: { ...generatedDefaults, ...explicitDefaults } };
}
