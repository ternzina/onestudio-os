import type { ReactNode } from "react";
import { createPageMetadata } from "../../_seo/site";
import BreadcrumbStructuredData from "../../_seo/BreadcrumbStructuredData";

export const metadata = createPageMetadata({
  title: "Ciepłe wnętrze do sesji zdjęciowych",
  description:
    "Przytulna, elegancka strefa wnętrzarska w studio fotograficznym w Warszawie. Idealna do sesji rodzinnych, kobiecych, ciążowych i contentu.",
  path: "/wynajem-studia/cieple-wnetrze",
  keywords: ["studio z wnętrzem Warszawa", "wnętrze do sesji Warszawa"],
});

export default function CiepleWnetrzeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Strona główna", path: "/" },
          { name: "Wynajem studia", path: "/wynajem-studia" },
          {
            name: "Ciepłe wnętrze",
            path: "/wynajem-studia/cieple-wnetrze",
          },
        ]}
      />
      {children}
    </>
  );
}
