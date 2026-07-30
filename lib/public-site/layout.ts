import type {
  PublicSiteContent,
  PublicSiteSection,
} from "@/lib/public-site/types";

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
  >,
) {
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
