"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import type { AdminMessage } from "@/lib/i18n/admin";
import type { BusinessRole, CoreModuleKey } from "@/lib/modules/contracts";
import { CORE_MODULES } from "@/lib/modules/registry";
import { supabase } from "@/lib/supabase";

type WorkspaceRow = {
  business_id: string;
  name: string;
  role: BusinessRole;
  is_default: boolean;
};
type ModuleRow = {
  module_key: CoreModuleKey;
  enabled: boolean;
  version: string;
};

const requiredKeys = new Set<CoreModuleKey>(["core", "catalog", "scheduling", "crm"]);
const optionalKeys: CoreModuleKey[] = ["media", "portfolio", "payments", "notifications", "documents", "analytics"];

function normalizeOptionalSelection(keys: Iterable<CoreModuleKey>) {
  const selected = new Set(keys);
  if (selected.has("portfolio")) selected.add("media");
  if (selected.has("notifications")) selected.add("payments");
  if (selected.has("documents")) {
    selected.add("payments");
    selected.add("notifications");
  }
  return selected;
}

function toggleOptionalSelection(current: Set<CoreModuleKey>, key: CoreModuleKey) {
  const next = new Set(current);
  if (next.has(key)) {
    next.delete(key);
    if (key === "media") next.delete("portfolio");
    if (key === "payments") {
      next.delete("notifications");
      next.delete("documents");
    }
    if (key === "notifications") next.delete("documents");
  } else {
    next.add(key);
  }
  return normalizeOptionalSelection(next);
}

export default function AdminModulesPage() {
  const { t } = useAdminI18n();
  const [workspace, setWorkspace] = useState<WorkspaceRow | null>(null);
  const [databaseModules, setDatabaseModules] = useState<ModuleRow[]>([]);
  const [selectedOptional, setSelectedOptional] = useState<Set<CoreModuleKey>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canManage = workspace?.role === "owner" || workspace?.role === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data: workspaceData, error: workspaceError } = await supabase.rpc("list_my_businesses");
    if (workspaceError) {
      setError(workspaceError.message);
      setLoading(false);
      return;
    }

    const workspaces = (workspaceData ?? []) as WorkspaceRow[];
    const current = workspaces.find((item) => item.is_default) ?? workspaces[0] ?? null;
    setWorkspace(current);
    if (!current) {
      setError(t("No active workspace was found."));
      setLoading(false);
      return;
    }

    const { data, error: moduleError } = await supabase
      .from("business_modules")
      .select("module_key,enabled,version")
      .eq("business_id", current.business_id)
      .order("module_key");

    if (moduleError) {
      setError(moduleError.message);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as ModuleRow[];
    setDatabaseModules(rows);
    setSelectedOptional(normalizeOptionalSelection(
      rows
        .filter((module) => module.enabled && optionalKeys.includes(module.module_key))
        .map((module) => module.module_key),
    ));
    setLoading(false);
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const databaseByKey = useMemo(
    () => new Map(databaseModules.map((module) => [module.module_key, module])),
    [databaseModules],
  );

  const selectedCount = requiredKeys.size + selectedOptional.size;

  async function saveModules() {
    if (!workspace || !canManage) return;
    setSaving(true);
    setMessage("");
    setError("");

    const { error: saveError } = await supabase.rpc("configure_business_modules", {
      p_business_id: workspace.business_id,
      p_enabled_module_keys: [...selectedOptional],
    });

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    await load();
    window.dispatchEvent(new Event("onestudio:modules-changed"));
    setMessage(t("Module selection saved."));
    setSaving(false);
  }

  return (
    <>
      <AdminHeader />
      <main className="min-h-screen px-5 pb-24 pt-36">
        <section className="mx-auto w-full max-w-7xl">
          <div className="rounded-[36px] bg-[#17191f] p-7 text-white shadow-[0_28px_90px_rgba(20,20,20,0.18)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">{t("Client Launch 1.0")}</p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">{t("Choose the tools this workspace needs.")}</h1>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
                  {t("Core operations stay protected while optional modules can be enabled as the business grows.")}
                </p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/[0.07] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#d8b36a]">{t("Current selection")}</p>
                <p className="mt-3 text-lg font-semibold">{t("{count} of 10 modules enabled", { count: selectedCount })}</p>
                <p className="mt-2 text-sm leading-6 text-white/62">{t("Required dependencies are added automatically.")}</p>
              </div>
            </div>
          </div>

          {message || error ? (
            <div className={`mt-6 rounded-2xl border px-5 py-4 text-sm ${
              error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}>
              {error || message}
            </div>
          ) : null}

          {loading ? (
            <div className="mt-8 rounded-[28px] border border-black/8 bg-white p-8 text-sm text-[#6f6c65]">{t("Loading modules…")}</div>
          ) : (
            <>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {CORE_MODULES.map((module, index) => {
                  const required = requiredKeys.has(module.key);
                  const selected = required || selectedOptional.has(module.key);
                  const databaseModule = databaseByKey.get(module.key);
                  return (
                    <article key={module.key} className={`rounded-[28px] border p-6 shadow-[0_18px_55px_rgba(20,20,20,0.06)] transition ${
                      selected ? "border-emerald-900/10 bg-white" : "border-black/8 bg-[#eeebe3]"
                    }`}>
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-xs font-semibold tracking-[0.18em] text-[#9a742e]">{String(index + 1).padStart(2, "0")}</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={selected}
                          disabled={required || !canManage || saving}
                          onClick={() => setSelectedOptional((current) => toggleOptionalSelection(current, module.key))}
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                            selected
                              ? "border-emerald-900/10 bg-emerald-50 text-emerald-800"
                              : "border-black/8 bg-white text-[#77736a]"
                          } disabled:cursor-not-allowed`}
                        >
                          {required ? t("Required") : selected ? t("Enabled") : t("Disabled")}
                        </button>
                      </div>
                      <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">{t(module.title as AdminMessage)}</h2>
                      <p className="mt-3 text-sm leading-6 text-[#6f6c65]">{t(module.description as AdminMessage)}</p>
                      <div className="mt-5 border-t border-black/8 pt-4 text-xs text-[#8a867d]">
                        <p>{t("Version {version}", { version: databaseModule?.version ?? module.version })}</p>
                        <p className="mt-1">{t("Depends on: {dependencies}", { dependencies: module.dependsOn.length ? module.dependsOn.join(", ") : t("nothing") })}</p>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="sticky bottom-5 mt-6 flex flex-col gap-3 rounded-[24px] border border-black/8 bg-white/95 p-4 shadow-[0_18px_60px_rgba(20,20,20,0.12)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#6f6c65]">
                  {canManage ? t("Changes affect this workspace only.") : t("Only an owner or administrator can change modules.")}
                </p>
                <button
                  type="button"
                  onClick={saveModules}
                  disabled={!canManage || saving}
                  className="rounded-full bg-[#17191f] px-6 py-3 text-sm font-semibold text-white disabled:opacity-45"
                >
                  {saving ? t("Saving…") : t("Save modules")}
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}
