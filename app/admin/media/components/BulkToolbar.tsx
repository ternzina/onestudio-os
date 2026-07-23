type BulkToolbarProps = {
  selectedCount: number;
  onFavorite: () => void;
  onUnfavorite: () => void;
  onShow: () => void;
  onHide: () => void;
  onDelete: () => void;
  onClear: () => void;
};

export default function BulkToolbar({
  selectedCount,
  onFavorite,
  onUnfavorite,
  onShow,
  onHide,
  onDelete,
  onClear,
}: BulkToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-4 z-30 mb-6 rounded-[28px] border border-[#2B1A12] bg-[#2B1A12] p-4 text-[#F7F1EA] shadow-[0_22px_70px_rgba(43,26,18,0.22)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#E8D8CC]">Выбрано материалов</p>
          <p className="mt-1 text-xl font-semibold tracking-[-0.04em]">{selectedCount}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onFavorite} className="rounded-full bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition hover:bg-white hover:text-[#2B1A12]">⭐ В избранное</button>
          <button type="button" onClick={onUnfavorite} className="rounded-full bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition hover:bg-white hover:text-[#2B1A12]">Убрать ⭐</button>
          <button type="button" onClick={onShow} className="rounded-full bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition hover:bg-white hover:text-[#2B1A12]">Показать</button>
          <button type="button" onClick={onHide} className="rounded-full bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition hover:bg-white hover:text-[#2B1A12]">Скрыть</button>
          <button type="button" onClick={onDelete} className="rounded-full bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-700 transition hover:bg-red-100">Удалить выбранные</button>
          <button type="button" onClick={onClear} className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition hover:bg-white hover:text-[#2B1A12]">Снять выбор</button>
        </div>
      </div>
    </div>
  );
}
