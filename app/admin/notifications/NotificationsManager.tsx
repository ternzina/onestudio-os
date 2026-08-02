"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import { supabase } from "@/lib/supabase";
import type { AdminMessage } from "@/lib/i18n/admin";
import type {
  BusinessNotificationSettingsRecord,
  BusinessRole,
  NotificationAdapterStatus,
  NotificationAttemptRecord,
  NotificationEventType,
  NotificationJobRecord,
  NotificationJobStatus,
  NotificationTemplateRecord,
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

type Tab = "queue" | "templates" | "settings";

type AdapterResponse = {
  ok: boolean;
  canProcess?: boolean;
  error?: string;
  adapter?: NotificationAdapterStatus;
  result?: {
    claimed: number;
    sent: number;
    failed: number;
    recovered: number;
    disabled: boolean;
  };
};

const inputClass =
  "w-full rounded-2xl border border-black/10 bg-[#fffdfa] px-4 py-3 text-sm outline-none transition focus:border-[#9a742e] disabled:cursor-not-allowed disabled:opacity-55";
const buttonClass =
  "rounded-full bg-[#17191f] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-45";
const secondaryButtonClass =
  "rounded-full border border-black/10 px-4 py-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-45";

const eventMessages: Record<NotificationEventType, AdminMessage> = {
  booking_pending: "Booking awaiting confirmation",
  booking_confirmed: "Booking confirmed",
  booking_cancelled: "Booking cancelled",
  booking_reminder: "Booking reminder",
  payment_received: "Payment received",
  refund_issued: "Refund issued",
};

const statusMessages: Record<NotificationJobStatus, AdminMessage> = {
  scheduled: "Scheduled",
  pending: "Pending delivery",
  processing: "Processing",
  sent: "Sent",
  failed: "Failed",
  cancelled: "Cancelled",
};

function formatDateTime(iso: string | null, timezone: string, locale: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    timeZone: timezone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function notificationError(message: string, t: (message: AdminMessage) => string) {
  if (message.includes("notification_operation_forbidden")) return t("This role cannot manage notifications.");
  if (message.includes("notification_retry_not_allowed")) return t("Only failed or cancelled jobs can be retried.");
  if (message.includes("notification_cancel_not_allowed")) return t("This notification can no longer be cancelled.");
  if (message.includes("invalid_notification")) return t("Check the notification values and try again.");
  return message;
}

export default function NotificationsManager() {
  const { locale: adminLocale, t } = useAdminI18n();
  const [workspace, setWorkspace] = useState<WorkspaceRow | null>(null);
  const [jobs, setJobs] = useState<NotificationJobRecord[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplateRecord[]>([]);
  const [settings, setSettings] = useState<BusinessNotificationSettingsRecord | null>(null);
  const [attempts, setAttempts] = useState<NotificationAttemptRecord[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("queue");
  const [statusFilter, setStatusFilter] = useState<NotificationJobStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [adapterStatus, setAdapterStatus] = useState<NotificationAdapterStatus | null>(null);
  const [canProcessAdapter, setCanProcessAdapter] = useState(false);

  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? null;
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) ?? null;
  const canOperate = workspace ? workspace.role !== "viewer" : false;
  const canConfigure = workspace
    ? ["owner", "admin", "manager"].includes(workspace.role)
    : false;

  const [templateEvent, setTemplateEvent] = useState<NotificationEventType>("booking_confirmed");
  const [templateLocale, setTemplateLocale] = useState("en");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [templateEnabled, setTemplateEnabled] = useState(true);

  const [fromName, setFromName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState("1440");
  const [maxAttempts, setMaxAttempts] = useState("3");

  const loadAdapterStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/notifications/adapter", {
        method: "GET",
        cache: "no-store",
      });
      const result = (await response.json()) as AdapterResponse;
      if (!response.ok || !result.ok || !result.adapter) {
        throw new Error(result.error || "notification_adapter_status_failed");
      }
      setAdapterStatus(result.adapter);
      setCanProcessAdapter(result.canProcess === true);
    } catch (caught) {
      setAdapterStatus(null);
      setCanProcessAdapter(false);
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  }, []);

  const loadWorkspace = useCallback(async () => {
    const { data, error: workspaceError } = await supabase.rpc("list_my_businesses");
    if (workspaceError) throw workspaceError;
    const rows = (data ?? []) as WorkspaceRow[];
    return rows.find((row) => row.is_default) ?? rows[0] ?? null;
  }, []);

  const loadData = useCallback(async (currentWorkspace?: WorkspaceRow | null) => {
    setLoading(true);
    setError("");
    try {
      const resolved = currentWorkspace ?? workspace ?? (await loadWorkspace());
      setWorkspace(resolved);
      if (!resolved) {
        setJobs([]);
        setTemplates([]);
        setSettings(null);
        return;
      }

      const [jobsResult, templatesResult, settingsResult] = await Promise.all([
        supabase.rpc("get_admin_notification_jobs", {
          p_business_id: resolved.business_id,
          p_status: null,
        }),
        supabase.rpc("get_admin_notification_templates", {
          p_business_id: resolved.business_id,
        }),
        supabase
          .from("business_notification_settings")
          .select("business_id,from_name,reply_to_email,reminder_enabled,reminder_minutes,max_attempts")
          .eq("business_id", resolved.business_id)
          .maybeSingle(),
      ]);

      if (jobsResult.error) throw jobsResult.error;
      if (templatesResult.error) throw templatesResult.error;
      if (settingsResult.error) throw settingsResult.error;

      const nextJobs = (jobsResult.data ?? []) as NotificationJobRecord[];
      const nextTemplates = (templatesResult.data ?? []) as NotificationTemplateRecord[];
      const nextSettings = settingsResult.data as BusinessNotificationSettingsRecord | null;
      setJobs(nextJobs);
      setTemplates(nextTemplates);
      setSettings(nextSettings);
      setSelectedJobId((current) =>
        current && nextJobs.some((job) => job.id === current)
          ? current
          : nextJobs[0]?.id ?? null,
      );
      setSelectedTemplateId((current) =>
        current && nextTemplates.some((template) => template.id === current)
          ? current
          : nextTemplates[0]?.id ?? null,
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setLoading(false);
    }
  }, [loadWorkspace, workspace]);

  useEffect(() => {
    void loadData(null);
    void loadAdapterStatus();
  }, [loadAdapterStatus, loadData]);

  useEffect(() => {
    if (!selectedJobId) {
      setAttempts([]);
      return;
    }
    void (async () => {
      const { data, error: attemptsError } = await supabase.rpc(
        "get_admin_notification_attempts",
        { p_job_id: selectedJobId },
      );
      if (attemptsError) {
        setError(attemptsError.message);
        return;
      }
      setAttempts((data ?? []) as NotificationAttemptRecord[]);
    })();
  }, [selectedJobId]);

  useEffect(() => {
    if (!selectedTemplate) return;
    setTemplateEvent(selectedTemplate.event_type);
    setTemplateLocale(selectedTemplate.locale);
    setTemplateSubject(selectedTemplate.subject_template);
    setTemplateBody(selectedTemplate.body_template);
    setTemplateEnabled(selectedTemplate.is_enabled);
  }, [selectedTemplate]);

  useEffect(() => {
    if (!settings) return;
    setFromName(settings.from_name);
    setReplyTo(settings.reply_to_email ?? "");
    setReminderEnabled(settings.reminder_enabled);
    setReminderMinutes(String(settings.reminder_minutes));
    setMaxAttempts(String(settings.max_attempts));
  }, [settings]);

  const filteredJobs = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return jobs.filter((job) => {
      if (statusFilter !== "all" && job.status !== statusFilter) return false;
      if (!needle) return true;
      return [
        job.booking_reference,
        job.client_name,
        job.recipient_email,
        job.subject,
        job.event_type,
      ].some((value) => value?.toLowerCase().includes(needle));
    });
  }, [jobs, search, statusFilter]);

  const summary = useMemo(() => ({
    scheduled: jobs.filter((job) => job.status === "scheduled").length,
    pending: jobs.filter((job) => job.status === "pending").length,
    sent: jobs.filter((job) => job.status === "sent").length,
    failed: jobs.filter((job) => job.status === "failed").length,
  }), [jobs]);

  async function runAction(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
      await loadData(workspace);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);
      setError(notificationError(message, t));
    } finally {
      setBusy(false);
    }
  }

  async function processDueNotifications() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/notifications/adapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = (await response.json()) as AdapterResponse;
      if (!response.ok || !result.ok || !result.result) {
        throw new Error(result.error || "notification_adapter_run_failed");
      }

      setNotice(
        t("Resend processed {claimed} jobs: {sent} sent, {failed} failed.", {
          claimed: result.result.claimed,
          sent: result.result.sent,
          failed: result.result.failed,
        }),
      );
      await Promise.all([loadData(workspace), loadAdapterStatus()]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setBusy(false);
    }
  }

  async function sendSelectedNow() {
    if (!selectedJob) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (selectedJob.status === "failed") {
        const { error: retryError } = await supabase.rpc("retry_admin_notification", {
          p_job_id: selectedJob.id,
        });
        if (retryError) throw retryError;
      }

      const response = await fetch("/api/admin/notifications/adapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selectedJob.id }),
      });
      const result = (await response.json()) as AdapterResponse;
      if (!response.ok || !result.ok || !result.result) {
        throw new Error(result.error || "notification_selected_delivery_failed");
      }

      setNotice(
        result.result.sent === 1
          ? (adminLocale === "ru"
            ? `Письмо отправлено: ${selectedJob.recipient_email}`
            : `Email sent: ${selectedJob.recipient_email}`)
          : (adminLocale === "ru"
            ? "Письмо не отправлено. Проверьте последнюю ошибку доставки."
            : "The email was not sent. Check the latest delivery error."),
      );
      await Promise.all([loadData(workspace), loadAdapterStatus()]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setBusy(false);
    }
  }

  async function prepareReminders() {
    if (!workspace) return;
    await runAction(async () => {
      const until = new Date();
      until.setDate(until.getDate() + 30);
      const { data, error: rpcError } = await supabase.rpc("schedule_booking_reminders", {
        p_business_id: workspace.business_id,
        p_until: until.toISOString(),
      });
      if (rpcError) throw rpcError;
      setNotice(t("Reminder queue prepared for {count} upcoming bookings.", { count: Number(data ?? 0) }));
    });
  }

  async function retryJob() {
    if (!selectedJob) return;
    await runAction(async () => {
      const { error: rpcError } = await supabase.rpc("retry_admin_notification", {
        p_job_id: selectedJob.id,
      });
      if (rpcError) throw rpcError;
      setNotice(t("Notification returned to the delivery queue."));
    });
  }

  async function cancelJob() {
    if (!selectedJob) return;
    await runAction(async () => {
      const { error: rpcError } = await supabase.rpc("cancel_admin_notification", {
        p_job_id: selectedJob.id,
      });
      if (rpcError) throw rpcError;
      setNotice(t("Notification cancelled."));
    });
  }

  async function saveTemplate(event: FormEvent) {
    event.preventDefault();
    if (!workspace) return;
    await runAction(async () => {
      const { data, error: rpcError } = await supabase.rpc(
        "upsert_admin_notification_template",
        {
          p_business_id: workspace.business_id,
          p_event_type: templateEvent,
          p_locale: templateLocale,
          p_subject_template: templateSubject,
          p_body_template: templateBody,
          p_is_enabled: templateEnabled,
        },
      );
      if (rpcError) throw rpcError;
      setSelectedTemplateId(String(data));
      setNotice(t("Template saved."));
    });
  }

  async function saveSettings(event: FormEvent) {
    event.preventDefault();
    if (!workspace) return;
    await runAction(async () => {
      const { error: rpcError } = await supabase.rpc(
        "update_admin_notification_settings",
        {
          p_business_id: workspace.business_id,
          p_from_name: fromName,
          p_reply_to_email: replyTo,
          p_reminder_enabled: reminderEnabled,
          p_reminder_minutes: Number(reminderMinutes),
          p_max_attempts: Number(maxAttempts),
        },
      );
      if (rpcError) throw rpcError;
      setNotice(t("Notification settings saved."));
    });
  }

  if (loading) {
    return <div className="mt-8 rounded-[28px] border border-black/8 bg-white p-8">{t("Loading notifications…")}</div>;
  }

  if (!workspace) {
    return <div className="mt-8 rounded-[28px] border border-black/8 bg-white p-8">{t("No active workspace was found.")}</div>;
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2">
        {(["queue", "templates", "settings"] as Tab[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] ${
              tab === value ? "bg-[#17191f] text-white" : "border border-black/10 bg-white"
            }`}
          >
            {value === "queue" ? t("Queue") : value === "templates" ? t("Templates") : t("Settings")}
          </button>
        ))}
      </div>

      {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}
      {notice ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p> : null}

      {tab === "queue" ? (
        <>
          <div className={`mt-6 rounded-[24px] border p-5 ${
            adapterStatus?.configured
              ? adapterStatus.mode === "live"
                ? "border-emerald-900/10 bg-emerald-50"
                : "border-amber-900/10 bg-amber-50"
              : "border-black/8 bg-white"
          }`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">
                  {t("Resend Adapter 1.0")}
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {adapterStatus?.configured
                    ? adapterStatus.mode === "live"
                      ? t("Live delivery is enabled.")
                      : t("Test delivery redirects every message to {email}.", {
                          email: adapterStatus.testRecipient ?? "—",
                        })
                    : adapterStatus?.mode === "disabled"
                      ? t("Delivery is safely disabled.")
                      : t("The adapter is missing environment variables.")}
                </p>
                <p className="mt-2 text-sm text-[#6f6c65]">
                  {adapterStatus?.fromEmail
                    ? t("Sender: {email}. Batch size: {count}.", {
                        email: adapterStatus.fromEmail,
                        count: adapterStatus.batchSize,
                      })
                    : t("Configure the sender before processing the queue.")}
                </p>
                {adapterStatus?.missing.length ? (
                  <p className="mt-2 text-xs text-red-700">
                    {t("Missing: {values}", { values: adapterStatus.missing.join(", ") })}
                  </p>
                ) : null}
              </div>
              <button
                className={buttonClass}
                type="button"
                onClick={() => void processDueNotifications()}
                disabled={!canProcessAdapter || busy || !adapterStatus?.configured}
              >
                {busy ? t("Processing…") : t("Send due now")}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [t("Scheduled"), summary.scheduled],
              [t("Pending delivery"), summary.pending],
              [t("Sent"), summary.sent],
              [t("Failed"), summary.failed],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-[24px] border border-black/8 bg-white p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[#9a742e]">{label}</p>
                <p className="mt-3 text-3xl font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[26px] border border-black/8 bg-white p-4">
            <input
              className={`${inputClass} min-w-[240px] flex-1`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("Search recipient, client or booking")}
            />
            <select className={`${inputClass} w-auto`} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as NotificationJobStatus | "all")}>
              <option value="all">{t("All statuses")}</option>
              {Object.entries(statusMessages).map(([value, message]) => (
                <option key={value} value={value}>{t(message)}</option>
              ))}
            </select>
            <button className={secondaryButtonClass} type="button" onClick={() => void prepareReminders()} disabled={!canOperate || busy}>
              {t("Prepare reminders")}
            </button>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              {filteredJobs.length ? filteredJobs.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => setSelectedJobId(job.id)}
                  className={`w-full rounded-[24px] border p-5 text-left ${
                    selectedJobId === job.id ? "border-[#17191f] bg-[#17191f] text-white" : "border-black/8 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#d0a44d]">{t(eventMessages[job.event_type])}</p>
                      <p className="mt-2 text-lg font-semibold">{job.client_name ?? job.recipient_email}</p>
                      <p className="mt-1 text-sm opacity-65">{job.booking_reference ?? "—"} · {job.locale.toUpperCase()}</p>
                    </div>
                    <span className="rounded-full border border-current/15 px-3 py-1 text-[11px] font-semibold">{t(statusMessages[job.status])}</span>
                  </div>
                  <p className="mt-4 truncate text-sm opacity-75">{job.subject}</p>
                  <p className="mt-2 text-xs opacity-55">{formatDateTime(job.scheduled_for, workspace.timezone, adminLocale)}</p>
                </button>
              )) : (
                <div className="rounded-[24px] border border-black/8 bg-white p-8 text-sm text-[#77736a]">{t("No notification jobs match these filters.")}</div>
              )}
            </div>

            <div className="rounded-[28px] border border-black/8 bg-white p-6">
              {selectedJob ? (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{t(eventMessages[selectedJob.event_type])}</p>
                      <h2 className="mt-2 text-2xl font-semibold">{selectedJob.subject}</h2>
                      <p className="mt-2 text-sm text-[#77736a]">{selectedJob.recipient_email}</p>
                    </div>
                    <span className="rounded-full bg-[#eeebe3] px-4 py-2 text-xs font-semibold">{t(statusMessages[selectedJob.status])}</span>
                  </div>

                  <div className="mt-6 whitespace-pre-wrap rounded-[22px] bg-[#f5f1e9] p-5 text-sm leading-7">{selectedJob.body}</div>

                  <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                    <div><dt className="text-[#77736a]">{t("Scheduled for")}</dt><dd className="mt-1 font-semibold">{formatDateTime(selectedJob.scheduled_for, workspace.timezone, adminLocale)}</dd></div>
                    <div><dt className="text-[#77736a]">{t("Attempts")}</dt><dd className="mt-1 font-semibold">{selectedJob.attempt_count} / {selectedJob.max_attempts}</dd></div>
                    <div><dt className="text-[#77736a]">{t("Provider")}</dt><dd className="mt-1 font-semibold">{selectedJob.provider ?? t("Not connected")}</dd></div>
                    <div><dt className="text-[#77736a]">{t("Last error")}</dt><dd className="mt-1 font-semibold">{selectedJob.last_error || "—"}</dd></div>
                  </dl>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {selectedJob.booking_id ? <Link className={secondaryButtonClass} href={`/admin/bookings?booking=${selectedJob.booking_id}`}>{t("Open booking")}</Link> : null}
                    {selectedJob.client_id ? <Link className={secondaryButtonClass} href={`/admin/clients?client=${selectedJob.client_id}`}>{t("Open client")}</Link> : null}
                    <button
                      className={buttonClass}
                      type="button"
                      onClick={() => void sendSelectedNow()}
                      disabled={
                        !canOperate ||
                        !canProcessAdapter ||
                        busy ||
                        !adapterStatus?.configured ||
                        !["scheduled", "pending", "failed"].includes(selectedJob.status)
                      }
                    >
                      {busy
                        ? t("Processing…")
                        : (adminLocale === "ru" ? "Отправить это письмо сейчас" : "Send this email now")}
                    </button>
                    <button className={secondaryButtonClass} type="button" onClick={() => void retryJob()} disabled={!canOperate || busy || !["failed", "cancelled"].includes(selectedJob.status)}>{t("Retry")}</button>
                    <button className={secondaryButtonClass} type="button" onClick={() => void cancelJob()} disabled={!canOperate || busy || !["scheduled", "pending", "failed"].includes(selectedJob.status)}>{t("Cancel notification")}</button>
                  </div>

                  <div className="mt-8 border-t border-black/8 pt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a742e]">{t("Delivery attempts")}</p>
                    <div className="mt-3 space-y-2">
                      {attempts.length ? attempts.map((attempt) => (
                        <div key={attempt.id} className="rounded-2xl bg-[#f7f4ed] px-4 py-3 text-sm">
                          <div className="flex justify-between gap-4"><span>#{attempt.attempt_number} · {attempt.provider}</span><span className="font-semibold">{attempt.status}</span></div>
                          {attempt.error_message ? <p className="mt-2 text-red-700">{attempt.error_message}</p> : null}
                        </div>
                      )) : <p className="text-sm text-[#77736a]">{t("No delivery attempts yet.")}</p>}
                    </div>
                  </div>
                </>
              ) : <p className="text-sm text-[#77736a]">{t("Select a notification job.")}</p>}
            </div>
          </div>
        </>
      ) : null}

      {tab === "templates" ? (
        <div className="mt-6 grid gap-5 xl:grid-cols-[0.7fr_1.3fr]">
          <div className="space-y-2">
            {templates.map((template) => (
              <button key={template.id} type="button" onClick={() => setSelectedTemplateId(template.id)} className={`w-full rounded-[20px] border p-4 text-left ${selectedTemplateId === template.id ? "border-[#17191f] bg-[#17191f] text-white" : "border-black/8 bg-white"}`}>
                <p className="text-sm font-semibold">{t(eventMessages[template.event_type])}</p>
                <p className="mt-1 text-xs opacity-60">{template.locale.toUpperCase()} · {template.is_enabled ? t("Enabled") : t("Disabled")}</p>
              </button>
            ))}
            <button type="button" className={secondaryButtonClass} onClick={() => { setSelectedTemplateId(null); setTemplateSubject(""); setTemplateBody(""); }}>{t("New locale template")}</button>
          </div>

          <form onSubmit={saveTemplate} className="rounded-[28px] border border-black/8 bg-white p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className="text-xs font-semibold">{t("Event")}</span><select className={`${inputClass} mt-2`} value={templateEvent} onChange={(event) => setTemplateEvent(event.target.value as NotificationEventType)}>{Object.entries(eventMessages).map(([value, message]) => <option key={value} value={value}>{t(message)}</option>)}</select></label>
              <label><span className="text-xs font-semibold">{t("Template locale")}</span><input className={`${inputClass} mt-2`} value={templateLocale} onChange={(event) => setTemplateLocale(event.target.value.toLowerCase())} placeholder="en" /></label>
            </div>
            <label className="mt-4 block"><span className="text-xs font-semibold">{t("Subject template")}</span><input className={`${inputClass} mt-2`} value={templateSubject} onChange={(event) => setTemplateSubject(event.target.value)} /></label>
            <label className="mt-4 block"><span className="text-xs font-semibold">{t("Body template")}</span><textarea className={`${inputClass} mt-2 min-h-64`} value={templateBody} onChange={(event) => setTemplateBody(event.target.value)} /></label>
            <label className="mt-4 flex items-center gap-3 text-sm"><input type="checkbox" checked={templateEnabled} onChange={(event) => setTemplateEnabled(event.target.checked)} />{t("Template enabled")}</label>
            <p className="mt-4 text-xs leading-5 text-[#77736a]">{t("Available placeholders: {{business_name}}, {{client_name}}, {{booking_reference}}, {{service_title}}, {{booking_date}}, {{booking_time}}, {{total}}, {{currency}}, {{payment_amount}}, {{payment_currency}}.")}</p>
            <button className={`${buttonClass} mt-5`} type="submit" disabled={!canConfigure || busy}>{t("Save template")}</button>
          </form>
        </div>
      ) : null}

      {tab === "settings" ? (
        <form onSubmit={saveSettings} className="mt-6 max-w-3xl rounded-[28px] border border-black/8 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className="text-xs font-semibold">{t("Sender name")}</span><input className={`${inputClass} mt-2`} value={fromName} onChange={(event) => setFromName(event.target.value)} /></label>
            <label><span className="text-xs font-semibold">{t("Reply-to email")}</span><input className={`${inputClass} mt-2`} value={replyTo} onChange={(event) => setReplyTo(event.target.value)} type="email" /></label>
            <label><span className="text-xs font-semibold">{t("Reminder lead time, minutes")}</span><input className={`${inputClass} mt-2`} value={reminderMinutes} onChange={(event) => setReminderMinutes(event.target.value)} type="number" min={5} max={10080} /></label>
            <label><span className="text-xs font-semibold">{t("Maximum delivery attempts")}</span><input className={`${inputClass} mt-2`} value={maxAttempts} onChange={(event) => setMaxAttempts(event.target.value)} type="number" min={1} max={10} /></label>
          </div>
          <label className="mt-4 flex items-center gap-3 text-sm"><input type="checkbox" checked={reminderEnabled} onChange={(event) => setReminderEnabled(event.target.checked)} />{t("Automatic reminders enabled")}</label>
          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            {adapterStatus?.configured
              ? adapterStatus.mode === "live"
                ? t("Resend live delivery is connected. Due jobs are sent by the protected adapter endpoint.")
                : t("Resend test delivery is connected. Every due job is redirected to the configured test recipient.")
              : t("Delivery remains disabled until the Resend adapter environment is complete.")}
          </div>
          <button className={`${buttonClass} mt-5`} type="submit" disabled={!canConfigure || busy}>{t("Save settings")}</button>
        </form>
      ) : null}
    </div>
  );
}
