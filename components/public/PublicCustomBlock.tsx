import Image from "next/image";
import Link from "next/link";
import GlossBookingPanel from "@/components/public/GlossBookingPanel";
import PublicReveal from "@/components/public/PublicReveal";
import PublicRichHeading from "@/components/public/PublicRichHeading";
import PublicRichText from "@/components/public/PublicRichText";
import PublicSliderBlock from "@/components/public/PublicSliderBlock";
import { colorOverrideStyle } from "@/lib/public-site/colors";
import {
  publicSiteBlockCompositionStyle,
  publicSiteCompositionItemStyle,
  resolvePublicSiteBlockComposition,
} from "@/lib/public-site/block-composition";
import { richTextPlainText } from "@/lib/public-site/rich-text";
import { safePublicActionHref } from "@/lib/public-site/editor-actions";
import { publicTypographyStyle } from "@/lib/public-site/typography";
import {
  publicSiteCustomBlockMediaStyle,
  publicSiteMediaVariables,
} from "@/lib/public-site/visual-tokens";
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


const contentWidthClass = {
  full: "max-w-none",
  wide: "max-w-[1240px]",
  medium: "max-w-5xl",
  narrow: "max-w-3xl",
} as const;

const paddingTopClass = {
  none: "pt-0",
  compact: "pt-10 sm:pt-12",
  normal: "pt-20 sm:pt-24",
  airy: "pt-28 sm:pt-36",
} as const;

const paddingBottomClass = {
  none: "pb-0",
  compact: "pb-10 sm:pb-12",
  normal: "pb-20 sm:pb-24",
  airy: "pb-28 sm:pb-36",
} as const;

const sectionHeightClass = {
  auto: "",
  compact: "min-h-[320px]",
  medium: "min-h-[480px]",
  tall: "min-h-[640px]",
  screen: "min-h-[85vh]",
} as const;

const mediaFrameClass = {
  none: "",
  line: "rounded-2xl border border-current/15 p-1",
  card:
    "rounded-[28px] bg-white/10 p-3 shadow-[0_22px_65px_rgba(0,0,0,0.16)]",
} as const;

function blockLines(value: string) {
  return richTextPlainText(value)
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

  const hasCustomColors = block.colors?.mode === "custom";
  const isDark = !hasCustomColors && block.tone === "dark";
  const isAccent = !hasCustomColors && block.tone === "accent";
  const style = hasCustomColors
    ? "border-y border-black/8"
    : isDark
    ? "bg-[var(--site-dark)] text-white"
    : isAccent
      ? "bg-[var(--site-accent)] text-white"
      : "border-y border-black/8 bg-white/60 text-[#3b211f]";
  const blockStyle = colorOverrideStyle(block.colors);
  const customButtonStyle = hasCustomColors
    ? { backgroundColor: "var(--site-accent)", color: "#ffffff" }
    : undefined;
  const sliderImages = (block.media_urls ?? []).filter(Boolean);
  const embedUrl = videoEmbedUrl(block.video_url);
  const mediaSize = block.media_size ?? "wide";
  const mediaFrame = block.media_frame ?? "line";
  const contentWidth = block.content_width ?? "wide";
  const paddingTop = block.padding_top ?? "normal";
  const paddingBottom = block.padding_bottom ?? "normal";
  const sectionHeight = block.section_height ?? "auto";
  const animation = block.animation ?? "none";
  const mediaStyle = publicSiteCustomBlockMediaStyle(block);
  const mediaVariables = publicSiteMediaVariables(block);
  const composition = resolvePublicSiteBlockComposition(block);
  const compositionStyle = publicSiteBlockCompositionStyle(block);
  const compositionAttributes = composition.enabled
    ? {
        "data-os-composition": "enabled" as const,
        "data-os-composition-layout": composition.layout,
        "data-os-composition-mobile-layout": composition.mobileLayout,
        "data-os-composition-kind": block.kind,
        "data-os-composition-card-layout": composition.cardLayout,
        "data-os-composition-mobile-card-layout": composition.mobileCardLayout,
      }
    : {};
  const itemStyle = (element: Parameters<typeof publicSiteCompositionItemStyle>[1]) =>
    publicSiteCompositionItemStyle(block, element);
  const sectionClass = `flex items-center px-5 ${paddingTopClass[paddingTop]} ${paddingBottomClass[paddingBottom]} ${sectionHeightClass[sectionHeight]} ${style}`;

  if (block.kind === "collage") {
    const collageImages = (block.media_urls ?? []).filter(Boolean).slice(0, 8);
    const alignClass =
      block.media_position === "left"
        ? "mr-auto"
        : block.media_position === "right"
          ? "ml-auto"
          : "mx-auto";

    return (
      <PublicReveal
        animation={animation}
        animateOnMobile={block.animate_on_mobile !== false}
        className={sectionClass}
        style={blockStyle}
      >
        <div
          className={`os-block-composition mx-auto w-full ${contentWidthClass[contentWidth]}`}
          style={compositionStyle}
          {...compositionAttributes}
        >
          {block.eyebrow ? (
            <p
              data-os-composition-slot="eyebrow"
              style={itemStyle("eyebrow")}
              className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${
                isDark || isAccent
                  ? "text-white/60"
                  : "text-[var(--site-accent)]"
              }`}
            >
              {block.eyebrow}
            </p>
          ) : null}
          {block.title ? (
            <h2 data-os-composition-slot="title" style={{ ...publicTypographyStyle(block.title_typography), ...itemStyle("title") }} className="mt-4 max-w-4xl font-serif text-4xl leading-tight sm:text-6xl">
              <PublicRichHeading value={block.title} />
            </h2>
          ) : null}
          {block.text ? (
            composition.enabled ? <div data-os-composition-slot="text" style={itemStyle("text")}><PublicRichText value={block.text} className="mt-7 max-w-3xl text-base leading-8 opacity-70" /></div> : <PublicRichText value={block.text} className="mt-7 max-w-3xl text-base leading-8 opacity-70" />
          ) : null}

          <div
            data-os-composition-slot="media"
            className={`${alignClass} mt-10 ${mediaSizeClass[mediaSize]} ${
              mediaFrameClass[mediaFrame]
            }`}
            style={{ ...mediaStyle, ...itemStyle("media") }}
          >
            {collageImages.length ? (
              <div
                data-os-media-columns={block.media_columns ?? 4}
                data-os-media-mobile-columns={block.media_mobile_columns ?? 2}
                className={`os-managed-media-grid overflow-hidden ${
                  mediaFrame === "none" ? "" : "rounded-2xl"
                }`}
              >
                {collageImages.map((image, index) => {
                  const isLead = index === 0 && collageImages.length >= 3;
                  return (
                    <div
                      key={`${block.id}-collage-${index}`}
                      className={`os-managed-media-surface relative aspect-square bg-black/10 ${isLead ? "os-managed-media-lead col-span-2 row-span-2" : ""}`}
                    >
                      <Image
                        src={image}
                        alt={`${richTextPlainText(block.title) || "Коллаж"} — фото ${index + 1}`}
                        fill
                        unoptimized
                        sizes={
                          isLead
                            ? "(max-width: 640px) 100vw, 50vw"
                            : "(max-width: 640px) 50vw, 25vw"
                        }
                        className="os-managed-media"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid min-h-64 place-items-center rounded-2xl bg-black/10 text-sm opacity-45">
                Добавьте фотографии в коллаж
              </div>
            )}
          </div>
        </div>
      </PublicReveal>
    );
  }

  if (block.kind === "media_text") {
    const mediaIsVideo = block.media_type === "video";
    const mediaIsCalendar = block.media_type === "calendar";
    const mediaOnRight = block.media_position !== "left";

    return (
      <PublicReveal
        animation={animation}
        animateOnMobile={block.animate_on_mobile !== false}
        className={sectionClass}
        style={blockStyle}
      >
        <div
          className={`os-block-composition mx-auto grid w-full ${contentWidthClass[contentWidth]} gap-10 lg:grid-cols-2 lg:items-center lg:gap-16`}
          style={{ ...mediaVariables, ...compositionStyle }}
          data-os-media-mobile-position={block.media_mobile_position ?? "after"}
          data-os-composition-media-position={mediaOnRight ? "right" : "left"}
          data-os-composition-mobile-media-position={block.media_mobile_position ?? "after"}
          {...compositionAttributes}
        >
          <div data-os-media-slot data-os-composition-slot="media" className={mediaOnRight ? "lg:order-2" : "lg:order-1"}>
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
                style={mediaStyle}
              >
                <div
                  className={`os-managed-media-frame relative bg-black/10 ${
                    mediaFrame === "none" ? "" : "rounded-xl"
                  }`}
                >
                  {mediaIsVideo && block.video_url ? (
                  embedUrl ? (
                    <iframe
                      title={block.media_alt || richTextPlainText(block.title)}
                      src={embedUrl}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="os-managed-media h-full w-full border-0"
                    />
                  ) : (
                    <video
                      src={block.video_url}
                      poster={block.video_poster_url || undefined}
                      controls
                      preload="metadata"
                      className="os-managed-media h-full w-full"
                    />
                  )
                  ) : block.media_url ? (
                    <Image
                      src={block.media_url}
                      alt={block.media_alt || richTextPlainText(block.title)}
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      loading="lazy"
                      className="os-managed-media"
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
          <div
            data-os-media-body
            className={`os-composition-sequence ${mediaOnRight ? "lg:order-1" : "lg:order-2"}`}
            data-os-composition={composition.enabled ? "enabled" : undefined}
          >
            {block.eyebrow ? (
              <p
                data-os-composition-slot="eyebrow"
                style={itemStyle("eyebrow")}
                className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${
                  isDark || isAccent
                    ? "text-white/60"
                    : "text-[var(--site-accent)]"
                }`}
              >
                {block.eyebrow}
              </p>
            ) : null}
            <h2 data-os-composition-slot="title" style={{ ...publicTypographyStyle(block.title_typography), ...itemStyle("title") }} className="mt-4 font-serif text-4xl leading-tight sm:text-6xl">
              <PublicRichHeading value={block.title} />
            </h2>
            {block.text ? (
              composition.enabled ? <div data-os-composition-slot="text" style={itemStyle("text")}><PublicRichText value={block.text} className="mt-7 text-base leading-8 opacity-70" /></div> : <PublicRichText value={block.text} className="mt-7 text-base leading-8 opacity-70" />
            ) : null}
            {block.button_label && block.button_url ? (
              <Link
                data-os-composition-slot="action"
                href={safePublicActionHref(block.button_url, "#contact")}
                className={`mt-8 inline-flex min-h-12 items-center rounded-lg px-6 text-sm font-semibold ${
                  hasCustomColors
                    ? ""
                    : isDark || isAccent
                      ? "bg-white text-[var(--site-dark)]"
                      : "bg-[var(--site-dark)] text-white"
                }`}
                style={{ ...customButtonStyle, ...itemStyle("action") }}
              >
                {block.button_label}
                <span className="ml-8" aria-hidden="true">
                  →
                </span>
              </Link>
            ) : null}
          </div>
        </div>
      </PublicReveal>
    );
  }

  return (
    <PublicReveal
      animation={animation}
      animateOnMobile={block.animate_on_mobile !== false}
      className={sectionClass}
      style={blockStyle}
    >
      <div
        className={`os-block-composition mx-auto w-full ${contentWidthClass[contentWidth]}`}
        style={compositionStyle}
        {...compositionAttributes}
      >
        {block.eyebrow ? (
          <p
            data-os-composition-slot="eyebrow"
            style={itemStyle("eyebrow")}
            className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${
              isDark || isAccent ? "text-white/60" : "text-[var(--site-accent)]"
            }`}
          >
            {block.eyebrow}
          </p>
        ) : null}
        <h2 data-os-composition-slot="title" style={{ ...publicTypographyStyle(block.title_typography), ...itemStyle("title") }} className="mt-4 max-w-4xl font-serif text-4xl leading-tight sm:text-6xl">
          <PublicRichHeading value={block.title} />
        </h2>

        {composition.enabled && block.kind === "columns" && block.text ? (
          <div data-os-composition-slot="text" style={itemStyle("text")}>
            <PublicRichText value={block.text} className="mt-7 max-w-3xl text-base leading-8 opacity-70" />
          </div>
        ) : null}

        {block.kind === "features" || block.kind === "columns" ? (
          <div
            data-os-composition-slot="cards"
            style={itemStyle("cards")}
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
                    data-os-composition-card
                    data-os-composition-has-media={card?.media_type === "image" || card?.media_type === "video" ? "true" : "false"}
                    className={`overflow-hidden rounded-2xl border ${
                      hasCustomColors || isDark || isAccent
                        ? "border-white/18 bg-white/8"
                        : "border-black/8 bg-white"
                    }`}
                  >
                    {card?.media_type === "image" && card.media_url ? (
                      <div data-os-composition-card-media className="os-managed-media-surface relative aspect-[4/3] bg-black/8" style={mediaVariables}>
                        <Image
                          src={card.media_url}
                          alt={card.media_alt || card.title}
                          fill
                          unoptimized
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="os-managed-media"
                        />
                      </div>
                    ) : null}
                    {card?.media_type === "video" && card.video_url ? (
                      <div data-os-composition-card-media className="aspect-video overflow-hidden bg-black">
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
                        <PublicRichText value={detail} className="mt-2 text-sm leading-6 opacity-65" />
                      ) : null}
                    </div>
                  </article>
                );
              })}
          </div>
        ) : block.kind !== "slider" && block.kind !== "video" ? (
          composition.enabled ? <div data-os-composition-slot="text" style={itemStyle("text")}><PublicRichText value={block.text} className="mt-7 max-w-3xl text-base leading-8 opacity-70" /></div> : <PublicRichText value={block.text} className="mt-7 max-w-3xl text-base leading-8 opacity-70" />
        ) : block.text ? (
          composition.enabled ? <div data-os-composition-slot="text" style={itemStyle("text")}><PublicRichText value={block.text} className="mt-7 max-w-3xl text-base leading-8 opacity-70" /></div> : <PublicRichText value={block.text} className="mt-7 max-w-3xl text-base leading-8 opacity-70" />
        ) : null}

        {block.kind === "slider" ? (
          composition.enabled ? <div data-os-composition-slot="media" style={itemStyle("media")}><PublicSliderBlock images={sliderImages} intervalSeconds={block.slide_interval_seconds ?? 4} title={richTextPlainText(block.title)} media={block} /></div> : <PublicSliderBlock images={sliderImages} intervalSeconds={block.slide_interval_seconds ?? 4} title={richTextPlainText(block.title)} media={block} />
        ) : null}

        {block.kind === "video" && block.video_url ? (
          <div
            data-os-composition-slot="media"
            className={`mx-auto mt-10 ${mediaSizeClass[mediaSize]} ${
              mediaFrameClass[mediaFrame]
            }`}
            style={{ ...mediaStyle, ...itemStyle("media") }}
          >
            <div
              className={`os-managed-media-frame bg-black ${
                mediaFrame === "none" ? "" : "rounded-xl"
              }`}
            >
              {embedUrl ? (
                <iframe
                  title={richTextPlainText(block.title)}
                  src={embedUrl}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="os-managed-media h-full w-full border-0"
                />
              ) : (
                <video
                  src={block.video_url}
                  poster={block.video_poster_url || undefined}
                  controls
                  preload="metadata"
                  className="os-managed-media h-full w-full"
                />
              )}
            </div>
          </div>
        ) : null}

        {block.kind === "cta" && block.button_label && block.button_url ? (
          <Link
            data-os-composition-slot="action"
            href={safePublicActionHref(block.button_url, "#contact")}
            className={`mt-8 inline-flex min-h-12 items-center rounded-lg px-6 text-sm font-semibold ${
              hasCustomColors
                ? ""
                : isDark || isAccent
                  ? "bg-white text-[var(--site-dark)]"
                  : "bg-[var(--site-dark)] text-white"
            }`}
            style={{ ...customButtonStyle, ...itemStyle("action") }}
          >
            {block.button_label}
            <span className="ml-8" aria-hidden="true">
              →
            </span>
          </Link>
        ) : null}
      </div>
    </PublicReveal>
  );
}
