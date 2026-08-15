import type { PublicSiteData } from "./types.ts";
import { createRastemCenterPremiumTemplateSeed } from "./rastem-center-premium-template-seed.ts";

export type RastemCenterDemoLocale = "ru" | "en";
export const RASTEM_CENTER_DEMO_BASE_PATH = "/demos/rastem-center";
export const rastemCenterDemoBasePath = (locale: RastemCenterDemoLocale) => locale === "en" ? `${RASTEM_CENTER_DEMO_BASE_PATH}/en` : RASTEM_CENTER_DEMO_BASE_PATH;
export function createCanonicalRastemCenterDemoSite(locale: RastemCenterDemoLocale = "ru"): PublicSiteData { return { business: { id: `rastem-center-demo-${locale}`, slug: "rastem-center", name: "РАСТЁМ — Детский развивающий центр", locale, primary_locale: "ru", currency: "UAH", timezone: "Europe/Kyiv" }, content: createRastemCenterPremiumTemplateSeed(locale), company: { display_name: "РАСТЁМ", email: "hello@rastem.demo", phone: "+38 (099) 555-12-34", address: locale === "en" ? "7 Big Discoveries Street" : "ул. Больших открытий, 7" }, services: [], portfolio: [], capabilities: { booking: true, catalog: true, portfolio: true }, available_locales: ["ru", "en"], published_at: "2026-08-15T00:00:00.000Z" }; }
