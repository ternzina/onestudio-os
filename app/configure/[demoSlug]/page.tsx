import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { newSitePathForTemplate } from "@/lib/public-site/template-catalog";
import { DEMOS, getDemo } from "@/lib/demo-catalog";

export function generateStaticParams() {
  return DEMOS.map((demo) => ({ demoSlug: demo.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ demoSlug: string }> }): Promise<Metadata> {
  const { demoSlug } = await params;
  const demo = getDemo(demoSlug);
  return {
    title: demo ? `Configure ${demo.name}` : "Configure demo",
    alternates: demo ? { canonical: `/configure/${demo.slug}` } : undefined,
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
  };
}

export default async function ConfigureDemoPage({
  params,
}: {
  params: Promise<{ demoSlug: string }>;
}) {
  const { demoSlug } = await params;
  const demo = getDemo(demoSlug);

  if (!demo) notFound();

  redirect(newSitePathForTemplate(demo.slug === "lumiere" ? "lumea-beauty" : "standard"));
}
