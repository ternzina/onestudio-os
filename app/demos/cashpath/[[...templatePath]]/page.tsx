import { notFound } from "next/navigation";
import PublicSiteTemplateRuntime from "@/components/public/PublicSiteTemplateRuntime";
import PublicCustomPageRuntime from "@/components/public/PublicCustomPageRuntime";
import { createCanonicalCashPathDemoSite } from "@/lib/public-site/cashpath-demo";
export default async function CashPathDemo({ params }: { params: Promise<{ templatePath?: string[] }> }) { const path=(await params).templatePath??[]; const site=createCanonicalCashPathDemoSite(); if(!path.length)return <PublicSiteTemplateRuntime site={site} basePath="/demos/cashpath"/>; const page=path[0]==="p"&&path[1]?site.content.pages?.find(item=>item.slug===path[1]):undefined; if(!page)notFound(); return <PublicCustomPageRuntime site={site} page={page} basePath="/demos/cashpath"/>; }
