import type {
  ActiveMediaFilter,
  MediaTypeFilter,
  OrientationFilter,
  PortfolioCategory,
} from "./types";

type MediaFiltersProps = {
  query: string;
  onQueryChange: (value: string) => void;
  mediaTypeFilter: MediaTypeFilter;
  onMediaTypeFilterChange: (value: MediaTypeFilter) => void;
  mediaTypeCounts: { all: number; images: number; videos: number };
  activeFilter: ActiveMediaFilter;
  onActiveFilterChange: (value: ActiveMediaFilter) => void;
  selectedCategoryId: string;
  onSelectedCategoryChange: (value: string) => void;
  orientationFilter: OrientationFilter;
  onOrientationFilterChange: (value: OrientationFilter) => void;
  categories: PortfolioCategory[];
  orientationCounts: { portrait: number; landscape: number; square: number };
};

const typeButtons: Array<{
  value: MediaTypeFilter;
  label: string;
  icon: string;
}> = [
  { value: "all", label: "Все", icon: "▦" },
  { value: "images", label: "Фото", icon: "▧" },
  { value: "videos", label: "Видео", icon: "▶" },
];

export default function MediaFilters({
  query,
  onQueryChange,
  mediaTypeFilter,
  onMediaTypeFilterChange,
  mediaTypeCounts,
  activeFilter,
  onActiveFilterChange,
  selectedCategoryId,
  onSelectedCategoryChange,
  orientationFilter,
  onOrientationFilterChange,
  categories,
  orientationCounts,
}: MediaFiltersProps) {
  return (
    <div className="mb-6 rounded-[34px] border border-[#E5D5C8] bg-white/72 p-5 shadow-[0_24px_90px_rgba(83,54,37,0.10)] backdrop-blur-xl">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#A67C52]">
          Тип материала
        </span>
        {typeButtons.map((button) => {
          const isActive = mediaTypeFilter === button.value;
          const count = mediaTypeCounts[button.value];

          return (
            <button
              key={button.value}
              type="button"
              onClick={() => onMediaTypeFilterChange(button.value)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                isActive
                  ? "border-[#2B1A12] bg-[#2B1A12] text-[#F7F1EA] shadow-[0_10px_26px_rgba(43,26,18,0.18)]"
                  : "border-[#D8C4B3] bg-white/85 text-[#7A6252] hover:border-[#A67C52] hover:text-[#2B1A12]"
              }`}
              aria-pressed={isActive}
            >
              <span aria-hidden="true">{button.icon}</span> {button.label}
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${
                  isActive ? "bg-white/15 text-white" : "bg-[#F2E8DE] text-[#7A6252]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_190px_220px_210px]">
        <input
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Поиск по имени, R2 key, alt..."
          className="w-full rounded-full border border-[#D8C4B3] bg-white/80 px-5 py-3 text-sm outline-none focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
        />

        <select
          value={activeFilter}
          onChange={(event) =>
            onActiveFilterChange(event.target.value as ActiveMediaFilter)
          }
          className="rounded-full border border-[#D8C4B3] bg-white/80 px-5 py-3 text-sm outline-none focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
        >
          <option value="all">Любой статус</option>
          <option value="visible">Только видимые</option>
          <option value="hidden">Только скрытые</option>
          <option value="favorite">Избранные</option>
          <option value="uncategorized">Без категории</option>
        </select>

        <select
          value={selectedCategoryId}
          onChange={(event) => onSelectedCategoryChange(event.target.value)}
          className="rounded-full border border-[#D8C4B3] bg-white/80 px-5 py-3 text-sm outline-none focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
        >
          <option value="all">Все категории</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name_uk}
            </option>
          ))}
        </select>

        <select
          value={orientationFilter}
          onChange={(event) =>
            onOrientationFilterChange(event.target.value as OrientationFilter)
          }
          className="rounded-full border border-[#D8C4B3] bg-white/80 px-5 py-3 text-sm outline-none focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
        >
          <option value="all">Все форматы</option>
          <option value="portrait">
            Вертикальные · {orientationCounts.portrait}
          </option>
          <option value="landscape">
            Горизонтальные · {orientationCounts.landscape}
          </option>
          <option value="square">Квадратные · {orientationCounts.square}</option>
        </select>
      </div>
    </div>
  );
}
