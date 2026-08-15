import { assertValidPremiumTemplateContract, type PremiumTemplateContract } from "./premium-template-contract.ts";

const editable = { visibility: true, reorder: true, reset: true } as const;
const pinned = { visibility: true, reorder: false, reset: true } as const;

export const BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_CONTRACT = {
  templateKey: "bloom-floral-studio", contractVersion: "1.0", compositionMode: "canonical",
  nativeSections: [
    { id: "hero", label: "Обложка", anchor: "top", defaultOrder: 0, pinning: "start", capabilities: pinned, visibilityAfterReset: "visible" },
    { id: "collections", label: "Коллекции", anchor: "collections", defaultOrder: 1, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "occasions", label: "Поводы", anchor: "occasions", defaultOrder: 2, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "delivery", label: "Доставка", anchor: "delivery", defaultOrder: 3, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "weddings", label: "Свадьбы", anchor: "weddings", defaultOrder: 4, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "subscription", label: "Подписка", anchor: "subscription", defaultOrder: 5, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "workshops", label: "Мастер-классы", anchor: "workshops", defaultOrder: 6, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "testimonials", label: "Отзывы", anchor: "testimonials", defaultOrder: 7, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "faq", label: "FAQ", anchor: "faq", defaultOrder: 8, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "contact", label: "Контакты", anchor: "contact", defaultOrder: 9, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "footer", label: "Подвал", anchor: "footer", defaultOrder: 10, pinning: "end", capabilities: pinned, visibilityAfterReset: "visible" },
  ],
  customPages: { supported: true }, internalRoutes: { supported: true, routeKinds: ["custom"] },
} as const satisfies PremiumTemplateContract;

assertValidPremiumTemplateContract(BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_CONTRACT);
export type BloomFloralStudioNativeSectionId = (typeof BLOOM_FLORAL_STUDIO_PREMIUM_TEMPLATE_CONTRACT.nativeSections)[number]["id"];
