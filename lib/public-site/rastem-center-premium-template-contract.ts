import { assertValidPremiumTemplateContract, type PremiumTemplateContract } from "./premium-template-contract.ts";

const editable = { visibility: true, reorder: true, reset: true } as const;
const pinned = { visibility: true, reorder: false, reset: true } as const;

export const RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT = {
  templateKey: "rastem-center",
  contractVersion: "1.0",
  compositionMode: "canonical",
  nativeSections: [
    { id: "hero", label: "Обложка", anchor: "top", defaultOrder: 0, pinning: "start", capabilities: pinned, visibilityAfterReset: "visible" },
    { id: "ages", label: "Возрастные группы", anchor: "ages", defaultOrder: 1, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "programs", label: "Программы", anchor: "programs", defaultOrder: 2, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "schedule", label: "Расписание", anchor: "schedule", defaultOrder: 3, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "teachers", label: "Педагоги", anchor: "teachers", defaultOrder: 4, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "trial", label: "Пробное занятие", anchor: "trial", defaultOrder: 5, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "benefits", label: "Преимущества", anchor: "benefits", defaultOrder: 6, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "memberships", label: "Абонементы", anchor: "memberships", defaultOrder: 7, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "parents", label: "Для родителей", anchor: "parents", defaultOrder: 8, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "gallery", label: "Галерея", anchor: "gallery", defaultOrder: 9, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "testimonials", label: "Отзывы", anchor: "testimonials", defaultOrder: 10, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "faq", label: "FAQ", anchor: "faq", defaultOrder: 11, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "contact", label: "Контакты", anchor: "contact", defaultOrder: 12, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "footer", label: "Подвал", anchor: "footer", defaultOrder: 13, pinning: "end", capabilities: pinned, visibilityAfterReset: "visible" },
  ],
  customPages: { supported: true },
  internalRoutes: { supported: true, routeKinds: ["custom"] },
} as const satisfies PremiumTemplateContract;

assertValidPremiumTemplateContract(RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT);
export type RastemCenterNativeSectionId = (typeof RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT.nativeSections)[number]["id"];
