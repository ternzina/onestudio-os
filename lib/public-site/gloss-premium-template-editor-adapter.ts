import { buildGlossInspectorFields } from "./gloss-editor-schema.ts";
import {
  moveLegacyGlossCompositionItem,
  normalizeLegacyGlossComposition,
  parseLegacyGlossToken,
} from "./gloss-premium-template-compat.ts";
import { GLOSS_PREMIUM_TEMPLATE_CONTRACT, type GlossNativeSectionId } from "./gloss-premium-template-contract.ts";
import { GLOSS_TEMPLATE, applySiteTemplate } from "./templates.ts";
import type { PremiumTemplateEditorAdapter } from "./premium-template-editor-adapter.ts";
import type { PublicSiteContent } from "./types.ts";

const visibilityKeys: Record<GlossNativeSectionId, keyof PublicSiteContent> = {
  services: "show_services", portfolio: "show_portfolio", team: "show_team", booking: "show_booking",
  membership: "show_membership", safety: "show_safety", reviews: "show_reviews", gift: "show_gift",
  faq: "show_faq", about: "show_about", contact: "show_contact",
};

const resetKeys: Record<GlossNativeSectionId, readonly (keyof PublicSiteContent)[]> = {
  services: ["services_label", "services_title", "services_layout", "services_columns", "services_show_description", "services_show_price", "services_show_duration", "services_button_label", "service_image_urls", "service_card_images"],
  portfolio: ["portfolio_label", "portfolio_title", "popular_title", "work_filters", "portfolio_layout", "portfolio_columns", "portfolio_card_aspect", "portfolio_show_filters", "portfolio_lightbox", "portfolio_show_category", "portfolio_show_title", "portfolio_show_description", "portfolio_home_limit"],
  team: ["team_label", "team_title", "team_items", "team_image_urls"],
  booking: ["booking_label", "booking_title", "booking_text"],
  membership: ["membership_label", "membership_title", "membership_text", "membership_image_url", "membership_image_urls"],
  safety: ["safety_label", "safety_title", "safety_items"],
  reviews: ["reviews_label", "reviews_title", "reviews_items", "reviews"],
  gift: ["gift_label", "gift_title", "gift_text", "gift_image_url", "gift_image_urls"],
  faq: ["faq_label", "faq_title", "faq_items"],
  about: ["about_label", "about_title", "about_text", "about_image_url"],
  contact: ["contact_label", "contact_title", "contact_address", "contact_phone", "contact_email", "contact_hours", "contact_note", "contact_route_label", "map_query"],
};

const seed = () => applySiteTemplate({} as PublicSiteContent, GLOSS_TEMPLATE);

export const GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER = {
  templateKey: GLOSS_PREMIUM_TEMPLATE_CONTRACT.templateKey,
  contract: GLOSS_PREMIUM_TEMPLATE_CONTRACT,
  initialSectionId: "services",
  nativeToken: (sectionId) => `section:${sectionId}`,
  nativeSectionId: (token) => parseLegacyGlossToken(token)?.sectionId ?? null,
  normalizeLayout: normalizeLegacyGlossComposition,
  moveLayoutItem: moveLegacyGlossCompositionItem,
  isSectionVisible: (content, sectionId) => content[visibilityKeys[sectionId]] !== false,
  setSectionVisibility: (content, sectionId, visible) => ({ ...content, [visibilityKeys[sectionId]]: visible }),
  resetSection: (content, sectionId) => {
    const defaults = seed();
    const next = { ...content };
    for (const key of resetKeys[sectionId]) (next as Record<string, unknown>)[key] = defaults[key];
    (next as Record<string, unknown>)[visibilityKeys[sectionId]] = true;
    return next;
  },
  restoreTemplate: (content) => {
    const restored = applySiteTemplate({ ...content, custom_blocks: [] }, GLOSS_TEMPLATE);
    return { ...restored, custom_blocks: [], pages: content.pages };
  },
  buildInspectorFields: ({ content, sectionId, disabled, onChange }) =>
    buildGlossInspectorFields(content, sectionId, disabled, onChange),
  insertCustomBlock: (content, block) => ({
    ...content,
    custom_blocks: [...(content.custom_blocks ?? []), block],
    layout_order: normalizeLegacyGlossComposition(
      [...(content.layout_order ?? []), `custom:${block.id}`],
      [...(content.custom_blocks ?? []).map(({ id }) => id), block.id],
    ),
  }),
  history: {
    layout: "gloss-layout-order",
    visibility: (sectionId) => `gloss:${sectionId}:visibility`,
    reset: (sectionId) => `gloss:${sectionId}:reset`,
    restore: "gloss:restore-original",
  },
} satisfies PremiumTemplateEditorAdapter<GlossNativeSectionId>;
