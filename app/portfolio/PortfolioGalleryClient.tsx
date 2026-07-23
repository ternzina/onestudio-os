"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../lib/language-provider";
import AnimatedTitle from "@/components/ui/AnimatedTitle";
import PremiumContainer from "@/components/ui/PremiumContainer";
import type { PortfolioVideoCard } from "./PortfolioProjectsClient";

export type PortfolioImage = {
  id: string;
  src: string;
  altUk: string;
  altPl: string;
  categoryId: string;
  width?: number | null;
  height?: number | null;
  manualLikes?: number;
  createdAt?: string;
};

export type PortfolioCategory = {
  id: string;
  labelUk: string;
  labelPl: string;
  images: PortfolioImage[];
};

type PortfolioGalleryClientProps = {
  categories: PortfolioCategory[];
  videos?: PortfolioVideoCard[] | null;
};

type ImageOrientation =
  "unknown" | "portrait" | "landscape" | "panorama" | "square";
type SortOrder = "newest" | "oldest";

const fallbackImage = "https://cdn.sistersstudio.pl/site/static/portfolio/98f9dc7ff4db-portfolio1.webp";

const fallbackImages: PortfolioImage[] = [
  {
    id: "fallback-1",
    src: "https://cdn.sistersstudio.pl/site/static/portfolio/98f9dc7ff4db-portfolio1.webp",
    altUk: "Портфоліо Sisters Photo Studio",
    altPl: "Portfolio Sisters Photo Studio",
    categoryId: "fallback",
  },
  {
    id: "fallback-2",
    src: "https://cdn.sistersstudio.pl/site/static/portfolio/4e17e3958a6e-portfolio2.webp",
    altUk: "Портфоліо Sisters Photo Studio",
    altPl: "Portfolio Sisters Photo Studio",
    categoryId: "fallback",
  },
  {
    id: "fallback-3",
    src: "https://cdn.sistersstudio.pl/site/static/portfolio/e74a31fd8881-portfolio3.webp",
    altUk: "Портфоліо Sisters Photo Studio",
    altPl: "Portfolio Sisters Photo Studio",
    categoryId: "fallback",
  },
];

const loadingLayoutClasses = [
  "aspect-[3/4]",
  "aspect-[4/3] md:col-span-2",
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[16/10] md:col-span-2",
  "aspect-[3/4]",
];

function detectOrientation(width: number, height: number): ImageOrientation {
  if (!width || !height) return "unknown";

  const ratio = width / height;

  if (ratio >= 1.75) return "panorama";
  if (ratio >= 1.08) return "landscape";
  if (ratio <= 0.86) return "portrait";

  return "square";
}

function getCardLayoutClass(orientation: ImageOrientation, index: number) {
  if (orientation === "portrait") {
    return "aspect-[3/4]";
  }

  if (orientation === "landscape") {
    return "aspect-[4/3] md:col-span-2";
  }

  if (orientation === "panorama") {
    return "aspect-[16/9] md:col-span-2 lg:col-span-3";
  }

  if (orientation === "square") {
    return "aspect-square";
  }

  return loadingLayoutClasses[index % loadingLayoutClasses.length];
}

export default function PortfolioGalleryClient({
  categories,
  videos,
}: PortfolioGalleryClientProps) {
  const { lang } = useLanguage();
  const [activeCategoryId, setActiveCategoryId] = useState("all");
  const isVideoTab = activeCategoryId === "videos";
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [imageOrientations, setImageOrientations] = useState<
    Record<string, ImageOrientation>
  >({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [likedImages, setLikedImages] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Array<{ id: string; body: string; author_name: string; avatar_url: string | null; created_at: string }>>([]);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [notice, setNotice] = useState("");
  const [heartBurstId, setHeartBurstId] = useState<string | null>(null);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastClickRef = useRef(0);
  const lastLightboxClickRef = useRef(0);

  const allImages = useMemo(
    () => categories.flatMap((category) => category.images),
    [categories],
  );
  const visibleImages = useMemo(() => {
    if (isVideoTab) return [];
    if (allImages.length === 0) return fallbackImages;
    const filtered = activeCategoryId === "all"
      ? allImages
      : categories.find((category) => category.id === activeCategoryId)?.images || [];

    return [...filtered].sort((a, b) => {
      const difference = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      return sortOrder === "newest" ? difference : -difference;
    });
  }, [activeCategoryId, allImages, categories, isVideoTab, sortOrder]);
  const safeVideos = useMemo(
    () => (Array.isArray(videos) ? videos : []),
    [videos],
  );
  const visibleVideos = useMemo(() => {
    return [...safeVideos].sort((a, b) => {
      const difference = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return sortOrder === "newest" ? difference : -difference;
    });
  }, [safeVideos, sortOrder]);
  const activeLightboxImage = lightboxIndex === null ? null : visibleImages[lightboxIndex] || null;

  useEffect(() => {
    const savedSortOrder = window.localStorage.getItem("sisters_portfolio_sort");
    if (savedSortOrder === "newest" || savedSortOrder === "oldest") {
      setSortOrder(savedSortOrder);
    }
  }, []);

  const changeSortOrder = (value: SortOrder) => {
    setSortOrder(value);
    setLightboxIndex(null);
    window.localStorage.setItem("sisters_portfolio_sort", value);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (allImages.length === 0) return;
    const visitorId = getVisitorId();
    Promise.all(allImages.map(async (image) => {
      const [likeCount, ownLike, commentCount] = await Promise.all([
        supabase.from("portfolio_likes").select("id", { count: "exact", head: true }).eq("image_id", image.id),
        supabase.from("portfolio_likes").select("id").eq("image_id", image.id).eq("visitor_id", visitorId).maybeSingle(),
        supabase.from("portfolio_comments").select("id", { count: "exact", head: true }).eq("image_id", image.id).eq("is_visible", true),
      ]);
      return { id: image.id, likes: (likeCount.count || 0) + (image.manualLikes || 0), liked: Boolean(ownLike.data), comments: commentCount.count || 0 };
    })).then((results) => {
      setLikes(Object.fromEntries(results.map((item) => [item.id, item.likes])));
      setLikedImages(Object.fromEntries(results.map((item) => [item.id, item.liked])));
      setCommentCounts(Object.fromEntries(results.map((item) => [item.id, item.comments])));
    });
  }, [allImages]);

  useEffect(() => {
    if (!activeLightboxImage) return;
    const imageId = activeLightboxImage.id;
    const visitorId = getVisitorId();
    Promise.all([
      supabase.from("portfolio_likes").select("id", { count: "exact", head: true }).eq("image_id", imageId),
      supabase.from("portfolio_likes").select("id").eq("image_id", imageId).eq("visitor_id", visitorId).maybeSingle(),
      supabase.from("portfolio_comments").select("id, body, author_name, avatar_url, created_at").eq("image_id", imageId).eq("is_visible", true).order("created_at", { ascending: false }),
    ]).then(([countResult, likedResult, commentsResult]) => {
      setLikes((current) => ({ ...current, [imageId]: (countResult.count || 0) + (activeLightboxImage.manualLikes || 0) }));
      setLikedImages((current) => ({ ...current, [imageId]: Boolean(likedResult.data) }));
      setComments(commentsResult.data || []);
      setCommentCounts((current) => ({ ...current, [imageId]: commentsResult.data?.length || 0 }));
    });
  }, [activeLightboxImage]);

  function getVisitorId() {
    const key = "sisters_portfolio_visitor";
    let id = window.localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(key, id);
    }
    return id;
  }

  const toggleLike = async (selectedImage: PortfolioImage | null = activeLightboxImage) => {
    if (!selectedImage) return;
    const imageId = selectedImage.id;
    const visitorId = getVisitorId();
    if (likedImages[imageId]) {
      await supabase.from("portfolio_likes").delete().eq("image_id", imageId).eq("visitor_id", visitorId);
      setLikedImages((current) => ({ ...current, [imageId]: false }));
      setLikes((current) => ({ ...current, [imageId]: Math.max(0, (current[imageId] || 1) - 1) }));
    } else {
      const { error } = await supabase.from("portfolio_likes").insert({ image_id: imageId, visitor_id: visitorId, user_id: user?.id || null });
      if (!error) {
        setLikedImages((current) => ({ ...current, [imageId]: true }));
        setLikes((current) => ({ ...current, [imageId]: (current[imageId] || 0) + 1 }));
      }
    }
  };

  const shareImage = async (selectedImage: PortfolioImage | null = activeLightboxImage) => {
    if (!selectedImage) return;
    const url = `${window.location.origin}/portfolio?photo=${encodeURIComponent(selectedImage.id)}`;
    try {
      if (navigator.share) await navigator.share({ title: "Sisters Photo Studio", url });
      else { await navigator.clipboard.writeText(url); setNotice(lang === "uk" ? "Посилання скопійовано" : "Link skopiowany"); }
    } catch { /* sharing was cancelled */ }
  };

  const socialLogin = async (provider: "google" | "apple") => {
    if (!activeLightboxImage) return;
    window.localStorage.setItem("portfolio_pending_photo", activeLightboxImage.id);
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/portfolio?photo=${encodeURIComponent(activeLightboxImage.id)}` } });
  };

  const sendComment = async () => {
    if (!activeLightboxImage) return;
    if (!user) { setShowLogin(true); return; }
    const body = commentText.trim();
    if (!body) return;
    const metadata = user.user_metadata || {};
    const { data, error } = await supabase.from("portfolio_comments").insert({
      image_id: activeLightboxImage.id, user_id: user.id, body,
      author_name: metadata.full_name || metadata.name || user.email?.split("@")[0] || "Guest",
      avatar_url: metadata.avatar_url || metadata.picture || null,
    }).select("id, body, author_name, avatar_url, created_at").single();
    if (!error && data) {
      setComments((current) => [data, ...current]);
      setCommentCounts((current) => ({ ...current, [activeLightboxImage.id]: (current[activeLightboxImage.id] || 0) + 1 }));
      setCommentText("");
    }
  };

  const openComments = (index: number) => {
    setLightboxIndex(index);
    setShowComments(true);
  };

  const handlePhotoClick = (image: PortfolioImage, index: number) => {
    const now = Date.now();
    const isDoubleClick = now - lastClickRef.current < 320;
    lastClickRef.current = now;

    if (isDoubleClick) {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      if (!likedImages[image.id]) toggleLike(image);
      setHeartBurstId(image.id);
      window.setTimeout(() => setHeartBurstId((current) => current === image.id ? null : current), 750);
      return;
    }

    clickTimerRef.current = setTimeout(() => {
      openLightbox(index);
      clickTimerRef.current = null;
    }, 320);
  };

  const handleLightboxLike = () => {
    if (!activeLightboxImage) return;
    const now = Date.now();

    if (now - lastLightboxClickRef.current < 320) {
      if (!likedImages[activeLightboxImage.id]) {
        toggleLike(activeLightboxImage);
      }
      setHeartBurstId(activeLightboxImage.id);
      window.setTimeout(
        () => setHeartBurstId((current) => current === activeLightboxImage.id ? null : current),
        750,
      );
      lastLightboxClickRef.current = 0;
      return;
    }

    lastLightboxClickRef.current = now;
  };

  useEffect(() => () => {
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
  }, []);

  useEffect(() => {
    setLightboxIndex(null);
  }, [activeCategoryId]);

  useEffect(() => {
    const photoId = new URLSearchParams(window.location.search).get("photo");
    if (!photoId) return;
    const index = visibleImages.findIndex((image) => image.id === photoId);
    if (index >= 0) setLightboxIndex(index);
  }, [visibleImages]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxIndex(null);
      }

      if (event.key === "ArrowRight") {
        setSlideDirection(1);
        setLightboxIndex((current) => current === null ? current : (current + 1) % visibleImages.length);
      }

      if (event.key === "ArrowLeft") {
        setSlideDirection(-1);
        setLightboxIndex((current) => current === null ? current : (current - 1 + visibleImages.length) % visibleImages.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, visibleImages.length]);

  useEffect(() => {
    if (lightboxIndex === null || visibleImages.length < 2) return;

    const previousIndex =
      (lightboxIndex - 1 + visibleImages.length) % visibleImages.length;
    const nextIndex = (lightboxIndex + 1) % visibleImages.length;

    [visibleImages[previousIndex], visibleImages[nextIndex]].forEach((image) => {
      if (!image?.src) return;
      const preload = new window.Image();
      preload.src = image.src;
    });
  }, [lightboxIndex, visibleImages]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showPreviousImage = () => {
    setSlideDirection(-1);
    setLightboxIndex((current) =>
      current === null
        ? current
        : (current - 1 + visibleImages.length) % visibleImages.length,
    );
  };

  const showNextImage = () => {
    setSlideDirection(1);
    setLightboxIndex((current) =>
      current === null ? current : (current + 1) % visibleImages.length,
    );
  };

  const handleCarouselDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipePower = Math.abs(info.offset.x) + Math.abs(info.velocity.x) * 0.15;
    if (swipePower < 90) return;
    if (info.offset.x < 0) showNextImage();
    else showPreviousImage();
  };

  const allButtonLabel = lang === "uk" ? "Усі" : "Wszystkie";
  const title = lang === "uk" ? "Портфоліо" : "Portfolio";
  const eyebrow = isVideoTab
    ? lang === "uk" ? "Рух, емоції та голоси" : "Ruch, emocje i głosy"
    : lang === "uk" ? "Галерея" : "Galeria";
  const description = isVideoTab
    ? lang === "uk"
      ? "Натисніть відтворення, щоб дивитися відео зі звуком, перемотуванням і повноекранним режимом."
      : "Naciśnij odtwarzanie, aby oglądać filmy z dźwiękiem, przewijaniem i trybem pełnoekranowym."
    : lang === "uk"
      ? "Живі моменти, ніжні деталі та кадри, які хочеться зберегти."
      : "Naturalne momenty, delikatne detale i kadry, do których chce się wracać.";

  return (
    <section className="relative overflow-hidden pb-40 pt-40 md:pb-44 md:pt-44">
      <div className="pointer-events-none absolute left-[-180px] top-[-180px] h-[420px] w-[420px] rounded-full bg-[#E9A7B3]/16 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-220px] right-[-140px] h-[460px] w-[460px] rounded-full bg-[#B8896A]/18 blur-[110px]" />

      <PremiumContainer>
        <AnimatedTitle eyebrow={eyebrow} title={title} />

        <p className="mx-auto mb-10 max-w-3xl text-center text-base leading-8 text-[#D8C8B8] md:text-lg">
          {description}
        </p>

        <div className="mb-6 flex justify-end">
          <label className="relative">
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
        ) : visibleImages.length > 0 ? (
          <div className="mx-[calc(50%_-_50vw)] grid w-screen grid-flow-dense grid-cols-1 gap-4 md:mx-0 md:w-auto md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {visibleImages.map((image, index) => {
              const storedOrientation =
                image.width && image.height
                  ? detectOrientation(image.width, image.height)
                  : "unknown";
              const orientation = imageOrientations[image.id] || storedOrientation;

              return (
                <div
                  key={`${image.id}-${orientation}`}
                  className={`group relative overflow-hidden bg-[#0B0807] md:rounded-[28px] md:border md:border-[#E9A7B3]/16 ${getCardLayoutClass(orientation, index)}`}
                >
                  <div className="relative flex h-full w-full flex-col bg-[#0B0807]">
                  <button
                    type="button"
                    onClick={() => handlePhotoClick(image, index)}
                    className="group relative min-h-0 w-full flex-1 overflow-hidden bg-[#17100D] text-left outline-none md:rounded-t-[28px] focus-visible:ring-2 focus-visible:ring-[#E9A7B3]/45"
                    aria-label={
                      lang === "uk"
                        ? `Відкрити фото ${index + 1}`
                        : `Otwórz zdjęcie ${index + 1}`
                    }
                  >
                    <img
                      src={image.src}
                      alt={lang === "uk" ? image.altUk : image.altPl}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onLoad={(event) => {
                        const orientation = detectOrientation(
                          event.currentTarget.naturalWidth,
                          event.currentTarget.naturalHeight,
                        );

                        setImageOrientations((current) => {
                          if (current[image.id] === orientation) return current;

                          return {
                            ...current,
                            [image.id]: orientation,
                          };
                        });
                      }}
                      onError={(event) => {
                        if (
                          event.currentTarget.src !==
                          window.location.origin + fallbackImage
                        ) {
                          event.currentTarget.src = fallbackImage;
                        }
                      }}
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080604]/18 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
                    {heartBurstId === image.id && (
                      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-28 w-28 animate-[ping_0.7s_ease-out_1] text-[#F05C78] drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]" fill="currentColor"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.3l7.8-7.7 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>
                      </div>
                    )}
                  </button>

                  <div className="relative z-10 flex h-14 shrink-0 items-center gap-1 border-x border-b border-[#E9A7B3]/16 bg-[#0B0807] px-3 sm:h-16 sm:px-4">
                    <button
                      type="button"
                      onClick={(event) => { event.stopPropagation(); toggleLike(image); }}
                      className={`flex h-11 min-w-14 items-center gap-2 px-2 text-sm transition ${likedImages[image.id] ? "text-[#F05C78]" : "text-[#F7EFE6] hover:text-[#E9A7B3]"}`}
                      aria-label={lang === "uk" ? "Подобається" : "Lubię to"}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill={likedImages[image.id] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.3l7.8-7.7 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span>{likes[image.id] || 0}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(event) => { event.stopPropagation(); openComments(index); }}
                      className="flex h-11 min-w-14 items-center gap-2 px-2 text-sm text-[#F7EFE6] transition hover:text-[#E9A7B3]"
                      aria-label={lang === "uk" ? "Коментарі" : "Komentarze"}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.5 9.5 0 0 1-4-.9L3 21l1.7-4.6A8.5 8.5 0 1 1 21 11.5Z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span>{commentCounts[image.id] || 0}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(event) => { event.stopPropagation(); shareImage(image); }}
                      className="flex h-11 w-12 items-center justify-center text-[#F7EFE6] transition hover:text-[#E9A7B3]"
                      aria-label={lang === "uk" ? "Поділитися" : "Udostępnij"}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m22 2-7.5 20-4.3-8.2L2 9.5 22 2Z" strokeLinecap="round" strokeLinejoin="round" /><path d="M10.2 13.8 22 2" strokeLinecap="round" /></svg>
                    </button>
                  </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mx-auto max-w-2xl rounded-[28px] border border-[#E9A7B3]/18 bg-[#120B08]/70 p-8 text-center text-[#D8C8B8]">
            {lang === "uk"
              ? "У цій категорії поки немає фото. Додайте зображення в потрібну папку портфоліо."
              : "W tej kategorii nie ma jeszcze zdjęć. Dodaj zdjęcia do odpowiedniego folderu portfolio."}
          </div>
        )}
      </PremiumContainer>

      {activeLightboxImage && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#030201]/95 px-4 py-6 backdrop-blur-2xl sm:px-8"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={
            lang === "uk" ? "Перегляд портфоліо" : "Podgląd portfolio"
          }
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(233,167,179,0.16),transparent_28%),radial-gradient(circle_at_84%_70%,rgba(184,137,106,0.15),transparent_30%)]" />

          <div
            className="relative flex h-full w-full max-w-[1500px] flex-col items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute left-0 top-0 z-10 flex items-center gap-3 rounded-full border border-[#E9A7B3]/18 bg-[#080604]/72 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F7EFE6]/72 backdrop-blur-xl sm:text-xs">
              <span>{String(lightboxIndex + 1).padStart(2, "0")}</span>
              <span className="h-px w-8 bg-[#E9A7B3]/40" />
              <span>{String(visibleImages.length).padStart(2, "0")}</span>
            </div>

            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-0 top-0 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[#E9A7B3]/24 bg-[#080604]/72 text-2xl leading-none text-[#F7EFE6] backdrop-blur-xl transition hover:border-[#E9A7B3]/70 hover:bg-[#E9A7B3] hover:text-[#130C09]"
              aria-label={lang === "uk" ? "Закрити" : "Zamknij"}
            >
              ×
            </button>

            <button
              type="button"
              onClick={showPreviousImage}
              className="absolute left-0 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-[#E9A7B3]/24 bg-[#080604]/72 text-3xl text-[#F7EFE6] backdrop-blur-xl transition hover:border-[#E9A7B3]/70 hover:bg-[#E9A7B3] hover:text-[#130C09] md:flex"
              aria-label={
                lang === "uk" ? "Попереднє фото" : "Poprzednie zdjęcie"
              }
            >
              ‹
            </button>

            <div className="flex h-[calc(100dvh-6rem)] w-[calc(100vw-2rem)] max-w-[1200px] flex-col overflow-hidden rounded-[26px] bg-[#0B0807] shadow-[0_30px_120px_rgba(0,0,0,0.62)] md:h-[86vh] md:w-[min(82vw,1200px)]">
            <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
              <AnimatePresence initial={false} mode="sync">
                <motion.img
                  key={activeLightboxImage.id}
                  src={activeLightboxImage.src}
                  alt={lang === "uk" ? activeLightboxImage.altUk : activeLightboxImage.altPl}
                  initial={{ x: slideDirection >= 0 ? "100%" : "-100%", opacity: 0.75 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: slideDirection >= 0 ? "-100%" : "100%", opacity: 0.75 }}
                  transition={{ x: { type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.16 } }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.92}
                  onDragEnd={handleCarouselDragEnd}
                  onClick={handleLightboxLike}
                  className="absolute inset-0 h-full w-full cursor-grab touch-pan-y select-none object-contain active:cursor-grabbing"
                  draggable={false}
                  onError={(event) => {
                    if (event.currentTarget.src !== window.location.origin + fallbackImage) {
                      event.currentTarget.src = fallbackImage;
                    }
                  }}
                />
              </AnimatePresence>
              {heartBurstId === activeLightboxImage.id && (
                <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-32 w-32 animate-[ping_0.7s_ease-out_1] text-[#F05C78] drop-shadow-[0_8px_28px_rgba(0,0,0,0.65)]" fill="currentColor"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.3l7.8-7.7 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>
                </div>
              )}
            </div>

            <div className="relative z-20 flex h-16 w-full shrink-0 items-center gap-1 border-t border-[#E9A7B3]/16 bg-[#0B0807] px-4">
              <button type="button" onClick={() => toggleLike()} className={`flex h-11 min-w-14 items-center gap-2 px-2 text-sm transition ${likedImages[activeLightboxImage.id] ? "text-[#F05C78]" : "text-[#F7EFE6] hover:text-[#E9A7B3]"}`}>
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill={likedImages[activeLightboxImage.id] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.3l7.8-7.7 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span>{likes[activeLightboxImage.id] || 0}</span>
              </button>
              <button type="button" onClick={() => setShowComments((value) => !value)} className="flex h-11 min-w-14 items-center gap-2 px-2 text-sm text-[#F7EFE6] transition hover:text-[#E9A7B3]" aria-label={lang === "uk" ? "Коментарі" : "Komentarze"}>
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.5 9.5 0 0 1-4-.9L3 21l1.7-4.6A8.5 8.5 0 1 1 21 11.5Z" strokeLinecap="round" strokeLinejoin="round" /></svg><span>{comments.length}</span>
              </button>
              <button type="button" onClick={() => shareImage()} className="flex h-11 w-12 items-center justify-center text-[#F7EFE6] transition hover:text-[#E9A7B3]">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m22 2-7.5 20-4.3-8.2L2 9.5 22 2Z" strokeLinecap="round" strokeLinejoin="round" /><path d="M10.2 13.8 22 2" strokeLinecap="round" /></svg>
              </button>
            </div>
            </div>

            {showComments && (
              <div className="absolute bottom-16 right-0 z-30 w-full max-w-sm rounded-[26px] border border-[#E9A7B3]/24 bg-[#100B09]/95 p-4 shadow-2xl backdrop-blur-2xl">
                <div className="mb-3 flex items-center justify-between"><h3 className="text-lg text-[#F7EFE6]">{lang === "uk" ? "Коментарі" : "Komentarze"}</h3><button onClick={() => setShowComments(false)} className="text-2xl text-[#F7EFE6]/70">×</button></div>
                <div className="mb-4 max-h-48 space-y-3 overflow-y-auto">
                  {comments.length === 0 && <p className="text-sm text-[#D8C8B8]">{lang === "uk" ? "Будьте першими, хто залишить коментар." : "Napisz pierwszy komentarz."}</p>}
                  {comments.map((comment) => <div key={comment.id} className="flex gap-3">
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#E9A7B3]/20">{comment.avatar_url && <img src={comment.avatar_url} alt="" className="h-full w-full object-cover" />}</div>
                    <div><p className="text-xs font-semibold text-[#E9A7B3]">{comment.author_name}</p><p className="break-words text-sm text-[#F7EFE6]/90">{comment.body}</p></div>
                  </div>)}
                </div>
                <div className="flex gap-2"><input value={commentText} onChange={(event) => setCommentText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendComment(); }} placeholder={lang === "uk" ? "Ваш коментар…" : "Twój komentarz…"} maxLength={500} className="min-w-0 flex-1 rounded-full border border-[#E9A7B3]/24 bg-black/30 px-4 text-sm text-white outline-none focus:border-[#E9A7B3]"/><button onClick={sendComment} className="h-11 rounded-full bg-[#E9A7B3] px-4 text-sm font-semibold text-[#130C09]">{lang === "uk" ? "Надіслати" : "Wyślij"}</button></div>
              </div>
            )}

            {showLogin && (
              <div className="absolute inset-0 z-40 flex items-center justify-center rounded-[28px] bg-black/65 p-4 backdrop-blur-md">
                <div className="w-full max-w-sm rounded-[28px] border border-[#E9A7B3]/30 bg-[#120B08] p-6 text-center shadow-2xl">
                  <button onClick={() => setShowLogin(false)} className="float-right text-2xl text-white/70">×</button>
                  <h3 className="mb-2 mt-5 text-xl text-[#F7EFE6]">{lang === "uk" ? "Увійдіть, щоб коментувати" : "Zaloguj się, aby komentować"}</h3>
                  <p className="mb-5 text-sm text-[#D8C8B8]">{lang === "uk" ? "Окрема реєстрація не потрібна." : "Oddzielna rejestracja nie jest potrzebna."}</p>
                  <div className="space-y-3"><button onClick={() => socialLogin("google")} className="h-12 w-full rounded-full bg-white font-semibold text-black">Google</button><button onClick={() => socialLogin("apple")} className="h-12 w-full rounded-full border border-white/30 bg-black font-semibold text-white"> Apple</button></div>
                </div>
              </div>
            )}

            {notice && <div className="absolute bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-full bg-[#E9A7B3] px-4 py-2 text-sm text-[#130C09]">{notice}</div>}

            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-0 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-[#E9A7B3]/24 bg-[#080604]/72 text-3xl text-[#F7EFE6] backdrop-blur-xl transition hover:border-[#E9A7B3]/70 hover:bg-[#E9A7B3] hover:text-[#130C09] md:flex"
              aria-label={lang === "uk" ? "Наступне фото" : "Następne zdjęcie"}
            >
              ›
            </button>

            <div className="absolute bottom-16 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[#E9A7B3]/18 bg-[#080604]/72 p-2 backdrop-blur-xl md:hidden">
              <button
                type="button"
                onClick={showPreviousImage}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E9A7B3]/24 text-2xl text-[#F7EFE6]"
                aria-label={
                  lang === "uk" ? "Попереднє фото" : "Poprzednie zdjęcie"
                }
              >
                ‹
              </button>
              <button
                type="button"
                onClick={showNextImage}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E9A7B3]/24 text-2xl text-[#F7EFE6]"
                aria-label={
                  lang === "uk" ? "Наступне фото" : "Następne zdjęcie"
                }
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E9A7B3]/18 bg-[#070504]/88 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto rounded-full border border-[#E9A7B3]/20 bg-[#120B08]/72 p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setActiveCategoryId("all")}
            className={`shrink-0 rounded-full border px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] transition duration-300 md:text-[11px] ${
              activeCategoryId === "all"
                ? "border-[#E9A7B3]/70 bg-[#E9A7B3] text-[#130C09] shadow-[0_16px_40px_rgba(233,167,179,0.18)]"
                : "border-[#E9A7B3]/22 bg-[#120B08]/70 text-[#F7EFE6]/70 hover:border-[#E9A7B3]/60 hover:text-[#FFF7EF]"
            }`}
          >
            {allButtonLabel}
          </button>

          {categories.map((category) => {
            const active = activeCategoryId === category.id;
            const label = lang === "uk" ? category.labelUk : category.labelPl;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategoryId(category.id)}
                className={`shrink-0 rounded-full border px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] transition duration-300 md:text-[11px] ${
                  active
                    ? "border-[#E9A7B3]/70 bg-[#E9A7B3] text-[#130C09] shadow-[0_16px_40px_rgba(233,167,179,0.18)]"
                    : "border-[#E9A7B3]/22 bg-[#120B08]/70 text-[#F7EFE6]/70 hover:border-[#E9A7B3]/60 hover:text-[#FFF7EF]"
                }`}
              >
                {label}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActiveCategoryId("videos")}
            className={`shrink-0 rounded-full border px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] transition duration-300 md:text-[11px] ${
              isVideoTab
                ? "border-[#E9A7B3]/70 bg-[#E9A7B3] text-[#130C09] shadow-[0_16px_40px_rgba(233,167,179,0.18)]"
                : "border-[#E9A7B3]/22 bg-[#120B08]/70 text-[#F7EFE6]/70 hover:border-[#E9A7B3]/60 hover:text-[#FFF7EF]"
            }`}
          >
            ▶ {lang === "uk" ? "Відео" : "Wideo"}
          </button>
        </div>
      </div>
    </section>
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
      <div className="mx-auto max-w-2xl rounded-[28px] border border-[#E9A7B3]/18 bg-[#120B08]/70 p-8 text-center text-[#D8C8B8]">
        {lang === "uk"
          ? "Відео зʼявляться тут після завантаження в категорію портфоліо."
          : "Filmy pojawią się tutaj po przesłaniu do kategorii portfolio."}
      </div>
    );
  }

  return (
    <div className="mx-[calc(50%_-_50vw)] grid w-screen grid-cols-1 gap-4 md:mx-0 md:w-auto md:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {videos.map((video) => {
        const title = lang === "uk" ? video.titleUk : video.titlePl;
        const category = lang === "uk" ? video.categoryUk : video.categoryPl;

        return (
          <article
            key={video.id}
            className="overflow-hidden bg-[#0B0807] md:rounded-[28px] md:border md:border-[#E9A7B3]/16"
          >
            <div className="aspect-[4/5] bg-black">
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
            <div className="border-t border-[#E9A7B3]/16 px-5 py-5">
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
