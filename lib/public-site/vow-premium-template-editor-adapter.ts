import { buildVowInspectorFields, resetVowSection } from "./vow-editor-schema.ts";
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
  resolveVowContent,
  VOW_TEMPLATE_KEY,
  withVowContent,
} from "./vow-premium-template-content.ts";
import {
  VOW_PREMIUM_TEMPLATE_CONTRACT,
  type VowNativeSectionId,
} from "./vow-premium-template-contract.ts";
import { createVowPremiumTemplateSeed } from "./vow-premium-template-seed.ts";

const nativeToken = (sectionId: VowNativeSectionId) =>
  createPremiumTemplateNativeToken(VOW_TEMPLATE_KEY, sectionId);
const nativeSectionId = (token: string) => {
  const prefix = `native:${VOW_TEMPLATE_KEY}:`;
  if (!token.startsWith(prefix)) return null;
  const id = token.slice(prefix.length);
  return VOW_PREMIUM_TEMPLATE_CONTRACT.nativeSections.some((section) => section.id === id)
    ? (id as VowNativeSectionId)
    : null;
};
const normalizeLayout = (tokens: readonly string[], customBlockIds: readonly string[]) =>
  normalizePremiumTemplateComposition({
    contract: VOW_PREMIUM_TEMPLATE_CONTRACT,
    tokens,
    customBlockIds,
  });

export const VOW_PREMIUM_TEMPLATE_EDITOR_ADAPTER = {
  templateKey: VOW_TEMPLATE_KEY,
  contract: VOW_PREMIUM_TEMPLATE_CONTRACT,
  restoreLabel: "Вернуть исходный VOW FILMS",
  initialSectionId: "hero",
  nativeToken,
  nativeSectionId,
  normalizeLayout,
  moveLayoutItem: (input) => movePremiumTemplateCompositionItem({ contract: VOW_PREMIUM_TEMPLATE_CONTRACT, ...input }),
  isSectionVisible: (content, id) => isTemplateNativeSectionVisible(content, VOW_TEMPLATE_KEY, id),
  setSectionVisibility: (content, id, visible) => setTemplateNativeSectionVisibility(content, VOW_TEMPLATE_KEY, id, visible),
  resetSection: (content, id) => {
    const visible = isTemplateNativeSectionVisible(content, VOW_TEMPLATE_KEY, id);
    const resetContent = resetVowSection(resolveVowContent(content), id);
    const next = withVowContent(
      id === "hero"
        ? { ...content, theme_dark: "#07111F", theme_accent: "#CDB078", theme_surface: "#F7F2E9" }
        : content,
      resetContent,
    );
    const definition = VOW_PREMIUM_TEMPLATE_CONTRACT.nativeSections.find((section) => section.id === id)!;
    return setTemplateNativeSectionVisibility(
      next,
      VOW_TEMPLATE_KEY,
      id,
      visibilityAfterPremiumEditorReset(definition, visible),
    );
  },
  restoreTemplate: (content) => {
    const locale = content.template_content?.[`${VOW_TEMPLATE_KEY}:locale`] === "en" ? "en" : "ru";
    const seed = createVowPremiumTemplateSeed(locale);
    return {
      ...content,
      ...seed,
      custom_blocks: [],
      pages: seed.pages,
      template_content: seed.template_content,
      layout_order: seed.layout_order,
    };
  },
  buildInspectorFields: ({ content, sectionId, disabled, onChange, onChooseMedia }) => {
    const fields = buildVowInspectorFields(
      resolveVowContent(content),
      sectionId,
      disabled,
      (next, group) => onChange(withVowContent(content, next), group),
      onChooseMedia,
    );
    if (sectionId !== "hero") return fields;
    const color = (
      id: string,
      label: string,
      key: "theme_dark" | "theme_accent" | "theme_surface",
      fallback: string,
    ) => ({
      id,
      group: "media" as const,
      type: "color" as const,
      label,
      value: content[key] ?? fallback,
      disabled,
      onChange: (value: string) => onChange({ ...content, [key]: value }, `vow:palette:${key}`),
    });
    return [
      ...fields,
      color("theme-dark", "Background · midnight", "theme_dark", "#07111F"),
      color("theme-accent", "Accent · champagne", "theme_accent", "#CDB078"),
      color("theme-surface", "Foreground · ivory", "theme_surface", "#F7F2E9"),
    ];
  },
  insertCustomBlock: (content, block) => {
    const ids = [...(content.custom_blocks ?? []).map((item) => item.id), block.id];
    const layout = normalizeLayout(content.layout_order ?? [], ids).filter((token) => token !== `custom:${block.id}`);
    const footer = layout.indexOf(nativeToken("footer"));
    layout.splice(footer < 0 ? layout.length : footer, 0, `custom:${block.id}`);
    return { ...content, custom_blocks: [...(content.custom_blocks ?? []), block], layout_order: layout };
  },
  history: {
    layout: "vow-layout-order",
    visibility: (id) => `vow:${id}:visibility`,
    reset: (id) => `vow:${id}:reset`,
    restore: "vow:restore-original",
  },
} satisfies PremiumTemplateEditorAdapter<VowNativeSectionId>;
