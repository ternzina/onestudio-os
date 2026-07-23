"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import SiteImagePicker from "./SiteImagePicker";
import SimpleMediaPicker from "./SimpleMediaPicker";
import LearningExtraBlocksSettings from "./LearningExtraBlocksSettings";

type LearningContent = {
  hero_eyebrow_uk: string;
  hero_eyebrow_pl: string;
  hero_title_top_uk: string;
  hero_title_top_pl: string;
  hero_title_bottom_uk: string;
  hero_title_bottom_pl: string;
  hero_description_uk: string;
  hero_description_pl: string;
  primary_button_uk: string;
  primary_button_pl: string;
  secondary_button_uk: string;
  secondary_button_pl: string;
  hero_image_one_url: string;
  hero_image_two_url: string;
  practice_title_uk: string;
  practice_title_pl: string;
  practice_text_uk: string;
  practice_text_pl: string;
  formats_eyebrow_uk: string;
  formats_eyebrow_pl: string;
  formats_title_uk: string;
  formats_title_pl: string;
  includes_eyebrow_uk: string;
  includes_eyebrow_pl: string;
  includes_title_uk: string;
  includes_title_pl: string;
};

type LearningProgram = {
  id: string;
  title_uk: string;
  title_pl: string;
  description_uk: string;
  description_pl: string;
  image_url: string;
  media_type: "image" | "video";
  price_text_uk: string;
  price_text_pl: string;
  duration_uk: string;
  duration_pl: string;
  is_active: boolean;
  sort_order: number;
};

type LearningBenefit = {
  id: string;
  text_uk: string;
  text_pl: string;
  is_active: boolean;
  sort_order: number;
};

const fallbackContent: LearningContent = {
  hero_eyebrow_uk: "Sisters Studio Academy",
  hero_eyebrow_pl: "Sisters Studio Academy",
  hero_title_top_uk: "Навчання",
  hero_title_top_pl: "Szkolenia",
  hero_title_bottom_uk: "фотографів",
  hero_title_bottom_pl: "fotografów",
  hero_description_uk: "Курси, воркшопи та індивідуальний менторинг у просторі Sisters Studio. Вчимо працювати зі світлом, моделлю, камерою та атмосферою кадру.",
  hero_description_pl: "Kursy, warsztaty i indywidualny mentoring w przestrzeni Sisters Studio. Uczymy pracy ze światłem, modelką, aparatem i atmosferą kadru.",
  primary_button_uk: "Обрати програму",
  primary_button_pl: "Wybierz program",
  secondary_button_uk: "На головну",
  secondary_button_pl: "Na stronę główną",
  hero_image_one_url: "https://cdn.sistersstudio.pl/site/home/collage/1783898313372-home-learning-16d2319c-763a-44a3-8528-355abf4ea051.webp",
  hero_image_two_url: "https://cdn.sistersstudio.pl/site/home/collage/1783898283381-home-camera-ef870b4a-df21-4ed7-9767-77ebc28eba2f.webp",
  practice_title_uk: "Практика",
  practice_title_pl: "Praktyka",
  practice_text_uk: "Не суха теорія, а робота в студії зі світлом, камерою та реальними задачами.",
  practice_text_pl: "Nie sucha teoria, ale praca w studio ze światłem, aparatem i prawdziwymi zadaniami.",
  formats_eyebrow_uk: "Формати навчання",
  formats_eyebrow_pl: "Formaty szkoleń",
  formats_title_uk: "Для різного рівня та цілей",
  formats_title_pl: "Dla różnych poziomów i celów",
  includes_eyebrow_uk: "Що входить",
  includes_eyebrow_pl: "Co obejmuje",
  includes_title_uk: "Навчання у живій студійній атмосфері",
  includes_title_pl: "Nauka w żywej atmosferze studia",
};

const fieldClass = "mt-2 w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 py-3 text-sm text-[#2B1A12] outline-none transition focus:border-[#A67C52]";
const labelClass = "block text-xs font-medium uppercase tracking-[0.14em] text-[#A67C52]";

export default function LearningSettings() {
  const [content, setContent] = useState<LearningContent>(fallbackContent);
  const [programs, setPrograms] = useState<LearningProgram[]>([]);
  const [benefits, setBenefits] = useState<LearningBenefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true); setError(""); setMessage("");
    const [contentResult, programsResult, benefitsResult] = await Promise.all([
      supabase.from("site_learning_content").select("*").eq("id", 1).maybeSingle(),
      supabase.from("learning_programs").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
      supabase.from("learning_benefits").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
    ]);
    const firstError = contentResult.error || programsResult.error || benefitsResult.error;
    if (firstError) { setError(firstError.message); setLoading(false); return; }
    if (contentResult.data) setContent({ ...fallbackContent, ...contentResult.data } as LearningContent);
    setPrograms(((programsResult.data || []) as LearningProgram[]).map(x => ({
      ...x,
      id: String(x.id),
      sort_order: Number(x.sort_order || 0),
      media_type: x.media_type || "image",
    })));
    setBenefits(((benefitsResult.data || []) as LearningBenefit[]).map(x => ({ ...x, id: String(x.id), sort_order: Number(x.sort_order || 0) })));
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const saveLearningContentImage = async (
    field: 'hero_image_one_url' | 'hero_image_two_url',
    url: string
  ) => {
    setError("");
    setMessage("");

    const { error: saveError } = await supabase
      .from("site_learning_content")
      .update({
        [field]: url.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (saveError) {
      setError(saveError.message);
      throw new Error(`Фото не сохранилось: ${saveError.message}`);
    }

    setMessage("Фото Hero сохранено автоматически");
  };

  const saveProgramMedia = async (item: LearningProgram, url: string) => {
    setError("");
    setMessage("");

    const { error: saveError } = await supabase
      .from("learning_programs")
      .update({
        image_url: url.trim(),
        media_type: item.media_type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (saveError) {
      setError(saveError.message);
      throw new Error(`Медиа программы не сохранилось: ${saveError.message}`);
    }

    setMessage("Фото или видео программы сохранено автоматически");
  };

  const saveContent = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    const payload = Object.fromEntries(Object.entries(content).map(([k,v]) => [k, typeof v === "string" ? v.trim() : v]));
    const { error: saveError } = await supabase.from("site_learning_content").upsert({ id: 1, ...payload, updated_at: new Date().toISOString() }, { onConflict: "id" });
    if (saveError) setError(saveError.message); else setMessage("Страница обучения сохранена");
    setSaving(false);
  };

  const addProgram = async () => {
    setBusyId("new-program"); setError(""); setMessage("");
    const { data, error: insertError } = await supabase.from("learning_programs").insert({ title_uk: "Нова програма", title_pl: "Nowy program", description_uk: "", description_pl: "", image_url: "", media_type: "image", price_text_uk: "", price_text_pl: "", duration_uk: "", duration_pl: "", is_active: true, sort_order: programs.length }).select("*").single();
    if (insertError) setError(insertError.message); else if (data) { setPrograms(v => [...v, { ...data, id: String(data.id) } as LearningProgram]); setMessage("Новая программа добавлена"); }
    setBusyId(null);
  };

  const saveProgram = async (item: LearningProgram) => {
    setBusyId(item.id); setError(""); setMessage("");
    const { id, ...payload } = item;
    const { error: saveError } = await supabase.from("learning_programs").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id);
    if (saveError) setError(saveError.message); else setMessage(`Программа «${item.title_uk || item.title_pl}» сохранена`);
    setBusyId(null);
  };

  const deleteProgram = async (id: string) => {
    if (!window.confirm("Удалить эту программу?")) return;
    setBusyId(id); const { error: deleteError } = await supabase.from("learning_programs").delete().eq("id", id);
    if (deleteError) setError(deleteError.message); else { setPrograms(v => v.filter(x => x.id !== id)); setMessage("Программа удалена"); }
    setBusyId(null);
  };

  const addBenefit = async () => {
    setBusyId("new-benefit"); setError(""); setMessage("");
    const { data, error: insertError } = await supabase.from("learning_benefits").insert({ text_uk: "Новий пункт", text_pl: "Nowy punkt", is_active: true, sort_order: benefits.length }).select("*").single();
    if (insertError) setError(insertError.message); else if (data) { setBenefits(v => [...v, { ...data, id: String(data.id) } as LearningBenefit]); setMessage("Новый пункт добавлен"); }
    setBusyId(null);
  };

  const saveBenefit = async (item: LearningBenefit) => {
    setBusyId(item.id); setError(""); setMessage("");
    const { id, ...payload } = item;
    const { error: saveError } = await supabase.from("learning_benefits").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id);
    if (saveError) setError(saveError.message); else setMessage("Пункт сохранён");
    setBusyId(null);
  };

  const deleteBenefit = async (id: string) => {
    if (!window.confirm("Удалить этот пункт?")) return;
    setBusyId(id); const { error: deleteError } = await supabase.from("learning_benefits").delete().eq("id", id);
    if (deleteError) setError(deleteError.message); else { setBenefits(v => v.filter(x => x.id !== id)); setMessage("Пункт удалён"); }
    setBusyId(null);
  };

  return (
    <motion.div id="learning" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.16 }} className="mt-8 rounded-[36px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_24px_90px_rgba(83,54,37,0.12)] backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div><p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#A67C52]">Learning page</p><h2 className="text-2xl font-semibold tracking-[-0.04em]">Навчання</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#7A6252]">Тексты, фотографии, программы и преимущества страницы обучения. Ссылку на фото можно скопировать из медиатеки.</p></div>
        <button type="button" onClick={loadAll} disabled={loading || saving || Boolean(busyId)} className="w-fit rounded-full border border-[#D8C4B3] bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:opacity-50">{loading ? "Загружаем..." : "Обновить"}</button>
      </div>
      {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}
      {message && <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">{message}</div>}
      {loading ? <div className="mt-6 rounded-2xl bg-[#F7F1EA] p-5 text-sm text-[#7A6252]">Загружаем настройки обучения...</div> : <>
        <form onSubmit={saveContent} className="mt-7 space-y-6">
          <section className="rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB]/80 p-5"><h3 className="text-lg font-semibold">Верхний экран</h3><div className="mt-5 grid gap-4 lg:grid-cols-2">
            {([['hero_eyebrow_uk','Надпись UA'],['hero_eyebrow_pl','Надпись PL'],['hero_title_top_uk','Заголовок 1 UA'],['hero_title_top_pl','Заголовок 1 PL'],['hero_title_bottom_uk','Заголовок 2 UA'],['hero_title_bottom_pl','Заголовок 2 PL'],['primary_button_uk','Главная кнопка UA'],['primary_button_pl','Главная кнопка PL'],['secondary_button_uk','Вторая кнопка UA'],['secondary_button_pl','Вторая кнопка PL'],['practice_title_uk','Карточка: заголовок UA'],['practice_title_pl','Карточка: заголовок PL']] as [keyof LearningContent,string][]).map(([field,label]) => <label key={field} className={labelClass}>{label}<input className={fieldClass} value={content[field]} onChange={e=>setContent(v=>({...v,[field]:e.target.value}))}/></label>)}
            {([['hero_description_uk','Описание UA'],['hero_description_pl','Описание PL'],['practice_text_uk','Карточка: текст UA'],['practice_text_pl','Карточка: текст PL']] as [keyof LearningContent,string][]).map(([field,label]) => <label key={field} className={labelClass}>{label}<textarea rows={4} className={fieldClass} value={content[field]} onChange={e=>setContent(v=>({...v,[field]:e.target.value}))}/></label>)}
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <SiteImagePicker
              label="Первое фото Hero"
              value={content.hero_image_one_url}
              onChange={(url) => setContent(v => ({...v, hero_image_one_url: url}))}
              onSave={(url) => saveLearningContentImage("hero_image_one_url", url)}
              folder="site/learning/hero"
              previewClassName="aspect-[4/5]"
            />
            <SiteImagePicker
              label="Второе фото Hero"
              value={content.hero_image_two_url}
              onChange={(url) => setContent(v => ({...v, hero_image_two_url: url}))}
              onSave={(url) => saveLearningContentImage("hero_image_two_url", url)}
              folder="site/learning/hero"
              previewClassName="aspect-[4/3]"
            />
          </div></section>
          <section className="rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB]/80 p-5"><h3 className="text-lg font-semibold">Заголовки разделов</h3><div className="mt-5 grid gap-4 lg:grid-cols-2">{([['formats_eyebrow_uk','Форматы: надпись UA'],['formats_eyebrow_pl','Форматы: надпись PL'],['formats_title_uk','Форматы: заголовок UA'],['formats_title_pl','Форматы: заголовок PL'],['includes_eyebrow_uk','Что входит: надпись UA'],['includes_eyebrow_pl','Что входит: надпись PL'],['includes_title_uk','Что входит: заголовок UA'],['includes_title_pl','Что входит: заголовок PL']] as [keyof LearningContent,string][]).map(([field,label]) => <label key={field} className={labelClass}>{label}<input className={fieldClass} value={content[field]} onChange={e=>setContent(v=>({...v,[field]:e.target.value}))}/></label>)}</div></section>
          <button disabled={saving} className="rounded-full bg-[#2B1A12] px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#F7F1EA] disabled:opacity-50">{saving ? "Сохраняем..." : "Сохранить страницу"}</button>
        </form>

        <section className="mt-8 rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB]/80 p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><h3 className="text-lg font-semibold">Программы обучения</h3><p className="mt-1 text-sm text-[#7A6252]">Цена и длительность необязательны. Пустые поля на сайте не показываются.</p></div><button onClick={addProgram} disabled={busyId==='new-program'} className="rounded-full bg-[#2B1A12] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-50">Добавить программу</button></div>
          <div className="mt-5 space-y-4">{programs.map((item,index)=><div key={item.id} className="rounded-[24px] border border-[#E5D5C8] bg-white p-5"><div className="grid gap-4 lg:grid-cols-2">
            {([['title_uk','Название UA'],['title_pl','Название PL'],['price_text_uk','Цена UA'],['price_text_pl','Цена PL'],['duration_uk','Длительность UA'],['duration_pl','Длительность PL']] as [keyof LearningProgram,string][]).map(([field,label])=><label key={field} className={labelClass}>{label}<input className={fieldClass} value={String(item[field] ?? '')} onChange={e=>setPrograms(v=>v.map(x=>x.id===item.id?{...x,[field]:e.target.value}:x))}/></label>)}
            {([['description_uk','Описание UA'],['description_pl','Описание PL']] as [keyof LearningProgram,string][]).map(([field,label])=><label key={field} className={labelClass}>{label}<textarea rows={3} className={fieldClass} value={String(item[field] ?? '')} onChange={e=>setPrograms(v=>v.map(x=>x.id===item.id?{...x,[field]:e.target.value}:x))}/></label>)}
            <div className="lg:col-span-2 rounded-[22px] border border-[#E5D5C8] bg-[#F7F1EA]/55 p-4">
              <label className={labelClass}>
                Медиа карточки
                <select
                  className={fieldClass}
                  value={item.media_type}
                  onChange={(event) =>
                    setPrograms((current) =>
                      current.map((program) =>
                        program.id === item.id
                          ? {
                              ...program,
                              media_type: event.target.value as "image" | "video",
                              image_url: "",
                            }
                          : program
                      )
                    )
                  }
                >
                  <option value="image">Фото</option>
                  <option value="video">Видео</option>
                </select>
              </label>

              <div className="mt-4">
                {item.media_type === "image" ? (
                  <SiteImagePicker
                    label="Фото программы"
                    value={item.image_url}
                    onChange={(url) =>
                      setPrograms((current) =>
                        current.map((program) =>
                          program.id === item.id
                            ? { ...program, image_url: url }
                            : program
                        )
                      )
                    }
                    onSave={(url) => saveProgramMedia(item, url)}
                    folder="site/learning/programs"
                    previewClassName="aspect-[16/7]"
                  />
                ) : (
                  <SimpleMediaPicker
                    type="video"
                    value={item.image_url}
                    onChange={(url) =>
                      setPrograms((current) =>
                        current.map((program) =>
                          program.id === item.id
                            ? { ...program, image_url: url }
                            : program
                        )
                      )
                    }
                    onSave={(url) => saveProgramMedia(item, url)}
                  />
                )}
              </div>
            </div>
            <label className={labelClass}>Порядок<input type="number" className={fieldClass} value={item.sort_order} onChange={e=>setPrograms(v=>v.map(x=>x.id===item.id?{...x,sort_order:Number(e.target.value)}:x))}/></label>
            <label className="flex items-center gap-3 pt-7 text-sm text-[#2B1A12]"><input type="checkbox" checked={item.is_active} onChange={e=>setPrograms(v=>v.map(x=>x.id===item.id?{...x,is_active:e.target.checked}:x))}/> Показывать на сайте</label>
          </div><div className="mt-4 flex flex-wrap gap-3"><button onClick={()=>saveProgram(item)} disabled={busyId===item.id} className="rounded-full bg-[#2B1A12] px-5 py-2 text-xs font-semibold text-white disabled:opacity-50">Сохранить</button><button onClick={()=>deleteProgram(item.id)} disabled={busyId===item.id} className="rounded-full border border-red-200 px-5 py-2 text-xs font-semibold text-red-700 disabled:opacity-50">Удалить</button><span className="self-center text-xs text-[#9A8170]">Карточка {index+1}</span></div></div>)}</div>
        </section>

        <section className="mt-8 rounded-[28px] border border-[#E5D5C8] bg-[#FFFDFB]/80 p-5"><div className="flex flex-wrap items-center justify-between gap-4"><h3 className="text-lg font-semibold">Что входит</h3><button onClick={addBenefit} disabled={busyId==='new-benefit'} className="rounded-full bg-[#2B1A12] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-50">Добавить пункт</button></div><div className="mt-5 space-y-4">{benefits.map(item=><div key={item.id} className="rounded-[22px] border border-[#E5D5C8] bg-white p-4"><div className="grid gap-4 lg:grid-cols-[1fr_1fr_120px_auto]">{([['text_uk','Текст UA'],['text_pl','Текст PL']] as [keyof LearningBenefit,string][]).map(([field,label])=><label key={field} className={labelClass}>{label}<input className={fieldClass} value={String(item[field]??'')} onChange={e=>setBenefits(v=>v.map(x=>x.id===item.id?{...x,[field]:e.target.value}:x))}/></label>)}<label className={labelClass}>Порядок<input type="number" className={fieldClass} value={item.sort_order} onChange={e=>setBenefits(v=>v.map(x=>x.id===item.id?{...x,sort_order:Number(e.target.value)}:x))}/></label><label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" checked={item.is_active} onChange={e=>setBenefits(v=>v.map(x=>x.id===item.id?{...x,is_active:e.target.checked}:x))}/> Видно</label></div><div className="mt-3 flex gap-3"><button onClick={()=>saveBenefit(item)} disabled={busyId===item.id} className="rounded-full bg-[#2B1A12] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Сохранить</button><button onClick={()=>deleteBenefit(item.id)} disabled={busyId===item.id} className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 disabled:opacity-50">Удалить</button></div></div>)}</div></section>

        <LearningExtraBlocksSettings />
      </>}
    </motion.div>
  );
}
