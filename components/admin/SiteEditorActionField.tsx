"use client";

import { useId } from "react";
import { editorCompactFieldClass } from "@/components/admin/EditorChrome";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import { editorActionHrefKind } from "@/lib/public-site/editor-actions";
import type { EditorActionAppearance } from "@/lib/public-site/editor-spec";

const BUTTON_SIZE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
] as const;

export default function SiteEditorActionField({
  label,
  text,
  href = "",
  originalText,
  originalHref,
  disabled = false,
  destinations = [],
  destinationHint,
  appearance,
  onTextChange,
  onHrefChange,
}: {
  label: string;
  text: string;
  href?: string;
  originalText?: string;
  originalHref?: string;
  disabled?: boolean;
  destinations?: readonly { value: string; label: string }[];
  destinationHint?: string;
  appearance?: EditorActionAppearance;
  onTextChange: (value: string) => void;
  onHrefChange?: (value: string) => void;
}) {
  const { t } = useAdminI18n();
  const textId = useId();
  const hrefId = useId();
  const hrefKind = editorActionHrefKind(href);
  const textChanged = originalText !== undefined && text !== originalText;
  const hrefChanged = originalHref !== undefined && href !== originalHref;
  const changed = textChanged || hrefChanged;
  const status = {
    default: t("Template action"),
    section: t("Section of this page"),
    page: t("Page of this site"),
    external: t("External website"),
    email: t("Email action"),
    phone: t("Phone action"),
    invalid: t("Invalid button link"),
  }[hrefKind];

  return <div data-site-editor-action-field className="grid gap-3 rounded-2xl border border-black/8 bg-white p-3">
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold text-[#292722]">{label}</span>
      <span className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${hrefKind === "invalid" ? "text-red-600" : changed ? "text-[#9a742e]" : "text-[#8b877e]"}`}>{status}</span>
    </div>
    <label htmlFor={textId} className="grid gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
      {t("Button text")}
      <input id={textId} className={editorCompactFieldClass} value={text} disabled={disabled} maxLength={120} onChange={(event) => onTextChange(event.target.value)} />
    </label>
    {onHrefChange ? <>
      {destinations.length ? <div className="grid gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">{t("Quick destination")}</span>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={disabled} aria-pressed={!href} onClick={() => onHrefChange("")} className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold disabled:opacity-40 ${!href ? "border-[#9a742e] bg-[#fbf7ee] text-[#6f5216]" : "border-black/10 bg-white text-[#716d65]"}`}>{t("Template action")}</button>
          {destinations.map((destination) => <button key={destination.value} type="button" disabled={disabled} aria-pressed={href === destination.value} onClick={() => onHrefChange(destination.value)} className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold disabled:opacity-40 ${href === destination.value ? "border-[#9a742e] bg-[#fbf7ee] text-[#6f5216]" : "border-black/10 bg-white text-[#716d65]"}`}>{destination.label}</button>)}
        </div>
      </div> : null}
      <label htmlFor={hrefId} className="grid gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">
        {t("Link destination")}
        <input id={hrefId} className={editorCompactFieldClass} value={href} disabled={disabled} maxLength={1000} aria-invalid={hrefKind === "invalid"} placeholder="#contact, /page or https://example.com" onChange={(event) => onHrefChange(event.target.value)} />
      </label>
      {hrefKind === "invalid" ? <p role="alert" className="text-[10px] leading-5 text-red-600">{t("Use a page section, site page or secure https link.")}</p> : null}
    </> : <p className="rounded-xl bg-[#f6f4ef] px-3 py-2 text-[10px] leading-5 text-[#716d65]">{t("Destination is fixed by the template")}{destinationHint ? ` ${destinationHint}` : ""}</p>}
    {originalText !== undefined || originalHref !== undefined ? <div className="flex flex-wrap gap-3">
      {originalText !== undefined ? <button type="button" disabled={disabled || !textChanged} onClick={() => onTextChange(originalText)} className="text-[10px] font-semibold text-[#8a6a2a] underline decoration-[#8a6a2a]/35 underline-offset-2 disabled:opacity-35">{t("Restore original button text")}</button> : null}
      {originalHref !== undefined && onHrefChange ? <button type="button" disabled={disabled || !hrefChanged} onClick={() => onHrefChange(originalHref)} className="text-[10px] font-semibold text-[#8a6a2a] underline decoration-[#8a6a2a]/35 underline-offset-2 disabled:opacity-35">{t("Restore original button link")}</button> : null}
    </div> : null}
    {appearance ? <div data-site-editor-action-appearance className="grid gap-3 border-t border-black/8 pt-3">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#716d65]">{t("Appearance")}</span>
      <div className="grid gap-2">
        <span className="text-[10px] font-semibold text-[#716d65]">{t("Size")}</span>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#f3f1ec] p-1">
          {BUTTON_SIZE_OPTIONS.map((option) => <button
            key={option.value}
            type="button"
            disabled={disabled}
            aria-pressed={appearance.size === option.value}
            onClick={() => appearance.onSizeChange(option.value)}
            className={`rounded-lg px-2 py-2 text-[10px] font-semibold transition disabled:opacity-40 ${appearance.size === option.value ? "bg-white text-[#292722] shadow-sm" : "text-[#716d65]"}`}
          >{t(option.label)}</button>)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-2 text-[10px] font-semibold text-[#716d65]">
          {t("Background")}
          <span className="flex min-w-0 items-center gap-2 rounded-xl border border-black/10 bg-[#faf9f6] px-2 py-2">
            <input aria-label={`${label} · ${t("Background")}`} type="color" disabled={disabled} value={appearance.backgroundColor} onChange={(event) => appearance.onBackgroundColorChange(event.currentTarget.value)} className="h-7 w-7 shrink-0 cursor-pointer border-0 bg-transparent p-0" />
            <span className="truncate font-mono text-[9px] uppercase">{appearance.backgroundColor}</span>
          </span>
        </label>
        <label className="grid gap-2 text-[10px] font-semibold text-[#716d65]">
          {t("Text color")}
          <span className="flex min-w-0 items-center gap-2 rounded-xl border border-black/10 bg-[#faf9f6] px-2 py-2">
            <input aria-label={`${label} · ${t("Text color")}`} type="color" disabled={disabled} value={appearance.textColor} onChange={(event) => appearance.onTextColorChange(event.currentTarget.value)} className="h-7 w-7 shrink-0 cursor-pointer border-0 bg-transparent p-0" />
            <span className="truncate font-mono text-[9px] uppercase">{appearance.textColor}</span>
          </span>
        </label>
      </div>
    </div> : null}
  </div>;
}
