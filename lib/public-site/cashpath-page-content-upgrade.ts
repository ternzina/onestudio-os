import { CASH_PATH_FULL_INTROS, CASH_PATH_LEGACY_INTROS, cashPathFullPageBlocks } from "./cashpath-premium-template-seed.ts";
import type { PublicSiteContent } from "./types.ts";

function isLegacyPage(page: NonNullable<PublicSiteContent["pages"]>[number]) {
  const intro = CASH_PATH_LEGACY_INTROS[page.slug];
  const block = page.blocks?.[0];
  return Boolean(intro && page.blocks?.length === 1 && block?.id === `${page.slug}-content` && block.kind === "text" && !block.title && block.text === intro && !block.items);
}

export function needsCashPathFullPageUpgrade(content: PublicSiteContent) {
  return content.template_id === "cashpath" && (content.pages ?? []).some(isLegacyPage);
}

/** Replaces only untouched legacy placeholder bodies; page identity and SEO stay intact. */
export function upgradeCashPathFullPages(content: PublicSiteContent): PublicSiteContent {
  if (!needsCashPathFullPageUpgrade(content)) return content;
  return { ...content, pages: (content.pages ?? []).map((page) => isLegacyPage(page)
    ? { ...page, intro: CASH_PATH_FULL_INTROS[page.slug] ?? page.intro, blocks: cashPathFullPageBlocks(page.slug) }
    : page) };
}
