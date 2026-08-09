import type { Metadata } from "next";
import PremiumStudioExperience from "./PremiumStudioExperience";
import Link from "next/link";
import { newSitePathForTemplate } from "@/lib/public-site/template-catalog";

export const metadata: Metadata = {
  title: "NOIR FRAME — премиальная фотостудия",
  description:
    "Премиальный сайт фотостудии с editorial-дизайном, интерактивным портфолио, 3D-туром и выразительной анимацией.",
  alternates: { canonical: "/demos/premium-studio" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/demos/premium-studio",
    title: "NOIR FRAME — Premium Photo Studio",
    description:
      "Авторский premium-demo фотостудии: яркий editorial-дизайн, интерактивное портфолио и 3D-тур.",
    images: [
      {
        url: "/images/demos/premium-studio/bright/hero.webp",
        width: 1672,
        height: 941,
        alt: "NOIR FRAME — премиальная фотостудия",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NOIR FRAME — Premium Photo Studio",
    description: "Первое премиальное демо фотостудии в OneStudio OS.",
    images: ["/images/demos/premium-studio/bright/hero.webp"],
  },
  robots: { index: true, follow: true },
};

export default function PremiumStudioPage() {
  return <><div className="fixed bottom-5 right-5 z-[100]"><Link className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black shadow-2xl" href={newSitePathForTemplate("premium-studio")}>Использовать этот шаблон</Link></div><PremiumStudioExperience /></>;
}
