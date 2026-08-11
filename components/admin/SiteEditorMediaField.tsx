"use client";

/* eslint-disable @next/next/no-img-element */

import { editorCompactFieldClass } from "@/components/admin/EditorChrome";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";

const videoSource = /(?:youtube\.com|youtu\.be|vimeo\.com|\.(?:mp4|webm|mov)(?:$|[?#]))/i;

export default function SiteEditorMediaField({
  label,
  value,
  originalValue,
  disabled = false,
  onChange,
  onChoose,
}: {
  label: string;
  value: string;
  originalValue?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onChoose: () => void;
}) {
  const { t } = useAdminI18n();
  const invalid = Boolean(value && videoSource.test(value));
  const hasOriginal = originalValue !== undefined;
  const changed = hasOriginal && value !== originalValue;
  const resetValue = hasOriginal ? originalValue : "";

  return <div data-site-editor-media-field className="rounded-2xl border border-black/8 bg-[#faf9f6] p-3">
    <div className="flex items-center justify-between gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#716d65]">{label}</p>
      {hasOriginal ? <span className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${changed ? "text-[#9a742e]" : "text-[#8b877e]"}`}>{changed ? t("Changed") : t("Original")}</span> : null}
    </div>
    <div className="mt-3 grid grid-cols-[76px_1fr] gap-3">
      <div className="aspect-square overflow-hidden rounded-xl bg-[#eee9e4]">
        {value && !invalid ? <img src={value} alt="" className="h-full w-full object-cover" /> : invalid ? <span className="grid h-full place-items-center px-2 text-center text-[10px] font-semibold leading-4 text-red-600">{t("Use the video field for this link")}</span> : <span className="grid h-full place-items-center text-xl text-black/20">＋</span>}
      </div>
      <div className="min-w-0">
        <input
          type="text"
          inputMode="url"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder="/images/photo.webp"
          aria-label={label}
          aria-invalid={invalid}
          className={`${editorCompactFieldClass} mt-0 ${invalid ? "border-red-400 focus:border-red-500" : ""}`}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={onChoose} disabled={disabled} className="rounded-lg bg-[#321722] px-3 py-2 text-[10px] font-semibold text-white disabled:opacity-40">{value ? t("Replace image") : t("Choose from media")}</button>
          <button type="button" onClick={() => onChange(resetValue)} disabled={disabled || value === resetValue} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[10px] font-semibold disabled:opacity-35">{hasOriginal ? t("Restore original image") : t("Clear")}</button>
        </div>
      </div>
    </div>
  </div>;
}
