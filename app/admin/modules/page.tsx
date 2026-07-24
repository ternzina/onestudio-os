"use client";

import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import { CORE_MODULES } from "@/lib/modules/registry";
import type { AdminMessage } from "@/lib/i18n/admin";
import type { CoreModuleStage } from "@/lib/modules/contracts";

const stageClasses: Record<CoreModuleStage, string> = {
  enabled: "border-emerald-900/10 bg-emerald-50 text-emerald-800",
  "contract-ready": "border-amber-900/10 bg-amber-50 text-amber-800",
  planned: "border-black/8 bg-[#eeebe3] text-[#77736a]",
};

export default function AdminModulesPage() {
  const { t } = useAdminI18n();
  const stageLabels: Record<CoreModuleStage, string> = {
    enabled: t("Enabled"),
    "contract-ready": t("Contract ready"),
    planned: t("Planned"),
  };

  return (
    <>
      <AdminHeader />
      <main className="min-h-screen px-5 pb-24 pt-36">
        <section className="mx-auto w-full max-w-7xl">
          <div className="rounded-[36px] bg-[#17191f] p-7 text-white shadow-[0_28px_90px_rgba(20,20,20,0.18)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">{t("Payments Core 1.0")}</p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">{t("Every amount leaves a permanent trail.")}</h1>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
                  {t("Canonical bookings now expose required, unpaid, partial, paid and refunded balances through one provider-neutral ledger.")}
                </p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/[0.07] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#d8b36a]">{t("Payment rule")}</p>
                <p className="mt-3 text-lg font-semibold">{t("Append money, never rewrite it.")}</p>
                <p className="mt-2 text-sm leading-6 text-white/62">{t("Posted transactions are immutable. Corrections are recorded as new payments or refunds.")}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {CORE_MODULES.map((module, index) => (
              <article key={module.key} className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.06)]">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-semibold tracking-[0.18em] text-[#9a742e]">{String(index + 1).padStart(2, "0")}</span>
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${stageClasses[module.stage]}`}>
                    {stageLabels[module.stage]}
                  </span>
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">{t(module.title as AdminMessage)}</h2>
                <p className="mt-3 text-sm leading-6 text-[#6f6c65]">{t(module.description as AdminMessage)}</p>
                <div className="mt-5 border-t border-black/8 pt-4 text-xs text-[#8a867d]">
                  <p>{t("Version {version}", { version: module.version })}</p>
                  <p className="mt-1">{t("Depends on: {dependencies}", { dependencies: module.dependsOn.length ? module.dependsOn.join(", ") : t("nothing") })}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
