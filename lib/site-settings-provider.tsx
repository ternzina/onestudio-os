"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  fallbackContactSettings,
  fallbackGlobalSettings,
  type PublicSiteSettings,
} from "./site-settings";

const fallbackSettings: PublicSiteSettings = {
  contacts: fallbackContactSettings,
  global: fallbackGlobalSettings,
};

const SiteSettingsContext = createContext<PublicSiteSettings>(fallbackSettings);

export function SiteSettingsProvider({
  children,
  settings,
}: {
  children: ReactNode;
  settings: PublicSiteSettings;
}) {
  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
