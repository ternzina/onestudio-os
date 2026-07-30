import Image from "next/image";
import Link from "next/link";
import GlossBookingPanel from "@/components/public/GlossBookingPanel";
import PublicSliderBlock from "@/components/public/PublicSliderBlock";
import type {
  PublicSiteColumnCard,
  PublicSiteCustomBlock,
  PublicSiteService,
} from "@/lib/public-site/types";

const mediaSizeClass = {
  full: "w-full",
  wide: "w-full max-w-5xl",
  medium: "w-full max-w-3xl",
  compact: "w-full max-w-xl",
} as const;

const mediaAspectClass = {
  landscape: "aspect-video",
  classic: "aspect-[4/3]",
  square: "aspect-square",
  portrait: "aspect-[4/5]",
} as const;

const mediaFrameClass = {
  none: "",
  line: "rounded-2xl border border-current/15 p-1",
  card:
    "rounded-[28px] bg-white/10 p-3 shadow-[0_22px_65px_rgba(0,0,0,0.16)]",
} as const;

function blockLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function columnCards(block: PublicSiteCustomBlock): PublicSiteColumnCard[] {
  if (block.cards?.length) return block.cards;
  return blockLines(block.items).map((item, index) => {
    const [title, ...detail] = item.split("·");
    return {
      id: `${block.id}-card-${index + 1}`,
      title: title.trim(),
      text: detail.join("·").trim(),
      media_type: "none",
    };
  });
}

function validYouTubeVideoId(value?: string | null) {
  const id = value?.trim() ?? "";
  return /^[A-Za-z0-9_-]{6,20}$/.test(id) ? id : null;
}

function videoEmbedUrl(value?: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const segments = url.pathname.split("/").filter(Boolean);

    if (host === "youtu.be") {
      const id = validYouTubeVideoId(segments[0]);
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      const pathType = segments[0];
      const id =
        validYouTubeVideoId(url.searchParams.get("v")) ||
        (["shorts", "live", "embed"].includes(pathType)
          ? validYouTubeVideoId(segments[1])
          : null);

      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (host === "youtube-nocookie.com") {
      const id =
        segments[0] === "embed"
          ? validYouTubeVideoId(segments[1])
          : null;
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = [...segments].reverse().find((segment) => /^\d+$/.test(segment));
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

export default function PublicCustomBlock({
  block,
  bookingHref = "",
  services = [],
}: {
  block: PublicSiteCustomBlock;
  bookingHref?: string;
  services?: PublicSiteService[];
}) {
  if (block.is_visible === false) return null;

  const isDark = block.tone === "dark";
  const isAccent = block.tone === "accent";
  const style = isDark
    ? "bg-[var(--site-dark)] text-white"
    : isAccent
      ? "bg-[var(--site-accent)] text-white"
      : "border-y border-black/8 bg-white/60 text-[#3b211f]";
  const sliderImages = (block.media_urls ?? []).filter(Boolean);
  const embedUrl = videoEmbedUrl(block.video_url);
  const mediaSize = block.media_size ?? "wide";
  const mediaAspect = block.media_aspect ?? "landscape";
  const mediaFit = block.media_fit ?? "cover";
  const mediaFrame = block.media_frame ?? "line";

  if (block.kind === "media_text") {
    const mediaIsVideo = block.media_type === "video";
    const mediaIsCalendar = block.media_type === "calendar";
    const mediaOnRight = block.media_position !== "left";

    return (
      <section className={`px-5 py-20 sm:py-24 ${style}`}>
        <div className="mx-auto grid w-full max-w-[1240px] gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className={mediaOnRight ? "lg:order-2" : "lg:order-1"}>
            {mediaIsCalendar && bookingHref && services.length ? (
              <GlossBookingPanel
                bookingHref={bookingHref}
                bookingLabel="Показать свободное время"
                services={services}
                compact
              />
            ) : (
              <div
                className={`mx-auto ${mediaSizeClass[mediaSize]} ${mediaFrameClass[mediaFrame]} ${
                  mediaFrame === "none" ? "" : "overflow-hidden"
                }`}
              >
                <div
                  className={`relative overflow-hidden bg-black/10 ${
                    mediaFrame === "none" ? "" : "rounded-xl"
                  } ${mediaAspectClass[mediaAspect]}`}
                >
                  {mediaIsVideo && block.video_url ? (
                  embedUrl ? (
                    <iframe
                      title={block.media_alt || block.title}
                      src={embedUrl}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  ) : (
                    <video
                      src={block.video_url}
                      poster={block.video_poster_url || undefined}
                      controls
                      preload="metadata"
                      className={`h-full w-full ${
                        mediaFit === "contain" ? "object-contain" : "object-cover"
                      }`}
                    />
                  )
                  ) : block.media_url ? (
                    <Image
                      src={block.media_url}
                      alt={block.media_alt || block.title}
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      loading="lazy"
                      className={
                        mediaFit === "contain" ? "object-contain" : "object-cover"
                      }
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-sm opacity-45">
                      Добавьте изображение или видео
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className={mediaOnRight ? "lg:order-1" : "lg:order-2"}>
            {block.eyebrow ? (
              <p
                className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${
                  isDark || isAccent
                    ? "text-white/60"
                    : "text-[var(--site-accent)]"
                }`}
              >
                {block.eyebrow}
              </p>
            ) : null}
            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-6xl">
              {block.title}
            </h2>
            {block.text ? (
              <p className="mt-7 whitespace-pre-line text-base leading-8 opacity-70">
                {block.text}
              </p>
            ) : null}
            {block.button_label && block.button_url ? (
              <Link
                href={block.button_url}
                className={`mt-8 inline-flex min-h-12 items-center rounded-lg px-6 text-sm font-semibold ${
                  isDark || isAccent
                    ? "bg-white text-[var(--site-dark)]"
                    : "bg-[var(--site-dark)] text-white"
                }`}
              >
                {block.button_label}
                <span className="ml-8" aria-hidden="true">
                  →
                </span>
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`px-5 py-20 sm:py-24 ${style}`}>
      <div className="mx-auto w-full max-w-[1240px]">
        {block.eyebrow ? (
          <p
            className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${
              isDark || isAccent ? "text-white/60" : "text-[var(--site-accent)]"
            }`}
          >
            {block.eyebrow}
          </p>
        ) : null}
        <h2 className="mt-4 max-w-4xl font-serif text-4xl leading-tight sm:text-6xl">
          {block.title}
        </h2>

        {block.kind === "features" || block.kind === "columns" ? (
          <div
            className={`mt-10 grid gap-3 ${
              block.kind === "columns" && block.columns_count === 2
                ? "md:grid-cols-2"
                : "md:grid-cols-3"
            }`}
          >
            {(block.kind === "columns"
              ? columnCards(block)
                  .slice(0, block.columns_count ?? 3)
                  .map((card) => ({
                    key: card.id,
                    title: card.title,
                    detail: card.text,
                    card,
                  }))
              : blockLines(block.items).map((item) => {
                  const [title, ...detail] = item.split("·");
                  return {
                    key: item,
                    title: title.trim(),
                    detail: detail.join("·").trim(),
                    card: null,
                  };
                })
            ).map(({ key, title, detail, card }) => {
                const cardEmbedUrl = videoEmbedUrl(card?.video_url);
                return (
                  <article
                    key={key}
                    className={`overflow-hidden rounded-2xl border ${
                      isDark || isAccent
                        ? "border-white/18 bg-white/8"
                        : "border-black/8 bg-white"
                    }`}
                  >
                    {card?.media_type === "image" && card.media_url ? (
                      <div className="relative aspect-[4/3] bg-black/8">
                        <Image
                          src={card.media_url}
                          alt={card.media_alt || card.title}
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    {card?.media_type === "video" && card.video_url ? (
                      <div className="aspect-video overflow-hidden bg-black">
                        {cardEmbedUrl ? (
                          <iframe
                            title={card.media_alt || card.title}
                            src={cardEmbedUrl}
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="h-full w-full border-0"
                          />
                        ) : (
                          <video
                            src={card.video_url}
                            poster={card.video_poster_url || undefined}
                            controls
                            preload="metadata"
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    ) : null}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold">{title}</h3>
                      {detail ? (
                        <p className="mt-2 text-sm leading-6 opacity-65">
                          {detail}
                        </p>
                      ) : null}
                    </div>
                  </article>
                );
              })}
          </div>
        ) : block.kind !== "slider" && block.kind !== "video" ? (
          <p className="mt-7 max-w-3xl whitespace-pre-line text-base leading-8 opacity-70">
            {block.text}
          </p>
        ) : block.text ? (
          <p className="mt-7 max-w-3xl whitespace-pre-line text-base leading-8 opacity-70">
            {block.text}
          </p>
        ) : null}

        {block.kind === "slider" ? (
          <PublicSliderBlock
            images={sliderImages}
            intervalSeconds={block.slide_interval_seconds ?? 4}
            title={block.title}
            size={mediaSize}
            aspect={mediaAspect}
            fit={mediaFit}
            frame={mediaFrame}
          />
        ) : null}

        {block.kind === "video" && block.video_url ? (
          <div
            className={`mx-auto mt-10 ${mediaSizeClass[mediaSize]} ${
              mediaFrameClass[mediaFrame]
            }`}
          >
            <div
              className={`overflow-hidden bg-black ${
                mediaFrame === "none" ? "" : "rounded-xl"
              } ${mediaAspectClass[mediaAspect]}`}
            >
              {embedUrl ? (
                <iframe
                  title={block.title}
                  src={embedUrl}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              ) : (
                <video
                  src={block.video_url}
                  poster={block.video_poster_url || undefined}
                  controls
                  preload="metadata"
                  className={`h-full w-full ${
                    mediaFit === "contain" ? "object-contain" : "object-cover"
                  }`}
                />
              )}
            </div>
          </div>
        ) : null}

        {block.kind === "cta" && block.button_label && block.button_url ? (
          <Link
            href={block.button_url}
            className={`mt-8 inline-flex min-h-12 items-center rounded-lg px-6 text-sm font-semibold ${
              isDark || isAccent
                ? "bg-white text-[var(--site-dark)]"
                : "bg-[var(--site-dark)] text-white"
            }`}
          >
            {block.button_label}
            <span className="ml-8" aria-hidden="true">
              →
            </span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
