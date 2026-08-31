import type {
  PuckArrayField,
  PuckBoundedNestedArrayField,
  PuckBoundedNestedItem,
  PuckPrimitiveArrayItem,
  PuckPrimitiveField,
} from "./field-helpers";
import { bindMediaDefaults } from "./media-field-contract";

export type BoundedNestedItem = PuckBoundedNestedItem;
export type BoundedNestedChildContract = {
  slot: string;
  label: string;
  fields: Record<string, PuckPrimitiveField>;
  defaultItemProps?: PuckPrimitiveArrayItem;
  itemLabel(item: PuckPrimitiveArrayItem, index?: number): string;
};

/**
 * Serializable editor content with exactly one parent level and primitive
 * child records. A child field cannot itself contain another array.
 */
export type BoundedNestedContentContract = {
  slot: string;
  label: string;
  defaults: readonly object[];
  fields: Record<string, PuckPrimitiveField>;
  children: readonly BoundedNestedChildContract[];
  itemLabel(item: Record<string, unknown>, index?: number): string;
};

export function defineBoundedNestedContentContract(
  contract: BoundedNestedContentContract,
) {
  return contract;
}

/** Bind only serializable content metadata; event handlers never cross here. */
export function bindBoundedNestedContentContracts(
  contracts: readonly BoundedNestedContentContract[] | undefined,
  explicitFields: Record<string, unknown>,
  explicitDefaults: Record<string, unknown>,
) {
  const generatedFields: Record<string, PuckBoundedNestedArrayField> = {};
  const generatedDefaults: Record<string, unknown> = {};

  for (const contract of contracts ?? []) {
    if (contract.slot in explicitFields || contract.slot in explicitDefaults) continue;

    const childFields = Object.fromEntries(
      contract.children.map((child) => [
        child.slot,
        {
          type: "array",
          label: child.label,
          arrayFields: bindMediaDefaults(child.fields, contract.slot, contract.defaults),
          defaultItemProps: child.defaultItemProps,
          getItemSummary: child.itemLabel,
        } satisfies PuckArrayField,
      ]),
    );

    generatedFields[contract.slot] = {
      type: "array",
      label: contract.label,
      arrayFields: {
        ...bindMediaDefaults(contract.fields, contract.slot, contract.defaults),
        ...childFields,
      },
      getItemSummary: (item, index) => contract.itemLabel(item, index),
    };
    generatedDefaults[contract.slot] = contract.defaults;
  }

  return {
    fields: { ...generatedFields, ...explicitFields },
    defaults: { ...generatedDefaults, ...explicitDefaults },
  };
}
