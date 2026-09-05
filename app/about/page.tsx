import type { Metadata } from "next";
import { defaultLocale } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n";
import AboutPageClient from "./AboutPageClient";

export const metadata: Metadata = {
  ...getTranslations(defaultLocale).common.metadata.about,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
