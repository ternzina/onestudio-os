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

const dimensions: Record<PublicSiteButtonSize, CSSProperties> = {
  small: { minHeight: 40, paddingInline: 16, fontSize: 12 },
  medium: { minHeight: 48, paddingInline: 24, fontSize: 14 },
  large: { minHeight: 56, paddingInline: 30, fontSize: 16 },
};

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
