import { buildGlossInspectorFields, resetGlossInspectorSection } from "./gloss-editor-schema.ts";
import {
  moveLegacyGlossCompositionItem,
  normalizeLegacyGlossComposition,
  parseLegacyGlossToken,
} from "./gloss-premium-template-compat.ts";
import { GLOSS_PREMIUM_TEMPLATE_CONTRACT, type GlossEditorSectionId } from "./gloss-premium-template-contract.ts";
import { GLOSS_TEMPLATE, applySiteTemplate } from "./templates.ts";
import type { PremiumTemplateEditorAdapter } from "./premium-template-editor-adapter.ts";
import type { PublicSiteContent } from "./types.ts";

const visibilityKeys: Record<GlossEditorSectionId, keyof PublicSiteContent> = {
  hero: "show_hero",
  services: "show_services", portfolio: "show_portfolio", team: "show_team", booking: "show_booking",
  membership: "show_membership", safety: "show_safety", reviews: "show_reviews", gift: "show_gift",
  faq: "show_faq", about: "show_about", contact: "show_contact",
};

const seed = () => applySiteTemplate({} as PublicSiteContent, GLOSS_TEMPLATE);

export const GLOSS_PREMIUM_TEMPLATE_EDITOR_ADAPTER = {
  templateKey: GLOSS_PREMIUM_TEMPLATE_CONTRACT.templateKey,
  contract: GLOSS_PREMIUM_TEMPLATE_CONTRACT,
  fixedEditorSections: [{
    id: "hero",
    label: "Обложка",
    anchor: "hero",
    defaultOrder: 0,
    pinning: "start",
    capabilities: { visibility: true, reorder: false, reset: true },
    visibilityAfterReset: "visible",
  }],
  restoreLabel: "Вернуть исходный шаблон",
  initialSectionId: "hero",
  nativeToken: (sectionId) => sectionId === "hero" ? "fixed:hero" : `section:${sectionId}`,
  nativeSectionId: (token) => parseLegacyGlossToken(token)?.sectionId ?? null,
  normalizeLayout: normalizeLegacyGlossComposition,
  moveLayoutItem: moveLegacyGlossCompositionItem,
  isSectionVisible: (content, sectionId) => content[visibilityKeys[sectionId]] !== false,
  setSectionVisibility: (content, sectionId, visible) => ({ ...content, [visibilityKeys[sectionId]]: visible }),
  resetSection: (content, sectionId) => {
    const defaults = seed();
    const next = resetGlossInspectorSection(content, defaults, sectionId);
    (next as Record<string, unknown>)[visibilityKeys[sectionId]] = true;
    return next;
  },
  restoreTemplate: (content) => {
    const restored = applySiteTemplate({ ...content, custom_blocks: [] }, GLOSS_TEMPLATE);
    return { ...restored, custom_blocks: [], pages: content.pages };
  },
  buildInspectorFields: ({ content, sectionId, disabled, onChange }) =>
    buildGlossInspectorFields(content, sectionId, disabled, onChange, seed()),
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
} satisfies PremiumTemplateEditorAdapter<GlossEditorSectionId>;
