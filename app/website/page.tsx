import { createPageMetadata } from "@/app/_seo/site";
import WebsitePageClient from "./WebsitePageClient";

export const metadata = createPageMetadata({
  title: "Turnkey websites and our work",
  description: "Explore websites from the OneStudio OS portfolio. We design, configure and launch your business website with a fixed project price agreed before work begins.",
  path: "/website",
});

export default function WebsitePage() {
  return <WebsitePageClient />;
}
