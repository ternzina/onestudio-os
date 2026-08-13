import {
  assertValidPremiumTemplateContract,
  type PremiumTemplateContract,
} from "./premium-template-contract.ts";

const editable = { visibility: true, reorder: true, reset: true } as const;
const pinned = { visibility: true, reorder: false, reset: true } as const;

export const VOW_PREMIUM_TEMPLATE_CONTRACT = {
  templateKey: "vow-films",
  contractVersion: "1.0",
  compositionMode: "canonical",
  nativeSections: [
    { id: "hero", label: "Обложка", anchor: "hero", defaultOrder: 0, pinning: "start", capabilities: pinned, visibilityAfterReset: "visible" },
    { id: "manifesto", label: "Манифест", anchor: "manifesto", defaultOrder: 1, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "films", label: "Избранные фильмы", anchor: "films", defaultOrder: 2, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "story", label: "Наша история", anchor: "story", defaultOrder: 3, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "experience", label: "Опыт пары", anchor: "experience", defaultOrder: 4, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "process", label: "Как мы работаем", anchor: "process", defaultOrder: 5, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "packages", label: "Пакеты", anchor: "packages", defaultOrder: 6, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "gallery", label: "Премьеры", anchor: "gallery", defaultOrder: 7, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "reviews", label: "Отзывы", anchor: "reviews", defaultOrder: 8, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "availability", label: "Проверка даты", anchor: "availability", defaultOrder: 9, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "faq", label: "FAQ", anchor: "faq", defaultOrder: 10, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "contact", label: "Финальный призыв", anchor: "contact", defaultOrder: 11, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "footer", label: "Подвал", anchor: "footer", defaultOrder: 12, pinning: "end", capabilities: pinned, visibilityAfterReset: "visible" },
  ],
  customPages: { supported: true },
  internalRoutes: { supported: true, routeKinds: ["custom"] },
} as const satisfies PremiumTemplateContract;

assertValidPremiumTemplateContract(VOW_PREMIUM_TEMPLATE_CONTRACT);

export type VowNativeSectionId =
  (typeof VOW_PREMIUM_TEMPLATE_CONTRACT.nativeSections)[number]["id"];
