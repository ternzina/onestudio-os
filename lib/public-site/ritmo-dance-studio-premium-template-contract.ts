import { assertValidPremiumTemplateContract, type PremiumTemplateContract } from "./premium-template-contract.ts";
const editable = { visibility: true, reorder: true, reset: true } as const;
const pinned = { visibility: true, reorder: false, reset: true } as const;
export const RITMO_DANCE_STUDIO_PREMIUM_TEMPLATE_CONTRACT = {
  templateKey: "ritmo-dance-studio", contractVersion: "1.0", compositionMode: "canonical",
  nativeSections: [
    { id: "hero", label: "Обложка", anchor: "top", defaultOrder: 0, pinning: "start", capabilities: pinned, visibilityAfterReset: "visible" },
    { id: "directions", label: "Направления", anchor: "directions", defaultOrder: 1, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "schedule", label: "Расписание", anchor: "schedule", defaultOrder: 2, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "coaches", label: "Тренеры", anchor: "coaches", defaultOrder: 3, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "trial", label: "Пробный урок", anchor: "trial", defaultOrder: 4, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "memberships", label: "Абонементы", anchor: "prices", defaultOrder: 5, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "gallery", label: "Жизнь студии", anchor: "gallery", defaultOrder: 6, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "contact", label: "Контакты и отзыв", anchor: "contact", defaultOrder: 7, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "footer", label: "Подвал", anchor: "footer", defaultOrder: 8, pinning: "end", capabilities: pinned, visibilityAfterReset: "visible" },
  ], customPages: { supported: true }, internalRoutes: { supported: true, routeKinds: ["custom"] },
} as const satisfies PremiumTemplateContract;
assertValidPremiumTemplateContract(RITMO_DANCE_STUDIO_PREMIUM_TEMPLATE_CONTRACT);
export type RitmoDanceStudioNativeSectionId = (typeof RITMO_DANCE_STUDIO_PREMIUM_TEMPLATE_CONTRACT.nativeSections)[number]["id"];
