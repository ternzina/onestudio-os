"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CategoryLink, MediaLibraryItem } from "./types";
import { isVideoMedia } from "./mediaUtils";

type CategoryManagerSortableCardProps = {
  link: CategoryLink;
  media: MediaLibraryItem;
  index: number;
  total: number;
  onMove: (linkId: string, direction: "up" | "down") => void;
  onRemove: (link: CategoryLink) => void;
};

export default function CategoryManagerSortableCard({
  link,
  media,
  index,
  total,
  onMove,
  onRemove,
}: CategoryManagerSortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: link.id });
  const isVideo = isVideoMedia(media.mime_type);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`group overflow-hidden rounded-[28px] border bg-white/80 shadow-[0_16px_45px_rgba(83,54,37,0.12)] transition ${
        isDragging
          ? "z-50 scale-[1.02] border-[#2B1A12] opacity-90 shadow-[0_28px_90px_rgba(43,26,18,0.22)]"
          : "border-[#E5D5C8] hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(83,54,37,0.14)]"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#17100D]">
        {isVideo ? (
          <video
            src={media.image_url}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <img
            src={media.image_url}
            alt={media.alt_uk || media.original_filename || "Фото"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        )}
        {isVideo && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 pl-0.5 text-lg text-white">▶</span>
          </span>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2B1A12]">
          #{index + 1}
        </div>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute right-3 top-3 cursor-grab rounded-full bg-white/95 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2B1A12] shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA] active:cursor-grabbing"
          aria-label="Перетащить материал"
        >
          ☰ Тянуть
        </button>
      </div>

      <div className="p-4">
        <p className="truncate text-sm font-semibold tracking-[-0.03em] text-[#2B1A12]">
          {media.original_filename || media.r2_key.split("/").pop() || (isVideo ? "Видео" : "Фото")}
        </p>
        <p className="mt-1 truncate text-xs text-[#7A6252]">{media.r2_key}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onMove(link.id, "up")}
            disabled={index === 0}
            className="rounded-full bg-[#F7F1EA] px-3 py-2 text-xs font-semibold text-[#2B1A12] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(link.id, "down")}
            disabled={index === total - 1}
            className="rounded-full bg-[#F7F1EA] px-3 py-2 text-xs font-semibold text-[#2B1A12] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => onRemove(link)}
            className="rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
          >
            Убрать из категории
          </button>
        </div>
      </div>
    </article>
  );
}
