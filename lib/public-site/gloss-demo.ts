import { getTemplateCatalogRecord } from "./template-catalog.ts";
import { GLOSS_TEMPLATE } from "./templates.ts";
import type { PublicSiteData } from "./types.ts";

export const GLOSS_DEMO_BASE_PATH = "/demos/gloss-nail-studio";

export function createCanonicalGlossDemoSite(): PublicSiteData {
  const catalogTemplate = getTemplateCatalogRecord("gloss-nail-studio");
  if (!catalogTemplate || catalogTemplate.adapter !== "gloss") {
    throw new Error("Canonical GLOSS template is unavailable");
  }

  return {
    business: {
      id: "gloss-nail-studio-demo",
      slug: "gloss-nail-studio-demo",
      name: GLOSS_TEMPLATE.name,
      locale: "ru",
      primary_locale: "ru",
      currency: "EUR",
      timezone: "Europe/Warsaw",
    },
    content: catalogTemplate.seed(),
    company: { display_name: GLOSS_TEMPLATE.name },
    services: GLOSS_TEMPLATE.services.map((service) => ({
      id: service.slug,
      slug: service.slug,
      kind: "appointment",
      title: service.title,
      description: service.description,
      pricing_model: "fixed",
      price_minor: service.priceMinor,
      currency: "EUR",
      duration_min_minutes: service.durationMinutes,
      duration_max_minutes: service.durationMinutes,
      capacity: 1,
      requires_confirmation: false,
    })),
    portfolio: GLOSS_TEMPLATE.portfolio.map((project) => ({
      id: project.slug,
      slug: project.slug,
      title: project.title,
      description: project.description,
      category: "GLOSS",
      image_url: project.imageUrl,
      image_alt: project.imageAlt,
      width: null,
      height: null,
    })),
    capabilities: { booking: false, catalog: true, portfolio: true },
    available_locales: ["ru"],
    published_at: null,
  };
}
