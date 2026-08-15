import { assertValidPremiumTemplateContract, type PremiumTemplateContract } from "./premium-template-contract.ts";

const editable = { visibility: true, reorder: true, reset: true } as const;
const pinned = { visibility: true, reorder: false, reset: true } as const;

export const BLACKLINE_TATTOO_PREMIUM_TEMPLATE_CONTRACT = {
  templateKey: "blackline-tattoo", contractVersion: "1.0", compositionMode: "canonical",
  nativeSections: [
    { id: "hero", label: "Обложка", anchor: "top", defaultOrder: 0, pinning: "start", capabilities: pinned, visibilityAfterReset: "visible" },
    { id: "styles", label: "Стили", anchor: "styles", defaultOrder: 1, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "artists", label: "Мастера", anchor: "artists", defaultOrder: 2, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "portfolio", label: "Работы", anchor: "portfolio", defaultOrder: 3, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "consultation", label: "Консультация", anchor: "consultation", defaultOrder: 4, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "process", label: "Процесс", anchor: "process", defaultOrder: 5, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "safety", label: "Безопасность", anchor: "safety", defaultOrder: 6, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "care", label: "Уход", anchor: "care", defaultOrder: 7, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "testimonials", label: "Отзывы", anchor: "testimonials", defaultOrder: 8, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "faq", label: "FAQ", anchor: "faq", defaultOrder: 9, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "contact", label: "Контакты", anchor: "contact", defaultOrder: 10, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "footer", label: "Подвал", anchor: "footer", defaultOrder: 11, pinning: "end", capabilities: pinned, visibilityAfterReset: "visible" },
  ],
  customPages: { supported: true }, internalRoutes: { supported: true, routeKinds: ["custom"] },
} as const satisfies PremiumTemplateContract;

assertValidPremiumTemplateContract(BLACKLINE_TATTOO_PREMIUM_TEMPLATE_CONTRACT);
export type BlacklineTattooNativeSectionId = (typeof BLACKLINE_TATTOO_PREMIUM_TEMPLATE_CONTRACT.nativeSections)[number]["id"];
