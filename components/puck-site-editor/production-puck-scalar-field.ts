"use client";

import { createElement, useEffect, useRef, useState, type ChangeEvent, type ReactElement } from "react";
import type { Field } from "@puckeditor/core";
import { translateAdminText } from "../../lib/i18n/admin.ts";
import { ProductionColorInput } from "./production-color-field.ts";
import { useProductionEditorLocale } from "./production-editor-locale.ts";

export type ProductionPuckScalarKind = "text" | "textarea" | "number" | "boolean" | "select" | "color";

export type ProductionPuckScalarFieldConfig = {
  label: string;
  kind: ProductionPuckScalarKind;
  defaultValue?: unknown;
  min?: number;
  max?: number;
  step?: number;
  options?: readonly { label: string; value: string }[];
};

type ProductionPuckNumberInputProps = {
  id?: string;
  label: string;
  value: unknown;
  defaultValue?: unknown;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
};

function numberDraft(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

export function parseProductionNumberInput(raw: string, min?: number, max?: number) {
  if (raw.trim() === "") return undefined;
  const next = Number(raw);
  if (!Number.isFinite(next)) return undefined;
  if (min !== undefined && next < min) return undefined;
  if (max !== undefined && next > max) return undefined;
  return next;
}

/** Number input with a local draft: clearing it never writes a fake zero. */
export function ProductionPuckNumberInput({
  id,
  label,
  value,
  defaultValue,
  min,
  max,
  step,
  disabled = false,
  onChange,
}: ProductionPuckNumberInputProps): ReactElement {
  const effectiveValue = value === undefined ? defaultValue : value;
  const [draft, setDraft] = useState(() => numberDraft(effectiveValue));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(numberDraft(effectiveValue));
  }, [effectiveValue]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.currentTarget.value;
    setDraft(raw);
    const next = parseProductionNumberInput(raw, min, max);
    if (next !== undefined) onChange(next);
  };

  const input = createElement("input", {
    id,
    "aria-label": label,
    type: "number",
    value: draft,
    min,
    max,
    step,
    disabled,
    onFocus: () => { focused.current = true; },
    onBlur: () => { focused.current = false; setDraft(numberDraft(effectiveValue)); },
    onChange: handleChange,
  });

  return createElement(
    "label",
    { htmlFor: id, style: { display: "grid", gap: 5, width: "100%" } },
    createElement("span", { style: { color: "#3f3f46", fontSize: 12, fontWeight: 600 } }, label),
    input,
  );
}

function ProductionPuckScalarInput({
  id,
  label,
  kind,
  value,
  defaultValue,
  min,
  max,
  step,
  options = [],
  readOnly = false,
  onChange,
}: ProductionPuckScalarFieldConfig & {
  id?: string;
  value: unknown;
  readOnly?: boolean;
  onChange: (value: unknown) => void;
}) {
  const locale = useProductionEditorLocale();
  const translatedLabel = translateAdminText(locale, label);
  const effectiveValue = value === undefined ? defaultValue : value;

  if (kind === "color") {
    return createElement(ProductionColorInput, {
      id,
      label,
      value: effectiveValue,
      onChange,
      readOnly,
    });
  }

  if (kind === "number") {
    return createElement(ProductionPuckNumberInput, {
      id,
      label: translatedLabel,
      value: value,
      defaultValue,
      min,
      max,
      step,
      disabled: readOnly,
      onChange,
    });
  }

  if (kind === "boolean") {
    const yesId = id ? `${id}-yes` : undefined;
    const noId = id ? `${id}-no` : undefined;
    return createElement(
      "fieldset",
      { style: { border: 0, margin: 0, padding: 0 } },
      createElement("legend", { style: { color: "#3f3f46", fontSize: 12, fontWeight: 600 } }, translatedLabel),
      createElement("label", { htmlFor: yesId },
        createElement("input", {
          id: yesId,
          "aria-label": `${translatedLabel}: Yes`,
          type: "radio",
          name: id,
          checked: effectiveValue === true,
          disabled: readOnly,
          onChange: () => onChange(true),
        }),
        " Yes",
      ),
      createElement("label", { htmlFor: noId },
        createElement("input", {
          id: noId,
          "aria-label": `${translatedLabel}: No`,
          type: "radio",
          name: id,
          checked: effectiveValue === false,
          disabled: readOnly,
          onChange: () => onChange(false),
        }),
        " No",
      ),
    );
  }

  if (kind === "select") {
    const currentValue = typeof effectiveValue === "string" ? effectiveValue : "";
    const isKnown = options.some((option) => option.value === currentValue);
    const children = [
      ...(currentValue && !isKnown
        ? [createElement("option", { key: `legacy-${currentValue}`, value: currentValue }, `Legacy: ${currentValue}`)]
        : []),
      ...options.map((option) => createElement("option", { key: option.value, value: option.value }, option.label)),
    ];
    return createElement(
      "label",
      { htmlFor: id, style: { display: "grid", gap: 5, width: "100%" } },
      createElement("span", { style: { color: "#3f3f46", fontSize: 12, fontWeight: 600 } }, translatedLabel),
      createElement("select", {
        id,
        "aria-label": translatedLabel,
        value: currentValue,
        disabled: readOnly,
        onChange: (event: ChangeEvent<HTMLSelectElement>) => onChange(event.currentTarget.value),
      }, children),
    );
  }

  const textValue = typeof effectiveValue === "string" ? effectiveValue : "";
  const inputProps = {
    id,
    "aria-label": translatedLabel,
    disabled: readOnly,
    value: textValue,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.currentTarget.value),
  };
  return createElement(
    "label",
    { htmlFor: id, style: { display: "grid", gap: 5, width: "100%" } },
    createElement("span", { style: { color: "#3f3f46", fontSize: 12, fontWeight: 600 } }, translatedLabel),
    kind === "textarea"
      ? createElement("textarea", { ...inputProps, rows: 4 })
      : createElement("input", { ...inputProps, type: "text" }),
  );
}

/** Creates a Puck field while keeping scalar value semantics in one place. */
export function createProductionPuckScalarField(config: ProductionPuckScalarFieldConfig): Field {
  return {
    type: "custom",
    label: config.label,
    render: ({ id, value, onChange, readOnly }) => createElement(ProductionPuckScalarInput, {
      ...config,
      id,
      value,
      onChange,
      readOnly,
    }),
  };
}
