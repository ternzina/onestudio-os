import type { CSSProperties, ReactNode } from "react";
import {
  decodeRichText,
  normalizeRichTextColor,
  normalizeRichTextFontFamily,
  normalizeRichTextFontSize,
  normalizeRichTextHref,
  type RichTextNode,
} from "@/lib/public-site/rich-text";

function renderNode(node: RichTextNode, key: string): ReactNode {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "br") return <br key={key} />;

  const children = (node.children ?? []).map((child, index) => renderNode(child, `${key}-${index}`));
  const color = normalizeRichTextColor(node.color);
  const fontFamily = normalizeRichTextFontFamily(node.fontFamily);
  const fontSize = normalizeRichTextFontSize(node.fontSize);
  const style: CSSProperties = {
    ...(node.align ? { textAlign: node.align } : {}),
    ...(color ? { color } : {}),
    ...(fontFamily ? { fontFamily } : {}),
    ...(fontSize ? { fontSize: `${fontSize}px` } : {}),
  };

  switch (node.type) {
    case "p": return <p key={key} style={style}>{children}</p>;
    case "ul": return <ul key={key} style={style}>{children}</ul>;
    case "ol": return <ol key={key} style={style}>{children}</ol>;
    case "li": return <li key={key} style={style}>{children}</li>;
    case "strong": return <strong key={key}>{children}</strong>;
    case "em": return <em key={key}>{children}</em>;
    case "u": return <u key={key}>{children}</u>;
    case "span": return <span key={key} style={style}>{children}</span>;
    case "a": {
      const href = normalizeRichTextHref(node.href);
      return href ? <a key={key} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>{children}</a> : <span key={key}>{children}</span>;
    }
    case "root": return <>{children}</>;
    default: return <>{children}</>;
  }
}

export default function PublicRichText({ value, className = "" }: { value?: string | null; className?: string }) {
  if (!value) return null;
  const documentValue = decodeRichText(value);
  if (!documentValue) return <p className={`${className} whitespace-pre-line`}>{value}</p>;
  return <div className={`os-rich-text ${className}`}>{renderNode(documentValue.root, "root")}</div>;
}
