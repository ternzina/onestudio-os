import { notFound } from "next/navigation";
import DemoShowcaseClient from "./DemoShowcaseClient";
import { DEMOS, getDemo } from "@/lib/demo-catalog";

export function generateStaticParams() {
  return DEMOS.map((demo) => ({ demoSlug: demo.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ demoSlug: string }> }): Promise<Metadata> {
  const { demoSlug } = await params;
  const demo = getDemo(demoSlug);
  if (!demo) return { title: "Demo not found", robots: { index: false } };
  const title = `${demo.name} — ${demo.title.en} demo`;
  const description = demo.description.en;
  return {
    title, description, alternates: { canonical: `/demos/${demo.slug}` }, robots: { index: true, follow: true },
    openGraph: { type: "website", url: `/demos/${demo.slug}`, siteName: "OneStudio OS", title, description, images: [{ url: "/opengraph-image", alt: "OneStudio OS" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/twitter-image"] },
  };
}

export default async function DemoShowcasePage({
  params,
}: {
  params: Promise<{ demoSlug: string }>;
}) {
  const { demoSlug } = await params;
  const demo = getDemo(demoSlug);

  if (!demo) notFound();

  return <DemoShowcaseClient demo={demo} />;
}
import type { Metadata } from "next";
