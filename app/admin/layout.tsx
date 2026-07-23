import type { ReactNode } from "react";
import { createPrivatePageMetadata } from "../_seo/site";
import AdminLayoutClient from "./AdminLayoutClient";

export const metadata = createPrivatePageMetadata("/admin", "Panel administracyjny");

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
