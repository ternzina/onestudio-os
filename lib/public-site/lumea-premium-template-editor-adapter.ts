import { buildLumeaInspectorFields, resetLumeaSection } from "./lumea-editor-schema.ts";
import {
  createPremiumTemplateNativeToken,
  movePremiumTemplateCompositionItem,
  normalizePremiumTemplateComposition,
} from "./premium-template-composition.ts";
import {
  visibilityAfterPremiumEditorReset,
  type PremiumTemplateEditorAdapter,
} from "./premium-template-editor-adapter.ts";
import {
  isTemplateNativeSectionVisible,
  setTemplateNativeSectionVisibility,
} from "./template-native-section-state.ts";
import {
  resolveLumeaContent,
  LUMEA_TEMPLATE_KEY,
  withLumeaContent,
} from "./lumea-premium-template-content.ts";
import {
  LUMEA_PREMIUM_TEMPLATE_CONTRACT,
  type LumeaNativeSectionId,
} from "./lumea-premium-template-contract.ts";
import { createLumeaPremiumTemplateSeed } from "./lumea-premium-template-seed.ts";

const nativeToken = (sectionId: LumeaNativeSectionId) =>
  createPremiumTemplateNativeToken(LUMEA_TEMPLATE_KEY, sectionId);
const nativeSectionId = (token: string) => {
  const prefix = `native:${LUMEA_TEMPLATE_KEY}:`;
  if (!token.startsWith(prefix)) return null;
  const id = token.slice(prefix.length);
  return LUMEA_PREMIUM_TEMPLATE_CONTRACT.nativeSections.some(
    (section) => section.id === id,
  )
    ? (id as LumeaNativeSectionId)
    : null;
};
const normalizeLayout = (
  tokens: readonly string[],
  customBlockIds: readonly string[],
) =>
  normalizePremiumTemplateComposition({
    contract: LUMEA_PREMIUM_TEMPLATE_CONTRACT,
    tokens,
    customBlockIds,
  });

export const LUMEA_PREMIUM_TEMPLATE_EDITOR_ADAPTER = {
  templateKey: LUMEA_TEMPLATE_KEY,
  contract: LUMEA_PREMIUM_TEMPLATE_CONTRACT,
  restoreLabel: "Вернуть исходный LUMÉA",
  initialSectionId: "hero",
  nativeToken,
  nativeSectionId,
  normalizeLayout,
  moveLayoutItem: (input) =>
    movePremiumTemplateCompositionItem({
      contract: LUMEA_PREMIUM_TEMPLATE_CONTRACT,
      ...input,
    }),
  isSectionVisible: (content, id) =>
    isTemplateNativeSectionVisible(content, LUMEA_TEMPLATE_KEY, id),
  setSectionVisibility: (content, id, visible) =>
    setTemplateNativeSectionVisibility(content, LUMEA_TEMPLATE_KEY, id, visible),
  resetSection: (content, id) => {
    const visible = isTemplateNativeSectionVisible(content, LUMEA_TEMPLATE_KEY, id);
    const next = withLumeaContent(
      content,
      resetLumeaSection(resolveLumeaContent(content), id),
    );
    const definition = LUMEA_PREMIUM_TEMPLATE_CONTRACT.nativeSections.find(
      (section) => section.id === id,
    )!;
    return setTemplateNativeSectionVisibility(
      next,
      LUMEA_TEMPLATE_KEY,
      id,
      visibilityAfterPremiumEditorReset(definition, visible),
    );
  },
  restoreTemplate: (content) => {
    const seed = createLumeaPremiumTemplateSeed();
    return {
      ...content,
      ...seed,
      custom_blocks: [],
      pages: seed.pages,
      template_content: seed.template_content,
      layout_order: seed.layout_order,
    };
  },
  buildInspectorFields: ({
    content,
    sectionId,
    disabled,
    onChange,
    onChooseMedia,
  }) =>
    buildLumeaInspectorFields(
      resolveLumeaContent(content),
      sectionId,
      disabled,
      (next, group) => onChange(withLumeaContent(content, next), group),
      onChooseMedia,
    ),
  insertCustomBlock: (content, block) => {
    const ids = [
      ...(content.custom_blocks ?? []).map((item) => item.id),
      block.id,
    ];
    const layout = normalizeLayout(content.layout_order ?? [], ids).filter(
      (token) => token !== `custom:${block.id}`,
    );
    const footer = layout.indexOf(nativeToken("footer"));
    layout.splice(footer < 0 ? layout.length : footer, 0, `custom:${block.id}`);
    return {
      ...content,
      custom_blocks: [...(content.custom_blocks ?? []), block],
      layout_order: layout,
    };
  },
  history: {
    layout: "lumea-layout-order",
    visibility: (id) => `lumea:${id}:visibility`,
    reset: (id) => `lumea:${id}:reset`,
    restore: "lumea:restore-original",
  },
} satisfies PremiumTemplateEditorAdapter<LumeaNativeSectionId>;
