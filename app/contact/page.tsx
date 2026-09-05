import type { Metadata } from "next";
import { defaultLocale } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  ...getTranslations(defaultLocale).common.metadata.contact,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
