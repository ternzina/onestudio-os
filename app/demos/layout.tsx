import type { Metadata } from "next";
import { createPageMetadata } from "@/app/_seo/site";

export const metadata: Metadata = createPageMetadata({
  title: "Business website demos",
  description: "Explore ready OneStudio OS website, booking and business-management demos.",
  path: "/demos",
});

export default function DemosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
