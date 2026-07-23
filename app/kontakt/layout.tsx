import type { ReactNode } from "react";
import { createPageMetadata } from "../_seo/site";

export const metadata = createPageMetadata({
  title: "Kontakt i dojazd",
  description:
    "Kontakt z Sisters Photo Studio w Warszawie. Telefon, email, godziny otwarcia, mapa i dojazd: Taśmowa 1, lokal 202.",
  path: "/kontakt",
  keywords: ["studio fotograficzne Warszawa kontakt", "Taśmowa 1 studio"],
});

export default function KontaktLayout({ children }: { children: ReactNode }) {
  return children;
}
