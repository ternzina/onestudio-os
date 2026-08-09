import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PublicSiteTemplateRuntime from "@/components/public/PublicSiteTemplateRuntime";
import PublicCustomPageRuntime from "@/components/public/PublicCustomPageRuntime";
import { renderPublicSiteTemplatePath } from "@/components/public/PublicSiteTemplatePathRuntime";
import { newSitePathForTemplate } from "@/lib/public-site/template-catalog";
import { createCanonicalGlossDemoSite, GLOSS_DEMO_BASE_PATH } from "@/lib/public-site/gloss-demo";

const description = "Премиальный editorial-сайт GLOSS с услугами, мастерами, клубом, сертификатами, портфолио и записью.";

export const metadata: Metadata = {
  title: "GLOSS — премиальный nail studio demo",
  description,
  alternates: { canonical: GLOSS_DEMO_BASE_PATH },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: GLOSS_DEMO_BASE_PATH,
    title: "GLOSS — Premium Nail Studio",
    description,
    images: [{ url: "/templates/gloss/gloss-hero.webp", alt: "GLOSS" }],
  },
  twitter: { card: "summary_large_image", title: "GLOSS — Premium Nail Studio", description, images: ["/templates/gloss/gloss-hero.webp"] },
};

export default async function GlossDemoPage({
  params,
}: {
  params: Promise<{ templatePath?: string[] }>;
}) {
  const { templatePath = [] } = await params;
  const site = createCanonicalGlossDemoSite();

  let experience: React.ReactNode;
  if (templatePath[0] === "p" && templatePath[1]) {
    const page = site.content.pages?.find(candidate => candidate.type === "custom" && candidate.slug === templatePath[1] && candidate.is_visible !== false);
    if (!page) notFound();
    experience = <PublicCustomPageRuntime site={site} page={page} basePath={GLOSS_DEMO_BASE_PATH} />;
  } else if (templatePath.length) {
    experience = renderPublicSiteTemplatePath({ site, path: templatePath, basePath: GLOSS_DEMO_BASE_PATH });
    if (!experience) notFound();
  } else {
    experience = <PublicSiteTemplateRuntime site={site} basePath={GLOSS_DEMO_BASE_PATH} />;
  }

  return <><div className="fixed bottom-5 right-5 z-[100]"><Link className="rounded-full bg-[#321722] px-5 py-3 text-sm font-semibold text-white shadow-2xl" href={newSitePathForTemplate("gloss-nail-studio")}>Использовать этот шаблон</Link></div>{experience}</>;
}
