"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import { useAdminModules } from "@/components/admin/AdminModulesContext";
import type { CoreModuleKey } from "@/lib/modules/contracts";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useAdminI18n();
  const { enabledModules, businessSlug } = useAdminModules();
  const activeItems = [
    { href: "/admin", label: t("Overview"), icon: "⌂" },
    { href: "/admin/workspace", label: t("Workspace"), icon: "◎" },
    { href: "/admin/site", label: t("Site"), icon: "◈" },
    { href: "/admin/catalog", label: t("Catalog"), icon: "▦", module: "catalog" },
    { href: "/admin/availability", label: t("Availability"), icon: "◷", module: "scheduling" },
    { href: "/admin/bookings", label: t("Bookings"), icon: "▣", module: "scheduling" },
    { href: "/admin/clients", label: t("Clients"), icon: "◉", module: "crm" },
    { href: "/admin/calendar", label: t("Calendar"), icon: "▤", module: "scheduling" },
    { href: "/admin/payments", label: t("Payments"), icon: "¤", module: "payments" },
    { href: "/admin/notifications", label: t("Notifications"), icon: "✉", module: "notifications" },
    { href: "/admin/media", label: t("Media"), icon: "◫", module: "media" },
    { href: "/admin/portfolio", label: t("Portfolio"), icon: "◇", module: "portfolio" },
    { href: "/admin/settings", label: t("Settings"), icon: "⚙" },
    { href: "/admin/settings/company", label: t("Company"), icon: "◍", module: "documents" },
    { href: "/admin/legal", label: t("Legal"), icon: "§", module: "documents" },
    { href: "/admin/documents", label: t("Documents"), icon: "▧", module: "documents" },
    { href: "/admin/analytics", label: t("Analytics"), icon: "⌁", module: "analytics" },
    { href: "/admin/modules", label: t("Modules"), icon: "⌘" },
  ] satisfies ReadonlyArray<{
    href: string;
    label: string;
    icon: string;
    module?: CoreModuleKey;
  }>;

  const visibleItems = enabledModules
    ? activeItems.filter((item) => !item.module || enabledModules.has(item.module))
    : activeItems;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[290px] overflow-y-auto border-r border-black/8 bg-[#fffdfa] px-5 py-6 shadow-[18px_0_70px_rgba(25,25,25,0.06)] lg:block">
      <div className="flex min-h-full flex-col">
        <Link href="/admin" className="rounded-[26px] border border-black/8 bg-[#17191f] p-5 text-white">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#d8b36a]">{t("Core Suite 1.0")}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">OneStudio OS</h2>
          <p className="mt-2 text-xs leading-5 text-white/65">
            {enabledModules
              ? t("{count} of 10 modules enabled", { count: enabledModules.size })
              : t("Core · Nine modules · One workspace")}
          </p>
        </Link>

        <nav className="mt-6 space-y-2">
          {visibleItems.map((item) => {
            const active = item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
                  active ? "bg-[#17191f] text-white" : "text-[#66645f] hover:bg-[#eeebe3] hover:text-[#17191f]"
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto grid gap-2 pt-6">
          {!enabledModules || enabledModules.has("scheduling") ? (
            <Link href="/book" target="_blank" className="rounded-full bg-[#17191f] px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em] text-white">
              {t("Open booking form")}
            </Link>
          ) : null}
          {businessSlug ? (
            <Link href={`/site/${businessSlug}`} target="_blank" className="rounded-full border border-black/10 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em]">
              {t("Open public site")}
            </Link>
          ) : null}
          <Link href="/dashboard" className="rounded-full border border-black/10 px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.12em]">
            {t("Account area")}
          </Link>
        </div>
      </div>
    </aside>
  );
}
