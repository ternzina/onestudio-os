import { createCashPathPremiumTemplateSeed } from "./cashpath-premium-template-seed.ts";
import type { PublicSiteData } from "./types.ts";

/** Shared demo data only; production tenants are created through create_template_workspace. */
export function createCanonicalCashPathDemoSite(): PublicSiteData {
  return {
    business: { id: "cashpath-demo", slug: "cashpath", name: "CashPath", locale: "en", primary_locale: "en", currency: "USD", timezone: "America/New_York" },
    content: createCashPathPremiumTemplateSeed(),
    company: { display_name: "CashPath", email: "", phone: "", address: "" },
    services: [], portfolio: [], capabilities: { booking: false, catalog: false, portfolio: false }, available_locales: ["en"], published_at: null,
  };
}
