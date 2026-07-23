"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Category = { id: string; name_uk: string; name_pl: string; is_active: boolean; sort_order: number };
type Media = { id: string; image_url: string; original_filename: string | null; alt_uk: string | null; mime_type: string | null; is_active: boolean; created_at: string };
type CategoryLink = { category_id: string; media_id: string };
type Project = {
  id: string;
  category_id: string;
  slug: string;
  title_uk: string;
  title_pl: string;
  description_uk: string;
  description_pl: string;
  cover_media_id: string | null;
  is_active: boolean;
  sort_order: number;
};
type ProjectImage = { id: string; project_id: string; media_id: string; sort_order: number };

const emptyForm = {
  id: "",
  categoryId: "",
  slug: "",
  titleUk: "",
  titlePl: "",
  descriptionUk: "",
  descriptionPl: "",
  coverMediaId: "",
  isActive: true,
};

function slugify(value: string) {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", ё: "e", є: "ye", ж: "zh", з: "z", и: "y", і: "i", ї: "yi", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
    ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z",
  };
  const transliterated = value.toLowerCase().split("").map((char) => map[char] ?? char).join("");
  return transliterated.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export default function PortfolioProjectsManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [categoryLinks, setCategoryLinks] = useState<CategoryLink[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError("");
    const [categoriesResult, mediaResult, categoryLinksResult, projectsResult, imagesResult] = await Promise.all([
      supabase.from("portfolio_categories").select("id, name_uk, name_pl, is_active, sort_order").order("sort_order"),
      supabase.from("media_library").select("id, image_url, original_filename, alt_uk, mime_type, is_active, created_at").eq("is_active", true).order("created_at", { ascending: false }),
      supabase.from("portfolio_category_images").select("category_id, media_id"),
      supabase.from("portfolio_projects").select("id, category_id, slug, title_uk, title_pl, description_uk, description_pl, cover_media_id, is_active, sort_order").order("sort_order").order("created_at", { ascending: false }),
      supabase.from("portfolio_project_images").select("id, project_id, media_id, sort_order").order("sort_order"),
    ]);

    const firstError = categoriesResult.error || mediaResult.error || categoryLinksResult.error || projectsResult.error || imagesResult.error;
    if (firstError) {
      const migrationMissing = firstError.message.includes("portfolio_projects") || firstError.message.includes("portfolio_project_images") || firstError.code === "PGRST205";
      setError(migrationMissing ? "Сначала выполните файл supabase/portfolio-projects.sql в Supabase SQL Editor." : firstError.message);
      setIsLoading(false);
      return;
    }

    setCategories((categoriesResult.data || []) as Category[]);
    setMedia(((mediaResult.data || []) as Media[]).filter((item) => !item.mime_type || item.mime_type.startsWith("image/")));
    setCategoryLinks((categoryLinksResult.data || []) as CategoryLink[]);
    setProjects((projectsResult.data || []) as Project[]);
    setProjectImages((imagesResult.data || []) as ProjectImage[]);
    setIsLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const mediaMap = useMemo(() => new Map(media.map((item) => [item.id, item])), [media]);
  const categoryMap = useMemo(() => new Map(categories.map((item) => [item.id, item])), [categories]);
  const availableMedia = useMemo(() => {
    const categoryMediaIds = new Set(categoryLinks.filter((link) => !form.categoryId || link.category_id === form.categoryId).map((link) => link.media_id));
    const query = search.trim().toLowerCase();
    return media.filter((item) => {
      if (form.categoryId && !categoryMediaIds.has(item.id)) return false;
      if (!query) return true;
      return `${item.original_filename || ""} ${item.alt_uk || ""}`.toLowerCase().includes(query);
    });
  }, [categoryLinks, form.categoryId, media, search]);

  const openCreate = () => {
    setForm({ ...emptyForm, categoryId: categories.find((item) => item.is_active)?.id || "" });
    setSelectedMediaIds([]);
    setSearch("");
    setError("");
    setMessage("");
    setIsEditorOpen(true);
  };

  const openEdit = (project: Project) => {
    const imageIds = projectImages.filter((item) => item.project_id === project.id).sort((a, b) => a.sort_order - b.sort_order).map((item) => item.media_id);
    setForm({
      id: project.id,
      categoryId: project.category_id,
      slug: project.slug,
      titleUk: project.title_uk,
      titlePl: project.title_pl,
      descriptionUk: project.description_uk || "",
      descriptionPl: project.description_pl || "",
      coverMediaId: project.cover_media_id || imageIds[0] || "",
      isActive: project.is_active,
    });
    setSelectedMediaIds(imageIds);
    setSearch("");
    setError("");
    setMessage("");
    setIsEditorOpen(true);
  };

  const toggleMedia = (mediaId: string) => {
    setSelectedMediaIds((current) => {
      if (current.includes(mediaId)) {
        if (form.coverMediaId === mediaId) setForm((value) => ({ ...value, coverMediaId: "" }));
        return current.filter((id) => id !== mediaId);
      }
      if (!form.coverMediaId) setForm((value) => ({ ...value, coverMediaId: mediaId }));
      return [...current, mediaId];
    });
  };

  const moveSelected = (mediaId: string, direction: "up" | "down") => {
    setSelectedMediaIds((current) => {
      const index = current.indexOf(mediaId);
      const target = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const saveProject = async () => {
    setError("");
    setMessage("");
    const titleUk = form.titleUk.trim();
    const titlePl = form.titlePl.trim() || titleUk;
    const slug = slugify(form.slug || titlePl || titleUk);
    if (!form.categoryId || !titleUk || !titlePl || !slug) return setError("Заполните категорию, названия и адрес съёмки.");
    if (selectedMediaIds.length === 0) return setError("Выберите хотя бы одну фотографию.");
    const coverMediaId = selectedMediaIds.includes(form.coverMediaId) ? form.coverMediaId : selectedMediaIds[0];
    setIsSaving(true);

    try {
      let projectId = form.id;
      const payload = {
        category_id: form.categoryId,
        slug,
        title_uk: titleUk,
        title_pl: titlePl,
        description_uk: form.descriptionUk.trim(),
        description_pl: form.descriptionPl.trim(),
        cover_media_id: coverMediaId,
        is_active: form.isActive,
      };

      if (projectId) {
        const { error: updateError } = await supabase.from("portfolio_projects").update(payload).eq("id", projectId);
        if (updateError) throw updateError;
        const { error: deleteLinksError } = await supabase.from("portfolio_project_images").delete().eq("project_id", projectId);
        if (deleteLinksError) throw deleteLinksError;
      } else {
        const nextSortOrder = Math.max(0, ...projects.map((item) => item.sort_order || 0)) + 10;
        const { data, error: insertError } = await supabase.from("portfolio_projects").insert({ ...payload, sort_order: nextSortOrder }).select("id").single();
        if (insertError || !data) throw insertError || new Error("Не удалось создать съёмку");
        projectId = data.id;
      }

      const { error: linksError } = await supabase.from("portfolio_project_images").insert(selectedMediaIds.map((mediaId, index) => ({ project_id: projectId, media_id: mediaId, is_active: true, sort_order: (index + 1) * 10 })));
      if (linksError) throw linksError;
      setMessage(form.id ? "Съёмка обновлена" : "Съёмка создана");
      setIsEditorOpen(false);
      await loadData();
    } catch (caught) {
      const text = caught instanceof Error ? caught.message : "Не удалось сохранить съёмку";
      setError(text.includes("duplicate key") ? "Такой адрес страницы уже используется. Измените поле «Адрес»." : text);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProject = async (project: Project) => {
    if (!window.confirm(`Удалить съёмку «${project.title_uk}»? Фотографии останутся в медиатеке и R2.`)) return;
    const { error: deleteError } = await supabase.from("portfolio_projects").delete().eq("id", project.id);
    if (deleteError) return setError(deleteError.message);
    setMessage("Съёмка удалена. Фотографии сохранены в медиатеке.");
    await loadData();
  };

  const moveProject = async (project: Project, direction: "up" | "down") => {
    const index = projects.findIndex((item) => item.id === project.id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= projects.length) return;
    const reordered = [...projects];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setProjects(reordered);
    for (const [position, item] of reordered.entries()) {
      const { error: orderError } = await supabase.from("portfolio_projects").update({ sort_order: (position + 1) * 10 }).eq("id", item.id);
      if (orderError) { setError(orderError.message); await loadData(); return; }
    }
    setMessage("Порядок съёмок сохранён");
  };

  return (
    <div className="rounded-[34px] border border-[#E5D5C8] bg-white/75 p-5 shadow-[0_24px_90px_rgba(83,54,37,0.12)] sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#A67C52]">Новый формат</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Съёмки и галереи</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7A6252]">Создайте одну карточку на клиентку или проект, выберите обложку и добавьте внутрь всю серию фотографий.</p>
        </div>
        <button type="button" onClick={openCreate} disabled={isLoading || categories.length === 0} className="rounded-full bg-[#2B1A12] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#F7F1EA] transition hover:bg-[#4A2D1E] disabled:opacity-50">+ Новая съёмка</button>
      </div>

      {message && <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">{message}</div>}
      {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

      {isLoading ? <p className="mt-7 text-sm text-[#7A6252]">Загружаем съёмки…</p> : projects.length === 0 ? (
        <div className="mt-7 rounded-[26px] border border-dashed border-[#D8C4B3] bg-[#F7F1EA]/70 p-8 text-center">
          <p className="text-lg font-semibold">Съёмок пока нет</p>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#7A6252]">Старое портфолио продолжает работать. Создайте и подготовьте съёмки, затем новая карточная версия включится автоматически.</p>
        </div>
      ) : (
        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          {projects.map((project, index) => {
            const cover = project.cover_media_id ? mediaMap.get(project.cover_media_id) : null;
            const count = projectImages.filter((item) => item.project_id === project.id).length;
            return (
              <article key={project.id} className="flex gap-4 rounded-[26px] border border-[#E5D5C8] bg-[#FFFDFB] p-4">
                <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#EADFD5]">
                  {cover && <Image src={cover.image_url} alt="" fill sizes="96px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A67C52]">{categoryMap.get(project.category_id)?.name_uk || "Категория"}</span>
                    <span className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase ${project.is_active ? "bg-green-50 text-green-700" : "bg-[#EFE7E0] text-[#7A6252]"}`}>{project.is_active ? "На сайте" : "Скрыта"}</span>
                  </div>
                  <h3 className="mt-2 truncate text-xl font-semibold">{project.title_uk}</h3>
                  <p className="mt-1 text-xs text-[#7A6252]">{count} фото · /portfolio/{project.slug}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => openEdit(project)} className="rounded-full bg-[#2B1A12] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">Изменить</button>
                    <button type="button" onClick={() => moveProject(project, "up")} disabled={index === 0} className="rounded-full border border-[#D8C4B3] px-3 py-2 text-xs disabled:opacity-30">↑</button>
                    <button type="button" onClick={() => moveProject(project, "down")} disabled={index === projects.length - 1} className="rounded-full border border-[#D8C4B3] px-3 py-2 text-xs disabled:opacity-30">↓</button>
                    <button type="button" onClick={() => deleteProject(project)} className="rounded-full border border-red-200 px-3 py-2 text-[10px] font-semibold uppercase text-red-700">Удалить</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {isEditorOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/55 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsEditorOpen(false); }}>
          <div className="mx-auto my-4 w-full max-w-6xl rounded-[30px] bg-[#F7F1EA] p-5 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div><p className="text-xs uppercase tracking-[0.2em] text-[#A67C52]">{form.id ? "Редактирование" : "Новая съёмка"}</p><h3 className="mt-1 text-3xl font-semibold">Карточка и галерея</h3></div>
              <button type="button" onClick={() => setIsEditorOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#D8C4B3] text-2xl">×</button>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium">Категория<select value={form.categoryId} onChange={(event) => { setForm((value) => ({ ...value, categoryId: event.target.value, coverMediaId: "" })); setSelectedMediaIds([]); }} className="mt-2 h-12 w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 outline-none">{categories.filter((item) => item.is_active).map((category) => <option key={category.id} value={category.id}>{category.name_uk} / {category.name_pl}</option>)}</select></label>
              <label className="text-sm font-medium">Адрес страницы<input value={form.slug} onChange={(event) => setForm((value) => ({ ...value, slug: event.target.value }))} placeholder="biznes-portret-anna" className="mt-2 h-12 w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 outline-none" /></label>
              <label className="text-sm font-medium">Название (украинский)<input value={form.titleUk} onChange={(event) => setForm((value) => ({ ...value, titleUk: event.target.value, slug: value.slug || slugify(event.target.value) }))} placeholder="Бізнес-портрет для Анни" className="mt-2 h-12 w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 outline-none" /></label>
              <label className="text-sm font-medium">Название (польский)<input value={form.titlePl} onChange={(event) => setForm((value) => ({ ...value, titlePl: event.target.value }))} placeholder="Portret biznesowy Anny" className="mt-2 h-12 w-full rounded-2xl border border-[#D8C4B3] bg-white px-4 outline-none" /></label>
              <label className="text-sm font-medium">Описание (украинский)<textarea value={form.descriptionUk} onChange={(event) => setForm((value) => ({ ...value, descriptionUk: event.target.value }))} rows={3} className="mt-2 w-full rounded-2xl border border-[#D8C4B3] bg-white p-4 outline-none" /></label>
              <label className="text-sm font-medium">Описание (польский)<textarea value={form.descriptionPl} onChange={(event) => setForm((value) => ({ ...value, descriptionPl: event.target.value }))} rows={3} className="mt-2 w-full rounded-2xl border border-[#D8C4B3] bg-white p-4 outline-none" /></label>
            </div>

            <div className="mt-7 rounded-[24px] border border-[#D8C4B3] bg-white/70 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h4 className="font-semibold">Фотографии съёмки</h4><p className="mt-1 text-xs text-[#7A6252]">Отмечено: {selectedMediaIds.length}. Звёздочка выбирает обложку.</p></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск по имени файла" className="h-11 rounded-full border border-[#D8C4B3] bg-white px-4 text-sm outline-none" /></div>

              {selectedMediaIds.length > 0 && <div className="mt-4 flex gap-3 overflow-x-auto pb-2">{selectedMediaIds.map((id, index) => { const item = mediaMap.get(id); if (!item) return null; return <div key={id} className="w-24 shrink-0"><div className="relative h-28 overflow-hidden rounded-xl"><Image src={item.image_url} alt="" fill sizes="96px" className="object-cover" /><button type="button" onClick={() => setForm((value) => ({ ...value, coverMediaId: id }))} className={`absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full ${form.coverMediaId === id ? "bg-[#E9A7B3] text-[#2B1A12]" : "bg-black/60 text-white"}`}>★</button></div><div className="mt-1 flex justify-center gap-1"><button type="button" onClick={() => moveSelected(id, "up")} disabled={index === 0} className="px-2 disabled:opacity-20">←</button><button type="button" onClick={() => moveSelected(id, "down")} disabled={index === selectedMediaIds.length - 1} className="px-2 disabled:opacity-20">→</button></div></div>; })}</div>}

              <div className="mt-4 grid max-h-[430px] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9">
                {availableMedia.map((item) => { const selected = selectedMediaIds.includes(item.id); return <button key={item.id} type="button" onClick={() => toggleMedia(item.id)} className={`relative aspect-[3/4] overflow-hidden rounded-xl border-2 ${selected ? "border-[#E9A7B3] ring-2 ring-[#E9A7B3]/30" : "border-transparent"}`}><Image src={item.image_url} alt={item.alt_uk || ""} fill sizes="140px" className="object-cover" />{selected && <span className="absolute left-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#E9A7B3] text-sm font-bold text-[#2B1A12]">✓</span>}</button>; })}
              </div>
              {availableMedia.length === 0 && <p className="py-8 text-center text-sm text-[#7A6252]">В этой категории нет фотографий. Сначала добавьте их в категорию через медиатеку.</p>}
            </div>

            <label className="mt-5 flex items-center gap-3 text-sm"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((value) => ({ ...value, isActive: event.target.checked }))} className="h-5 w-5" />Показывать съёмку на сайте</label>
            {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => setIsEditorOpen(false)} className="rounded-full border border-[#D8C4B3] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em]">Отмена</button><button type="button" onClick={saveProject} disabled={isSaving} className="rounded-full bg-[#2B1A12] px-7 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-50">{isSaving ? "Сохраняем…" : "Сохранить съёмку"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
