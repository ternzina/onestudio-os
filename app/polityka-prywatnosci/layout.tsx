import type { ReactNode } from "react";
import { createPageMetadata } from "../_seo/site";

export const metadata = createPageMetadata({
  title: "Polityka prywatności",
  description:
    "Polityka prywatności Sisters Photo Studio: zasady przetwarzania danych osobowych, pliki techniczne oraz prawa użytkowników.",
  path: "/polityka-prywatnosci",
});

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return children;
}
