import { buildRastemCenterInspectorFields, resetRastemCenterSection } from "./rastem-center-editor-schema.ts";
import { createPremiumTemplateNativeToken, movePremiumTemplateCompositionItem, normalizePremiumTemplateComposition } from "./premium-template-composition.ts";
import { visibilityAfterPremiumEditorReset, type PremiumTemplateEditorAdapter } from "./premium-template-editor-adapter.ts";
import { isTemplateNativeSectionVisible, setTemplateNativeSectionVisibility } from "./template-native-section-state.ts";
import { RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT, type RastemCenterNativeSectionId } from "./rastem-center-premium-template-contract.ts";
import { createRastemCenterPremiumTemplateSeed } from "./rastem-center-premium-template-seed.ts";
import { RASTEM_CENTER_TEMPLATE_KEY, resolveRastemCenterContent, withRastemCenterContent } from "./rastem-center-premium-template-content.ts";

const nativeToken = (id: RastemCenterNativeSectionId) => createPremiumTemplateNativeToken(RASTEM_CENTER_TEMPLATE_KEY, id);
const nativeSectionId = (token: string) => { const prefix = `native:${RASTEM_CENTER_TEMPLATE_KEY}:`; if (!token.startsWith(prefix)) return null; const id = token.slice(prefix.length); return RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT.nativeSections.some((section) => section.id === id) ? id as RastemCenterNativeSectionId : null; };
const normalizeLayout = (tokens: readonly string[], ids: readonly string[]) => normalizePremiumTemplateComposition({ contract: RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT, tokens, customBlockIds: ids });

export const RASTEM_CENTER_PREMIUM_TEMPLATE_EDITOR_ADAPTER = {
  templateKey: RASTEM_CENTER_TEMPLATE_KEY, contract: RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT, restoreLabel: "Вернуть исходный РАСТЁМ", initialSectionId: "hero", nativeToken, nativeSectionId, normalizeLayout,
  moveLayoutItem: (input: Parameters<typeof movePremiumTemplateCompositionItem>[0] extends infer T ? Omit<T & object, "contract"> : never) => movePremiumTemplateCompositionItem({ contract: RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT, ...input }),
  isSectionVisible: (content, id) => isTemplateNativeSectionVisible(content, RASTEM_CENTER_TEMPLATE_KEY, id),
  setSectionVisibility: (content, id, visible) => setTemplateNativeSectionVisibility(content, RASTEM_CENTER_TEMPLATE_KEY, id, visible),
  resetSection: (content, id) => { const visible = isTemplateNativeSectionVisible(content, RASTEM_CENTER_TEMPLATE_KEY, id); const next = withRastemCenterContent(content, resetRastemCenterSection(resolveRastemCenterContent(content), id)); const definition = RASTEM_CENTER_PREMIUM_TEMPLATE_CONTRACT.nativeSections.find((section) => section.id === id)!; return setTemplateNativeSectionVisibility(next, RASTEM_CENTER_TEMPLATE_KEY, id, visibilityAfterPremiumEditorReset(definition, visible)); },
  restoreTemplate: (content) => { const locale = content.template_content?.[`${RASTEM_CENTER_TEMPLATE_KEY}:locale`] === "en" ? "en" : "ru"; const seed = createRastemCenterPremiumTemplateSeed(locale); return { ...content, ...seed, custom_blocks: [], pages: seed.pages, template_content: seed.template_content, layout_order: seed.layout_order }; },
  buildInspectorFields: ({ content, sectionId, disabled, onChange, onChooseMedia }) => buildRastemCenterInspectorFields(resolveRastemCenterContent(content), sectionId, disabled, (next, group) => onChange(withRastemCenterContent(content, next), group), onChooseMedia),
  insertCustomBlock: (content, block) => { const ids = [...(content.custom_blocks ?? []).map((item) => item.id), block.id]; const layout = normalizeLayout(content.layout_order ?? [], ids).filter((token) => token !== `custom:${block.id}`); const footer = layout.indexOf(nativeToken("footer")); layout.splice(footer < 0 ? layout.length : footer, 0, `custom:${block.id}`); return { ...content, custom_blocks: [...(content.custom_blocks ?? []), block], layout_order: layout }; },
  history: { layout: "rastem-layout-order", visibility: (id: string) => `rastem:${id}:visibility`, reset: (id: string) => `rastem:${id}:reset`, restore: "rastem:restore-original" },
} satisfies PremiumTemplateEditorAdapter<RastemCenterNativeSectionId>;
