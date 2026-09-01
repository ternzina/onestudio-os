export const PRODUCTION_EDITOR_FIELD_TYPES = [
  "text",
  "textarea",
  "number",
  "boolean",
  "select",
  "color",
  "url",
  "media",
] as const;

export const PRODUCTION_EDITOR_FIELD_GROUPS = [
  "CONTENT",
  "MEDIA",
  "ACTIONS",
  "LAYOUT",
  "STYLE",
  "MOTION",
  "RESPONSIVE",
] as const;

export type ProductionEditorFieldType = (typeof PRODUCTION_EDITOR_FIELD_TYPES)[number];
export type ProductionEditorFieldGroup = (typeof PRODUCTION_EDITOR_FIELD_GROUPS)[number];
export type ProductionEditorPrimitive = string | number | boolean | null;
export type ProductionEditorValue =
  | ProductionEditorPrimitive
  | readonly ProductionEditorValue[]
  | { readonly [key: string]: ProductionEditorValue };

export type ProductionEditorField = {
  key: string;
  path: readonly [string, ...string[]];
  group: ProductionEditorFieldGroup;
  label: string;
  type: ProductionEditorFieldType;
  originalValue: ProductionEditorPrimitive;
  options?: readonly { value: string; label: string }[];
  min?: number;
  max?: number;
  inlineEditable: boolean;
  mediaEligible: boolean;
  resettable: boolean;
};

export type ProductionEditorArrayItemField = Omit<ProductionEditorField, "originalValue">;

export type ProductionEditorArraySchema = {
  key: string;
  path: readonly [string, ...string[]];
  group: ProductionEditorFieldGroup;
  label: string;
  itemLabel: string;
  identityKey?: string;
  defaultItems: readonly Readonly<Record<string, ProductionEditorPrimitive>>[];
  itemFields: readonly ProductionEditorArrayItemField[];
};

export type ProductionInlineFieldContract = {
  fieldKey: string;
  path: readonly [string, ...string[]];
  valueType: Exclude<ProductionEditorFieldType, "media">;
};

export type ProductionMediaFieldContract = {
  fieldKey: string;
  path: readonly [string, ...string[]];
  originalValue: string | null;
  allowManualUrl: boolean;
  allowLibrarySelection: boolean;
  uploadSupported: false;
};

export type ComponentEditorContract = {
  componentId: string;
  defaultProps: Readonly<Record<string, ProductionEditorValue>>;
  fields: readonly ProductionEditorField[];
  contentFields: readonly string[];
  mediaFields: readonly ProductionMediaFieldContract[];
  actionFields: readonly string[];
  arrays: readonly ProductionEditorArraySchema[];
  inlineFields: readonly ProductionInlineFieldContract[];
};

const SAFE_KEY = /^[A-Za-z][A-Za-z0-9_]*$/;
const SAFE_COMPONENT_ID = /^[A-Za-z0-9._-]+$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isSafeValue(value: unknown, depth = 0): value is ProductionEditorValue {
  if (depth > 4) return false;
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every((item) => isSafeValue(item, depth + 1));
  if (!isPlainObject(value)) return false;
  return Object.entries(value).every(([key, item]) => SAFE_KEY.test(key) && isSafeValue(item, depth + 1));
}

function getPath(value: Readonly<Record<string, ProductionEditorValue>>, path: readonly string[]): ProductionEditorValue | undefined {
  let current: ProductionEditorValue | undefined = value;
  for (const key of path) {
    if (!current || Array.isArray(current) || !isPlainObject(current)) return undefined;
    current = current[key];
  }
  return current;
}

function validateField(
  field: ProductionEditorField | ProductionEditorArrayItemField,
  defaults: ComponentEditorContract["defaultProps"] | null,
  errors: string[],
  prefix: string,
) {
  if (!SAFE_KEY.test(field.key)) errors.push(`${prefix}.key: invalid`);
  if (!field.path.length || field.path.some((segment) => !SAFE_KEY.test(segment))) errors.push(`${prefix}.path: invalid`);
  if (!PRODUCTION_EDITOR_FIELD_GROUPS.includes(field.group)) errors.push(`${prefix}.group: invalid`);
  if (!PRODUCTION_EDITOR_FIELD_TYPES.includes(field.type)) errors.push(`${prefix}.type: unknown`);
  if (typeof field.label !== "string" || !field.label.trim()) errors.push(`${prefix}.label: required`);
  if ("originalValue" in field && typeof field.originalValue === "number" && !Number.isFinite(field.originalValue)) errors.push(`${prefix}.originalValue: unsafe`);
  if (field.type === "select" && (!field.options?.length || field.options.some((option) => !option.value || !option.label))) {
    errors.push(`${prefix}.options: select requires safe options`);
  }
  if (field.type !== "select" && field.options) errors.push(`${prefix}.options: only select supports options`);
  if ((field.min !== undefined || field.max !== undefined) && field.type !== "number") errors.push(`${prefix}.range: only number supports min/max`);
  if (field.min !== undefined && field.max !== undefined && field.min > field.max) errors.push(`${prefix}.range: invalid`);
  if (field.type === "media" && !field.mediaEligible) errors.push(`${prefix}.mediaEligible: media must be eligible`);
  if ("originalValue" in field) {
    if (["text", "textarea", "color", "url"].includes(field.type) && typeof field.originalValue !== "string") errors.push(`${prefix}.originalValue: expected string`);
    if (field.type === "media" && field.originalValue !== null && typeof field.originalValue !== "string") errors.push(`${prefix}.originalValue: expected media path`);
    if (field.type === "boolean" && typeof field.originalValue !== "boolean") errors.push(`${prefix}.originalValue: expected boolean`);
    if (field.type === "number" && (typeof field.originalValue !== "number" || !Number.isFinite(field.originalValue))) errors.push(`${prefix}.originalValue: expected finite number`);
    if (field.type === "number" && typeof field.originalValue === "number" && ((field.min !== undefined && field.originalValue < field.min) || (field.max !== undefined && field.originalValue > field.max))) errors.push(`${prefix}.originalValue: outside range`);
    if (field.type === "select" && (typeof field.originalValue !== "string" || !field.options?.some((option) => option.value === field.originalValue))) errors.push(`${prefix}.originalValue: unsupported select option`);
  }
  if (defaults && "originalValue" in field) {
    const defaultValue = getPath(defaults, field.path);
    if (defaultValue !== field.originalValue) errors.push(`${prefix}.originalValue: differs from defaultProps`);
  }
}

export function validateComponentEditorContract(contract: ComponentEditorContract): string[] {
  const errors: string[] = [];
  if (!SAFE_COMPONENT_ID.test(contract.componentId)) errors.push("componentId: invalid");
  if (!isSafeValue(contract.defaultProps)) errors.push("defaultProps: contains unsafe value");
  const fieldKeys = new Set<string>();
  for (const [index, field] of contract.fields.entries()) {
    if (fieldKeys.has(field.key)) errors.push(`fields[${index}].key: duplicate field key`);
    fieldKeys.add(field.key);
    validateField(field, contract.defaultProps, errors, `fields[${index}]`);
  }
  for (const fieldKey of [...contract.contentFields, ...contract.actionFields]) {
    if (!fieldKeys.has(fieldKey)) errors.push(`field reference ${fieldKey}: missing`);
  }
  for (const [index, media] of contract.mediaFields.entries()) {
    const field = contract.fields.find((candidate) => candidate.key === media.fieldKey);
    if (!field || field.type !== "media" || !field.mediaEligible) errors.push(`mediaFields[${index}]: invalid field`);
    if (!media.path.length || media.path.some((segment) => !SAFE_KEY.test(segment))) errors.push(`mediaFields[${index}].path: invalid`);
    if (getPath(contract.defaultProps, media.path) !== media.originalValue) errors.push(`mediaFields[${index}].originalValue: differs from defaultProps`);
  }
  for (const [index, inline] of contract.inlineFields.entries()) {
    const field = contract.fields.find((candidate) => candidate.key === inline.fieldKey);
    if (!field || !field.inlineEditable || field.type !== inline.valueType) errors.push(`inlineFields[${index}]: invalid inline target`);
    if (!inline.path.length || inline.path.some((segment) => !SAFE_KEY.test(segment))) errors.push(`inlineFields[${index}].path: invalid`);
  }
  const arrayKeys = new Set<string>();
  for (const [index, array] of contract.arrays.entries()) {
    if (arrayKeys.has(array.key) || fieldKeys.has(array.key)) errors.push(`arrays[${index}].key: duplicate field key`);
    arrayKeys.add(array.key);
    if (!SAFE_KEY.test(array.key) || !array.path.length || array.path.some((segment) => !SAFE_KEY.test(segment))) errors.push(`arrays[${index}].path: invalid`);
    if (!PRODUCTION_EDITOR_FIELD_GROUPS.includes(array.group)) errors.push(`arrays[${index}].group: invalid`);
    if (!array.defaultItems.every((item) => isSafeValue(item))) errors.push(`arrays[${index}].defaultItems: unsafe`);
    const defaultArray = getPath(contract.defaultProps, array.path);
    if (!Array.isArray(defaultArray) || JSON.stringify(defaultArray) !== JSON.stringify(array.defaultItems)) {
      errors.push(`arrays[${index}].defaultItems: differs from defaultProps`);
    }
    const itemKeys = new Set<string>();
    for (const [fieldIndex, field] of array.itemFields.entries()) {
      if (itemKeys.has(field.key)) errors.push(`arrays[${index}].itemFields[${fieldIndex}].key: duplicate field key`);
      itemKeys.add(field.key);
      if (field.path.length !== 1 || field.path[0] !== field.key) errors.push(`arrays[${index}].itemFields[${fieldIndex}].path: nested paths unsupported`);
      validateField(field, null, errors, `arrays[${index}].itemFields[${fieldIndex}]`);
    }
    if (array.identityKey && !itemKeys.has(array.identityKey)) errors.push(`arrays[${index}].identityKey: missing item field`);
    for (const item of array.defaultItems) {
      for (const itemField of array.itemFields) {
        if (!(itemField.key in item)) {
          errors.push(`arrays[${index}].defaultItems: item differs from item schema`);
          break;
        }
      }
    }
  }
  return errors;
}

function cloneValue(value: ProductionEditorValue): ProductionEditorValue {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneValue(item)]));
  }
  return value;
}

function setPathValue(
  currentProps: Readonly<Record<string, ProductionEditorValue>>,
  path: readonly [string, ...string[]],
  value: ProductionEditorValue,
) {
  const next = Object.fromEntries(Object.entries(currentProps).map(([key, item]) => [key, cloneValue(item)]));
  let target = next;
  for (const segment of path.slice(0, -1)) {
    const current = target[segment];
    target[segment] = isPlainObject(current) ? { ...current } : {};
    target = target[segment] as Record<string, ProductionEditorValue>;
  }
  target[path[path.length - 1]] = cloneValue(value);
  return next;
}

function resetPaths(
  currentProps: Readonly<Record<string, ProductionEditorValue>>,
  defaults: Readonly<Record<string, ProductionEditorValue>>,
  paths: readonly (readonly string[])[],
) {
  const next = Object.fromEntries(Object.entries(currentProps).map(([key, value]) => [key, cloneValue(value)]));
  for (const path of paths) {
    const original = getPath(defaults, path);
    if (original === undefined) continue;
    let target = next;
    for (const segment of path.slice(0, -1)) {
      const current = target[segment];
      target[segment] = isPlainObject(current) ? { ...current } : {};
      target = target[segment] as Record<string, ProductionEditorValue>;
    }
    target[path[path.length - 1]] = cloneValue(original);
  }
  return next;
}

export function resetEditorField(
  currentProps: Readonly<Record<string, ProductionEditorValue>>,
  contract: ComponentEditorContract,
  fieldKey: string,
) {
  const field = contract.fields.find((candidate) => candidate.key === fieldKey);
  if (!field || !field.resettable) return Object.fromEntries(Object.entries(currentProps).map(([key, value]) => [key, cloneValue(value)]));
  return resetPaths(currentProps, contract.defaultProps, [field.path]);
}

export function resetEditorGroup(
  currentProps: Readonly<Record<string, ProductionEditorValue>>,
  contract: ComponentEditorContract,
  group: ProductionEditorFieldGroup,
) {
  let next = resetPaths(currentProps, contract.defaultProps, contract.fields.filter((field) => field.group === group && field.resettable).map((field) => field.path));
  for (const array of contract.arrays) {
    const keys = array.itemFields
      .filter((field) => field.group === group && field.resettable)
      .map((field) => field.key);
    if (!keys.length) continue;
    const currentItems = getPath(next, array.path);
    if (!Array.isArray(currentItems)) continue;
    const resetItems = currentItems.map((item, index) => {
      const original = array.defaultItems[index];
      if (!item || typeof item !== "object" || Array.isArray(item) || !original) {
        return cloneValue(item);
      }
      const resetItem = Object.fromEntries(
        Object.entries(item).map(([key, value]) => [
          key,
          cloneValue(value as ProductionEditorValue),
        ]),
      );
      for (const key of keys) {
        if (original[key] !== undefined) resetItem[key] = cloneValue(original[key]);
      }
      return resetItem;
    });
    next = setPathValue(next, array.path, resetItems);
  }
  return next;
}

export function resetEditorBlock(
  currentProps: Readonly<Record<string, ProductionEditorValue>>,
  contract: ComponentEditorContract,
) {
  return resetPaths(currentProps, contract.defaultProps, [
    ...contract.fields.filter((field) => field.resettable).map((field) => field.path),
    ...contract.arrays.map((array) => array.path),
  ]);
}
