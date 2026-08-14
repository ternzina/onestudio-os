import { buildAlignPilatesInspectorFields, resetAlignPilatesSection } from "./align-pilates-editor-schema.ts";
import { createPremiumTemplateNativeToken, movePremiumTemplateCompositionItem, normalizePremiumTemplateComposition } from "./premium-template-composition.ts";
import { visibilityAfterPremiumEditorReset, type PremiumTemplateEditorAdapter } from "./premium-template-editor-adapter.ts";
import { isTemplateNativeSectionVisible, setTemplateNativeSectionVisibility } from "./template-native-section-state.ts";
import { ALIGN_PILATES_TEMPLATE_KEY, resolveAlignPilatesContent, withAlignPilatesContent } from "./align-pilates-premium-template-content.ts";
import { ALIGN_PILATES_PREMIUM_TEMPLATE_CONTRACT, type AlignPilatesNativeSectionId } from "./align-pilates-premium-template-contract.ts";
import { createAlignPilatesPremiumTemplateSeed } from "./align-pilates-premium-template-seed.ts";

const nativeToken = (sectionId: AlignPilatesNativeSectionId) => createPremiumTemplateNativeToken(ALIGN_PILATES_TEMPLATE_KEY, sectionId);
const nativeSectionId = (token: string) => { const prefix = `native:${ALIGN_PILATES_TEMPLATE_KEY}:`; if (!token.startsWith(prefix)) return null; const id = token.slice(prefix.length); return ALIGN_PILATES_PREMIUM_TEMPLATE_CONTRACT.nativeSections.some((section) => section.id === id) ? id as AlignPilatesNativeSectionId : null; };
const normalizeLayout = (tokens: readonly string[], customBlockIds: readonly string[]) => normalizePremiumTemplateComposition({ contract: ALIGN_PILATES_PREMIUM_TEMPLATE_CONTRACT, tokens, customBlockIds });

export const ALIGN_PILATES_PREMIUM_TEMPLATE_EDITOR_ADAPTER = {
  templateKey: ALIGN_PILATES_TEMPLATE_KEY, contract: ALIGN_PILATES_PREMIUM_TEMPLATE_CONTRACT,
  restoreLabel: "Вернуть исходный ALIGN", initialSectionId: "hero", nativeToken, nativeSectionId, normalizeLayout,
  moveLayoutItem: (input) => movePremiumTemplateCompositionItem({ contract: ALIGN_PILATES_PREMIUM_TEMPLATE_CONTRACT, ...input }),
  isSectionVisible: (content, id) => isTemplateNativeSectionVisible(content, ALIGN_PILATES_TEMPLATE_KEY, id),
  setSectionVisibility: (content, id, visible) => setTemplateNativeSectionVisibility(content, ALIGN_PILATES_TEMPLATE_KEY, id, visible),
  resetSection: (content, id) => { const visible = isTemplateNativeSectionVisible(content, ALIGN_PILATES_TEMPLATE_KEY, id); const next = withAlignPilatesContent(content, resetAlignPilatesSection(resolveAlignPilatesContent(content), id)); const definition = ALIGN_PILATES_PREMIUM_TEMPLATE_CONTRACT.nativeSections.find((section) => section.id === id)!; return setTemplateNativeSectionVisibility(next, ALIGN_PILATES_TEMPLATE_KEY, id, visibilityAfterPremiumEditorReset(definition, visible)); },
  restoreTemplate: (content) => { const locale = content.template_content?.[`${ALIGN_PILATES_TEMPLATE_KEY}:locale`] === "en" ? "en" : "ru"; const seed = createAlignPilatesPremiumTemplateSeed(locale); return { ...content, ...seed, custom_blocks: [], pages: seed.pages, template_content: seed.template_content, layout_order: seed.layout_order }; },
  buildInspectorFields: ({ content, sectionId, disabled, onChange, onChooseMedia }) => buildAlignPilatesInspectorFields(resolveAlignPilatesContent(content), sectionId, disabled, (next, group) => onChange(withAlignPilatesContent(content, next), group), onChooseMedia),
  insertCustomBlock: (content, block) => { const ids = [...(content.custom_blocks ?? []).map((item) => item.id), block.id]; const layout = normalizeLayout(content.layout_order ?? [], ids).filter((token) => token !== `custom:${block.id}`); const footer = layout.indexOf(nativeToken("footer")); layout.splice(footer < 0 ? layout.length : footer, 0, `custom:${block.id}`); return { ...content, custom_blocks: [...(content.custom_blocks ?? []), block], layout_order: layout }; },
  history: { layout: "align-layout-order", visibility: (id) => `align:${id}:visibility`, reset: (id) => `align:${id}:reset`, restore: "align:restore-original" },
} satisfies PremiumTemplateEditorAdapter<AlignPilatesNativeSectionId>;
