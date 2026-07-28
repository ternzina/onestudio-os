"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ADMIN_LOCALE_COOKIE,
  isAdminLocale,
  translateAdmin,
  type AdminLocale,
  type AdminMessage,
  type AdminMessageValues,
} from "@/lib/i18n/admin";

type AdminI18nContextValue = {
  locale: AdminLocale;
  setLocale: (locale: AdminLocale) => void;
  t: (message: AdminMessage, values?: AdminMessageValues) => string;
};

const AdminI18nContext = createContext<AdminI18nContextValue | null>(null);
const STORAGE_KEY = ADMIN_LOCALE_COOKIE;

function persistLocale(locale: AdminLocale) {
  document.cookie = `${ADMIN_LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Cookie persistence remains available when browser storage is blocked.
  }
}

export default function AdminI18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: AdminLocale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<AdminLocale>(initialLocale);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }
    if (isAdminLocale(stored) && stored !== initialLocale) {
      setLocaleState(stored);
      persistLocale(stored);
      return;
    }
    persistLocale(initialLocale);
  }, [initialLocale]); // The cookie-provided locale is the hydration source; localStorage is only a fallback.

  useEffect(() => {
    persistLocale(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => () => {
    document.documentElement.lang = "en";
  }, []);

  const setLocale = useCallback((nextLocale: AdminLocale) => {
    setLocaleState(nextLocale);
    persistLocale(nextLocale);
  }, []);

  const t = useCallback(
    (message: AdminMessage, values?: AdminMessageValues) =>
      translateAdmin(locale, message, values),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <AdminI18nContext.Provider value={value}>{children}</AdminI18nContext.Provider>;
}

export function useAdminI18n() {
  const context = useContext(AdminI18nContext);
  if (!context) throw new Error("useAdminI18n must be used inside AdminI18nProvider");
  return context;
}
