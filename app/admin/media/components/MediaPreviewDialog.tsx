import type { MediaLibraryItem, PortfolioCategory } from "./types";
import {
  formatBytes,
  formatDate,
  formatDimensions,
  getOrientationLabel,
  isVideoMedia,
} from "./mediaUtils";
import ManualLikesEditor from "./ManualLikesEditor";

type MediaPreviewDialogProps = {
  item: MediaLibraryItem | null;
  selectedMediaCategories: PortfolioCategory[];
  selectedMediaIds: string[];
  onClose: () => void;
  onToggleFavorite: (item: MediaLibraryItem) => void;
  onToggleActive: (item: MediaLibraryItem) => void;
  onToggleSelected: (mediaId: string) => void;
  onSaveManualLikes: (item: MediaLibraryItem, value: number) => Promise<boolean>;
};

export default function MediaPreviewDialog({
  item,
  selectedMediaCategories,
  selectedMediaIds,
  onClose,
  onToggleFavorite,
  onToggleActive,
  onToggleSelected,
  onSaveManualLikes,
}: MediaPreviewDialogProps) {
  if (!item) return null;

  const isVideo = isVideoMedia(item.mime_type);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#17100D]/82 px-4 py-8 backdrop-blur-md">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[34px] border border-white/15 bg-[#FFFDFB] p-5 shadow-[0_40px_120px_rgba(0,0,0,0.35)] sm:p-7">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.24em] text-[#A67C52]">Media details</p>
            <h3 className="mt-1 truncate text-2xl font-semibold tracking-[-0.04em] text-[#2B1A12]">
              {item.original_filename || item.r2_key.split("/").pop() || (isVideo ? "Видео" : "Фото")}
            </h3>
            <p className="mt-2 truncate text-sm text-[#7A6252]">{item.r2_key}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#D8C4B3] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
          >
            ← Назад
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="overflow-hidden rounded-[28px] bg-[#17100D]">
            {isVideo ? (
              <video
                src={item.image_url}
                controls
                playsInline
                preload="metadata"
                className="max-h-[72vh] w-full object-contain"
              >
                Ваш браузер не поддерживает воспроизведение видео.
              </video>
            ) : (
              <img
                src={item.image_url}
                alt={item.alt_uk || item.original_filename || "Media"}
                className="max-h-[72vh] w-full object-contain"
              />
            )}
          </div>

          <div className="space-y-4">
            {!isVideo && (
              <ManualLikesEditor item={item} onSave={onSaveManualLikes} />
            )}

            <div className="rounded-[28px] border border-[#E5D5C8] bg-white/80 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">Быстрые действия</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onToggleFavorite(item)}
                  className="rounded-full bg-[#2B1A12] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#F7F1EA] transition hover:bg-[#4A2D1E]"
                >
                  {item.is_favorite ? "Убрать ⭐" : "⭐ Избранное"}
                </button>
                <button
                  type="button"
                  onClick={() => onToggleActive(item)}
                  className="rounded-full border border-[#D8C4B3] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
                >
                  {item.is_active ? "Скрыть" : "Показать"}
                </button>
                <button
                  type="button"
                  onClick={() => onToggleSelected(item.id)}
                  className="rounded-full border border-[#D8C4B3] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
                >
                  {selectedMediaIds.includes(item.id) ? "Снять выбор" : "Выбрать"}
                </button>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#E5D5C8] bg-[#F7F1EA]/70 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">Информация</p>
              <div className="grid gap-2 text-sm text-[#7A6252]">
                <div className="flex justify-between gap-4"><span>Тип</span><b className="text-[#2B1A12]">{isVideo ? "Видео" : "Фото"}</b></div>
                <div className="flex justify-between gap-4"><span>Размер файла</span><b className="text-[#2B1A12]">{formatBytes(item.size_bytes)}</b></div>
                <div className="flex justify-between gap-4"><span>Разрешение</span><b className="text-[#2B1A12]">{formatDimensions(item.width, item.height)}</b></div>
                <div className="flex justify-between gap-4"><span>Ориентация</span><b className="text-[#2B1A12]">{getOrientationLabel(item.width, item.height)}</b></div>
                <div className="flex justify-between gap-4"><span>Формат</span><b className="text-[#2B1A12]">{item.mime_type || "—"}</b></div>
                <div className="flex justify-between gap-4"><span>Дата загрузки</span><b className="text-[#2B1A12]">{formatDate(item.created_at)}</b></div>
                <div className="flex justify-between gap-4"><span>Источник</span><b className="text-[#2B1A12]">{item.source || "—"}</b></div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#E5D5C8] bg-white/80 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">Используется в категориях</p>
              {selectedMediaCategories.length === 0 ? (
                <p className="rounded-2xl bg-[#F7F1EA]/80 p-4 text-sm text-[#7A6252]">Материал пока не привязан ни к одной категории.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedMediaCategories.map((category) => (
                    <span key={category.id} className="rounded-full bg-[#2B1A12] px-3 py-2 text-xs font-medium text-[#F7F1EA]">
                      {category.name_uk}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-[#E5D5C8] bg-white/80 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">R2 / CDN</p>
              <p className="break-all rounded-2xl bg-[#F7F1EA]/80 p-4 text-xs leading-5 text-[#7A6252]">{item.image_url}</p>
              <a
                href={item.image_url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-full bg-[#2B1A12] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#F7F1EA] transition hover:bg-[#4A2D1E]"
              >
                Открыть оригинал
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
