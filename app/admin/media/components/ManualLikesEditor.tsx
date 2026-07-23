"use client";

import { useEffect, useState } from "react";
import type { MediaLibraryItem } from "./types";

type ManualLikesEditorProps = {
  item: MediaLibraryItem;
  compact?: boolean;
  onSave: (item: MediaLibraryItem, value: number) => Promise<boolean>;
};

export default function ManualLikesEditor({
  item,
  compact = false,
  onSave,
}: ManualLikesEditorProps) {
  const [value, setValue] = useState(String(item.manual_likes || 0));
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(String(item.manual_likes || 0));
  }, [item.id, item.manual_likes]);

  const save = async () => {
    const nextValue = Math.max(0, Math.min(999999, Math.trunc(Number(value) || 0)));
    setValue(String(nextValue));

    if (nextValue === (item.manual_likes || 0)) return;

    setIsSaving(true);
    setSaved(false);
    const success = await onSave(item, nextValue);
    setIsSaving(false);
    setSaved(success);
    if (success) window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div
      className={
        compact
          ? "mt-4 rounded-2xl bg-[#F7F1EA]/80 p-3"
          : "rounded-[28px] border border-[#E5D5C8] bg-white/80 p-5"
      }
    >
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A67C52]">
          Стартовые сердечки
        </span>
        {!compact && (
          <span className="mt-2 block text-sm leading-6 text-[#7A6252]">
            На сайте показывается это число плюс настоящие лайки посетителей.
          </span>
        )}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xl text-[#F05C78]">♥</span>
          <input
            type="number"
            min="0"
            max="999999"
            step="1"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void save();
            }}
            className="min-w-0 flex-1 rounded-xl border border-[#D8C4B3] bg-white px-3 py-2 text-sm font-semibold text-[#2B1A12] outline-none focus:border-[#A67C52]"
            aria-label="Количество стартовых сердечек"
          />
          <button
            type="button"
            onClick={() => void save()}
            disabled={isSaving}
            className="rounded-xl bg-[#2B1A12] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#4A2D1E] disabled:opacity-60"
          >
            {isSaving ? "..." : saved ? "Готово" : "Сохранить"}
          </button>
        </div>
      </label>
    </div>
  );
}
