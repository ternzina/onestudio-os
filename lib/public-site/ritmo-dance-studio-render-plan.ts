import { normalizePremiumTemplateComposition } from "./premium-template-composition.ts";
import { RITMO_DANCE_STUDIO_PREMIUM_TEMPLATE_CONTRACT, type RitmoDanceStudioNativeSectionId } from "./ritmo-dance-studio-premium-template-contract.ts";
import { RITMO_DANCE_STUDIO_TEMPLATE_KEY } from "./ritmo-dance-studio-premium-template-content.ts";
import { isTemplateNativeSectionVisible } from "./template-native-section-state.ts";
import type { PublicSiteContent, PublicSiteCustomBlock } from "./types.ts";

export type RitmoDanceStudioRenderPlanItem =
  | { key: string; kind: "native"; sectionId: RitmoDanceStudioNativeSectionId }
  | { key: string; kind: "custom"; block: PublicSiteCustomBlock };

export function createRitmoDanceStudioRenderPlan(
  content: PublicSiteContent,
): RitmoDanceStudioRenderPlanItem[] {
  const blocks = new Map(
    (content.custom_blocks ?? []).map((block) => [block.id, block]),
  );
  const tokens = normalizePremiumTemplateComposition({
    contract: RITMO_DANCE_STUDIO_PREMIUM_TEMPLATE_CONTRACT,
    tokens: content.layout_order ?? [],
    customBlockIds: [...blocks.keys()],
  });
  const nativePrefix = `native:${RITMO_DANCE_STUDIO_TEMPLATE_KEY}:`;

  return tokens.flatMap((token): RitmoDanceStudioRenderPlanItem[] => {
    if (token.startsWith(nativePrefix)) {
      const sectionId = token.slice(nativePrefix.length) as RitmoDanceStudioNativeSectionId;
      return isTemplateNativeSectionVisible(content, RITMO_DANCE_STUDIO_TEMPLATE_KEY, sectionId)
        ? [{ key: token, kind: "native", sectionId }]
        : [];
    }
    if (!token.startsWith("custom:")) return [];
    const block = blocks.get(token.slice("custom:".length));
    return block ? [{ key: token, kind: "custom", block }] : [];
  });
}
