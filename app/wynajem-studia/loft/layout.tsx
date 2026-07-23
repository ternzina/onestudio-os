import type { ReactNode } from "react";
import { createPageMetadata } from "../../_seo/site";
import BreadcrumbStructuredData from "../../_seo/BreadcrumbStructuredData";

export const metadata = createPageMetadata({
  title: "Loftowe studio fotograficzne Warszawa",
  description:
    "Loftowa strefa Sisters Photo Studio w Warszawie do sesji portretowych, modowych, biznesowych, wideo i contentu dla marek.",
  path: "/wynajem-studia/loft",
  keywords: ["loftowe studio Warszawa", "studio loft do sesji Warszawa"],
});

export default function LoftLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Strona główna", path: "/" },
          { name: "Wynajem studia", path: "/wynajem-studia" },
          { name: "Loft", path: "/wynajem-studia/loft" },
        ]}
      />
      {children}
    </>
  );
}
