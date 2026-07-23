import type { ReactNode } from "react";
import { createPageMetadata } from "../_seo/site";

export const metadata = createPageMetadata({
  title: "Wynajem studia fotograficznego w Warszawie",
  description:
    "Wynajmij studio fotograficzne w Warszawie z cykloramą, gotowymi wnętrzami, make-up roomem i sprzętem. Rezerwacja godzinowa online.",
  path: "/wynajem-studia",
  keywords: [
    "wynajem studia fotograficznego Warszawa",
    "studio do wynajęcia Warszawa",
    "wynajem cykloramy Warszawa",
    "studio fotograficzne na godziny Warszawa",
  ],
});

export default function WynajemLayout({ children }: { children: ReactNode }) {
  return children;
}
