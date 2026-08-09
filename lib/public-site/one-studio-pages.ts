import { createPublicSiteCustomBlock } from "./custom-block-registry.ts";
import type { PublicSiteContent, PublicSitePage } from "./types.ts";

export const ONESTUDIO_HOME_PAGE_ID = "home" as const;

export type OneStudioPageSelection =
  | { id: typeof ONESTUDIO_HOME_PAGE_ID; kind: "home"; page: null }
  | { id: string; kind: "page"; page: PublicSitePage };

export function normalizeOneStudioPageSlug(value: string, fallback = "page") {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0400-\u04ff]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || fallback;
}

export function oneStudioPages(content: Pick<PublicSiteContent, "pages">) {
  return content.pages ?? [];
}

export function selectOneStudioPage(
  content: Pick<PublicSiteContent, "pages">,
  selectedId: string,
): OneStudioPageSelection {
  if (selectedId === ONESTUDIO_HOME_PAGE_ID) {
    return { id: ONESTUDIO_HOME_PAGE_ID, kind: "home", page: null };
  }
  const page = oneStudioPages(content).find((candidate) => candidate.id === selectedId);
  return page
    ? { id: page.id, kind: "page", page }
    : { id: ONESTUDIO_HOME_PAGE_ID, kind: "home", page: null };
}

export function createOneStudioPage(
  content: Pick<PublicSiteContent, "pages">,
  createId: () => string = () => `custom-${crypto.randomUUID()}`,
): PublicSitePage {
  const pages = oneStudioPages(content);
  const number = pages.filter((page) => page.type === "custom").length + 1;
  const used = new Set(pages.map((page) => normalizeOneStudioPageSlug(page.slug)));
  const base = `page-${number}`;
  let slug = base;
  let suffix = number;
  while (used.has(slug)) slug = `${base}-${++suffix}`;
  return {
    id: createId(),
    type: "custom",
    slug,
    nav_label: `Страница ${number}`,
    eyebrow: "ONESTUDIO · PAGE",
    title: "Заголовок новой страницы",
    intro: "Добавьте описание страницы и соберите её из произвольных блоков.",
    is_visible: true,
    show_in_navigation: true,
    show_booking_cta: true,
    seo_title: "",
    seo_description: "",
    seo_image_url: "",
    seo_no_index: false,
    blocks: [createPublicSiteCustomBlock("text", `${slug}-block-1`)],
  };
}

export function addOneStudioPage(content: PublicSiteContent, page: PublicSitePage) {
  return { ...content, pages: [...oneStudioPages(content), page] };
}

export function updateOneStudioPage(
  content: PublicSiteContent,
  pageId: string,
  patch: Partial<PublicSitePage>,
) {
  const normalizedPatch = patch.slug === undefined
    ? patch
    : { ...patch, slug: normalizeOneStudioPageSlug(patch.slug) };
  return {
    ...content,
    pages: oneStudioPages(content).map((page) =>
      page.id === pageId ? { ...page, ...normalizedPatch } : page,
    ),
  };
}

export function removeOneStudioPage(content: PublicSiteContent, pageId: string) {
  return { ...content, pages: oneStudioPages(content).filter((page) => page.id !== pageId) };
}
