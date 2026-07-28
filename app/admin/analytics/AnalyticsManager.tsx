"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import { supabase } from "@/lib/supabase";
import type { AdminMessage } from "@/lib/i18n/admin";
import type { BookingSource, BookingStatus, BusinessRole } from "@/lib/modules/contracts";

type WorkspaceRow = {
  business_id: string;
  name: string;
  timezone: string;
  default_locale: string;
  default_currency: string;
  role: BusinessRole;
  is_default: boolean;
};

type AnalyticsSummary = {
  bookings_count: number;
  cancelled_count: number;
  completed_count: number;
  upcoming_count: number;
  unique_clients: number;
  new_clients: number;
  booked_hours: number;
  booked_value_minor: number;
  collected_minor: number;
  outstanding_minor: number;
  foreign_currency_booking_count: number;
};

type DailyMetric = {
  date: string;
  bookings_count: number;
  cancelled_count: number;
  booked_minor: number;
  collected_minor: number;
};

type ServiceMetric = {
  service_id: string;
  title: string;
  bookings_count: number;
  booked_minor: number;
};

type StatusMetric = {
  status: BookingStatus;
  bookings_count: number;
};

type SourceMetric = {
  source: BookingSource;
  bookings_count: number;
};

type AnalyticsData = {
  period: {
    start_date: string;
    end_date: string;
    timezone: string;
    currency: string;
  };
  summary: AnalyticsSummary;
  daily: DailyMetric[];
  services: ServiceMetric[];
  statuses: StatusMetric[];
  sources: SourceMetric[];
};

const inputClass = "rounded-2xl border border-black/10 bg-[#fffdfa] px-4 py-3 text-sm outline-none transition focus:border-[#9a742e]";
const presetClass = "rounded-full border border-black/10 px-4 py-2.5 text-xs font-semibold transition hover:border-[#9a742e]/50";

const statusMessages: Partial<Record<BookingStatus, AdminMessage>> = {
  hold: "Hold",
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

const sourceMessages: Record<BookingSource, AdminMessage> = {
  public: "Public booking",
  admin: "Admin booking",
  import: "Imported",
  api: "API",
};

function dateKeyInTimezone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatMoney(amountMinor: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}

function formatDate(dateKey: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${dateKey}T12:00:00Z`));
}

function asNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeAnalytics(value: unknown): AnalyticsData {
  const raw = (value && typeof value === "object" ? value : {}) as Partial<AnalyticsData>;
  const summary = (raw.summary ?? {}) as Partial<AnalyticsSummary>;
  return {
    period: {
      start_date: raw.period?.start_date ?? "",
      end_date: raw.period?.end_date ?? "",
      timezone: raw.period?.timezone ?? "UTC",
      currency: raw.period?.currency ?? "EUR",
    },
    summary: {
      bookings_count: asNumber(summary.bookings_count),
      cancelled_count: asNumber(summary.cancelled_count),
      completed_count: asNumber(summary.completed_count),
      upcoming_count: asNumber(summary.upcoming_count),
      unique_clients: asNumber(summary.unique_clients),
      new_clients: asNumber(summary.new_clients),
      booked_hours: asNumber(summary.booked_hours),
      booked_value_minor: asNumber(summary.booked_value_minor),
      collected_minor: asNumber(summary.collected_minor),
      outstanding_minor: asNumber(summary.outstanding_minor),
      foreign_currency_booking_count: asNumber(summary.foreign_currency_booking_count),
    },
    daily: Array.isArray(raw.daily) ? raw.daily.map((item) => ({
      ...item,
      bookings_count: asNumber(item.bookings_count),
      cancelled_count: asNumber(item.cancelled_count),
      booked_minor: asNumber(item.booked_minor),
      collected_minor: asNumber(item.collected_minor),
    })) : [],
    services: Array.isArray(raw.services) ? raw.services.map((item) => ({
      ...item,
      bookings_count: asNumber(item.bookings_count),
      booked_minor: asNumber(item.booked_minor),
    })) : [],
    statuses: Array.isArray(raw.statuses) ? raw.statuses.map((item) => ({
      ...item,
      bookings_count: asNumber(item.bookings_count),
    })) : [],
    sources: Array.isArray(raw.sources) ? raw.sources.map((item) => ({
      ...item,
      bookings_count: asNumber(item.bookings_count),
    })) : [],
  };
}

export default function AnalyticsManager() {
  const { locale, t } = useAdminI18n();
  const [workspace, setWorkspace] = useState<WorkspaceRow | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async (
    businessId: string,
    nextStartDate: string,
    nextEndDate: string,
  ) => {
    setRefreshing(true);
    setError("");
    const result = await supabase.rpc("get_admin_analytics", {
      p_business_id: businessId,
      p_start_date: nextStartDate,
      p_end_date: nextEndDate,
    });
    if (result.error) {
      setError(result.error.message.includes("invalid_analytics_period")
        ? t("Choose a valid period of no more than 366 days.")
        : result.error.message);
      setRefreshing(false);
      return;
    }
    setAnalytics(normalizeAnalytics(result.data));
    setRefreshing(false);
  }, [t]);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const workspaceResult = await supabase.rpc("list_my_businesses");
      if (!active) return;
      if (workspaceResult.error) {
        setError(workspaceResult.error.message);
        setLoading(false);
        return;
      }
      const rows = (workspaceResult.data ?? []) as WorkspaceRow[];
      const current = rows.find((row) => row.is_default) ?? rows[0] ?? null;
      setWorkspace(current);
      if (!current) {
        setError(t("No active business workspace."));
        setLoading(false);
        return;
      }
      const today = dateKeyInTimezone(new Date(), current.timezone);
      const initialStart = addDays(today, -29);
      setStartDate(initialStart);
      setEndDate(today);
      await loadAnalytics(current.business_id, initialStart, today);
      if (active) setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [loadAnalytics, t]);

  const applyPreset = async (days: number) => {
    if (!workspace) return;
    const today = dateKeyInTimezone(new Date(), workspace.timezone);
    const nextStart = addDays(today, -(days - 1));
    setStartDate(nextStart);
    setEndDate(today);
    await loadAnalytics(workspace.business_id, nextStart, today);
  };

  const applyCustomPeriod = async () => {
    if (!workspace || !startDate || !endDate) return;
    await loadAnalytics(workspace.business_id, startDate, endDate);
  };

  const maxDailyBookings = useMemo(
    () => Math.max(1, ...(analytics?.daily.map((day) => day.bookings_count) ?? [1])),
    [analytics],
  );
  const maxServiceBookings = useMemo(
    () => Math.max(1, ...(analytics?.services.map((service) => service.bookings_count) ?? [1])),
    [analytics],
  );
  const statusTotal = useMemo(
    () => analytics?.statuses.reduce((total, status) => total + status.bookings_count, 0) ?? 0,
    [analytics],
  );

  if (loading) {
    return <div className="mt-8 rounded-[30px] border border-black/8 bg-white p-8 text-sm text-[#6f6c65]">{t("Loading analytics…")}</div>;
  }

  if (!workspace || !analytics) {
    return (
      <div className="mt-8 rounded-[30px] border border-red-900/10 bg-red-50 p-8 text-sm text-red-800">
        {error || t("Analytics could not be loaded.")}
      </div>
    );
  }

  const money = (amount: number) => formatMoney(amount, analytics.period.currency, locale);
  const summaryCards = [
    { label: t("Bookings"), value: String(analytics.summary.bookings_count), hint: t("{count} cancelled", { count: analytics.summary.cancelled_count }), href: "/admin/bookings" },
    { label: t("Booked value"), value: money(analytics.summary.booked_value_minor), hint: t("Non-cancelled bookings"), href: "/admin/bookings" },
    { label: t("Net collected"), value: money(analytics.summary.collected_minor), hint: t("Payments minus refunds"), href: "/admin/payments" },
    { label: t("Outstanding"), value: money(analytics.summary.outstanding_minor), hint: t("For bookings in this period"), href: "/admin/payments" },
    { label: t("Unique clients"), value: String(analytics.summary.unique_clients), hint: t("{count} new", { count: analytics.summary.new_clients }), href: "/admin/clients" },
    { label: t("Booked hours"), value: String(analytics.summary.booked_hours), hint: t("{count} completed", { count: analytics.summary.completed_count }), href: "/admin/calendar" },
  ];

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-[30px] border border-black/8 bg-white p-5 shadow-[0_18px_55px_rgba(20,20,20,0.06)] sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{t("Reporting period")}</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{workspace.name}</h2>
            <p className="mt-2 text-sm text-[#77736a]">
              {formatDate(analytics.period.start_date, locale)} — {formatDate(analytics.period.end_date, locale)}
              {" · "}{analytics.period.timezone}{" · "}{analytics.period.currency}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            {[7, 30, 90].map((days) => (
              <button key={days} type="button" className={presetClass} onClick={() => void applyPreset(days)} disabled={refreshing}>
                {t("{count} days", { count: days })}
              </button>
            ))}
            <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#77736a]">
              {t("From")}
              <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className={inputClass} />
            </label>
            <label className="grid gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#77736a]">
              {t("To")}
              <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className={inputClass} />
            </label>
            <button type="button" onClick={() => void applyCustomPeriod()} disabled={refreshing} className="rounded-full bg-[#17191f] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-45">
              {refreshing ? t("Updating…") : t("Apply")}
            </button>
          </div>
        </div>
        {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}
        {analytics.summary.foreign_currency_booking_count > 0 ? (
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t("{count} bookings use another currency and are excluded from money totals.", { count: analytics.summary.foreign_currency_booking_count })}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-[26px] border border-black/8 bg-white p-6 shadow-[0_16px_45px_rgba(20,20,20,0.055)] transition hover:-translate-y-0.5 hover:border-[#9a742e]/35">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a742e]">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.05em]">{card.value}</p>
            <p className="mt-2 text-sm text-[#77736a]">{card.hint}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[30px] border border-black/8 bg-white p-5 shadow-[0_18px_55px_rgba(20,20,20,0.06)] sm:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{t("Daily rhythm")}</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{t("Bookings by day")}</h2>
            </div>
            <p className="text-xs text-[#77736a]">{t("{count} upcoming", { count: analytics.summary.upcoming_count })}</p>
          </div>
          <div className="mt-8 overflow-x-auto pb-2">
            <div className="flex h-56 min-w-full items-end gap-2" style={{ width: `${Math.max(100, analytics.daily.length * 30)}px` }}>
              {analytics.daily.map((day) => {
                const height = day.bookings_count === 0 ? 4 : Math.max(16, (day.bookings_count / maxDailyBookings) * 100);
                return (
                  <div key={day.date} className="group flex min-w-[20px] flex-1 flex-col items-center justify-end gap-2" title={`${formatDate(day.date, locale)}: ${day.bookings_count}`}>
                    <span className="text-[10px] font-semibold text-[#77736a] opacity-0 transition group-hover:opacity-100">{day.bookings_count}</span>
                    <div className="w-full max-w-8 rounded-t-xl bg-[#d8b36a] transition group-hover:bg-[#9a742e]" style={{ height: `${height}%` }} />
                    <span className="text-[9px] text-[#8a867d]">{day.date.slice(8)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#8a867d]">
            {t("The chart counts non-cancelled bookings on their scheduled date in the workspace timezone.")}
          </p>
        </div>

        <div className="rounded-[30px] border border-black/8 bg-[#17191f] p-5 text-white shadow-[0_18px_55px_rgba(20,20,20,0.12)] sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d8b36a]">{t("Booking status")}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{t("Period structure")}</h2>
          <div className="mt-6 space-y-4">
            {analytics.statuses.length ? analytics.statuses.map((status) => {
              const width = statusTotal ? (status.bookings_count / statusTotal) * 100 : 0;
              return (
                <div key={status.status}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span>{t(statusMessages[status.status] ?? "Bookings")}</span>
                    <span className="font-semibold">{status.bookings_count}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#d8b36a]" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            }) : <p className="text-sm text-white/60">{t("No bookings in this period.")}</p>}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[30px] border border-black/8 bg-white p-5 shadow-[0_18px_55px_rgba(20,20,20,0.06)] sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{t("Top services")}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{t("What clients book")}</h2>
          <div className="mt-6 space-y-5">
            {analytics.services.length ? analytics.services.map((service) => (
              <div key={service.service_id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">{service.title}</p>
                    <p className="mt-1 text-xs text-[#77736a]">{t("{count} bookings", { count: service.bookings_count })}</p>
                  </div>
                  <p className="text-sm font-semibold">{money(service.booked_minor)}</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eeebe3]">
                  <div className="h-full rounded-full bg-[#17191f]" style={{ width: `${(service.bookings_count / maxServiceBookings) * 100}%` }} />
                </div>
              </div>
            )) : <p className="text-sm text-[#77736a]">{t("No bookings in this period.")}</p>}
          </div>
        </div>

        <div className="rounded-[30px] border border-black/8 bg-white p-5 shadow-[0_18px_55px_rgba(20,20,20,0.06)] sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{t("Booking sources")}</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{t("Where bookings come from")}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {analytics.sources.length ? analytics.sources.map((source) => (
              <div key={source.source} className="rounded-[22px] border border-black/8 bg-[#fffdfa] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#77736a]">{t(sourceMessages[source.source])}</p>
                <p className="mt-3 text-3xl font-semibold">{source.bookings_count}</p>
              </div>
            )) : <p className="text-sm text-[#77736a]">{t("No bookings in this period.")}</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
