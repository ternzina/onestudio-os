import type { EditorInspectorPlacedField } from "./editor-spec.ts";
import { isSiteHexColor } from "./colors.ts";
import { publicSiteButtonAppearanceCss } from "./button-style.ts";
import type {
  PublicSiteButtonSize,
  PublicSiteContent,
  PublicSiteNativeActionStyle,
} from "./types.ts";

const SAFE_PREMIUM_ACTION_KEY = /^[A-Za-z0-9:_-]{1,240}$/;

type PremiumActionTheme = {
  size: PublicSiteButtonSize;
  backgroundColor: string;
  textColor: string;
};

export function premiumNativeActionKey(
  templateKey: string,
  sectionId: string,
  actionId: string,
) {
  return `${templateKey}:${sectionId}:${actionId}`;
}

function safeThemeColor(value: string | undefined, fallback: string) {
  return isSiteHexColor(value) ? value : fallback;
}

/**
 * Swatch defaults only. They never alter the site until the user changes a
 * control. Without an override, the template keeps its original CSS exactly.
 */
function premiumActionEditorTheme(
  content: PublicSiteContent,
  templateKey: string,
  actionId: string,
): PremiumActionTheme {
  const dark = safeThemeColor(content.theme_dark, "#202229");
  const surface = safeThemeColor(content.theme_surface, "#ffffff");
  const accent = safeThemeColor(content.theme_accent, dark);

  if (templateKey === "velora-event-venue") {
    if (actionId === "velora-hero-secondary-action") {
      return { size: "medium", backgroundColor: dark, textColor: surface };
    }
    return { size: "medium", backgroundColor: accent, textColor: dark };
  }

  if (templateKey === "gloss-nail-studio") {
    if (actionId === "gloss-hero-secondary-action") {
      return { size: "medium", backgroundColor: surface, textColor: dark };
    }
    return { size: "medium", backgroundColor: accent, textColor: "#ffffff" };
  }

  if (templateKey === "premium-studio") {
    return { size: "medium", backgroundColor: surface, textColor: dark };
  }

  return { size: "medium", backgroundColor: accent, textColor: surface };
}

function mergeNativeActionStyle(
  content: PublicSiteContent,
  key: string,
  patch: Partial<PublicSiteNativeActionStyle>,
): PublicSiteContent {
  const currentMap = content.native_action_styles ?? {};
  const current = currentMap[key] ?? {};
  return {
    ...content,
    native_action_styles: {
      ...currentMap,
      [key]: { ...current, ...patch },
    },
  };
}

export function withPremiumActionAppearances(input: {
  fields: readonly EditorInspectorPlacedField[];
  content: PublicSiteContent;
  templateKey: string;
  sectionId: string;
  disabled: boolean;
  onChange: (content: PublicSiteContent, historyGroup: string) => void;
}): EditorInspectorPlacedField[] {
  const { fields, content, templateKey, sectionId, disabled, onChange } = input;

  return fields.map((field) => {
    if (field.type !== "action") return field;

    const key = premiumNativeActionKey(templateKey, sectionId, field.id);
    const saved = content.native_action_styles?.[key];
    const theme = premiumActionEditorTheme(content, templateKey, field.id);

    const change = (
      patch: Partial<PublicSiteNativeActionStyle>,
      property: string,
    ) =>
      onChange(
        mergeNativeActionStyle(content, key, patch),
        `premium-action:${key}:${property}`,
      );

    return {
      ...field,
      disabled: field.disabled || disabled,
      appearance: {
        size:
          saved?.size === "small" ||
          saved?.size === "medium" ||
          saved?.size === "large"
            ? saved.size
            : theme.size,
        backgroundColor: isSiteHexColor(saved?.background_color)
          ? saved.background_color
          : theme.backgroundColor,
        textColor: isSiteHexColor(saved?.text_color)
          ? saved.text_color
          : theme.textColor,
        onSizeChange: (value) => change({ size: value }, "size"),
        onBackgroundColorChange: (value) =>
          change({ background_color: value }, "background"),
        onTextColorChange: (value) =>
          change({ text_color: value }, "text-color"),
      },
    };
  });
}

export function premiumNativeActionStyleSheet(
  content: PublicSiteContent,
  templateKey: string,
) {
  const rules: string[] = [];
  const prefix = `${templateKey}:`;

  for (const [key, raw] of Object.entries(content.native_action_styles ?? {})) {
    if (!key.startsWith(prefix) || !SAFE_PREMIUM_ACTION_KEY.test(key)) continue;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;

    const style = raw as PublicSiteNativeActionStyle;
    const css = publicSiteButtonAppearanceCss(
      {
        size:
          style.size === "small" ||
          style.size === "medium" ||
          style.size === "large"
            ? style.size
            : undefined,
        backgroundColor: isSiteHexColor(style.background_color)
          ? style.background_color
          : undefined,
        textColor: isSiteHexColor(style.text_color)
          ? style.text_color
          : undefined,
      },
    );

    // Native premium templates often style CTA anchors with selectors such as
    // ".actions a" or ".actions a + a". A saved editor override is an explicit
    // user choice, so it must win over the untouched template defaults.
    const prioritizedCss = css
      .split(";")
      .filter(Boolean)
      .map((declaration) => `${declaration}!important`)
      .join(";");

    if (prioritizedCss) {
      rules.push(`[data-premium-action="${key}"]{${prioritizedCss}}`);
    }
  }

  return rules.join("\n");
}
