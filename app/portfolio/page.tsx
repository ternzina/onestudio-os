import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LanguageProvider } from "../../lib/language-provider";
import { supabase } from "@/lib/supabase";
import PortfolioGalleryClient, { type PortfolioCategory } from "./PortfolioGalleryClient";
import PortfolioProjectsClient, {
  type PortfolioProjectCard,
  type PortfolioProjectCategory,
  type PortfolioVideoCard,
} from "./PortfolioProjectsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DbCategory = {
  id: string;
  name_uk: string;
  name_pl: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

type MediaItem = {
  id: string;
  image_url: string;
  r2_key: string;
  original_filename: string | null;
  mime_type: string | null;
  alt_uk: string | null;
  alt_pl: string | null;
  is_active: boolean;
  created_at: string;
  width: number | null;
  height: number | null;
  manual_likes: number;
};

type DbCategoryImageLink = {
  id: string;
  category_id: string;
  media_id: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  category?: DbCategory | DbCategory[] | null;
  media: MediaItem | MediaItem[] | null;
};

const normalizeMedia = (media: MediaItem | MediaItem[] | null) => {
  if (Array.isArray(media)) return media[0] || null;
  return media;
};

const normalizeCategory = (category: DbCategory | DbCategory[] | null | undefined) => {
  if (Array.isArray(category)) return category[0] || null;
  return category || null;
};

const isVideoMedia = (media: MediaItem | null | undefined) =>
  Boolean(media?.mime_type?.toLowerCase().startsWith("video/"));

const isImageMedia = (media: MediaItem | null | undefined) =>
  Boolean(media && !isVideoMedia(media));

const filenameTitle = (filename: string | null, fallback: string) => {
  const title = (filename || "")
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return title || fallback;
};

type ProjectRow = {
  id: string;
  created_at: string;
  slug: string;
  category_id: string;
  title_uk: string;
  title_pl: string;
  description_uk: string | null;
  description_pl: string | null;
  category: DbCategory | DbCategory[] | null;
  cover: MediaItem | MediaItem[] | null;
  images: Array<{
    id: string;
    sort_order: number;
    media: MediaItem | MediaItem[] | null;
  }> | null;
};

async function loadPortfolioProjects(): Promise<{
  projects: PortfolioProjectCard[];
  categories: PortfolioProjectCategory[];
} | null> {
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select(`
      id,
      created_at,
      slug,
      category_id,
      title_uk,
      title_pl,
      description_uk,
      description_pl,
      category:portfolio_categories (
        id, name_uk, name_pl, slug, is_active, sort_order
      ),
      cover:media_library!portfolio_projects_cover_media_id_fkey (
        id, image_url, r2_key, original_filename, mime_type, alt_uk, alt_pl, is_active, created_at, width, height, manual_likes
      ),
      images:portfolio_project_images (
        id,
        sort_order,
        media:media_library (
          id, image_url, r2_key, original_filename, mime_type, alt_uk, alt_pl, is_active, created_at, width, height, manual_likes
        )
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Portfolio projects are not available yet:", error.message);
    return null;
  }

  const rows = (data || []) as unknown as ProjectRow[];
  if (rows.length === 0) return null;

  const projects = rows.flatMap((row) => {
    const category = normalizeCategory(row.category);
    const orderedImages = (row.images || [])
      .map((link) => ({ ...link, media: normalizeMedia(link.media) }))
      .filter((link) => link.media?.is_active && isImageMedia(link.media))
      .sort((a, b) => a.sort_order - b.sort_order);
    const explicitCover = normalizeMedia(row.cover);
    const cover = explicitCover?.is_active && isImageMedia(explicitCover)
      ? explicitCover
      : orderedImages[0]?.media;

    if (!category || !category.is_active || !cover) return [];

    const preview = orderedImages.find((link) => link.media?.id !== cover.id)?.media || null;

    return [{
      id: row.id,
      createdAt: row.created_at,
      slug: row.slug,
      categoryId: row.category_id,
      categoryUk: category.name_uk,
      categoryPl: category.name_pl,
      titleUk: row.title_uk,
      titlePl: row.title_pl,
      descriptionUk: row.description_uk || "",
      descriptionPl: row.description_pl || "",
      imageCount: orderedImages.length,
      cover: {
        src: cover.image_url,
        altUk: cover.alt_uk || row.title_uk,
        altPl: cover.alt_pl || row.title_pl,
        width: cover.width,
        height: cover.height,
      },
      previewSrc: preview?.image_url || null,
    } satisfies PortfolioProjectCard];
  });

  const categoryMap = new Map<string, PortfolioProjectCategory>();
  for (const project of projects) {
    categoryMap.set(project.categoryId, {
      id: project.categoryId,
      labelUk: project.categoryUk,
      labelPl: project.categoryPl,
    });
  }

  return { projects, categories: Array.from(categoryMap.values()) };
}

async function loadPortfolioVideos(): Promise<PortfolioVideoCard[]> {
  const { data, error } = await supabase
    .from("portfolio_category_images")
    .select(`
      id,
      category_id,
      media_id,
      is_active,
      sort_order,
      created_at,
      category:portfolio_categories (
        id, name_uk, name_pl, slug, is_active, sort_order
      ),
      media:media_library (
        id,
        image_url,
        r2_key,
        original_filename,
        mime_type,
        alt_uk,
        alt_pl,
        is_active,
        created_at,
        width,
        height,
        manual_likes
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Portfolio videos are not available:", error.message);
    return [];
  }

  const links = (data || []) as unknown as DbCategoryImageLink[];
  const videos = new Map<string, PortfolioVideoCard>();

  for (const link of links) {
    const media = normalizeMedia(link.media);
    const category = normalizeCategory(link.category);

    if (
      !media ||
      !media.is_active ||
      !isVideoMedia(media) ||
      !category ||
      !category.is_active
    ) {
      continue;
    }

    const fallbackUk = `Відео — ${category.name_uk}`;
    const fallbackPl = `Wideo — ${category.name_pl}`;

    if (!videos.has(media.id)) {
      videos.set(media.id, {
        id: media.id,
        src: media.image_url,
        mimeType: media.mime_type || "video/mp4",
        createdAt: media.created_at || link.created_at,
        categoryId: category.id,
        categoryUk: category.name_uk,
        categoryPl: category.name_pl,
        titleUk: media.alt_uk || filenameTitle(media.original_filename, fallbackUk),
        titlePl: media.alt_pl || filenameTitle(media.original_filename, fallbackPl),
        width: media.width,
        height: media.height,
      });
    }
  }

  return Array.from(videos.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

async function loadPortfolioCategories(): Promise<PortfolioCategory[]> {
  const { data: categoriesData, error: categoriesError } = await supabase
    .from("portfolio_categories")
    .select("id, name_uk, name_pl, slug, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name_uk", { ascending: true });

  if (categoriesError) {
    console.error("Portfolio categories error:", categoriesError.message);
    return [];
  }

  const { data: linksData, error: linksError } = await supabase
    .from("portfolio_category_images")
    .select(`
      id,
      category_id,
      media_id,
      is_active,
      sort_order,
      created_at,
      media:media_library (
        id,
        image_url,
        r2_key,
        original_filename,
        mime_type,
        alt_uk,
        alt_pl,
        is_active,
        created_at,
        width,
        height,
        manual_likes
      )
    `)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (linksError) {
    console.error("Portfolio images error:", linksError.message);
    return [];
  }

  const categories = (categoriesData || []) as DbCategory[];
  const links = (linksData || []) as DbCategoryImageLink[];

  return categories.map((category) => ({
    id: category.id,
    labelUk: category.name_uk,
    labelPl: category.name_pl,
    images: links
      .filter((link) => link.category_id === category.id)
      .map((link) => {
        const media = normalizeMedia(link.media);

        if (!media || !media.is_active || !isImageMedia(media)) return null;

        return {
          id: link.id,
          src: media.image_url,
          altUk: media.alt_uk || `${category.name_uk} — портфоліо Sisters Photo Studio`,
          altPl: media.alt_pl || `${category.name_pl} — portfolio Sisters Photo Studio`,
          categoryId: category.id,
          width: media.width,
          height: media.height,
          manualLikes: media.manual_likes || 0,
          createdAt: media.created_at,
        };
      })
      .filter(Boolean) as PortfolioCategory["images"],
  }));
}

export default async function PortfolioPage() {
  const [projectPortfolio, videos] = await Promise.all([
    loadPortfolioProjects(),
    loadPortfolioVideos(),
  ]);

  if (projectPortfolio && projectPortfolio.projects.length > 0) {
    return (
      <LanguageProvider>
        <main className="min-h-screen bg-[#0B0908] text-[#F7EFE6]">
          <Header />
          <PortfolioProjectsClient {...projectPortfolio} videos={videos} />
          <Footer />
        </main>
      </LanguageProvider>
    );
  }

  const categories = await loadPortfolioCategories();

  return (
    <LanguageProvider>
      <main className="min-h-screen bg-[#0B0908] text-[#F7EFE6]">
        <Header />
        <PortfolioGalleryClient categories={categories} videos={videos} />
        <Footer />
      </main>
    </LanguageProvider>
  );
}
