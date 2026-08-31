"use client";

import { createContext, useContext } from "react";

export const normalizeSettingLabel = (value: string) =>
  value.trim().toLocaleLowerCase();

export const SettingsGroupContext = createContext<{
  collapsedGroups: ReadonlySet<string>;
  groupByLabel: ReadonlyMap<string, string>;
  query: string;
  toggleGroup: (label: string) => void;
}>({
  collapsedGroups: new Set(),
  groupByLabel: new Map(),
  query: "",
  toggleGroup: () => undefined,
});

export function SettingsGroupHeading({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const { collapsedGroups, toggleGroup } = useContext(SettingsGroupContext);
  const collapsed = collapsedGroups.has(normalizeSettingLabel(label));
  return <button
    type="button"
    className={className}
    aria-expanded={!collapsed}
    onClick={() => toggleGroup(label)}
  >
    <span>{label}</span>
    <span aria-hidden="true">{collapsed ? "▸" : "▾"}</span>
  </button>;
}

export function useSettingsGroup() {
  return useContext(SettingsGroupContext);
}
