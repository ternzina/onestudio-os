import type { ReactNode } from "react";
import { createPrivatePageMetadata } from "../_seo/site";

export const metadata = createPrivatePageMetadata(
  "/reset-password",
  "Zmiana hasła"
);

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
