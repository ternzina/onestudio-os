import type { ReactNode } from "react";
import { createPageMetadata } from "../_seo/site";

export const metadata = createPageMetadata({
  title: "Sesje zdjęciowe Warszawa",
  description:
    "Profesjonalne sesje zdjęciowe w Warszawie: portretowe, kobiece, rodzinne, ciążowe i wizerunkowe. Pakiety, wnętrza i rezerwacja online.",
  path: "/sesje-zdjeciowe",
  keywords: [
    "sesja zdjęciowa Warszawa",
    "sesja kobieca Warszawa",
    "sesja rodzinna Warszawa",
    "sesja ciążowa Warszawa",
    "sesja wizerunkowa Warszawa",
  ],
});

export default function SesjeLayout({ children }: { children: ReactNode }) {
  return children;
}
