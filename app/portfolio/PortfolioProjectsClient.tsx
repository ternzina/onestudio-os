"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/language-provider";
import PremiumContainer from "@/components/ui/PremiumContainer";

export type PortfolioProjectCard = {
  id: string;
  createdAt: string;
  slug: string;
  categoryId: string;
  categoryUk: string;
  categoryPl: string;
  titleUk: string;
  titlePl: string;
  descriptionUk: string;
  descriptionPl: string;
  imageCount: number;
  cover: {
    src: string;
    altUk: string;
    altPl: string;
    width: number | null;
    height: number | null;
  };
  previewSrc: string | null;
};

export type PortfolioProjectCategory = {
  id: string;
  labelUk: string;
  labelPl: string;
};

export type PortfolioVideoCard = {
  id: string;
  src: string;
  mimeType: string;
  createdAt: string;
  categoryId: string;
  categoryUk: string;
  categoryPl: string;
  titleUk: string;
  titlePl: string;
  width: number | null;
  height: number | null;
};

type Props = {
  projects: PortfolioProjectCard[];
  categories: PortfolioProjectCategory[];
  videos?: PortfolioVideoCard[] | null;
};

const INITIAL_COUNT = 9;
const LOAD_MORE_COUNT = 6;
type SortOrder = "newest" | "oldest";

export default function PortfolioProjectsClient({
  projects,
  categories,
  videos,
}: Props) {
  const { lang } = useLanguage();
  const [activeFilterId, setActiveFilterId] = useState("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const isVideoTab = activeFilterId === "videos";

  const filteredProjects = useMemo(() => {
    const filtered = activeFilterId === "all"
      ? projects
      : projects.filter((project) => project.categoryId === activeFilterId);

    return [...filtered].sort((a, b) => {
      const difference = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sortOrder === "newest" ? difference : -difference;
    });
  }, [activeFilterId, projects, sortOrder]);

  const safeVideos = useMemo(
    () => (Array.isArray(videos) ? videos : []),
    [videos],
  );
  const sortedVideos = useMemo(() => {
    return [...safeVideos].sort((a, b) => {
      const difference = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sortOrder === "newest" ? difference : -difference;
    });
  }, [safeVideos, sortOrder]);

  useEffect(() => {
    const savedSortOrder = window.localStorage.getItem("sisters_portfolio_sort");
    if (savedSortOrder === "newest" || savedSortOrder === "oldest") {
      setSortOrder(savedSortOrder);
    }
  }, []);

  useEffect(() => setVisibleCount(INITIAL_COUNT), [activeFilterId, sortOrder]);

  const changeSortOrder = (value: SortOrder) => {
    setSortOrder(value);
    window.localStorage.setItem("sisters_portfolio_sort", value);
  };

  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const visibleVideos = sortedVideos.slice(0, visibleCount);
  const currentTotal = isVideoTab ? sortedVideos.length : filteredProjects.length;
  const title = lang === "uk" ? "Портфоліо" : "Portfolio";
  const eyebrow = isVideoTab
    ? lang === "uk" ? "Рух, емоції та голоси" : "Ruch, emocje i głosy"
    : lang === "uk" ? "Історії у фотографіях" : "Historie w kadrach";
  const description = isVideoTab
    ? lang === "uk"
      ? "Натисніть відтворення, щоб дивитися відео зі звуком, перемотуванням і повноекранним режимом."
      : "Naciśnij odtwarzanie, aby oglądać filmy z dźwiękiem, przewijaniem i trybem pełnoekranowym."
    : lang === "uk"
      ? "Кожна картка — окрема зйомка. Відкрийте її, щоб побачити всю серію."
      : "Każda karta to osobna sesja. Otwórz ją, aby zobaczyć całą historię.";

  return (
    <section className="relative overflow-hidden pb-36 pt-40 md:pb-40 md:pt-44">
      <div className="pointer-events-none absolute left-[-180px] top-[-180px] h-[420px] w-[420px] rounded-full bg-[#E9A7B3]/14 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-220px] right-[-140px] h-[460px] w-[460px] rounded-full bg-[#B8896A]/16 blur-[110px]" />

      <PremiumContainer>
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.34em] text-[#D4A373] md:text-sm">{eyebrow}</p>
          <h1 className="text-5xl font-light leading-tight text-[#F7EFE6] md:text-6xl">{title}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#D8C8B8] md:text-lg">{description}</p>
        </div>

        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterButton active={activeFilterId === "all"} onClick={() => setActiveFilterId("all")}>
              {lang === "uk" ? "Усі зйомки" : "Wszystkie sesje"}
            </FilterButton>
            {categories.map((category) => (
              <FilterButton key={category.id} active={activeFilterId === category.id} onClick={() => setActiveFilterId(category.id)}>
                {lang === "uk" ? category.labelUk : category.labelPl}
              </FilterButton>
            ))}
            <FilterButton active={isVideoTab} onClick={() => setActiveFilterId("videos")}>
              ▶ {lang === "uk" ? "Відео" : "Wideo"}
            </FilterButton>
          </div>

          <label className="relative shrink-0">
            <span className="sr-only">{lang === "uk" ? "Сортування" : "Sortowanie"}</span>
            <select
              value={sortOrder}
              onChange={(event) => changeSortOrder(event.target.value as SortOrder)}
              className="h-12 appearance-none rounded-full border border-[#E9A7B3]/28 bg-[#120B08] py-0 pl-5 pr-11 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F7EFE6] outline-none transition hover:border-[#E9A7B3]/65 focus:border-[#E9A7B3]"
            >
              <option value="newest">{lang === "uk" ? "Спочатку нові" : "Najpierw nowe"}</option>
              <option value="oldest">{lang === "uk" ? "Спочатку старі" : "Najpierw starsze"}</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#E9A7B3]">⌄</span>
          </label>
        </div>

        {isVideoTab ? (
          <VideoGrid videos={visibleVideos} lang={lang} />
        ) : (
          <ProjectGrid projects={visibleProjects} lang={lang} />
        )}

        {visibleCount < currentTotal && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + LOAD_MORE_COUNT)}
              className="rounded-full border border-[#E9A7B3]/35 px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#F7EFE6] transition hover:border-[#E9A7B3] hover:bg-[#E9A7B3] hover:text-[#130C09]"
            >
              {lang === "uk" ? "Показати ще" : "Pokaż więcej"}
            </button>
          </div>
        )}
      </PremiumContainer>
    </section>
  );
}

function ProjectGrid({
  projects,
  lang,
}: {
  projects: PortfolioProjectCard[];
  lang: "uk" | "pl";
}) {
  if (projects.length === 0) {
    return (
      <EmptyState>
        {lang === "uk" ? "У цій категорії поки немає зйомок." : "W tej kategorii nie ma jeszcze sesji."}
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
      {projects.map((project, index) => {
        const titleText = lang === "uk" ? project.titleUk : project.titlePl;
        const descriptionText = lang === "uk" ? project.descriptionUk : project.descriptionPl;
        const categoryText = lang === "uk" ? project.categoryUk : project.categoryPl;

        return (
          <Link
            key={project.id}
            href={`/portfolio/${project.slug}`}
            className="group overflow-hidden rounded-[28px] border border-[#E9A7B3]/16 bg-[#120B08] shadow-[0_22px_70px_rgba(0,0,0,0.24)] transition duration-500 hover:-translate-y-1 hover:border-[#E9A7B3]/40"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-[#1A110E]">
              <Image
                src={project.cover.src}
                alt={lang === "uk" ? project.cover.altUk : project.cover.altPl}
                fill
                priority={index < 3}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-[1.035] group-hover:opacity-0"
              />
              {project.previewSrc && (
                <Image
                  src={project.previewSrc}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover opacity-0 transition duration-700 group-hover:scale-[1.035] group-hover:opacity-100"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#090604]/78 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#E9A7B3]">{categoryText}</p>
                <h2 className="mt-2 text-2xl font-light leading-tight text-[#FFF7EF]">{titleText}</h2>
              </div>
            </div>
            <div className="flex min-h-24 items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                {descriptionText && <p className="line-clamp-2 text-sm leading-6 text-[#D8C8B8]">{descriptionText}</p>}
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#F7EFE6]/52">
                  {project.imageCount} {lang === "uk" ? "фото" : "zdjęć"}
                </p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E9A7B3]/30 text-xl text-[#F7EFE6] transition group-hover:border-[#E9A7B3] group-hover:bg-[#E9A7B3] group-hover:text-[#130C09]">→</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function VideoGrid({
  videos,
  lang,
}: {
  videos: PortfolioVideoCard[];
  lang: "uk" | "pl";
}) {
  if (videos.length === 0) {
    return (
      <EmptyState>
        {lang === "uk" ? "Відео зʼявляться тут після завантаження." : "Filmy pojawią się tutaj po przesłaniu."}
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
      {videos.map((video, index) => {
        const title = lang === "uk" ? video.titleUk : video.titlePl;
        const category = lang === "uk" ? video.categoryUk : video.categoryPl;

        return (
          <article
            key={video.id}
            className="overflow-hidden rounded-[28px] border border-[#E9A7B3]/16 bg-[#120B08] shadow-[0_22px_70px_rgba(0,0,0,0.24)] transition duration-500 hover:-translate-y-1 hover:border-[#E9A7B3]/40"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-black">
              <video
                src={video.src}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full object-contain"
                aria-label={title}
              >
                {lang === "uk"
                  ? "Ваш браузер не підтримує відео."
                  : "Twoja przeglądarka nie obsługuje wideo."}
              </video>
            </div>
            <div className="px-5 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#E9A7B3]">▶ {category}</p>
              <h2 className="mt-2 line-clamp-2 text-xl font-light leading-tight text-[#FFF7EF]">{title}</h2>
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[#F7EFE6]/52">
                {lang === "uk" ? "Відео зі звуком" : "Wideo z dźwiękiem"}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-dashed border-[#E9A7B3]/24 bg-[#120B08]/70 px-6 py-14 text-center text-sm leading-7 text-[#D8C8B8]">
      {children}
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`shrink-0 rounded-full border px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${active ? "border-[#E9A7B3] bg-[#E9A7B3] text-[#130C09]" : "border-[#E9A7B3]/22 text-[#F7EFE6]/72 hover:border-[#E9A7B3]/60 hover:text-[#FFF7EF]"}`}>
      {children}
    </button>
  );
}
