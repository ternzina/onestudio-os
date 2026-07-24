"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import { supabase } from "@/lib/supabase";
import type { AdminMessage } from "@/lib/i18n/admin";
import type {
  BookingSource,
  BookingStatus,
  BusinessRole,
  PaymentStatus,
} from "@/lib/modules/contracts";

type WorkspaceRow = {
  business_id: string;
  name: string;
  timezone: string;
  default_locale: string;
  default_currency: string;
  role: BusinessRole;
  is_default: boolean;
};

type ClientRow = {
  id: string;
  business_id: string;
  auth_user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  locale: string;
  notes: string;
  tags: string[];
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  booking_count: number;
  upcoming_count: number;
  completed_count: number;
  no_show_count: number;
  cancelled_count: number;
  next_booking_at: string | null;
  last_booking_at: string | null;
  booked_value_minor: number;
  currency: string;
};

type ClientBookingRow = {
  id: string;
  reference: string;
  service_id: string;
  service_title: string;
  status: BookingStatus;
  source: BookingSource;
  starts_at: string;
  ends_at: string;
  timezone: string;
  party_size: number;
  total_minor: number;
  currency: string;
  payment_status: PaymentStatus;
};

type ClientEventRow = {
  id: string;
  event_type: "created" | "updated" | "archived" | "restored" | "merged";
  actor_user_id: string | null;
  changes: Record<string, unknown>;
  created_at: string;
};

type ClientDraft = {
  name: string;
  email: string;
  phone: string;
  locale: string;
  notes: string;
  tags: string;
};

const inputClass =
  "w-full rounded-2xl border border-black/10 bg-[#fffdfa] px-4 py-3 text-sm outline-none transition focus:border-[#9a742e] disabled:cursor-not-allowed disabled:opacity-55";
const buttonClass =
  "rounded-full bg-[#17191f] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-45";
const secondaryButtonClass =
  "rounded-full border border-black/10 px-4 py-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-45";

const statusMessages: Record<BookingStatus, AdminMessage> = {
  draft: "Draft",
  hold: "Hold",
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

const eventMessages: Record<ClientEventRow["event_type"], AdminMessage> = {
  created: "Client created",
  updated: "Client updated",
  archived: "Client archived",
  restored: "Client restored",
  merged: "Clients merged",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#77736a]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function emptyDraft(locale = "ru"): ClientDraft {
  return {
    name: "",
    email: "",
    phone: "",
    locale,
    notes: "",
    tags: "",
  };
}

function toDraft(client: ClientRow): ClientDraft {
  return {
    name: client.name,
    email: client.email ?? "",
    phone: client.phone ?? "",
    locale: client.locale,
    notes: client.notes,
    tags: client.tags.join(", "),
  };
}

function toCount(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizePhone(value: string | null) {
  return (value ?? "").replace(/\D/g, "");
}

function normalizeEmail(value: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function formatDateTime(iso: string, timezone: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    timeZone: timezone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    dateStyle: "medium",
  }).format(new Date(iso));
}

function formatMoney(amountMinor: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    style: "currency",
    currency,
  }).format(amountMinor / 100);
}

export default function ClientsManager() {
  const router = useRouter();
  const { locale: adminLocale, t } = useAdminI18n();
  const [workspace, setWorkspace] = useState<WorkspaceRow | null>(null);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [history, setHistory] = useState<ClientBookingRow[]>([]);
  const [events, setEvents] = useState<ClientEventRow[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [requestedClientId, setRequestedClientId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ClientDraft>(emptyDraft());
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const canOperate = workspace ? workspace.role !== "viewer" : false;
  const selectedClient = useMemo(
    () => clients.find((client) => client.id === selectedClientId) ?? null,
    [clients, selectedClientId],
  );

  const visibleClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    return clients.filter((client) => {
      if (!showArchived && client.archived_at) return false;
      if (!query) return true;
      return [
        client.name,
        client.email ?? "",
        client.phone ?? "",
        client.tags.join(" "),
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [clients, search, showArchived]);

  const duplicateCandidates = useMemo(() => {
    if (!selectedClient) return [];
    const selectedEmail = normalizeEmail(selectedClient.email);
    const selectedPhone = normalizePhone(selectedClient.phone);
    return clients.filter((candidate) => {
      if (candidate.id === selectedClient.id) return false;
      const sameEmail =
        Boolean(selectedEmail) && selectedEmail === normalizeEmail(candidate.email);
      const samePhone =
        selectedPhone.length >= 7 && selectedPhone === normalizePhone(candidate.phone);
      const sameName =
        candidate.name.trim().toLowerCase() === selectedClient.name.trim().toLowerCase();
      return sameEmail || samePhone || (sameName && Boolean(candidate.email || candidate.phone));
    });
  }, [clients, selectedClient]);

  const resetMessages = () => {
    setNotice("");
    setError("");
  };

  const loadClientDetails = useCallback(async (clientId: string) => {
    setDetailsLoading(true);
    const [historyResult, eventResult] = await Promise.all([
      supabase.rpc("get_admin_client_bookings", { p_client_id: clientId }),
      supabase.rpc("get_admin_client_events", { p_client_id: clientId }),
    ]);

    const firstError = historyResult.error ?? eventResult.error;
    if (firstError) {
      setError(firstError.message);
      setDetailsLoading(false);
      return;
    }

    setHistory((historyResult.data ?? []) as ClientBookingRow[]);
    setEvents((eventResult.data ?? []) as ClientEventRow[]);
    setDetailsLoading(false);
  }, []);

  const selectClient = useCallback((client: ClientRow) => {
    resetMessages();
    setSelectedClientId(client.id);
    setDraft(toDraft(client));
  }, []);

  const loadWorkspaceClients = useCallback(
    async (
      businessId: string,
      preferredClientId: string | null = null,
      defaultLocale = "ru",
    ) => {
      const { data, error: clientError } = await supabase.rpc("get_admin_clients_crm", {
        p_business_id: businessId,
        p_include_archived: true,
      });

      if (clientError) throw clientError;

      const rows = ((data ?? []) as ClientRow[]).map((client) => ({
        ...client,
        booking_count: toCount(client.booking_count),
        upcoming_count: toCount(client.upcoming_count),
        completed_count: toCount(client.completed_count),
        no_show_count: toCount(client.no_show_count),
        cancelled_count: toCount(client.cancelled_count),
        booked_value_minor: toCount(client.booked_value_minor),
      }));

      setClients(rows);
      const nextSelected =
        rows.find((client) => client.id === preferredClientId) ??
        rows.find((client) => !client.archived_at) ??
        rows[0] ??
        null;

      if (nextSelected) {
        setSelectedClientId(nextSelected.id);
        setDraft(toDraft(nextSelected));
      } else {
        setSelectedClientId(null);
        setDraft(emptyDraft(defaultLocale));
        setHistory([]);
        setEvents([]);
      }
    },
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: workspaceError } = await supabase.rpc("list_my_businesses");
    if (workspaceError) {
      setError(workspaceError.message);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as WorkspaceRow[];
    const current = rows.find((item) => item.is_default) ?? rows[0] ?? null;
    setWorkspace(current);

    if (!current) {
      setLoading(false);
      return;
    }

    try {
      await loadWorkspaceClients(current.business_id, requestedClientId, current.default_locale);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t("Clients could not be loaded."));
    }
    setLoading(false);
  }, [loadWorkspaceClients, requestedClientId, t]);

  useEffect(() => {
    setRequestedClientId(new URLSearchParams(window.location.search).get("client"));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selectedClientId) return;
    void loadClientDetails(selectedClientId);
  }, [loadClientDetails, selectedClientId]);

  const startNew = () => {
    resetMessages();
    setSelectedClientId(null);
    setDraft(emptyDraft(workspace?.default_locale || "ru"));
    setHistory([]);
    setEvents([]);
  };

  const saveClient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    if (!workspace || !canOperate) {
      setError(t("This role cannot manage clients."));
      return;
    }

    if (!draft.name.trim()) {
      setError(t("Enter the client name."));
      return;
    }

    const tags = draft.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setSaving(true);
    const common = {
      p_name: draft.name.trim(),
      p_email: draft.email.trim() || null,
      p_phone: draft.phone.trim() || null,
      p_locale: draft.locale.trim() || workspace.default_locale,
      p_notes: draft.notes,
      p_tags: tags,
    };

    const result = selectedClientId
      ? await supabase.rpc("update_admin_client", {
          p_client_id: selectedClientId,
          ...common,
        })
      : await supabase.rpc("create_admin_client", {
          p_business_id: workspace.business_id,
          ...common,
        });

    if (result.error) {
      setError(
        result.error.message.includes("client_already_exists")
          ? t("A client with this email or matching name and phone already exists.")
          : result.error.message,
      );
      setSaving(false);
      return;
    }

    const savedId = String(result.data);
    await loadWorkspaceClients(workspace.business_id, savedId, workspace.default_locale);
    setSelectedClientId(savedId);
    setNotice(selectedClientId ? t("Client updated.") : t("Client created."));
    setSaving(false);
  };

  const toggleArchive = async () => {
    if (!selectedClient || !workspace || !canOperate) return;
    resetMessages();

    const archive = !selectedClient.archived_at;
    if (archive && !window.confirm(t("Archive this client?"))) return;

    setSaving(true);
    const result = await supabase.rpc("set_admin_client_archived", {
      p_client_id: selectedClient.id,
      p_archived: archive,
    });

    if (result.error) {
      setError(
        result.error.message.includes("client_has_active_bookings")
          ? t("A client with an active future booking cannot be archived.")
          : result.error.message,
      );
      setSaving(false);
      return;
    }

    await loadWorkspaceClients(workspace.business_id, selectedClient.id, workspace.default_locale);
    setNotice(archive ? t("Client archived.") : t("Client restored."));
    setSaving(false);
  };

  const mergeClient = async (candidate: ClientRow) => {
    if (!selectedClient || !workspace || !canOperate) return;

    const confirmed = window.confirm(
      t("Merge {source} into {target}? The source record will be removed and all bookings will move to the target.", {
        source: candidate.name,
        target: selectedClient.name,
      }),
    );
    if (!confirmed) return;

    resetMessages();
    setSaving(true);
    const result = await supabase.rpc("merge_admin_clients", {
      p_keep_client_id: selectedClient.id,
      p_merge_client_id: candidate.id,
    });

    if (result.error) {
      setError(
        result.error.message.includes("client_merge_auth_conflict")
          ? t("These clients are linked to different login accounts and cannot be merged automatically.")
          : result.error.message,
      );
      setSaving(false);
      return;
    }

    await loadWorkspaceClients(workspace.business_id, selectedClient.id, workspace.default_locale);
    setNotice(t("Clients merged."));
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="mt-8 rounded-[28px] border border-black/8 bg-white p-7 text-sm text-[#77736a]">
        {t("Loading clients…")}
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="mt-8 rounded-[28px] border border-black/8 bg-white p-7 text-sm text-[#77736a]">
        {t("No workspace is assigned.")}
      </div>
    );
  }

  return (
    <div className="mt-8">
      {(notice || error) && (
        <div
          className={`mb-5 rounded-[22px] border px-5 py-4 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {error || notice}
        </div>
      )}

      <div className="rounded-[28px] border border-black/8 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">
              {t("Current workspace")}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{workspace.name}</h2>
            <p className="mt-1 text-sm text-[#77736a]">
              {t("Role")}: {workspace.role} ·{" "}
              {canOperate ? t("Client operations allowed") : t("Read-only client access")}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              className={inputClass}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("Search by name, email, phone or tag")}
            />
            <label className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-xs font-semibold">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(event) => setShowArchived(event.target.checked)}
              />
              {t("Show archived")}
            </label>
            <button type="button" className={secondaryButtonClass} onClick={() => void load()}>
              {t("Refresh")}
            </button>
            <button type="button" className={buttonClass} onClick={startNew} disabled={!canOperate}>
              {t("New client")}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <section className="rounded-[30px] border border-black/8 bg-[#eeebe3] p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">
              {t("Clients")}
            </p>
            <p className="mt-1 text-sm text-[#77736a]">
              {t("{count} clients", { count: visibleClients.length })}
            </p>
          </div>

          <div className="mt-5 grid max-h-[880px] gap-3 overflow-y-auto pr-1">
            {visibleClients.length === 0 && (
              <div className="rounded-2xl bg-white/80 p-5 text-sm text-[#77736a]">
                {t("No clients found.")}
              </div>
            )}

            {visibleClients.map((client) => {
              const active = client.id === selectedClientId;
              return (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => selectClient(client)}
                  className={`rounded-[22px] border p-4 text-left transition ${
                    active
                      ? "border-[#17191f] bg-[#17191f] text-white"
                      : "border-black/8 bg-white hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold">{client.name}</p>
                      <p className={`mt-1 truncate text-sm ${active ? "text-white/65" : "text-[#77736a]"}`}>
                        {client.email || client.phone || t("No contact details")}
                      </p>
                    </div>
                    {client.archived_at && (
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                          active ? "bg-white/10" : "bg-[#eeebe3]"
                        }`}
                      >
                        {t("Archived")}
                      </span>
                    )}
                  </div>

                  <div
                    className={`mt-4 grid grid-cols-3 gap-2 text-xs ${
                      active ? "text-white/62" : "text-[#77736a]"
                    }`}
                  >
                    <span>
                      {t("Bookings")}: {client.booking_count}
                    </span>
                    <span>
                      {t("Upcoming")}: {client.upcoming_count}
                    </span>
                    <span>
                      {t("Completed")}: {client.completed_count}
                    </span>
                  </div>

                  {client.next_booking_at && (
                    <p className={`mt-3 text-xs ${active ? "text-[#d8b36a]" : "text-[#9a742e]"}`}>
                      {t("Next")}:{" "}
                      {formatDateTime(client.next_booking_at, workspace.timezone, adminLocale)}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[30px] border border-black/8 bg-white p-5 shadow-[0_18px_55px_rgba(20,20,20,0.06)] sm:p-7">
          <div className="flex flex-col gap-4 border-b border-black/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">
                {selectedClient ? t("Client card") : t("New client")}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                {selectedClient?.name ?? t("Create a canonical client")}
              </h2>
              {selectedClient && (
                <p className="mt-2 text-sm text-[#77736a]">
                  {t("Created")}: {formatDate(selectedClient.created_at, adminLocale)}
                </p>
              )}
            </div>

            {selectedClient && (
              <button
                type="button"
                className={
                  selectedClient.archived_at
                    ? secondaryButtonClass
                    : "rounded-full border border-red-200 px-4 py-2.5 text-xs font-semibold text-red-700 disabled:opacity-45"
                }
                onClick={() => void toggleArchive()}
                disabled={!canOperate || saving}
              >
                {selectedClient.archived_at ? t("Restore client") : t("Archive client")}
              </button>
            )}
          </div>

          <form className="mt-6" onSubmit={saveClient}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t("Client name")}>
                <input
                  className={inputClass}
                  value={draft.name}
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  disabled={!canOperate}
                  maxLength={160}
                />
              </Field>

              <Field label={t("Language")}>
                <select
                  className={inputClass}
                  value={draft.locale}
                  onChange={(event) => setDraft((current) => ({ ...current, locale: event.target.value }))}
                  disabled={!canOperate}
                >
                  <option value="ru">{t("Russian")}</option>
                  <option value="en">{t("English")}</option>
                  <option value="uk">Українська</option>
                  <option value="pl">Polski</option>
                </select>
              </Field>

              <Field label={t("Email")}>
                <input
                  className={inputClass}
                  type="email"
                  value={draft.email}
                  onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                  disabled={!canOperate}
                  maxLength={254}
                />
              </Field>

              <Field label={t("Phone")}>
                <input
                  className={inputClass}
                  value={draft.phone}
                  onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
                  disabled={!canOperate}
                  maxLength={40}
                />
              </Field>

              <div className="md:col-span-2">
                <Field label={t("Tags")}>
                  <input
                    className={inputClass}
                    value={draft.tags}
                    onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))}
                    disabled={!canOperate}
                    placeholder={t("vip, rental, returning")}
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label={t("Client notes")}>
                  <textarea
                    className={`${inputClass} min-h-32 resize-y`}
                    value={draft.notes}
                    onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                    disabled={!canOperate}
                    maxLength={8000}
                  />
                </Field>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="submit" className={buttonClass} disabled={!canOperate || saving}>
                {saving ? t("Saving…") : selectedClient ? t("Save client") : t("Create client")}
              </button>
              {selectedClient && (
                <span className="text-xs text-[#77736a]">
                  {t("Booked value")}:{" "}
                  {formatMoney(selectedClient.booked_value_minor, selectedClient.currency, adminLocale)}
                </span>
              )}
            </div>
          </form>

          {selectedClient && duplicateCandidates.length > 0 && (
            <div className="mt-7 rounded-[24px] border border-amber-200 bg-amber-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                {t("Possible duplicates")}
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-900/75">
                {t("These records share an email, phone or matching identity. Review them before merging.")}
              </p>
              <div className="mt-4 grid gap-3">
                {duplicateCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex flex-col gap-3 rounded-2xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{candidate.name}</p>
                      <p className="mt-1 text-xs text-[#77736a]">
                        {candidate.email || candidate.phone || t("No contact details")} ·{" "}
                        {t("{count} bookings", { count: candidate.booking_count })}
                      </p>
                    </div>
                    <button
                      type="button"
                      className={secondaryButtonClass}
                      onClick={() => void mergeClient(candidate)}
                      disabled={!canOperate || saving}
                    >
                      {t("Merge into selected")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedClient && (
            <div className="mt-7 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <section className="rounded-[24px] border border-black/8 bg-[#fffdfa] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">
                      {t("Booking history")}
                    </p>
                    <p className="mt-1 text-sm text-[#77736a]">
                      {t("{count} bookings", { count: history.length })}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid max-h-[520px] gap-3 overflow-y-auto pr-1">
                  {detailsLoading && <p className="text-sm text-[#77736a]">{t("Loading…")}</p>}
                  {!detailsLoading && history.length === 0 && (
                    <p className="rounded-2xl bg-[#eeebe3] p-4 text-sm text-[#77736a]">
                      {t("This client has no bookings yet.")}
                    </p>
                  )}

                  {history.map((booking) => (
                    <article
                      key={booking.id}
                      className="rounded-2xl border border-black/8 bg-white p-4 transition hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#9a742e]">
                            {booking.reference}
                          </p>
                          <p className="mt-2 font-semibold">{booking.service_title}</p>
                        </div>
                        <span className="rounded-full bg-[#eeebe3] px-3 py-1 text-[10px] font-semibold uppercase">
                          {t(statusMessages[booking.status])}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-[#55524c]">
                        {formatDateTime(booking.starts_at, booking.timezone, adminLocale)}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-[#77736a]">
                        <span>{t("{count} people", { count: booking.party_size })}</span>
                        <span>{formatMoney(booking.total_minor, booking.currency, adminLocale)}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-black/8 pt-3">
                        <button type="button" className={secondaryButtonClass} onClick={() => router.push(`/admin/bookings?booking=${booking.id}`)}>{t("Open booking")}</button>
                        <button type="button" className={secondaryButtonClass} onClick={() => router.push(`/admin/payments?booking=${booking.id}`)}>{t("Open payments")}</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[24px] border border-black/8 bg-[#eeebe3] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">
                  {t("Client activity")}
                </p>
                <div className="mt-4 grid max-h-[520px] gap-3 overflow-y-auto pr-1">
                  {detailsLoading && <p className="text-sm text-[#77736a]">{t("Loading…")}</p>}
                  {!detailsLoading && events.length === 0 && (
                    <p className="rounded-2xl bg-white/75 p-4 text-sm text-[#77736a]">
                      {t("No client activity yet.")}
                    </p>
                  )}
                  {events.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-white/80 p-4">
                      <p className="text-sm font-semibold">{t(eventMessages[item.event_type])}</p>
                      <p className="mt-1 text-xs text-[#77736a]">
                        {formatDateTime(item.created_at, workspace.timezone, adminLocale)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
