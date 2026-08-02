import type { CSSProperties } from "react";
import type {
  PublicSiteBlockColors,
  PublicSiteCanvasSection,
  PublicSiteContent,
} from "@/lib/public-site/types";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function isSiteHexColor(value?: string | null): value is string {
  return Boolean(value && HEX_COLOR.test(value));
}

export function sectionColorOverride(
  content: PublicSiteContent,
  section: PublicSiteCanvasSection,
) {
  const colors = content.section_colors?.[section];
  return colors?.mode === "custom" ? colors : null;
}

export function colorOverrideStyle(
  colors?: PublicSiteBlockColors | null,
): CSSProperties {
  if (colors?.mode !== "custom") return {};

  const style: CSSProperties & Record<string, string> = {};
  if (isSiteHexColor(colors.background)) style.backgroundColor = colors.background;
  if (isSiteHexColor(colors.text)) style.color = colors.text;
  if (isSiteHexColor(colors.accent)) {
    style["--site-accent"] = colors.accent;
    style["--site-section-accent"] = colors.accent;
  }
  return style;
}

export function sectionColorStyle(
  content: PublicSiteContent,
  section: PublicSiteCanvasSection,
): CSSProperties {
  return colorOverrideStyle(sectionColorOverride(content, section));
}
