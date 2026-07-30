"use client";

import { useCallback, useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";

type Connection = {
  connected: boolean;
  configured: boolean;
  missing: string[];
  calendarId: string | null;
  calendarName: string | null;
  calendarMode: "legacy_primary" | "app_created" | null;
  needsWorkCalendar: boolean;
  resourceId: string | null;
  resourceName: string | null;
  lastImportAt: string | null;
  lastExportAt: string | null;
  lastError: string | null;
};

function dateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function GoogleCalendarIntegrationPage() {
  const { t } = useAdminI18n();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        "/api/admin/integrations/google-calendar/status",
        { cache: "no-store" },
      );
      const result = (await response.json()) as {
        ok?: boolean;
        connection?: Connection;
        error?: string;
      };
      if (!response.ok || !result.connection) {
        throw new Error(result.error || "status_failed");
      }
      setConnection(result.connection);
    } catch {
      setError(t("Google Calendar status could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("connected") === "1") {
      setMessage(t("Google Calendar connected."));
      window.history.replaceState({}, "", window.location.pathname);
    } else if (query.get("error")) {
      setError(t("Google Calendar could not be connected."));
      window.history.replaceState({}, "", window.location.pathname);
    }
    void load();
  }, [load, t]);

  async function action(kind: "sync" | "disconnect") {
    if (
      kind === "disconnect" &&
      !window.confirm(
        t("Disconnect Google Calendar? Imported busy windows will be removed."),
      )
    ) {
      return;
    }
    setWorking(kind);
    setMessage("");
    setError("");
    try {
      const response = await fetch(
        `/api/admin/integrations/google-calendar/${kind}`,
        { method: "POST" },
      );
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.error || `${kind}_failed`);
      }
      setMessage(
        kind === "sync"
          ? t("Google Calendar synchronized.")
          : t("Google Calendar disconnected."),
      );
      await load();
    } catch {
      setError(
        kind === "sync"
          ? t("Google Calendar synchronization failed.")
          : t("Google Calendar could not be disconnected."),
      );
    } finally {
      setWorking("");
    }
  }

  return (
    <>
      <AdminHeader />
      <main className="min-h-screen px-5 pb-24 pt-36">
        <section className="mx-auto w-full max-w-6xl">
          <div className="rounded-[36px] bg-[#17191f] p-7 text-white shadow-[0_28px_90px_rgba(20,20,20,0.18)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b36a]">
              {t("Integrations")}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">
              Google Calendar
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
              {t("Two-way synchronization: OneStudio bookings appear in Google Calendar, while busy Google events close the same time in online booking.")}
            </p>
          </div>

          {message || error ? (
            <div
              className={`mt-6 rounded-2xl border px-5 py-4 text-sm ${
                error
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-green-200 bg-green-50 text-green-800"
              }`}
            >
              {error || message}
            </div>
          ) : null}

          <section className="mt-7 rounded-[30px] border border-black/8 bg-white p-6 shadow-[0_18px_55px_rgba(20,20,20,0.06)] sm:p-9">
            {loading ? (
              <p className="text-sm text-[#6f6c65]">{t("Loading integration…")}</p>
            ) : !connection ? null : !connection.configured ? (
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                    {t("One-time platform setup required")}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                    {t("Google connection is not configured yet")}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6f6c65]">
                    {t("The OneStudio owner configures Google OAuth once. After that, every client connects their own calendar with one button and never sees secret keys.")}
                  </p>
                </div>
                <span className="rounded-full bg-amber-50 px-5 py-3 text-xs font-semibold text-amber-800">
                  {connection.missing.length} {t("settings missing")}
                </span>
              </div>
            ) : connection.connected && connection.needsWorkCalendar ? (
              <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                    {t("Separate work calendar required")}
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                    {t("Move bookings out of your personal calendar")}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6f6c65]">
                    {t("Reconnect once and OneStudio will create a separate work calendar for this business. Personal calendars will no longer be read or changed.")}
                  </p>
                  <p className="mt-3 text-xs text-[#8b6a2f]">
                    {t("Current calendar")}:{" "}
                    <strong>
                      {connection.calendarName || t("Primary Google Calendar")}
                    </strong>
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    disabled={Boolean(working)}
                    onClick={() => action("disconnect")}
                    className="min-h-12 rounded-xl border border-red-200 bg-red-50 px-7 text-sm font-semibold text-red-700 disabled:opacity-45"
                  >
                    {working === "disconnect"
                      ? t("Disconnecting…")
                      : t("Disconnect old calendar")}
                  </button>
                  <a
                    href="/api/admin/integrations/google-calendar/connect"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#17191f] px-7 text-center text-sm font-semibold text-white"
                  >
                    {t("Create separate work calendar")}
                  </a>
                </div>
              </div>
            ) : connection.connected ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-700">
                      {t("Connected")}
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                      {connection.calendarName ||
                        t("OneStudio work calendar")}
                    </h2>
                    <p className="mt-3 text-sm text-[#6f6c65]">
                      {t("Busy time is applied to")}:{" "}
                      <strong>{connection.resourceName || t("first available resource")}</strong>
                    </p>
                    <p className="mt-2 text-xs text-[#77736b]">
                      {t("This calendar is separate from the owner's personal calendar.")}
                    </p>
                  </div>
                  <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-semibold text-green-800">
                    ● {t("Two-way sync active")}
                  </span>
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <StatusCard
                    label={t("Busy time received")}
                    value={dateTime(connection.lastImportAt)}
                  />
                  <StatusCard
                    label={t("Bookings sent")}
                    value={dateTime(connection.lastExportAt)}
                  />
                </div>
                {connection.lastError ? (
                  <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {t("Last synchronization warning")}: {connection.lastError}
                  </p>
                ) : null}
                <div className="mt-7 flex flex-wrap gap-3">
                  {connection.calendarId ? (
                    <a
                      href={`https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(
                        connection.calendarId,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-5 text-xs font-semibold text-[#17191f]"
                    >
                      {t("Open work calendar")}
                    </a>
                  ) : null}
                  <button
                    type="button"
                    disabled={Boolean(working)}
                    onClick={() => action("sync")}
                    className="min-h-11 rounded-xl bg-[#17191f] px-5 text-xs font-semibold text-white disabled:opacity-45"
                  >
                    {working === "sync" ? t("Synchronizing…") : t("Synchronize now")}
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(working)}
                    onClick={() => action("disconnect")}
                    className="min-h-11 rounded-xl border border-red-200 bg-red-50 px-5 text-xs font-semibold text-red-700 disabled:opacity-45"
                  >
                    {t("Disconnect")}
                  </button>
                </div>
              </>
            ) : (
              <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a742e]">
                    {t("Not connected")}
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                    {t("Create your Google work calendar")}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6f6c65]">
                    {t("Choose a Google account once. OneStudio will create a separate calendar for this business and will not access personal calendars.")}
                  </p>
                </div>
                <a
                  href="/api/admin/integrations/google-calendar/connect"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#17191f] px-7 text-sm font-semibold text-white"
                >
                  {t("Connect and create calendar")}
                </a>
              </div>
            )}
          </section>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              [
                t("OneStudio → Google"),
                t("New, updated and cancelled bookings are reflected in Google Calendar."),
              ],
              [
                t("Google → OneStudio"),
                t("Busy events added to the work calendar close matching online-booking time."),
              ],
              [
                t("Protected access"),
                t("OAuth tokens are encrypted and never appear in the browser or public site."),
              ],
            ].map(([title, text]) => (
              <article key={title} className="rounded-[24px] border border-black/8 bg-white p-5">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-3 text-xs leading-6 text-[#6f6c65]">{text}</p>
              </article>
            ))}
          </div>

          <p className="mt-6 text-xs leading-6 text-[#77736b]">
            {t("OneStudio creates and uses only a separate work calendar for this business. Personal Google calendars are not read. Disconnecting revokes future Google access and removes imported busy windows.")}{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#7e6229] underline underline-offset-4"
            >
              {t("Privacy Policy")}
            </a>
          </p>
        </section>
      </main>
    </>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-[#faf9f6] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77736b]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}
