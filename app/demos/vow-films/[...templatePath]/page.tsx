import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicCustomPageRuntime from "@/components/public/PublicCustomPageRuntime";
import PublicSiteTemplateRuntime from "@/components/public/PublicSiteTemplateRuntime";
import { newSitePathForTemplate } from "@/lib/public-site/template-catalog";
import {
  createCanonicalVowDemoSite,
  vowDemoBasePath,
  type VowDemoLocale,
} from "@/lib/public-site/vow-demo";

type Params = { templatePath?: string[] };
type ResolvedPath = { locale: VowDemoLocale; slug: string | null };

const allowedSlugs = new Set(["films", "packages"]);

function resolvePath(templatePath: string[]): ResolvedPath | null {
  const parts = templatePath.filter(Boolean);
  let locale: VowDemoLocale = "ru";
  if (parts[0] === "en") {
    locale = "en";
    parts.shift();
  } else if (parts[0] === "ru") {
    parts.shift();
  }
  if (parts.length > 1) return null;
  const slug = parts[0] ?? null;
  if (slug && !allowedSlugs.has(slug)) return null;
  return { locale, slug };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { templatePath = [] } = await params;
  const resolved = resolvePath([...templatePath]);
  if (!resolved) return notFound();
  const site = createCanonicalVowDemoSite(resolved.locale);
  const page = resolved.slug
    ? site.content.pages?.find((item) => item.type === "custom" && item.slug === resolved.slug && item.is_visible !== false)
    : null;
  if (resolved.slug && !page) return notFound();
  const title = page?.seo_title || page?.title || site.content.seo_title;
  const description = page?.seo_description || page?.intro || site.content.seo_description;
  const image = page?.seo_image_url || site.content.seo_image_url;
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: image ? { title, description, images: [image] } : { title, description },
  };
}

export default async function VowFilmsDemoPage({ params }: { params: Promise<Params> }) {
  const { templatePath = [] } = await params;
  const resolved = resolvePath([...templatePath]);
  if (!resolved) notFound();
  const site = createCanonicalVowDemoSite(resolved.locale);
  const basePath = vowDemoBasePath(resolved.locale);

  let view: React.ReactNode;
  if (resolved.slug) {
    const page = site.content.pages?.find(
      (item) => item.type === "custom" && item.slug === resolved.slug && item.is_visible !== false,
    );
    if (!page) notFound();
    view = <PublicCustomPageRuntime site={site} page={page} basePath={basePath} />;
  } else {
    view = <PublicSiteTemplateRuntime site={site} basePath={basePath} />;
  }

  return (
    <>
      <div className="fixed right-3 bottom-5 left-3 z-[90] flex justify-end sm:left-auto sm:right-5">
        <Link
          className="max-w-full rounded-full bg-[#CDB078] px-5 py-3 text-center text-sm font-semibold break-words text-[#07111F] shadow-2xl"
          href={newSitePathForTemplate("vow-films")}
        >
          {resolved.locale === "en" ? "Use this template" : "Использовать шаблон"}
        </Link>
      </div>
      {view}
    </>
  );
}
