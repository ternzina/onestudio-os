import type { Metadata } from "next";
import PremiumKidsExperience from "./PremiumKidsExperience";

export const metadata: Metadata = {
  title: "BEMBI — Kids Discovery Center",
  description: "Премиальный демонстрационный сайт детского развивающего центра с программами по возрастам, расписанием и командой преподавателей.",
  alternates: { canonical: "/demos/premium-kids-center" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/demos/premium-kids-center",
    title: "BEMBI — Kids Discovery Center",
    description: "Место для больших открытий: интерактивный premium-demo детского развивающего центра.",
    images: [{
      url: "/images/demos/premium-kids-center/hero.webp",
      width: 1800,
      height: 1013,
      alt: "BEMBI — премиальный сайт детского развивающего центра",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BEMBI — Kids Discovery Center",
    description: "Премиальный демонстрационный сайт детского центра в OneStudio OS.",
    images: ["/images/demos/premium-kids-center/hero.webp"],
  },
  robots: { index: true, follow: true },
};

export default function PremiumKidsCenterPage() {
  return <PremiumKidsExperience />;
}
