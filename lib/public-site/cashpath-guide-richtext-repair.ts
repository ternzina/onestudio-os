import { CASH_PATH_GUIDES } from "./cashpath-guides.generated.ts";
import { decodeRichText, isRichTextValue } from "./rich-text.ts";
import type { PublicSiteContent, PublicSiteCustomBlock, PublicSitePage } from "./types.ts";

function malformedRichText(value: string | undefined): boolean {
  return Boolean(value && isRichTextValue(value) && !decodeRichText(value));
}

function repairGuidePage(page: PublicSitePage, guide: PublicSitePage): PublicSitePage {
  const blocksById = new Map((guide.blocks ?? []).map((block) => [block.id, block]));
  const repairedIntro = malformedRichText(page.intro) ? guide.intro : page.intro;
  const repairedBlocks = (page.blocks ?? []).map((block): PublicSiteCustomBlock => {
    const source = blocksById.get(block.id);
    if (!source || !malformedRichText(block.text)) return block;
    return { ...block, text: source.text };
  });
  const blocksChanged = repairedBlocks.some((block, index) => block !== page.blocks?.[index]);
  if (repairedIntro === page.intro && !blocksChanged) return page;
  return blocksChanged
    ? { ...page, intro: repairedIntro, blocks: repairedBlocks }
    : { ...page, intro: repairedIntro };
}

/** True only when a registered CashPath guide has malformed serialized rich text. */
export function needsCashPathGuideRichTextRepair(content: PublicSiteContent): boolean {
  if (content.template_id !== "cashpath") return false;
  const guidesBySlug = new Map(CASH_PATH_GUIDES.map((guide) => [guide.slug, guide]));
  return (content.pages ?? []).some((page) => {
    const guide = guidesBySlug.get(page.slug);
    if (!guide) return false;
    if (malformedRichText(page.intro)) return true;
    const guideBlockIds = new Set((guide.blocks ?? []).map((block) => block.id));
    return (page.blocks ?? []).some((block) => guideBlockIds.has(block.id) && malformedRichText(block.text));
  });
}

/** Repairs only malformed rich-text fields of already-installed registered guides. */
export function repairCashPathGuideRichText(content: PublicSiteContent): PublicSiteContent {
  if (content.template_id !== "cashpath") return content;
  const guidesBySlug = new Map(CASH_PATH_GUIDES.map((guide) => [guide.slug, guide]));
  let changed = false;
  const pages = (content.pages ?? []).map((page) => {
    const guide = guidesBySlug.get(page.slug);
    if (!guide) return page;
    const repaired = repairGuidePage(page, guide);
    changed ||= repaired !== page;
    return repaired;
  });
  return changed ? { ...content, pages } : content;
}
