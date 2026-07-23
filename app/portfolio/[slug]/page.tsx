import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LanguageProvider } from "@/lib/language-provider";
import { supabase } from "@/lib/supabase";
import PortfolioProjectGallery, { type ProjectGalleryData } from "./PortfolioProjectGallery";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type MediaRow = {
  id: string;
  image_url: string;
  alt_uk: string | null;
  alt_pl: string | null;
  width: number | null;
  height: number | null;
  is_active: boolean;
};

type ProjectRow = {
  id: string;
  slug: string;
  title_uk: string;
  title_pl: string;
  description_uk: string | null;
  description_pl: string | null;
  category: { name_uk: string; name_pl: string } | Array<{ name_uk: string; name_pl: string }> | null;
  images: Array<{
    id: string;
    sort_order: number;
    media: MediaRow | MediaRow[] | null;
  }> | null;
};

function single<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] || null : value;
}

async function loadProject(slug: string): Promise<ProjectGalleryData | null> {
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select(`
      id, slug, title_uk, title_pl, description_uk, description_pl,
      category:portfolio_categories (name_uk, name_pl),
      images:portfolio_project_images (
        id, sort_order,
        media:media_library (id, image_url, alt_uk, alt_pl, width, height, is_active)
      )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  const row = data as unknown as ProjectRow;
  const category = single(row.category);
  const images = (row.images || [])
    .map((link) => ({ link, media: single(link.media) }))
    .filter((item): item is { link: typeof item.link; media: MediaRow } => Boolean(item.media?.is_active))
    .sort((a, b) => a.link.sort_order - b.link.sort_order)
    .map(({ link, media }) => ({
      id: link.id,
      src: media.image_url,
      altUk: media.alt_uk || row.title_uk,
      altPl: media.alt_pl || row.title_pl,
      width: media.width,
      height: media.height,
    }));

  if (!category || images.length === 0) return null;

  return {
    slug: row.slug,
    titleUk: row.title_uk,
    titlePl: row.title_pl,
    descriptionUk: row.description_uk || "",
    descriptionPl: row.description_pl || "",
    categoryUk: category.name_uk,
    categoryPl: category.name_pl,
    images,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadProject(slug);
  if (!project) return {};
  return {
    title: `${project.titlePl} | Sisters Photo Studio`,
    description: project.descriptionPl || `${project.categoryPl} — portfolio Sisters Photo Studio`,
    alternates: { canonical: `/portfolio/${project.slug}` },
  };
}

export default async function PortfolioProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await loadProject(slug);
  if (!project) notFound();

  return (
    <LanguageProvider>
      <main className="min-h-screen bg-[#0B0908] text-[#F7EFE6]">
        <Header />
        <PortfolioProjectGallery project={project} />
        <Footer />
      </main>
    </LanguageProvider>
  );
}
