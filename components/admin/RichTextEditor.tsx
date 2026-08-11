"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import {
  decodeRichText,
  encodeRichText,
  normalizeRichTextColor,
  normalizeRichTextFontFamily,
  normalizeRichTextFontSize,
  normalizeRichTextHref,
  richTextPlainText,
  type RichTextDocument,
  type RichTextNode,
} from "@/lib/public-site/rich-text";
import { SITE_EDITOR_FONT_OPTIONS } from "@/lib/public-site/site-editor-fonts";

const EMPTY_DOC: RichTextDocument = {
  version: 1,
  root: { type: "root", children: [{ type: "p", children: [] }] },
};

const FONT_OPTIONS = [{ value: "", label: "Шрифт сайта" }, ...SITE_EDITOR_FONT_OPTIONS];

const SIZE_OPTIONS = [12, 14, 16, 18, 20, 24, 28, 32];

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char] ?? char);
}

function styleText(node: RichTextNode) {
  const styles: string[] = [];
  if (node.align) styles.push(`text-align:${node.align}`);
  if (node.color) styles.push(`color:${node.color}`);
  if (node.fontFamily) styles.push(`font-family:${escapeHtml(node.fontFamily)}`);
  if (node.fontSize) styles.push(`font-size:${node.fontSize}px`);
  return styles.length ? ` style="${styles.join(";")}"` : "";
}

function nodeToHtml(node: RichTextNode): string {
  if (node.type === "text") return escapeHtml(node.text ?? "");
  if (node.type === "br") return "<br>";
  const children = (node.children ?? []).map(nodeToHtml).join("");
  const style = styleText(node);
  switch (node.type) {
    case "p": return `<p${style}>${children}</p>`;
    case "ul": return `<ul${style}>${children}</ul>`;
    case "ol": return `<ol${style}>${children}</ol>`;
    case "li": return `<li${style}>${children}</li>`;
    case "strong": return `<strong>${children}</strong>`;
    case "em": return `<em>${children}</em>`;
    case "u": return `<u>${children}</u>`;
    case "span": return `<span${style}>${children}</span>`;
    case "a": return `<a href="${escapeHtml(normalizeRichTextHref(node.href) ?? "#")}">${children}</a>`;
    case "root": return children;
    default: return children;
  }
}

function valueToHtml(value: string) {
  const documentValue = decodeRichText(value);
  if (documentValue) return nodeToHtml(documentValue.root);
  const plain = value || "";
  return plain
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function parseElement(element: Element): RichTextNode | null {
  const tag = element.tagName.toLowerCase();
  const children = Array.from(element.childNodes).flatMap((child) => {
    const parsed = parseDomNode(child);
    return parsed ? [parsed] : [];
  });
  const style = (element as HTMLElement).style;
  const align = ["left", "center", "right", "justify"].includes(style.textAlign)
    ? style.textAlign as RichTextNode["align"]
    : undefined;
  const color = normalizeRichTextColor(style.color) || normalizeRichTextColor(element.getAttribute("color"));
  const fontFamily = normalizeRichTextFontFamily(style.fontFamily) || normalizeRichTextFontFamily(element.getAttribute("face"));
  const fontSize = normalizeRichTextFontSize(style.fontSize);

  if (tag === "p" || tag === "div") return { type: "p", align, color, fontFamily, fontSize, children };
  if (tag === "ul") return { type: "ul", align, color, fontFamily, fontSize, children };
  if (tag === "ol") return { type: "ol", align, color, fontFamily, fontSize, children };
  if (tag === "li") return { type: "li", align, color, fontFamily, fontSize, children };
  if (tag === "b" || tag === "strong") return { type: "strong", children };
  if (tag === "i" || tag === "em") return { type: "em", children };
  if (tag === "u") return { type: "u", children };
  if (tag === "br") return { type: "br" };
  if (tag === "a") return { type: "a", href: normalizeRichTextHref(element.getAttribute("href")), children };
  if (tag === "span" || tag === "font") return { type: "span", color, fontFamily, fontSize, children };
  return children.length ? { type: "span", children } : null;
}

function parseDomNode(node: Node): RichTextNode | null {
  if (node.nodeType === Node.TEXT_NODE) return { type: "text", text: node.textContent ?? "" };
  if (node.nodeType === Node.ELEMENT_NODE) return parseElement(node as Element);
  return null;
}

function editorToDocument(editor: HTMLElement): RichTextDocument {
  const children = Array.from(editor.childNodes).flatMap((child) => {
    const parsed = parseDomNode(child);
    return parsed ? [parsed] : [];
  });
  return {
    version: 1,
    root: { type: "root", children: children.length ? children : EMPTY_DOC.root.children },
  };
}

function runCommand(command: string, value?: string) {
  document.execCommand(command, false, value);
}

function ToolbarButton({ label, title, disabled, onClick, wide = false }: { label: string; title: string; disabled: boolean; onClick: () => void; wide?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`grid h-8 place-items-center rounded-lg border border-black/10 bg-white px-2 text-xs font-semibold text-[#403d38] transition hover:border-[#9a742e]/50 hover:bg-[#fffaf0] disabled:opacity-35 ${wide ? "min-w-[76px]" : "min-w-8"}`}
    >
      {label}
    </button>
  );
}

export default function RichTextEditor({
  label,
  ariaLabel,
  value,
  disabled,
  onChange,
}: {
  label?: string;
  ariaLabel?: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const { t } = useAdminI18n();
  const editorRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<Range | null>(null);
  const [sourceMode, setSourceMode] = useState(false);
  const [fontFamily, setFontFamily] = useState("");
  const [fontSize, setFontSize] = useState("16");
  const lastEmittedRef = useRef(value);

  function saveSelection() {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? range.commonAncestorContainer as Element
      : range.commonAncestorContainer.parentElement;
    if (container && editor.contains(container)) selectionRef.current = range.cloneRange();
  }

  function restoreSelection() {
    const editor = editorRef.current;
    const saved = selectionRef.current;
    if (!editor || !saved) return false;
    const container = saved.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? saved.commonAncestorContainer as Element
      : saved.commonAncestorContainer.parentElement;
    if (!container || !editor.contains(container)) return false;
    editor.focus({ preventScroll: true });
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(saved.cloneRange());
    return true;
  }

  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (!editor || sourceMode || document.activeElement === editor) return;
    if (value === lastEmittedRef.current && editor.innerHTML) return;
    editor.innerHTML = valueToHtml(value);
  }, [sourceMode, value]);

  useEffect(() => {
    const handleSelectionChange = () => saveSelection();
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const commit = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const documentValue = editorToDocument(editor);
    const encoded = encodeRichText(documentValue);
    const plain = richTextPlainText(encoded);
    const next = plain ? encoded : "";
    lastEmittedRef.current = next;
    onChange(next);
  };

  const command = (name: string, commandValue?: string) => {
    if (!restoreSelection()) editorRef.current?.focus({ preventScroll: true });
    runCommand(name, commandValue);
    saveSelection();
    commit();
  };

  const applyFontFamily = (family: string) => {
    setFontFamily(family);
    if (!restoreSelection()) editorRef.current?.focus({ preventScroll: true });
    if (!family) {
      runCommand("removeFormat");
    } else {
      runCommand("fontName", family);
    }
    saveSelection();
    commit();
  };

  const applyFontSize = (size: string) => {
    setFontSize(size);
    const normalized = normalizeRichTextFontSize(size);
    const editor = editorRef.current;
    if (!editor || !normalized) return;
    if (!restoreSelection()) editor.focus({ preventScroll: true });
    runCommand("fontSize", "7");
    editor.querySelectorAll('font[size="7"]').forEach((font) => {
      const span = document.createElement("span");
      span.style.fontSize = `${normalized}px`;
      while (font.firstChild) span.appendChild(font.firstChild);
      font.replaceWith(span);
    });
    saveSelection();
    commit();
  };

  const addLink = () => {
    const href = window.prompt("Ссылка", "https://");
    const safe = normalizeRichTextHref(href);
    if (safe) command("createLink", safe);
  };

  const clearFormatting = () => {
    if (!restoreSelection()) editorRef.current?.focus({ preventScroll: true });
    runCommand("removeFormat");
    runCommand("unlink");
    setFontFamily("");
    setFontSize("16");
    saveSelection();
    commit();
  };

  return (
    <div className="grid gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">
      <div className="flex items-center justify-between gap-3">
        {label ? <span>{label}</span> : <span />}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setSourceMode((current) => !current)}
          className="text-[9px] font-semibold normal-case tracking-normal text-[#8a6a2a] disabled:opacity-35"
        >
          {sourceMode ? t("Visual editor") : t("Plain text")}
        </button>
      </div>

      {sourceMode ? (
        <textarea
          aria-label={ariaLabel ?? label ?? "Текст"}
          rows={6}
          disabled={disabled}
          value={richTextPlainText(value)}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-black/10 bg-[#faf9f6] px-3 py-3 text-sm font-normal leading-6 normal-case tracking-normal outline-none focus:border-[#9a742e]"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-black/10 bg-[#faf9f6]">
          <div className="grid gap-2 border-b border-black/8 bg-[#f5f2eb] p-2 normal-case tracking-normal">
            <div className="flex flex-wrap gap-1">
              <select
                aria-label="Шрифт"
                disabled={disabled}
                value={fontFamily}
                onMouseDown={saveSelection}
                onChange={(event) => applyFontFamily(event.target.value)}
                className="h-8 min-w-[124px] rounded-lg border border-black/10 bg-white px-2 text-xs text-[#403d38] outline-none disabled:opacity-35"
              >
                {FONT_OPTIONS.map((option) => <option key={option.label} value={option.value} style={option.value ? { fontFamily: option.value } : undefined}>{option.label}</option>)}
              </select>
              <select
                aria-label="Размер текста"
                disabled={disabled}
                value={fontSize}
                onMouseDown={saveSelection}
                onChange={(event) => applyFontSize(event.target.value)}
                className="h-8 w-[72px] rounded-lg border border-black/10 bg-white px-2 text-xs text-[#403d38] outline-none disabled:opacity-35"
              >
                {SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}px</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-1">
              <ToolbarButton label="B" title="Жирный" disabled={disabled} onClick={() => command("bold")} />
              <ToolbarButton label="I" title="Курсив" disabled={disabled} onClick={() => command("italic")} />
              <ToolbarButton label="U" title="Подчёркивание" disabled={disabled} onClick={() => command("underline")} />
              <span className="mx-0.5 h-8 w-px bg-black/10" />
              <ToolbarButton label="•≡" title="Маркированный список" disabled={disabled} onClick={() => command("insertUnorderedList")} />
              <ToolbarButton label="1≡" title="Нумерованный список" disabled={disabled} onClick={() => command("insertOrderedList")} />
              <span className="mx-0.5 h-8 w-px bg-black/10" />
              <ToolbarButton label="≡←" title="По левому краю" disabled={disabled} onClick={() => command("justifyLeft")} />
              <ToolbarButton label="≡" title="По центру" disabled={disabled} onClick={() => command("justifyCenter")} />
              <ToolbarButton label="→≡" title="По правому краю" disabled={disabled} onClick={() => command("justifyRight")} />
              <ToolbarButton label="🔗" title="Ссылка" disabled={disabled} onClick={addLink} />
              <label title="Цвет текста" className="relative grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-black/10 bg-white text-[11px] font-semibold text-[#403d38]">
                A
                <input
                  type="color"
                  disabled={disabled}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onMouseDown={saveSelection}
                  onChange={(event) => command("foreColor", event.target.value)}
                />
                <span className="absolute inset-x-1 bottom-1 h-0.5 bg-[#9d3151]" />
              </label>
              <ToolbarButton label="Очистить" title="Очистить форматирование" wide disabled={disabled} onClick={clearFormatting} />
            </div>
          </div>
          <div
            ref={editorRef}
            contentEditable={!disabled}
            suppressContentEditableWarning
            role="textbox"
            aria-label={ariaLabel ?? label ?? "Текст"}
            aria-multiline="true"
            onInput={commit}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onBlur={() => { saveSelection(); commit(); }}
            className="os-rich-text-editor min-h-28 px-3 py-3 text-sm font-normal leading-6 normal-case tracking-normal text-[#332f29] outline-none"
          />
        </div>
      )}
      <p className="text-[9px] font-normal normal-case tracking-normal text-[#918b80]">
        Заголовки используют тот же список шрифтов в своих настройках. SEO, ссылки кнопок и контактные данные остаются обычными полями.
      </p>
    </div>
  );
}
