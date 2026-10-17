import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticlePage from "../../../components/ArticlePage";
import { pageParams, readPage } from "../../../lib/pages";

export function generateStaticParams() {
  return pageParams();
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = readPage(slug);
  if (!page) return { title: "Page not found", robots: { index: false, follow: false } };
  return {
    title: { absolute: page.seoTitle },
    description: page.seoDescription,
    alternates: { canonical: page.path },
    openGraph: { title: page.seoTitle, description: page.seoDescription, url: page.path },
    robots: page.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = readPage(slug);
  if (!page) notFound();
  return <ArticlePage page={page} />;
}
