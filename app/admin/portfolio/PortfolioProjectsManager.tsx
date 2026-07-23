"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

type Media = {
  id: string;
  image_url: string;
  original_filename: string | null;
  mime_type: string | null;
  alt_text: string | null;
  is_active: boolean;
};

type CategoryLink = {
  category_id: string;
  media_id: string;
};

type Project = {
  id: string;
  category_id: string;
  slug: string;
  title: string;
  description: string;
  cover_media_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

type ProjectImage = {
  id: string;
  project_id: string;
  media_id: string;
  is_active: boolean;
  sort_order: number;
};

type FormState = {
  id: string | null;
  categoryId: string;
  slug: string;
  title: string;
  description: string;
  coverMediaId: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  id: null,
  categoryId: "",
  slug: "",
  title: "",
  description: "",
  coverMediaId: "",
  isActive: true,
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9а-яіїєґąćęłńóśźż\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);

export default function PortfolioProjectsManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [categoryLinks, setCategoryLinks] = useState<CategoryLink[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectImages, setProjectImages] = useState<ProjectImage[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    const [categoryResult, mediaResult, categoryLinksResult, projectsResult, imagesResult] = await Promise.all([
      supabase
        .from("portfolio_categories")
        .select("id,name,slug,is_active,sort_order")
        .order("sort_order", { ascending: true }),
      supabase
        .from("media_library")
        .select("id,image_url,original_filename,mime_type,alt_text,is_active")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase.from("portfolio_category_images").select("category_id,media_id"),
      supabase
        .from("portfolio_projects")
        .select("id,category_id,slug,title,description,cover_media_id,is_active,sort_order,created_at")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
      supabase
        .from("portfolio_project_images")
        .select("id,project_id,media_id,is_active,sort_order")
        .order("sort_order", { ascending: true }),
    ]);

    const firstError = categoryResult.error || mediaResult.error || categoryLinksResult.error || projectsResult.error || imagesResult.error;
    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    setCategories((categoryResult.data || []) as Category[]);
    setMedia(((mediaResult.data || []) as Media[]).filter((item) => !item.mime_type || item.mime_type.startsWith("image/")));
    setCategoryLinks((categoryLinksResult.data || []) as CategoryLink[]);
    setProjects((projectsResult.data || []) as Project[]);
    setProjectImages((imagesResult.data || []) as ProjectImage[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const mediaMap = useMemo(() => new Map(media.map((item) => [item.id, item])), [media]);
  const categoryMap = useMemo(() => new Map(categories.map((item) => [item.id, item])), [categories]);

  const availableMedia = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const categoryMediaIds = new Set(
      categoryLinks
        .filter((link) => !form.categoryId || link.category_id === form.categoryId)
        .map((link) => link.media_id),
    );

    return media.filter((item) => {
      if (form.categoryId && !categoryMediaIds.has(item.id)) return false;
      if (!normalizedSearch) return true;
      return `${item.original_filename || ""} ${item.alt_text || ""}`.toLowerCase().includes(normalizedSearch);
    });
  }, [categoryLinks, form.categoryId, media, search]);

  const openCreate = () => {
    setForm({ ...emptyForm, categoryId: categories.find((item) => item.is_active)?.id || categories[0]?.id || "" });
    setSelectedMediaIds([]);
    setSearch("");
    setMessage("");
    setError("");
    setEditorOpen(true);
  };

  const openEdit = (project: Project) => {
    const mediaIds = projectImages
      .filter((item) => item.project_id === project.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => item.media_id);

    setForm({
      id: project.id,
      categoryId: project.category_id,
      slug: project.slug,
      title: project.title,
      description: project.description || "",
      coverMediaId: project.cover_media_id || mediaIds[0] || "",
      isActive: project.is_active,
    });
    setSelectedMediaIds(mediaIds);
    setSearch("");
    setMessage("");
    setError("");
    setEditorOpen(true);
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
    setMessage("");
    setError("");

    const title = form.title.trim();
    const slug = slugify(form.slug || title);
    if (!form.categoryId || !title || !slug) {
      setError("Complete category, project title and URL slug.");
      return;
    }
    if (selectedMediaIds.length === 0) {
      setError("Choose at least one image.");
      return;
    }

    setSaving(true);
    try {
      let projectId: string | null = form.id;
      const coverMediaId = selectedMediaIds.includes(form.coverMediaId) ? form.coverMediaId : selectedMediaIds[0];
      const payload = {
        category_id: form.categoryId,
        slug,
        title,
        description: form.description.trim(),
        cover_media_id: coverMediaId,
        is_active: form.isActive,
      };

      if (projectId) {
        const { error: updateError } = await supabase.from("portfolio_projects").update(payload).eq("id", projectId);
        if (updateError) throw updateError;
        const { error: removeLinksError } = await supabase.from("portfolio_project_images").delete().eq("project_id", projectId);
        if (removeLinksError) throw removeLinksError;
      } else {
        const nextOrder = Math.max(0, ...projects.map((item) => item.sort_order || 0)) + 10;
        const { data, error: insertError } = await supabase
          .from("portfolio_projects")
          .insert({ ...payload, sort_order: nextOrder })
          .select("id")
          .single();
        if (insertError || !data) throw insertError || new Error("Could not create project");
        projectId = data.id;
      }

      if (!projectId) throw new Error("Project ID was not created");
      const { error: linksError } = await supabase.from("portfolio_project_images").insert(
        selectedMediaIds.map((mediaId, index) => ({
          project_id: projectId,
          media_id: mediaId,
          is_active: true,
          sort_order: (index + 1) * 10,
        })),
      );
      if (linksError) throw linksError;

      setMessage(form.id ? "Project updated." : "Project created.");
      setEditorOpen(false);
      await loadData();
    } catch (caught) {
      const text = caught instanceof Error ? caught.message : "Could not save project";
      setError(text.includes("duplicate key") ? "This URL slug is already in use." : text);
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (project: Project) => {
    if (!window.confirm(`Delete project “${project.title}”? Media files will remain in the library and R2.`)) return;
    setError("");
    const { error: deleteError } = await supabase.from("portfolio_projects").delete().eq("id", project.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setMessage("Project deleted. Media files were preserved.");
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
      const { error: updateError } = await supabase
        .from("portfolio_projects")
        .update({ sort_order: (position + 1) * 10 })
        .eq("id", item.id);
      if (updateError) {
        setError(updateError.message);
        await loadData();
        return;
      }
    }
    setMessage("Project order saved.");
  };

  return (
    <section className="rounded-[30px] border border-black/8 bg-white/75 p-5 shadow-[0_22px_75px_rgba(30,30,30,0.08)] sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.04em]">Reusable project records</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6f6c65]">Each project has one neutral title and description. Translation belongs to a future locale layer, not to the database column names.</p>
        </div>
        <button type="button" onClick={openCreate} disabled={loading || categories.length === 0} className="rounded-full bg-[#17191f] px-5 py-3 text-xs font-semibold text-white disabled:opacity-45">+ New project</button>
      </div>

      {categories.length === 0 && !loading && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">Create at least one category in Media before adding a project.</div>
      )}
      {(message || error) && (
        <div className={`mt-5 rounded-2xl border px-5 py-4 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-800"}`}>{error || message}</div>
      )}

      {loading ? (
        <p className="mt-7 text-sm text-[#6f6c65]">Loading projects…</p>
      ) : projects.length === 0 ? (
        <div className="mt-7 rounded-[24px] border border-dashed border-black/15 bg-[#f3f1eb]/70 p-8 text-center">
          <p className="text-lg font-semibold">No projects yet</p>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#6f6c65]">The clean foundation is ready for the first neutral portfolio collection.</p>
        </div>
      ) : (
        <div className="mt-7 grid gap-4 lg:grid-cols-2">
          {projects.map((project, index) => {
            const cover = project.cover_media_id ? mediaMap.get(project.cover_media_id) : null;
            const count = projectImages.filter((item) => item.project_id === project.id).length;
            return (
              <article key={project.id} className="flex gap-4 rounded-[24px] border border-black/8 bg-white p-4">
                <div className="h-32 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#e8e4dc]">
                  {cover ? <img src={cover.image_url} alt={cover.alt_text || project.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-[#8b877e]">No cover</div>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a742e]">{categoryMap.get(project.category_id)?.name || "Category"}</span>
                    <span className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase ${project.is_active ? "bg-green-50 text-green-700" : "bg-[#eeebe3] text-[#6f6c65]"}`}>{project.is_active ? "Active" : "Hidden"}</span>
                  </div>
                  <h3 className="mt-2 truncate text-xl font-semibold">{project.title}</h3>
                  <p className="mt-1 text-xs text-[#6f6c65]">{count} image(s) · {project.slug}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => openEdit(project)} className="rounded-full bg-[#17191f] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">Edit</button>
                    <button type="button" onClick={() => void moveProject(project, "up")} disabled={index === 0} className="rounded-full border border-black/10 px-3 py-2 text-[10px] font-semibold disabled:opacity-30">↑</button>
                    <button type="button" onClick={() => void moveProject(project, "down")} disabled={index === projects.length - 1} className="rounded-full border border-black/10 px-3 py-2 text-[10px] font-semibold disabled:opacity-30">↓</button>
                    <button type="button" onClick={() => void deleteProject(project)} className="rounded-full border border-red-200 px-3 py-2 text-[10px] font-semibold text-red-600">Delete</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editorOpen && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/45 p-4 backdrop-blur-sm">
          <div className="mx-auto my-8 max-w-6xl rounded-[30px] bg-[#f8f6f1] p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">{form.id ? "Edit project" : "New project"}</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Project details</h3>
              </div>
              <button type="button" onClick={() => setEditorOpen(false)} className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold">Close</button>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
              <div className="space-y-4 rounded-[24px] border border-black/8 bg-white p-5">
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6c65]">Category
                  <select value={form.categoryId} onChange={(event) => { setForm((value) => ({ ...value, categoryId: event.target.value })); setSelectedMediaIds([]); }} className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm font-normal normal-case tracking-normal outline-none">
                    <option value="">Select category</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6c65]">Title
                  <input value={form.title} onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))} className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm font-normal normal-case tracking-normal outline-none" />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6c65]">URL slug
                  <input value={form.slug} onChange={(event) => setForm((value) => ({ ...value, slug: event.target.value }))} placeholder={slugify(form.title) || "project-name"} className="mt-2 w-full rounded-2xl border border-black/10 px-4 py-3 text-sm font-normal normal-case tracking-normal outline-none" />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#6f6c65]">Description
                  <textarea value={form.description} onChange={(event) => setForm((value) => ({ ...value, description: event.target.value }))} rows={6} className="mt-2 w-full resize-y rounded-2xl border border-black/10 px-4 py-3 text-sm font-normal normal-case tracking-normal outline-none" />
                </label>
                <label className="flex items-center gap-3 rounded-2xl bg-[#f3f1eb] px-4 py-3 text-sm font-semibold">
                  <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((value) => ({ ...value, isActive: event.target.checked }))} />
                  Active project
                </label>
                <button type="button" onClick={() => void saveProject()} disabled={saving} className="w-full rounded-full bg-[#17191f] px-5 py-3 text-xs font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save project"}</button>
              </div>

              <div className="rounded-[24px] border border-black/8 bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-lg font-semibold">Project images</h4>
                    <p className="mt-1 text-xs text-[#6f6c65]">Selected: {selectedMediaIds.length}. Click an image to add or remove it.</p>
                  </div>
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search media" className="rounded-2xl border border-black/10 px-4 py-2.5 text-sm outline-none" />
                </div>

                {selectedMediaIds.length > 0 && (
                  <div className="mt-4 rounded-2xl bg-[#f3f1eb] p-3">
                    <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f6c65]">Selected order and cover</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedMediaIds.map((mediaId, index) => {
                        const item = mediaMap.get(mediaId);
                        if (!item) return null;
                        return (
                          <div key={mediaId} className={`flex items-center gap-2 rounded-xl border bg-white p-2 ${form.coverMediaId === mediaId ? "border-[#9a742e]" : "border-black/8"}`}>
                            <img src={item.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                            <span className="text-xs font-semibold">{index + 1}</span>
                            <button type="button" onClick={() => setForm((value) => ({ ...value, coverMediaId: mediaId }))} className="rounded-lg px-2 py-1 text-[10px] font-semibold">{form.coverMediaId === mediaId ? "Cover" : "Set cover"}</button>
                            <button type="button" onClick={() => moveSelected(mediaId, "up")} disabled={index === 0} className="text-xs disabled:opacity-25">↑</button>
                            <button type="button" onClick={() => moveSelected(mediaId, "down")} disabled={index === selectedMediaIds.length - 1} className="text-xs disabled:opacity-25">↓</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-4 grid max-h-[560px] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
                  {availableMedia.map((item) => {
                    const selected = selectedMediaIds.includes(item.id);
                    return (
                      <button type="button" key={item.id} onClick={() => toggleMedia(item.id)} className={`overflow-hidden rounded-2xl border text-left ${selected ? "border-[#9a742e] ring-2 ring-[#9a742e]/20" : "border-black/8"}`}>
                        <div className="relative aspect-[4/3] bg-[#e8e4dc]">
                          <img src={item.image_url} alt={item.alt_text || item.original_filename || "Media"} className="h-full w-full object-cover" loading="lazy" />
                          <span className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${selected ? "bg-[#9a742e] text-white" : "bg-black/35 text-white"}`}>{selected ? "✓" : ""}</span>
                        </div>
                        <p className="truncate px-3 py-2 text-xs font-semibold">{item.original_filename || item.alt_text || "Media"}</p>
                      </button>
                    );
                  })}
                </div>
                {availableMedia.length === 0 && <p className="mt-8 text-center text-sm text-[#6f6c65]">No active images are assigned to this category.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
