import type { Metadata } from "next";
import { createPageMetadata } from "@/app/_seo/site";

export const metadata: Metadata = createPageMetadata({
  title: "Business website demos",
  description: "Explore OneStudio OS website demos for studios, beauty, wellness and service businesses. Preview designs, service pages and online booking experiences.",
  path: "/demos",
});

export default function DemosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
