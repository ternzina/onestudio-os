"use client";

import { createContext, useContext, type ReactNode } from "react";

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
  if (query && !allowedLabels?.has(normalize(label))) return null;
  return <>{children}</>;
}

export function useSettingsSearch() {
  return useContext(SettingsSearchContext);
}
