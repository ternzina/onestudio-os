"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";

type MediaItem = { id: string; image_url: string; alt_text: string | null; original_filename: string | null; mime_type: string | null };

export default function MediaLibraryPicker({ open, businessId, title, mediaType = "image", onSelect, onClose }: {
  open: boolean; businessId: string; title: string; mediaType?: "image" | "video"; onSelect: (url: string) => void; onClose: () => void;
}) {
  const { t } = useAdminI18n();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function load() {
      setLoading(true); setError(""); setQuery("");
      let request = supabase.from("media_library").select("id,image_url,alt_text,original_filename,mime_type").eq("business_id", businessId).eq("is_active", true).order("created_at", { ascending: false });
      request = mediaType === "video" ? request.like("mime_type", "video/%") : request.or("mime_type.is.null,mime_type.like.image/%");
      const { data, error: loadError } = await request.limit(120);
      if (cancelled) return;
      setLoading(false);
      if (loadError) { setItems([]); setError(loadError.message); } else setItems((data ?? []) as MediaItem[]);
    }
    void load();
    return () => { cancelled = true; };
  }, [businessId, mediaType, open]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? items.filter(item => `${item.alt_text ?? ""} ${item.original_filename ?? ""}`.toLowerCase().includes(needle)) : items;
  }, [items, query]);

  if (!open) return null;
  return <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-[#17191f]/55 p-4 backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-label={title} onMouseDown={event => { if (event.currentTarget === event.target) onClose(); }}>
    <div className="max-h-[calc(100dvh-2rem)] w-full max-w-5xl overflow-auto rounded-[30px] bg-[#f8f7f3] p-5 shadow-[0_35px_120px_rgba(0,0,0,0.4)] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9d3151]">{t("Media library")}</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{title}</h2><p className="mt-3 text-sm text-[#716d65]">{t("Choose an existing file. Upload permissions remain controlled by the shared media library.")}</p></div><button type="button" onClick={onClose} className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold" aria-label={t("Close")}>×</button></div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Поиск изображений" className="min-h-11 flex-1 rounded-xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-[#9d3151]" /><Link href="/admin/media" target="_blank" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-5 text-xs font-semibold">Открыть медиатеку</Link></div>
      {loading ? <p className="mt-8 text-sm text-[#716d65]">Загрузка медиа…</p> : error ? <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Не удалось загрузить файлы: {error}</p> : filtered.length ? <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{filtered.map(item => <button key={item.id} type="button" onClick={() => onSelect(item.image_url)} className="group overflow-hidden rounded-2xl border border-black/8 bg-white text-left transition hover:border-[#9d3151]/45 hover:shadow-lg"><div className="aspect-[4/3] overflow-hidden bg-[#eee9e4]">{item.mime_type?.startsWith("video/") ? <video src={item.image_url} muted playsInline preload="metadata" className="h-full w-full object-cover" /> : <img src={item.image_url} alt={item.alt_text ?? ""} className="h-full w-full object-cover" />}</div><p className="truncate px-3 py-3 text-[11px] font-semibold">{item.alt_text || item.original_filename || "Изображение"}</p></button>)}</div> : <div className="mt-8 rounded-2xl border border-dashed border-black/15 p-8 text-center text-sm text-[#716d65]">Подходящие файлы не найдены.</div>}
    </div>
  </div>;
}
