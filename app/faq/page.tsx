import type { Metadata } from "next";
import { platformMarketingLocale } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n";
import FAQPageClient from "./FAQPageClient";

export const metadata: Metadata = {
  ...getTranslations(platformMarketingLocale).common.metadata.faq,
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return <FAQPageClient />;
}
