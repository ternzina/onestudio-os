import type { ReactNode } from "react";
import { createPrivatePageMetadata } from "../_seo/site";
import AdminI18nBoundary from "@/components/i18n/AdminI18nBoundary";

export const metadata = createPrivatePageMetadata("/login", "Sign in");
export default function LoginLayout({ children }: { children: ReactNode }) {
  return <AdminI18nBoundary>{children}</AdminI18nBoundary>;
}
