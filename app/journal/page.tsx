import type { Metadata } from "next";
import { getJournalUiCopy } from "@/lib/i18n/journal";
import { platformMarketingLocale } from "@/lib/i18n/config";
import JournalPageClient from "./JournalPageClient";

const copy = getJournalUiCopy(platformMarketingLocale);

export const metadata: Metadata = {
  title: copy.name,
  description: copy.lead,
  alternates: { canonical: "/journal" },
  openGraph: {
    type: "website",
    url: "/journal",
    title: copy.name,
    description: copy.lead,
    siteName: "OneStudio OS",
  },
  robots: { index: true, follow: true },
};

export default function JournalPage() {
  return <JournalPageClient />;
}
