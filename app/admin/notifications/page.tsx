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
              {t("Notifications Core 1.0")}
            </p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">
                  {t("Every message has a durable place in line.")}
                </h1>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
                  {t("Prepare confirmations, reminders and payment messages with language-aware templates before a provider adapter sends them.")}
                </p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/[0.07] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#d8b36a]">
                  {t("Provider boundary")}
                </p>
                <p className="mt-3 text-xl font-semibold">
                  {t("The queue is ready; sending connects next.")}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/62">
                  {t("Resend, SMTP or another adapter will claim due jobs without changing bookings, templates or delivery history.")}
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
