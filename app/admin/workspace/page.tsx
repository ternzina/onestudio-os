"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { supabase } from "@/lib/supabase";
import type { BusinessRole, BusinessStatus } from "@/lib/modules/contracts";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";

type WorkspaceRow = {
  business_id: string;
  slug: string;
  name: string;
  timezone: string;
  default_locale: string;
  default_currency: string;
  status: BusinessStatus;
  role: BusinessRole;
  is_default: boolean;
  member_since: string;
};

type WorkspaceForm = Pick<WorkspaceRow, "name" | "timezone" | "default_locale" | "default_currency">;

const emptyForm: WorkspaceForm = {
  name: "",
  timezone: "UTC",
  default_locale: "en",
  default_currency: "EUR",
};

const commonTimezones = [
  "UTC",
  "Europe/Warsaw",
  "Europe/Kyiv",
  "Europe/Berlin",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Tokyo",
] as const;

const canEditWorkspace = (role: BusinessRole) => role === "owner" || role === "admin";

export default function AdminWorkspacePage() {
  const { t } = useAdminI18n();
  const roleLabels: Record<BusinessRole, string> = {
    owner: t("Owner"),
    admin: t("Administrator"),
    manager: t("Manager"),
    staff: t("Staff"),
    viewer: t("Viewer"),
  };
  const statusLabels: Record<BusinessStatus, string> = {
    active: t("Active"),
    suspended: t("Suspended"),
    archived: t("Archived"),
  };
  const [workspaces, setWorkspaces] = useState<WorkspaceRow[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState<WorkspaceForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.business_id === selectedId) ?? null,
    [selectedId, workspaces],
  );

  const syncForm = useCallback((workspace: WorkspaceRow | null) => {
    if (!workspace) {
      setForm(emptyForm);
      return;
    }

    setForm({
      name: workspace.name,
      timezone: workspace.timezone,
      default_locale: workspace.default_locale,
      default_currency: workspace.default_currency,
    });
  }, []);

  const loadWorkspaces = useCallback(async (preferredId?: string) => {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase.rpc("list_my_businesses");

    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as WorkspaceRow[];
    setWorkspaces(rows);

    const nextWorkspace =
      rows.find((workspace) => workspace.business_id === preferredId) ??
      rows.find((workspace) => workspace.is_default) ??
      rows[0] ??
      null;

    setSelectedId(nextWorkspace?.business_id ?? "");
    syncForm(nextWorkspace);
    setLoading(false);
  }, [syncForm]);

  useEffect(() => {
    void loadWorkspaces();
  }, [loadWorkspaces]);

  const handleWorkspaceChange = (businessId: string) => {
    const workspace = workspaces.find((item) => item.business_id === businessId) ?? null;
    setSelectedId(businessId);
    syncForm(workspace);
    setMessage("");
    setError("");
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!selectedWorkspace || !canEditWorkspace(selectedWorkspace.role)) {
      setError(t("Only an owner or administrator can edit workspace identity."));
      return;
    }

    const name = form.name.trim();
    const timezone = form.timezone.trim();
    const locale = form.default_locale.trim().toLowerCase();
    const currency = form.default_currency.trim().toUpperCase();

    if (name.length < 2 || name.length > 120) {
      setError(t("Workspace name must contain 2 to 120 characters."));
      return;
    }

    if (!/^[a-z]{2,3}(-[a-z]{2})?$/.test(locale)) {
      setError(t("Use a locale such as en, pl, uk or pt-br."));
      return;
    }

    if (!/^[A-Z]{3}$/.test(currency)) {
      setError(t("Currency must use a three-letter code such as EUR, PLN or USD."));
      return;
    }

    if (!timezone || timezone.length > 80) {
      setError(t("Enter a valid IANA timezone such as Europe/Warsaw."));
      return;
    }

    setSaving(true);
    const { error: saveError } = await supabase
      .from("businesses")
      .update({
        name,
        timezone,
        default_locale: locale,
        default_currency: currency,
      })
      .eq("id", selectedWorkspace.business_id);

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    await loadWorkspaces(selectedWorkspace.business_id);
    setMessage(t("Workspace settings saved."));
    setSaving(false);
  };

  const makeDefault = async () => {
    if (!selectedWorkspace || selectedWorkspace.is_default) return;

    setSwitching(true);
    setMessage("");
    setError("");

    const { data, error: switchError } = await supabase.rpc("set_default_business", {
      p_business_id: selectedWorkspace.business_id,
    });

    if (switchError || data !== true) {
      setError(switchError?.message ?? t("This workspace could not become the default."));
      setSwitching(false);
      return;
    }

    await loadWorkspaces(selectedWorkspace.business_id);
    window.dispatchEvent(new Event("onestudio:modules-changed"));
    setMessage(t("Default workspace changed."));
    setSwitching(false);
  };

  return (
    <>
      <AdminHeader />
      <main className="min-h-screen px-5 pb-24 pt-36">
        <section className="mx-auto w-full max-w-7xl">
          <div className="rounded-[36px] bg-[#17191f] p-7 text-white shadow-[0_28px_90px_rgba(20,20,20,0.18)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">{t("Workspace Context 1.0")}</p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">{t("One workspace at a time.")}</h1>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
                  {t("Every client, service, resource and booking now belongs to an explicit business workspace. Your selected workspace becomes the stable context for the next admin modules.")}
                </p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/[0.07] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#d8b36a]">{t("Access boundary")}</p>
                <p className="mt-3 text-xl font-semibold">{t("Owner · Admin · Manager · Staff · Viewer")}</p>
                <p className="mt-2 text-sm leading-6 text-white/62">{t("Each role receives only the operations it needs. Private data from another workspace remains invisible.")}</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 rounded-[28px] border border-black/8 bg-white p-8 text-sm text-[#6f6c65]">{t("Loading workspace…")}</div>
          ) : workspaces.length === 0 ? (
            <div className="mt-8 rounded-[28px] border border-amber-900/10 bg-amber-50 p-8">
              <h2 className="text-2xl font-semibold tracking-[-0.04em]">{t("No workspace is assigned.")}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-900/70">{t("The signed-in account needs an active row in business_members before the admin modules can use workspace context.")}</p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
              <aside className="rounded-[30px] border border-black/8 bg-[#eeebe3] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">{t("Assigned workspaces")}</p>
                <div className="mt-4 grid gap-3">
                  {workspaces.map((workspace) => {
                    const selected = workspace.business_id === selectedId;
                    return (
                      <button
                        key={workspace.business_id}
                        type="button"
                        onClick={() => handleWorkspaceChange(workspace.business_id)}
                        className={`rounded-[20px] border p-4 text-left transition ${selected ? "border-[#17191f] bg-[#17191f] text-white" : "border-black/8 bg-white/80 text-[#17191f] hover:bg-white"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{workspace.name}</p>
                            <p className={`mt-1 text-xs ${selected ? "text-white/60" : "text-[#7a766d]"}`}>{workspace.slug}</p>
                          </div>
                          {workspace.is_default ? (
                            <span className="rounded-full bg-[#d8b36a] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#17191f]">{t("Current")}</span>
                          ) : null}
                        </div>
                        <p className={`mt-3 text-xs ${selected ? "text-white/70" : "text-[#7a766d]"}`}>{roleLabels[workspace.role]} · {workspace.default_currency}</p>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <form onSubmit={handleSave} className="rounded-[30px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.06)] sm:p-8">
                {selectedWorkspace ? (
                  <>
                    <div className="flex flex-col gap-4 border-b border-black/8 pb-6 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">{t("Workspace identity")}</p>
                        <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{selectedWorkspace.name}</h2>
                        <p className="mt-2 text-sm text-[#77736a]">{t("Role")}: {roleLabels[selectedWorkspace.role]} · {t("Status")}: {statusLabels[selectedWorkspace.status]}</p>
                      </div>
                      <button
                        type="button"
                        onClick={makeDefault}
                        disabled={selectedWorkspace.is_default || switching}
                        className="rounded-full border border-black/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {selectedWorkspace.is_default ? t("Current workspace") : switching ? t("Switching…") : t("Make current")}
                      </button>
                    </div>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <label className="sm:col-span-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#77736a]">{t("Business name")}</span>
                        <input
                          value={form.name}
                          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                          disabled={!canEditWorkspace(selectedWorkspace.role)}
                          maxLength={120}
                          className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fffdfa] px-4 py-3 outline-none transition focus:border-[#9a742e] disabled:opacity-60"
                        />
                      </label>

                      <label>
                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#77736a]">{t("Timezone")}</span>
                        <input
                          list="workspace-timezones"
                          value={form.timezone}
                          onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}
                          disabled={!canEditWorkspace(selectedWorkspace.role)}
                          className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fffdfa] px-4 py-3 outline-none transition focus:border-[#9a742e] disabled:opacity-60"
                        />
                        <datalist id="workspace-timezones">
                          {commonTimezones.map((timezone) => <option key={timezone} value={timezone} />)}
                        </datalist>
                      </label>

                      <label>
                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#77736a]">{t("Default locale")}</span>
                        <input
                          value={form.default_locale}
                          onChange={(event) => setForm((current) => ({ ...current, default_locale: event.target.value }))}
                          disabled={!canEditWorkspace(selectedWorkspace.role)}
                          placeholder="ru"
                          className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fffdfa] px-4 py-3 outline-none transition focus:border-[#9a742e] disabled:opacity-60"
                        />
                      </label>

                      <label>
                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#77736a]">{t("Default currency")}</span>
                        <input
                          value={form.default_currency}
                          onChange={(event) => setForm((current) => ({ ...current, default_currency: event.target.value }))}
                          disabled={!canEditWorkspace(selectedWorkspace.role)}
                          maxLength={3}
                          placeholder="EUR"
                          className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fffdfa] px-4 py-3 uppercase outline-none transition focus:border-[#9a742e] disabled:opacity-60"
                        />
                      </label>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#77736a]">{t("Stable slug")}</p>
                        <div className="mt-2 rounded-2xl border border-black/8 bg-[#eeebe3] px-4 py-3 text-sm text-[#66645f]">{selectedWorkspace.slug}</div>
                      </div>
                    </div>

                    <div className="mt-7 flex flex-col gap-3 border-t border-black/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-h-6 text-sm">
                        {error ? <p className="text-red-700">{error}</p> : null}
                        {message ? <p className="text-emerald-700">{message}</p> : null}
                        {!canEditWorkspace(selectedWorkspace.role) && !error ? <p className="text-[#77736a]">{t("This role has read-only workspace identity access.")}</p> : null}
                      </div>
                      <button
                        type="submit"
                        disabled={saving || !canEditWorkspace(selectedWorkspace.role)}
                        className="rounded-full bg-[#17191f] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {saving ? t("Saving…") : t("Save workspace")}
                      </button>
                    </div>
                  </>
                ) : null}
              </form>
            </div>
          )}

          {error && workspaces.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-red-900/10 bg-red-50 p-4 text-sm text-red-800">{error}</div>
          ) : null}
        </section>
      </main>
    </>
  );
}
