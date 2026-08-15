import { BLACKLINE_TATTOO_PREMIUM_TEMPLATE_CONTRACT, type BlacklineTattooNativeSectionId } from "./blackline-tattoo-premium-template-contract.ts";
import { BLACKLINE_TATTOO_TEMPLATE_KEY, resolveBlacklineTattooContent, withBlacklineTattooContent } from "./blackline-tattoo-premium-template-content.ts";
import { createBlacklineTattooPremiumTemplateSeed } from "./blackline-tattoo-premium-template-seed.ts";
import { buildBlacklineTattooInspectorFields, resetBlacklineTattooSection } from "./blackline-tattoo-editor-schema.ts";
import { createPremiumTemplateNativeToken, movePremiumTemplateCompositionItem, normalizePremiumTemplateComposition } from "./premium-template-composition.ts";
import { visibilityAfterPremiumEditorReset, type PremiumTemplateEditorAdapter } from "./premium-template-editor-adapter.ts";
import { isTemplateNativeSectionVisible, setTemplateNativeSectionVisibility } from "./template-native-section-state.ts";
import { clearPremiumNativeActionStyles, withPremiumActionAppearances } from "./premium-action-style.ts";

const nativeToken = (id: BlacklineTattooNativeSectionId) => createPremiumTemplateNativeToken(BLACKLINE_TATTOO_TEMPLATE_KEY, id);
const nativeSectionId = (token: string) => { const prefix = `native:${BLACKLINE_TATTOO_TEMPLATE_KEY}:`; if (!token.startsWith(prefix)) return null; const id = token.slice(prefix.length); return BLACKLINE_TATTOO_PREMIUM_TEMPLATE_CONTRACT.nativeSections.some((section) => section.id === id) ? id as BlacklineTattooNativeSectionId : null; };
const normalizeLayout = (tokens: readonly string[], ids: readonly string[]) => normalizePremiumTemplateComposition({ contract: BLACKLINE_TATTOO_PREMIUM_TEMPLATE_CONTRACT, tokens, customBlockIds: ids });

export const BLACKLINE_TATTOO_PREMIUM_TEMPLATE_EDITOR_ADAPTER = {
  templateKey: BLACKLINE_TATTOO_TEMPLATE_KEY,
  contract: BLACKLINE_TATTOO_PREMIUM_TEMPLATE_CONTRACT,
  restoreLabel: "Restore BLACKLINE original",
  initialSectionId: "hero",
  nativeToken,
  nativeSectionId,
  normalizeLayout,
  moveLayoutItem: (input: Parameters<typeof movePremiumTemplateCompositionItem>[0] extends infer T ? Omit<T & object, "contract"> : never) => movePremiumTemplateCompositionItem({ contract: BLACKLINE_TATTOO_PREMIUM_TEMPLATE_CONTRACT, ...input }),
  isSectionVisible: (content, id) => isTemplateNativeSectionVisible(content, BLACKLINE_TATTOO_TEMPLATE_KEY, id),
  setSectionVisibility: (content, id, visible) => setTemplateNativeSectionVisibility(content, BLACKLINE_TATTOO_TEMPLATE_KEY, id, visible),
  resetSection: (content, id) => { const cleared = clearPremiumNativeActionStyles(content, BLACKLINE_TATTOO_TEMPLATE_KEY, id); const current = resolveBlacklineTattooContent(cleared); const next = withBlacklineTattooContent(cleared, resetBlacklineTattooSection(current, id), true); const definition = BLACKLINE_TATTOO_PREMIUM_TEMPLATE_CONTRACT.nativeSections.find((section) => section.id === id)!; return setTemplateNativeSectionVisibility(next, BLACKLINE_TATTOO_TEMPLATE_KEY, id, visibilityAfterPremiumEditorReset(definition, isTemplateNativeSectionVisible(content, BLACKLINE_TATTOO_TEMPLATE_KEY, id))); },
  restoreTemplate: (content) => { const cleared = clearPremiumNativeActionStyles(content, BLACKLINE_TATTOO_TEMPLATE_KEY); const locale = content.template_content?.[`${BLACKLINE_TATTOO_TEMPLATE_KEY}:locale`] === "en" ? "en" : "ru"; const seed = createBlacklineTattooPremiumTemplateSeed(locale); return { ...cleared, ...seed, custom_blocks: [], pages: seed.pages, template_content: seed.template_content, layout_order: seed.layout_order }; },
  buildInspectorFields: ({ content, sectionId, disabled, onChange, onChooseMedia }) => withPremiumActionAppearances({ fields: buildBlacklineTattooInspectorFields(resolveBlacklineTattooContent(content), sectionId, disabled, (next, group) => onChange(withBlacklineTattooContent(content, next), group), onChooseMedia), content, templateKey: BLACKLINE_TATTOO_TEMPLATE_KEY, sectionId, disabled, onChange }),
  insertCustomBlock: (content, block) => { const ids = [...(content.custom_blocks ?? []).map((item) => item.id), block.id]; const layout = normalizeLayout(content.layout_order ?? [], ids).filter((token) => token !== `custom:${block.id}`); const footer = layout.indexOf(nativeToken("footer")); layout.splice(footer < 0 ? layout.length : footer, 0, `custom:${block.id}`); return { ...content, custom_blocks: [...(content.custom_blocks ?? []), block], layout_order: layout }; },
  history: { layout: "blackline-layout-order", visibility: (id: string) => `blackline:${id}:visibility`, reset: (id: string) => `blackline:${id}:reset`, restore: "blackline:restore-original" },
} satisfies PremiumTemplateEditorAdapter<BlacklineTattooNativeSectionId>;
