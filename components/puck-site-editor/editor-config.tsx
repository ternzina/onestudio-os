"use client";

import { createUsePuck, type ComponentConfig, type Config, type Field } from "@puckeditor/core";
import type { ComponentProps } from "react";
import {
  PUCK_PRODUCTION_MANIFEST,
  type PrimitivePuckPropRule,
  type PuckPropRule,
} from "@/lib/puck-site-editor/registry-manifest";
import { PRODUCTION_SHARED_STYLE_FIELD_KEYS } from "@/lib/puck-site-editor/builder-properties";
import type { PuckDocumentComponent } from "@/lib/puck-site-editor/document";
import { buildNativePuckFields } from "@/lib/puck-site-editor/native-puck-fields";
import { PRODUCT_LIBRARY_CATEGORY_ORDER } from "@/lib/puck-site-editor/product-library";
import { PuckProductionBlock } from "./public-renderer";
import { createProductionPuckScalarField } from "./production-puck-scalar-field";
import { ProductionColorInput } from "./production-color-field";
import { ProductionPuckCanvasRoot } from "./production-editor-ux";
import { useInsideProductionRuntime } from "./production-runtime-context";

const usePuck = createUsePuck();

function fieldForRule(label: string, rule: PrimitivePuckPropRule, defaultValue?: unknown): Field {
  if (rule.kind === "boolean") return createProductionPuckScalarField({ label, kind: "boolean", defaultValue });
  if (rule.kind === "number") return createProductionPuckScalarField({
    label,
    kind: "number",
    defaultValue,
    min: rule.min,
    max: rule.max,
    step: rule.step,
  });
  if (rule.kind === "enum") return createProductionPuckScalarField({
    label,
    kind: "select",
    defaultValue,
    options: rule.values.map((value) => ({ label: value, value })),
  });
  if (rule.format === "color") {
    return {
      type: "custom",
      label,
      render: ({ id, value, onChange, readOnly }) => (
        <ProductionColorInput id={id} label={label} value={value === undefined ? defaultValue : value} onChange={onChange} readOnly={readOnly} />
      ),
    };
  }
  return createProductionPuckScalarField({
    label,
    kind: rule.maxLength > 240 ? "textarea" : "text",
    defaultValue,
  });
}

export function humanizePuckFieldKey(name: string) {
  return name.replace(/([A-Z])/g, " $1").replace(/^./, (character) => character.toUpperCase());
}

export function labelForPuckRule(name: string, rule: PrimitivePuckPropRule | PuckPropRule): string {
  return ("label" in rule && typeof rule.label === "string" && rule.label.trim())
    || ("title" in rule && typeof rule.title === "string" && rule.title.trim())
    || humanizePuckFieldKey(name);
}

function defaultAt(value: unknown, key: string) {
  return value && typeof value === "object" && !Array.isArray(value) && Object.prototype.hasOwnProperty.call(value, key)
    ? (value as Record<string, unknown>)[key]
    : undefined;
}

function fieldFor(name: string, rule: PuckPropRule, defaultValue?: unknown): Field {
  if (rule.kind === "object") {
    return {
      type: "object",
      label: labelForPuckRule(name, rule),
      objectFields: Object.fromEntries(
        Object.entries(rule.properties)
          .filter(([, itemRule]) => itemRule.editable !== false)
          .map(([itemName, itemRule]) => [itemName, fieldFor(itemName, itemRule, defaultAt(defaultValue, itemName))]),
      ),
    };
  }
  if (rule.kind !== "array") return fieldForRule(labelForPuckRule(name, rule), rule, defaultValue);
  if (rule.item.kind !== "object") {
    throw new Error(`Editable production array requires object items: ${name}`);
  }
  return {
    type: "array",
    label: labelForPuckRule(name, rule),
    arrayFields: Object.fromEntries(
      Object.entries(rule.item.properties)
        .filter(([, itemRule]) => itemRule.editable !== false)
        .map(([itemName, itemRule]) => [itemName, fieldFor(itemName, itemRule)]),
    ),
    getItemSummary: (item, index) => String(item.title ?? item.label ?? `Item ${Number(index ?? 0) + 1}`),
  };
}

function contractOwnsTopLevelProp(
  name: string,
  entry: (typeof PUCK_PRODUCTION_MANIFEST)[number],
) {
  const contract = entry.editorContract;
  return contract?.fields.some((field) => field.path.length === 1 && field.path[0] === name)
    || contract?.arrays.some((array) => array.path.length === 1 && array.path[0] === name)
    || false;
}

type ProductionEditorBlockProps = {
  component: PuckDocumentComponent;
  dragRef: ComponentProps<typeof PuckProductionBlock>["dragRef"];
  runtimeMode: "authoring" | "interactive";
};

function ProductionEditorBlockWithoutPuckViewport({
  component,
  dragRef,
  runtimeMode,
}: ProductionEditorBlockProps) {
  return (
    <PuckProductionBlock
      component={component}
      dragRef={dragRef}
      runtimeMode={runtimeMode}
    />
  );
}

function ProductionEditorBlockWithPuckViewport({
  component,
  dragRef,
  runtimeMode,
}: ProductionEditorBlockProps) {
  const viewportWidth = usePuck((state) => state.appState.ui.viewports.current.width);
  return (
    <PuckProductionBlock
      component={component}
      dragRef={dragRef}
      mainViewportWidth={viewportWidth}
      runtimeMode={runtimeMode}
    />
  );
}

function ProductionEditorBlock(props: ProductionEditorBlockProps) {
  const insideRuntime = useInsideProductionRuntime();
  return insideRuntime
    ? <ProductionEditorBlockWithoutPuckViewport {...props} />
    : <ProductionEditorBlockWithPuckViewport {...props} />;
}

const components = Object.fromEntries(
  PUCK_PRODUCTION_MANIFEST.map((entry) => {
    const nativeFields = buildNativePuckFields(entry);
    const config: ComponentConfig = {
      label: entry.label,
      fields: {
        ...nativeFields,
        ...Object.fromEntries(
          Object.entries(entry.props)
            .filter(([name, rule]) => name !== "id"
              && rule.editable !== false
              && nativeFields[name] === undefined
              && !PRODUCTION_SHARED_STYLE_FIELD_KEYS.includes(name as (typeof PRODUCTION_SHARED_STYLE_FIELD_KEYS)[number])
              && !contractOwnsTopLevelProp(name, entry))
            .map(([name, rule]) => [name, fieldFor(name, rule, entry.defaults[name])]),
        ),
      },
      // Production entries use Puck's inline dragRef contract.
      inline: true,
      defaultProps: structuredClone(entry.defaults),
      render: (props) => {
        const puck = props.puck;
        const component: PuckDocumentComponent = {
          type: entry.id,
          props: Object.fromEntries(
            Object.entries(props).filter(([name]) => name !== "puck" && name !== "editMode"),
          ) as PuckDocumentComponent["props"],
        };
        return (
          <ProductionEditorBlock
            component={component}
            dragRef={puck.dragRef}
            runtimeMode={puck?.dragRef ? "authoring" : "interactive"}
          />
        );
      },
    };
    return [entry.id, config];
  }),
);

const categoryNames = PRODUCT_LIBRARY_CATEGORY_ORDER.filter((taxonomy) =>
  PUCK_PRODUCTION_MANIFEST.some((entry) => entry.taxonomy === taxonomy),
);

export const PUCK_PRODUCTION_EDITOR_CONFIG: Config = {
  root: { render: ProductionPuckCanvasRoot },
  components,
  categories: Object.fromEntries(
    categoryNames.map((taxonomy) => [
      taxonomy.toLowerCase().replace(/\s+/g, "-"),
      {
        title: taxonomy,
        defaultExpanded: false,
        components: PUCK_PRODUCTION_MANIFEST.filter((entry) => entry.taxonomy === taxonomy).map((entry) => entry.id),
      },
    ]),
  ),
};
