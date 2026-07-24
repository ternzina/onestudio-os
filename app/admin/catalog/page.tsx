"use client";

import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import CatalogManager from "./CatalogManager";

export default function AdminCatalogPage() {
  const { t } = useAdminI18n();
  return (
    <>
      <AdminHeader />
      <main className="min-h-screen px-5 pb-24 pt-36">
        <section className="mx-auto w-full max-w-7xl">
          <div className="rounded-[36px] bg-[#17191f] p-7 text-white shadow-[0_28px_90px_rgba(20,20,20,0.18)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">{t("Catalog Core 1.0")}</p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">{t("What you sell. What it uses.")}</h1>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
                  {t("Services describe the offer. Resources describe the staff, spaces, equipment or capacity occupied while it is delivered. The same catalog now supports appointments, rentals, classes and events.")}
                </p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/[0.07] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#d8b36a]">{t("Stable boundary")}</p>
                <p className="mt-3 text-xl font-semibold">{t("Catalog only")}</p>
                <p className="mt-2 text-sm leading-6 text-white/62">{t("No schedules, bookings, checkout or reminders are created in this layer.")}</p>
              </div>
            </div>
          </div>

          <CatalogManager />
        </section>
      </main>
    </>
  );
}
