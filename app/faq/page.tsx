import type { Metadata } from "next";
import { defaultLocale } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n";
import FAQPageClient from "./FAQPageClient";

export const metadata: Metadata = {
  ...getTranslations(defaultLocale).common.metadata.faq,
};

export default function FAQPage() {
  return <FAQPageClient />;
}
