import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryHub from "../../../../components/CategoryHub";
import { readCategories } from "../../../../lib/pages";
import { readSite } from "../../../../lib/site";

export function generateStaticParams() {
  return readCategories().map((category) => ({ category: category.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = readCategories().find((item) => item.slug === slug);
  const site = readSite();
  if (!category || site.templateId !== "cashpath") return { title: "Not found", robots: { index: false, follow: false } };
  return {
    title: { absolute: category.seoTitle },
    description: category.description,
    alternates: { canonical: `/p/guides/${category.slug}` },
    robots: site.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const site = readSite();
  const category = readCategories().find((item) => item.slug === slug);
  if (!category || site.templateId !== "cashpath") notFound();
  return <CategoryHub category={category} />;
}
