import type { ReactNode } from "react";
import { createPageMetadata } from "../_seo/site";

export const metadata = createPageMetadata({
  title: "Regulamin studia i wynajmu",
  description:
    "Regulamin korzystania z Sisters Photo Studio, zasady rezerwacji, wynajmu przestrzeni, płatności i odpowiedzialności.",
  path: "/regulamin",
});

export default function RegulaminLayout({ children }: { children: ReactNode }) {
  return children;
}
