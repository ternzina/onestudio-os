import { buildNoirInspectorFields, resetNoirInspectorSection } from "./noir-editor-schema.ts";
import {
  moveLegacyNoirCompositionItem,
  normalizeLegacyNoirComposition,
  parseLegacyNoirToken,
} from "./noir-premium-template-compat.ts";
import { NOIR_PREMIUM_TEMPLATE_CONTRACT, type NoirNativeSectionId } from "./noir-premium-template-contract.ts";
import {
  createPremiumStudioSeed,
  PREMIUM_STUDIO_NATIVE_LAYOUT_ORDER,
  resolvePremiumStudioContent,
  withPremiumStudioContent,
} from "./premium-studio-content.ts";
import {
  visibilityAfterPremiumEditorReset,
  type PremiumTemplateEditorAdapter,
} from "./premium-template-editor-adapter.ts";
import {
  isTemplateNativeSectionVisible,
  setTemplateNativeSectionVisibility,
} from "./template-native-section-state.ts";

export const NOIR_PREMIUM_TEMPLATE_EDITOR_ADAPTER = {
  templateKey: NOIR_PREMIUM_TEMPLATE_CONTRACT.templateKey,
  contract: NOIR_PREMIUM_TEMPLATE_CONTRACT,
  initialSectionId: "hero",
  nativeToken: (sectionId) => `noir:${sectionId}`,
  nativeSectionId: (token) => parseLegacyNoirToken(token)?.sectionId ?? null,
  normalizeLayout: normalizeLegacyNoirComposition,
  moveLayoutItem: moveLegacyNoirCompositionItem,
  isSectionVisible: (content, sectionId) =>
    isTemplateNativeSectionVisible(content, NOIR_PREMIUM_TEMPLATE_CONTRACT.templateKey, sectionId),
  setSectionVisibility: (content, sectionId, visible) =>
    setTemplateNativeSectionVisibility(content, NOIR_PREMIUM_TEMPLATE_CONTRACT.templateKey, sectionId, visible),
  resetSection: (content, sectionId) => {
    const currentVisibility = isTemplateNativeSectionVisible(
      content,
      NOIR_PREMIUM_TEMPLATE_CONTRACT.templateKey,
      sectionId,
    );
    const reset = withPremiumStudioContent(
      content,
      resetNoirInspectorSection(resolvePremiumStudioContent(content), sectionId),
    );
    const definition = NOIR_PREMIUM_TEMPLATE_CONTRACT.nativeSections.find(
      (section) => section.id === sectionId,
    )!;
    return setTemplateNativeSectionVisibility(
      reset,
      NOIR_PREMIUM_TEMPLATE_CONTRACT.templateKey,
      sectionId,
      visibilityAfterPremiumEditorReset(definition, currentVisibility),
    );
  },
  restoreTemplate: (content) => withPremiumStudioContent(
    { ...content, custom_blocks: [], layout_order: [...PREMIUM_STUDIO_NATIVE_LAYOUT_ORDER] },
    createPremiumStudioSeed(),
    { preserveEditorState: false },
  ),
  buildInspectorFields: ({ content, sectionId, disabled, onChange }) =>
    buildNoirInspectorFields(
      resolvePremiumStudioContent(content),
      sectionId,
      disabled,
      (next, historyGroup) => onChange(withPremiumStudioContent(content, next), historyGroup),
    ),
  insertCustomBlock: (content, block) => {
    const customBlockIds = [...(content.custom_blocks ?? []).map((item) => item.id), block.id];
    const layout = normalizeLegacyNoirComposition(content.layout_order ?? [], customBlockIds)
      .filter((token) => token !== `custom:${block.id}`);
    const contactIndex = layout.indexOf("noir:contact");
    layout.splice(contactIndex < 0 ? Math.max(1, layout.length - 1) : contactIndex, 0, `custom:${block.id}`);
    return { ...content, custom_blocks: [...(content.custom_blocks ?? []), block], layout_order: layout };
  },
  history: {
    layout: "noir-layout-order",
    visibility: (sectionId) => `noir:${sectionId}:visibility`,
    reset: (sectionId) => `noir:${sectionId}:reset`,
    restore: "noir:restore-original",
  },
} satisfies PremiumTemplateEditorAdapter<NoirNativeSectionId>;
