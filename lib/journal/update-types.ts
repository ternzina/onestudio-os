import type { BlogPreviewId } from "../../components/blog-previews/blog-preview-registry";

export type JournalUpdateTone =
  | "aqua" | "blue" | "coral" | "gold" | "green" | "indigo"
  | "ink" | "lavender" | "lime" | "mint" | "night" | "peach"
  | "rose" | "sand" | "slate" | "steel" | "violet" | "yellow";

/** A product-history note with a live component preview, not an SEO article. */
export type JournalUpdate = {
  readonly id: string;
  readonly componentId: BlogPreviewId;
  readonly title: string;
  readonly publishedAt: string;
  /** Preserve the original display date, including the historical locale fallback. */
  readonly date: string;
  readonly category: string;
  readonly excerpt: string;
  readonly tone?: JournalUpdateTone;
  readonly href?: string;
};
