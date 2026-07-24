import type { ReactNode } from "react";
import { cookies } from "next/headers";
import AdminI18nProvider from "./AdminI18nProvider";
import { ADMIN_LOCALE_COOKIE, normalizeAdminLocale } from "@/lib/i18n/admin";

export default async function AdminI18nBoundary({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const initialLocale = normalizeAdminLocale(cookieStore.get(ADMIN_LOCALE_COOKIE)?.value);

  return <AdminI18nProvider initialLocale={initialLocale}>{children}</AdminI18nProvider>;
}
