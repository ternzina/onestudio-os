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
const SAFE_FONT_FAMILY = new Set([
  "Arial",
  "Arial Black",
  "Baskerville",
  "Book Antiqua",
  "Brush Script MT",
  "Century Gothic",
  "Comic Sans MS",
  "Garamond",
  "Georgia",
  "Gill Sans",
  "Helvetica",
  "Impact",
  "Lucida Console",
  "Monaco",
  "Palatino Linotype",
  "Tahoma",
  "Times New Roman",
  "Verdana",
  "Trebuchet MS",
  "Courier New",
]);
const SAFE_FONT_SIZES = new Set([12, 14, 16, 18, 20, 24, 28, 32]);

export function isRichTextValue(value?: string | null): value is string {
  return Boolean(value?.startsWith(RICH_TEXT_PREFIX));
}

export function encodeRichText(document: RichTextDocument): string {
  return `${RICH_TEXT_PREFIX}${JSON.stringify(document)}`;
}

export function decodeRichText(value?: string | null): RichTextDocument | null {
  if (!isRichTextValue(value)) return null;
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
  const family = value?.replace(/["']/g, "").trim() ?? "";
  return SAFE_FONT_FAMILY.has(family) ? family : undefined;
}

export function normalizeRichTextFontSize(value?: string | number | null) {
  const size = typeof value === "number" ? value : Number.parseInt(value ?? "", 10);
  return SAFE_FONT_SIZES.has(size) ? size : undefined;
}
