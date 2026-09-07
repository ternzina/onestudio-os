import {
  PRODUCTION_EDITOR_FIELD_GROUPS,
  type ComponentEditorContract,
  type ProductionEditorArraySchema,
  type ProductionEditorField,
  type ProductionEditorFieldGroup,
  type ProductionEditorPrimitive,
  type ProductionEditorValue,
  resetEditorBlock,
  resetEditorField,
  resetEditorGroup,
} from "./builder-contract.ts";
import type {
  PuckProductionBackgroundCapability,
  PuckProductionTextColorCapability,
} from "./registry-manifest.ts";

export const PRODUCTION_SHARED_STYLE_FIELD_KEYS = ["backgroundColor", "textColor"] as const;

type ProductionSharedStyleFieldKey = (typeof PRODUCTION_SHARED_STYLE_FIELD_KEYS)[number];

const productionSharedStyleFieldMeta: Readonly<Record<ProductionSharedStyleFieldKey, { label: string }>> = {
  backgroundColor: { label: "Background" },
  textColor: { label: "Text color" },
};

export const PRODUCTION_SHARED_STYLE_FIELD_META = productionSharedStyleFieldMeta;

export const PRODUCTION_PROPERTIES_GROUP_LABELS: Readonly<Record<ProductionEditorFieldGroup, string>> = {
  CONTENT: "Содержание",
  MEDIA: "Медиа",
  ACTIONS: "Кнопки и ссылки",
  LAYOUT: "Макет",
  STYLE: "Стиль",
  MOTION: "Анимация",
  RESPONSIVE: "Адаптивность",
};

export const PRODUCTION_PROPERTIES_GROUP_ORDER = PRODUCTION_EDITOR_FIELD_GROUPS;

const emptyEditorContract = (componentId: string): ComponentEditorContract => ({
  componentId,
  defaultProps: {},
  fields: [],
  contentFields: [],
  mediaFields: [],
  actionFields: [],
  arrays: [],
  inlineFields: [],
});

export function productionPropertiesContract(
  componentId: string,
  contract: ComponentEditorContract | undefined,
  manifestDefaults: Readonly<Record<string, unknown>>,
  backgroundCapability?: PuckProductionBackgroundCapability,
  textColorCapability?: PuckProductionTextColorCapability,
): ComponentEditorContract {
  const base = contract ?? emptyEditorContract(componentId);
  const defaultProps = { ...base.defaultProps } as Record<string, ProductionEditorValue>;
  // A missing capability is intentionally unsupported. Common host props are
  // storage/layout data, not evidence that a source has a meaningful visual
  // override.
  const backgroundSupported = backgroundCapability?.supported === true;
  const textColorSupported = textColorCapability?.supported === true;
  const fields = base.fields.filter((field) =>
    (backgroundSupported || field.key !== "backgroundColor")
    && (textColorSupported || field.key !== "textColor"),
  );
  const existingKeys = new Set(fields.map((field) => field.key));

  const sharedStyleFields = PRODUCTION_SHARED_STYLE_FIELD_KEYS.filter((key) =>
    key === "backgroundColor" ? backgroundSupported : textColorSupported,
  );

  if (!backgroundSupported) delete defaultProps.backgroundColor;
  if (!textColorSupported) delete defaultProps.textColor;

  for (const key of sharedStyleFields) {
    const meta = productionSharedStyleFieldMeta[key];
    const originalValue = manifestDefaults[key];
    if (typeof originalValue !== "string") continue;
    if (!existingKeys.has(key)) {
      fields.push({
        key,
        path: [key],
        group: "STYLE",
        label: meta.label,
        type: "color",
        originalValue,
        inlineEditable: false,
        mediaEligible: false,
        resettable: true,
      });
      existingKeys.add(key);
    }
    if (!(key in defaultProps)) defaultProps[key] = originalValue;
  }

  const nativePuckFields = [
    ...(backgroundSupported ? ["backgroundColor"] : []),
    ...(textColorSupported ? ["textColor"] : []),
    ...(base.nativePuck?.fields ?? []).filter((key) =>
      !PRODUCTION_SHARED_STYLE_FIELD_KEYS.includes(key as ProductionSharedStyleFieldKey),
    ),
  ];

  return {
    ...base,
    defaultProps,
    fields,
    nativePuck: {
      ...base.nativePuck,
      fields: nativePuckFields,
    },
  };
}

/**
 * Keeps the transitional Properties UX focused on fields it still owns. The
 * canonical contract and defaults remain intact so reset actions can restore
 * native Puck fields as part of the same component reset.
 */
export function productionPropertiesContractForManualPanel(contract: ComponentEditorContract): ComponentEditorContract {
  const nativeFields = new Set(contract.nativePuck?.fields ?? []);
  const nativeArrays = new Set(contract.nativePuck?.arrays ?? []);
  const manualFields = contract.fields.filter((field) => !nativeFields.has(field.key));
  const manualArrays = contract.arrays.filter((array) => !nativeArrays.has(array.key));
  const manualFieldKeys = new Set(manualFields.map((field) => field.key));

  return {
    ...contract,
    fields: manualFields,
    contentFields: contract.contentFields.filter((fieldKey) => manualFieldKeys.has(fieldKey)),
    mediaFields: contract.mediaFields.filter((field) => manualFieldKeys.has(field.fieldKey)),
    actionFields: contract.actionFields.filter((fieldKey) => manualFieldKeys.has(fieldKey)),
    arrays: manualArrays,
    inlineFields: contract.inlineFields.filter((field) => manualFieldKeys.has(field.fieldKey)),
  };
}

function clone(value: ProductionEditorValue): ProductionEditorValue {
  if (Array.isArray(value)) return value.map(clone);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
  return value;
}

function setPath(
  props: Readonly<Record<string, ProductionEditorValue>>,
  path: readonly string[],
  value: ProductionEditorValue,
) {
  const next = Object.fromEntries(Object.entries(props).map(([key, item]) => [key, clone(item)]));
  let target = next;
  for (const segment of path.slice(0, -1)) {
    const current = target[segment];
    target[segment] = current && typeof current === "object" && !Array.isArray(current) ? { ...current } : {};
    target = target[segment] as Record<string, ProductionEditorValue>;
  }
  target[path[path.length - 1]] = clone(value);
  return next;
}

function arrayFor(props: Readonly<Record<string, ProductionEditorValue>>, array: ProductionEditorArraySchema) {
  const value = getPathValue(props, array.path);
  return Array.isArray(value) ? value : undefined;
}

function getPathValue(props: Readonly<Record<string, ProductionEditorValue>>, path: readonly string[]) {
  let value: ProductionEditorValue | undefined = props;
  for (const segment of path) {
    if (!value || Array.isArray(value) || typeof value !== "object") return undefined;
    value = (value as Readonly<Record<string, ProductionEditorValue>>)[segment];
  }
  return value;
}

function findArray(contract: ComponentEditorContract, key: string) {
  const array = contract.arrays.find((candidate) => candidate.key === key);
  if (!array) throw new Error(`Unknown production editor array: ${key}`);
  return array;
}

export function productionFieldsByGroup(contract: ComponentEditorContract) {
  return PRODUCTION_PROPERTIES_GROUP_ORDER.map((group) => ({
    group,
    label: PRODUCTION_PROPERTIES_GROUP_LABELS[group],
    fields: contract.fields.filter((field) => field.group === group),
    arrays: contract.arrays.filter((array) => array.itemFields.some((field) => field.group === group)),
  }));
}

/** Resolves native Puck fields to the same canonical semantic group metadata. */
export function productionNativeFieldGroup(
  contract: ComponentEditorContract,
  fieldName: string,
): ProductionEditorFieldGroup | undefined {
  if (contract.nativePuck?.arrays?.includes(fieldName)) {
    return contract.arrays.find((array) => array.key === fieldName)?.group;
  }
  if (!contract.nativePuck?.fields?.includes(fieldName)) return undefined;
  return contract.fields.find((field) => field.key === fieldName)?.group;
}

export function filterProductionEditorContract(contract: ComponentEditorContract, query: string) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return contract;
  const matches = (value: string) => value.toLocaleLowerCase().includes(normalized);
  const arrays = contract.arrays.flatMap((array) => {
    const arrayMatches = matches(array.label)
      || matches(array.group)
      || matches(PRODUCTION_PROPERTIES_GROUP_LABELS[array.group]);
    if (arrayMatches) return [array];
    const itemFields = array.itemFields.filter((field) =>
      matches(field.label)
      || matches(field.group)
      || matches(PRODUCTION_PROPERTIES_GROUP_LABELS[field.group]));
    return itemFields.length ? [{ ...array, itemFields }] : [];
  });
  return {
    ...contract,
    fields: contract.fields.filter((field) => matches(field.label) || matches(field.group) || matches(PRODUCTION_PROPERTIES_GROUP_LABELS[field.group])),
    arrays,
  };
}

function fieldForKey(contract: ComponentEditorContract, fieldKey: string): ProductionEditorField {
  const field = contract.fields.find((candidate) => candidate.key === fieldKey);
  if (!field) throw new Error(`Unknown production editor field: ${fieldKey}`);
  return field;
}

export function updateProductionEditorField(
  props: Readonly<Record<string, ProductionEditorValue>>,
  contract: ComponentEditorContract,
  fieldKey: string,
  value: ProductionEditorPrimitive,
) {
  const field = fieldForKey(contract, fieldKey);
  return setPath(props, field.path, value);
}

export function updateProductionEditorArrayItem(
  props: Readonly<Record<string, ProductionEditorValue>>,
  contract: ComponentEditorContract,
  arrayKey: string,
  itemIndex: number,
  fieldKey: string,
  value: ProductionEditorPrimitive,
) {
  const array = findArray(contract, arrayKey);
  if (!array.itemFields.some((field) => field.key === fieldKey)) throw new Error(`Unknown production editor array field: ${arrayKey}.${fieldKey}`);
  const current = arrayFor(props, array);
  if (!Array.isArray(current) || !current[itemIndex] || typeof current[itemIndex] !== "object" || Array.isArray(current[itemIndex])) {
    throw new Error(`Invalid production editor array value: ${arrayKey}`);
  }
  const nextItems = current.map((item, index) => index === itemIndex ? { ...item, [fieldKey]: value } : clone(item));
  return setPath(props, array.path, nextItems);
}

export function addProductionEditorArrayItem(props: Readonly<Record<string, ProductionEditorValue>>, contract: ComponentEditorContract, arrayKey: string) {
  const array = findArray(contract, arrayKey);
  const current = arrayFor(props, array) ?? [];
  const template = array.defaultItems[0] ?? {};
  const next = { ...template } as Record<string, ProductionEditorValue>;
  return setPath(props, array.path, [...current, next]);
}

export function removeProductionEditorArrayItem(props: Readonly<Record<string, ProductionEditorValue>>, contract: ComponentEditorContract, arrayKey: string, itemIndex: number) {
  const array = findArray(contract, arrayKey);
  const current = arrayFor(props, array);
  if (!current || itemIndex < 0 || itemIndex >= current.length) throw new Error(`Invalid production editor array index: ${arrayKey}`);
  return setPath(props, array.path, current.filter((_, index) => index !== itemIndex));
}

export function reorderProductionEditorArrayItem(props: Readonly<Record<string, ProductionEditorValue>>, contract: ComponentEditorContract, arrayKey: string, fromIndex: number, toIndex: number) {
  const array = findArray(contract, arrayKey);
  const current = arrayFor(props, array);
  if (!current || fromIndex < 0 || fromIndex >= current.length || toIndex < 0 || toIndex >= current.length) throw new Error(`Invalid production editor array index: ${arrayKey}`);
  const next = [...current];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return setPath(props, array.path, next);
}

export function resetProductionEditorField(
  props: Readonly<Record<string, ProductionEditorValue>>,
  contract: ComponentEditorContract,
  fieldKey: string,
) {
  return resetEditorField(props, contract, fieldKey);
}

export function resolveOriginalFieldValue(contract: ComponentEditorContract, fieldKey: string): ProductionEditorValue | undefined {
  const field = contract.fields.find((candidate) => candidate.key === fieldKey);
  if (!field || !field.resettable) return undefined;
  return field.originalValue !== undefined ? clone(field.originalValue) : getPathValue(contract.defaultProps, field.path);
}

export function resetProductionEditorArray(props: Readonly<Record<string, ProductionEditorValue>>, contract: ComponentEditorContract, arrayKey: string) {
  const array = findArray(contract, arrayKey);
  const defaults = getPathValue(contract.defaultProps, array.path);
  if (!Array.isArray(defaults)) return Object.fromEntries(Object.entries(props).map(([key, value]) => [key, clone(value)]));
  return setPath(props, array.path, defaults);
}

export function resetProductionEditorGroup(
  props: Readonly<Record<string, ProductionEditorValue>>,
  contract: ComponentEditorContract,
  group: ProductionEditorFieldGroup,
) {
  return resetEditorGroup(props, contract, group);
}

export function resetProductionEditorBlock(
  props: Readonly<Record<string, ProductionEditorValue>>,
  contract: ComponentEditorContract,
) {
  return resetEditorBlock(props, contract);
}
