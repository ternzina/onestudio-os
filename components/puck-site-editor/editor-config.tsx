"use client";

import type { ComponentConfig, Config, Field } from "@puckeditor/core";
import {
  PUCK_PRODUCTION_MANIFEST,
  type PrimitivePuckPropRule,
  type PuckPropRule,
} from "@/lib/puck-site-editor/registry-manifest";
import type { PuckDocumentComponent } from "@/lib/puck-site-editor/document";
import { PuckProductionBlock } from "./public-renderer";

function fieldForRule(label: string, rule: PrimitivePuckPropRule): Field {
  if (rule.kind === "boolean") return { type: "radio", label, options: [{ label: "Yes", value: true }, { label: "No", value: false }] };
  if (rule.kind === "number") return { type: "number", label, min: rule.min, max: rule.max };
  if (rule.kind === "enum") return { type: "select", label, options: rule.values.map((value) => ({ label: value, value })) };
  if (rule.format === "color") return { type: "text", label };
  return { type: rule.maxLength > 240 ? "textarea" : "text", label };
}

function labelFor(name: string) {
  return name.replace(/([A-Z])/g, " $1").replace(/^./, (character) => character.toUpperCase());
}

function fieldFor(name: string, rule: PuckPropRule): Field {
  if (rule.kind !== "array") return fieldForRule(labelFor(name), rule);
  return {
    type: "array",
    label: labelFor(name),
    arrayFields: Object.fromEntries(
      Object.entries(rule.item.properties).map(([itemName, itemRule]) => [
        itemName,
        fieldForRule(labelFor(itemName), itemRule),
      ]),
    ),
    getItemSummary: (item, index) => String(item.title ?? item.label ?? `Item ${Number(index ?? 0) + 1}`),
  };
}

const components = Object.fromEntries(
  PUCK_PRODUCTION_MANIFEST.map((entry) => {
    const config: ComponentConfig = {
      label: entry.label,
      fields: Object.fromEntries(
        Object.entries(entry.props)
          .filter(([name]) => name !== "id")
          .map(([name, rule]) => [name, fieldFor(name, rule)]),
      ),
      defaultProps: structuredClone(entry.defaults),
      render: (props) => {
        const puck = props.puck;
        const component: PuckDocumentComponent = {
          type: entry.id,
          props: Object.fromEntries(
            Object.entries(props).filter(([name]) => name !== "puck" && name !== "editMode"),
          ) as PuckDocumentComponent["props"],
        };
        return <PuckProductionBlock component={component} dragRef={puck.dragRef} />;
      },
    };
    return [entry.id, config];
  }),
);

const categoryNames = [...new Set(PUCK_PRODUCTION_MANIFEST.map((entry) => entry.taxonomy))];

export const PUCK_PRODUCTION_EDITOR_CONFIG: Config = {
  components,
  categories: Object.fromEntries(
    categoryNames.map((taxonomy) => [
      taxonomy.toLowerCase().replace(/\s+/g, "-"),
      {
        title: taxonomy,
        defaultExpanded: taxonomy === "Hero" || taxonomy === "Navigation",
        components: PUCK_PRODUCTION_MANIFEST.filter((entry) => entry.taxonomy === taxonomy).map((entry) => entry.id),
      },
    ]),
  ),
};
