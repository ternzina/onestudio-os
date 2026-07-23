"use client";

import { useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  type BusinessRecord,
  formatBookingDate,
  formatDateTime,
  formatMoney,
  getPaymentState,
  loadBusinessRecords,
} from "../_lib/businessData";

type PaymentFilter =
  | "all"
  | "paid"
  | "pending"
  | "not_started"
  | "cancelled";

const filterOptions: { value: PaymentFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "paid", label: "Оплачено" },
  { value: "pending", label: "Ожидает оплаты" },
  { value: "not_started", label: "Оплата не начата" },
  { value: "cancelled", label: "Отменено" },
];

const paymentLabels = {
  paid: "Оплачено",
  pending: "Ожидает оплаты",
  not_started: "Оплата не начата",
  cancelled: "Отменено",
} as const;

const paymentClasses = {
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  not_started: "border-[#E5D5C8] bg-[#F7F1EA] text-[#7A6252]",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
} as const;

export default function AdminPaymentsPage() {
  const [records, setRecords] = useState<BusinessRecord[]>([]);
  const [filter, setFilter] = useState<PaymentFilter>("all");
  const [search, setSearch] = useState("");
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
        error instanceof Error ? error.message : "Не удалось загрузить оплаты",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const statistics = useMemo(() => {
    const paid = records.filter(
      (record) => getPaymentState(record.paymentStatus) === "paid",
    );
    const pending = records.filter(
      (record) => getPaymentState(record.paymentStatus) === "pending",
    );
    const notStarted = records.filter(
      (record) => getPaymentState(record.paymentStatus) === "not_started",
    );

    return {
      paidAmount: paid.reduce(
        (sum, record) => sum + record.paymentAmount,
        0,
      ),
      paidCount: paid.length,
      pendingAmount: pending.reduce(
        (sum, record) => sum + record.paymentAmount,
        0,
      ),
      pendingCount: pending.length,
      notStartedCount: notStarted.length,
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    return records.filter((record) => {
      const state = getPaymentState(record.paymentStatus);
      const matchesFilter = filter === "all" || state === filter;
      const matchesSearch =
        !cleanSearch ||
        record.clientName.toLowerCase().includes(cleanSearch) ||
        record.clientEmail.toLowerCase().includes(cleanSearch) ||
        record.clientPhone.toLowerCase().includes(cleanSearch) ||
        record.id.toLowerCase().includes(cleanSearch);

      return matchesFilter && matchesSearch;
    });
  }, [filter, records, search]);

  return (
    <main className="min-h-screen bg-[#F7F1EA] px-5 py-28 text-[#2B1A12]">
      <AdminHeader />

      <section className="mx-auto w-full max-w-7xl">
        <div className="mb-8 overflow-hidden rounded-[42px] border border-[#E5D5C8] bg-[#2B1A12] p-7 text-[#F7F1EA] shadow-[0_28px_90px_rgba(43,26,18,0.22)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.32em] text-[#D9B98F]">
                Sisters Studio OS · Stripe
              </p>
              <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">
                Оплата
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#E8D8CC] sm:text-base">
                Оплаты за фотосессии и аренду собраны в одном месте. Аренда
                считается полной суммой, фотосессия — суммой внесённой
                предоплаты.
              </p>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.22em] text-[#D9B98F]">
                Получено онлайн
              </p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
                {formatMoney(statistics.paidAmount)}
              </p>
              <p className="mt-2 text-sm text-[#E8D8CC]">
                {statistics.paidCount} оплаченных бронирований
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Получено онлайн"
            value={formatMoney(statistics.paidAmount)}
            detail={`${statistics.paidCount} оплат`}
          />
          <StatCard
            label="Ожидается"
            value={formatMoney(statistics.pendingAmount)}
            detail={`${statistics.pendingCount} открытых оплат`}
          />
          <StatCard
            label="Оплата не начата"
            value={String(statistics.notStartedCount)}
            detail="бронирований"
          />
          <StatCard
            label="Все бронирования"
            value={String(records.length)}
            detail="фотосессии и аренда"
          />
        </div>

        <div className="mt-8 rounded-[36px] border border-[#E5D5C8] bg-white/75 p-5 shadow-[0_24px_90px_rgba(83,54,37,0.12)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A67C52]">
                История операций
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                Бронирования и их оплата
              </h2>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Имя, email, телефон или ID"
                className="min-w-0 rounded-full border border-[#D8C4B3] bg-white px-5 py-3 text-sm outline-none transition placeholder:text-[#9A8170] focus:border-[#A67C52] lg:w-[310px]"
              />
              <button
                type="button"
                onClick={() => void refresh()}
                disabled={isLoading}
                className="rounded-full border border-[#D8C4B3] bg-white px-5 py-3 text-sm font-semibold transition hover:bg-[#2B1A12] hover:text-white disabled:opacity-50"
              >
                {isLoading ? "Обновляем…" : "Обновить"}
              </button>
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === option.value
                    ? "bg-[#2B1A12] text-white"
                    : "border border-[#E5D5C8] bg-[#F7F1EA] text-[#7A6252] hover:border-[#A67C52]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {errorMessage && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {!errorMessage && !isLoading && filteredRecords.length === 0 && (
            <div className="mt-6 rounded-[28px] border border-dashed border-[#D8C4B3] bg-[#F7F1EA]/70 p-10 text-center text-sm text-[#7A6252]">
              По выбранному фильтру оплат нет.
            </div>
          )}

          {!errorMessage && isLoading && (
            <div className="mt-6 rounded-[28px] bg-[#F7F1EA]/70 p-8 text-center text-sm text-[#7A6252]">
              Загружаем оплаты…
            </div>
          )}

          {!errorMessage && !isLoading && filteredRecords.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-[26px] border border-[#E5D5C8]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-left">
                  <thead className="bg-[#F7F1EA] text-xs uppercase tracking-[0.14em] text-[#7A6252]">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Клиент</th>
                      <th className="px-5 py-4 font-semibold">Услуга</th>
                      <th className="px-5 py-4 font-semibold">Дата брони</th>
                      <th className="px-5 py-4 font-semibold">Сумма</th>
                      <th className="px-5 py-4 font-semibold">Статус</th>
                      <th className="px-5 py-4 font-semibold">Оплачено</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5D5C8] bg-white/80">
                    {filteredRecords.map((record) => {
                      const state = getPaymentState(record.paymentStatus);

                      return (
                        <tr key={`${record.kind}-${record.id}`}>
                          <td className="px-5 py-5 align-top">
                            <p className="font-semibold">{record.clientName}</p>
                            <p className="mt-1 text-xs text-[#7A6252]">
                              {record.clientEmail || record.clientPhone || "Контакт не указан"}
                            </p>
                          </td>
                          <td className="px-5 py-5 align-top">
                            <p className="font-medium">
                              {record.kind === "photo"
                                ? "Фотосессия"
                                : "Аренда студии"}
                            </p>
                            <p className="mt-1 max-w-[170px] truncate text-xs text-[#9A8170]" title={record.paymentId || record.id}>
                              {record.paymentProvider === "stripe"
                                ? "Stripe"
                                : "Онлайн-оплата не начата"}
                            </p>
                          </td>
                          <td className="px-5 py-5 align-top text-sm">
                            <p>{formatBookingDate(record.bookingDate)}</p>
                            <p className="mt-1 text-xs text-[#7A6252]">
                              {record.bookingTime?.slice(0, 5) || "—"}
                            </p>
                          </td>
                          <td className="px-5 py-5 align-top">
                            <p className="font-semibold">
                              {formatMoney(record.paymentAmount, record.currency)}
                            </p>
                            {record.kind === "photo" &&
                              record.bookingAmount !== record.paymentAmount && (
                                <p className="mt-1 text-xs text-[#7A6252]">
                                  Полная цена: {formatMoney(record.bookingAmount, record.currency)}
                                </p>
                              )}
                          </td>
                          <td className="px-5 py-5 align-top">
                            <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${paymentClasses[state]}`}>
                              {paymentLabels[state]}
                            </span>
                          </td>
                          <td className="px-5 py-5 align-top text-sm text-[#7A6252]">
                            {state === "paid"
                              ? formatDateTime(record.paidAt)
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[28px] border border-[#E5D5C8] bg-white/75 p-6 shadow-[0_18px_60px_rgba(83,54,37,0.10)]">
      <p className="text-sm text-[#7A6252]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.05em]">{value}</p>
      <p className="mt-2 text-xs text-[#9A8170]">{detail}</p>
    </div>
  );
}
