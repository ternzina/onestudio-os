import type { ReactNode } from "react";
import { createPageMetadata } from "../_seo/site";

export const metadata = createPageMetadata({
  title: "Szkolenia fotograficzne Warszawa",
  description:
    "Szkolenia i warsztaty fotograficzne w Sisters Photo Studio w Warszawie. Praktyczna nauka pracy ze światłem, pozowaniem i sesją studyjną.",
  path: "/szkolenia",
  keywords: [
    "szkolenia fotograficzne Warszawa",
    "warsztaty fotograficzne Warszawa",
    "kurs fotografii studyjnej",
  ],
});

export default function SzkoleniaLayout({ children }: { children: ReactNode }) {
  return children;
}
