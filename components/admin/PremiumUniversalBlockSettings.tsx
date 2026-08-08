"use client";

import RichTextEditor from "@/components/admin/RichTextEditor";
import TypographyControls from "@/components/admin/TypographyControls";
import { defaultPublicSiteColumnCards, publicSiteBlockColumnCards } from "@/lib/public-site/custom-block-registry";
import type { PublicSiteColumnCard, PublicSiteCustomBlock } from "@/lib/public-site/types";

const inputClass = "mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#9a742e] disabled:opacity-50";

export default function PremiumUniversalBlockSettings({ block, disabled, onChange, onChooseImage }: {
  block: PublicSiteCustomBlock; disabled: boolean; onChange: (block: PublicSiteCustomBlock, historyField?: string) => void; onChooseImage: (target: { cardIndex?: number; label: string }) => void;
}) {
  const patch = <Key extends keyof PublicSiteCustomBlock>(key: Key, value: PublicSiteCustomBlock[Key]) => onChange({ ...block, [key]: value }, String(key));
  const cards = publicSiteBlockColumnCards(block);
  while (cards.length < 3) cards.push(defaultPublicSiteColumnCards(block.id)[cards.length]);
  function updateCard(index: number, changes: Partial<PublicSiteColumnCard>, field: string) {
    const next = cards.map((card, cardIndex) => cardIndex === index ? { ...card, ...changes } : card);
    onChange({ ...block, cards: next }, `card-${index}-${field}`);
  }

  return <div className="grid gap-4">
    <label className="text-xs font-semibold text-[#4f4b45]">Eyebrow<input className={inputClass} value={block.eyebrow} disabled={disabled} onChange={event => patch("eyebrow", event.target.value)} /></label>
    <label className="text-xs font-semibold text-[#4f4b45]">Заголовок<textarea className={inputClass} rows={3} value={block.title} disabled={disabled} onChange={event => patch("title", event.target.value)} /></label>
    <TypographyControls title="Заголовок блока" description="Ограниченные настройки Site Editor 2.6" value={block.title_typography} disabled={disabled} onChange={value => patch("title_typography", value)} />
    {block.kind !== "columns" ? <RichTextEditor label="Текст" value={block.text} disabled={disabled} onChange={value => patch("text", value)} /> : <RichTextEditor label="Вводный текст" value={block.text} disabled={disabled} onChange={value => patch("text", value)} />}
    {block.kind === "media_text" ? <div className="grid gap-3 rounded-xl border border-black/8 bg-[#faf9f6] p-3">
      <label className="text-xs font-semibold text-[#4f4b45]">Расположение изображения<select className={inputClass} value={block.media_position ?? "right"} disabled={disabled} onChange={event => patch("media_position", event.target.value === "left" ? "left" : "right")}><option value="right">Текст + изображение</option><option value="left">Изображение + текст</option></select></label>
      <label className="text-xs font-semibold text-[#4f4b45]">URL изображения<input className={inputClass} value={block.media_url ?? ""} disabled={disabled} onChange={event => patch("media_url", event.target.value)} /></label>
      <button type="button" disabled={disabled} onClick={() => onChooseImage({ label: "Изображение блока" })} className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-xs font-semibold disabled:opacity-40">Выбрать из медиатеки</button>
      <label className="text-xs font-semibold text-[#4f4b45]">Альтернативный текст<input className={inputClass} value={block.media_alt ?? ""} disabled={disabled} onChange={event => patch("media_alt", event.target.value.slice(0, 180))} /></label>
      <label className="text-xs font-semibold text-[#4f4b45]">Текст кнопки<input className={inputClass} value={block.button_label} disabled={disabled} onChange={event => patch("button_label", event.target.value)} /></label>
      <label className="text-xs font-semibold text-[#4f4b45]">Ссылка кнопки<input className={inputClass} value={block.button_url} disabled={disabled} onChange={event => patch("button_url", event.target.value)} /></label>
    </div> : null}
    {block.kind === "columns" ? <div className="grid gap-3 rounded-xl border border-black/8 bg-[#faf9f6] p-3">
      <label className="text-xs font-semibold text-[#4f4b45]">Количество колонок<select className={inputClass} value={block.columns_count ?? 3} disabled={disabled} onChange={event => patch("columns_count", event.target.value === "2" ? 2 : 3)}><option value={2}>Две колонки</option><option value={3}>Три колонки</option></select></label>
      {cards.slice(0, block.columns_count ?? 3).map((card, index) => <section key={card.id} className="grid gap-3 rounded-xl border border-black/8 bg-white p-3"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#9a742e]">Карточка {index + 1}</p><label className="text-xs font-semibold text-[#4f4b45]">Заголовок<input className={inputClass} value={card.title} disabled={disabled} onChange={event => updateCard(index, { title: event.target.value }, "title")} /></label><RichTextEditor label="Описание" value={card.text} disabled={disabled} onChange={value => updateCard(index, { text: value }, "text")} /><label className="text-xs font-semibold text-[#4f4b45]">Содержимое карточки<select className={inputClass} value={card.media_type} disabled={disabled} onChange={event => updateCard(index, { media_type: event.target.value === "image" ? "image" : "none" }, "media-type")}><option value="none">Только текст</option><option value="image">Изображение и текст</option></select></label>{card.media_type === "image" ? <><label className="text-xs font-semibold text-[#4f4b45]">URL изображения<input className={inputClass} value={card.media_url ?? ""} disabled={disabled} onChange={event => updateCard(index, { media_url: event.target.value }, "media-url")} /></label><button type="button" disabled={disabled} onClick={() => onChooseImage({ cardIndex: index, label: `Изображение карточки ${index + 1}` })} className="rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold disabled:opacity-40">Выбрать из медиатеки</button></> : null}</section>)}
    </div> : null}
  </div>;
}
