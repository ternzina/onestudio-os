import { createElement, type ChangeEvent, type ReactElement } from "react";
import type { Field } from "@puckeditor/core";
import PuckMediaPickerField from "./puck-media-picker-field";
import {
  responsiveSelectField,
  type ResponsiveSelectField,
} from "./responsive-layout-contract";
import { SettingSearchBoundary } from "./settings-search-context";

export type PuckTextField = {
  type: "text" | "textarea" | "number";
  label: string;
  contentEditable?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
};
export type PuckPrimitiveArrayItem = Record<string, string | number | boolean | undefined>;
export type PuckPrimitiveField = PuckTextField | PuckMediaField | PuckToggleField | PuckSelectField;
export type PuckArrayField = {
  type: "array";
  label: string;
  arrayFields: Record<string, PuckPrimitiveField>;
  defaultItemProps?: Record<string, unknown>;
  getItemSummary?: (item: PuckPrimitiveArrayItem, index?: number) => string;
};

/** One parent item plus primitive child items; deliberately capped at depth 2. */
export type PuckBoundedNestedItem = Record<
  string,
  string | number | boolean | undefined | readonly PuckPrimitiveArrayItem[]
>;
export type PuckBoundedNestedArrayField = {
  type: "array";
  label: string;
  arrayFields: Record<string, PuckPrimitiveField | PuckArrayField>;
  defaultItemProps?: Record<string, unknown>;
  getItemSummary?: (item: PuckBoundedNestedItem, index?: number) => string;
};

export type PuckRichTextField = Extract<Field, { type: "richtext" }>;
export type PuckObjectField = Extract<Field, { type: "object" }>;
export type PuckSlotField = Extract<Field, { type: "slot" }>;

export type PuckMediaField = {
  type: "custom";
  label: string;
  mediaOptions: PuckMediaFieldOptions;
  render: ({ id, name, value, onChange, readOnly }: {
    id: string;
    name: string;
    value: string | undefined;
    onChange: (value: string) => void;
    readOnly?: boolean;
  }) => ReactElement;
};

export type PuckMediaFieldOptions = {
  defaultValue?: string;
  resolveDefault?: (name: string) => string | undefined;
  allowedTypes?: readonly ["image"];
  allowEmpty?: boolean;
  preview?: boolean;
};

export type PuckToggleField = {
  type: "custom";
  label: string;
  render: ({ id, value, onChange, readOnly }: {
    id: string;
    value: boolean | undefined;
    onChange: (value: boolean) => void;
    readOnly?: boolean;
  }) => ReactElement;
};
export type PuckSelectField = { type: "select"; label: string; options: Array<{ label: string; value: string }> };
export type PuckColorField = {
  type: "custom";
  label: string;
  render: ({ id, value, onChange, readOnly }: {
    id: string;
    value: string | undefined;
    onChange: (value: string) => void;
    readOnly?: boolean;
  }) => ReactElement;
};
export type PuckSliderField = {
  type: "custom";
  label: string;
  render: ({ id, value, onChange, readOnly }: {
    id: string;
    value: number | undefined;
    onChange: (value: number) => void;
    readOnly?: boolean;
  }) => ReactElement;
};
export type PuckColorArrayField = {
  type: "custom";
  label: string;
  render: ({ id, value, onChange, readOnly }: {
    id: string;
    value: readonly string[] | undefined;
    onChange: (value: string[]) => void;
    readOnly?: boolean;
  }) => ReactElement;
};
export type PuckResponsiveSelectField = ResponsiveSelectField;
const text = (label: string, options: Pick<PuckTextField, "contentEditable" | "placeholder"> = {}): PuckTextField => ({ type: "text", label, contentEditable: true, ...options });
const textarea = (label: string, options: Pick<PuckTextField, "contentEditable" | "placeholder"> = {}): PuckTextField => ({ type: "textarea", label, contentEditable: true, ...options });
const number = (label: string, options: Pick<PuckTextField, "min" | "max" | "step" | "placeholder"> = {}): PuckTextField => ({ type: "number", label, ...options });
const richtext = (label: string): PuckRichTextField => ({ type: "richtext", label, contentEditable: true });
// These aliases feed props rendered inside heading/paragraph tags. Richtext
// values contain block markup, so plain text is the valid contract here.
const inlineText = (label: string): PuckTextField => text(label);

const imageUrl = (label = "Image", options: PuckMediaFieldOptions = {}): PuckMediaField => ({
  type: "custom",
  label,
  mediaOptions: { allowedTypes: ["image"], preview: true, ...options },
  render: (props) => createElement(SettingSearchBoundary, { label }, createElement(PuckMediaPickerField, {
      ...props,
      label,
      defaultValue: options.resolveDefault?.(props.name) ?? options.defaultValue,
      allowEmpty: options.allowEmpty,
      preview: options.preview,
    })),
});

export function isPuckMediaField(field: PuckPrimitiveField): field is PuckMediaField {
  return field.type === "custom" && "mediaOptions" in field;
}

export function withMediaDefaultResolver(
  field: PuckPrimitiveField,
  resolveDefault: (name: string) => string | undefined,
): PuckPrimitiveField {
  if (!isPuckMediaField(field)) return field;
  return imageUrl(field.label, { ...field.mediaOptions, resolveDefault });
}

export const mediaField = ({ label, ...options }: PuckMediaFieldOptions & { label: string }) => imageUrl(label, options);

function ToggleField({ id, value, onChange, readOnly, label }: {
  id: string;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  readOnly?: boolean;
  label: string;
}) {
  return createElement("div", { style: { display: "grid", gap: 6 } },
    createElement("div", null, label),
    createElement("label", { htmlFor: id, style: { display: "flex", alignItems: "center", gap: 8 } },
      createElement("input", {
        id,
        type: "checkbox",
        checked: value ?? false,
        disabled: readOnly,
        onChange: (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.checked),
      }),
      value ? "On" : "Off",
    ),
  );
}

function ColorField({ id, value, onChange, readOnly, label }: {
  id: string;
  value: string | undefined;
  onChange: (value: string) => void;
  readOnly?: boolean;
  label: string;
}) {
  const source = value ?? "#000000";
  return createElement("div", { style: { display: "grid", gap: 6 } },
    createElement("label", { htmlFor: id }, label),
    createElement("div", { style: { display: "grid", gridTemplateColumns: "40px 1fr", gap: 8 } },
      createElement("input", {
        id,
        type: "color",
        value: source,
        disabled: readOnly,
        onChange: (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value),
        style: { width: 40, height: 34, padding: 2 },
      }),
      createElement("input", {
        type: "text",
        value: source,
        readOnly,
        "aria-label": `${label} hex value`,
        onChange: (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value),
      }),
    ),
  );
}

function SliderField({ id, value, onChange, readOnly, min, max, step, label }: {
  id: string;
  value: number | undefined;
  onChange: (value: number) => void;
  readOnly?: boolean;
  min: number;
  max: number;
  step: number;
  label: string;
}) {
  const source = value ?? min;
  return createElement("div", { style: { display: "grid", gap: 6 } },
    createElement("label", { htmlFor: id }, label),
    createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 64px", gap: 8, alignItems: "center" } },
      createElement("input", {
        id,
        type: "range",
        value: source,
        min,
        max,
        step,
        disabled: readOnly,
        onChange: (event: ChangeEvent<HTMLInputElement>) => onChange(Number(event.target.value)),
      }),
      createElement("input", {
        type: "number",
        value: source,
        min,
        max,
        step,
        readOnly,
        "aria-label": `${label} numeric value`,
        onChange: (event: ChangeEvent<HTMLInputElement>) => onChange(Number(event.target.value)),
      }),
    ),
  );
}

function ColorArrayField({ id, value, onChange, readOnly, defaults, itemLabels, label }: {
  id: string;
  value: readonly string[] | undefined;
  onChange: (value: string[]) => void;
  readOnly?: boolean;
  defaults: readonly string[];
  itemLabels?: readonly string[];
  label: string;
}) {
  const source = value?.length === defaults.length ? [...value] : [...defaults];
  return createElement("div", { style: { display: "grid", gap: 8 } },
    createElement("div", null, label),
    ...source.map((colorValue, index) => createElement("label", {
      key: `${id}-${index}`,
      style: { display: "grid", gridTemplateColumns: "72px 40px 1fr", gap: 8, alignItems: "center" },
    },
    itemLabels?.[index] ?? `Color ${index + 1}`,
    createElement("input", {
      type: "color",
      value: colorValue,
      disabled: readOnly,
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        const next = [...source];
        next[index] = event.target.value;
        onChange(next);
      },
      style: { width: 40, height: 34, padding: 2 },
    }),
    createElement("input", {
      type: "text",
      value: colorValue,
      readOnly,
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        const next = [...source];
        next[index] = event.target.value;
        onChange(next);
      },
    }))),
  );
}

const toggle = (label: string): PuckToggleField => ({ type: "custom", label, render: (props) => createElement(SettingSearchBoundary, { label }, createElement(ToggleField, { ...props, label })) });
const color = (label: string): PuckColorField => ({ type: "custom", label, render: (props) => createElement(SettingSearchBoundary, { label }, createElement(ColorField, { ...props, label })) });
const slider = (label: string, options: { min: number; max: number; step: number }): PuckSliderField => ({
  type: "custom",
  label,
  render: (props) => createElement(SettingSearchBoundary, { label }, createElement(SliderField, { ...props, ...options, label })),
});
const colorArray = (label: string, defaults: readonly string[], itemLabels?: readonly string[]): PuckColorArrayField => ({
  type: "custom",
  label,
  render: (props) => createElement(SettingSearchBoundary, { label }, createElement(ColorArrayField, { ...props, defaults, itemLabels, label })),
});
const select = (label: string, options: Array<{ label: string; value: string }>): PuckSelectField => ({ type: "select", label, options });
const array = (label: string): PuckArrayField => ({ type: "array", label, arrayFields: { value: { type: "text", label: "Value", contentEditable: false } } });
const arrayItems = (label: string, arrayFields: PuckArrayField["arrayFields"], options: Pick<PuckArrayField, "defaultItemProps" | "getItemSummary"> = {}): PuckArrayField => ({ type: "array", label, arrayFields, ...options });
export const fields = {
  text,
  textarea,
  number,
  richtext,
  heading: () => inlineText("Heading"),
  title: () => text("Title"),
  eyebrow: () => text("Eyebrow"),
  description: () => inlineText("Description"),
  buttonLabel: () => text("Button text"),
  url: () => text("URL"),
  imageUrl,
  toggle,
  color,
  slider,
  colorArray,
  select,
  responsiveSelect: responsiveSelectField,
  array,
  arrayItems,
};
