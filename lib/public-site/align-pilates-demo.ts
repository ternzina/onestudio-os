import type { PublicSiteData } from "./types.ts";
import { createAlignPilatesPremiumTemplateSeed } from "./align-pilates-premium-template-seed.ts";

export type AlignPilatesDemoLocale = "ru" | "en";
export const ALIGN_PILATES_DEMO_BASE_PATH = "/demos/align-pilates-studio";
export const alignPilatesDemoBasePath = (locale: AlignPilatesDemoLocale) => locale === "en" ? `${ALIGN_PILATES_DEMO_BASE_PATH}/en` : ALIGN_PILATES_DEMO_BASE_PATH;
export function createCanonicalAlignPilatesDemoSite(locale: AlignPilatesDemoLocale = "ru"): PublicSiteData {
  return { business: { id: `align-pilates-demo-${locale}`, slug: "align-pilates-studio", name: "ALIGN Pilates Studio", locale, primary_locale: "ru", currency: "UAH", timezone: "Europe/Kyiv" }, content: createAlignPilatesPremiumTemplateSeed(locale), company: { display_name: "ALIGN Pilates Studio", email: "hello@align-pilates.studio", phone: "+380 44 123 45 67", address: locale === "en" ? "8 Balansu Street · Kyiv" : "ул. Баланса, 8 · Киев" }, services: [], portfolio: [], capabilities: { booking: true, catalog: true, portfolio: true }, available_locales: ["ru", "en"], published_at: "2026-08-14T00:00:00.000Z" };
}
