"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PublicSiteService } from "@/lib/public-site/types";

const weekdayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

type CalendarAvailabilityStatus = "available" | "partial" | "full" | "closed";

type CalendarAvailabilityRecord = {
  calendar_date: string;
  available_slot_count: number | string;
  has_bookings: boolean;
  availability_status: CalendarAvailabilityStatus;
};

type CalendarDayAvailability = {
  availableSlotCount: number;
  hasBookings: boolean;
  status: CalendarAvailabilityStatus;
};

function localDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-01`;
}

function businessSlugFromBookingHref(bookingHref: string) {
  const pathname = bookingHref.split("?")[0]?.split("#")[0] ?? "";
  const marker = "/book/";
  const markerIndex = pathname.indexOf(marker);
  if (markerIndex < 0) return "";

  const encodedSlug = pathname.slice(markerIndex + marker.length).split("/")[0] ?? "";
  try {
    return decodeURIComponent(encodedSlug).trim().toLowerCase();
  } catch {
    return encodedSlug.trim().toLowerCase();
  }
}

function availabilityLabel(day?: CalendarDayAvailability) {
  if (!day) return "";
  if (day.status === "available") return `${day.availableSlotCount} свободных окон`;
  if (day.status === "partial") return `${day.availableSlotCount} свободных окон, часть времени занята`;
  if (day.status === "full") return "Свободного времени нет";
  return "В этот день запись закрыта";
}

export default function GlossBookingPanel({
  bookingHref,
  bookingLabel,
  services,
  compact = false,
}: {
  bookingHref: string;
  bookingLabel: string;
  services: PublicSiteService[];
  compact?: boolean;
}) {
  const router = useRouter();
  const [serviceSlug, setServiceSlug] = useState(services[0]?.slug ?? "");
  const [date, setDate] = useState("");
  const [minDate, setMinDate] = useState("");
  const [calendarMonth, setCalendarMonth] = useState("");
  const [availability, setAvailability] = useState<Record<string, CalendarDayAvailability>>({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(false);
  const [availabilityRevision, setAvailabilityRevision] = useState(0);

  const businessSlug = useMemo(
    () => businessSlugFromBookingHref(bookingHref),
    [bookingHref],
  );
  const selectedService = useMemo(
    () => services.find((service) => service.slug === serviceSlug) ?? services[0],
    [serviceSlug, services],
  );

  useEffect(() => {
    const today = new Date();
    const todayKey = localDateKey(today);
    setMinDate(todayKey);
    setDate((current) => current || todayKey);
    setCalendarMonth(monthKey(today));
  }, []);

  useEffect(() => {
    if (!services.length) {
      setServiceSlug("");
      return;
    }
    if (!services.some((service) => service.slug === serviceSlug)) {
      setServiceSlug(services[0].slug);
    }
  }, [serviceSlug, services]);

  useEffect(() => {
    const refresh = () => setAvailabilityRevision((value) => value + 1);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const calendar = useMemo(() => {
    if (!calendarMonth) {
      return { label: "", days: [] as Array<string | null> };
    }
    const [year, month] = calendarMonth.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const emptyBefore = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: Array<string | null> = Array.from(
      { length: emptyBefore },
      () => null,
    );

    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push(
        `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      );
    }
    while (days.length % 7 !== 0) days.push(null);

    return {
      label: new Intl.DateTimeFormat("ru-RU", {
        month: "long",
        year: "numeric",
      }).format(firstDay),
      days,
    };
  }, [calendarMonth]);

  const calendarDates = useMemo(
    () => calendar.days.filter((value): value is string => Boolean(value)),
    [calendar.days],
  );
  const calendarStartDate = calendarDates[0] ?? "";
  const calendarEndDate = calendarDates[calendarDates.length - 1] ?? "";

  useEffect(() => {
    if (
      !businessSlug ||
      !selectedService ||
      !calendarStartDate ||
      !calendarEndDate
    ) {
      setAvailability({});
      setAvailabilityLoading(false);
      return;
    }

    let cancelled = false;
    setAvailabilityLoading(true);
    setAvailabilityError(false);

    const loadAvailability = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.rpc(
        "get_public_service_availability_calendar",
        {
          p_business_slug: businessSlug,
          p_service_slug: selectedService.slug,
          p_start_date: calendarStartDate,
          p_end_date: calendarEndDate,
          p_duration_minutes: selectedService.duration_min_minutes ?? 60,
          p_party_size: 1,
        },
      );

      if (cancelled) return;
      setAvailabilityLoading(false);

      if (error) {
        setAvailability({});
        setAvailabilityError(true);
        return;
      }

      const nextAvailability = Object.fromEntries(
        ((data ?? []) as CalendarAvailabilityRecord[]).map((item) => [
          item.calendar_date,
          {
            availableSlotCount: Number(item.available_slot_count) || 0,
            hasBookings: Boolean(item.has_bookings),
            status: item.availability_status,
          } satisfies CalendarDayAvailability,
        ]),
      );

      setAvailability(nextAvailability);
      setDate((current) => {
        const currentStatus = current ? nextAvailability[current] : undefined;
        if (
          current &&
          current >= minDate &&
          currentStatus &&
          currentStatus.availableSlotCount > 0
        ) {
          return current;
        }

        return (
          calendarDates.find(
            (value) =>
              value >= minDate &&
              (nextAvailability[value]?.availableSlotCount ?? 0) > 0,
          ) ?? ""
        );
      });
    };

    void loadAvailability();
    return () => {
      cancelled = true;
    };
  }, [
    availabilityRevision,
    businessSlug,
    calendarDates,
    calendarEndDate,
    calendarStartDate,
    minDate,
    selectedService,
  ]);

  function moveMonth(direction: -1 | 1) {
    if (!calendarMonth) return;
    const [year, month] = calendarMonth.split("-").map(Number);
    const next = new Date(year, month - 1 + direction, 1);
    const nextKey = monthKey(next);
    if (minDate && nextKey < `${minDate.slice(0, 7)}-01`) return;
    setCalendarMonth(nextKey);
  }

  function openCalendar() {
    if (!date) return;
    const query = new URLSearchParams();
    if (serviceSlug) query.set("service", serviceSlug);
    query.set("date", date);
    router.push(`${bookingHref}${query.size ? `?${query.toString()}` : ""}`);
  }

  const fieldClass =
    "mt-2 min-h-11 w-full rounded-lg border border-[#3b211f]/12 bg-white px-3 text-sm text-[#3b211f] outline-none transition focus:border-[#a60918]";
  const selectedAvailability = date ? availability[date] : undefined;
  const selectedDateLabel = date
    ? new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
      }).format(new Date(`${date}T12:00:00`))
    : "";

  return (
    <div
      className={`rounded-2xl border border-[#3b211f]/10 bg-white shadow-[0_18px_55px_rgba(92,15,22,0.06)] ${
        compact ? "p-4 sm:p-5" : "p-5 sm:p-7"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a60918]">
        Онлайн-запись
      </p>
      <h2
        className={`mt-2 font-serif leading-tight text-[#4b2725] ${
          compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
        }`}
      >
        Красивые руки — в удобное время
      </h2>

      <div className="mt-6">
        <label className="text-xs font-medium text-[#5c4a47]">
          Услуга
          <select
            value={serviceSlug}
            onChange={(event) => setServiceSlug(event.target.value)}
            className={fieldClass}
          >
            {services.map((service) => (
              <option key={service.id} value={service.slug}>
                {service.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div
        className={`mt-5 rounded-xl border border-[#3b211f]/10 bg-[#fffaf8] ${
          compact ? "p-3 sm:p-4" : "p-4 sm:p-5"
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a60918]">
              Календарь записи
            </p>
            <p className="mt-1 font-serif text-2xl capitalize text-[#4b2725]">
              {calendar.label}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              disabled={
                !calendarMonth ||
                !minDate ||
                calendarMonth <= `${minDate.slice(0, 7)}-01`
              }
              className="grid h-9 w-9 place-items-center rounded-full border border-[#3b211f]/10 bg-white text-sm disabled:opacity-25"
              aria-label="Предыдущий месяц"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              disabled={!calendarMonth}
              className="grid h-9 w-9 place-items-center rounded-full border border-[#3b211f]/10 bg-white text-sm disabled:opacity-25"
              aria-label="Следующий месяц"
            >
              →
            </button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-7 gap-1 text-center">
          {weekdayLabels.map((label) => (
            <span
              key={label}
              className="py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#8b7c79]"
            >
              {label}
            </span>
          ))}
          {calendar.days.map((value, index) => {
            if (!value) return <span key={`empty-${index}`} />;

            const dayAvailability = availability[value];
            const isPast = Boolean(minDate && value < minDate);
            const isUnavailable =
              dayAvailability?.status === "full" ||
              dayAvailability?.status === "closed";
            const isSelected = date === value;
            const disabled =
              isPast ||
              availabilityLoading ||
              (!availabilityError && isUnavailable);
            const statusClass = isSelected
              ? "bg-[#a60918] text-white shadow-md"
              : dayAvailability?.status === "partial"
                ? "bg-[#fff1d8] text-[#6c4611] hover:bg-[#f8dfb0]"
                : dayAvailability?.status === "full"
                  ? "bg-[#f1dfdf] text-[#a36b6b]"
                  : dayAvailability?.status === "closed"
                    ? "bg-transparent text-black/25"
                    : "bg-white text-[#4b2725] hover:bg-[#f1dedf]";
            const dotClass = isSelected
              ? "bg-white"
              : dayAvailability?.status === "partial"
                ? "bg-[#d9941f]"
                : dayAvailability?.status === "full"
                  ? "bg-[#a60918]"
                  : dayAvailability?.status === "closed"
                    ? "bg-[#b9adaa]"
                    : "bg-[#3b9b67]";

            return (
              <button
                key={value}
                type="button"
                onClick={() => setDate(value)}
                disabled={disabled}
                aria-pressed={isSelected}
                aria-label={`${Number(value.slice(-2))} ${calendar.label}. ${availabilityLabel(dayAvailability)}`}
                title={availabilityLabel(dayAvailability)}
                className={`relative aspect-square rounded-lg text-xs font-semibold transition disabled:cursor-not-allowed ${statusClass}`}
              >
                {Number(value.slice(-2))}
                {!isPast && dayAvailability ? (
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${dotClass}`}
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-[#7e706d]">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#3b9b67]" />Есть время</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#d9941f]" />Частично занято</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#a60918]" />Нет свободного времени</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#b9adaa]" />Запись закрыта</span>
        </div>

        <p className="mt-4 text-[11px] text-[#8b7c79]">
          {availabilityLoading
            ? "Проверяем реальные свободные окна…"
            : availabilityError
              ? "Не удалось обновить календарь. Дату всё равно можно проверить на следующем шаге."
              : date
                ? `Выбрано: ${selectedDateLabel}${selectedAvailability ? ` · ${availabilityLabel(selectedAvailability)}` : ""}`
                : "В этом месяце нет доступных дат для выбранной услуги."}
        </p>
      </div>

      <button
        type="button"
        onClick={openCalendar}
        disabled={!services.length || !date || availabilityLoading}
        className="mt-5 min-h-12 w-full rounded-lg bg-[#a60918] px-5 text-sm font-semibold text-white transition hover:bg-[#870711] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {availabilityLoading
          ? "Проверяем календарь…"
          : date
            ? bookingLabel || "Показать свободное время"
            : "Нет свободных дат в этом месяце"}
      </button>
      <p className="mt-3 text-center text-[11px] text-[#8b7c79]">
        Подтверждение и напоминание придут на email
      </p>
    </div>
  );
}
