export const PUBLIC_SITE_HTML_SOURCE_MAX_LENGTH = 20_000;
export const PUBLIC_SITE_EMBED_HEIGHT_MIN = 180;
export const PUBLIC_SITE_EMBED_HEIGHT_MAX = 900;

const ALLOWED_TAGS = new Set(["a", "article", "aside", "blockquote", "br", "div", "em", "figcaption", "figure", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "img", "li", "ol", "p", "section", "span", "strong", "ul"]);
const VOID_TAGS = new Set(["br", "hr", "img"]);
const SAFE_STYLE_PROPERTIES = new Set([
  "color", "background-color", "font-size", "font-weight", "font-style", "text-align", "line-height", "letter-spacing", "text-decoration",
  "margin", "margin-top", "margin-right", "margin-bottom", "margin-left", "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "border", "border-width", "border-style", "border-color", "border-radius", "width", "max-width", "min-width", "height", "max-height", "min-height",
  "display", "gap", "justify-content", "align-items",
]);
const SAFE_KEYWORDS = /^(?:auto|none|normal|inherit|initial|transparent|currentcolor|block|inline|inline-block|flex|inline-flex|grid|inline-grid|start|end|center|left|right|justify|stretch|space-between|space-around|space-evenly|baseline|bold|bolder|lighter|italic|oblique|underline|line-through|solid|dashed|dotted|double)$/i;
const SAFE_COLOR = /^(?:#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)|hsla?\(\s*\d{1,3}(?:deg)?\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)|[a-z]{3,20})$/i;
const SAFE_LENGTH = /^(?:0|(?:\d+(?:\.\d+)?)(?:px|rem|em|%|vh|vw))$/i;

function safeStyleValue(property: string, value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > 160 || /[\\{}@;]|\/\*|!important|url\s*\(|expression\s*\(|javascript\s*:|data\s*:|-moz-binding|behavior\s*:|position\s*:/i.test(normalized)) return false;
  if (["color", "background-color", "border-color"].includes(property)) return SAFE_COLOR.test(normalized);
  if (property === "display") return /^(?:block|inline|inline-block|flex|inline-flex|grid|inline-grid|none)$/i.test(normalized);
  if (property === "font-style") return /^(?:normal|italic|oblique)$/i.test(normalized);
  if (property === "font-weight") return /^(?:normal|bold|bolder|lighter|[1-9]00)$/i.test(normalized);
  if (property === "text-align") return /^(?:left|right|center|justify|start|end)$/i.test(normalized);
  if (property === "text-decoration") return /^(?:none|underline|line-through)$/i.test(normalized);
  if (property === "justify-content") return /^(?:start|end|center|stretch|space-between|space-around|space-evenly)$/i.test(normalized);
  if (property === "align-items") return /^(?:start|end|center|stretch|baseline)$/i.test(normalized);
  if (property === "border-style") return /^(?:none|solid|dashed|dotted|double)$/i.test(normalized);
  if (property === "border") {
    const match = normalized.match(/^(?:0|(?:(\d+(?:\.\d+)?)(px|rem|em)\s+)?(?:none|solid|dashed|dotted|double)(?:\s+(?:#[0-9a-f]{3,8}|[a-z]{3,20}))?)$/i);
    if (!match) return false;
    return !match[1] || Number(match[1]) <= (match[2].toLowerCase() === "px" ? 2000 : 100);
  }
  const values = normalized.split(" ");
  if (values.length > 4) return false;
  if (!values.every(item => SAFE_LENGTH.test(item) || SAFE_KEYWORDS.test(item))) return false;
  return values.every(item => {
    const match = item.match(/^(\d+(?:\.\d+)?)(px|rem|em|%|vh|vw)$/i);
    if (!match) return true;
    const amount = Number(match[1]);
    if (property === "font-size") return amount <= (match[2].toLowerCase() === "px" ? 120 : 10);
    return amount <= (match[2].toLowerCase() === "px" ? 2000 : 100);
  });
}

export function sanitizePublicSiteInlineStyle(value?: string | null) {
  return (value ?? "").split(";").flatMap(declaration => {
    const separator = declaration.indexOf(":");
    if (separator < 1) return [];
    const property = declaration.slice(0, separator).trim().toLowerCase();
    const styleValue = declaration.slice(separator + 1).trim().replace(/\s+/g, " ");
    return SAFE_STYLE_PROPERTIES.has(property) && safeStyleValue(property, styleValue) ? [`${property}: ${styleValue}`] : [];
  }).join("; ");
}

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
      if (name.startsWith("on") || ["srcdoc", "formaction", "xmlns"].includes(name)) return "";
      if (!["href", "src", "alt", "title", "target", "rel", "style"].includes(name)) return "";
      const value = rawValue.replace(/^['"]|['"]$/g, "").trim();
      if (name === "style") {
        const safeStyle = sanitizePublicSiteInlineStyle(value);
        if (safeStyle) attrs.push(`style="${safeStyle.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`);
        return "";
      }
      if ((name === "href" || name === "src") && !/^(https?:|mailto:|tel:|\/|#)/i.test(value)) return "";
      if (name === "target" && value !== "_blank") return "";
      attrs.push(`${name}="${value.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`);
      return "";
    });
    if (tag === "a" && attrs.some(attr => attr === 'target="_blank"')) attrs.push('rel="noopener noreferrer"');
    return `<${tag}${attrs.length ? ` ${attrs.join(" ")}` : ""}>`;
  });
}
