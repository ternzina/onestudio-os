import { createElement, type ChangeEvent, type ReactElement, type SyntheticEvent } from "react";
import type { Field } from "@puckeditor/core";
import styles from "./puck-lab.module.css";

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
export type PuckArrayField = {
  type: "array";
  label: string;
  arrayFields: Record<string, PuckTextField | PuckMediaField | PuckToggleField | PuckSelectField>;
  defaultItemProps?: Record<string, unknown>;
  getItemSummary?: (item: PuckPrimitiveArrayItem, index?: number) => string;
};

export type PuckRichTextField = Extract<Field, { type: "richtext" }>;
export type PuckObjectField = Extract<Field, { type: "object" }>;
export type PuckSlotField = Extract<Field, { type: "slot" }>;

export type PuckMediaField = {
  type: "custom";
  label: string;
  render: ({ id, value, onChange, readOnly }: {
    id: string;
    value: string | undefined;
    onChange: (value: string) => void;
    readOnly?: boolean;
  }) => ReactElement;
};

export type PuckToggleField = {
  type: "radio";
  label: string;
  options: Array<{ label: string; value: string }>;
};
export type PuckSelectField = { type: "select"; label: string; options: Array<{ label: string; value: string }> };

const text = (label: string, options: Pick<PuckTextField, "contentEditable" | "placeholder"> = {}): PuckTextField => ({ type: "text", label, contentEditable: true, ...options });
const textarea = (label: string, options: Pick<PuckTextField, "contentEditable" | "placeholder"> = {}): PuckTextField => ({ type: "textarea", label, contentEditable: true, ...options });
const number = (label: string, options: Pick<PuckTextField, "min" | "max" | "step" | "placeholder"> = {}): PuckTextField => ({ type: "number", label, ...options });
const richtext = (label: string): PuckRichTextField => ({ type: "richtext", label, contentEditable: true });
// These aliases feed props rendered inside heading/paragraph tags. Richtext
// values contain block markup, so plain text is the valid contract here.
const inlineText = (label: string): PuckTextField => text(label);

function MediaUrlField({ id, value, onChange, readOnly }: {
  id: string;
  value: string | undefined;
  onChange: (value: string) => void;
  readOnly?: boolean;
}) {
  const source = value ?? "";
  const update = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value);

  return createElement("div", { className: styles.mediaField },
    createElement("input", { id, type: "url", value: source, onChange: update, readOnly, "aria-label": "Image URL", placeholder: "https://… or /local/path" }),
    source
      ? createElement("img", { className: styles.mediaPreview, src: source, alt: "Media preview", onError: (event: SyntheticEvent<HTMLImageElement>) => { event.currentTarget.hidden = true; } })
      : createElement("div", { className: styles.mediaEmpty }, "Add an image URL or local path"),
  );
}

const imageUrl = (): PuckMediaField => ({ type: "custom", label: "Image URL", render: MediaUrlField });

const toggle = (label: string): PuckToggleField => ({ type: "radio", label, options: [{ label: "Off", value: "off" }, { label: "On", value: "on" }] });
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
  select,
  array,
  arrayItems,
};
