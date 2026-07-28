"use client";

/* eslint-disable @next/next/no-img-element */

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { supabase } from "@/lib/supabase";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";

type Category = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

type MediaItem = {
  id: string;
  image_url: string;
  r2_key: string;
  original_filename: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  is_active: boolean;
  is_favorite: boolean;
  manual_likes: number;
  source: string;
  created_at: string;
};

type CategoryLink = {
  id: string;
  category_id: string;
  media_id: string;
  is_active: boolean;
  sort_order: number;
};

type Workspace = {
  business_id: string;
  is_default: boolean;
};

const formatBytes = (bytes: number | null) => {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const isVideo = (mimeType: string | null) => Boolean(mimeType?.startsWith("video/"));

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || "";
}

export default function AdminMediaPage() {
  const { t } = useAdminI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [links, setLinks] = useState<CategoryLink[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [businessId, setBusinessId] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data: workspaceData, error: workspaceError } = await supabase.rpc(
      "list_my_businesses",
    );
    const workspaces = (workspaceData ?? []) as Workspace[];
    const workspace =
      workspaces.find((item) => item.is_default) ?? workspaces[0] ?? null;

    if (workspaceError || !workspace) {
      setError(workspaceError?.message || t("No active workspace was found."));
      setLoading(false);
      return;
    }

    setBusinessId(workspace.business_id);

    const [categoryResult, mediaResult, linkResult] = await Promise.all([
      supabase
        .from("portfolio_categories")
        .select("id,name,slug,is_active,sort_order")
        .eq("business_id", workspace.business_id)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("media_library")
        .select(
          "id,image_url,r2_key,original_filename,mime_type,size_bytes,width,height,alt_text,is_active,is_favorite,manual_likes,source,created_at",
        )
        .eq("business_id", workspace.business_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("portfolio_category_images")
        .select("id,category_id,media_id,is_active,sort_order")
        .eq("business_id", workspace.business_id)
        .order("sort_order", { ascending: true }),
    ]);

    const firstError = categoryResult.error || mediaResult.error || linkResult.error;
    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    setCategories((categoryResult.data || []) as Category[]);
    setItems((mediaResult.data || []) as MediaItem[]);
    setLinks((linkResult.data || []) as CategoryLink[]);
    setSelectedIds([]);
    setLoading(false);
  }, [t]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const categoryMediaIds = new Set(
      links.filter((link) => categoryId === "all" || link.category_id === categoryId).map((link) => link.media_id),
    );

    return items.filter((item) => {
      if (categoryId !== "all" && !categoryMediaIds.has(item.id)) return false;
      if (!normalizedQuery) return true;
      return [item.original_filename, item.r2_key, item.alt_text, item.source]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [categoryId, items, links, query]);

  const totalStorage = useMemo(
    () => items.reduce((total, item) => total + Number(item.size_bytes || 0), 0),
    [items],
  );

  const clearNotices = () => {
    setMessage("");
    setError("");
  };

  const createCategory = async () => {
    const name = window.prompt(t("Category name"));
    if (!name?.trim()) return;

    clearNotices();
    setWorking(true);
    try {
      const token = await getAccessToken();
      const response = await fetch("/api/admin/portfolio/categories", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || t("Could not create category"));
      setMessage(t("Category created."));
      await loadData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("Could not create category"));
    } finally {
      setWorking(false);
    }
  };

  const uploadFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;

    const targetCategory = categoryId === "all" ? categories[0]?.id : categoryId;
    if (!targetCategory) {
      setError(t("Create a portfolio category before uploading media."));
      return;
    }

    clearNotices();
    setUploading(true);
    try {
      const token = await getAccessToken();
      const formData = new FormData();
      formData.append("categoryId", targetCategory);
      files.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/admin/portfolio/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const payload = (await response.json()) as { error?: string; images?: unknown[] };
      if (!response.ok) throw new Error(payload.error || t("Upload failed"));
      setMessage(t("Files uploaded: {count}.", { count: payload.images?.length || files.length }));
      await loadData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const syncR2 = async () => {
    clearNotices();
    setSyncing(true);
    try {
      const token = await getAccessToken();
      const response = await fetch("/api/admin/media/sync-r2", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = (await response.json()) as { error?: string; addedCount?: number; skippedCount?: number };
      if (!response.ok) throw new Error(payload.error || t("R2 sync failed"));
      setMessage(t("R2 synced. Added: {added}. Already present: {skipped}.", { added: payload.addedCount || 0, skipped: payload.skippedCount || 0 }));
      await loadData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("R2 sync failed"));
    } finally {
      setSyncing(false);
    }
  };

  const patchMedia = async (id: string, patch: Partial<MediaItem>, successMessage: string) => {
    if (!businessId) return;
    clearNotices();
    const { error: updateError } = await supabase
      .from("media_library")
      .update(patch)
      .eq("business_id", businessId)
      .eq("id", id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    setMessage(successMessage);
  };

  const editAltText = async (item: MediaItem) => {
    const value = window.prompt(t("Alternative text"), item.alt_text || "");
    if (value === null) return;
    await patchMedia(item.id, { alt_text: value.trim() || null }, t("Alternative text saved."));
  };

  const assignSelectedToCategory = async () => {
    if (selectedIds.length === 0 || !businessId) return;
    const targetCategory = categoryId === "all" ? categories[0]?.id : categoryId;
    if (!targetCategory) {
      setError(t("Select or create a category first."));
      return;
    }

    clearNotices();
    setWorking(true);
    try {
      const existing = new Set(
        links.filter((link) => link.category_id === targetCategory).map((link) => link.media_id),
      );
      const missingIds = selectedIds.filter((id) => !existing.has(id));
      if (missingIds.length === 0) {
        setMessage(t("Selected media is already assigned to this category."));
        return;
      }
      const lastSortOrder = Math.max(
        0,
        ...links.filter((link) => link.category_id === targetCategory).map((link) => link.sort_order || 0),
      );
      const { error: insertError } = await supabase.from("portfolio_category_images").insert(
        missingIds.map((mediaId, index) => ({
          business_id: businessId,
          category_id: targetCategory,
          media_id: mediaId,
          is_active: true,
          sort_order: lastSortOrder + (index + 1) * 10,
        })),
      );
      if (insertError) throw insertError;
      setMessage(t("Items assigned: {count}.", { count: missingIds.length }));
      await loadData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("Could not assign media"));
    } finally {
      setWorking(false);
    }
  };

  const removeSelectedFromCategory = async () => {
    if (selectedIds.length === 0 || categoryId === "all" || !businessId) return;
    clearNotices();
    setWorking(true);
    const { error: deleteError } = await supabase
      .from("portfolio_category_images")
      .delete()
      .eq("business_id", businessId)
      .eq("category_id", categoryId)
      .in("media_id", selectedIds);
    if (deleteError) setError(deleteError.message);
    else {
      setMessage(t("Selected media removed from this category. Files remain in the library and R2."));
      await loadData();
    }
    setWorking(false);
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(t("Delete {count} selected file(s) from R2 and the database?", { count: selectedIds.length }))) return;

    clearNotices();
    setWorking(true);
    try {
      const token = await getAccessToken();
      const response = await fetch("/api/admin/media/bulk-delete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mediaIds: selectedIds }),
      });
      const payload = (await response.json()) as { error?: string; deletedCount?: number; failedCount?: number };
      if (!response.ok && response.status !== 207) throw new Error(payload.error || t("Delete failed"));
      setMessage(t("Deleted: {deleted}. Failed: {failed}.", { deleted: payload.deletedCount || 0, failed: payload.failedCount || 0 }));
      await loadData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("Delete failed"));
    } finally {
      setWorking(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id],
    );
  };

  return (
    <main className="min-h-screen px-4 pb-16 pt-24 sm:px-6 lg:px-10">
      <AdminHeader />
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#9a742e]">{t("Core module")}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">{t("Media library")}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6f6c65]">
              {t("Brand-neutral storage for images and videos. Categories, file metadata and R2 links use the clean OneStudio schema.")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={createCategory} disabled={working} className="rounded-full border border-black/10 bg-white px-4 py-3 text-xs font-semibold">{t("+ Category")}</button>
            <button type="button" onClick={syncR2} disabled={syncing} className="rounded-full border border-black/10 bg-white px-4 py-3 text-xs font-semibold">{syncing ? t("Syncing…") : t("Sync R2")}</button>
            <label className="cursor-pointer rounded-full bg-[#17191f] px-5 py-3 text-xs font-semibold text-white">
              {uploading ? t("Uploading…") : t("Upload images")}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif" multiple disabled={uploading} onChange={uploadFiles} className="hidden" />
            </label>
          </div>
        </div>

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            [t("Files"), String(items.length)],
            [t("Categories"), String(categories.length)],
            [t("Storage"), formatBytes(totalStorage)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[24px] border border-black/8 bg-white/80 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#8b877e]">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </section>

        {(message || error) && (
          <div className={`mt-6 rounded-[20px] border px-5 py-4 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-800"}`}>
            {error || message}
          </div>
        )}

        <section className="mt-6 rounded-[28px] border border-black/8 bg-white/75 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px_auto]">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Search filename, R2 key or alt text")} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#9a742e]" />
            <select value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setSelectedIds([]); }} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none">
              <option value="all">{t("All categories")}</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <button type="button" onClick={() => void loadData()} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-xs font-semibold">{t("Refresh")}</button>
          </div>

          {selectedIds.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-[#17191f] p-3 text-white">
              <span className="px-2 text-xs font-semibold">{t("Selected: {count}", { count: selectedIds.length })}</span>
              <button type="button" onClick={assignSelectedToCategory} disabled={working} className="rounded-full bg-white/12 px-4 py-2 text-xs font-semibold">{t("Assign to category")}</button>
              {categoryId !== "all" && <button type="button" onClick={removeSelectedFromCategory} disabled={working} className="rounded-full bg-white/12 px-4 py-2 text-xs font-semibold">{t("Remove from category")}</button>}
              <button type="button" onClick={deleteSelected} disabled={working} className="rounded-full bg-red-400/20 px-4 py-2 text-xs font-semibold text-red-100">{t("Delete files")}</button>
              <button type="button" onClick={() => setSelectedIds([])} className="ml-auto rounded-full px-4 py-2 text-xs font-semibold text-white/70">{t("Clear")}</button>
            </div>
          )}
        </section>

        {loading ? (
          <p className="mt-8 text-sm text-[#6f6c65]">{t("Loading media…")}</p>
        ) : filteredItems.length === 0 ? (
          <div className="mt-8 rounded-[28px] border border-dashed border-black/15 bg-white/55 p-10 text-center">
            <h2 className="text-xl font-semibold">{t("No media yet")}</h2>
            <p className="mt-2 text-sm text-[#6f6c65]">{t("Create a category and upload the first images, or sync an existing R2 bucket.")}</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredItems.map((item) => {
              const selected = selectedIds.includes(item.id);
              const itemCategories = categories.filter((category) => links.some((link) => link.media_id === item.id && link.category_id === category.id));
              return (
                <article key={item.id} className={`overflow-hidden rounded-[26px] border bg-white shadow-[0_20px_60px_rgba(30,30,30,0.07)] ${selected ? "border-[#9a742e] ring-2 ring-[#9a742e]/20" : "border-black/8"}`}>
                  <button type="button" onClick={() => toggleSelection(item.id)} className="relative block aspect-[4/3] w-full overflow-hidden bg-[#e8e4dc] text-left">
                    {isVideo(item.mime_type) ? (
                      <video src={item.image_url} className="h-full w-full object-cover" muted playsInline />
                    ) : (
                      <img src={item.image_url} alt={item.alt_text || item.original_filename || "Media"} className="h-full w-full object-cover" loading="lazy" />
                    )}
                    <span className={`absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${selected ? "border-[#9a742e] bg-[#9a742e] text-white" : "border-white/70 bg-black/30 text-white"}`}>{selected ? "✓" : ""}</span>
                    {!item.is_active && <span className="absolute right-3 top-3 rounded-full bg-black/65 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">{t("Hidden")}</span>}
                  </button>
                  <div className="p-4">
                    <p className="truncate text-sm font-semibold" title={item.original_filename || item.r2_key}>{item.original_filename || item.r2_key}</p>
                    <p className="mt-1 text-xs text-[#8b877e]">{formatBytes(item.size_bytes)} · {item.width && item.height ? `${item.width}×${item.height}` : item.mime_type || "file"}</p>
                    <p className="mt-3 min-h-10 text-xs leading-5 text-[#6f6c65]">{item.alt_text || t("No alternative text")}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {itemCategories.length > 0 ? itemCategories.map((category) => <span key={category.id} className="rounded-full bg-[#eeebe3] px-2.5 py-1 text-[10px] font-semibold">{category.name}</span>) : <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">{t("Uncategorized")}</span>}
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <button type="button" onClick={() => void patchMedia(item.id, { is_favorite: !item.is_favorite }, item.is_favorite ? t("Removed from favorites.") : t("Added to favorites."))} className="rounded-xl border border-black/8 px-2 py-2 text-xs font-semibold">{item.is_favorite ? "★" : "☆"}</button>
                      <button type="button" onClick={() => void patchMedia(item.id, { is_active: !item.is_active }, item.is_active ? t("Media hidden.") : t("Media visible."))} className="rounded-xl border border-black/8 px-2 py-2 text-xs font-semibold">{item.is_active ? t("Hide") : t("Show")}</button>
                      <button type="button" onClick={() => void editAltText(item)} className="rounded-xl border border-black/8 px-2 py-2 text-xs font-semibold">{t("Alt")}</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
