import type { ReactNode } from "react";
import { createPageMetadata } from "../../_seo/site";
import BreadcrumbStructuredData from "../../_seo/BreadcrumbStructuredData";

export const metadata = createPageMetadata({
  title: "Cyklorama do wynajęcia Warszawa",
  description:
    "Cyklorama w studio fotograficznym w Warszawie do sesji fashion, beauty, portretowych, produktowych i nagrań wideo.",
  path: "/wynajem-studia/cyklorama",
  keywords: ["cyklorama Warszawa", "wynajem cykloramy Warszawa"],
});

export default function CykloramaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Strona główna", path: "/" },
          { name: "Wynajem studia", path: "/wynajem-studia" },
          { name: "Cyklorama", path: "/wynajem-studia/cyklorama" },
        ]}
      />
      {children}
    </>
  );
}
