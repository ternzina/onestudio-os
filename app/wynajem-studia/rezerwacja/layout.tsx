import type { ReactNode } from "react";
import { createPrivatePageMetadata } from "../../_seo/site";

export const metadata = createPrivatePageMetadata(
  "/wynajem-studia/rezerwacja",
  "Rezerwacja studia"
);

export default function RentalBookingLayout({ children }: { children: ReactNode }) {
  return children;
}
