export type AdaptedNavigation13Link = {
  label: string;
  href?: string;
};

export type AdaptedNavigation13Props = {
  readonly links: readonly AdaptedNavigation13Link[];
  readonly brandName: string;
  readonly brandHref: string;
  readonly primaryActionLabel: string;
  readonly primaryActionHref: string;
  readonly contactEyebrow: string;
  readonly contactEmail: string;
  readonly secondaryActionLabel: string;
  readonly secondaryActionHref: string;
};

export const navigation13Defaults = {
  links: [
    { label: "Work", href: "#" },
    { label: "Studio", href: "#" },
    { label: "Services", href: "#" },
    { label: "Journal", href: "#" },
    { label: "Contact", href: "#" },
  ],
  brandName: "Northline",
  brandHref: "#",
  primaryActionLabel: "Start a project",
  primaryActionHref: "#",
  contactEyebrow: "New business",
  contactEmail: "hello@northline.studio",
  secondaryActionLabel: "Book a call",
  secondaryActionHref: "#",
} as const satisfies AdaptedNavigation13Props;
