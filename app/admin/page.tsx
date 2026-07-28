"use client";

import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import CommandCenterOverview from "@/components/admin/CommandCenterOverview";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import { useAdminModules } from "@/components/admin/AdminModulesContext";
import type { CoreModuleKey } from "@/lib/modules/contracts";

export default function AdminPage() {
  const router = useRouter();
  const { t } = useAdminI18n();
  const { enabledModules } = useAdminModules();
  const readyModules = [
    {
      title: t("Workspace"),
      label: t("Business context"),
      description: t("Select the current business and manage its neutral name, timezone, locale and currency."),
      href: "/admin/workspace",
      icon: "◎",
    },
    {
      title: t("Catalog"),
      label: t("Services and resources"),
      description: t("Define offers, prices, durations, categories and the resources each service requires."),
      href: "/admin/catalog",
      icon: "▦",
      module: "catalog",
    },
    {
      title: t("Availability"),
      label: t("Rules and slots"),
      description: t("Set weekly resource hours, date exceptions and preview conflict-safe service times."),
      href: "/admin/availability",
      icon: "◷",
      module: "scheduling",
    },
    {
      title: t("Bookings"),
      label: t("Clients and reservations"),
      description: t("Create and reschedule conflict-safe bookings, manage status and keep an activity trail."),
      href: "/admin/bookings",
      icon: "▣",
      module: "scheduling",
    },
    {
      title: t("Clients"),
      label: t("CRM and history"),
      description: t("Keep canonical client cards, contacts, language, tags, notes and booking history in one protected workspace."),
      href: "/admin/clients",
      icon: "◉",
      module: "crm",
    },
    {
      title: t("Calendar"),
      label: t("Day and week timeline"),
      description: t("See occupied time, working windows and blocked intervals across every bookable resource."),
      href: "/admin/calendar",
      icon: "▤",
      module: "scheduling",
    },
    {
      title: t("Payments"),
      label: t("Ledger and balances"),
      description: t("Track required, unpaid, partial, paid and refunded booking balances with an immutable provider-neutral ledger."),
      href: "/admin/payments",
      icon: "¤",
      module: "payments",
    },
    {
      title: t("Notifications"),
      label: t("Resend email delivery"),
      description: t("Deliver queued messages through Resend without changing bookings, templates or the provider-neutral notification ledger."),
      href: "/admin/notifications",
      icon: "✉",
      module: "notifications",
    },
    {
      title: t("Documents"),
      label: t("Documents and Legal"),
      description: t("Manage company details, legal pages, templates, generated snapshots and document email delivery."),
      href: "/admin/documents",
      icon: "▧",
      module: "documents",
    },
    {
      title: t("Analytics"),
      label: t("Business metrics"),
      description: t("See bookings, clients, booked hours and money for a trusted workspace-local period."),
      href: "/admin/analytics",
      icon: "⌁",
      module: "analytics",
    },
    {
      title: t("Public booking"),
      label: t("Client booking flow"),
      description: t("Open the public service, date, slot and contact flow that writes into the canonical booking record."),
      href: "/book",
      icon: "↗",
      module: "scheduling",
    },
    {
      title: t("Media library"),
      label: t("Cloud assets"),
      description: t("Upload, organize and remove images or video stored in Cloudflare R2."),
      href: "/admin/media",
      icon: "◫",
      module: "media",
    },
    {
      title: t("Portfolio"),
      label: t("Published work"),
      description: t("Manage portfolio categories, selected media and display order."),
      href: "/admin/portfolio",
      icon: "◇",
      module: "portfolio",
    },
    {
      title: t("Foundation settings"),
      label: t("Public configuration"),
      description: t("Edit the neutral global, contact and booking settings defined in the clean database."),
      href: "/admin/settings",
      icon: "⚙",
    },
    {
      title: t("Module map"),
      label: t("System architecture"),
      description: t("See every Core Suite module, its version and its dependencies."),
      href: "/admin/modules",
      icon: "⌘",
    },
  ] satisfies ReadonlyArray<{
    title: string;
    label: string;
    description: string;
    href: string;
    icon: string;
    module?: CoreModuleKey;
  }>;

  const visibleModules = enabledModules
    ? readyModules.filter((module) => !module.module || enabledModules.has(module.module))
    : readyModules;
  return (
    <>
      <AdminHeader />
      <main className="min-h-screen px-5 pb-24 pt-36">
        <section className="mx-auto w-full max-w-7xl">
          <div className="rounded-[38px] bg-[#17191f] p-7 text-white shadow-[0_28px_90px_rgba(20,20,20,0.2)] sm:p-10">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d8b36a]">{t("Core Suite 1.0")}</p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">{t("All core modules, one operating system.")}</h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
                  {t("Bookings, clients, payments, notifications, documents and analytics now share one protected workspace and one source of truth.")}
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/[0.07] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#d8b36a]">{t("Release rule")}</p>
                <p className="mt-3 text-2xl font-semibold">{t("One source of truth across every module.")}</p>
                <p className="mt-3 text-sm leading-6 text-white/65">{t("Use the complete suite or keep only the modules this workspace needs.")}</p>
              </div>
            </div>
          </div>

          <CommandCenterOverview t={t} />

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {visibleModules.map((module) => (
              <button key={module.href} type="button" onClick={() => router.push(module.href)} className="rounded-[28px] border border-black/8 bg-white p-6 text-left shadow-[0_18px_55px_rgba(20,20,20,0.07)] transition hover:-translate-y-1">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#17191f] text-xl text-white">{module.icon}</span>
                <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{module.label}</span>
                <span className="mt-2 block text-2xl font-semibold tracking-[-0.04em]">{module.title}</span>
                <span className="mt-3 block text-sm leading-6 text-[#6f6c65]">{module.description}</span>
              </button>
            ))}
          </div>

        </section>
      </main>
    </>
  );
}
