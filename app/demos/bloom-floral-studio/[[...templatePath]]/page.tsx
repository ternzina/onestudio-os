import type { Metadata } from "next";
import { createDemoMetadata } from "@/lib/seo/demo-metadata";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicSiteTemplateRuntime from "@/components/public/PublicSiteTemplateRuntime";
import { newSitePathForTemplate } from "@/lib/public-site/template-catalog";
import { createCanonicalBloomFloralStudioDemoSite, bloomFloralStudioDemoBasePath, type BloomFloralStudioDemoLocale } from "@/lib/public-site/bloom-floral-studio-demo";
type Params = { templatePath?: string[] };
function localeFor(path: string[]): BloomFloralStudioDemoLocale | null { if (!path.length) return "ru"; if (path.length === 1 && path[0] === "en") return "en"; return null; }
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> { const locale = localeFor((await params).templatePath ?? []); if (!locale) notFound(); return createDemoMetadata("bloom-floral-studio", locale); }
export default async function BloomFloralStudioDemoPage({ params }: { params: Promise<Params> }) { const locale = localeFor((await params).templatePath ?? []); if (!locale) notFound(); return <><div className="fixed right-3 bottom-5 left-3 z-[90] flex justify-end sm:left-auto sm:right-5"><Link className="rounded-full bg-[#3B1728] px-5 py-3 text-center text-sm font-semibold text-[#FBF6EF] shadow-2xl" href={newSitePathForTemplate("bloom-floral-studio")}>{locale === "en" ? "Use this template · Free" : "Использовать шаблон · Бесплатно"}</Link></div><PublicSiteTemplateRuntime site={createCanonicalBloomFloralStudioDemoSite(locale)} basePath={bloomFloralStudioDemoBasePath(locale)} /></>; }
