"use client";

import Link from "next/link";
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
  booking_count: number;
  client_count: number;
  payment_count: number;
  request_count: number;
  document_count: number;
  notification_count: number;
  google_calendar_connected: boolean;
  can_archive: boolean;
  can_delete: boolean;
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
const isOwner = (role: BusinessRole) => role === "owner";

export default function AdminWorkspacePage() {
  const { t } = useAdminI18n();
  const lifecycleErrorMessage = useCallback((value: string) => {
    if (value.includes("cannot_archive_last_workspace")) return t("The last active workspace cannot be archived.");
    if (value.includes("workspace_limit_reached")) return t("You can have up to three active owned workspaces.");
    if (value.includes("workspace_has_operational_data")) return t("This workspace contains operational records and can only be archived.");
    if (value.includes("workspace_confirmation_mismatch")) return t("Enter the workspace name exactly as shown.");
    if (value.includes("workspace_foundation_cannot_be_deleted")) return t("The foundation workspace can be archived but cannot be permanently deleted.");
    if (value.includes("workspace_owner_required")) return t("Only the workspace owner can perform this action.");
    return value;
  }, [t]);

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
  const [action, setAction] = useState<"save" | "switch" | "archive" | "restore" | "delete" | "">("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.business_id === selectedId) ?? null,
    [selectedId, workspaces],
  );

  const operationalCount = selectedWorkspace
    ? selectedWorkspace.booking_count
      + selectedWorkspace.client_count
      + selectedWorkspace.payment_count
      + selectedWorkspace.request_count
      + selectedWorkspace.document_count
      + selectedWorkspace.notification_count
    : 0;

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

    const { data, error: loadError } = await supabase.rpc("list_my_workspace_management");

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
      rows.find((workspace) => workspace.status !== "archived") ??
      rows[0] ??
      null;

    setSelectedId(nextWorkspace?.business_id ?? "");
    syncForm(nextWorkspace);
    setDeleteConfirmation("");
    setLoading(false);
  }, [syncForm]);

  useEffect(() => {
    void loadWorkspaces();
  }, [loadWorkspaces]);

  const handleWorkspaceChange = (businessId: string) => {
    const workspace = workspaces.find((item) => item.business_id === businessId) ?? null;
    setSelectedId(businessId);
    syncForm(workspace);
    setDeleteConfirmation("");
    setMessage("");
    setError("");
  };

  const announceWorkspaceChange = () => {
    window.dispatchEvent(new Event("onestudio:modules-changed"));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (
      !selectedWorkspace
      || !canEditWorkspace(selectedWorkspace.role)
      || selectedWorkspace.status === "archived"
    ) {
      setError(t("Only an owner or administrator can edit an active workspace identity."));
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

    setAction("save");
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
      setAction("");
      return;
    }

    await loadWorkspaces(selectedWorkspace.business_id);
    setMessage(t("Workspace settings saved."));
    setAction("");
  };

  const makeDefault = async () => {
    if (!selectedWorkspace || selectedWorkspace.is_default || selectedWorkspace.status === "archived") return;

    setAction("switch");
    setMessage("");
    setError("");

    const { data, error: switchError } = await supabase.rpc("set_default_business", {
      p_business_id: selectedWorkspace.business_id,
    });

    if (switchError || data !== true) {
      setError(switchError?.message ?? t("This workspace could not become the default."));
      setAction("");
      return;
    }

    await loadWorkspaces(selectedWorkspace.business_id);
    announceWorkspaceChange();
    setMessage(t("Default workspace changed."));
    setAction("");
  };

  const archiveWorkspace = async () => {
    if (!selectedWorkspace || !selectedWorkspace.can_archive) return;
    if (!window.confirm(t("Archive this workspace? Its site and booking page will stop opening, but all data will remain available for restoration."))) {
      return;
    }

    setAction("archive");
    setMessage("");
    setError("");

    const { data, error: archiveError } = await supabase.rpc("archive_my_workspace", {
      p_business_id: selectedWorkspace.business_id,
    });

    if (archiveError) {
      setError(lifecycleErrorMessage(archiveError.message));
      setAction("");
      return;
    }

    await loadWorkspaces((data as string | null) ?? undefined);
    announceWorkspaceChange();
    setMessage(t("Workspace archived. Its data was preserved."));
    setAction("");
  };

  const restoreWorkspace = async () => {
    if (!selectedWorkspace || !isOwner(selectedWorkspace.role) || selectedWorkspace.status !== "archived") return;

    setAction("restore");
    setMessage("");
    setError("");

    const { data, error: restoreError } = await supabase.rpc("restore_my_workspace", {
      p_business_id: selectedWorkspace.business_id,
    });

    if (restoreError || data !== true) {
      setError(lifecycleErrorMessage(restoreError?.message ?? "workspace_restore_failed"));
      setAction("");
      return;
    }

    await loadWorkspaces(selectedWorkspace.business_id);
    setMessage(t("Workspace restored. Make it current before editing its modules."));
    setAction("");
  };

  const deleteWorkspace = async () => {
    if (!selectedWorkspace || !selectedWorkspace.can_delete) return;
    if (deleteConfirmation !== selectedWorkspace.name) {
      setError(t("Enter the workspace name exactly as shown."));
      return;
    }

    setAction("delete");
    setMessage("");
    setError("");

    const { data, error: deleteError } = await supabase.rpc("delete_my_empty_workspace", {
      p_business_id: selectedWorkspace.business_id,
      p_confirmation_name: deleteConfirmation,
    });

    if (deleteError) {
      setError(lifecycleErrorMessage(deleteError.message));
      setAction("");
      return;
    }

    await loadWorkspaces((data as string | null) ?? undefined);
    announceWorkspaceChange();
    setMessage(t("Empty workspace permanently deleted."));
    setAction("");
  };

  return (
    <>
      <AdminHeader />
      <main className="min-h-screen px-5 pb-24 pt-36">
        <section className="mx-auto w-full max-w-7xl">
          <div className="rounded-[36px] bg-[#17191f] p-7 text-white shadow-[0_28px_90px_rgba(20,20,20,0.18)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">{t("Workspace Lifecycle 1.0")}</p>
            <div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">{t("Choose the exact business you are editing.")}</h1>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
                  {t("The current workspace controls the admin calendar, catalog, public site and booking links. Archive workspaces with history; permanently delete only disposable empty workspaces.")}
                </p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-white/[0.07] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#d8b36a]">{t("Safety rule")}</p>
                <p className="mt-3 text-xl font-semibold">{t("Archive preserves data. Delete removes it forever.")}</p>
                <p className="mt-2 text-sm leading-6 text-white/62">{t("A workspace with bookings, clients, payments, requests, documents, notifications or a connected calendar cannot be permanently deleted.")}</p>
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
            <div className="mt-8 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
              <aside className="rounded-[30px] border border-black/8 bg-[#eeebe3] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">{t("Assigned workspaces")}</p>
                <div className="mt-4 grid gap-3">
                  {workspaces.map((workspace) => {
                    const selected = workspace.business_id === selectedId;
                    const archived = workspace.status === "archived";
                    return (
                      <button
                        key={workspace.business_id}
                        type="button"
                        onClick={() => handleWorkspaceChange(workspace.business_id)}
                        className={`rounded-[20px] border p-4 text-left transition ${
                          selected
                            ? "border-[#17191f] bg-[#17191f] text-white"
                            : archived
                              ? "border-black/8 bg-white/45 text-[#77736a]"
                              : "border-black/8 bg-white/80 text-[#17191f] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{workspace.name}</p>
                            <p className={`mt-1 text-xs ${selected ? "text-white/60" : "text-[#7a766d]"}`}>{workspace.slug}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            {workspace.is_default ? (
                              <span className="rounded-full bg-[#d8b36a] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#17191f]">{t("Current")}</span>
                            ) : null}
                            {archived ? (
                              <span className="rounded-full border border-current/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]">{t("Archived")}</span>
                            ) : null}
                          </div>
                        </div>
                        <p className={`mt-3 text-xs ${selected ? "text-white/70" : "text-[#7a766d]"}`}>{roleLabels[workspace.role]} · {workspace.default_currency}</p>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <div className="grid gap-6">
                <form onSubmit={handleSave} className="rounded-[30px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.06)] sm:p-8">
                  {selectedWorkspace ? (
                    <>
                      <div className="flex flex-col gap-4 border-b border-black/8 pb-6 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">{t("Workspace identity")}</p>
                          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{selectedWorkspace.name}</h2>
                          <p className="mt-2 text-sm text-[#77736a]">
                            {t("Role")}: {roleLabels[selectedWorkspace.role]} · {t("Status")}: {statusLabels[selectedWorkspace.status]}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={makeDefault}
                          disabled={selectedWorkspace.is_default || selectedWorkspace.status === "archived" || action !== ""}
                          className="rounded-full border border-black/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {selectedWorkspace.is_default ? t("Current workspace") : action === "switch" ? t("Switching…") : t("Make current")}
                        </button>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <Link href={`/site/${selectedWorkspace.slug}`} target="_blank" className={`rounded-2xl border border-black/8 px-4 py-3 text-center text-sm font-semibold ${selectedWorkspace.status === "archived" ? "pointer-events-none opacity-35" : ""}`}>
                          {t("Open this public site")}
                        </Link>
                        <Link href={`/book/${selectedWorkspace.slug}`} target="_blank" className={`rounded-2xl border border-black/8 px-4 py-3 text-center text-sm font-semibold ${selectedWorkspace.status === "archived" ? "pointer-events-none opacity-35" : ""}`}>
                          {t("Open this booking page")}
                        </Link>
                      </div>

                      <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <label className="sm:col-span-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#77736a]">{t("Business name")}</span>
                          <input
                            value={form.name}
                            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                            disabled={!canEditWorkspace(selectedWorkspace.role) || selectedWorkspace.status === "archived"}
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
                            disabled={!canEditWorkspace(selectedWorkspace.role) || selectedWorkspace.status === "archived"}
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
                            disabled={!canEditWorkspace(selectedWorkspace.role) || selectedWorkspace.status === "archived"}
                            placeholder="ru"
                            className="mt-2 w-full rounded-2xl border border-black/10 bg-[#fffdfa] px-4 py-3 outline-none transition focus:border-[#9a742e] disabled:opacity-60"
                          />
                        </label>

                        <label>
                          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#77736a]">{t("Default currency")}</span>
                          <input
                            value={form.default_currency}
                            onChange={(event) => setForm((current) => ({ ...current, default_currency: event.target.value }))}
                            disabled={!canEditWorkspace(selectedWorkspace.role) || selectedWorkspace.status === "archived"}
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
                        </div>
                        <button
                          type="submit"
                          disabled={action !== "" || !canEditWorkspace(selectedWorkspace.role) || selectedWorkspace.status === "archived"}
                          className="rounded-full bg-[#17191f] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {action === "save" ? t("Saving…") : t("Save workspace")}
                        </button>
                      </div>
                    </>
                  ) : null}
                </form>

                {selectedWorkspace ? (
                  <section className="rounded-[30px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.05)] sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">{t("Workspace data and lifecycle")}</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {[
                        [t("Bookings"), selectedWorkspace.booking_count],
                        [t("Clients"), selectedWorkspace.client_count],
                        [t("Payments"), selectedWorkspace.payment_count],
                        [t("Requests"), selectedWorkspace.request_count],
                        [t("Documents"), selectedWorkspace.document_count],
                        [t("Notifications"), selectedWorkspace.notification_count],
                      ].map(([label, value]) => (
                        <div key={String(label)} className="rounded-2xl bg-[#f4f1ea] p-4">
                          <p className="text-xs uppercase tracking-[0.14em] text-[#77736a]">{label}</p>
                          <p className="mt-2 text-2xl font-semibold">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-2xl border border-black/8 px-4 py-3 text-sm text-[#66645f]">
                      {t("Google Calendar")}: {selectedWorkspace.google_calendar_connected ? t("Connected") : t("Not connected")}
                    </div>

                    <div className="mt-6 grid gap-4 border-t border-black/8 pt-6 lg:grid-cols-2">
                      <div className="rounded-[24px] border border-amber-900/10 bg-amber-50 p-5">
                        <h3 className="text-lg font-semibold">{t("Archive workspace")}</h3>
                        <p className="mt-2 text-sm leading-6 text-amber-950/70">{t("Archiving hides the public site and removes this workspace from the active admin context. All records remain stored and the workspace can be restored.")}</p>
                        {selectedWorkspace.status === "archived" ? (
                          <button type="button" onClick={restoreWorkspace} disabled={action !== "" || !isOwner(selectedWorkspace.role)} className="mt-4 rounded-full bg-[#17191f] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-40">
                            {action === "restore" ? t("Restoring…") : t("Restore workspace")}
                          </button>
                        ) : (
                          <button type="button" onClick={archiveWorkspace} disabled={action !== "" || !selectedWorkspace.can_archive} className="mt-4 rounded-full border border-amber-900/20 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-amber-950 disabled:opacity-40">
                            {action === "archive" ? t("Archiving…") : t("Archive workspace")}
                          </button>
                        )}
                        {!selectedWorkspace.can_archive && selectedWorkspace.status !== "archived" ? (
                          <p className="mt-3 text-xs leading-5 text-amber-950/60">{t("The last active workspace cannot be archived.")}</p>
                        ) : null}
                      </div>

                      <div className="rounded-[24px] border border-red-900/10 bg-red-50 p-5">
                        <h3 className="text-lg font-semibold text-red-950">{t("Delete permanently")}</h3>
                        <p className="mt-2 text-sm leading-6 text-red-950/70">{t("Permanent deletion is available only for an empty disposable workspace. Site design, catalog and settings will also be removed.")}</p>
                        {selectedWorkspace.can_delete ? (
                          <>
                            <label className="mt-4 block">
                              <span className="text-xs font-semibold uppercase tracking-[0.13em] text-red-950/65">{t("Type the workspace name to confirm")}</span>
                              <input value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} placeholder={selectedWorkspace.name} className="mt-2 w-full rounded-2xl border border-red-900/15 bg-white px-4 py-3 outline-none focus:border-red-700" />
                            </label>
                            <button type="button" onClick={deleteWorkspace} disabled={action !== "" || deleteConfirmation !== selectedWorkspace.name} className="mt-4 rounded-full bg-red-800 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-35">
                              {action === "delete" ? t("Deleting…") : t("Delete permanently")}
                            </button>
                          </>
                        ) : (
                          <p className="mt-4 text-xs leading-5 text-red-950/65">
                            {operationalCount > 0 || selectedWorkspace.google_calendar_connected
                              ? t("This workspace contains operational records and can only be archived.")
                              : t("This workspace is protected.")}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>
                ) : null}
              </div>
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
