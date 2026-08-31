import { createElement } from "react";
import styles from "./puck-lab.module.css";
import { SettingSearchBoundary } from "./settings-search-context";
import { SettingsGroupHeading } from "./settings-group-context";

export type ControlGroupContract = {
  id: string;
  label: "Content" | "Actions" | "Media" | "Items" | "Layout" | "Appearance" | "Behavior";
  fields: readonly string[];
};

export function bindControlGroups(
  groups: readonly ControlGroupContract[] | undefined,
  sourceFields: Record<string, unknown>,
) {
  if (!groups?.length) return sourceFields;

  const groupsByLabel = new Map<ControlGroupContract["label"], ControlGroupContract>();
  for (const group of groups) {
    const existing = groupsByLabel.get(group.label);
    groupsByLabel.set(group.label, existing
      ? { ...existing, fields: [...new Set([...existing.fields, ...group.fields])] }
      : group);
  }

  const ordered: Record<string, unknown> = {};
  const consumed = new Set<string>();
  for (const group of groupsByLabel.values()) {
    const memberFields = group.fields.filter((field) => field in sourceFields);
    if (!memberFields.length) continue;
    ordered[`__puckGroup_${group.id}`] = {
      type: "custom",
      label: group.label,
      render: () => createElement(SettingSearchBoundary, { label: group.label }, createElement(SettingsGroupHeading, { label: group.label, className: styles.controlGroupHeading })),
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
