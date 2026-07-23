import type { MediaLibraryItem, PortfolioCategory } from "./types";
import { isVideoMedia } from "./mediaUtils";
import MediaCard from "./MediaCard";

type MediaGridProps = {
  isLoading: boolean;
  items: MediaLibraryItem[];
  viewMode: "thumbnails" | "cards";
  categories: PortfolioCategory[];
  selectedMediaIds: string[];
  getItemCategories: (mediaId: string) => PortfolioCategory[];
  onOpen: (item: MediaLibraryItem) => void;
  onToggleSelected: (mediaId: string) => void;
  onToggleFavorite: (item: MediaLibraryItem) => void;
  onToggleActive: (item: MediaLibraryItem) => void;
  onToggleCategoryLink: (mediaId: string, categoryId: string) => void;
  onSaveManualLikes: (item: MediaLibraryItem, value: number) => Promise<boolean>;
};

export default function MediaGrid({
  isLoading,
  items,
  viewMode,
  categories,
  selectedMediaIds,
  getItemCategories,
  onOpen,
  onToggleSelected,
  onToggleFavorite,
  onToggleActive,
  onToggleCategoryLink,
  onSaveManualLikes,
}: MediaGridProps) {
  if (isLoading) {
    return (
      <div className="rounded-[34px] border border-[#E5D5C8] bg-white/72 px-6 py-14 text-center text-sm text-[#7A6252]">
        Загружаем медиатеку...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[34px] border border-dashed border-[#D8C4B3] bg-white/60 px-6 py-14 text-center">
        <p className="text-lg font-medium text-[#2B1A12]">Материалы не найдены</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7A6252]">
          Попробуйте изменить поиск или фильтры.
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        viewMode === "thumbnails"
          ? "grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10"
          : "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
      }
    >
      {items.map((item) => {
        const isVideo = isVideoMedia(item.mime_type);

        return viewMode === "thumbnails" ? (
          <article
            key={item.id}
            className={`group relative aspect-square overflow-hidden rounded-xl border bg-[#17100D] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
              selectedMediaIds.includes(item.id)
                ? "border-[#2B1A12] ring-2 ring-[#2B1A12]"
                : item.is_active
                  ? "border-[#E5D5C8]"
                  : "border-red-300 opacity-60"
            }`}
          >
            <button
              type="button"
              onClick={() => onOpen(item)}
              className="h-full w-full cursor-zoom-in"
              aria-label={`Открыть ${item.original_filename || "материал"}`}
            >
              {isVideo ? (
                <video
                  src={item.image_url}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <img
                  src={item.image_url}
                  alt={item.alt_uk || item.original_filename || "Media"}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              )}
              {isVideo && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 pl-0.5 text-sm text-white shadow-lg">
                    ▶
                  </span>
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => onToggleSelected(item.id)}
              className={`absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold shadow ${
                selectedMediaIds.includes(item.id)
                  ? "border-[#2B1A12] bg-[#2B1A12] text-white"
                  : "border-white/70 bg-white/90 text-[#2B1A12]"
              }`}
              aria-label="Выбрать материал"
            >
              {selectedMediaIds.includes(item.id) ? "✓" : ""}
            </button>
            {isVideo && (
              <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/65 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-white">
                Видео
              </span>
            )}
            {item.is_favorite && (
              <span className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#2B1A12] text-xs text-white shadow">
                ★
              </span>
            )}
          </article>
        ) : (
          <MediaCard
            key={item.id}
            item={item}
            categories={categories}
            itemCategories={getItemCategories(item.id)}
            isSelected={selectedMediaIds.includes(item.id)}
            onOpen={onOpen}
            onToggleSelected={onToggleSelected}
            onToggleFavorite={onToggleFavorite}
            onToggleActive={onToggleActive}
            onToggleCategoryLink={onToggleCategoryLink}
            onSaveManualLikes={onSaveManualLikes}
          />
        );
      })}
    </div>
  );
}
