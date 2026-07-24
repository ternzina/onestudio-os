import type { ReactNode } from "react";
import { createPrivatePageMetadata } from "../_seo/site";

export const metadata = createPrivatePageMetadata("/register", "Create owner account");

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
