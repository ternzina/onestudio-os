import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createPrivatePageMetadata } from "../_seo/site";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import AdminLayoutClient from "./AdminLayoutClient";
import AdminI18nBoundary from "@/components/i18n/AdminI18nBoundary";

export const metadata = createPrivatePageMetadata("/admin", "Administration");

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");

  const { data, error } = await supabase.rpc("get_admin_access_state");
  const state = !error && Array.isArray(data)
    ? (data[0] as { access_state?: string } | undefined)?.access_state
    : undefined;

  if (state !== "ready" && state !== "bootstrap_required") {
    redirect("/login?error=admin_access");
  }

  return (
    <AdminI18nBoundary>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminI18nBoundary>
  );
}
