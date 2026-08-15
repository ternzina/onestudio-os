import { assertValidPremiumTemplateContract, type PremiumTemplateContract } from "./premium-template-contract.ts";
const editable = { visibility: true, reorder: true, reset: true } as const;
const pinned = { visibility: true, reorder: false, reset: true } as const;
export const PAWHAUS_GROOMING_STUDIO_PREMIUM_TEMPLATE_CONTRACT = {
  templateKey: "pawhaus-grooming-studio", contractVersion: "1.0", compositionMode: "canonical",
  nativeSections: [
    { id: "hero", label: "Обложка", anchor: "top", defaultOrder: 0, pinning: "start", capabilities: pinned, visibilityAfterReset: "visible" },
    { id: "services", label: "Услуги", anchor: "services", defaultOrder: 1, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "before-after", label: "До и после", anchor: "before-after", defaultOrder: 2, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "groomers", label: "Грумеры", anchor: "groomers", defaultOrder: 3, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "process", label: "Как всё проходит", anchor: "process", defaultOrder: 4, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "packages", label: "Пакеты", anchor: "packages", defaultOrder: 5, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "gallery", label: "Галерея", anchor: "gallery", defaultOrder: 6, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "testimonials", label: "Отзывы", anchor: "testimonials", defaultOrder: 7, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "booking", label: "Запись", anchor: "booking", defaultOrder: 8, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "faq", label: "FAQ", anchor: "faq", defaultOrder: 9, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "contact", label: "Контакты", anchor: "contact", defaultOrder: 10, capabilities: editable, visibilityAfterReset: "visible" },
    { id: "footer", label: "Подвал", anchor: "footer", defaultOrder: 11, pinning: "end", capabilities: pinned, visibilityAfterReset: "visible" },
  ],
  customPages: { supported: true }, internalRoutes: { supported: true, routeKinds: ["custom"] },
} as const satisfies PremiumTemplateContract;
assertValidPremiumTemplateContract(PAWHAUS_GROOMING_STUDIO_PREMIUM_TEMPLATE_CONTRACT);
export type PawhausGroomingStudioNativeSectionId = (typeof PAWHAUS_GROOMING_STUDIO_PREMIUM_TEMPLATE_CONTRACT.nativeSections)[number]["id"];
