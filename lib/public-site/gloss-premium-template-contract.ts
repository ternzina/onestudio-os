import {
  assertValidPremiumTemplateContract,
  type PremiumTemplateContract,
} from "./premium-template-contract.ts";

const editable = { visibility: true, reorder: true, reset: true } as const;

/**
 * GLOSS 1.0 describes the native, orderable home sections that have always
 * been persisted in section_order/layout_order. Header, hero and footer keep
 * their existing fixed chrome and are intentionally outside that composition.
 */
export const GLOSS_PREMIUM_TEMPLATE_CONTRACT = {
  templateKey: "gloss-nail-studio",
  contractVersion: "1.0",
  compositionMode: "legacy-section",
  nativeSections: [
    { id: "services", label: "Услуги", anchor: "services", defaultOrder: 0, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "portfolio", label: "Портфолио", anchor: "portfolio", defaultOrder: 1, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "team", label: "Мастера", anchor: "team", defaultOrder: 2, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "booking", label: "Запись", anchor: "booking", defaultOrder: 3, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "membership", label: "GLOSS CLUB", anchor: "membership", defaultOrder: 4, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "safety", label: "Безопасность", anchor: "safety", defaultOrder: 5, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "reviews", label: "Отзывы", anchor: "reviews", defaultOrder: 6, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "gift", label: "Сертификаты", anchor: "gift", defaultOrder: 7, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "faq", label: "Вопросы", anchor: "faq", defaultOrder: 8, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "about", label: "О студии", anchor: "about", defaultOrder: 9, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "contact", label: "Контакты", anchor: "contact", defaultOrder: 10, capabilities: editable, visibilityAfterReset: "visible" },
  ],
  customPages: { supported: true },
  internalRoutes: { supported: true, routeKinds: ["portfolio", "custom"] },
} as const satisfies PremiumTemplateContract;

assertValidPremiumTemplateContract(GLOSS_PREMIUM_TEMPLATE_CONTRACT);

export type GlossNativeSectionId =
  (typeof GLOSS_PREMIUM_TEMPLATE_CONTRACT.nativeSections)[number]["id"];

export type GlossEditorSectionId = "hero" | GlossNativeSectionId;
