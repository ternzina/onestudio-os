import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicCustomPageRuntime from "@/components/public/PublicCustomPageRuntime";
import PublicSiteTemplateRuntime from "@/components/public/PublicSiteTemplateRuntime";
import { newSitePathForTemplate } from "@/lib/public-site/template-catalog";
import { createCanonicalRastemCenterDemoSite, rastemCenterDemoBasePath, type RastemCenterDemoLocale } from "@/lib/public-site/rastem-center-demo";

type Params = { templatePath?: string[] };
const localeFor = (path: string[]): RastemCenterDemoLocale | null => path.length === 0 ? "ru" : path.length === 1 && path[0] === "en" ? "en" : null;
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> { const locale = localeFor((await params).templatePath ?? []); if (!locale) notFound(); return locale === "en" ? { title: "RASTEM — Children's discovery center", description: "A children's discovery center for learning, creativity and confidence.", robots: { index: false, follow: false } } : { title: "РАСТЁМ — Детский развивающий центр", description: "Детский развивающий центр для учёбы, творчества и уверенности.", robots: { index: false, follow: false } }; }
export default async function RastemCenterDemoPage({ params }: { params: Promise<Params> }) { const path = (await params).templatePath ?? []; const locale = localeFor(path); if (!locale) notFound(); const site = createCanonicalRastemCenterDemoSite(locale); const basePath = rastemCenterDemoBasePath(locale); const page = path[0] === "p" && path[1] ? site.content.pages?.find((candidate) => candidate.type === "custom" && candidate.slug === path[1] && candidate.is_visible !== false) : undefined; if (path[0] === "p") { if (!page) notFound(); return <PublicCustomPageRuntime site={site} page={page} basePath={basePath} />; } if (path.length > 0 && path[0] !== "en") notFound(); return <><div className="fixed bottom-5 right-5 z-[90]"><Link className="rounded-full bg-[#263238] px-5 py-3 text-sm font-semibold text-[#FFF9EF] shadow-2xl" href={newSitePathForTemplate("rastem-center")}>{locale === "en" ? "Use this template · Free" : "Использовать шаблон · Бесплатно"}</Link></div><PublicSiteTemplateRuntime site={site} basePath={basePath} /></>; }
