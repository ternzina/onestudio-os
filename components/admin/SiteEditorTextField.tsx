"use client";

import { useId } from "react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { editorCompactFieldClass } from "@/components/admin/EditorChrome";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";

export default function SiteEditorTextField({
  label,
  value,
  originalValue,
  disabled = false,
  multiline = false,
  richText = false,
  rows = 3,
  onChange,
}: {
  label?: string;
  value: string;
  originalValue?: string;
  disabled?: boolean;
  multiline?: boolean;
  richText?: boolean;
  rows?: number;
  onChange: (value: string) => void;
}) {
  const { t } = useAdminI18n();
  const fieldId = useId();
  const hasOriginal = originalValue !== undefined;
  const resetValue = originalValue ?? "";
  const changed = hasOriginal && value !== originalValue;

  return <div data-site-editor-text-field className="grid gap-2">
    <div className="flex items-center justify-between gap-3">
      {label
        ? richText
          ? <span className="text-xs font-semibold text-[#4f4b45]">{label}</span>
          : <label htmlFor={fieldId} className="text-xs font-semibold text-[#4f4b45]">{label}</label>
        : <span />}
      {hasOriginal ? <span className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${changed ? "text-[#9a742e]" : "text-[#8b877e]"}`}>{changed ? t("Changed") : t("Original")}</span> : null}
    </div>
    {richText
      ? <RichTextEditor ariaLabel={label} value={value} disabled={disabled} onChange={onChange} />
      : multiline
        ? <textarea id={fieldId} aria-label={label ?? "Текст"} className={editorCompactFieldClass} rows={rows} value={value} disabled={disabled} onChange={event => onChange(event.target.value)} />
        : <input id={fieldId} aria-label={label ?? "Текст"} className={editorCompactFieldClass} value={value} disabled={disabled} onChange={event => onChange(event.target.value)} />}
    {(hasOriginal || value) ? <button type="button" disabled={disabled || value === resetValue} onClick={() => onChange(resetValue)} className="justify-self-start text-[10px] font-semibold text-[#8a6a2a] underline decoration-[#8a6a2a]/35 underline-offset-2 disabled:opacity-35">{hasOriginal ? t("Restore original text") : t("Clear")}</button> : null}
  </div>;
}
