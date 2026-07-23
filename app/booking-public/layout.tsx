import type { ReactNode } from "react";
import { createPrivatePageMetadata } from "../_seo/site";

export const metadata = createPrivatePageMetadata(
  "/booking-public",
  "Rezerwacja sesji zdjęciowej"
);

export default function PublicBookingLayout({ children }: { children: ReactNode }) {
  return children;
}
