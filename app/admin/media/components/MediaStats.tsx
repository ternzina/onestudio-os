import type { CategoryLink, MediaLibraryItem } from "./types";
import { formatBytes } from "./mediaUtils";

type MediaStatsProps = {
  mediaItems: MediaLibraryItem[];
  categoryLinks: CategoryLink[];
  totalStorage: number;
};

export default function MediaStats({ mediaItems, categoryLinks, totalStorage }: MediaStatsProps) {
  const uncategorizedCount = mediaItems.filter(
    (item) => !categoryLinks.some((link) => link.media_id === item.id),
  ).length;

  const stats = [
    { label: "Всего", value: mediaItems.length },
    { label: "Видимые", value: mediaItems.filter((item) => item.is_active).length },
    { label: "Избранные", value: mediaItems.filter((item) => item.is_favorite).length },
    { label: "Без категории", value: uncategorizedCount },
    { label: "Объем", value: formatBytes(totalStorage) },
  ];

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-[28px] border border-[#E5D5C8] bg-white/72 p-5 shadow-[0_18px_55px_rgba(83,54,37,0.08)]"
        >
          <p className="text-xs uppercase tracking-[0.22em] text-[#A67C52]">{stat.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
