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
  if (!value) return null;
  const decodeCandidate = (candidate: string): RichTextDocument | null => {
    const json = candidate.startsWith(RICH_TEXT_PREFIX) ? candidate.slice(RICH_TEXT_PREFIX.length) : candidate;
    try {
      const parsed: unknown = JSON.parse(json);
      return isRichTextDocument(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };
  const direct = decodeCandidate(value);
  if (direct) return direct;
  try {
    const unwrapped: unknown = JSON.parse(value);
    return typeof unwrapped === "string" ? decodeCandidate(unwrapped) : null;
  } catch {
    return null;
  }
}

const NODE_TYPES = new Set<RichTextNode["type"]>(["root", "p", "ul", "ol", "li", "br", "strong", "em", "u", "span", "a", "text"]);
const NODE_KEYS = new Set(["type", "text", "align", "color", "fontFamily", "fontSize", "href", "children"]);

function isRichTextNode(value: unknown, depth = 0): value is RichTextNode {
  if (!value || typeof value !== "object" || Array.isArray(value) || depth > 32) return false;
  const node = value as Record<string, unknown>;
  if (typeof node.type !== "string" || !NODE_TYPES.has(node.type as RichTextNode["type"])) return false;
  if (Object.keys(node).some((key) => !NODE_KEYS.has(key))) return false;
  if (node.text !== undefined && typeof node.text !== "string") return false;
  if (node.align !== undefined && !["left", "center", "right", "justify"].includes(String(node.align))) return false;
  if (node.color !== undefined && typeof node.color !== "string") return false;
  if (node.fontFamily !== undefined && typeof node.fontFamily !== "string") return false;
  if (node.fontSize !== undefined && typeof node.fontSize !== "number") return false;
  if (node.href !== undefined && typeof node.href !== "string") return false;
  if (node.children !== undefined && (!Array.isArray(node.children) || node.children.length > 10_000 || !node.children.every((child) => isRichTextNode(child, depth + 1)))) return false;
  if (node.type === "text") return typeof node.text === "string" && node.children === undefined;
  if (node.type === "br") return node.children === undefined;
  return Array.isArray(node.children);
}

function isRichTextDocument(value: unknown): value is RichTextDocument {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const documentValue = value as Record<string, unknown>;
  return Object.keys(documentValue).every((key) => key === "version" || key === "root")
    && documentValue.version === 1
    && isRichTextNode(documentValue.root)
    && (documentValue.root as RichTextNode).type === "root";
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
