import type { Metadata } from "next";
import { defaultLocale } from "@/lib/i18n/config";
import { getTranslations } from "@/lib/i18n";
import BlogPageClient from "./BlogPageClient";

export const metadata: Metadata = {
  ...getTranslations(defaultLocale).common.metadata.blog,
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
