import {
  decodeRichText,
  normalizeRichTextColor,
  normalizeRichTextHref,
  richTextPlainText,
  type RichTextNode,
} from "../public-site/rich-text.ts";
import { sanitizePublicSiteHtml } from "../public-site/safe-html.ts";

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    if (char === '"') return "&quot;";
    return "&#39;";
  });
}

export function plainText(value?: string | null): string {
  return richTextPlainText(value).replace(/\s+/g, " ").trim();
}

function styleFor(node: RichTextNode): string {
  const parts: string[] = [];
  const color = normalizeRichTextColor(node.color);
  if (color) parts.push(`color:${color}`);
  if (node.fontSize && node.fontSize >= 10 && node.fontSize <= 96) parts.push(`font-size:${node.fontSize}px`);
  if (node.align) parts.push(`text-align:${node.align}`);
  return parts.length ? ` style="${parts.join(";")}"` : "";
}

function renderNode(node: RichTextNode): string {
  if (node.type === "text") return escapeHtml(node.text ?? "");
  if (node.type === "br") return "<br>";
  const children = (node.children ?? []).map(renderNode).join("");
  if (node.type === "root") return children;
  if (node.type === "p") return `<p${styleFor(node)}>${children}</p>`;
  if (node.type === "ul") return `<ul>${children}</ul>`;
  if (node.type === "ol") return `<ol>${children}</ol>`;
  if (node.type === "li") return `<li>${children}</li>`;
  if (node.type === "strong") return `<strong>${children}</strong>`;
  if (node.type === "em") return `<em>${children}</em>`;
  if (node.type === "u") return `<u>${children}</u>`;
  if (node.type === "span") return `<span${styleFor(node)}>${children}</span>`;
  if (node.type === "a") {
    const href = normalizeRichTextHref(node.href);
    if (!href) return children;
    const external = /^https?:/i.test(href);
    const rel = external ? ` target="_blank" rel="noopener noreferrer"` : "";
    return `<a href="${escapeHtml(href)}"${rel}>${children}</a>`;
  }
  return children;
}

export function richToHtml(value?: string | null): string {
  if (!value) return "";
  const document = decodeRichText(value);
  if (!document) {
    const safe = sanitizePublicSiteHtml(value);
    if (safe && safe !== value.replace(/<!--([\s\S]*?)-->/g, "")) return safe;
    return `<p>${escapeHtml(plainText(value) || value)}</p>`;
  }
  return renderNode(document.root);
}

export function jsonLdScript(data: unknown): string {
  if (!data) return "";
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">${json}</script>`;
}

export function absoluteUrl(origin: string, path: string): string {
  if (path === "/") return origin;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}
