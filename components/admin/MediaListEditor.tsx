"use client";

/* eslint-disable @next/next/no-img-element */

import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import { editorCompactFieldClass } from "@/components/admin/EditorChrome";

export default function MediaListEditor({
  items,
  disabled,
  minItems = 1,
  maxItems = 12,
  onChange,
  onChoose,
}: {
  items: readonly string[];
  disabled: boolean;
  minItems?: number;
  maxItems?: number;
  onChange: (items: string[]) => void;
  onChoose: (index: number, label: string) => void;
}) {
  const { t } = useAdminI18n();
  const update = (index: number, value: string) =>
    onChange(items.map((item, itemIndex) => itemIndex === index ? value : item));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return <div data-media-list-editor className="grid gap-3">
    {items.map((item, index) => {
      const label = t("Image {count}", { count: index + 1 });
      return <section key={index} className="grid gap-3 rounded-2xl border border-black/8 bg-[#faf9f6] p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#716d65]">{label}</p>
          <div className="flex gap-1">
            <button type="button" aria-label={t("Move image up")} title={t("Move image up")} disabled={disabled || index === 0} onClick={() => move(index, -1)} className="h-8 w-8 rounded-lg border border-black/10 disabled:opacity-25">↑</button>
            <button type="button" aria-label={t("Move image down")} title={t("Move image down")} disabled={disabled || index === items.length - 1} onClick={() => move(index, 1)} className="h-8 w-8 rounded-lg border border-black/10 disabled:opacity-25">↓</button>
          </div>
        </div>
        {item ? <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black/8"><img src={item} alt="" className="h-full w-full object-cover" /></div> : null}
        <label className="text-xs font-semibold text-[#4f4b45]">{t("Image URL")}<input className={editorCompactFieldClass} value={item} disabled={disabled} onChange={event => update(index, event.target.value)} /></label>
        <div className="flex flex-wrap justify-between gap-2">
          <button type="button" disabled={disabled} onClick={() => onChoose(index, label)} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-40">{item ? t("Replace image") : t("Choose from media")}</button>
          <button type="button" disabled={disabled || items.length <= minItems} onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="text-xs font-semibold text-red-600 disabled:opacity-35">{t("Remove")}</button>
        </div>
      </section>;
    })}
    <button type="button" disabled={disabled || items.length >= maxItems} onClick={() => onChange([...items, ""])} className="rounded-xl border border-dashed border-[#9d3151]/35 bg-white px-4 py-3 text-xs font-semibold text-[#8d2d4a] disabled:opacity-40">+ {t("Add image")}</button>
  </div>;
}
