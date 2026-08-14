import type { Metadata } from "next";
import HomeExperience from "./HomeExperience";

const description = "Премиальная образовательная платформа BEMBI: практические задания, эксперименты, рабочие тетради, журнал для родителей и программы детского центра.";
export const metadata: Metadata = { title: "BEMBI — Discovery Platform | Premium Demo", description, alternates: { canonical: "/demos/premium-kids-center" }, openGraph: { title: "BEMBI — Kids Discovery Platform", description, type: "website", url: "/demos/premium-kids-center", images: [{ url: "/images/demos/premium-kids-center/hero-platform.webp", width: 1800, height: 1013, alt: "BEMBI Discovery Platform" }] }, twitter: { card: "summary_large_image", title: "BEMBI — Kids Discovery Platform", description, images: ["/images/demos/premium-kids-center/hero-platform.webp"] } };
export default function Page() { return <HomeExperience />; }
