"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicSiteService } from "@/lib/public-site/types";

const weekdayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function localDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-01`;
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

  useEffect(() => {
    const today = new Date();
    const todayKey = localDateKey(today);
    setMinDate(todayKey);
    setDate((current) => current || todayKey);
    setCalendarMonth(monthKey(today));
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

  function moveMonth(direction: -1 | 1) {
    if (!calendarMonth) return;
    const [year, month] = calendarMonth.split("-").map(Number);
    const next = new Date(year, month - 1 + direction, 1);
    const nextKey = monthKey(next);
    if (minDate && nextKey < `${minDate.slice(0, 7)}-01`) return;
    setCalendarMonth(nextKey);
  }

  function openCalendar() {
    const selectedDate = date || minDate;
    if (!selectedDate) return;
    const query = new URLSearchParams();
    if (serviceSlug) query.set("service", serviceSlug);
    query.set("date", selectedDate);
    router.push(`${bookingHref}${query.size ? `?${query.toString()}` : ""}`);
  }

  const fieldClass =
    "mt-2 min-h-11 w-full rounded-lg border border-[#3b211f]/12 bg-white px-3 text-sm text-[#3b211f] outline-none transition focus:border-[#a60918]";

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
          {calendar.days.map((value, index) =>
            value ? (
              <button
                key={value}
                type="button"
                onClick={() => setDate(value)}
                disabled={Boolean(minDate && value < minDate)}
                aria-pressed={date === value}
                className={`aspect-square rounded-lg text-xs font-semibold transition ${
                  date === value
                    ? "bg-[#a60918] text-white shadow-md"
                    : "bg-white text-[#4b2725] hover:bg-[#f1dedf] disabled:bg-transparent disabled:text-black/20"
                }`}
              >
                {Number(value.slice(-2))}
              </button>
            ) : (
              <span key={`empty-${index}`} />
            ),
          )}
        </div>
        <p className="mt-4 text-[11px] text-[#8b7c79]">
          {date
            ? `Выбрано: ${new Intl.DateTimeFormat("ru-RU", {
                day: "numeric",
                month: "long",
              }).format(new Date(`${date}T12:00:00`))}`
            : "Выберите дату, чтобы перейти к реальным свободным окнам."}
        </p>
      </div>

      <button
        type="button"
        onClick={openCalendar}
        disabled={!services.length}
        className="mt-5 min-h-12 w-full rounded-lg bg-[#a60918] px-5 text-sm font-semibold text-white transition hover:bg-[#870711] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {date ? bookingLabel || "Показать свободное время" : "Выбрать ближайшую дату"}
      </button>
      <p className="mt-3 text-center text-[11px] text-[#8b7c79]">
        Подтверждение и напоминание придут на email
      </p>
    </div>
  );
}
