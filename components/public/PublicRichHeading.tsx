import type { CSSProperties, ReactNode } from "react";
import {
  decodeRichText,
  normalizeRichTextColor,
  normalizeRichTextFontFamily,
  normalizeRichTextHref,
  richHeadingFontSizeScale,
  type RichTextNode,
} from "@/lib/public-site/rich-text";

type HeadingLine = RichTextNode[];

function nodeStyle(node: RichTextNode, inheritedFontSizeScale: number): CSSProperties {
  const color = normalizeRichTextColor(node.color);
  const fontFamily = normalizeRichTextFontFamily(node.fontFamily);
  const fontSizeScale = richHeadingFontSizeScale(node.fontSize);
  return {
    ...(color ? { color } : {}),
    ...(fontFamily ? { fontFamily } : {}),
    ...(fontSizeScale ? { fontSize: `${fontSizeScale / inheritedFontSizeScale}em` } : {}),
  };
}

function splitNodes(nodes: readonly RichTextNode[]): HeadingLine[] {
  const lines: HeadingLine[] = [[]];
  const append = (parts: HeadingLine[]) => {
    lines.at(-1)!.push(...(parts[0] ?? []));
    for (const part of parts.slice(1)) lines.push([...part]);
  };

  for (const node of nodes) {
    if (node.type === "br") {
      lines.push([]);
      continue;
    }
    if (node.type === "text") {
      const chunks = (node.text ?? "").split("\n");
      append(chunks.map((text) => text ? [{ ...node, text }] : []));
      continue;
    }
    const childLines = splitNodes(node.children ?? []);
    const structural = ["root", "p", "ul", "ol", "li"].includes(node.type);
    const styledStructural = structural && (node.color || node.fontFamily || node.fontSize);
    append(childLines.map((children) => structural && !styledStructural
      ? children
      : [{ ...node, type: styledStructural ? "span" : node.type, children }]));
  }
  return lines;
}

function headingLines(value: string): HeadingLine[] {
  const documentValue = decodeRichText(value);
  if (!documentValue) {
    return (value || "").split("\n").map((text) => text ? [{ type: "text", text }] : []);
  }

  const lines: HeadingLine[] = [];
  for (const node of documentValue.root.children ?? []) {
    const nodeLines = splitNodes([node]);
    const isBlock = ["p", "ul", "ol", "li"].includes(node.type);
    if (isBlock && lines.length && lines.at(-1)!.length) lines.push([]);
    if (!lines.length) lines.push(...nodeLines);
    else {
      lines.at(-1)!.push(...(nodeLines[0] ?? []));
      lines.push(...nodeLines.slice(1));
    }
  }
  return lines.length ? lines : [[]];
}

function renderNode(node: RichTextNode, key: string, inheritedFontSizeScale = 1): ReactNode {
  if (node.type === "text") return node.text ?? "";
  const fontSizeScale = richHeadingFontSizeScale(node.fontSize) ?? inheritedFontSizeScale;
  const children = (node.children ?? []).map((child, index) => renderNode(child, `${key}-${index}`, fontSizeScale));
  const style = nodeStyle(node, inheritedFontSizeScale);
  if (node.type === "strong") return <strong key={key}>{children}</strong>;
  if (node.type === "em") return <em key={key}>{children}</em>;
  if (node.type === "u") return <u key={key}>{children}</u>;
  if (node.type === "a") {
    const href = normalizeRichTextHref(node.href);
    return href ? <a key={key} href={href}>{children}</a> : <span key={key}>{children}</span>;
  }
  return <span key={key} style={style}>{children}</span>;
}

function renderLine(line: HeadingLine, key: string) {
  return line.map((node, index) => renderNode(node, `${key}-${index}`));
}

export default function PublicRichHeading({
  value,
  lineClassName,
  accentAfterFirst = false,
  emphasizeAfterFirst = false,
  italicizeLast = false,
}: {
  value?: string | null;
  lineClassName?: string | ((index: number) => string);
  accentAfterFirst?: boolean;
  emphasizeAfterFirst?: boolean;
  italicizeLast?: boolean;
}) {
  if (!value) return null;
  const lines = headingLines(value);
  if (accentAfterFirst && lines.length > 1) {
    return <>{renderLine(lines[0], "heading-0")}<br /><i>{lines.slice(1).map((line, index) => <span key={`accent-${index}`}>{index ? " " : null}{renderLine(line, `heading-${index + 1}`)}</span>)}</i></>;
  }
  if (lineClassName) {
    return <>{lines.map((line, index) => {
      const content = renderLine(line, `heading-${index}`);
      const inner = italicizeLast && index === lines.length - 1
        ? <i>{content}</i>
        : emphasizeAfterFirst && index > 0
          ? <em>{content}</em>
          : <span>{content}</span>;
      return <span key={`heading-line-${index}`} className={typeof lineClassName === "function" ? lineClassName(index) : lineClassName}>{inner}</span>;
    })}</>;
  }
  return <>{lines.map((line, index) => <span key={`heading-line-${index}`}>{index ? <br /> : null}{renderLine(line, `heading-${index}`)}</span>)}</>;
}
