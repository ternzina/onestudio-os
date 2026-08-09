import type { CSSProperties } from "react";
import type { PublicSiteCustomBlock } from "./types";

export const blockContentWidth = { full: "100%", wide: "1312px", medium: "980px", narrow: "760px" } as const;
export const blockSpacing = { none: "0px", compact: "48px", normal: "clamp(86px, 10vw, 150px)", airy: "clamp(120px, 13vw, 190px)" } as const;
export const blockSectionHeight = { auto: undefined, compact: "320px", medium: "480px", tall: "640px", screen: "85vh" } as const;
export const blockMediaWidth = { full: "100%", wide: "100%", medium: "760px", compact: "520px" } as const;
export const blockMediaAspect = { landscape: "16 / 9", classic: "4 / 3", square: "1 / 1", portrait: "4 / 5" } as const;
export const blockMediaHeight = { auto: undefined, compact: "288px", medium: "420px", tall: "560px" } as const;
export const blockMediaFit = { cover: "cover", contain: "contain" } as const;

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

export function publicSiteCustomBlockMediaStyle(block: PublicSiteCustomBlock): CSSProperties & Record<"--premium-media-fit", string> {
  const height = blockMediaHeight[block.media_height ?? "auto"];
  return {
    maxWidth: blockMediaWidth[block.media_size ?? "wide"],
    "--premium-media-fit": blockMediaFit[block.media_fit ?? "cover"],
    ...(height ? { height } : { aspectRatio: blockMediaAspect[block.media_aspect ?? "landscape"] }),
  };
}
