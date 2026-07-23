"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useLanguage } from "@/lib/language-provider";
import PremiumContainer from "@/components/ui/PremiumContainer";

export type ProjectGalleryData = {
  slug: string;
  titleUk: string;
  titlePl: string;
  descriptionUk: string;
  descriptionPl: string;
  categoryUk: string;
  categoryPl: string;
  images: Array<{
    id: string;
    src: string;
    altUk: string;
    altPl: string;
    width: number | null;
    height: number | null;
  }>;
};

export default function PortfolioProjectGallery({ project }: { project: ProjectGalleryData }) {
  const { lang } = useLanguage();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const activeImage = lightboxIndex === null ? null : project.images[lightboxIndex];

  const previous = useCallback(() => {
    setDirection(-1);
    setLightboxIndex((index) => index === null ? null : (index - 1 + project.images.length) % project.images.length);
  }, [project.images.length]);
  const next = useCallback(() => {
    setDirection(1);
    setLightboxIndex((index) => index === null ? null : (index + 1) % project.images.length);
  }, [project.images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxIndex, next, previous]);

  const onDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) < 70) return;
    if (info.offset.x < 0) next();
    else previous();
  };

  const title = lang === "uk" ? project.titleUk : project.titlePl;
  const description = lang === "uk" ? project.descriptionUk : project.descriptionPl;
  const category = lang === "uk" ? project.categoryUk : project.categoryPl;

  return (
    <section className="pb-32 pt-36 md:pb-40 md:pt-40">
      <PremiumContainer>
        <Link href="/portfolio" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#E9A7B3] transition hover:text-[#FFF7EF]">
          ← {lang === "uk" ? "Усі зйомки" : "Wszystkie sesje"}
        </Link>

        <header className="mx-auto mb-12 mt-10 max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D4A373]">{category}</p>
          <h1 className="mt-4 text-4xl font-light leading-tight text-[#FFF7EF] sm:text-5xl md:text-6xl">{title}</h1>
          {description && <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#D8C8B8] md:text-lg">{description}</p>}
          <p className="mt-5 text-xs uppercase tracking-[0.18em] text-[#F7EFE6]/50">{project.images.length} {lang === "uk" ? "фото" : "zdjęć"}</p>
        </header>

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 lg:gap-6">
          {project.images.map((image, index) => {
            const aspectRatio = image.width && image.height ? image.width / image.height : 0.8;
            const ratioClass = aspectRatio > 1.35 ? "aspect-[4/3]" : aspectRatio < 0.85 ? "aspect-[3/4]" : "aspect-square";
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setLightboxIndex(index)}
                className={`group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-[22px] bg-[#17100D] text-left lg:mb-6 ${ratioClass}`}
                aria-label={lang === "uk" ? `Відкрити фото ${index + 1}` : `Otwórz zdjęcie ${index + 1}`}
              >
                <Image
                  src={image.src}
                  alt={lang === "uk" ? image.altUk : image.altPl}
                  fill
                  priority={index < 2}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.025]"
                />
                <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
              </button>
            );
          })}
        </div>
      </PremiumContainer>

      {activeImage && lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030201]/96 p-3 backdrop-blur-xl sm:p-6" role="dialog" aria-modal="true" onClick={() => setLightboxIndex(null)}>
          <div className="relative h-full w-full max-w-[1500px]" onClick={(event) => event.stopPropagation()}>
            <div className="absolute left-3 top-3 z-20 rounded-full bg-black/55 px-4 py-2 text-xs tracking-[0.16em] text-white/75 backdrop-blur-md">
              {lightboxIndex + 1} / {project.images.length}
            </div>
            <button type="button" onClick={() => setLightboxIndex(null)} className="absolute right-3 top-3 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/55 text-2xl text-white backdrop-blur-md" aria-label={lang === "uk" ? "Закрити" : "Zamknij"}>×</button>
            <button type="button" onClick={previous} className="absolute left-3 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-3xl text-white backdrop-blur-md md:flex" aria-label={lang === "uk" ? "Попереднє фото" : "Poprzednie zdjęcie"}>‹</button>
            <button type="button" onClick={next} className="absolute right-3 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-3xl text-white backdrop-blur-md md:flex" aria-label={lang === "uk" ? "Наступне фото" : "Następne zdjęcie"}>›</button>

            <AnimatePresence initial={false} mode="sync">
              <motion.div
                key={activeImage.id}
                initial={{ x: direction > 0 ? "100%" : "-100%", opacity: 0.7 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction > 0 ? "-100%" : "100%", opacity: 0.7 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDragEnd={onDragEnd}
                className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
              >
                <Image src={activeImage.src} alt={lang === "uk" ? activeImage.altUk : activeImage.altPl} fill sizes="100vw" className="pointer-events-none select-none object-contain" />
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-3 md:hidden">
              <button type="button" onClick={previous} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/55 text-2xl text-white">‹</button>
              <button type="button" onClick={next} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/55 text-2xl text-white">›</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
