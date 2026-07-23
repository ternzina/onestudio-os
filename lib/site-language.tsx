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

export type SiteLanguage = "uk" | "pl";

type SiteLanguageContextValue = {
  lang: SiteLanguage;
  setLang: (lang: SiteLanguage) => void;
};

const STORAGE_KEY = "sisters-language";

const SiteLanguageContext =
  createContext<SiteLanguageContextValue | null>(null);

function getSavedLanguage(): SiteLanguage {
  if (typeof window === "undefined") {
    return "uk";
  }

  return window.localStorage.getItem(STORAGE_KEY) === "pl" ? "pl" : "uk";
}

export function SiteLanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [lang, setLangState] = useState<SiteLanguage>("uk");

  useEffect(() => {
    const savedLanguage = getSavedLanguage();
    setLangState(savedLanguage);
    document.documentElement.lang = savedLanguage === "pl" ? "pl" : "uk";
  }, []);

  const setLang = useCallback((nextLanguage: SiteLanguage) => {
    setLangState(nextLanguage);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextLanguage);
      document.documentElement.lang =
        nextLanguage === "pl" ? "pl" : "uk";
    }
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang,
    }),
    [lang, setLang]
  );

  return (
    <SiteLanguageContext.Provider value={value}>
      {children}
    </SiteLanguageContext.Provider>
  );
}

export function useSiteLanguage() {
  const context = useContext(SiteLanguageContext);

  if (!context) {
    throw new Error(
      "useSiteLanguage must be used inside SiteLanguageProvider"
    );
  }

  return context;
}
