import type { ReactNode } from "react";
import { createPrivatePageMetadata } from "../_seo/site";
import DashboardLayoutClient from "./DashboardLayoutClient";

export const metadata = createPrivatePageMetadata("/dashboard", "Panel klienta");

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
