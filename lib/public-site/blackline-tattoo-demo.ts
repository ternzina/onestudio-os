import type { PublicSiteData } from "./types.ts";
import { createBlacklineTattooPremiumTemplateSeed } from "./blackline-tattoo-premium-template-seed.ts";
export type BlacklineTattooDemoLocale = "ru" | "en";
export const BLACKLINE_TATTOO_DEMO_BASE_PATH = "/demos/blackline-tattoo";
export const blacklineTattooDemoBasePath = (locale: BlacklineTattooDemoLocale) => locale === "en" ? `${BLACKLINE_TATTOO_DEMO_BASE_PATH}/en` : BLACKLINE_TATTOO_DEMO_BASE_PATH;
export function createCanonicalBlacklineTattooDemoSite(locale: BlacklineTattooDemoLocale = "ru"): PublicSiteData { return { business: { id: `blackline-tattoo-demo-${locale}`, slug: "blackline-tattoo", name: "BLACKLINE", locale, primary_locale: "ru", currency: "UAH", timezone: "Europe/Kyiv" }, content: createBlacklineTattooPremiumTemplateSeed(locale), company: { display_name: "BLACKLINE", email: "hello@blackline.demo", phone: "+00 000 000 00 00", address: locale === "en" ? "21 Chernaya Street" : "ул. Чёрная, 21" }, services: [], portfolio: [], capabilities: { booking: true, catalog: true, portfolio: true }, available_locales: ["ru", "en"], published_at: "2026-08-15T00:00:00.000Z" }; }
