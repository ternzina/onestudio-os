"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicSiteProject, PublicSiteProjectImage } from "@/lib/public-site/types";

type PortfolioLayout = "grid" | "masonry";
type PortfolioAspect = "auto" | "square" | "landscape" | "portrait";
type PortfolioVariant = "default" | "gloss";

type PortfolioGalleryProps = {
  projects: PublicSiteProject[];
  locale: string;
  layout?: PortfolioLayout;
  columns?: 2 | 3 | 4;
  aspect?: PortfolioAspect;
  showFilters?: boolean;
  showCategory?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  lightbox?: boolean;
  limit?: number;
  variant?: PortfolioVariant;
};

function copyForLocale(locale: string) {
  const language = locale.split("-")[0];
  return {
    ru: {
      all: "Все",
      open: "Открыть изображение",
      close: "Закрыть",
      previous: "Предыдущее",
      next: "Следующее",
      counter: (current: number, total: number) => `${current} из ${total}`,
    },
    uk: {
      all: "Усі",
      open: "Відкрити зображення",
      close: "Закрити",
      previous: "Попереднє",
      next: "Наступне",
      counter: (current: number, total: number) => `${current} з ${total}`,
    },
    pl: {
      all: "Wszystkie",
      open: "Otwórz zdjęcie",
      close: "Zamknij",
      previous: "Poprzednie",
      next: "Następne",
      counter: (current: number, total: number) => `${current} z ${total}`,
    },
    en: {
      all: "All",
      open: "Open image",
      close: "Close",
      previous: "Previous",
      next: "Next",
      counter: (current: number, total: number) => `${current} of ${total}`,
    },
  }[language] ?? {
    all: "All",
    open: "Open image",
    close: "Close",
    previous: "Previous",
    next: "Next",
    counter: (current: number, total: number) => `${current} of ${total}`,
  };
}

function aspectClass(
  aspect: PortfolioAspect,
  project: PublicSiteProject,
  index: number,
) {
  if (aspect === "square") return "aspect-square";
  if (aspect === "landscape") return "aspect-[4/3]";
  if (aspect === "portrait") return "aspect-[4/5]";

  if (project.width && project.height) {
    const ratio = project.width / project.height;
    if (ratio > 1.2) return "aspect-[4/3]";
    if (ratio < 0.85) return "aspect-[4/5]";
    return "aspect-square";
  }

  return index % 5 === 0 || index % 5 === 3
    ? "aspect-[4/5]"
    : "aspect-[4/3]";
}

function gridColumns(columns: 2 | 3 | 4) {
  if (columns === 2) return "sm:grid-cols-2";
  if (columns === 4) return "sm:grid-cols-2 lg:grid-cols-4";
  return "sm:grid-cols-2 lg:grid-cols-3";
}

function masonryColumns(columns: 2 | 3 | 4) {
  if (columns === 2) return "sm:columns-2";
  if (columns === 4) return "sm:columns-2 lg:columns-4";
  return "sm:columns-2 lg:columns-3";
}

function projectImages(project: PublicSiteProject): PublicSiteProjectImage[] {
  const cover = project.image_url
    ? [{
        id: `${project.id}-cover`,
        image_url: project.image_url,
        image_alt: project.image_alt,
        width: project.width,
        height: project.height,
      }]
    : [];
  const additional = (project.images ?? []).filter(
    (image) =>
      Boolean(image.image_url) &&
      !cover.some((coverImage) => coverImage.image_url === image.image_url),
  );
  return [...cover, ...additional];
}

export default function PublicPortfolioGallery({
  projects,
  locale,
  layout = "masonry",
  columns = 3,
  aspect = "auto",
  showFilters = true,
  showCategory = true,
  showTitle = true,
  showDescription = false,
  lightbox = true,
  limit = 9,
  variant = "default",
}: PortfolioGalleryProps) {
  const copy = copyForLocale(locale);
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          projects
            .map((project) => project.category.trim())
            .filter(Boolean),
        ),
      ),
    [projects],
  );
  const [activeCategory, setActiveCategory] = useState("");
  const filteredProjects = useMemo(
    () =>
      activeCategory
        ? projects.filter((project) => project.category.trim() === activeCategory)
        : projects,
    [activeCategory, projects],
  );
  const visibleProjects = useMemo(
    () => (limit > 0 ? filteredProjects.slice(0, limit) : filteredProjects),
    [filteredProjects, limit],
  );
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeProjectIndex = activeProjectId
    ? visibleProjects.findIndex((project) => project.id === activeProjectId)
    : -1;
  const activeProject =
    activeProjectIndex >= 0 ? visibleProjects[activeProjectIndex] : null;
  const activeImages = useMemo(
    () => (activeProject ? projectImages(activeProject) : []),
    [activeProject],
  );
  const activeImage = activeImages[activeImageIndex] ?? activeImages[0] ?? null;

  useEffect(() => {
    if (!activeProject || !activeImage) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveProjectId(null);
        setActiveImageIndex(0);
        return;
      }

      if (event.key === "ArrowLeft" && activeImages.length > 1) {
        setActiveImageIndex(
          (current) => (current - 1 + activeImages.length) % activeImages.length,
        );
      }

      if (event.key === "ArrowRight" && activeImages.length > 1) {
        setActiveImageIndex((current) => (current + 1) % activeImages.length);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeImage, activeImages.length, activeProject]);

  useEffect(() => {
    if (
      activeProjectId &&
      !visibleProjects.some((project) => project.id === activeProjectId)
    ) {
      setActiveProjectId(null);
      setActiveImageIndex(0);
    }
  }, [activeProjectId, visibleProjects]);

  const articleClass =
    variant === "gloss"
      ? "group overflow-hidden rounded-xl border border-[#3b211f]/10 bg-white"
      : "group overflow-hidden rounded-[28px] border border-black/8 bg-white/85 shadow-[0_18px_55px_rgba(50,23,34,0.06)]";
  const metadataClass = variant === "gloss" ? "p-4" : "p-6";

  const cards = visibleProjects.map((project, index) => {
    const galleryImages = projectImages(project);
    const cardImage = galleryImages[0] ?? null;
    const media = (
      <div
        className={`relative overflow-hidden bg-[#eadedb] ${aspectClass(
          aspect,
          project,
          index,
        )}`}
      >
        {cardImage ? (
          // User-owned media URLs are validated by the media workflow.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cardImage.image_url}
            alt={cardImage.image_alt}
            width={cardImage.width || 1200}
            height={cardImage.height || 1000}
            loading={index < 3 ? "eager" : "lazy"}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.9),transparent_45%),linear-gradient(145deg,#eadedb,#f8eeee)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        {lightbox && galleryImages.length ? (
          <span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-lg text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
            ↗
          </span>
        ) : null}
        {galleryImages.length > 1 ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            {galleryImages.length}
          </span>
        ) : null}
      </div>
    );

    return (
      <article
        key={project.id}
        className={`${articleClass} ${
          layout === "masonry" ? "mb-5 break-inside-avoid" : ""
        }`}
      >
        {lightbox && galleryImages.length ? (
          <button
            type="button"
            onClick={() => {
              setActiveProjectId(project.id);
              setActiveImageIndex(0);
            }}
            aria-label={`${copy.open}: ${project.title}`}
            className="block w-full text-left"
          >
            {media}
          </button>
        ) : (
          media
        )}

        {showCategory || showTitle || (showDescription && project.description) ? (
          <div className={metadataClass}>
            {showCategory && project.category ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--site-accent)]">
                {project.category}
              </p>
            ) : null}
            {showTitle ? (
              <h3
                className={`font-semibold tracking-[-0.04em] ${
                  variant === "gloss" ? "mt-2 text-lg" : "mt-3 text-2xl"
                }`}
              >
                {project.title}
              </h3>
            ) : null}
            {showDescription && project.description ? (
              <p className="mt-3 text-sm leading-6 text-black/55">
                {project.description}
              </p>
            ) : null}
          </div>
        ) : null}
      </article>
    );
  });

  return (
    <div>
      {showFilters && categories.length > 1 ? (
        <div
          className="mb-7 flex flex-wrap gap-2"
          role="group"
          aria-label="Portfolio categories"
        >
          <button
            type="button"
            onClick={() => setActiveCategory("")}
            className={`rounded-full px-4 py-2 text-[10px] font-semibold transition ${
              activeCategory === ""
                ? "bg-[var(--site-accent)] text-white"
                : "border border-black/10 bg-white/75 text-black/65 hover:border-[var(--site-accent)]/40"
            }`}
          >
            {copy.all}
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 text-[10px] font-semibold transition ${
                activeCategory === category
                  ? "bg-[var(--site-accent)] text-white"
                  : "border border-black/10 bg-white/75 text-black/65 hover:border-[var(--site-accent)]/40"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className={
          layout === "masonry"
            ? `columns-1 gap-5 ${masonryColumns(columns)}`
            : `grid gap-5 ${gridColumns(columns)}`
        }
      >
        {cards}
      </div>

      {activeProject && activeImage ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeProject.title}
          className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setActiveProjectId(null);
              setActiveImageIndex(0);
            }
          }}
        >
          <div className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-[#111] text-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
              <p className="min-w-0 truncate text-sm font-semibold">
                {activeProject.title}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/55">
                  {copy.counter(activeImageIndex + 1, activeImages.length)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveProjectId(null);
                    setActiveImageIndex(0);
                  }}
                  aria-label={copy.close}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-xl hover:bg-white/20"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="relative grid min-h-0 flex-1 place-items-center bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage.image_url}
                alt={activeImage.image_alt}
                className="max-h-[76vh] max-w-full object-contain"
              />

              {activeImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex(
                        (current) =>
                          (current - 1 + activeImages.length) %
                          activeImages.length,
                      )
                    }
                    aria-label={copy.previous}
                    className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-2xl text-white backdrop-blur-sm hover:bg-black/70"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIndex(
                        (current) => (current + 1) % activeImages.length,
                      )
                    }
                    aria-label={copy.next}
                    className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-2xl text-white backdrop-blur-sm hover:bg-black/70"
                  >
                    ›
                  </button>
                </>
              ) : null}
            </div>

            {showCategory || showTitle || (showDescription && activeProject.description) ? (
              <div className="border-t border-white/10 px-5 py-4">
                {showCategory && activeProject.category ? (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                    {activeProject.category}
                  </p>
                ) : null}
                {showTitle ? (
                  <p className="mt-1 text-lg font-semibold">{activeProject.title}</p>
                ) : null}
                {showDescription && activeProject.description ? (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                    {activeProject.description}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
