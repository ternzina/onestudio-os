export const PUBLIC_SITE_HTML_SOURCE_MAX_LENGTH = 20_000;
export const PUBLIC_SITE_EMBED_HEIGHT_MIN = 180;
export const PUBLIC_SITE_EMBED_HEIGHT_MAX = 900;

const ALLOWED_TAGS = new Set(["a", "article", "aside", "blockquote", "br", "div", "em", "figcaption", "figure", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "img", "li", "ol", "p", "section", "span", "strong", "ul"]);
const VOID_TAGS = new Set(["br", "hr", "img"]);

export function safePublicEmbedUrl(value?: string | null) {
  try {
    const url = new URL((value ?? "").trim());
    return url.protocol === "https:" ? url.toString() : "";
  } catch { return ""; }
}

export function boundedPublicEmbedHeight(value?: number | null) {
  return Math.min(PUBLIC_SITE_EMBED_HEIGHT_MAX, Math.max(PUBLIC_SITE_EMBED_HEIGHT_MIN, Number(value) || 420));
}

export function sanitizePublicSiteHtml(value?: string | null) {
  let source = (value ?? "").slice(0, PUBLIC_SITE_HTML_SOURCE_MAX_LENGTH);
  source = source.replace(/<!--([\s\S]*?)-->/g, "").replace(/<(script|style|iframe|object|embed|form|svg|math|template|link|meta|base)[^>]*>[\s\S]*?<\/\1\s*>/gi, "").replace(/<(script|style|iframe|object|embed|form|svg|math|template|link|meta|base)\b[^>]*\/?\s*>/gi, "");
  return source.replace(/<\/?([a-z][\w:-]*)\b([^>]*)>/gi, (whole, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (whole.startsWith("</")) return VOID_TAGS.has(tag) ? "" : `</${tag}>`;
    const attrs: string[] = [];
    rawAttrs.replace(/([a-zA-Z][\w:-]*)\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+)/g, (_match: string, rawName: string, rawValue: string) => {
      const name = rawName.toLowerCase();
      if (name.startsWith("on") || ["style", "srcdoc", "formaction", "xmlns"].includes(name)) return "";
      if (!["href", "src", "alt", "title", "target", "rel", "class"].includes(name)) return "";
      const value = rawValue.replace(/^['"]|['"]$/g, "").trim();
      if ((name === "href" || name === "src") && !/^(https?:|mailto:|tel:|\/|#)/i.test(value)) return "";
      if (name === "target" && value !== "_blank") return "";
      if (name === "class") return "";
      attrs.push(`${name}="${value.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`);
      return "";
    });
    if (tag === "a" && attrs.some(attr => attr === 'target="_blank"')) attrs.push('rel="noopener noreferrer"');
    return `<${tag}${attrs.length ? ` ${attrs.join(" ")}` : ""}>`;
  });
}
