"use client";

import type { PublicSiteTypography } from "@/lib/public-site/types";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";

const selectClass = "h-9 rounded-lg border border-black/10 bg-white px-2 text-xs text-[#403d38] outline-none focus:border-[#9a742e] disabled:opacity-40";
const buttonClass = "h-9 min-w-9 rounded-lg border border-black/10 bg-white px-2 text-xs font-semibold text-[#403d38] aria-pressed:border-[#9a742e] aria-pressed:bg-[#fff6df] disabled:opacity-40";

export default function TypographyControls({ value, disabled, title = "Заголовок блока", description, onChange }: { value?: PublicSiteTypography; disabled: boolean; title?: string; description?: string; onChange: (value: PublicSiteTypography | undefined) => void }) {
  const { t } = useAdminI18n();
  const current = value ?? {};
  const update = (patch: Partial<PublicSiteTypography>) => onChange({ ...current, ...patch });
  return (
    <div className="grid gap-2 rounded-xl border border-black/8 bg-[#faf9f6] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#403d38]">{title}</span>
          {description ? <span className="mt-1 block truncate text-[10px] font-normal normal-case tracking-normal text-[#817c72]" title={description}>{description}</span> : null}
        </div>
        <button type="button" disabled={disabled || !value} onClick={() => onChange(undefined)} className="text-[10px] font-semibold text-[#8a6a2a] disabled:opacity-35">{t("Use site typography")}</button>
      </div>
      <div className="grid grid-cols-[1fr_86px] gap-2">
        <select aria-label="Шрифт" disabled={disabled} value={current.font_family ?? "template"} onChange={(e) => update({ font_family: e.target.value as PublicSiteTypography["font_family"] })} className={selectClass}>
          <option value="template">Шрифт сайта</option><option value="system">System / Inter</option><option value="humanist">Trebuchet</option><option value="editorial">Georgia / Serif</option>
        </select>
        <label className="flex items-center rounded-lg border border-black/10 bg-white px-2 text-xs"><input aria-label="Размер шрифта в px" type="number" min={10} max={160} disabled={disabled} value={current.font_size ?? ""} placeholder="px" onChange={(e) => update({ font_size: e.target.value ? Number(e.target.value) : undefined })} className="w-full bg-transparent outline-none" /><span className="text-black/45">px</span></label>
      </div>
      <div className="flex flex-wrap gap-1">
        <select aria-label="Насыщенность" disabled={disabled} value={current.font_weight ?? ""} onChange={(e) => update({ font_weight: e.target.value ? Number(e.target.value) as 400 | 500 | 600 | 700 : undefined })} className={selectClass}><option value="">Вес сайта</option><option value="400">400</option><option value="500">500</option><option value="600">600</option><option value="700">700</option></select>
        <button type="button" aria-label="Курсив" aria-pressed={current.italic === true} disabled={disabled} onClick={() => update({ italic: !current.italic })} className={buttonClass}><i>I</i></button>
        <button type="button" aria-label="Подчёркивание" aria-pressed={current.underline === true} disabled={disabled} onClick={() => update({ underline: !current.underline })} className={buttonClass}><u>U</u></button>
        {(["left", "center", "right"] as const).map((align) => <button key={align} type="button" aria-label={`Выравнивание: ${align}`} aria-pressed={current.text_align === align} disabled={disabled} onClick={() => update({ text_align: align })} className={buttonClass}>{align === "left" ? "≡←" : align === "center" ? "≡" : "→≡"}</button>)}
        <label title="Цвет заголовка" className="flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-2 text-xs text-[#403d38]">
          <input aria-label="Цвет заголовка" type="color" disabled={disabled} value={current.color ?? "#17191f"} onInput={(event) => update({ color: event.currentTarget.value })} onChange={(event) => update({ color: event.currentTarget.value })} className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0" />
          <span className="font-mono text-[10px] uppercase">{current.color ?? "Цвет"}</span>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-[10px] text-[#716d65]">Высота строки<input aria-label="Высота строки" type="number" min="0.8" max="3" step="0.05" disabled={disabled} value={current.line_height ?? ""} placeholder="авто" onChange={(e) => update({ line_height: e.target.value ? Number(e.target.value) : undefined })} className={`${selectClass} mt-1 w-full`} /></label>
        <label className="text-[10px] text-[#716d65]">Интервал, px<input aria-label="Межбуквенный интервал" type="number" min="-5" max="20" step="0.1" disabled={disabled} value={current.letter_spacing ?? ""} placeholder="авто" onChange={(e) => update({ letter_spacing: e.target.value ? Number(e.target.value) : undefined })} className={`${selectClass} mt-1 w-full`} /></label>
      </div>
    </div>
  );
}
