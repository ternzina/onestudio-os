import {
  assertValidPremiumTemplateContract,
  type PremiumTemplateContract,
} from "./premium-template-contract.ts";

const editable = { visibility: true, reorder: true, reset: true } as const;
const pinned = { visibility: true, reorder: false, reset: true } as const;

export const NOIR_PREMIUM_TEMPLATE_CONTRACT = {
  templateKey: "premium-studio",
  contractVersion: "1.0",
  compositionMode: "legacy-noir",
  nativeSections: [
    { id: "hero", label: "Обложка", anchor: "hero", defaultOrder: 0, pinning: "start", capabilities: pinned, visibilityAfterReset: "visible" },
    { id: "manifest", label: "Манифест", anchor: "manifest", defaultOrder: 1, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "light", label: "Световая история", anchor: "light", defaultOrder: 2, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "services", label: "Форматы съёмки", anchor: "services", defaultOrder: 3, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "portfolio", label: "Портфолио", anchor: "portfolio", defaultOrder: 4, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "retouch", label: "Ретушь до / после", anchor: "retouch", defaultOrder: 5, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "film", label: "Контактная печать", anchor: "film", defaultOrder: 6, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "team", label: "Команда", anchor: "team", defaultOrder: 7, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "process", label: "Процесс", anchor: "process", defaultOrder: 8, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "equipment", label: "Оснащение", anchor: "equipment", defaultOrder: 9, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "tour", label: "Интерактивный тур", anchor: "tour", defaultOrder: 10, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "reviews", label: "Отзывы", anchor: "reviews", defaultOrder: 11, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "faq", label: "Вопросы", anchor: "faq", defaultOrder: 12, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "contact", label: "Контакт и бронирование", anchor: "contact", defaultOrder: 13, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "footer", label: "Подвал", anchor: "footer", defaultOrder: 14, pinning: "end", capabilities: pinned, visibilityAfterReset: "visible" },
  ],
  customPages: { supported: true },
  internalRoutes: { supported: true, routeKinds: ["portfolio", "custom"] },
} as const satisfies PremiumTemplateContract;

assertValidPremiumTemplateContract(NOIR_PREMIUM_TEMPLATE_CONTRACT);

export type NoirNativeSectionId =
  (typeof NOIR_PREMIUM_TEMPLATE_CONTRACT.nativeSections)[number]["id"];

export function getNoirNativeSection(sectionId: string) {
  return NOIR_PREMIUM_TEMPLATE_CONTRACT.nativeSections.find(
    (section) => section.id === sectionId,
  );
}
