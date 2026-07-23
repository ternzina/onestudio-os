import type { ReactNode } from "react";
import { createPageMetadata } from "../_seo/site";

export const metadata = createPageMetadata({
  title: "Portfolio fotograficzne",
  description:
    "Zobacz portfolio Sisters Photo Studio: portrety, sesje kobiece, rodzinne, ciążowe i wizerunkowe wykonane w naszym studio w Warszawie.",
  path: "/portfolio",
  keywords: ["portfolio fotograf Warszawa", "sesje portretowe Warszawa"],
});

export default function PortfolioLayout({ children }: { children: ReactNode }) {
  return children;
}
