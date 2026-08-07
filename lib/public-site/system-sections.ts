import type { CSSProperties } from "react";
import { sectionColorStyle } from "@/lib/public-site/colors";
import type {
  PublicSiteCanvasSection,
  PublicSiteContent,
  PublicSiteSystemSectionSettings,
} from "@/lib/public-site/types";
import { normalizeTypography, publicTypographyStyle } from "@/lib/public-site/typography";

const widthClass = {
  full: "max-w-none",
  wide: "max-w-[1240px]",
  medium: "max-w-[980px]",
  narrow: "max-w-[760px]",
} as const;

const deviceVisibilityClass = {
  "000": "",
  "001": "hidden sm:block",
  "010": "sm:hidden lg:block",
  "011": "hidden lg:block",
  "100": "lg:hidden",
  "101": "hidden sm:block lg:hidden",
  "110": "sm:hidden",
  "111": "hidden",
} as const;

export function publicSystemSectionSettings(
  content: PublicSiteContent,
  section: PublicSiteCanvasSection,
): Required<PublicSiteSystemSectionSettings> {
  const settings = content.system_section_settings?.[section] ?? {};
  const inferredBackgroundMode =
    content.section_colors?.[section]?.mode === "custom" ? "color" : "theme";

  return {
    layout: settings.layout === "panel" ? "panel" : "default",
    heading_font:
      settings.heading_font === "system" ||
      settings.heading_font === "humanist" ||
      settings.heading_font === "editorial"
        ? settings.heading_font
        : "template",
    heading_size:
      settings.heading_size === "24" ||
      settings.heading_size === "32" ||
      settings.heading_size === "40" ||
      settings.heading_size === "48" ||
      settings.heading_size === "56" ||
      settings.heading_size === "64" ||
      settings.heading_size === "72" ||
      settings.heading_size === "88" ||
      settings.heading_size === "104"
        ? settings.heading_size
        : "template",
    heading_weight:
      settings.heading_weight === "regular" ||
      settings.heading_weight === "medium" ||
      settings.heading_weight === "semibold" ||
      settings.heading_weight === "bold"
        ? settings.heading_weight
        : "template",
    heading_typography: normalizeTypography(settings.heading_typography),
    content_width:
      settings.content_width === "full" ||
      settings.content_width === "medium" ||
      settings.content_width === "narrow"
        ? settings.content_width
        : "wide",
    padding_top:
      settings.padding_top === "none" ||
      settings.padding_top === "compact" ||
      settings.padding_top === "airy"
        ? settings.padding_top
        : "normal",
    padding_bottom:
      settings.padding_bottom === "none" ||
      settings.padding_bottom === "compact" ||
      settings.padding_bottom === "airy"
        ? settings.padding_bottom
        : "normal",
    section_height:
      settings.section_height === "compact" ||
      settings.section_height === "medium" ||
      settings.section_height === "tall" ||
      settings.section_height === "screen"
        ? settings.section_height
        : "auto",
    text_align:
      settings.text_align === "center" || settings.text_align === "right"
        ? settings.text_align
        : "left",
    background_mode:
      settings.background_mode === "color" ||
      settings.background_mode === "image" ||
      settings.background_mode === "transparent"
        ? settings.background_mode
        : inferredBackgroundMode,
    background_image_url: settings.background_image_url ?? "",
    background_position:
      settings.background_position === "top" ||
      settings.background_position === "bottom"
        ? settings.background_position
        : "center",
    background_overlay:
      settings.background_overlay === "none" ||
      settings.background_overlay === "strong"
        ? settings.background_overlay
        : "soft",
    animation:
      settings.animation === "fade" ||
      settings.animation === "rise" ||
      settings.animation === "scale"
        ? settings.animation
        : "none",
    animate_on_mobile: settings.animate_on_mobile !== false,
    hide_on_desktop: settings.hide_on_desktop === true,
    hide_on_tablet: settings.hide_on_tablet === true,
    hide_on_mobile: settings.hide_on_mobile === true,
  };
}

export function publicSystemSectionHeadingClass(
  content: PublicSiteContent,
  section: PublicSiteCanvasSection,
  baseClass = "",
) {
  return ["os-section-heading-direct", baseClass]
    .filter(Boolean)
    .join(" ");
}

export function publicSystemSectionHeadingStyle(content: PublicSiteContent, section: PublicSiteCanvasSection) {
  const settings = publicSystemSectionSettings(content, section);
  const legacyWeight = settings.heading_weight === "regular"
    ? 400
    : settings.heading_weight === "medium"
      ? 500
      : settings.heading_weight === "semibold"
        ? 600
        : settings.heading_weight === "bold"
          ? 700
          : undefined;
  const legacy = publicTypographyStyle({
    font_family: settings.heading_font,
    font_size: settings.heading_size === "template" ? undefined : Number(settings.heading_size),
    font_weight: legacyWeight,
  });
  return { ...legacy, ...publicTypographyStyle(settings.heading_typography) };
}

export function publicSystemSectionClass(
  content: PublicSiteContent,
  section: PublicSiteCanvasSection,
  baseClass = "",
  includeDeviceVisibility = true,
) {
  const settings = publicSystemSectionSettings(content, section);
  const rawSettings = content.system_section_settings?.[section] ?? {};
  const visibilityKey = `${settings.hide_on_desktop ? 1 : 0}${settings.hide_on_tablet ? 1 : 0}${settings.hide_on_mobile ? 1 : 0}` as keyof typeof deviceVisibilityClass;
  const alignment = !rawSettings.text_align
    ? ""
    : settings.text_align === "center"
      ? "os-system-section-center text-center"
      : settings.text_align === "right"
        ? "os-system-section-right text-right"
        : "text-left";

  return [
    "os-system-section relative isolate px-5",
    baseClass,
    includeDeviceVisibility ? deviceVisibilityClass[visibilityKey] : "",
    alignment,
  ]
    .filter(Boolean)
    .join(" ");
}

export function publicSystemSectionContentClass(
  content: PublicSiteContent,
  section: PublicSiteCanvasSection,
  baseClass = "",
) {
  const settings = publicSystemSectionSettings(content, section);
  return [
    "os-system-section-content mx-auto w-full",
    widthClass[settings.content_width],
    settings.layout === "panel" ? "os-system-section-panel" : "",
    baseClass,
  ]
    .filter(Boolean)
    .join(" ");
}

export function publicSystemSectionStyle(
  content: PublicSiteContent,
  section: PublicSiteCanvasSection,
  baseStyle: CSSProperties = {},
): CSSProperties {
  const settings = publicSystemSectionSettings(content, section);
  const rawSettings = content.system_section_settings?.[section] ?? {};
  const colorStyle = sectionColorStyle(content, section);
  const layoutStyle: CSSProperties = {
    ...(rawSettings.padding_top
      ? { paddingTop: {
          none: "0px",
          compact: "3rem",
          normal: "6rem",
          airy: "8rem",
        }[settings.padding_top] }
      : {}),
    ...(rawSettings.padding_bottom
      ? { paddingBottom: {
          none: "0px",
          compact: "3rem",
          normal: "6rem",
          airy: "8rem",
        }[settings.padding_bottom] }
      : {}),
    ...(rawSettings.section_height
      ? {
          minHeight: {
            auto: undefined,
            compact: "320px",
            medium: "520px",
            tall: "720px",
            screen: "100vh",
          }[settings.section_height],
        }
      : {}),
  };
  if (settings.background_mode === "transparent") {
    return {
      ...baseStyle,
      ...layoutStyle,
      ...colorStyle,
      backgroundColor: "transparent",
      backgroundImage: "none",
    };
  }

  if (settings.background_mode === "image" && settings.background_image_url) {
    const overlay =
      settings.background_overlay === "strong"
        ? "rgba(10, 10, 14, 0.62)"
        : settings.background_overlay === "none"
          ? "rgba(0, 0, 0, 0)"
          : "rgba(10, 10, 14, 0.32)";
    const escapedUrl = settings.background_image_url.replace(/["\\]/g, "\\$&");
    return {
      ...baseStyle,
      ...layoutStyle,
      ...colorStyle,
      backgroundImage: `linear-gradient(${overlay}, ${overlay}), url("${escapedUrl}")`,
      backgroundPosition: settings.background_position,
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
    };
  }

  return {
    ...baseStyle,
    ...layoutStyle,
    ...(settings.background_mode === "color" ? colorStyle : {}),
  };
}

export function publicSystemSectionAnimation(
  content: PublicSiteContent,
  section: PublicSiteCanvasSection,
) {
  const settings = publicSystemSectionSettings(content, section);
  return {
    animation: settings.animation,
    animateOnMobile: settings.animate_on_mobile,
  };
}

export function publicSystemSectionVisibleOnDevice(
  content: PublicSiteContent,
  section: PublicSiteCanvasSection,
  device: "desktop" | "tablet" | "mobile",
) {
  const settings = publicSystemSectionSettings(content, section);
  if (device === "desktop") return !settings.hide_on_desktop;
  if (device === "tablet") return !settings.hide_on_tablet;
  return !settings.hide_on_mobile;
}
