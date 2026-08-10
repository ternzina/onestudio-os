import type { PremiumTemplateKey } from "./premium-template-package-catalog.ts";
import { createPremiumStudioSeed, withPremiumStudioContent } from "./premium-studio-content.ts";
import { GLOSS_TEMPLATE, applySiteTemplate } from "./templates.ts";
import type { PublicSiteContent } from "./types.ts";

const emptyContent = (): PublicSiteContent => ({
  brand_name: "", hero_eyebrow: "", hero_title: "", hero_text: "", about_title: "", about_text: "",
  services_title: "", portfolio_title: "", contact_title: "", booking_label: "", services_label: "",
  portfolio_label: "", about_label: "", contact_label: "", show_services: false, show_portfolio: false,
  show_about: false, show_contact: false, seo_title: "", seo_description: "",
});

export type PremiumTemplateSeedFactory = () => PublicSiteContent;
const factories = {
  "gloss-nail-studio": () => applySiteTemplate(emptyContent(), GLOSS_TEMPLATE),
  "premium-studio": () => withPremiumStudioContent(
    { ...emptyContent(), brand_name: "NOIR FRAME" },
    createPremiumStudioSeed(),
    { preserveEditorState: false },
  ),
} satisfies Record<PremiumTemplateKey, PremiumTemplateSeedFactory>;

export function getPremiumTemplateSeedFactory(templateKey: string | null | undefined) {
  return templateKey && templateKey in factories ? factories[templateKey as PremiumTemplateKey] : undefined;
}
