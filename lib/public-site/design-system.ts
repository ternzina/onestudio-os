import type { PublicSiteContent, PublicSiteDesignSystem } from "@/lib/public-site/types";

const fontClass = {
  system: "system",
  humanist: "humanist",
  editorial: "editorial",
} as const;

const headingWeightClass = {
  regular: "regular",
  medium: "medium",
  semibold: "semibold",
  bold: "bold",
} as const;

const headingTrackingClass = {
  tight: "tight",
  normal: "normal",
  wide: "wide",
} as const;

const buttonRadiusClass = {
  square: "square",
  soft: "soft",
  rounded: "rounded",
  pill: "pill",
} as const;

const elevationClass = {
  none: "none",
  soft: "soft",
  strong: "strong",
} as const;

const cardRadiusClass = {
  square: "square",
  soft: "soft",
  rounded: "rounded",
} as const;

const cardBorderClass = {
  none: "none",
  subtle: "subtle",
  strong: "strong",
} as const;

export function publicSiteDesignSystem(content: PublicSiteContent): PublicSiteDesignSystem {
  return content.design_system ?? {};
}

export function publicSiteDesignClass(content: PublicSiteContent, baseClass = "") {
  const design = publicSiteDesignSystem(content);
  const classes = ["os-site-design", baseClass];

  const bodyFont = design.typography?.body_font;
  if (bodyFont && bodyFont !== "template" && bodyFont in fontClass) {
    classes.push(`os-design-body-${fontClass[bodyFont as keyof typeof fontClass]}`);
  }

  const headingFont = design.typography?.heading_font;
  if (headingFont && headingFont !== "template" && headingFont in fontClass) {
    classes.push(`os-design-heading-${fontClass[headingFont as keyof typeof fontClass]}`);
  }

  const headingWeight = design.typography?.heading_weight;
  if (
    headingWeight &&
    headingWeight !== "template" &&
    headingWeight in headingWeightClass
  ) {
    classes.push(
      `os-design-heading-weight-${headingWeightClass[headingWeight as keyof typeof headingWeightClass]}`,
    );
  }

  const headingTracking = design.typography?.heading_tracking;
  if (
    headingTracking &&
    headingTracking !== "template" &&
    headingTracking in headingTrackingClass
  ) {
    classes.push(
      `os-design-heading-tracking-${headingTrackingClass[headingTracking as keyof typeof headingTrackingClass]}`,
    );
  }

  const buttonRadius = design.buttons?.radius;
  if (buttonRadius && buttonRadius !== "template" && buttonRadius in buttonRadiusClass) {
    classes.push(
      `os-design-button-radius-${buttonRadiusClass[buttonRadius as keyof typeof buttonRadiusClass]}`,
    );
  }

  const buttonShadow = design.buttons?.shadow;
  if (buttonShadow && buttonShadow !== "template" && buttonShadow in elevationClass) {
    classes.push(
      `os-design-button-shadow-${elevationClass[buttonShadow as keyof typeof elevationClass]}`,
    );
  }

  const cardRadius = design.cards?.radius;
  if (cardRadius && cardRadius !== "template" && cardRadius in cardRadiusClass) {
    classes.push(
      `os-design-card-radius-${cardRadiusClass[cardRadius as keyof typeof cardRadiusClass]}`,
    );
  }

  const cardBorder = design.cards?.border;
  if (cardBorder && cardBorder !== "template" && cardBorder in cardBorderClass) {
    classes.push(
      `os-design-card-border-${cardBorderClass[cardBorder as keyof typeof cardBorderClass]}`,
    );
  }

  const cardShadow = design.cards?.shadow;
  if (cardShadow && cardShadow !== "template" && cardShadow in elevationClass) {
    classes.push(
      `os-design-card-shadow-${elevationClass[cardShadow as keyof typeof elevationClass]}`,
    );
  }

  return classes.filter(Boolean).join(" ");
}
