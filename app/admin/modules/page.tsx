import AdminHeader from "@/components/admin/AdminHeader";
import { CORE_MODULES } from "@/lib/modules/registry";
import type { CoreModuleStage } from "@/lib/modules/contracts";

const stageCopy: Record<CoreModuleStage, { label: string; className: string }> = {
  enabled: {
    label: "Enabled",
    className: "border-emerald-900/10 bg-emerald-50 text-emerald-800",
  },
  "contract-ready": {
    label: "Contract ready",
    className: "border-amber-900/10 bg-amber-50 text-amber-800",
  },
  planned: {
    label: "Planned",
    className: "border-black/8 bg-[#eeebe3] text-[#77736a]",
  },
};

export default function AdminModulesPage() {
  return (
    <>
      <AdminHeader />
      <main className="min-h-screen px-5 pb-24 pt-36">
        <section className="mx-auto w-full max-w-7xl">
          <div className="rounded-[36px] bg-[#17191f] p-7 text-white shadow-[0_28px_90px_rgba(20,20,20,0.18)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">Catalog Core 1.0</p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">One catalog, many business models.</h1>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
                  The catalog contract is now active in the admin. Services define appointments, rentals, classes and events, while resources define the capacity each offer needs.
                </p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/[0.07] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#d8b36a]">Compatibility rule</p>
                <p className="mt-3 text-lg font-semibold">Booking flows remain untouched.</p>
                <p className="mt-2 text-sm leading-6 text-white/62">Scheduling and checkout will consume this catalog only after their own contracts and tests are complete.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {CORE_MODULES.map((module, index) => {
              const stage = stageCopy[module.stage];
              return (
                <article key={module.key} className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.06)]">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs font-semibold tracking-[0.18em] text-[#9a742e]">{String(index + 1).padStart(2, "0")}</span>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${stage.className}`}>
                      {stage.label}
                    </span>
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">{module.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#6f6c65]">{module.description}</p>
                  <div className="mt-5 border-t border-black/8 pt-4 text-xs text-[#8a867d]">
                    <p>Version {module.version}</p>
                    <p className="mt-1">Depends on: {module.dependsOn.length ? module.dependsOn.join(", ") : "nothing"}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
