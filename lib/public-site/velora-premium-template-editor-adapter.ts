import {
  buildVeloraInspectorFields,
  resetVeloraSection,
} from "./velora-editor-schema.ts";
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
  resolveVeloraContent,
  VELORA_TEMPLATE_KEY,
  withVeloraContent,
} from "./velora-premium-template-content.ts";
import {
  VELORA_PREMIUM_TEMPLATE_CONTRACT,
  type VeloraNativeSectionId,
} from "./velora-premium-template-contract.ts";
import { createVeloraPremiumTemplateSeed } from "./velora-premium-template-seed.ts";
import {
  createPlanetaPrincesasTenantContent,
  PLANETA_PRINCESAS_CONTENT,
} from "./planetaprincesas-tenant.ts";

const nativeToken = (sectionId: VeloraNativeSectionId) =>
  createPremiumTemplateNativeToken(VELORA_TEMPLATE_KEY, sectionId);
const nativeSectionId = (token: string) => {
  const prefix = `native:${VELORA_TEMPLATE_KEY}:`;
  if (!token.startsWith(prefix)) return null;
  const id = token.slice(prefix.length);
  return VELORA_PREMIUM_TEMPLATE_CONTRACT.nativeSections.some(
    (section) => section.id === id,
  )
    ? (id as VeloraNativeSectionId)
    : null;
};
const normalizeLayout = (
  tokens: readonly string[],
  customBlockIds: readonly string[],
) =>
  normalizePremiumTemplateComposition({
    contract: VELORA_PREMIUM_TEMPLATE_CONTRACT,
    tokens,
    customBlockIds,
  });
export const VELORA_PREMIUM_TEMPLATE_EDITOR_ADAPTER = {
  templateKey: VELORA_TEMPLATE_KEY,
  contract: VELORA_PREMIUM_TEMPLATE_CONTRACT,
  restoreLabel: "Восстановить исходное оформление",
  initialSectionId: "hero",
  nativeToken,
  nativeSectionId,
  normalizeLayout,
  moveLayoutItem: (input) =>
    movePremiumTemplateCompositionItem({
      contract: VELORA_PREMIUM_TEMPLATE_CONTRACT,
      ...input,
    }),
  isSectionVisible: (content, id) =>
    isTemplateNativeSectionVisible(content, VELORA_TEMPLATE_KEY, id),
  setSectionVisibility: (content, id, visible) =>
    setTemplateNativeSectionVisibility(
      content,
      VELORA_TEMPLATE_KEY,
      id,
      visible,
    ),
  resetSection: (content, id) => {
    const visible = isTemplateNativeSectionVisible(
      content,
      VELORA_TEMPLATE_KEY,
      id,
    );
    const resolvedContent = resolveVeloraContent(content);
    const originalContent =
      resolvedContent.visualVariant === "planeta-princesas"
        ? PLANETA_PRINCESAS_CONTENT
        : undefined;
    const resetContent = resetVeloraSection(resolvedContent, id, originalContent);
    if (id === "hero") {
      resetContent.plum = originalContent?.plum ?? "#2D394F";
      resetContent.muted = originalContent?.muted ?? "#B7B4AE";
      resetContent.secondary = originalContent?.secondary ?? "#7F96B8";
      resetContent.border = originalContent?.border ?? "#6D5B39";
      resetContent.warm = originalContent?.warm ?? "#F2D59B";
      resetContent.overlay = originalContent?.overlay ?? "#050912";
      resetContent.buttonForeground = originalContent?.buttonForeground ?? "#09111F";
    }
    const next = withVeloraContent(
      id === "hero"
        ? {
            ...content,
            theme_dark: originalContent ? "#100A1C" : "#07101E",
            theme_accent: originalContent ? "#C7A76A" : "#D6B56E",
            theme_surface: originalContent ? "#FBF7EF" : "#F6F0E5",
          }
        : content,
      resetContent,
    );
    const definition = VELORA_PREMIUM_TEMPLATE_CONTRACT.nativeSections.find(
      (section) => section.id === id,
    )!;
    return setTemplateNativeSectionVisibility(
      next,
      VELORA_TEMPLATE_KEY,
      id,
      visibilityAfterPremiumEditorReset(definition, visible),
    );
  },
  restoreTemplate: (content) => {
    const seed =
      resolveVeloraContent(content).visualVariant === "planeta-princesas"
        ? createPlanetaPrincesasTenantContent()
        : createVeloraPremiumTemplateSeed();
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
  }) => {
    const resolvedContent = resolveVeloraContent(content);
    const originalContent =
      resolvedContent.visualVariant === "planeta-princesas"
        ? PLANETA_PRINCESAS_CONTENT
        : undefined;
    const fields = buildVeloraInspectorFields(
      resolvedContent,
      sectionId,
      disabled,
      (next, group) => onChange(withVeloraContent(content, next), group),
      onChooseMedia,
      originalContent,
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
      onChange: (value: string) =>
        onChange({ ...content, [key]: value }, `velora:palette:${key}`),
    });
    return [
      ...fields,
      color("theme-dark", "Background · midnight", "theme_dark", "#07101E"),
      color(
        "theme-accent",
        "Accent · champagne gold",
        "theme_accent",
        "#D6B56E",
      ),
      color("theme-surface", "Foreground · ivory", "theme_surface", "#F6F0E5"),
      {
        id: "theme-plum",
        group: "media",
        type: "color",
        label: "Background elevated · slate",
        value: resolvedContent.plum,
        disabled,
        onChange: (value) =>
          onChange(
            withVeloraContent(content, {
              ...resolvedContent,
              plum: value,
            }),
            "velora:palette:plum",
          ),
      },
      ...(
        [
          ["theme-muted", "Muted foreground", "muted"],
          ["theme-secondary", "Secondary accent", "secondary"],
          ["theme-border", "Border", "border"],
          ["theme-warm", "Warm light", "warm"],
          ["theme-overlay", "Overlay", "overlay"],
          ["theme-button", "Button foreground", "buttonForeground"],
        ] as const
      ).map(([id, label, key]) => ({
        id,
        group: "media" as const,
        type: "color" as const,
        label,
        value: resolvedContent[key],
        disabled,
        onChange: (value: string) =>
          onChange(
            withVeloraContent(content, {
              ...resolvedContent,
              [key]: value,
            }),
            `velora:palette:${key}`,
          ),
      })),
    ];
  },
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
    layout: "velora-layout-order",
    visibility: (id) => `velora:${id}:visibility`,
    reset: (id) => `velora:${id}:reset`,
    restore: "velora:restore-original",
  },
} satisfies PremiumTemplateEditorAdapter<VeloraNativeSectionId>;
