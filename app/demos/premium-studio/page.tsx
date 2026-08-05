import type { Metadata } from "next";
import PremiumStudioExperience from "./PremiumStudioExperience";

export const metadata: Metadata = {
  title: "NOIR FRAME — премиальная фотостудия",
  description:
    "Выразительный демонстрационный сайт современной фотостудии на платформе OneStudio OS.",
  alternates: { canonical: "/demos/premium-studio" },
  robots: { index: false, follow: false },
};

export default function PremiumStudioPage() {
  return <PremiumStudioExperience />;
}
