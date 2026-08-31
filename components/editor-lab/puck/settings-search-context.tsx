"use client";

import { createContext, useContext, type ReactNode } from "react";
import { normalizeSettingLabel, useSettingsGroup } from "./settings-group-context";

const normalize = (value: string) => value.trim().toLocaleLowerCase();

export const SettingsSearchContext = createContext<{
  query: string;
  allowedLabels: Set<string> | null;
}>({ query: "", allowedLabels: null });

export function SettingSearchBoundary({
  label,
  children,
}: {
  label: string;
  children?: ReactNode;
}) {
  const { query, allowedLabels } = useContext(SettingsSearchContext);
  const settingsGroup = useSettingsGroup();
  if (query && !allowedLabels?.has(normalize(label))) return null;
  const group = settingsGroup.groupByLabel.get(normalizeSettingLabel(label));
  if (!settingsGroup.query && group && settingsGroup.collapsedGroups.has(normalizeSettingLabel(group))) return null;
  return <>{children}</>;
}

export function useSettingsSearch() {
  return useContext(SettingsSearchContext);
}
