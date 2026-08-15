import { normalizePremiumTemplateComposition } from "./premium-template-composition.ts";
import type { PremiumTemplateContract } from "./premium-template-contract.ts";
import { isTemplateNativeSectionVisible } from "./template-native-section-state.ts";
import type { PublicSiteContent, PublicSiteCustomBlock } from "./types.ts";

export type PremiumTemplateRenderPlanItem =
  | { key: string; kind: "native"; sectionId: string }
  | { key: string; kind: "custom"; block: PublicSiteCustomBlock };

/** Runtime uses the same contract normalizer as the editor and save boundary. */
export function createPremiumTemplateRenderPlan(
  content: PublicSiteContent,
  contract: PremiumTemplateContract,
): PremiumTemplateRenderPlanItem[] {
  const blocks = new Map((content.custom_blocks ?? []).map((block) => [block.id, block]));
  const tokens = normalizePremiumTemplateComposition({
    contract,
    tokens: content.layout_order ?? [],
    customBlockIds: [...blocks.keys()],
  });

  return tokens.flatMap((token): PremiumTemplateRenderPlanItem[] => {
    const native = token.startsWith(`native:${contract.templateKey}:`)
      ? token.slice(`native:${contract.templateKey}:`.length)
      : null;
    if (native) {
      return isTemplateNativeSectionVisible(content, contract.templateKey, native)
        ? [{ key: token, kind: "native", sectionId: native }]
        : [];
    }
    if (!token.startsWith("custom:")) return [];
    const block = blocks.get(token.slice("custom:".length));
    return block ? [{ key: token, kind: "custom", block }] : [];
  });
}
