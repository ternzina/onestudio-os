import type { Metadata } from "next";
import { createDemoMetadata } from "@/lib/seo/demo-metadata";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicSiteTemplateRuntime from "@/components/public/PublicSiteTemplateRuntime";
import { newSitePathForTemplate } from "@/lib/public-site/template-catalog";
import { createCanonicalRitmoDanceStudioDemoSite, ritmoDanceStudioDemoBasePath, type RitmoDanceStudioDemoLocale } from "@/lib/public-site/ritmo-dance-studio-demo";
type Params = { templatePath?: string[] }; const localeFor = (path: string[]): RitmoDanceStudioDemoLocale | null => path.length === 0 ? "ru" : path.length === 1 && path[0] === "en" ? "en" : null;
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> { const { templatePath = [] } = await params; const locale = localeFor(templatePath); if (!locale) notFound(); return createDemoMetadata("ritmo-dance-studio", locale); }
export default async function RitmoDanceStudioDemoPage({ params }: { params: Promise<Params> }) { const { templatePath = [] } = await params; const locale = localeFor(templatePath); if (!locale) notFound(); return <><div className="fixed right-3 bottom-5 left-3 z-[90] flex justify-end sm:left-auto sm:right-5"><Link className="max-w-full rounded-full bg-[#FF5B47] px-5 py-3 text-center text-sm font-semibold break-words text-white shadow-2xl" href={newSitePathForTemplate("ritmo-dance-studio")}>{locale === "en" ? "Use this template · Free" : "Использовать шаблон · Бесплатно"}</Link></div><PublicSiteTemplateRuntime site={createCanonicalRitmoDanceStudioDemoSite(locale)} basePath={ritmoDanceStudioDemoBasePath(locale)} /></>; }
