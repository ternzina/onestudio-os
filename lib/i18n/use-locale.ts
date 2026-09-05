"use client";

import { useEffect, useState } from "react";
import { defaultLocale, normalizeLocale, type Locale } from "./config";

export const localeStorageKey = "onestudio-locale";

export function useLocale(initialLocale: Locale = defaultLocale) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    try {
      const savedLocale = window.localStorage.getItem(localeStorageKey);
      if (savedLocale) setLocale(normalizeLocale(savedLocale));
    } catch {
      // Private browsing and blocked storage both fall back to the default locale.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const changeLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    try {
      window.localStorage.setItem(localeStorageKey, nextLocale);
    } catch {
      // The selected locale remains active for this page when storage is unavailable.
    }
  };

  return [locale, changeLocale] as const;
}
