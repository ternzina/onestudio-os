import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicSiteTemplateRuntime from "@/components/public/PublicSiteTemplateRuntime";
import { newSitePathForTemplate } from "@/lib/public-site/template-catalog";
import { createCanonicalPawhausGroomingStudioDemoSite, pawhausGroomingStudioDemoBasePath, type PawhausGroomingStudioDemoLocale } from "@/lib/public-site/pawhaus-grooming-studio-demo";
type Params = { templatePath?: string[] };
function localeFor(path: string[]): PawhausGroomingStudioDemoLocale | null { if (!path.length) return "ru"; if (path.length === 1 && path[0] === "en") return "en"; return null; }
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> { const locale = localeFor((await params).templatePath ?? []); if (!locale) notFound(); return locale === "en" ? { title: "PAWHAUS Grooming Studio — calm grooming for happy pets", description: "Modern grooming for dogs and cats in Kyiv.", robots: { index: false, follow: false } } : { title: "PAWHAUS Grooming Studio — спокойный груминг", description: "Премиальный городской груминг для собак и кошек в Киеве.", robots: { index: false, follow: false } }; }
export default async function PawhausDemoPage({ params }: { params: Promise<Params> }) { const locale = localeFor((await params).templatePath ?? []); if (!locale) notFound(); return <><div className="fixed right-3 bottom-5 left-3 z-[90] flex justify-end sm:left-auto sm:right-5"><Link className="rounded-full bg-[#20211D] px-5 py-3 text-center text-sm font-semibold text-[#F8F4EA] shadow-2xl" href={newSitePathForTemplate("pawhaus-grooming-studio")}>{locale === "en" ? "Use this template · Free" : "Использовать шаблон · Бесплатно"}</Link></div><PublicSiteTemplateRuntime site={createCanonicalPawhausGroomingStudioDemoSite(locale)} basePath={pawhausGroomingStudioDemoBasePath(locale)} /></>; }
