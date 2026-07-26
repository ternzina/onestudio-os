"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type BookingRow = {
  id: string;
  reference: string;
  service_title: string;
  status: string;
  starts_at: string;
  timezone: string;
  total_minor: number;
  currency: string;
  payment_status: string;
};

type Props = {
  businessId: string;
  clientId: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  bookedValueMinor: number;
  currency: string;
  bookings: BookingRow[];
  locale: "ru" | "en";
  timezone: string;
};

const copy = {
  ru: {
    eyebrow: "Smart Workspace",
    subtitle: "Главное по клиенту в одном месте",
    nextBooking: "Ближайшее бронирование",
    noUpcoming: "Будущих бронирований нет",
    unpaid: "Требуют оплаты",
    documents: "Документы",
    sent: "Отправлено",
    totalValue: "Общая сумма бронирований",
    contact: "Контакт",
    attention: "Требует внимания",
    allClear: "Сейчас ничего срочного",
    createBooking: "Создать бронирование",
    createDocument: "Создать документ",
    openPayments: "Открыть платежи",
    sendEmail: "Написать письмо",
    refresh: "Обновить",
    loading: "Обновление сводки…",
    unpaidBookings: "неоплаченных бронирований",
    unsentDocuments: "документов ещё не отправлено",
  },
  en: {
    eyebrow: "Smart Workspace",
    subtitle: "Everything important about this client in one place",
    nextBooking: "Next booking",
    noUpcoming: "No upcoming bookings",
    unpaid: "Needs payment",
    documents: "Documents",
    sent: "Sent",
    totalValue: "Total booking value",
    contact: "Contact",
    attention: "Needs attention",
    allClear: "Nothing urgent right now",
    createBooking: "Create booking",
    createDocument: "Create document",
    openPayments: "Open payments",
    sendEmail: "Write email",
    refresh: "Refresh",
    loading: "Refreshing summary…",
    unpaidBookings: "unpaid bookings",
    unsentDocuments: "documents not sent yet",
  },
} as const;

function formatDateTime(value: string, timezone: string, locale: "ru" | "en") {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

function formatMoney(amountMinor: number, currency: string, locale: "ru" | "en") {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    style: "currency",
    currency,
  }).format(amountMinor / 100);
}

export default function SmartClientWorkspace({
  businessId,
  clientId,
  clientName,
  clientEmail,
  clientPhone,
  bookedValueMinor,
  currency,
  bookings,
  locale,
  timezone,
}: Props) {
  const text = copy[locale];
  const [documentCount, setDocumentCount] = useState(0);
  const [sentDocumentCount, setSentDocumentCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const upcoming = useMemo(
    () => bookings
      .filter((booking) => !["cancelled", "completed", "no_show"].includes(booking.status) && new Date(booking.starts_at).getTime() >= Date.now())
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())[0] ?? null,
    [bookings],
  );

  const unpaidCount = useMemo(
    () => bookings.filter((booking) => !["paid", "refunded"].includes(booking.payment_status) && booking.status !== "cancelled").length,
    [bookings],
  );

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: queryError } = await supabase
      .from("generated_documents")
      .select("id,status,sent_at,delivery_error")
      .eq("business_id", businessId)
      .eq("client_id", clientId);

    if (queryError) {
      setError(queryError.message);
      setLoading(false);
      return;
    }

    const rows = data ?? [];
    setDocumentCount(rows.length);
    setSentDocumentCount(rows.filter((row) => Boolean(row.sent_at) || row.status === "sent").length);
    setLoading(false);
  }, [businessId, clientId]);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const attention: string[] = [];
  if (unpaidCount > 0) attention.push(`${unpaidCount} ${text.unpaidBookings}`);
  if (documentCount - sentDocumentCount > 0) attention.push(`${documentCount - sentDocumentCount} ${text.unsentDocuments}`);

  const mailHref = clientEmail
    ? `mailto:${clientEmail}?subject=${encodeURIComponent(`OneStudio OS · ${clientName}`)}`
    : undefined;

  return (
    <section className="mt-6 rounded-[28px] border border-black/8 bg-[#17191f] p-5 text-white sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d8b36a]">{text.eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{text.subtitle}</h3>
        </div>
        <button type="button" onClick={() => void loadDocuments()} className="w-fit rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/85">
          {loading ? text.loading : text.refresh}
        </button>
      </div>

      {error && <p className="mt-4 rounded-2xl bg-red-500/15 p-3 text-sm text-red-100">{error}</p>}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl bg-white/8 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">{text.nextBooking}</p>
          {upcoming ? (
            <>
              <p className="mt-3 font-semibold">{upcoming.service_title}</p>
              <p className="mt-1 text-sm text-white/65">{formatDateTime(upcoming.starts_at, upcoming.timezone || timezone, locale)}</p>
              <Link href={`/admin/bookings?booking=${upcoming.id}`} className="mt-3 inline-flex text-xs font-semibold text-[#d8b36a]">{upcoming.reference} →</Link>
            </>
          ) : <p className="mt-3 text-sm text-white/60">{text.noUpcoming}</p>}
        </article>

        <article className="rounded-2xl bg-white/8 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">{text.unpaid}</p>
          <p className="mt-3 text-3xl font-semibold">{unpaidCount}</p>
          <p className="mt-1 text-xs text-white/55">{bookings.length} bookings</p>
        </article>

        <article className="rounded-2xl bg-white/8 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">{text.documents}</p>
          <p className="mt-3 text-3xl font-semibold">{documentCount}</p>
          <p className="mt-1 text-xs text-white/55">{text.sent}: {sentDocumentCount}</p>
        </article>

        <article className="rounded-2xl bg-white/8 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">{text.totalValue}</p>
          <p className="mt-3 text-xl font-semibold">{formatMoney(bookedValueMinor, currency, locale)}</p>
          <p className="mt-1 truncate text-xs text-white/55">{clientEmail || clientPhone || text.contact}</p>
        </article>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className={`rounded-2xl p-4 text-sm ${attention.length ? "bg-amber-300/12 text-amber-100" : "bg-emerald-300/10 text-emerald-100"}`}>
          <strong>{text.attention}: </strong>{attention.length ? attention.join(" · ") : text.allClear}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/bookings?client=${clientId}`} className="rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-[#17191f]">{text.createBooking}</Link>
          <Link href={`/admin/documents?client=${clientId}`} className="rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold">{text.createDocument}</Link>
          <Link href={`/admin/payments?client=${clientId}`} className="rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold">{text.openPayments}</Link>
          {mailHref && <a href={mailHref} className="rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold">{text.sendEmail}</a>}
        </div>
      </div>
    </section>
  );
}
