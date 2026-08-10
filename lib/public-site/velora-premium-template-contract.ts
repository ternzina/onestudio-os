import { assertValidPremiumTemplateContract, type PremiumTemplateContract } from "./premium-template-contract.ts";

const editable = { visibility: true, reorder: true, reset: true } as const;
const pinned = { visibility: true, reorder: false, reset: true } as const;

export const VELORA_PREMIUM_TEMPLATE_CONTRACT = {
  templateKey: "velora-event-venue", contractVersion: "1.0",
  nativeSections: [
    { id: "hero", label: "Обложка", anchor: "hero", defaultOrder: 0, pinning: "start", capabilities: pinned, visibilityAfterReset: "visible" },
    { id: "availability", label: "Проверка даты", anchor: "availability", defaultOrder: 1, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "venues", label: "Залы", anchor: "venues", defaultOrder: 2, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "formats", label: "Форматы", anchor: "formats", defaultOrder: 3, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "packages", label: "Пакеты", anchor: "packages", defaultOrder: 4, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "gallery", label: "Галерея", anchor: "gallery", defaultOrder: 5, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "catering", label: "Меню", anchor: "catering", defaultOrder: 6, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "planner", label: "Планировщик", anchor: "planner", defaultOrder: 7, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "facts", label: "Цифры", anchor: "facts", defaultOrder: 8, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "reviews", label: "Отзывы", anchor: "reviews", defaultOrder: 9, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "faq", label: "FAQ", anchor: "faq", defaultOrder: 10, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "contact", label: "Контакты", anchor: "contact", defaultOrder: 11, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "footer", label: "Подвал", anchor: "footer", defaultOrder: 12, pinning: "end", capabilities: pinned, visibilityAfterReset: "visible" },
  ],
  customPages: { supported: true }, internalRoutes: { supported: true, routeKinds: ["custom"] },
} as const satisfies PremiumTemplateContract;

assertValidPremiumTemplateContract(VELORA_PREMIUM_TEMPLATE_CONTRACT);
export type VeloraNativeSectionId = (typeof VELORA_PREMIUM_TEMPLATE_CONTRACT.nativeSections)[number]["id"];
