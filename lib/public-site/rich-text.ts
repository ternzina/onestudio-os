import { normalizeSiteEditorFontFamily } from "./site-editor-fonts.ts";

export const RICH_TEXT_PREFIX = "__osrt1__:";

export type RichTextNode = {
  type: "root" | "p" | "ul" | "ol" | "li" | "br" | "strong" | "em" | "u" | "span" | "a" | "text";
  text?: string;
  align?: "left" | "center" | "right" | "justify";
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  href?: string;
  children?: RichTextNode[];
};

export type RichTextDocument = {
  version: 1;
  root: RichTextNode;
};

const HEX = /^#[0-9a-f]{6}$/i;
const RGB = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;
const SAFE_LINK = /^(https?:\/\/|mailto:|tel:|\/|#)/i;
const SAFE_FONT_SIZES = new Set([
  10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96,
  104, 120, 144, 160,
]);

export const RICH_HEADING_FONT_SIZE_BASE_PX = 16;

export function isRichTextValue(value?: string | null): boolean {
  return Boolean(value?.startsWith(RICH_TEXT_PREFIX));
}

export function encodeRichText(document: RichTextDocument): string {
  return `${RICH_TEXT_PREFIX}${JSON.stringify(document)}`;
}

export function decodeRichText(value?: string | null): RichTextDocument | null {
  if (!value?.startsWith(RICH_TEXT_PREFIX)) return null;
  try {
    const parsed = JSON.parse(value.slice(RICH_TEXT_PREFIX.length)) as RichTextDocument;
    if (parsed?.version !== 1 || parsed.root?.type !== "root") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function normalizeRichTextColor(value?: string | null) {
  if (!value) return undefined;
  if (HEX.test(value)) return value.toLowerCase();
  const rgb = value.match(RGB);
  if (!rgb) return undefined;
  const parts = rgb.slice(1).map((part) => Number(part));
  if (parts.some((part) => part < 0 || part > 255)) return undefined;
  return `#${parts.map((part) => part.toString(16).padStart(2, "0")).join("")}`;
}

export function normalizeRichTextHref(value?: string | null) {
  const href = value?.trim() ?? "";
  return href && SAFE_LINK.test(href) ? href.slice(0, 1000) : undefined;
}

export function richTextPlainText(value?: string | null): string {
  if (!value) return "";
  const document = decodeRichText(value);
  if (!document) return value;

  const walk = (node: RichTextNode): string => {
    if (node.type === "text") return node.text ?? "";
    if (node.type === "br") return "\n";
    const inner = (node.children ?? []).map(walk).join("");
    if (node.type === "p" || node.type === "li") return `${inner}\n`;
    return inner;
  };

  return walk(document.root).replace(/\n{3,}/g, "\n\n").trim();
}


export function normalizeRichTextFontFamily(value?: string | null) {
  return normalizeSiteEditorFontFamily(value);
}

export function normalizeRichTextFontSize(value?: string | number | null) {
  const size = typeof value === "number" ? value : Number.parseInt(value ?? "", 10);
  return SAFE_FONT_SIZES.has(size) ? size : undefined;
}

export function richHeadingFontSizeScale(value?: string | number | null) {
  const size = normalizeRichTextFontSize(value);
  return size ? size / RICH_HEADING_FONT_SIZE_BASE_PX : undefined;
}
