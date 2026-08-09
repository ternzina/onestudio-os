import type { Metadata } from "next";
import HomeExperience from "./HomeExperience";
import Link from "next/link";
import { newSitePathForTemplate } from "@/lib/public-site/template-catalog";

const description = "Премиальная образовательная платформа BEMBI: практические задания, эксперименты, рабочие тетради, журнал для родителей и программы детского центра.";
export const metadata: Metadata = { title: "BEMBI — Discovery Platform | Premium Demo", description, alternates: { canonical: "/demos/premium-kids-center" }, openGraph: { title: "BEMBI — Kids Discovery Platform", description, type: "website", url: "/demos/premium-kids-center", images: [{ url: "/images/demos/premium-kids-center/hero-platform.webp", width: 1800, height: 1013, alt: "BEMBI Discovery Platform" }] }, twitter: { card: "summary_large_image", title: "BEMBI — Kids Discovery Platform", description, images: ["/images/demos/premium-kids-center/hero-platform.webp"] } };
export default function Page() { return <><div className="fixed bottom-5 right-5 z-[100]"><Link className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black shadow-2xl" href={newSitePathForTemplate("premium-kids-center")}>Использовать этот шаблон</Link></div><HomeExperience /></>; }
