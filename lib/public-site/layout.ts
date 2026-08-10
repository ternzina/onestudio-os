import type {
  PublicSiteContent,
  PublicSiteSection,
} from "@/lib/public-site/types";
import { PREMIUM_STUDIO_NATIVE_LAYOUT_ORDER } from "@/lib/public-site/premium-studio-content";

export const PUBLIC_SITE_SECTION_ORDER: PublicSiteSection[] = [
  "services",
  "portfolio",
  "team",
  "booking",
  "membership",
  "safety",
  "reviews",
  "gift",
  "faq",
  "about",
  "contact",
];

export function sectionLayoutId(section: PublicSiteSection) {
  return `section:${section}`;
}

export function customBlockLayoutId(blockId: string) {
  return `custom:${blockId}`;
}

export function resolvePublicSiteLayoutOrder(
  content: Pick<
    PublicSiteContent,
    "section_order" | "layout_order" | "custom_blocks"
  > & { template_id?: string | null },
) {
  if (content.template_id === "premium-studio") {
    const customIds = (content.custom_blocks ?? []).map((block) =>
      customBlockLayoutId(block.id),
    );
    const allowed = new Set<string>([
      ...PREMIUM_STUDIO_NATIVE_LAYOUT_ORDER,
      ...customIds,
    ]);
    const requested = Array.isArray(content.layout_order)
      ? content.layout_order.filter(
          (item, index, values) =>
            typeof item === "string" &&
            allowed.has(item) &&
            values.indexOf(item) === index,
        )
      : [];
    const hasNativeOrder = requested.some((item) => item.startsWith("noir:"));
    if (!hasNativeOrder) {
      return [
        "noir:hero",
        ...PREMIUM_STUDIO_NATIVE_LAYOUT_ORDER.slice(1, -2),
        ...customIds,
        "noir:contact",
        "noir:footer",
      ];
    }

    const requestedMiddle = requested.filter(
      (item) => item !== "noir:hero" && item !== "noir:footer",
    );
    const fallbackMiddle = [
      ...PREMIUM_STUDIO_NATIVE_LAYOUT_ORDER.slice(1, -1),
      ...customIds,
    ];
    const middle = [
      ...requestedMiddle,
      ...fallbackMiddle.filter((item) => !requestedMiddle.includes(item)),
    ];
    return ["noir:hero", ...middle, "noir:footer"];
  }

  const sectionOrder = Array.isArray(content.section_order)
    ? content.section_order.filter((section) =>
        PUBLIC_SITE_SECTION_ORDER.includes(section),
      )
    : [];
  const allSections = [
    ...sectionOrder,
    ...PUBLIC_SITE_SECTION_ORDER.filter(
      (section) => !sectionOrder.includes(section),
    ),
  ];
  const allowed = new Set([
    ...allSections.map(sectionLayoutId),
    ...(content.custom_blocks ?? []).map((block) =>
      customBlockLayoutId(block.id),
    ),
  ]);
  const requested = Array.isArray(content.layout_order)
    ? content.layout_order.filter(
        (item, index, values) =>
          typeof item === "string" &&
          allowed.has(item) &&
          values.indexOf(item) === index,
      )
    : [];
  const fallback = [
    ...allSections.map(sectionLayoutId),
    ...(content.custom_blocks ?? []).map((block) =>
      customBlockLayoutId(block.id),
    ),
  ];

  return [...requested, ...fallback.filter((item) => !requested.includes(item))];
}

export function sectionsFromLayoutOrder(order: string[]) {
  return order
    .filter((item) => item.startsWith("section:"))
    .map((item) => item.slice("section:".length))
    .filter((item): item is PublicSiteSection =>
      PUBLIC_SITE_SECTION_ORDER.includes(item as PublicSiteSection),
    );
}
