'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';

type BuilderMedia = { id: string; media_type: 'image' | 'video'; url: string; original_filename: string | null };

export default function BuilderMediaPicker({
  type,
  value,
  onChange,
}: {
  type: 'image' | 'video';
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<BuilderMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    const { data, error: loadError } = await supabase
      .from('builder_media')
      .select('id, media_type, url, original_filename')
      .eq('media_type', type)
      .order('created_at', { ascending: false });
    if (loadError) setError(loadError.message);
    setItems((data ?? []) as BuilderMedia[]);
    setLoading(false);
  };

  useEffect(() => {
    if (open) void load();
  }, [open, type]);

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Войдите в админку снова');
      const body = new FormData();
      body.append('file', file);
      body.append('media_type', type);
      const response = await fetch('/api/admin/builder-media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Ошибка загрузки');
      onChange(result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="rounded-[24px] border border-[#D8C4B3] bg-white/70 p-4">
      {value ? (
        type === 'image' ? (
          <img src={value} alt="" className="aspect-[16/9] w-full rounded-[18px] object-cover" />
        ) : (
          <video src={value} controls playsInline className="aspect-video w-full rounded-[18px] bg-black object-contain" />
        )
      ) : (
        <div className="flex aspect-[16/7] items-center justify-center rounded-[18px] border border-dashed border-[#D8C4B3] text-sm text-[#9A8170]">
          {type === 'image' ? 'Фото не выбрано' : 'Видео не выбрано'}
        </div>
      )}

      <input ref={inputRef} type="file" className="hidden" accept={type === 'image' ? 'image/*,.heic,.heif' : 'video/mp4,video/webm,video/quicktime'} onChange={upload} />
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="rounded-full bg-[#2B1A12] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
          {uploading ? 'Загружаем...' : 'Загрузить с компьютера'}
        </button>
        <button type="button" onClick={() => setOpen(true)} className="rounded-full border border-[#D8C4B3] bg-white px-4 py-2 text-xs font-semibold">
          Выбрать из медиатеки
        </button>
        {value && <button type="button" onClick={() => onChange('')} className="rounded-full border border-red-200 px-4 py-2 text-xs text-red-700">Убрать</button>}
      </div>
      {error && <p className="mt-3 text-xs text-red-700">{error}</p>}

      {open && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/65 p-4" onMouseDown={(e) => e.currentTarget === e.target && setOpen(false)}>
          <div className="max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-[30px] bg-[#FFFDFB] shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div><p className="text-xs uppercase tracking-[0.2em] text-[#A67C52]">Builder media</p><h3 className="mt-2 text-2xl font-semibold">Выберите {type === 'image' ? 'фото' : 'видео'}</h3></div>
              <button type="button" onClick={() => setOpen(false)} className="h-10 w-10 rounded-full border text-xl">×</button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5">
              {loading ? <p className="py-20 text-center">Загружаем...</p> : items.length === 0 ? <p className="py-20 text-center text-[#7A6252]">Медиатека пока пустая</p> : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {items.map((item) => <button key={item.id} type="button" onClick={() => { onChange(item.url); setOpen(false); }} className="overflow-hidden rounded-[18px] border bg-white text-left hover:border-[#A67C52]">
                    {type === 'image' ? <img src={item.url} alt="" className="aspect-[4/3] w-full object-cover" /> : <video src={item.url} muted preload="metadata" className="aspect-video w-full bg-black object-cover" />}
                    <p className="truncate p-3 text-xs">{item.original_filename || 'Без названия'}</p>
                  </button>)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
