import { createElement } from "react";
import styles from "./puck-lab.module.css";

export type ControlGroupContract = {
  id: string;
  label: "Content" | "Actions" | "Media" | "Items" | "Appearance" | "Behavior";
  fields: readonly string[];
};

export function bindControlGroups(
  groups: readonly ControlGroupContract[] | undefined,
  sourceFields: Record<string, unknown>,
) {
  if (!groups?.length) return sourceFields;

  const ordered: Record<string, unknown> = {};
  const consumed = new Set<string>();
  for (const group of groups) {
    const memberFields = group.fields.filter((field) => field in sourceFields);
    if (!memberFields.length) continue;
    ordered[`__puckGroup_${group.id}`] = {
      type: "custom",
      label: group.label,
      render: () => createElement("div", { className: styles.controlGroupHeading }, group.label),
    };
    for (const field of memberFields) {
      ordered[field] = sourceFields[field];
      consumed.add(field);
    }
  }

  for (const [field, definition] of Object.entries(sourceFields)) {
    if (!consumed.has(field)) ordered[field] = definition;
  }
  return ordered;
}
