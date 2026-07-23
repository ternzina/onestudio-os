import type { MediaLibraryItem, PortfolioCategory } from "./types";
import {
  formatBytes,
  formatDate,
  formatDimensions,
  getMediaTypeLabel,
  getOrientationLabel,
  isVideoMedia,
} from "./mediaUtils";
import ManualLikesEditor from "./ManualLikesEditor";

type MediaCardProps = {
  item: MediaLibraryItem;
  categories: PortfolioCategory[];
  itemCategories: PortfolioCategory[];
  isSelected: boolean;
  onOpen: (item: MediaLibraryItem) => void;
  onToggleSelected: (mediaId: string) => void;
  onToggleFavorite: (item: MediaLibraryItem) => void;
  onToggleActive: (item: MediaLibraryItem) => void;
  onToggleCategoryLink: (mediaId: string, categoryId: string) => void;
  onSaveManualLikes: (item: MediaLibraryItem, value: number) => Promise<boolean>;
};

export default function MediaCard({
  item,
  categories,
  itemCategories,
  isSelected,
  onOpen,
  onToggleSelected,
  onToggleFavorite,
  onToggleActive,
  onToggleCategoryLink,
  onSaveManualLikes,
}: MediaCardProps) {
  const isVideo = isVideoMedia(item.mime_type);

  return (
    <article
      className={`overflow-hidden rounded-[30px] border bg-white/74 shadow-[0_18px_60px_rgba(83,54,37,0.10)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_26px_85px_rgba(83,54,37,0.14)] ${
        item.is_active ? "border-[#E5D5C8]" : "border-red-200 opacity-70"
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(item)}
        onKeyDown={(event) => event.key === "Enter" && onOpen(item)}
        className="relative aspect-[4/3] cursor-zoom-in overflow-hidden bg-[#17100D]"
      >
        {isVideo ? (
          <video
            src={item.image_url}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover transition duration-500 hover:scale-[1.04]"
          />
        ) : (
          <img
            src={item.image_url}
            alt={item.alt_uk || item.original_filename || "Media"}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 hover:scale-[1.04]"
          />
        )}

        {isVideo && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/55 bg-black/55 pl-1 text-xl text-white shadow-[0_12px_32px_rgba(0,0,0,0.32)]">
              ▶
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleSelected(item.id);
          }}
          className={`absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition ${
            isSelected
              ? "border-[#2B1A12] bg-[#2B1A12] text-[#F7F1EA]"
              : "border-white/70 bg-white/90 text-[#2B1A12] hover:bg-[#F7F1EA]"
          }`}
          aria-label="Выбрать материал"
        >
          {isSelected ? "✓" : ""}
        </button>
        <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2B1A12]">
          {isVideo ? "▶ Видео" : getOrientationLabel(item.width, item.height)}
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(item);
          }}
          className={`absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full text-lg shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition ${
            item.is_favorite
              ? "bg-[#2B1A12] text-[#F7F1EA]"
              : "bg-white/90 text-[#2B1A12] hover:bg-[#F7F1EA]"
          }`}
          aria-label="Избранное"
        >
          {item.is_favorite ? "★" : "☆"}
        </button>

        {!item.is_active && (
          <div className="absolute right-3 top-3 rounded-full bg-red-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700">
            Скрыто
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold tracking-[-0.03em] text-[#2B1A12]">
              {item.original_filename || item.r2_key.split("/").pop() || getMediaTypeLabel(item.mime_type)}
            </h2>
            <p className="mt-1 truncate text-xs text-[#7A6252]">
              {item.r2_key}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onToggleActive(item)}
            className={`shrink-0 rounded-full border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
              item.is_active
                ? "border-green-200 bg-green-50 text-green-800 hover:bg-green-100"
                : "border-[#D8C4B3] bg-[#F2E8DF] text-[#7A6252] hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
            }`}
          >
            {item.is_active ? "Видно" : "Скрыто"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[#7A6252]">
          <div className="rounded-2xl bg-[#F7F1EA]/80 p-3">
            <span className="block text-[10px] uppercase tracking-[0.12em] text-[#A67C52]">
              Размер
            </span>
            {formatBytes(item.size_bytes)}
          </div>
          <div className="rounded-2xl bg-[#F7F1EA]/80 p-3">
            <span className="block text-[10px] uppercase tracking-[0.12em] text-[#A67C52]">
              Разрешение
            </span>
            {formatDimensions(item.width, item.height)}
          </div>
          <div className="rounded-2xl bg-[#F7F1EA]/80 p-3">
            <span className="block text-[10px] uppercase tracking-[0.12em] text-[#A67C52]">
              Формат
            </span>
            {item.mime_type?.replace(/^(image|video)\//, "") || "—"}
          </div>
          <div className="rounded-2xl bg-[#F7F1EA]/80 p-3">
            <span className="block text-[10px] uppercase tracking-[0.12em] text-[#A67C52]">
              Дата
            </span>
            {formatDate(item.created_at)}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[#F7F1EA]/70 px-4 py-3 text-xs text-[#7A6252]">
          <span>
            Используется в категориях:{" "}
            <b className="text-[#2B1A12]">{itemCategories.length}</b>
          </span>
          <button
            type="button"
            onClick={() => onOpen(item)}
            className="font-semibold uppercase tracking-[0.12em] text-[#2B1A12] hover:text-[#A67C52]"
          >
            Детали
          </button>
        </div>

        {!isVideo && (
          <ManualLikesEditor item={item} compact onSave={onSaveManualLikes} />
        )}

        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#A67C52]">
            Категории
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const checked = itemCategories.some(
                (itemCategory) => itemCategory.id === category.id,
              );

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onToggleCategoryLink(item.id, category.id)}
                  className={`rounded-full border px-3 py-2 text-[11px] font-medium transition ${
                    checked
                      ? "border-[#2B1A12] bg-[#2B1A12] text-[#F7F1EA]"
                      : "border-[#D8C4B3] bg-white/80 text-[#7A6252] hover:border-[#A67C52]"
                  }`}
                >
                  {checked ? "✓ " : "+ "}
                  {category.name_uk}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
