import Image from "next/image";
import type { CSSProperties } from "react";
import type { PremiumKidsNativeMedia } from "@/lib/public-site/premium-kids-native-media";
import { hasPremiumKidsNativeMediaLayout } from "@/lib/public-site/premium-kids-native-media";
import styles from "./Platform.module.css";

/* eslint-disable @next/next/no-img-element */

type MediaStyle = CSSProperties & {
  "--bembi-media-fit"?: string;
  "--bembi-media-mobile-fit"?: string;
  "--bembi-media-position"?: string;
  "--bembi-media-mobile-position"?: string;
  "--bembi-default-position"?: string;
  "--bembi-media-opacity"?: string;
  "--bembi-media-scale"?: string;
};

const scale = { full: "1.12", wide: "1", medium: ".88", compact: ".76" } as const;
const percent = (value: number | undefined, fallback = 50) => Math.min(100, Math.max(0, Number.isFinite(value) ? Number(value) : fallback));

function mediaStyle(media: PremiumKidsNativeMedia | undefined): MediaStyle | undefined {
  if (!hasPremiumKidsNativeMediaLayout(media) || !media) return undefined;
  const style: MediaStyle = {};
  if (media.media_fit) style["--bembi-media-fit"] = media.media_fit;
  if (media.media_mobile_fit) style["--bembi-media-mobile-fit"] = media.media_mobile_fit;
  if (media.media_focal_x !== undefined || media.media_focal_y !== undefined) style["--bembi-media-position"] = `${percent(media.media_focal_x)}% ${percent(media.media_focal_y)}%`;
  if (media.media_mobile_focal_x !== undefined || media.media_mobile_focal_y !== undefined) style["--bembi-media-mobile-position"] = `${percent(media.media_mobile_focal_x, percent(media.media_focal_x))}% ${percent(media.media_mobile_focal_y, percent(media.media_focal_y))}%`;
  if (media.media_opacity !== undefined) style["--bembi-media-opacity"] = String(percent(media.media_opacity, 100) / 100);
  if (media.media_size) style["--bembi-media-scale"] = scale[media.media_size];
  return style;
}

export default function BembiTemplateImage({ src, alt, sizes, priority = false, media, defaultPosition }: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  media?: PremiumKidsNativeMedia;
  defaultPosition?: string;
}) {
  const managed = hasPremiumKidsNativeMediaLayout(media);
  const className = `${styles.templateImage}${managed ? ` ${styles.templateImageManaged}` : ""}`;
  const style = { ...(defaultPosition ? { objectPosition: defaultPosition, "--bembi-default-position": defaultPosition } : {}), ...mediaStyle(media) } as MediaStyle;
  return src.startsWith("/")
    ? <Image className={className} src={src} alt={alt} fill sizes={sizes} priority={priority} style={style} />
    : <img className={className} src={src} alt={alt} loading={priority ? "eager" : "lazy"} style={style} />;
}
