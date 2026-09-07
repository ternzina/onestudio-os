"use client";

import { FieldLabel } from "@puckeditor/core";
import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { translateAdminText } from "@/lib/i18n/admin";
import {
  ProductionEditorLocaleProvider,
  useProductionEditorLocale,
} from "./production-editor-locale";
export { useProductionEditorLocale } from "./production-editor-locale";
import { useScaledIframeInteractionRetargeting } from "./scaled-iframe-interactions";
import { useProductionInteractionFirewall } from "./production-interaction-firewall";
import styles from "./pilot-editor.module.css";

const ProductionEditorThemeContext = createContext({ isDark: false, toggle: () => {} });

export function useProductionEditorTheme() {
  return useContext(ProductionEditorThemeContext).isDark;
}

export function useProductionEditorThemeToggle() {
  return useContext(ProductionEditorThemeContext).toggle;
}

export function ProductionEditorThemeProvider({
  isDark,
  children,
}: {
  isDark: boolean;
  children: ReactNode;
}) {
  return (
    <ProductionEditorThemeContext.Provider value={{ isDark, toggle: () => {} }}>
      {children}
    </ProductionEditorThemeContext.Provider>
  );
}

export function ProductionEditorProvider({
  locale,
  businessId,
  pilot = false,
  children,
}: {
  locale: string;
  businessId?: string;
  pilot?: boolean;
  children: ReactNode;
}) {
  const [isDark, setIsDark] = useState(false);
  return (
    <div
      className={`${styles.shell} ${isDark ? styles.dark : ""}`}
      data-puck-production-editor
      data-puck-pilot-editor={pilot ? true : undefined}
      data-business-context={businessId}
      data-locale={locale}
      data-theme={isDark ? "dark" : "light"}
    >
      <ProductionEditorThemeContext.Provider value={{ isDark, toggle: () => setIsDark((current) => !current) }}>
        <ProductionEditorLocaleProvider locale={locale}>
          {children}
        </ProductionEditorLocaleProvider>
      </ProductionEditorThemeContext.Provider>
    </div>
  );
}

export function ProductionEditorThemeToggle({ onToggle }: { onToggle?: () => void }) {
  const isDark = useProductionEditorTheme();
  const locale = useProductionEditorLocale();
  const label = isDark ? "Use light workspace theme" : "Use dark workspace theme";
  const localizedMode = translateAdminText(locale, isDark ? "Light" : "Dark");

  return (
    <button
      type="button"
      data-puck-theme-toggle
      className={styles.globalThemeToggle}
      aria-label={`${label} (${localizedMode})`}
      aria-pressed={isDark}
      onPointerEnter={() => window.dispatchEvent(new Event("puck-theme-preview-hold"))}
      onClick={onToggle}
    >
      {isDark ? "☀" : "☾"}
    </button>
  );
}

export function ProductionPuckCanvasRoot({ children }: { children: ReactNode }) {
  const isDark = useProductionEditorTheme();
  const rootRef = useRef<HTMLElement>(null);
  useScaledIframeInteractionRetargeting(rootRef);
  useProductionInteractionFirewall(rootRef);

  useLayoutEffect(() => {
    const document = rootRef.current?.ownerDocument;
    if (!document) return;
    const roots = [document.documentElement, document.body];
    roots.forEach((root) => {
      root.classList.toggle("dark", isDark);
      root.dataset.puckPreviewTheme = isDark ? "dark" : "light";
    });
  }, [isDark]);

  return (
    <main
      ref={rootRef}
      className={`${styles.editableRoot} ${isDark ? `${styles.editableRootDark} dark` : ""}`}
      data-production-editor-canvas
      data-puck-preview-theme={isDark ? "dark" : "light"}
      data-theme={isDark ? "dark" : "light"}
    >
      {children}
    </main>
  );
}

export function ProductionFieldLabel({
  children,
  icon,
  label,
  el,
  readOnly,
  className,
}: {
  children?: ReactNode;
  icon?: ReactNode;
  label: string;
  el?: "label" | "div";
  readOnly?: boolean;
  className?: string;
}) {
  const locale = useProductionEditorLocale();
  return (
    <FieldLabel
      icon={icon}
      label={translateAdminText(locale, label)}
      el={el}
      readOnly={readOnly}
      className={className}
    >
      {children}
    </FieldLabel>
  );
}

/** Keep links inert inside the editor preview while preserving source clicks. */
export function guardProductionPreviewNavigation(event: ReactMouseEvent<HTMLElement>) {
  if (event.defaultPrevented) return;
  const target = event.target as EventTarget & {
    closest?: (selector: string) => HTMLAnchorElement | null;
  };
  const link = target.closest?.("a[href]");
  if (link) event.preventDefault();
}

/** Keep source forms inert in live library previews without blocking source hover/click effects. */
export function guardProductionPreviewSubmit(event: FormEvent<HTMLElement>) {
  event.preventDefault();
}
