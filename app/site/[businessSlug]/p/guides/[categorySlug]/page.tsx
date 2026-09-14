import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CashPathGuideCategoryHub from "@/components/public/cashpath/CashPathGuideCategoryHub";
import {
  cashPathGuideCategoryPath,
  getCashPathGuideCategoryBySlug,
} from "@/lib/public-site/cashpath-guide-categories";
import { getPublicSite } from "@/lib/public-site/data";
import { getPublicSiteRequestContext } from "@/lib/public-site/request-context";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ businessSlug: string; categorySlug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { businessSlug, categorySlug } = await params;
  const category = getCashPathGuideCategoryBySlug(categorySlug);
  const [site, context] = await Promise.all([
    getPublicSite(businessSlug),
    getPublicSiteRequestContext(),
  ]);
  if (!category || !site || site.content.template_id !== "cashpath") {
    return {
      title: "Page not found",
      robots: { index: false, follow: false },
    };
  }
  const origin = context.origin || "https://cashpath.org";
  const canonical = new URL(cashPathGuideCategoryPath(category.slug), origin).toString();
  return {
    title: { absolute: category.seoTitle },
    description: category.description,
    alternates: { canonical },
  };
}

export default async function CashPathGuideCategoryPage({ params }: CategoryPageProps) {
  const { businessSlug, categorySlug } = await params;
  const category = getCashPathGuideCategoryBySlug(categorySlug);
  const [site, context] = await Promise.all([
    getPublicSite(businessSlug),
    getPublicSiteRequestContext(),
  ]);
  if (!category || !site || site.content.template_id !== "cashpath") notFound();
  return <CashPathGuideCategoryHub site={site} category={category} basePath={context.cleanUrls ? "/" : `/site/${businessSlug}`} />;
}
