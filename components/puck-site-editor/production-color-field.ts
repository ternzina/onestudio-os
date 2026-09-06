"use client";

import { createElement, type ChangeEvent, type ReactElement } from "react";
import { translateAdminText } from "../../lib/i18n/admin.ts";
import { productionColorToPickerHex } from "../../lib/puck-site-editor/production-color.ts";
import { useProductionEditorLocale } from "./production-editor-locale.ts";

export const PRODUCTION_COLOR_PICKER_FALLBACK = "#000000";

/**
 * The browser color input only accepts opaque six-digit colors. Unsupported
 * CSS values stay untouched in Puck data and use a neutral picker swatch until
 * the user chooses a new solid color.
 */
export function normalizeProductionColorPickerValue(
  value: unknown,
  fallback = PRODUCTION_COLOR_PICKER_FALLBACK,
) {
  return productionColorToPickerHex(value, fallback);
}

type ProductionColorInputProps = {
  id?: string;
  label: string;
  value: unknown;
  onChange: (value: string) => void;
  readOnly?: boolean;
};

/** Pure element factory kept separate so field behavior can be unit-tested. */
export function renderProductionColorInput({
  id,
  label,
  value,
  onChange,
  readOnly = false,
}: ProductionColorInputProps): ReactElement {
  const pickerValue = normalizeProductionColorPickerValue(value);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.currentTarget.value);

  const input = createElement("input", {
    id,
    "aria-label": label,
    className: "production-color-input",
    disabled: readOnly,
    type: "color",
    value: pickerValue,
    onChange: handleChange,
  });

  return createElement(
    "label",
    {
      className: "production-color-field",
      htmlFor: id,
      style: { display: "grid", gap: 5, width: "100%" },
    },
    createElement("span", {
      "data-production-color-label": label,
      style: { color: "#3f3f46", fontSize: 12, fontWeight: 600 },
    }, label),
    createElement("span", { style: { display: "block" } }, input),
  );
}

/** Puck custom fields do not render FieldLabel, so this component owns one visible label. */
export function ProductionColorInput(props: ProductionColorInputProps): ReactElement {
  const locale = useProductionEditorLocale();
  return renderProductionColorInput({
    ...props,
    label: translateAdminText(locale, props.label),
  });
}
