import type { Metadata } from "next";
import { createDemoMetadata } from "@/lib/seo/demo-metadata";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicSiteTemplateRuntime from "@/components/public/PublicSiteTemplateRuntime";
import { newSitePathForTemplate } from "@/lib/public-site/template-catalog";
import { alignPilatesDemoBasePath, createCanonicalAlignPilatesDemoSite, type AlignPilatesDemoLocale } from "@/lib/public-site/align-pilates-demo";

type Params = { templatePath?: string[] };
function resolveLocale(path: string[]): AlignPilatesDemoLocale | null { if (path.length === 0) return "ru"; if (path.length === 1 && path[0] === "en") return "en"; return null; }
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> { const { templatePath = [] } = await params; const locale = resolveLocale(templatePath); if (!locale) notFound(); return createDemoMetadata("align-pilates-studio", locale); }
export default async function AlignPilatesDemoPage({ params }: { params: Promise<Params> }) { const { templatePath = [] } = await params; const locale = resolveLocale(templatePath); if (!locale) notFound(); return <><div className="fixed right-3 bottom-5 left-3 z-[90] flex justify-end sm:left-auto sm:right-5"><Link className="max-w-full rounded-full bg-[#6F2B2E] px-5 py-3 text-center text-sm font-semibold break-words text-white shadow-2xl" href={newSitePathForTemplate("align-pilates-studio")}>{locale === "en" ? "Use this template · Free" : "Использовать шаблон · Бесплатно"}</Link></div><PublicSiteTemplateRuntime site={createCanonicalAlignPilatesDemoSite(locale)} basePath={alignPilatesDemoBasePath(locale)} /></>;
}
