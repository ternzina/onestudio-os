import type { CSSProperties } from "react";
import type { PublicSiteTypography } from "@/lib/public-site/types";

const FONT_STACKS = {
  system: 'Inter, ui-sans-serif, system-ui, sans-serif',
  humanist: '"Trebuchet MS", ui-sans-serif, sans-serif',
  editorial: 'Georgia, "Times New Roman", serif',
} as const;

export function normalizeTypography(value?: PublicSiteTypography | null): PublicSiteTypography {
  if (!value || typeof value !== "object") return {};
  const fontSize = Number(value.font_size);
  const lineHeight = Number(value.line_height);
  const letterSpacing = Number(value.letter_spacing);
  return {
    ...(value.font_family && ["template", "system", "humanist", "editorial"].includes(value.font_family) ? { font_family: value.font_family } : {}),
    ...(fontSize >= 10 && fontSize <= 160 ? { font_size: fontSize } : {}),
    ...([400, 500, 600, 700].includes(Number(value.font_weight)) ? { font_weight: Number(value.font_weight) as 400 | 500 | 600 | 700 } : {}),
    ...(value.italic === true ? { italic: true } : {}),
    ...(value.underline === true ? { underline: true } : {}),
    ...(value.text_align && ["left", "center", "right", "justify"].includes(value.text_align) ? { text_align: value.text_align } : {}),
    ...(typeof value.color === "string" && /^#[0-9a-f]{6}$/i.test(value.color) ? { color: value.color.toLowerCase() } : {}),
    ...(lineHeight >= 0.8 && lineHeight <= 3 ? { line_height: lineHeight } : {}),
    ...(letterSpacing >= -5 && letterSpacing <= 20 ? { letter_spacing: letterSpacing } : {}),
  };
}

export function publicTypographyStyle(value?: PublicSiteTypography | null): CSSProperties {
  const typography = normalizeTypography(value);
  return {
    ...(typography.font_family && typography.font_family !== "template" ? { fontFamily: FONT_STACKS[typography.font_family] } : {}),
    ...(typography.font_size ? { fontSize: `${typography.font_size}px` } : {}),
    ...(typography.font_weight ? { fontWeight: typography.font_weight } : {}),
    ...(typography.italic ? { fontStyle: "italic" } : {}),
    ...(typography.underline ? { textDecoration: "underline" } : {}),
    ...(typography.text_align ? { textAlign: typography.text_align } : {}),
    ...(typography.color ? { color: typography.color } : {}),
    ...(typography.line_height ? { lineHeight: typography.line_height } : {}),
    ...(typeof typography.letter_spacing === "number" ? { letterSpacing: `${typography.letter_spacing}px` } : {}),
  };
}
