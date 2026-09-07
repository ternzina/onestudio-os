import { CASH_PATH_FULL_INTROS, CASH_PATH_LEGACY_INTROS, cashPathFullPageBlocks } from "./cashpath-premium-template-seed.ts";
import type { PublicSiteContent } from "./types.ts";

function isLegacyPage(page: NonNullable<PublicSiteContent["pages"]>[number]) {
  const intro = CASH_PATH_LEGACY_INTROS[page.slug];
  const block = page.blocks?.[0];
  return Boolean(intro && page.intro === intro && page.blocks?.length === 1 && block?.id === `${page.slug}-content` && block.kind === "text" && !block.title && block.text === intro && !block.items);
}

export function needsCashPathFullPageUpgrade(content: PublicSiteContent) {
  const oldRequestCopy = "Complete the secure provider form to explore available options. You are not required to accept an offer.";
  return content.template_id === "cashpath" && ((content.pages ?? []).some(isLegacyPage) || content.custom_blocks?.some((block) => block.id === "cashpath-request" && block.kind === "leadsgate_form" && block.text === oldRequestCopy));
}

/** Replaces only untouched legacy placeholder bodies; page identity and SEO stay intact. */
export function upgradeCashPathFullPages(content: PublicSiteContent): PublicSiteContent {
  if (!needsCashPathFullPageUpgrade(content)) return content;
  const oldRequestCopy = "Complete the secure provider form to explore available options. You are not required to accept an offer.";
  return { ...content, pages: (content.pages ?? []).map((page) => isLegacyPage(page)
    ? { ...page, intro: CASH_PATH_FULL_INTROS[page.slug] ?? page.intro, blocks: cashPathFullPageBlocks(page.slug) }
    : page), custom_blocks: (content.custom_blocks ?? []).map((block) => block.id === "cashpath-request" && block.kind === "leadsgate_form" && block.text === oldRequestCopy ? { ...block, text: "Choose an amount and enter your details to continue securely." } : block) };
}
