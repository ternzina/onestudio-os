import type { ReactNode } from "react";
import { createPrivatePageMetadata } from "../_seo/site";
import BookingLayoutClient from "./BookingLayoutClient";

export const metadata = createPrivatePageMetadata("/booking", "Rezerwacja");

export default function BookingLayout({ children }: { children: ReactNode }) {
  return <BookingLayoutClient>{children}</BookingLayoutClient>;
}
