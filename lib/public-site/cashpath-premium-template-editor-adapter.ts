import { CASHPATH_PREMIUM_TEMPLATE_CONTRACT, type CashPathNativeSectionId } from "./cashpath-premium-template-contract.ts";
import { createPremiumTemplateNativeToken, movePremiumTemplateCompositionItem, normalizePremiumTemplateComposition } from "./premium-template-composition.ts";
import { isTemplateNativeSectionVisible, setTemplateNativeSectionVisibility } from "./template-native-section-state.ts";
import { createCashPathPremiumTemplateSeed } from "./cashpath-premium-template-seed.ts";
import type { PremiumTemplateEditorAdapter } from "./premium-template-editor-adapter.ts";
const key = "cashpath";
const nativeToken = (id: CashPathNativeSectionId) => createPremiumTemplateNativeToken(key, id);
const nativeSectionId = (token: string) => token.startsWith(`native:${key}:`) && (["hero", "footer"] as string[]).includes(token.slice(`native:${key}:`.length)) ? token.slice(`native:${key}:`.length) as CashPathNativeSectionId : null;
const normalizeLayout = (tokens: readonly string[], ids: readonly string[]) => normalizePremiumTemplateComposition({ contract: CASHPATH_PREMIUM_TEMPLATE_CONTRACT, tokens, customBlockIds: ids });
export const CASHPATH_PREMIUM_TEMPLATE_EDITOR_ADAPTER = { templateKey: key, contract: CASHPATH_PREMIUM_TEMPLATE_CONTRACT, initialSectionId: "hero", nativeToken, nativeSectionId, normalizeLayout,
  moveLayoutItem: input => movePremiumTemplateCompositionItem({ contract: CASHPATH_PREMIUM_TEMPLATE_CONTRACT, ...input }), isSectionVisible: (content, id) => isTemplateNativeSectionVisible(content, key, id), setSectionVisibility: (content, id, visible) => setTemplateNativeSectionVisibility(content, key, id, visible),
  resetSection: (content, id) => setTemplateNativeSectionVisibility(content, key, id, true), restoreTemplate: () => createCashPathPremiumTemplateSeed(), buildInspectorFields: () => [],
  insertCustomBlock: (content, block) => ({ ...content, custom_blocks: [...(content.custom_blocks ?? []), block], layout_order: [...normalizeLayout(content.layout_order ?? [], [...(content.custom_blocks ?? []).map(item => item.id), block.id])] }), history: { layout: "cashpath-layout", visibility: id => `cashpath:${id}:visibility`, reset: id => `cashpath:${id}:reset`, restore: "cashpath:restore" },
} satisfies PremiumTemplateEditorAdapter<CashPathNativeSectionId>;
