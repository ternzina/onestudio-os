import {
  PRODUCTION_EDITOR_FIELD_GROUPS,
  type ComponentEditorContract,
  type ProductionEditorField,
  type ProductionEditorFieldGroup,
  type ProductionEditorPrimitive,
  type ProductionEditorValue,
  resetEditorBlock,
  resetEditorField,
  resetEditorGroup,
} from "./builder-contract.ts";

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

export function productionFieldsByGroup(contract: ComponentEditorContract) {
  return PRODUCTION_PROPERTIES_GROUP_ORDER.map((group) => ({
    group,
    label: PRODUCTION_PROPERTIES_GROUP_LABELS[group],
    fields: contract.fields.filter((field) => field.group === group),
    arrays: contract.arrays.filter((array) => array.itemFields.some((field) => field.group === group)),
  }));
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
  const array = contract.arrays.find((candidate) => candidate.key === arrayKey);
  if (!array || !array.itemFields.some((field) => field.key === fieldKey)) throw new Error(`Unknown production editor array field: ${arrayKey}.${fieldKey}`);
  const current = props[array.path[0]];
  if (!Array.isArray(current) || !current[itemIndex] || typeof current[itemIndex] !== "object" || Array.isArray(current[itemIndex])) {
    throw new Error(`Invalid production editor array value: ${arrayKey}`);
  }
  const nextItems = current.map((item, index) => index === itemIndex ? { ...item, [fieldKey]: value } : clone(item));
  return setPath(props, array.path, nextItems);
}

export function resetProductionEditorField(
  props: Readonly<Record<string, ProductionEditorValue>>,
  contract: ComponentEditorContract,
  fieldKey: string,
) {
  return resetEditorField(props, contract, fieldKey);
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
