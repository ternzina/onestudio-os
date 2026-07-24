"use client";

import { useRouter } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";

export default function AdminPage() {
  const router = useRouter();
  const { t } = useAdminI18n();
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
    },
    {
      title: t("Availability"),
      label: t("Rules and slots"),
      description: t("Set weekly resource hours, date exceptions and preview conflict-safe service times."),
      href: "/admin/availability",
      icon: "◷",
    },
    {
      title: t("Bookings"),
      label: t("Clients and reservations"),
      description: t("Create and reschedule conflict-safe bookings, manage status and keep an activity trail."),
      href: "/admin/bookings",
      icon: "▣",
    },
    {
      title: t("Media library"),
      label: t("Cloud assets"),
      description: t("Upload, organize and remove images or video stored in Cloudflare R2."),
      href: "/admin/media",
      icon: "◫",
    },
    {
      title: t("Portfolio"),
      label: t("Published work"),
      description: t("Manage portfolio categories, selected media and display order."),
      href: "/admin/portfolio",
      icon: "◇",
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
      description: t("See which modules are enabled, contract-ready or still planned."),
      href: "/admin/modules",
      icon: "⌘",
    },
  ];
  const nextModules = [t("Public booking UI"), t("Payments"), t("Notifications"), t("Analytics")];

  return (
    <>
      <AdminHeader />
      <main className="min-h-screen px-5 pb-24 pt-36">
        <section className="mx-auto w-full max-w-7xl">
          <div className="rounded-[38px] bg-[#17191f] p-7 text-white shadow-[0_28px_90px_rgba(20,20,20,0.2)] sm:p-10">
            <p className="text-xs uppercase tracking-[0.3em] text-[#d8b36a]">{t("Booking Core 1.0")}</p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">{t("The clock accepts a reservation.")}</h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/68 sm:text-base">
                  {t("Calculated slots can now become durable bookings with clients, reserved resources, status transitions and a protected activity trail.")}
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/[0.07] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#d8b36a]">{t("Booking rule")}</p>
                <p className="mt-3 text-2xl font-semibold">{t("The database checks the slot twice.")}</p>
                <p className="mt-3 text-sm leading-6 text-white/65">{t("Availability proposes the time; Booking Core checks it again inside the transaction before resources are reserved.")}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {readyModules.map((module) => (
              <button key={module.href} type="button" onClick={() => router.push(module.href)} className="rounded-[28px] border border-black/8 bg-white p-6 text-left shadow-[0_18px_55px_rgba(20,20,20,0.07)] transition hover:-translate-y-1">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#17191f] text-xl text-white">{module.icon}</span>
                <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{module.label}</span>
                <span className="mt-2 block text-2xl font-semibold tracking-[-0.04em]">{module.title}</span>
                <span className="mt-3 block text-sm leading-6 text-[#6f6c65]">{module.description}</span>
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-[30px] border border-black/8 bg-[#eeebe3] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">{t("Next product layers")}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {nextModules.map((module, index) => (
                <div key={module} className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs text-[#9a742e]">0{index + 1}</p>
                  <p className="mt-2 text-sm font-semibold">{module}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
