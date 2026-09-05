import { createContext, createElement, useContext, type ReactNode } from "react";
import { normalizeAdminLocale, type AdminLocale } from "../../lib/i18n/admin.ts";

export const ProductionEditorLocaleContext = createContext<AdminLocale>("en");

export function useProductionEditorLocale() {
  return useContext(ProductionEditorLocaleContext);
}

export function ProductionEditorLocaleProvider({ locale, children }: { locale: string; children: ReactNode }) {
  return createElement(
    ProductionEditorLocaleContext.Provider,
    { value: normalizeAdminLocale(locale) },
    children,
  );
}
