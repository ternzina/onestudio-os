"use client";

import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import NotificationsManager from "./NotificationsManager";

export default function AdminNotificationsPage() {
  const { t } = useAdminI18n();

  return (
    <>
      <AdminHeader />
      <main className="min-h-screen px-5 pb-24 pt-36">
        <section className="mx-auto w-full max-w-[1500px]">
          <div className="rounded-[36px] bg-[#17191f] p-7 text-white shadow-[0_28px_90px_rgba(20,20,20,0.18)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">
              {t("Resend Adapter 1.0")}
            </p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">
                  {t("The queue now has a real postman.")}
                </h1>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
                  {t("Resend claims due jobs, uses stable idempotency keys and writes every result back into the existing delivery history.")}
                </p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/[0.07] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#d8b36a]">
                  {t("Delivery rule")}
                </p>
                <p className="mt-3 text-xl font-semibold">
                  {t("Disabled first, test next, live only when explicitly enabled.")}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/62">
                  {t("The adapter defaults to disabled and never exposes API keys in the browser.")}
                </p>
              </div>
            </div>
          </div>

          <NotificationsManager />
        </section>
      </main>
    </>
  );
}
