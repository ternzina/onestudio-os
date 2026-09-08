import { createElement, type ReactElement } from "react";
import type { Field } from "@puckeditor/core";
import type {
  ComponentEditorContract,
  ProductionEditorArrayItemField,
  ProductionEditorArraySchema,
  ProductionEditorField,
} from "./builder-contract.ts";
import type { PuckPropRule, PuckRegistryManifestEntry } from "./registry-manifest.ts";
import { productionPropertiesContract } from "./builder-properties.ts";
import { ProductionColorInput } from "../../components/puck-site-editor/production-color-field.ts";

type ContractField = ProductionEditorField | ProductionEditorArrayItemField;

function getContractValue(value: Readonly<Record<string, unknown>>, path: readonly string[]) {
  let current: unknown = value;
  for (const segment of path) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    if (!Object.prototype.hasOwnProperty.call(current, segment)) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function nativeFieldForContractField(field: ContractField, defaultValue?: unknown): Field {
  if (field.type === "boolean") {
    return {
      type: "radio",
      label: field.label,
      options: [
        { label: "Yes", value: true },
        { label: "No", value: false },
      ],
    };
  }
  if (field.type === "number") return { type: "number", label: field.label, min: field.min, max: field.max, step: field.step };
  if (field.type === "select") {
    return { type: "select", label: field.label, options: field.options?.map((option) => ({ label: option.label, value: option.value })) ?? [] };
  }
  if (field.type === "textarea") return { type: "textarea", label: field.label };
  if (field.type === "text") return { type: "text", label: field.label };
  if (field.type === "color") {
    return {
      type: "custom",
      label: field.label,
      render: ({ id, value, onChange, readOnly }): ReactElement => createElement(ProductionColorInput, {
        id,
        label: field.label,
        value: value === undefined ? defaultValue : value,
        onChange,
        readOnly,
      }),
    };
  }

  // Puck 0.23.0 has no native media field. Media and URL contract values are
  // still serializable native text fields, so Puck owns their lifecycle.
  return { type: "text", label: field.label };
}

function nativeArrayFieldForContract(
  array: ProductionEditorArraySchema,
  rule: PuckPropRule | undefined,
): Field {
  if (!rule || rule.kind !== "array") {
    throw new Error(`Native Puck array requires an array prop rule: ${array.key}`);
  }

  const arrayFields = Object.fromEntries(
    array.itemFields.map((field) => [field.key, nativeFieldForContractField(field)]),
  );

  return {
    type: "array",
    label: array.label,
    arrayFields,
    max: rule.maxItems,
    defaultItemProps: (index: number) => {
      const defaultItem = array.defaultItems[index] ?? array.defaultItems[0];
      return defaultItem ? structuredClone(defaultItem) : {};
    },
    getItemSummary: (item, index) => {
      const candidate = item as Record<string, unknown>;
      return String(candidate.title ?? candidate.label ?? `${array.itemLabel} ${Number(index ?? 0) + 1}`);
    },
  };
}

export function nativePuckFieldKeys(contract: ComponentEditorContract | undefined) {
  return {
    fields: new Set(contract?.nativePuck?.fields ?? []),
    arrays: new Set(contract?.nativePuck?.arrays ?? []),
  };
}

/**
 * Converts the canonical shared style fields plus contract-declared native
 * ownership slices into actual Puck field definitions. Other contract fields
 * remain available to the transitional OneStudio Properties UX until a later
 * convergence phase.
 */
export function buildNativePuckFields(
  entry: Pick<PuckRegistryManifestEntry, "id" | "editorContract" | "props" | "defaults">
    & Partial<Pick<PuckRegistryManifestEntry, "backgroundCapability" | "textColorCapability">>,
): Record<string, Field> {
  const contract = productionPropertiesContract(
    entry.id,
    entry.editorContract,
    entry.defaults,
    entry.backgroundCapability,
    entry.textColorCapability,
  );
  const ownership = nativePuckFieldKeys(contract);

  const fields: Record<string, Field> = {};
  for (const field of contract.fields) {
    if (ownership.fields.has(field.key)) fields[field.key] = nativeFieldForContractField(field, getContractValue(contract.defaultProps, field.path));
  }
  for (const array of contract.arrays) {
    if (ownership.arrays.has(array.key)) fields[array.key] = nativeArrayFieldForContract(array, entry.props[array.key]);
  }
  return fields;
}
