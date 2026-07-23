import type { ReactNode } from "react";
import { createPrivatePageMetadata } from "../_seo/site";

export const metadata = createPrivatePageMetadata("/login", "Logowanie");

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
