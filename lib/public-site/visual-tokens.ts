import type { CSSProperties } from "react";
import type {
  PublicSiteCustomBlock,
  PublicSiteMediaLayoutSettings,
} from "./types";

export const blockContentWidth = { full: "100%", wide: "1312px", medium: "980px", narrow: "760px" } as const;
export const blockSpacing = { none: "0px", compact: "48px", normal: "clamp(86px, 10vw, 150px)", airy: "clamp(120px, 13vw, 190px)" } as const;
export const blockSectionHeight = { auto: undefined, compact: "320px", medium: "480px", tall: "640px", screen: "85vh" } as const;
export const blockMediaWidth = { full: "100%", wide: "100%", medium: "760px", compact: "520px" } as const;
export const blockComposedMediaWidth = { full: "100%", wide: "88%", medium: "72%", compact: "56%" } as const;
export const blockMediaAspect = { landscape: "16 / 9", classic: "4 / 3", square: "1 / 1", portrait: "4 / 5" } as const;
export const blockMediaHeight = { auto: undefined, compact: "288px", medium: "420px", tall: "560px" } as const;
export const blockMediaFit = { cover: "cover", contain: "contain" } as const;
export const blockMediaRadius = { none: "0px", soft: "12px", rounded: "28px", pill: "999px" } as const;
export const blockMediaGap = { none: "0px", compact: "8px", normal: "16px", airy: "32px" } as const;

type MediaVariables = CSSProperties & {
  "--os-media-fit": string;
  "--os-media-mobile-fit": string;
  "--os-media-position": string;
  "--os-media-mobile-position": string;
  "--os-media-opacity": string;
  "--os-media-overlay-opacity": string;
  "--os-media-radius": string;
  "--os-media-gap": string;
  "--os-media-columns": string;
  "--os-media-mobile-columns": string;
  "--os-media-height": string;
  "--os-media-mobile-height": string;
  "--os-media-aspect": string;
  "--os-media-mobile-aspect": string;
};

const percent = (value: number | undefined, fallback = 50) =>
  Math.min(100, Math.max(0, Number.isFinite(value) ? Number(value) : fallback));

const opacity = (value: number | undefined, fallback: number) =>
  Math.min(100, Math.max(0, Number.isFinite(value) ? Number(value) : fallback)) / 100;

/** Responsive CSS variables consumed by every canonical public media renderer. */
export function publicSiteMediaVariables(settings: PublicSiteMediaLayoutSettings): MediaVariables {
  const aspect = settings.media_aspect ?? "landscape";
  const mobileAspect = settings.media_mobile_aspect ?? aspect;
  const height = settings.media_height ?? "auto";
  const mobileHeight = settings.media_mobile_height ?? height;
  const fit = settings.media_fit ?? "cover";
  const mobileFit = settings.media_mobile_fit ?? fit;
  return {
    "--os-media-fit": blockMediaFit[fit],
    "--os-media-mobile-fit": blockMediaFit[mobileFit],
    "--os-media-position": `${percent(settings.media_focal_x)}% ${percent(settings.media_focal_y)}%`,
    "--os-media-mobile-position": `${percent(settings.media_mobile_focal_x, percent(settings.media_focal_x))}% ${percent(settings.media_mobile_focal_y, percent(settings.media_focal_y))}%`,
    "--os-media-opacity": String(opacity(settings.media_opacity, 100)),
    "--os-media-overlay-opacity": String(opacity(settings.media_overlay, 0)),
    "--os-media-radius": blockMediaRadius[settings.media_radius ?? (settings.media_frame === "none" ? "none" : "soft")],
    "--os-media-gap": blockMediaGap[settings.media_gap ?? "normal"],
    "--os-media-columns": String(settings.media_columns ?? 4),
    "--os-media-mobile-columns": String(settings.media_mobile_columns ?? 2),
    "--os-media-height": height === "auto" ? "auto" : blockMediaHeight[height]!,
    "--os-media-mobile-height": mobileHeight === "auto" ? "auto" : blockMediaHeight[mobileHeight]!,
    "--os-media-aspect": height === "auto" ? blockMediaAspect[aspect] : "auto",
    "--os-media-mobile-aspect": mobileHeight === "auto" ? blockMediaAspect[mobileAspect] : "auto",
  };
}

export function publicSiteCustomBlockVisualStyle(block: PublicSiteCustomBlock): CSSProperties {
  return {
    paddingTop: blockSpacing[block.padding_top ?? "normal"],
    paddingBottom: blockSpacing[block.padding_bottom ?? "normal"],
    minHeight: blockSectionHeight[block.section_height ?? "auto"],
  };
}

export function publicSiteCustomBlockContentStyle(block: PublicSiteCustomBlock): CSSProperties {
  return { maxWidth: blockContentWidth[block.content_width ?? "wide"] };
}

export function publicSiteCustomBlockMediaStyle(block: PublicSiteCustomBlock): MediaVariables {
  return publicSiteMediaContainerStyle(block);
}

/**
 * Keeps legacy media geometry intact while making all four size choices
 * visibly distinct inside an explicitly enabled 3.0 composition.
 */
export function publicSiteMediaContainerStyle(
  settings: PublicSiteMediaLayoutSettings & { composition_enabled?: boolean },
): MediaVariables {
  const size = settings.media_size ?? "wide";
  return {
    width: settings.composition_enabled === true ? blockComposedMediaWidth[size] : undefined,
    maxWidth: blockMediaWidth[size],
    ...publicSiteMediaVariables(settings),
  };
}
