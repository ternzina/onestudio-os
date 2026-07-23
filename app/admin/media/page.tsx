"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import BulkToolbar from "./components/BulkToolbar";
import CategoryManagerDialog from "./components/CategoryManagerDialog";
import MediaFilters from "./components/MediaFilters";
import MediaGrid from "./components/MediaGrid";
import MediaPreviewDialog from "./components/MediaPreviewDialog";
import MediaStats from "./components/MediaStats";
import MediaUploadPanel from "./components/MediaUploadPanel";
import type {
  ActiveMediaFilter,
  CategoryLink,
  MediaLibraryItem,
  MediaTypeFilter,
  OrientationFilter,
  PortfolioCategory,
} from "./components/types";
import { getOrientation, isVideoMedia } from "./components/mediaUtils";

const getSessionToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token || "";
};

type MediaViewMode = "thumbnails" | "cards";
const MEDIA_PAGE_SIZE = 30;

export default function AdminMediaLibraryPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingR2, setIsSyncingR2] = useState(false);
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaLibraryItem[]>([]);
  const [categoryLinks, setCategoryLinks] = useState<CategoryLink[]>([]);
  const [query, setQuery] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>("all");
  const [activeFilter, setActiveFilter] = useState<ActiveMediaFilter>("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [orientationFilter, setOrientationFilter] =
    useState<OrientationFilter>("all");
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [selectedMediaItem, setSelectedMediaItem] =
    useState<MediaLibraryItem | null>(null);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isSavingCategoryOrder, setIsSavingCategoryOrder] = useState(false);
  const [categoryOrderMessage, setCategoryOrderMessage] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [viewMode, setViewMode] = useState<MediaViewMode>("thumbnails");
  const [visibleCount, setVisibleCount] = useState(MEDIA_PAGE_SIZE);
  const [returnTo, setReturnTo] = useState("");

  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase();

    return mediaItems
      .filter((item) => {
        if (mediaTypeFilter === "images" && isVideoMedia(item.mime_type)) return false;
        if (mediaTypeFilter === "videos" && !isVideoMedia(item.mime_type)) return false;
        if (activeFilter === "visible" && !item.is_active) return false;
        if (activeFilter === "hidden" && item.is_active) return false;
        if (activeFilter === "favorite" && !item.is_favorite) return false;
        if (activeFilter === "uncategorized") {
          const hasAnyCategory = categoryLinks.some(
            (link) => link.media_id === item.id,
          );
          if (hasAnyCategory) return false;
        }

        if (selectedCategoryId !== "all") {
          const hasCategory = categoryLinks.some(
            (link) =>
              link.media_id === item.id &&
              link.category_id === selectedCategoryId,
          );
          if (!hasCategory) return false;
        }

        if (
          orientationFilter !== "all" &&
          getOrientation(item.width, item.height) !== orientationFilter
        ) {
          return false;
        }

        if (!search) return true;

        const haystack = [
          item.original_filename,
          item.r2_key,
          item.alt_uk,
          item.alt_pl,
          item.source,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(search);
      })
      .sort(
        (a, b) =>
          Number(b.is_favorite) - Number(a.is_favorite) ||
          b.created_at.localeCompare(a.created_at),
      );
  }, [
    activeFilter,
    categoryLinks,
    mediaTypeFilter,
    mediaItems,
    orientationFilter,
    query,
    selectedCategoryId,
  ]);

  const totalStorage = useMemo(
    () => mediaItems.reduce((sum, item) => sum + (item.size_bytes || 0), 0),
    [mediaItems],
  );

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount],
  );

  const selectedMediaCategories = useMemo(() => {
    if (!selectedMediaItem) return [];
    return categories.filter((category) =>
      categoryLinks.some(
        (link) =>
          link.media_id === selectedMediaItem.id &&
          link.category_id === category.id,
      ),
    );
  }, [categories, categoryLinks, selectedMediaItem]);

  const activeCategoryForManager = useMemo(() => {
    if (selectedCategoryId === "all") return null;
    return (
      categories.find((category) => category.id === selectedCategoryId) || null
    );
  }, [categories, selectedCategoryId]);

  const categoryManagerItems = useMemo(() => {
    if (!activeCategoryForManager) return [];

    return categoryLinks
      .filter((link) => link.category_id === activeCategoryForManager.id)
      .map((link) => {
        const media = mediaItems.find((item) => item.id === link.media_id);
        if (!media) return null;
        return { link, media };
      })
      .filter((item): item is { link: CategoryLink; media: MediaLibraryItem } =>
        Boolean(item),
      )
      .sort((a, b) => a.link.sort_order - b.link.sort_order);
  }, [activeCategoryForManager, categoryLinks, mediaItems]);

  const mediaTypeCounts = useMemo(() => {
    const videos = mediaItems.filter((item) => isVideoMedia(item.mime_type)).length;

    return {
      all: mediaItems.length,
      images: mediaItems.length - videos,
      videos,
    };
  }, [mediaItems]);

  const orientationCounts = useMemo(() => {
    return {
      portrait: mediaItems.filter(
        (item) => getOrientation(item.width, item.height) === "portrait",
      ).length,
      landscape: mediaItems.filter(
        (item) => getOrientation(item.width, item.height) === "landscape",
      ).length,
      square: mediaItems.filter(
        (item) => getOrientation(item.width, item.height) === "square",
      ).length,
    };
  }, [mediaItems]);

  useEffect(() => {
    setVisibleCount(MEDIA_PAGE_SIZE);
  }, [query, mediaTypeFilter, activeFilter, selectedCategoryId, orientationFilter]);

  useEffect(() => {
    const savedView = window.localStorage.getItem("admin-media-view");
    if (savedView === "cards" || savedView === "thumbnails") {
      setViewMode(savedView);
    }
  }, []);

  const changeViewMode = (mode: MediaViewMode) => {
    setViewMode(mode);
    window.localStorage.setItem("admin-media-view", mode);
  };

  const handleSelectedCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);

    const url = new URL(window.location.href);

    if (categoryId === "all") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", categoryId);
    }

    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("portfolio_categories")
      .select("id, name_uk, name_pl, slug, is_active, sort_order")
      .order("sort_order", { ascending: true })
      .order("name_uk", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setCategories((data || []) as PortfolioCategory[]);
  };

  const loadMediaItems = async () => {
    const { data, error } = await supabase
      .from("media_library")
      .select(
        "id, image_url, r2_key, original_filename, mime_type, size_bytes, width, height, alt_uk, alt_pl, is_active, is_favorite, manual_likes, source, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMediaItems((data || []) as MediaLibraryItem[]);
  };

  const loadCategoryLinks = async () => {
    const { data, error } = await supabase
      .from("portfolio_category_images")
      .select("id, category_id, media_id, is_active, sort_order")
      .order("sort_order", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setCategoryLinks((data || []) as CategoryLink[]);
  };

  async function loadPage() {
    setIsChecking(true);
    setIsLoading(true);
    setErrorMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    setIsChecking(false);
    await Promise.all([
      loadCategories(),
      loadMediaItems(),
      loadCategoryLinks(),
    ]);
    setIsLoading(false);
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryFromUrl = params.get("category");
    const safeReturnTo = params.get("returnTo") || "";

    if (categoryFromUrl) {
      setSelectedCategoryId(categoryFromUrl);
    }

    if (safeReturnTo.startsWith("/admin/")) setReturnTo(safeReturnTo);

    loadPage();
  }, []);

  useEffect(() => {
    if (isLoading || selectedMediaItem) return;

    const imageFromUrl = new URLSearchParams(window.location.search).get("image");
    if (!imageFromUrl) return;

    const item = mediaItems.find(
      (media) => media.id === imageFromUrl || media.image_url === imageFromUrl,
    );
    if (item) setSelectedMediaItem(item);
  }, [isLoading, mediaItems, selectedMediaItem]);

  const refreshAll = async () => {
    setMessage("");
    setErrorMessage("");
    setIsLoading(true);
    await Promise.all([
      loadCategories(),
      loadMediaItems(),
      loadCategoryLinks(),
    ]);
    setIsLoading(false);
    setMessage("Медиатека обновлена");
  };

  const syncMediaFromR2 = async () => {
    setIsSyncingR2(true);
    setMessage("");
    setErrorMessage("");

    try {
      const token = await getSessionToken();

      if (!token) {
        throw new Error(
          "Сессия входа закончилась. Выйдите и войдите в админку снова.",
        );
      }

      const response = await fetch("/api/admin/media/sync-r2", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        const details = Array.isArray(data.errors)
          ? `: ${data.errors.join("; ")}`
          : "";
        throw new Error(
          `${data.error || "Не удалось загрузить материалы из R2"}${details}`,
        );
      }

      await Promise.all([loadMediaItems(), loadCategoryLinks()]);

      if (data.addedCount > 0) {
        setMessage(
          `Из Cloudflare R2 добавлено в медиатеку: ${data.addedCount}`,
        );
      } else {
        setMessage("Все материалы из Cloudflare R2 уже есть в медиатеке");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ошибка загрузки материалов из R2",
      );
    } finally {
      setIsSyncingR2(false);
    }
  };

  const toggleMediaActive = async (item: MediaLibraryItem) => {
    const nextValue = !item.is_active;

    setMediaItems((current) =>
      current.map((media) =>
        media.id === item.id ? { ...media, is_active: nextValue } : media,
      ),
    );

    const { error } = await supabase
      .from("media_library")
      .update({ is_active: nextValue, updated_at: new Date().toISOString() })
      .eq("id", item.id);

    if (error) {
      setErrorMessage(error.message);
      setMediaItems((current) =>
        current.map((media) =>
          media.id === item.id
            ? { ...media, is_active: item.is_active }
            : media,
        ),
      );
    }
  };

  const toggleFavorite = async (item: MediaLibraryItem) => {
    const nextValue = !item.is_favorite;

    setMediaItems((current) =>
      current.map((media) =>
        media.id === item.id ? { ...media, is_favorite: nextValue } : media,
      ),
    );

    const { error } = await supabase
      .from("media_library")
      .update({ is_favorite: nextValue, updated_at: new Date().toISOString() })
      .eq("id", item.id);

    if (error) {
      setErrorMessage(error.message);
      setMediaItems((current) =>
        current.map((media) =>
          media.id === item.id
            ? { ...media, is_favorite: item.is_favorite }
            : media,
        ),
      );
    }
  };

  const saveManualLikes = async (item: MediaLibraryItem, value: number) => {
    const previousValue = item.manual_likes || 0;
    const nextValue = Math.max(0, Math.min(999999, Math.trunc(value)));

    setMediaItems((current) =>
      current.map((media) =>
        media.id === item.id ? { ...media, manual_likes: nextValue } : media,
      ),
    );
    setSelectedMediaItem((current) =>
      current?.id === item.id ? { ...current, manual_likes: nextValue } : current,
    );

    const { error } = await supabase
      .from("media_library")
      .update({ manual_likes: nextValue, updated_at: new Date().toISOString() })
      .eq("id", item.id);

    if (error) {
      setErrorMessage(error.message);
      setMediaItems((current) =>
        current.map((media) =>
          media.id === item.id ? { ...media, manual_likes: previousValue } : media,
        ),
      );
      setSelectedMediaItem((current) =>
        current?.id === item.id
          ? { ...current, manual_likes: previousValue }
          : current,
      );
      return false;
    }

    setMessage(`Стартовые сердечки сохранены: ${nextValue}`);
    return true;
  };

  const closeMediaPreview = () => {
    if (returnTo) {
      router.push(returnTo);
      return;
    }

    setSelectedMediaItem(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("image");
    url.searchParams.delete("returnTo");
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  };

  const toggleSelectedMedia = (mediaId: string) => {
    setSelectedMediaIds((current) =>
      current.includes(mediaId)
        ? current.filter((id) => id !== mediaId)
        : [...current, mediaId],
    );
  };

  const clearSelectedMedia = () => {
    setSelectedMediaIds([]);
  };

  const setSelectedItemsActive = async (isActive: boolean) => {
    if (selectedMediaIds.length === 0) return;

    const ids = [...selectedMediaIds];
    setMediaItems((current) =>
      current.map((item) =>
        ids.includes(item.id) ? { ...item, is_active: isActive } : item,
      ),
    );

    const { error } = await supabase
      .from("media_library")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .in("id", ids);

    if (error) {
      setErrorMessage(error.message);
      await loadMediaItems();
      return;
    }

    setMessage(isActive ? "Выбранные материалы показаны" : "Выбранные материалы скрыты");
  };

  const setSelectedItemsFavorite = async (isFavorite: boolean) => {
    if (selectedMediaIds.length === 0) return;

    const ids = [...selectedMediaIds];
    setMediaItems((current) =>
      current.map((item) =>
        ids.includes(item.id) ? { ...item, is_favorite: isFavorite } : item,
      ),
    );

    const { error } = await supabase
      .from("media_library")
      .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() })
      .in("id", ids);

    if (error) {
      setErrorMessage(error.message);
      await loadMediaItems();
      return;
    }

    setMessage(
      isFavorite
        ? "Выбранные материалы добавлены в избранное"
        : "Выбранные материалы убраны из избранного",
    );
  };

  const deleteSelectedMedia = async () => {
    if (selectedMediaIds.length === 0) return;

    const count = selectedMediaIds.length;
    const confirmed = window.confirm(
      `Удалить ${count} материалов из медиатеки, портфолио и Cloudflare R2? Это действие нельзя отменить.`,
    );

    if (!confirmed) return;

    setMessage("");
    setErrorMessage("");

    try {
      const token = await getSessionToken();
      const ids = [...selectedMediaIds];

      const response = await fetch("/api/admin/media/bulk-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mediaIds: ids }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Не удалось удалить выбранные материалы");
      }

      const deletedIds = Array.isArray(data.deletedIds)
        ? (data.deletedIds as string[])
        : ids;

      setMediaItems((current) =>
        current.filter((item) => !deletedIds.includes(item.id)),
      );
      setCategoryLinks((current) =>
        current.filter((link) => !deletedIds.includes(link.media_id)),
      );
      setSelectedMediaIds((current) =>
        current.filter((id) => !deletedIds.includes(id)),
      );

      if (selectedMediaItem && deletedIds.includes(selectedMediaItem.id)) {
        setSelectedMediaItem(null);
      }

      const deletedCount = data.deletedCount ?? deletedIds.length;
      const failedCount = data.failedCount || 0;

      if (failedCount > 0) {
        setMessage(`Удалено материалов: ${deletedCount}`);
        setErrorMessage(
          `${failedCount} файл(ов) не удалось удалить из R2. Их записи сохранены в медиатеке.`,
        );
      } else {
        setMessage(`Удалено материалов: ${deletedCount}`);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Ошибка массового удаления",
      );
    }
  };

  const toggleCategoryLink = async (mediaId: string, categoryId: string) => {
    setMessage("");
    setErrorMessage("");

    const existingLink = categoryLinks.find(
      (link) => link.media_id === mediaId && link.category_id === categoryId,
    );

    if (existingLink) {
      setCategoryLinks((current) =>
        current.filter((link) => link.id !== existingLink.id),
      );

      const { error } = await supabase
        .from("portfolio_category_images")
        .delete()
        .eq("id", existingLink.id);

      if (error) {
        setErrorMessage(error.message);
        await loadCategoryLinks();
      }

      return;
    }

    const nextSortOrder =
      Math.max(
        0,
        ...categoryLinks
          .filter((link) => link.category_id === categoryId)
          .map((link) => link.sort_order || 0),
      ) + 10;

    const { data, error } = await supabase
      .from("portfolio_category_images")
      .insert({
        category_id: categoryId,
        media_id: mediaId,
        is_active: true,
        sort_order: nextSortOrder,
      })
      .select("id, category_id, media_id, is_active, sort_order")
      .single();

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setCategoryLinks((current) => [...current, data as CategoryLink]);
  };

  const saveCategoryOrder = async (orderedLinks: CategoryLink[]) => {
    try {
      setIsSavingCategoryOrder(true);
      setCategoryOrderMessage("Сохраняем порядок...");
      setMessage("");
      setErrorMessage("");
      const updatedLinks = orderedLinks.map((link, index) => ({
        ...link,
        sort_order: (index + 1) * 10,
      }));

      setCategoryLinks((current) =>
        current.map((link) => {
          const updated = updatedLinks.find((item) => item.id === link.id);
          return updated || link;
        }),
      );

      for (const link of updatedLinks) {
        const { error } = await supabase
          .from("portfolio_category_images")
          .update({ sort_order: link.sort_order })
          .eq("id", link.id);

        if (error) throw error;
      }

      setCategoryOrderMessage("✓ Порядок сохранён");
      window.setTimeout(() => setCategoryOrderMessage(""), 2200);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Ошибка сохранения порядка",
      );
      await loadCategoryLinks();
    } finally {
      setIsSavingCategoryOrder(false);
    }
  };

  const moveCategoryManagerItem = async (
    linkId: string,
    direction: "up" | "down",
  ) => {
    const currentIndex = categoryManagerItems.findIndex(
      (item) => item.link.id === linkId,
    );
    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (
      currentIndex < 0 ||
      nextIndex < 0 ||
      nextIndex >= categoryManagerItems.length
    )
      return;

    const reordered = categoryManagerItems.map((item) => item.link);
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(nextIndex, 0, moved);

    await saveCategoryOrder(reordered);
  };

  const handleDragEndCategoryManagerItem = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = categoryManagerItems.findIndex(
      (item) => item.link.id === active.id,
    );
    const newIndex = categoryManagerItems.findIndex(
      (item) => item.link.id === over.id,
    );

    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(
      categoryManagerItems.map((item) => item.link),
      oldIndex,
      newIndex,
    );

    await saveCategoryOrder(reordered);
  };

  const removeMediaFromManagerCategory = async (link: CategoryLink) => {
    const confirmed = window.confirm(
      "Убрать этот материал из текущей категории? Файл останется в медиатеке и R2.",
    );
    if (!confirmed) return;

    setMessage("");
    setErrorMessage("");

    setCategoryLinks((current) =>
      current.filter((item) => item.id !== link.id),
    );

    const { error } = await supabase
      .from("portfolio_category_images")
      .delete()
      .eq("id", link.id);

    if (error) {
      setErrorMessage(error.message);
      await loadCategoryLinks();
      return;
    }

    setMessage("Материал убран из категории");
  };

  const getItemCategories = (mediaId: string) =>
    categories.filter((category) =>
      categoryLinks.some(
        (link) => link.media_id === mediaId && link.category_id === category.id,
      ),
    );

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F1EA] text-[#2B1A12]">
        <p className="text-sm text-[#7A6252]">Проверяем доступ...</p>
      </main>
    );
  }

  return (
    <>
      <AdminHeader />
      <main className="min-h-screen bg-[#F7F1EA] px-5 pb-24 pt-36 text-[#2B1A12]">
        <section className="mx-auto w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#A67C52]">
                Studio OS
              </p>
              <h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
                Медиатека
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#7A6252] sm:text-base">
                Все фото и видео студии в одном месте. Материал хранится один раз, а потом подключается к нужным категориям портфолио.
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <div className="flex flex-wrap justify-start gap-3 lg:justify-end">
                {activeCategoryForManager && (
                  <button
                    type="button"
                    onClick={() => setIsCategoryManagerOpen(true)}
                    className="rounded-full border border-[#D8C4B3] bg-white/80 px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
                  >
                    Управлять категорией
                  </button>
                )}
                <button
                  type="button"
                  onClick={syncMediaFromR2}
                  disabled={isSyncingR2}
                  className="rounded-full border border-[#2B1A12] bg-white/80 px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#2B1A12] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-wait disabled:opacity-60"
                >
                  {isSyncingR2 ? "Загружаем из R2…" : "Загрузить из R2"}
                </button>
                <button
                  type="button"
                  onClick={refreshAll}
                  className="rounded-full bg-[#2B1A12] px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#F7F1EA] transition hover:bg-[#4A2D1E]"
                >
                  Обновить
                </button>
              </div>
            </div>
          </motion.div>

          {message && (
            <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
              {message}
            </div>
          )}
          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <MediaUploadPanel
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onUploaded={async (count) => {
              await refreshAll();
              setMessage(`Загружено материалов: ${count}`);
            }}
          />

          <MediaFilters
            query={query}
            onQueryChange={setQuery}
            mediaTypeFilter={mediaTypeFilter}
            onMediaTypeFilterChange={setMediaTypeFilter}
            mediaTypeCounts={mediaTypeCounts}
            activeFilter={activeFilter}
            onActiveFilterChange={setActiveFilter}
            selectedCategoryId={selectedCategoryId}
            onSelectedCategoryChange={handleSelectedCategoryChange}
            orientationFilter={orientationFilter}
            onOrientationFilterChange={setOrientationFilter}
            categories={categories}
            orientationCounts={orientationCounts}
          />

          {activeCategoryForManager && (
            <div className="mb-6 rounded-[30px] border border-[#E5D5C8] bg-white/72 p-5 shadow-[0_18px_60px_rgba(83,54,37,0.09)] backdrop-blur-xl">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#A67C52]">
                    Режим категории
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#2B1A12]">
                    {activeCategoryForManager.name_uk}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#7A6252]">
                    В этой категории сейчас {categoryManagerItems.length} материалов.
                    Откройте управление, чтобы перетаскивать материалы и менять
                    порядок на сайте.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCategoryManagerOpen(true)}
                  className="w-fit rounded-full bg-[#2B1A12] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#F7F1EA] shadow-[0_14px_34px_rgba(43,26,18,0.20)] transition hover:bg-[#4A2D1E]"
                >
                  Управлять порядком
                </button>
              </div>
            </div>
          )}

          <MediaStats
            mediaItems={mediaItems}
            categoryLinks={categoryLinks}
            totalStorage={totalStorage}
          />

          <BulkToolbar
            selectedCount={selectedMediaIds.length}
            onFavorite={() => setSelectedItemsFavorite(true)}
            onUnfavorite={() => setSelectedItemsFavorite(false)}
            onShow={() => setSelectedItemsActive(true)}
            onHide={() => setSelectedItemsActive(false)}
            onDelete={deleteSelectedMedia}
            onClear={clearSelectedMedia}
          />

          <div className="mb-5 flex flex-col gap-3 rounded-[26px] border border-[#E5D5C8] bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#7A6252]">
              Найдено: <b className="text-[#2B1A12]">{filteredItems.length}</b>
              {filteredItems.length > visibleItems.length && (
                <span> · показано {visibleItems.length}</span>
              )}
            </p>
            <div className="flex w-fit rounded-full border border-[#D8C4B3] bg-[#F7F1EA] p-1">
              <button
                type="button"
                onClick={() => changeViewMode("thumbnails")}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  viewMode === "thumbnails"
                    ? "bg-[#2B1A12] text-[#F7F1EA]"
                    : "text-[#7A6252] hover:text-[#2B1A12]"
                }`}
              >
                ▦ Превью
              </button>
              <button
                type="button"
                onClick={() => changeViewMode("cards")}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  viewMode === "cards"
                    ? "bg-[#2B1A12] text-[#F7F1EA]"
                    : "text-[#7A6252] hover:text-[#2B1A12]"
                }`}
              >
                ▤ Подробно
              </button>
            </div>
          </div>

          <MediaGrid
            isLoading={isLoading}
            items={visibleItems}
            viewMode={viewMode}
            categories={categories}
            selectedMediaIds={selectedMediaIds}
            getItemCategories={getItemCategories}
            onOpen={setSelectedMediaItem}
            onToggleSelected={toggleSelectedMedia}
            onToggleFavorite={toggleFavorite}
            onToggleActive={toggleMediaActive}
            onToggleCategoryLink={toggleCategoryLink}
            onSaveManualLikes={saveManualLikes}
          />

          {visibleCount < filteredItems.length && (
            <div className="mt-7 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount((count) => count + MEDIA_PAGE_SIZE)
                }
                className="rounded-full border border-[#2B1A12] bg-white/80 px-7 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#2B1A12] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
              >
                Показать ещё{" "}
                {Math.min(MEDIA_PAGE_SIZE, filteredItems.length - visibleCount)}
              </button>
            </div>
          )}
        </section>
        <CategoryManagerDialog
          isOpen={isCategoryManagerOpen}
          category={activeCategoryForManager}
          items={categoryManagerItems}
          isSaving={isSavingCategoryOrder}
          orderMessage={categoryOrderMessage}
          onRefresh={refreshAll}
          onClose={() => setIsCategoryManagerOpen(false)}
          onDragEnd={handleDragEndCategoryManagerItem}
          onMove={moveCategoryManagerItem}
          onRemove={removeMediaFromManagerCategory}
        />

        <MediaPreviewDialog
          item={selectedMediaItem}
          selectedMediaCategories={selectedMediaCategories}
          selectedMediaIds={selectedMediaIds}
          onClose={closeMediaPreview}
          onToggleFavorite={toggleFavorite}
          onToggleActive={toggleMediaActive}
          onToggleSelected={toggleSelectedMedia}
          onSaveManualLikes={saveManualLikes}
        />
      </main>
    </>
  );
}
