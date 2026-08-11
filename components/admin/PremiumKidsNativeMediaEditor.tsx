"use client";

/* eslint-disable @next/next/no-img-element */

import { editorCompactFieldClass } from "@/components/admin/EditorChrome";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import type { PremiumKidsNativeMedia, PremiumKidsNativeMediaSlot } from "@/lib/public-site/premium-kids-native-media";
import { premiumKidsNativeMediaUrl } from "@/lib/public-site/premium-kids-native-media";

export default function PremiumKidsNativeMediaEditor({
  slots,
  media,
  disabled,
  onChange,
  onChoose,
}: {
  slots: readonly PremiumKidsNativeMediaSlot[];
  media: PremiumKidsNativeMedia | undefined;
  disabled: boolean;
  onChange: (slotId: string, url: string | undefined) => void;
  onChoose: (slot: PremiumKidsNativeMediaSlot, label: string) => void;
}) {
  const { locale, t } = useAdminI18n();
  return <div data-premium-native-media-editor className="grid gap-2">
    {slots.map((slot, index) => {
      const override = media?.urls?.[slot.id];
      const url = premiumKidsNativeMediaUrl(media, slot.id, slot.defaultUrl);
      const label = locale === "ru" ? slot.label : t("Image {count}", { count: index + 1 });
      return <details key={slot.id} className="group rounded-2xl border border-black/8 bg-[#faf9f6] open:p-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 group-open:p-0 group-open:pb-3">
          <span className="text-xs font-semibold text-[#4f4b45]">{label}</span>
          <span className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#9a742e]">{override ? t("Changed") : t("Image {count}", { count: index + 1 })} +</span>
        </summary>
        <div className="grid gap-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black/8"><img src={url} alt="" className="h-full w-full object-cover" /></div>
          <label className="text-xs font-semibold text-[#4f4b45]">{t("Image URL")}<input className={editorCompactFieldClass} value={url} disabled={disabled} onChange={event => onChange(slot.id, event.target.value)} /></label>
          <div className="flex flex-wrap justify-between gap-2">
            <button type="button" disabled={disabled} onClick={() => onChoose(slot, label)} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-40">{override ? t("Replace image") : t("Choose from media")}</button>
            <button type="button" disabled={disabled || !override} onClick={() => onChange(slot.id, undefined)} className="text-xs font-semibold text-[#8d2d4a] disabled:opacity-35">{t("Restore demo image")}</button>
          </div>
        </div>
      </details>;
    })}
  </div>;
}
