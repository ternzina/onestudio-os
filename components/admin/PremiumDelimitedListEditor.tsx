"use client";

import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import { editorCompactFieldClass } from "@/components/admin/EditorChrome";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { parsePremiumDelimitedItem, serializePremiumDelimitedItem } from "@/lib/public-site/premium-kids-content";

export default function PremiumDelimitedListEditor({ values, primaryLabel, secondaryLabel, splitFromEnd = false, disabled, onChange }: {
  values: string[]; primaryLabel: "Question" | "Review text" | "Person name"; secondaryLabel: "Answer" | "Author" | "Role"; splitFromEnd?: boolean; disabled: boolean; onChange: (values: string[]) => void;
}) {
  const { t } = useAdminI18n();
  const primaryIsRich = primaryLabel === "Review text";
  const secondaryIsRich = secondaryLabel === "Answer" || secondaryLabel === "Role";
  function update(index: number, field: "primary" | "secondary", value: string) {
    const item = parsePremiumDelimitedItem(values[index] ?? "", "·", splitFromEnd);
    const next = [...values];
    next[index] = serializePremiumDelimitedItem(field === "primary" ? value : item.primary, field === "secondary" ? value : item.secondary);
    onChange(next);
  }
  return <div data-premium-structured-list className="grid gap-3">
    {values.length ? values.map((value, index) => { const item = parsePremiumDelimitedItem(value, "·", splitFromEnd); return <section key={index} className="grid gap-3 rounded-xl border border-black/8 bg-[#faf9f6] p-3">
      <div className="flex items-center justify-between"><b className="text-[10px] uppercase tracking-[.14em]">{t("Item")} {index + 1}</b><button type="button" disabled={disabled} aria-label={`${t("Remove item")} ${index + 1}`} onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))} className="text-xs text-red-600 disabled:opacity-40">×</button></div>
      {primaryIsRich ? <RichTextEditor label={t(primaryLabel)} value={item.primary} disabled={disabled} onChange={value => update(index, "primary", value)} /> : <label className="text-xs font-semibold">{t(primaryLabel)}<input className={editorCompactFieldClass} value={item.primary} disabled={disabled} onChange={(event) => update(index, "primary", event.target.value)} /></label>}
      {secondaryIsRich ? <RichTextEditor label={t(secondaryLabel)} value={item.secondary} disabled={disabled} onChange={value => update(index, "secondary", value)} /> : <label className="text-xs font-semibold">{t(secondaryLabel)}<input className={editorCompactFieldClass} value={item.secondary} disabled={disabled} onChange={(event) => update(index, "secondary", event.target.value)} /></label>}
    </section>; }) : <p className="text-xs text-[#716d65]">{t("No items yet.")}</p>}
    <button type="button" disabled={disabled} onClick={() => onChange([...values, ""])} className="rounded-xl border border-dashed border-black/20 px-3 py-2 text-xs font-semibold disabled:opacity-40">+ {t("Add item")}</button>
  </div>;
}
