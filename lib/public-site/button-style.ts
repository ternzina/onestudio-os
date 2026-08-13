import type { CSSProperties } from "react";
import { isSiteHexColor } from "./colors.ts";
import type {
  PublicSiteButtonSize,
  PublicSiteCustomBlock,
} from "./types.ts";

export type PublicSiteButtonTheme = {
  size: PublicSiteButtonSize;
  backgroundColor: string;
  textColor: string;
};

export type PublicSiteButtonAppearance = {
  size?: PublicSiteButtonSize;
  backgroundColor?: string;
  textColor?: string;
};

const dimensions: Record<PublicSiteButtonSize, CSSProperties> = {
  small: { minHeight: 40, paddingInline: 16, fontSize: 12 },
  medium: { minHeight: 48, paddingInline: 24, fontSize: 14 },
  large: { minHeight: 56, paddingInline: 30, fontSize: 16 },
};

export function normalizePublicSiteButtonAppearance(value: unknown): PublicSiteButtonAppearance | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const source = value as Record<string, unknown>;
  const result: PublicSiteButtonAppearance = {};
  if (source.size === "small" || source.size === "medium" || source.size === "large") result.size = source.size;
  if (typeof source.backgroundColor === "string" && isSiteHexColor(source.backgroundColor)) result.backgroundColor = source.backgroundColor;
  if (typeof source.textColor === "string" && isSiteHexColor(source.textColor)) result.textColor = source.textColor;
  return Object.keys(result).length ? result : undefined;
}

export function publicSiteButtonAppearanceStyle(appearance?: PublicSiteButtonAppearance): CSSProperties {
  if (!appearance) return {};
  return {
    ...(appearance.size ? dimensions[appearance.size] : {}),
    ...(isSiteHexColor(appearance.backgroundColor) ? { backgroundColor: appearance.backgroundColor } : {}),
    ...(isSiteHexColor(appearance.textColor) ? { color: appearance.textColor } : {}),
  };
}

export function publicSiteButtonAppearanceCss(
  appearance?: PublicSiteButtonAppearance,
  options: { importantColor?: boolean } = {},
) {
  const style = publicSiteButtonAppearanceStyle(appearance);
  const declarations: string[] = [];
  if (typeof style.minHeight === "number") declarations.push(`min-height:${style.minHeight}px`);
  if (typeof style.paddingInline === "number") declarations.push(`padding-inline:${style.paddingInline}px`);
  if (typeof style.fontSize === "number") declarations.push(`font-size:${style.fontSize}px`);
  if (typeof style.backgroundColor === "string") declarations.push(`background-color:${style.backgroundColor}`);
  if (typeof style.color === "string") declarations.push(`color:${style.color}${options.importantColor ? "!important" : ""}`);
  return declarations.join(";");
}

export function defaultPublicSiteButtonTheme(
  block: PublicSiteCustomBlock,
): PublicSiteButtonTheme {
  const inverse = block.tone === "dark" || block.tone === "accent";
  const customAccent = block.colors?.mode === "custom" && isSiteHexColor(block.colors.accent)
    ? block.colors.accent
    : null;

  return inverse
    ? {
        size: "medium",
        backgroundColor: "#ffffff",
        textColor: "var(--site-dark, #202229)",
      }
    : {
        size: "medium",
        backgroundColor: customAccent ?? "var(--site-dark, #202229)",
        textColor: "#ffffff",
      };
}

export function publicSiteButtonStyle(
  block: PublicSiteCustomBlock,
  theme = defaultPublicSiteButtonTheme(block),
): CSSProperties {
  const size = block.button_size ?? theme.size;
  return {
    ...dimensions[size],
    backgroundColor: isSiteHexColor(block.button_background)
      ? block.button_background
      : theme.backgroundColor,
    color: isSiteHexColor(block.button_text_color)
      ? block.button_text_color
      : theme.textColor,
  };
}
