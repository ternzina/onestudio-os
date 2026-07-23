import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import type { CategoryLink, MediaLibraryItem, PortfolioCategory } from "./types";
import CategoryManagerSortableCard from "./CategoryManagerSortableCard";

type CategoryManagerItem = {
  link: CategoryLink;
  media: MediaLibraryItem;
};

type CategoryManagerDialogProps = {
  isOpen: boolean;
  category: PortfolioCategory | null;
  items: CategoryManagerItem[];
  isSaving: boolean;
  orderMessage: string;
  onRefresh: () => void;
  onClose: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  onMove: (linkId: string, direction: "up" | "down") => void;
  onRemove: (link: CategoryLink) => void;
};

export default function CategoryManagerDialog({
  isOpen,
  category,
  items,
  isSaving,
  orderMessage,
  onRefresh,
  onClose,
  onDragEnd,
  onMove,
  onRemove,
}: CategoryManagerDialogProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17100D]/82 px-4 py-8 backdrop-blur-md">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[34px] border border-white/15 bg-[#FFFDFB] p-5 shadow-[0_40px_120px_rgba(0,0,0,0.35)] sm:p-7">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#A67C52]">Category manager</p>
            <h3 className="mt-1 text-3xl font-semibold tracking-[-0.05em] text-[#2B1A12]">
              {category.name_uk}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7A6252]">
              Перетаскивайте карточки, чтобы менять порядок материалов в категории. Файл из R2 не удаляется, если убрать его из категории.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                  isSaving
                    ? "bg-[#FFF4DD] text-[#7A5528]"
                    : orderMessage
                      ? "bg-green-50 text-green-800"
                      : "bg-[#F7F1EA] text-[#7A6252]"
                }`}
              >
                {orderMessage || "Порядок сохраняется автоматически"}
              </span>
              <span className="text-xs leading-5 text-[#7A6252]">Тяните карточку за кнопку «☰ Тянуть».</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isSaving}
              className="rounded-full border border-[#D8C4B3] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
            >
              {isSaving ? "Сохраняем..." : "Обновить"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#2B1A12] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#F7F1EA] transition hover:bg-[#4A2D1E]"
            >
              Закрыть
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#D8C4B3] bg-[#F7F1EA]/70 px-6 py-12 text-center">
            <p className="text-lg font-medium text-[#2B1A12]">В этой категории пока нет материалов</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7A6252]">
              Закройте это окно и добавьте фото или видео в категорию через карточки медиатеки.
            </p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((item) => item.link.id)} strategy={rectSortingStrategy}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map(({ link, media }, index) => (
                  <CategoryManagerSortableCard
                    key={link.id}
                    link={link}
                    media={media}
                    index={index}
                    total={items.length}
                    onMove={onMove}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
