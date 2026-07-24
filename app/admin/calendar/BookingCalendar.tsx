"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import { supabase } from "@/lib/supabase";
import type {
  BookingCalendarContext,
  BookingCalendarEntry,
  BookingCalendarWindow,
  BookingStatus,
} from "@/lib/modules/contracts";
import type { AdminMessage } from "@/lib/i18n/admin";

type ViewMode = "day" | "week";

type PositionedBooking = BookingCalendarEntry & {
  lane: number;
  laneCount: number;
};

const controlClass =
  "rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-semibold outline-none transition hover:border-[#9a742e] disabled:cursor-not-allowed disabled:opacity-45";

const statusMessages: Record<BookingStatus, AdminMessage> = {
  draft: "Draft",
  hold: "Hold",
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

const statusClasses: Record<BookingStatus, string> = {
  draft: "border-dashed border-black/20 bg-white text-[#55524c]",
  hold: "border-[#c8a557] bg-[#f7e9c9] text-[#5c4518]",
  pending: "border-[#d6b05f] bg-[#fff5d7] text-[#5c4518]",
  confirmed: "border-[#17191f] bg-[#17191f] text-white",
  completed: "border-[#a9b2ab] bg-[#e8eeea] text-[#344039]",
  cancelled: "border-[#d8d4ca] bg-white/80 text-[#8b877f] opacity-70",
  no_show: "border-[#e3aaaa] bg-[#fff0f0] text-[#8b2929]",
};

function dateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

function addDays(value: string, days: number) {
  const date = parseDate(value);
  date.setDate(date.getDate() + days);
  return dateInputValue(date);
}

function startOfWeek(value: string) {
  const date = parseDate(value);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return dateInputValue(date);
}

function formatDay(value: string, locale: string, withYear = false) {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" as const } : {}),
  }).format(parseDate(value));
}

function formatRange(start: string, end: string, locale: string) {
  const formatter = new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (start === end) return formatter.format(parseDate(start));
  return `${formatter.format(parseDate(start))} – ${formatter.format(parseDate(end))}`;
}

function minuteLabel(minute: number) {
  if (minute >= 1440) return "24:00";
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

function formatMoney(amountMinor: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    style: "currency",
    currency,
  }).format(amountMinor / 100);
}

function mergeWindows(windows: BookingCalendarWindow[]) {
  const sorted = [...windows].sort((a, b) => a.start_minute - b.start_minute || a.end_minute - b.end_minute);
  const merged: Array<{ start_minute: number; end_minute: number }> = [];

  for (const window of sorted) {
    const last = merged.at(-1);
    if (last && window.start_minute <= last.end_minute) {
      last.end_minute = Math.max(last.end_minute, window.end_minute);
    } else {
      merged.push({ start_minute: window.start_minute, end_minute: window.end_minute });
    }
  }
  return merged;
}

function positionBookings(bookings: BookingCalendarEntry[]): PositionedBooking[] {
  const sorted = [...bookings].sort(
    (a, b) => a.start_minute - b.start_minute || a.end_minute - b.end_minute,
  );
  const laneEnds: number[] = [];
  const positioned = sorted.map((booking) => {
    let lane = laneEnds.findIndex((endMinute) => endMinute <= booking.start_minute);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(booking.end_minute);
    } else {
      laneEnds[lane] = booking.end_minute;
    }
    return { ...booking, lane, laneCount: 1 };
  });
  const laneCount = Math.max(1, laneEnds.length);
  return positioned.map((booking) => ({ ...booking, laneCount }));
}

export default function BookingCalendar() {
  const { locale, t } = useAdminI18n();
  const today = useMemo(() => dateInputValue(new Date()), []);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [anchorDate, setAnchorDate] = useState(startOfWeek(today));
  const [resourceId, setResourceId] = useState("");
  const [resourceOptions, setResourceOptions] = useState<BookingCalendarContext["resources"]>([]);
  const [calendar, setCalendar] = useState<BookingCalendarContext | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const detailsRef = useRef<HTMLElement | null>(null);

  const requestedStart = viewMode === "week" ? startOfWeek(anchorDate) : anchorDate;
  const requestedDays = viewMode === "week" ? 7 : 1;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: calendarError } = await supabase.rpc("get_admin_booking_calendar", {
      p_start_date: requestedStart,
      p_days: requestedDays,
      p_resource_id: resourceId || null,
    });

    if (calendarError) {
      setError(calendarError.message);
      setCalendar(null);
      setLoading(false);
      return;
    }

    const nextCalendar = data as BookingCalendarContext;
    setCalendar(nextCalendar);
    if (!resourceId) setResourceOptions(nextCalendar.resources);
    setSelectedBookingId((current) =>
      current && nextCalendar.bookings.some((booking) => booking.id === current)
        ? current
        : nextCalendar.bookings[0]?.id ?? null,
    );
    setLoading(false);
  }, [requestedDays, requestedStart, resourceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedBooking = useMemo(
    () => calendar?.bookings.find((booking) => booking.id === selectedBookingId) ?? null,
    [calendar, selectedBookingId],
  );

  const days = useMemo(
    () =>
      calendar
        ? Array.from({ length: calendar.range.days }, (_, index) =>
            addDays(calendar.range.start_date, index),
          )
        : [],
    [calendar],
  );

  const timelineBounds = useMemo(() => {
    if (!calendar) return { startHour: 8, endHour: 20 };

    const starts = [
      ...calendar.working_windows.map((window) => window.start_minute),
      ...calendar.blocked_windows.map((window) => window.start_minute),
      ...calendar.bookings.map((booking) => booking.start_minute),
    ];
    const ends = [
      ...calendar.working_windows.map((window) => window.end_minute),
      ...calendar.blocked_windows.map((window) => window.end_minute),
      ...calendar.bookings.map((booking) => booking.end_minute),
    ];

    const firstMinute = starts.length ? Math.min(...starts) : 8 * 60;
    const lastMinute = ends.length ? Math.max(...ends) : 20 * 60;
    return {
      startHour: Math.max(0, Math.floor((firstMinute - 30) / 60)),
      endHour: Math.min(24, Math.max(Math.ceil((lastMinute + 30) / 60), 12)),
    };
  }, [calendar]);

  const hourHeight = 70;
  const timelineHeight = (timelineBounds.endHour - timelineBounds.startHour) * hourHeight;
  const hours = Array.from(
    { length: timelineBounds.endHour - timelineBounds.startHour + 1 },
    (_, index) => timelineBounds.startHour + index,
  );

  function move(direction: -1 | 1) {
    const amount = viewMode === "week" ? 7 : 1;
    setAnchorDate((current) => addDays(current, direction * amount));
  }

  function chooseView(nextView: ViewMode) {
    setViewMode(nextView);
    setAnchorDate((current) => (nextView === "week" ? startOfWeek(current) : current));
  }

  function goToday() {
    setAnchorDate(viewMode === "week" ? startOfWeek(today) : today);
  }

  function openBookingDetails(bookingId: string) {
    setSelectedBookingId(bookingId);
    window.requestAnimationFrame(() => {
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (loading && !calendar) {
    return (
      <div className="mt-8 rounded-[28px] border border-black/8 bg-white p-7 text-sm text-[#77736a]">
        {t("Loading calendar…")}
      </div>
    );
  }

  return (
    <div className="mt-8">
      {error && (
        <div className="mb-5 rounded-[22px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <section className="rounded-[30px] border border-black/8 bg-white p-5 shadow-[0_18px_55px_rgba(20,20,20,0.06)] sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">
              {t("Booking calendar")}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
              {calendar
                ? formatRange(calendar.range.start_date, calendar.range.end_date, locale)
                : t("Calendar")}
            </h2>
            {calendar && (
              <p className="mt-2 text-sm text-[#77736a]">
                {calendar.business.name} · {calendar.business.timezone}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={controlClass} onClick={() => move(-1)} aria-label={t("Previous period")}>
              ←
            </button>
            <button type="button" className={controlClass} onClick={goToday}>
              {t("Today")}
            </button>
            <button type="button" className={controlClass} onClick={() => move(1)} aria-label={t("Next period")}>
              →
            </button>

            <div className="flex rounded-full bg-[#eeebe3] p-1">
              {(["day", "week"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => chooseView(mode)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    viewMode === mode ? "bg-[#17191f] text-white" : "text-[#66645f]"
                  }`}
                >
                  {mode === "day" ? t("Day") : t("Week")}
                </button>
              ))}
            </div>

            <select
              className={controlClass}
              value={resourceId}
              onChange={(event) => setResourceId(event.target.value)}
              aria-label={t("Resource filter")}
            >
              <option value="">{t("All resources")}</option>
              {resourceOptions.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name}
                </option>
              ))}
            </select>

            <button type="button" className={controlClass} onClick={() => void load()} disabled={loading}>
              {loading ? t("Refreshing…") : t("Refresh")}
            </button>
          </div>
        </div>

        {calendar && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {[
              [t("Bookings"), calendar.summary.total],
              [t("Occupied"), calendar.summary.occupying],
              [t("Pending"), calendar.summary.pending],
              [t("Confirmed"), calendar.summary.confirmed],
              [t("Completed"), calendar.summary.completed],
              [t("Cancelled"), calendar.summary.cancelled],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-[20px] bg-[#eeebe3] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8d8679]">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {calendar && (
        <section className="mt-5 overflow-hidden rounded-[30px] border border-black/8 bg-white shadow-[0_18px_55px_rgba(20,20,20,0.06)]">
          <div className="overflow-x-auto">
            <div className={viewMode === "day" ? "min-w-[620px]" : "min-w-[1196px]"}>
              <div
                className="grid border-b border-black/8 bg-[#fffdfa]"
                style={{ gridTemplateColumns: `76px repeat(${days.length}, minmax(160px, 1fr))` }}
              >
                <div className="border-r border-black/8 p-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8d8679]">
                  {t("Time")}
                </div>
                {days.map((day) => {
                  const isToday = day === today;
                  const count = calendar.bookings.filter((booking) => booking.local_date === day).length;
                  return (
                    <div key={day} className={`border-r border-black/8 p-3 last:border-r-0 ${isToday ? "bg-[#f6eddc]" : ""}`}>
                      <p className="text-xs font-semibold capitalize">{formatDay(day, locale)}</p>
                      <p className="mt-1 text-[11px] text-[#8d8679]">
                        {count ? t("{count} bookings", { count }) : t("No bookings")}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div
                className="grid"
                style={{ gridTemplateColumns: `76px repeat(${days.length}, minmax(160px, 1fr))` }}
              >
                <div className="relative border-r border-black/8 bg-[#fffdfa]" style={{ height: timelineHeight }}>
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="absolute left-0 right-0 -translate-y-1/2 pr-3 text-right text-[10px] font-medium text-[#8d8679]"
                      style={{ top: (hour - timelineBounds.startHour) * hourHeight }}
                    >
                      {minuteLabel(hour * 60)}
                    </div>
                  ))}
                </div>

                {days.map((day) => {
                  const dayBookings = positionBookings(
                    calendar.bookings.filter((booking) => booking.local_date === day),
                  );
                  const working = mergeWindows(
                    calendar.working_windows.filter((window) => window.local_date === day),
                  );
                  const blocked = mergeWindows(
                    calendar.blocked_windows.filter((window) => window.local_date === day),
                  );

                  return (
                    <div
                      key={day}
                      className={`relative border-r border-black/8 last:border-r-0 ${day === today ? "bg-[#fffaf0]" : "bg-white"}`}
                      style={{ height: timelineHeight }}
                    >
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="pointer-events-none absolute left-0 right-0 border-t border-black/[0.06]"
                          style={{ top: (hour - timelineBounds.startHour) * hourHeight }}
                        />
                      ))}

                      {working.map((window, index) => {
                        const top =
                          ((window.start_minute - timelineBounds.startHour * 60) / 60) * hourHeight;
                        const height =
                          ((window.end_minute - window.start_minute) / 60) * hourHeight;
                        return (
                          <div
                            key={`working-${index}-${window.start_minute}`}
                            className="pointer-events-none absolute left-1 right-1 rounded-xl border border-emerald-100 bg-emerald-50/55"
                            style={{ top, height }}
                            aria-label={t("Working hours")}
                          />
                        );
                      })}

                      {blocked.map((window, index) => {
                        const top =
                          ((window.start_minute - timelineBounds.startHour * 60) / 60) * hourHeight;
                        const height =
                          ((window.end_minute - window.start_minute) / 60) * hourHeight;
                        return (
                          <div
                            key={`blocked-${index}-${window.start_minute}`}
                            className="pointer-events-none absolute left-1 right-1 rounded-xl border border-red-100 opacity-70"
                            style={{
                              top,
                              height,
                              backgroundImage:
                                "repeating-linear-gradient(135deg, rgba(185,70,70,0.08) 0, rgba(185,70,70,0.08) 6px, rgba(255,255,255,0.45) 6px, rgba(255,255,255,0.45) 12px)",
                            }}
                            aria-label={t("Blocked time")}
                          />
                        );
                      })}

                      {dayBookings.map((booking) => {
                        const top =
                          ((booking.start_minute - timelineBounds.startHour * 60) / 60) * hourHeight;
                        const rawHeight =
                          ((booking.end_minute - booking.start_minute) / 60) * hourHeight;
                        const width = 100 / booking.laneCount;
                        const left = booking.lane * width;
                        const active = booking.id === selectedBookingId;

                        return (
                          <button
                            key={booking.id}
                            type="button"
                            onClick={() => openBookingDetails(booking.id)}
                            className={`absolute z-10 overflow-hidden rounded-xl border p-2 text-left text-[11px] shadow-sm transition hover:z-20 hover:scale-[1.02] ${statusClasses[booking.status]} ${
                              active ? "ring-2 ring-[#d8b36a] ring-offset-1" : ""
                            }`}
                            style={{
                              top: Math.max(0, top + 2),
                              height: Math.max(34, rawHeight - 4),
                              left: `calc(${left}% + 3px)`,
                              width: `calc(${width}% - 6px)`,
                            }}
                            title={`${minuteLabel(booking.start_minute)}–${minuteLabel(booking.end_minute)} · ${booking.client_name}`}
                          >
                            <span className="block font-semibold">
                              {minuteLabel(booking.start_minute)} · {booking.service_title}
                            </span>
                            <span className="mt-1 block truncate opacity-75">{booking.client_name}</span>
                            {rawHeight >= 58 && (
                              <span className="mt-1 block truncate text-[10px] uppercase tracking-[0.08em] opacity-65">
                                {booking.occupies_resource ? t("Occupied") : t(statusMessages[booking.status])}
                              </span>
                            )}
                          </button>
                        );
                      })}

                      {dayBookings.length === 0 && working.length > 0 && (
                        <div className="absolute left-3 right-3 top-3 rounded-full bg-white/75 px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8d8679]">
                          {t("Free schedule")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-black/8 bg-[#fffdfa] px-5 py-4 text-[11px] text-[#716d65]">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded border border-emerald-100 bg-emerald-50" />
              {t("Working hours")}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded border border-red-100 bg-red-50" />
              {t("Blocked time")}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-[#17191f]" />
              {t("Occupied")}
            </span>
          </div>
        </section>
      )}

      {calendar && selectedBooking && (
        <section
          ref={detailsRef}
          id="selected-booking-details"
          className="mt-5 scroll-mt-6 rounded-[30px] border border-black/8 bg-[#eeebe3] p-5 sm:p-7"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">
                {t("Selected booking")}
              </p>
              <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                {selectedBooking.reference}
              </h3>
              <p className="mt-2 text-sm text-[#66645f]">
                {selectedBooking.service_title} · {selectedBooking.client_name}
              </p>
            </div>
            <Link
              href={`/admin/bookings?booking=${selectedBooking.id}`}
              className="rounded-full bg-[#17191f] px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-white"
            >
              {t("Open bookings")}
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[20px] bg-white/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8d8679]">{t("Time")}</p>
              <p className="mt-2 font-semibold">
                {formatDay(selectedBooking.local_date, locale, true)}
              </p>
              <p className="mt-1 text-sm text-[#66645f]">
                {minuteLabel(selectedBooking.start_minute)}–{minuteLabel(selectedBooking.end_minute)}
              </p>
            </div>
            <div className="rounded-[20px] bg-white/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8d8679]">{t("Status")}</p>
              <p className="mt-2 font-semibold">{t(statusMessages[selectedBooking.status])}</p>
              <p className="mt-1 text-sm text-[#66645f]">{t("Source")}: {selectedBooking.source}</p>
            </div>
            <div className="rounded-[20px] bg-white/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8d8679]">{t("Client")}</p>
              <p className="mt-2 font-semibold">{selectedBooking.client_name}</p>
              <p className="mt-1 truncate text-sm text-[#66645f]">
                {selectedBooking.client_email || selectedBooking.client_phone || t("No contact")}
              </p>
            </div>
            <div className="rounded-[20px] bg-white/80 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8d8679]">{t("Resources")}</p>
              <p className="mt-2 font-semibold">
                {selectedBooking.resources.map((resource) => resource.name).join(", ") || t("No resource allocations.")}
              </p>
              <p className="mt-1 text-sm text-[#66645f]">
                {formatMoney(selectedBooking.total_minor, selectedBooking.currency, locale)}
              </p>
            </div>
          </div>
        </section>
      )}

      {calendar && calendar.bookings.length === 0 && (
        <div className="mt-5 rounded-[28px] border border-black/8 bg-white p-7 text-sm text-[#77736a]">
          {t("There are no bookings in this period. Working and blocked hours are still shown.")}
        </div>
      )}
    </div>
  );
}
