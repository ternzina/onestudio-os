"use client";

import { useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  type BusinessRecord,
  formatBookingDate,
  formatMoney,
  getPaymentState,
  loadBusinessRecords,
} from "../_lib/businessData";

type Period = "7" | "30" | "90" | "all";

const periodOptions: { value: Period; label: string }[] = [
  { value: "7", label: "7 дней" },
  { value: "30", label: "30 дней" },
  { value: "90", label: "90 дней" },
  { value: "all", label: "Всё время" },
];

const toDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isBetween = (value: string, start: string | null, end: string) =>
  (!start || value >= start) && value <= end;

const percentChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const getPaidDate = (record: BusinessRecord) =>
  record.paidAt?.slice(0, 10) || record.bookingDate;

export default function AdminAnalyticsPage() {
  const [records, setRecords] = useState<BusinessRecord[]>([]);
  const [period, setPeriod] = useState<Period>("30");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      setRecords(await loadBusinessRecords());
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить аналитику",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const analytics = useMemo(() => {
    const today = new Date();
    const todayString = toDateString(today);
    const days = period === "all" ? null : Number(period);
    const start = days ? toDateString(addDays(today, -(days - 1))) : null;
    const previousEnd = days ? toDateString(addDays(today, -days)) : null;
    const previousStart = days
      ? toDateString(addDays(today, -(days * 2 - 1)))
      : null;

    const activeRecords = records.filter(
      (record) =>
        record.bookingStatus !== "cancelled" &&
        isBetween(record.bookingDate, start, todayString),
    );
    const previousRecords = days
      ? records.filter(
          (record) =>
            record.bookingStatus !== "cancelled" &&
            isBetween(
              record.bookingDate,
              previousStart,
              previousEnd || todayString,
            ),
        )
      : [];

    const paidRecords = records.filter(
      (record) =>
        getPaymentState(record.paymentStatus) === "paid" &&
        isBetween(getPaidDate(record), start, todayString),
    );
    const previousPaidRecords = days
      ? records.filter(
          (record) =>
            getPaymentState(record.paymentStatus) === "paid" &&
            isBetween(
              getPaidDate(record),
              previousStart,
              previousEnd || todayString,
            ),
        )
      : [];

    const revenue = paidRecords.reduce(
      (sum, record) => sum + record.paymentAmount,
      0,
    );
    const previousRevenue = previousPaidRecords.reduce(
      (sum, record) => sum + record.paymentAmount,
      0,
    );
    const bookingValue = activeRecords.reduce(
      (sum, record) => sum + record.bookingAmount,
      0,
    );
    const averageBooking =
      activeRecords.length > 0 ? bookingValue / activeRecords.length : 0;
    const photoCount = activeRecords.filter(
      (record) => record.kind === "photo",
    ).length;
    const rentalCount = activeRecords.filter(
      (record) => record.kind === "rental",
    ).length;
    const rentalHours = activeRecords.reduce(
      (sum, record) => sum + record.rentalHours,
      0,
    );
    const paidCount = activeRecords.filter(
      (record) => getPaymentState(record.paymentStatus) === "paid",
    ).length;
    const pendingAmount = activeRecords
      .filter((record) => getPaymentState(record.paymentStatus) === "pending")
      .reduce((sum, record) => sum + record.paymentAmount, 0);

    const futureEnd = toDateString(addDays(today, 7));
    const upcoming = records
      .filter(
        (record) =>
          record.bookingStatus !== "cancelled" &&
          record.bookingDate >= todayString &&
          record.bookingDate <= futureEnd,
      )
      .sort((first, second) =>
        `${first.bookingDate} ${first.bookingTime}`.localeCompare(
          `${second.bookingDate} ${second.bookingTime}`,
        ),
      )
      .slice(0, 6);

    return {
      activeRecords,
      revenue,
      bookingValue,
      averageBooking,
      photoCount,
      rentalCount,
      rentalHours,
      pendingAmount,
      paymentConversion:
        activeRecords.length > 0
          ? Math.round((paidCount / activeRecords.length) * 100)
          : 0,
      bookingChange: days
        ? percentChange(activeRecords.length, previousRecords.length)
        : null,
      revenueChange: days
        ? percentChange(revenue, previousRevenue)
        : null,
      upcoming,
    };
  }, [period, records]);

  const maxKindCount = Math.max(
    analytics.photoCount,
    analytics.rentalCount,
    1,
  );

  return (
    <main className="min-h-screen bg-[#F7F1EA] px-5 py-28 text-[#2B1A12]">
      <AdminHeader />

      <section className="mx-auto w-full max-w-7xl">
        <div className="mb-8 overflow-hidden rounded-[42px] border border-[#E5D5C8] bg-[#2B1A12] p-7 text-[#F7F1EA] shadow-[0_28px_90px_rgba(43,26,18,0.22)] sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.32em] text-[#D9B98F]">
                Sisters Studio OS · Business
              </p>
              <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">
                Аналитика студии
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#E8D8CC] sm:text-base">
                Выручка, стоимость бронирований, загрузка аренды и соотношение
                услуг — по настоящим данным студии.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value as Period)}
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white outline-none backdrop-blur-xl"
              >
                {periodOptions.map((option) => (
                  <option key={option.value} value={option.value} className="text-[#2B1A12]">
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void refresh()}
                disabled={isLoading}
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white hover:text-[#2B1A12] disabled:opacity-50"
              >
                {isLoading ? "Обновляем…" : "Обновить"}
              </button>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Получено онлайн"
            value={formatMoney(analytics.revenue)}
            change={analytics.revenueChange}
            detail="по дате поступления оплаты"
          />
          <MetricCard
            label="Стоимость броней"
            value={formatMoney(analytics.bookingValue)}
            detail="полная стоимость услуг"
          />
          <MetricCard
            label="Бронирования"
            value={String(analytics.activeRecords.length)}
            change={analytics.bookingChange}
            detail="без отменённых"
          />
          <MetricCard
            label="Средний чек"
            value={formatMoney(analytics.averageBooking)}
            detail="полная стоимость брони"
          />
          <MetricCard
            label="Часы аренды"
            value={`${analytics.rentalHours} ч`}
            detail="без отдельного учёта гримёрки"
          />
          <MetricCard
            label="Доля оплаченных"
            value={`${analytics.paymentConversion}%`}
            detail="среди броней периода"
          />
          <MetricCard
            label="Ожидается онлайн"
            value={formatMoney(analytics.pendingAmount)}
            detail="открытые Stripe-оплаты"
          />
          <MetricCard
            label="Ближайшие 7 дней"
            value={String(analytics.upcoming.length)}
            detail="ближайших бронирований"
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[36px] border border-[#E5D5C8] bg-white/75 p-6 shadow-[0_24px_90px_rgba(83,54,37,0.10)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A67C52]">
              Направления
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              Что бронируют
            </h2>

            <div className="mt-8 space-y-7">
              <KindBar
                label="Фотосессии"
                value={analytics.photoCount}
                max={maxKindCount}
                color="bg-[#9C6B55]"
              />
              <KindBar
                label="Аренда студии"
                value={analytics.rentalCount}
                max={maxKindCount}
                color="bg-[#D1A276]"
              />
            </div>

            <div className="mt-8 rounded-[24px] bg-[#F7F1EA] p-5 text-sm leading-6 text-[#7A6252]">
              Здесь считается одно бронирование аренды, даже если клиент в нём
              выбрал одновременно зал и гримёрку.
            </div>
          </div>

          <div className="rounded-[36px] border border-[#E5D5C8] bg-white/75 p-6 shadow-[0_24px_90px_rgba(83,54,37,0.10)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A67C52]">
              Календарь
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              Ближайшие бронирования
            </h2>

            {analytics.upcoming.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-[#D8C4B3] bg-[#F7F1EA]/70 p-8 text-center text-sm text-[#7A6252]">
                На ближайшие семь дней бронирований нет.
              </div>
            ) : (
              <div className="mt-6 divide-y divide-[#E5D5C8] overflow-hidden rounded-[24px] border border-[#E5D5C8]">
                {analytics.upcoming.map((record) => (
                  <div
                    key={`${record.kind}-${record.id}`}
                    className="grid gap-3 bg-white/70 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div>
                      <p className="font-semibold">{record.clientName}</p>
                      <p className="mt-1 text-xs text-[#7A6252]">
                        {record.kind === "photo"
                          ? "Фотосессия"
                          : "Аренда студии"}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-sm font-semibold">
                        {formatBookingDate(record.bookingDate)}
                      </p>
                      <p className="mt-1 text-xs text-[#7A6252]">
                        {record.bookingTime?.slice(0, 5) || "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  detail,
  change,
}: {
  label: string;
  value: string;
  detail: string;
  change?: number | null;
}) {
  return (
    <div className="rounded-[28px] border border-[#E5D5C8] bg-white/75 p-6 shadow-[0_18px_60px_rgba(83,54,37,0.10)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-[#7A6252]">{label}</p>
        {change !== null && change !== undefined && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              change >= 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {change >= 0 ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.05em]">{value}</p>
      <p className="mt-2 text-xs text-[#9A8170]">{detail}</p>
    </div>
  );
}

function KindBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const width = value === 0 ? 0 : Math.max(8, (value / max) * 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-[#F0E5DB]">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
