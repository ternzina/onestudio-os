import type { ReactNode } from "react";
import { createPrivatePageMetadata } from "../_seo/site";
import AdminI18nBoundary from "@/components/i18n/AdminI18nBoundary";

export const metadata = createPrivatePageMetadata("/register", "Create account");

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <AdminI18nBoundary>{children}</AdminI18nBoundary>;
}
