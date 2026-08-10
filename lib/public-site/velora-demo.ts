import type { PublicSiteData } from "./types.ts";
import { createVeloraPremiumTemplateSeed } from "./velora-premium-template-seed.ts";
export const VELORA_DEMO_BASE_PATH = "/demos/velora-event-venue";
export function createCanonicalVeloraDemoSite(): PublicSiteData { return { business: { id: "velora-demo", slug: "velora-house", name: "VELORA HOUSE", locale: "ru", primary_locale: "ru", currency: "EUR", timezone: "Europe/Kyiv" }, content: createVeloraPremiumTemplateSeed(), company: { display_name: "VELORA HOUSE", email: "events@velora.house", phone: "+380 44 555 24 24", address: "вул. Велика Житомирська, 24 · Київ" }, services: [], portfolio: [], capabilities: { booking: true, catalog: true, portfolio: true }, available_locales: ["ru"], published_at: "2026-08-11T00:00:00.000Z" }; }
