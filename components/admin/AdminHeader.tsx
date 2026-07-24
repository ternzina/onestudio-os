"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminLanguageSwitcher from "@/components/i18n/AdminLanguageSwitcher";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useAdminI18n();
  const links = [
    [t("Overview"), "/admin"],
    [t("Catalog"), "/admin/catalog"],
    [t("Availability"), "/admin/availability"],
    [t("Bookings"), "/admin/bookings"],
    [t("Clients"), "/admin/clients"],
    [t("Calendar"), "/admin/calendar"],
    [t("Media"), "/admin/media"],
    [t("Portfolio"), "/admin/portfolio"],
    [t("Settings"), "/admin/settings"],
  ] as const;

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 lg:left-[290px]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full border border-black/8 bg-white/90 px-4 py-3 shadow-[0_16px_55px_rgba(20,20,20,0.1)] backdrop-blur-xl">
        <Link href="/admin" className="shrink-0 text-xs font-semibold uppercase tracking-[0.2em]">OneStudio OS</Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(([label, href]) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`rounded-full px-3 py-2 text-xs font-semibold ${active ? "bg-[#17191f] text-white" : "text-[#6f6c65] hover:bg-[#eeebe3]"}`}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <AdminLanguageSwitcher />
          <Link href="/" target="_blank" className="hidden rounded-full px-3 py-2 text-xs font-semibold text-[#6f6c65] xl:inline-flex">{t("Site")}</Link>
          <button type="button" onClick={logout} className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold">{t("Sign out")}</button>
        </div>
      </div>
    </header>
  );
}
