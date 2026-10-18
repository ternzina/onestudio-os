import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryHub from "../../../../components/CategoryHub";
import { readCategories } from "../../../../lib/pages";
import { readSite, socialMetadata } from "../../../../lib/site";

export function generateStaticParams() {
  return readCategories().map((category) => ({ category: category.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = readCategories().find((item) => item.slug === slug);
  const site = readSite();
  if (!category || site.templateId !== "cashpath") return { title: "Not found", robots: { index: false, follow: false } };
  return socialMetadata({ title: category.seoTitle, description: category.description, path: `/p/guides/${category.slug}`, noIndex: site.noIndex });
}

export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const site = readSite();
  const category = readCategories().find((item) => item.slug === slug);
  if (!category || site.templateId !== "cashpath") notFound();
  return <CategoryHub category={category} />;
}
