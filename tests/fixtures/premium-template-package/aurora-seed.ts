import type { PublicSiteContent } from "../../../lib/public-site/types.ts";

export function createAuroraPremiumTemplateSeed(): PublicSiteContent {
  return {
    brand_name: "AURORA", hero_eyebrow: "WELLNESS", hero_title: "AURORA", hero_text: "Own Aurora seed",
    about_title: "Aurora", about_text: "Aurora only", services_title: "Practice", portfolio_title: "Space",
    contact_title: "Visit", booking_label: "Book", services_label: "Practice", portfolio_label: "Space",
    about_label: "About", contact_label: "Contact", show_services: true, show_portfolio: true, show_about: true,
    show_contact: true, seo_title: "AURORA wellness", seo_description: "Synthetic Aurora fixture",
    template_content: { "aurora-wellness": { fixture: "aurora" } },
  };
}
