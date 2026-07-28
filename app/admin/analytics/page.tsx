"use client";

import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import AnalyticsManager from "./AnalyticsManager";

export default function AdminAnalyticsPage() {
  const { t } = useAdminI18n();

  return (
    <>
      <AdminHeader />
      <main className="min-h-screen px-5 pb-24 pt-36">
        <section className="mx-auto w-full max-w-[1500px]">
          <div className="rounded-[36px] bg-[#17191f] p-7 text-white shadow-[0_28px_90px_rgba(20,20,20,0.18)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">
              {t("Analytics Core 1.0")}
            </p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">
                  {t("The business finally sees its own rhythm.")}
                </h1>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
                  {t("Bookings, clients, time and money are calculated from the same canonical records that run daily operations.")}
                </p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/[0.07] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#d8b36a]">
                  {t("Analytics rule")}
                </p>
                <p className="mt-3 text-xl font-semibold">
                  {t("One workspace, one currency, no invented numbers.")}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/62">
                  {t("Money totals use the workspace currency. Bookings in another currency are disclosed separately instead of being mixed together.")}
                </p>
              </div>
            </div>
          </div>

          <AnalyticsManager />
        </section>
      </main>
    </>
  );
}
