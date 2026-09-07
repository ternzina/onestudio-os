import type { Metadata } from "next";
import { platformMarketingLocale } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n";
import BlogPageClient from "./BlogPageClient";

export const metadata: Metadata = {
  ...getTranslations(platformMarketingLocale).common.metadata.blog,
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
