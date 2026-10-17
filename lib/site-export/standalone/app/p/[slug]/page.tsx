import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticlePage from "../../../components/ArticlePage";
import { pageParams, readPage } from "../../../lib/pages";
import { socialMetadata } from "../../../lib/site";

export function generateStaticParams() {
  return pageParams();
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = readPage(slug);
  if (!page) return { title: "Page not found", robots: { index: false, follow: false } };
  return socialMetadata({ title: page.seoTitle, description: page.seoDescription, path: page.path, noIndex: page.noIndex });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = readPage(slug);
  if (!page) notFound();
  return <ArticlePage page={page} />;
}
