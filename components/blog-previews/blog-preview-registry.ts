import type { ComponentType } from "react";

type BlogPreviewComponent = ComponentType<Record<never, never>>;
type BlogPreviewModule = { default: BlogPreviewComponent };
type BlogPreviewLoader = () => Promise<BlogPreviewModule>;

export const blogPreviewIds = [
  "hero-7",
  "hero-12",
  "hero-18",
  "social-proof-4",
  "social-proof-8",
  "waitlist-1",
  "stats-7",
  "stats-3",
  "faq-3",
  "navbar-4",
  "card-1",
  "card-5",
  "showcase-5",
  "features-6",
  "cta-4",
  "list-4",
  "analytics-5",
  "hero-15",
  "hero-19",
  "hero-20",
  "hero-21",
  "navigation-7",
  "navigation-12",
  "social-proof-13",
  "comments-3",
  "stats-8",
  "stats-9",
  "faq-5",
  "faq-7",
  "pricing-4",
  "pricing-7",
  "waitlist-2",
  "card-7",
  "card-8",
  "cta-6",
  "cta-11",
  "footer-4",
  "forms-4",
  "features-9",
  "list-7",
  "how-it-works-4",
] as const;

export type BlogPreviewId = (typeof blogPreviewIds)[number];

export type BlogPreviewDefinition = {
  loader: BlogPreviewLoader;
  sourcePath: `components/blocks/${BlogPreviewId}.tsx`;
  interactionOnly: boolean;
};

const sourceLoader = (loader: () => Promise<unknown>): BlogPreviewLoader =>
  loader as BlogPreviewLoader;

/**
 * Intentional Blog subset of the editor's ready registry. Every loader points
 * at the canonical Pro block source; nothing is imported until the preview is
 * actually mounted.
 */
export const blogPreviewRegistry: Record<BlogPreviewId, BlogPreviewDefinition> = {
  "hero-7": {
    loader: sourceLoader(() => import("./source/hero-7")),
    sourcePath: "components/blocks/hero-7.tsx",
    interactionOnly: true,
  },
  "hero-12": {
    loader: sourceLoader(() => import("./source/hero-12")),
    sourcePath: "components/blocks/hero-12.tsx",
    interactionOnly: false,
  },
  "hero-18": {
    loader: sourceLoader(() => import("./source/hero-18")),
    sourcePath: "components/blocks/hero-18.tsx",
    interactionOnly: true,
  },
  "social-proof-4": {
    loader: sourceLoader(() => import("./source/social-proof-4")),
    sourcePath: "components/blocks/social-proof-4.tsx",
    interactionOnly: true,
  },
  "social-proof-8": {
    loader: sourceLoader(() => import("./source/social-proof-8")),
    sourcePath: "components/blocks/social-proof-8.tsx",
    interactionOnly: true,
  },
  "waitlist-1": {
    loader: sourceLoader(() => import("./source/waitlist-1")),
    sourcePath: "components/blocks/waitlist-1.tsx",
    interactionOnly: true,
  },
  "stats-7": {
    loader: sourceLoader(() => import("./source/stats-7")),
    sourcePath: "components/blocks/stats-7.tsx",
    interactionOnly: false,
  },
  "stats-3": {
    loader: sourceLoader(() => import("./source/stats-3")),
    sourcePath: "components/blocks/stats-3.tsx",
    interactionOnly: true,
  },
  "faq-3": {
    loader: sourceLoader(() => import("./source/faq-3")),
    sourcePath: "components/blocks/faq-3.tsx",
    interactionOnly: false,
  },
  "navbar-4": {
    loader: sourceLoader(() => import("./source/navbar-4")),
    sourcePath: "components/blocks/navbar-4.tsx",
    interactionOnly: false,
  },
  "card-1": {
    loader: sourceLoader(() => import("./source/card-1")),
    sourcePath: "components/blocks/card-1.tsx",
    interactionOnly: false,
  },
  "card-5": {
    loader: sourceLoader(() => import("./source/card-5")),
    sourcePath: "components/blocks/card-5.tsx",
    interactionOnly: false,
  },
  "showcase-5": {
    loader: sourceLoader(() => import("./source/showcase-5")),
    sourcePath: "components/blocks/showcase-5.tsx",
    interactionOnly: true,
  },
  "features-6": {
    loader: sourceLoader(() => import("./source/features-6")),
    sourcePath: "components/blocks/features-6.tsx",
    interactionOnly: false,
  },
  "cta-4": {
    loader: sourceLoader(() => import("./source/cta-4")),
    sourcePath: "components/blocks/cta-4.tsx",
    interactionOnly: true,
  },
  "list-4": {
    loader: sourceLoader(() => import("./source/list-4")),
    sourcePath: "components/blocks/list-4.tsx",
    interactionOnly: true,
  },
  "analytics-5": {
    loader: sourceLoader(() => import("./source/analytics-5")),
    sourcePath: "components/blocks/analytics-5.tsx",
    interactionOnly: true,
  },
  "hero-15": {
    loader: sourceLoader(() => import("./source/hero-15")),
    sourcePath: "components/blocks/hero-15.tsx",
    interactionOnly: false,
  },
  "hero-19": {
    loader: sourceLoader(() => import("./source/hero-19")),
    sourcePath: "components/blocks/hero-19.tsx",
    interactionOnly: true,
  },
  "hero-20": {
    loader: sourceLoader(() => import("./source/hero-20")),
    sourcePath: "components/blocks/hero-20.tsx",
    interactionOnly: false,
  },
  "hero-21": {
    loader: sourceLoader(() => import("./source/hero-21")),
    sourcePath: "components/blocks/hero-21.tsx",
    interactionOnly: true,
  },
  "navigation-7": {
    loader: sourceLoader(() => import("./source/navigation-7")),
    sourcePath: "components/blocks/navigation-7.tsx",
    interactionOnly: true,
  },
  "navigation-12": {
    loader: sourceLoader(() => import("./source/navigation-12")),
    sourcePath: "components/blocks/navigation-12.tsx",
    interactionOnly: true,
  },
  "social-proof-13": {
    loader: sourceLoader(() => import("./source/social-proof-13")),
    sourcePath: "components/blocks/social-proof-13.tsx",
    interactionOnly: false,
  },
  "comments-3": {
    loader: sourceLoader(() => import("./source/comments-3")),
    sourcePath: "components/blocks/comments-3.tsx",
    interactionOnly: true,
  },
  "stats-8": {
    loader: sourceLoader(() => import("./source/stats-8")),
    sourcePath: "components/blocks/stats-8.tsx",
    interactionOnly: false,
  },
  "stats-9": {
    loader: sourceLoader(() => import("./source/stats-9")),
    sourcePath: "components/blocks/stats-9.tsx",
    interactionOnly: true,
  },
  "faq-5": {
    loader: sourceLoader(() => import("./source/faq-5")),
    sourcePath: "components/blocks/faq-5.tsx",
    interactionOnly: true,
  },
  "faq-7": {
    loader: sourceLoader(() => import("./source/faq-7")),
    sourcePath: "components/blocks/faq-7.tsx",
    interactionOnly: true,
  },
  "pricing-4": {
    loader: sourceLoader(() => import("./source/pricing-4")),
    sourcePath: "components/blocks/pricing-4.tsx",
    interactionOnly: false,
  },
  "pricing-7": {
    loader: sourceLoader(() => import("./source/pricing-7")),
    sourcePath: "components/blocks/pricing-7.tsx",
    interactionOnly: true,
  },
  "waitlist-2": {
    loader: sourceLoader(() => import("./source/waitlist-2")),
    sourcePath: "components/blocks/waitlist-2.tsx",
    interactionOnly: true,
  },
  "card-7": {
    loader: sourceLoader(() => import("./source/card-7")),
    sourcePath: "components/blocks/card-7.tsx",
    interactionOnly: true,
  },
  "card-8": {
    loader: sourceLoader(() => import("./source/card-8")),
    sourcePath: "components/blocks/card-8.tsx",
    interactionOnly: true,
  },
  "cta-6": {
    loader: sourceLoader(() => import("./source/cta-6")),
    sourcePath: "components/blocks/cta-6.tsx",
    interactionOnly: false,
  },
  "cta-11": {
    loader: sourceLoader(() => import("./source/cta-11")),
    sourcePath: "components/blocks/cta-11.tsx",
    interactionOnly: true,
  },
  "footer-4": {
    loader: sourceLoader(() => import("./source/footer-4")),
    sourcePath: "components/blocks/footer-4.tsx",
    interactionOnly: false,
  },
  "forms-4": {
    loader: sourceLoader(() => import("./source/forms-4")),
    sourcePath: "components/blocks/forms-4.tsx",
    interactionOnly: true,
  },
  "features-9": {
    loader: sourceLoader(() => import("./source/features-9")),
    sourcePath: "components/blocks/features-9.tsx",
    interactionOnly: true,
  },
  "list-7": {
    loader: sourceLoader(() => import("./source/list-7")),
    sourcePath: "components/blocks/list-7.tsx",
    interactionOnly: true,
  },
  "how-it-works-4": {
    loader: sourceLoader(() => import("./source/how-it-works-4")),
    sourcePath: "components/blocks/how-it-works-4.tsx",
    interactionOnly: false,
  },
};

export type { BlogPreviewComponent };
