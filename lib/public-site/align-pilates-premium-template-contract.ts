import {
  assertValidPremiumTemplateContract,
  type PremiumTemplateContract,
} from "./premium-template-contract.ts";

const editable = { visibility: true, reorder: true, reset: true } as const;
const pinned = { visibility: true, reorder: false, reset: true } as const;

export const ALIGN_PILATES_PREMIUM_TEMPLATE_CONTRACT = {
  templateKey: "align-pilates-studio",
  contractVersion: "1.0",
  compositionMode: "canonical",
  nativeSections: [
    { id: "hero", label: "Обложка", anchor: "hero", defaultOrder: 0, pinning: "start", capabilities: pinned, visibilityAfterReset: "visible" },
    { id: "formats", label: "Форматы", anchor: "classes", defaultOrder: 1, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "benefits", label: "Преимущества", anchor: "benefits", defaultOrder: 2, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "schedule", label: "Расписание", anchor: "schedule", defaultOrder: 3, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "trainers", label: "Тренеры", anchor: "trainers", defaultOrder: 4, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "trial", label: "Пробное занятие", anchor: "trial", defaultOrder: 5, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "memberships", label: "Абонементы", anchor: "plans", defaultOrder: 6, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "studio", label: "Пространство", anchor: "studio", defaultOrder: 7, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "testimonial", label: "Отзыв", anchor: "testimonial", defaultOrder: 8, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "faq", label: "FAQ", anchor: "faq", defaultOrder: 9, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "contacts", label: "Контакты", anchor: "contacts", defaultOrder: 10, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "footer", label: "Подвал", anchor: "footer", defaultOrder: 11, pinning: "end", capabilities: pinned, visibilityAfterReset: "visible" },
  ],
  customPages: { supported: true },
  internalRoutes: { supported: true, routeKinds: ["custom"] },
} as const satisfies PremiumTemplateContract;

assertValidPremiumTemplateContract(ALIGN_PILATES_PREMIUM_TEMPLATE_CONTRACT);

export type AlignPilatesNativeSectionId =
  (typeof ALIGN_PILATES_PREMIUM_TEMPLATE_CONTRACT.nativeSections)[number]["id"];
