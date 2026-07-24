"use client";

import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import PortfolioProjectsManager from "./PortfolioProjectsManager";

export default function AdminPortfolioPage() {
  const { t } = useAdminI18n();
  return (
    <main className="min-h-screen px-4 pb-16 pt-24 sm:px-6 lg:px-10">
      <AdminHeader />
      <div className="mx-auto max-w-7xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#9a742e]">{t("Core module")}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">{t("Portfolio projects")}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6f6c65]">
            {t("Prepare reusable projects, covers and ordered galleries. Public presentation templates will be connected in a later layer.")}
          </p>
        </div>
        <div className="mt-8">
          <PortfolioProjectsManager />
        </div>
      </div>
    </main>
  );
}
