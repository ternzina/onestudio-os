import {
  assertValidPremiumTemplateContract,
  type PremiumTemplateContract,
} from "./premium-template-contract.ts";

const editable = { visibility: true, reorder: true, reset: true } as const;
const pinned = { visibility: true, reorder: false, reset: true } as const;

export const LUMEA_PREMIUM_TEMPLATE_CONTRACT = {
  templateKey: "lumea-beauty",
  contractVersion: "1.0",
  compositionMode: "canonical",
  nativeSections: [
    {
      id: "hero",
      label: "Hero LUMÉA",
      anchor: "hero",
      defaultOrder: 0,
      pinning: "start",
      capabilities: pinned,
      visibilityAfterReset: "visible",
    },
    {
      id: "services",
      label: "Услуги LUMÉA",
      anchor: "services",
      defaultOrder: 1,
      capabilities: editable,
      visibilityAfterReset: "visible",
    },
    {
      id: "booking",
      label: "Онлайн-запись LUMÉA",
      anchor: "booking",
      defaultOrder: 2,
      capabilities: editable,
      visibilityAfterReset: "visible",
    },
    {
      id: "experts",
      label: "Мастера LUMÉA",
      anchor: "experts",
      defaultOrder: 3,
      capabilities: editable,
      visibilityAfterReset: "visible",
    },
    {
      id: "gallery",
      label: "Галерея LUMÉA",
      anchor: "gallery",
      defaultOrder: 4,
      capabilities: editable,
      visibilityAfterReset: "visible",
    },
    {
      id: "reviews",
      label: "Отзывы LUMÉA",
      anchor: "reviews",
      defaultOrder: 5,
      capabilities: editable,
      visibilityAfterReset: "visible",
    },
    {
      id: "contact",
      label: "Контакты LUMÉA",
      anchor: "contact",
      defaultOrder: 6,
      capabilities: editable,
      visibilityAfterReset: "visible",
    },
    {
      id: "footer",
      label: "Подвал LUMÉA",
      anchor: "footer",
      defaultOrder: 7,
      pinning: "end",
      capabilities: pinned,
      visibilityAfterReset: "visible",
    },
  ],
  customPages: { supported: true },
  internalRoutes: { supported: true, routeKinds: ["custom"] },
} as const satisfies PremiumTemplateContract;

assertValidPremiumTemplateContract(LUMEA_PREMIUM_TEMPLATE_CONTRACT);

export type LumeaNativeSectionId =
  (typeof LUMEA_PREMIUM_TEMPLATE_CONTRACT.nativeSections)[number]["id"];

