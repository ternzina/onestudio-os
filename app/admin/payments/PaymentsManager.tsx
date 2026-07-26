"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import { supabase } from "@/lib/supabase";
import type { AdminMessage } from "@/lib/i18n/admin";
import type {
  BookingSource,
  BookingStatus,
  BusinessRole,
  PaymentMethod,
  PaymentStatus,
  PaymentTransactionKind,
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

type PaymentSummaryRow = {
  booking_id: string;
  reference: string;
  booking_status: BookingStatus;
  booking_source: BookingSource;
  starts_at: string;
  timezone: string;
  client_id: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  service_id: string;
  service_title: string;
  total_minor: number;
  paid_minor: number;
  refunded_minor: number;
  due_minor: number;
  currency: string;
  payment_required: boolean;
  payment_status: PaymentStatus;
  transaction_count: number;
  last_transaction_at: string | null;
};

type TransactionRow = {
  id: string;
  kind: PaymentTransactionKind;
  amount_minor: number;
  currency: string;
  provider: string;
  method: PaymentMethod;
  provider_reference: string | null;
  note: string;
  metadata: Record<string, unknown>;
  occurred_at: string;
  created_by: string | null;
  created_at: string;
};

type EntryDraft = {
  amount: string;
  method: PaymentMethod;
  provider: string;
  provider_reference: string;
  note: string;
};

const inputClass = "w-full rounded-2xl border border-black/10 bg-[#fffdfa] px-4 py-3 text-sm outline-none transition focus:border-[#9a742e] disabled:cursor-not-allowed disabled:opacity-55";
const buttonClass = "rounded-full bg-[#17191f] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-45";
const secondaryButtonClass = "rounded-full border border-black/10 px-4 py-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-45";

const statusMessages: Record<PaymentStatus, AdminMessage> = {
  not_required: "Not required",
  pending: "Unpaid",
  partially_paid: "Partially paid",
  paid: "Paid",
  refunded: "Refunded",
  failed: "Failed",
};

const bookingStatusMessages: Record<BookingStatus, AdminMessage> = {
  draft: "Draft",
  hold: "Hold",
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

const methodMessages: Record<PaymentMethod, AdminMessage> = {
  cash: "Cash",
  card: "Card",
  bank_transfer: "Bank transfer",
  online: "Online",
  gift_card: "Gift card",
  other: "Other",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#77736a]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function emptyEntryDraft(): EntryDraft {
  return {
    amount: "",
    method: "cash",
    provider: "manual",
    provider_reference: "",
    note: "",
  };
}

function parseAmountMinor(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed * 100);
}

function minorToInput(amountMinor: number) {
  return (amountMinor / 100).toFixed(2);
}

function formatMoney(amountMinor: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    style: "currency",
    currency,
  }).format(amountMinor / 100);
}

function formatDateTime(iso: string, timezone: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-GB", {
    timeZone: timezone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function paymentError(message: string, t: (message: AdminMessage) => string) {
  if (message.includes("payment_exceeds_balance_due")) return t("Payment exceeds the balance due.");
  if (message.includes("refund_exceeds_available_balance")) return t("Refund exceeds the received balance.");
  if (message.includes("payment_requirement_has_transactions")) return t("Payment requirement cannot be disabled after money was recorded.");
  if (message.includes("payment_not_required")) return t("This booking does not require payment.");
  if (message.includes("booking_cannot_accept_payment")) return t("This booking cannot accept a new payment.");
  if (message.includes("payment_idempotency_conflict")) return t("This payment request was already used with different details.");
  if (message.includes("payment_operation_forbidden")) return t("This role cannot manage payments.");
  return message;
}

export default function PaymentsManager() {
  const { locale: adminLocale, t } = useAdminI18n();
  const [requestedBookingId, setRequestedBookingId] = useState<string | null>(null);
  const [requestedClientId, setRequestedClientId] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceRow | null>(null);
  const [payments, setPayments] = useState<PaymentSummaryRow[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [includeCancelled, setIncludeCancelled] = useState(true);
  const [paymentDraft, setPaymentDraft] = useState<EntryDraft>(emptyEntryDraft());
  const [refundDraft, setRefundDraft] = useState<EntryDraft>({ ...emptyEntryDraft(), method: "card" });
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [liqpayLoading, setLiqpayLoading] = useState(false);
  const saveInFlightRef = useRef(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const selectedPayment = useMemo(
    () => payments.find((payment) => payment.booking_id === selectedBookingId) ?? null,
    [payments, selectedBookingId],
  );
  const canOperate = workspace ? workspace.role !== "viewer" : false;

  const visiblePayments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return payments.filter((payment) => {
      if (requestedClientId && payment.client_id !== requestedClientId) return false;
      if (statusFilter !== "all" && payment.payment_status !== statusFilter) return false;
      if (!query) return true;
      return [
        payment.reference,
        payment.client_name,
        payment.client_email ?? "",
        payment.client_phone ?? "",
        payment.service_title,
      ].some((value) => value.toLowerCase().includes(query));
    });
  }, [payments, requestedClientId, search, statusFilter]);

  const requestedClient = useMemo(
    () => payments.find((payment) => payment.client_id === requestedClientId) ?? null,
    [payments, requestedClientId],
  );

  const resetMessages = () => {
    setNotice("");
    setError("");
  };

  const loadTransactions = useCallback(async (bookingId: string) => {
    setDetailsLoading(true);
    const result = await supabase.rpc("get_admin_payment_transactions", {
      p_booking_id: bookingId,
    });
    if (result.error) {
      setError(result.error.message);
      setDetailsLoading(false);
      return;
    }
    setTransactions((result.data ?? []) as TransactionRow[]);
    setDetailsLoading(false);
  }, []);

  const loadPayments = useCallback(async (
    businessId: string,
    keepBookingId: string | null,
    cancelled: boolean,
  ) => {
    const result = await supabase.rpc("get_admin_payments", {
      p_business_id: businessId,
      p_include_cancelled: cancelled,
    });
    if (result.error) throw result.error;
    const rows = (result.data ?? []) as PaymentSummaryRow[];
    setPayments(rows);
    const preferred = rows.find((row) => row.booking_id === keepBookingId)?.booking_id
      ?? rows[0]?.booking_id
      ?? null;
    setSelectedBookingId(preferred);
    if (preferred) await loadTransactions(preferred);
    else setTransactions([]);
  }, [loadTransactions]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRequestedBookingId(params.get("booking"));
    setRequestedClientId(params.get("client"));
  }, []);

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
      try {
        await loadPayments(current.business_id, null, includeCancelled);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("Payments could not be loaded."));
      }
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [includeCancelled, loadPayments, t]);


  useEffect(() => {
    if (!requestedBookingId || payments.length === 0) return;
    const requested = payments.find((payment) => payment.booking_id === requestedBookingId);
    if (!requested) return;
    setSelectedBookingId(requested.booking_id);
    void loadTransactions(requested.booking_id);
    setRequestedBookingId(null);
  }, [loadTransactions, payments, requestedBookingId]);

  useEffect(() => {
    if (!requestedClientId || payments.length === 0 || requestedBookingId) return;
    const firstClientPayment = payments.find((payment) => payment.client_id === requestedClientId);
    if (!firstClientPayment) {
      setSelectedBookingId(null);
      setTransactions([]);
      return;
    }
    if (selectedBookingId && payments.some((payment) => payment.booking_id === selectedBookingId && payment.client_id === requestedClientId)) return;
    setSelectedBookingId(firstClientPayment.booking_id);
    void loadTransactions(firstClientPayment.booking_id);
  }, [loadTransactions, payments, requestedBookingId, requestedClientId, selectedBookingId]);

  const clearClientContext = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete("client");
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
    setRequestedClientId(null);
  };

  const selectPayment = async (payment: PaymentSummaryRow) => {
    resetMessages();
    setSelectedBookingId(payment.booking_id);
    setPaymentDraft({ ...emptyEntryDraft(), amount: minorToInput(payment.due_minor) });
    setRefundDraft({ ...emptyEntryDraft(), method: "card", amount: minorToInput(Math.max(0, payment.paid_minor - payment.refunded_minor)) });
    await loadTransactions(payment.booking_id);
  };

  const reloadSelected = async () => {
    if (!workspace) return;
    await loadPayments(workspace.business_id, selectedBookingId, includeCancelled);
  };

  const recordEntry = async (kind: PaymentTransactionKind, event: FormEvent) => {
    event.preventDefault();
    if (!selectedPayment || !canOperate || saveInFlightRef.current) return;
    resetMessages();
    const draft = kind === "payment" ? paymentDraft : refundDraft;
    const amountMinor = parseAmountMinor(draft.amount);
    if (!amountMinor) {
      setError(t("Enter a positive amount with no more than two decimal places."));
      return;
    }

    saveInFlightRef.current = true;
    setSaving(true);
    const rpcName = kind === "payment" ? "record_admin_payment" : "record_admin_refund";
    const result = await supabase.rpc(rpcName, {
      p_booking_id: selectedPayment.booking_id,
      p_amount_minor: amountMinor,
      p_method: draft.method,
      p_provider: draft.provider.trim() || "manual",
      p_provider_reference: draft.provider_reference.trim() || null,
      p_note: draft.note.trim(),
      p_occurred_at: new Date().toISOString(),
      p_idempotency_key: crypto.randomUUID(),
    });

    if (result.error) {
      setError(paymentError(result.error.message, t));
    } else {
      setNotice(kind === "payment" ? t("Payment recorded.") : t("Refund recorded."));
      if (kind === "payment") setPaymentDraft(emptyEntryDraft());
      else setRefundDraft({ ...emptyEntryDraft(), method: "card" });
      await reloadSelected();
    }
    setSaving(false);
    saveInFlightRef.current = false;
  };

  const startStripeCheckout = async () => {
    if (!selectedPayment || !canOperate || stripeLoading) return;
    resetMessages();
    setStripeLoading(true);
    try {
      const response = await fetch("/api/admin/payments/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bookingId: selectedPayment.booking_id }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || typeof payload.url !== "string") {
        throw new Error(payload.error || "stripe_checkout_failed");
      }
      window.location.assign(payload.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "stripe_checkout_failed");
      setStripeLoading(false);
    }
  };

  const startLiqPayCheckout = async () => {
    if (!selectedPayment || !canOperate || liqpayLoading) return;
    resetMessages();
    setLiqpayLoading(true);
    try {
      const response = await fetch("/api/admin/payments/liqpay/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ bookingId: selectedPayment.booking_id }),
      });
      const payload = await response.json().catch(() => ({}));
      if (
        !response.ok ||
        typeof payload.checkoutUrl !== "string" ||
        typeof payload.data !== "string" ||
        typeof payload.signature !== "string"
      ) {
        throw new Error(payload.error || "liqpay_checkout_failed");
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = payload.checkoutUrl;
      form.acceptCharset = "utf-8";
      for (const [name, value] of [["data", payload.data], ["signature", payload.signature]]) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "liqpay_checkout_failed");
      setLiqpayLoading(false);
    }
  };

  const toggleRequired = async () => {
    if (!selectedPayment || !canOperate || saving) return;
    resetMessages();
    setSaving(true);
    const result = await supabase.rpc("set_admin_booking_payment_required", {
      p_booking_id: selectedPayment.booking_id,
      p_required: !selectedPayment.payment_required,
    });
    if (result.error) setError(paymentError(result.error.message, t));
    else {
      setNotice(selectedPayment.payment_required ? t("Payment marked as not required.") : t("Payment requirement restored."));
      await reloadSelected();
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="mt-8 rounded-[30px] border border-black/8 bg-white p-8 text-sm text-[#77736a]">{t("Loading payments…")}</div>;
  }

  if (!workspace) {
    return <div className="mt-8 rounded-[30px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error || t("Payments could not be loaded.")}</div>;
  }

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
      <section className="rounded-[30px] border border-black/8 bg-[#eeebe3] p-5 shadow-[0_18px_55px_rgba(20,20,20,0.06)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{t("Payment ledger")}</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{t("Bookings and balances")}</h2>
          </div>
          <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold">{t("{count} bookings", { count: visiblePayments.length })}</span>
        </div>

        {requestedClientId && (
          <div className="mt-5 flex flex-col gap-3 rounded-[22px] border border-[#9a742e]/20 bg-[#fffdfa] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9a742e]">
                {adminLocale === "ru" ? "Платежи клиента" : "Client payments"}
              </p>
              <p className="mt-1 text-base font-semibold">
                {requestedClient?.client_name ?? (adminLocale === "ru" ? "Выбранный клиент" : "Selected client")}
              </p>
              <p className="mt-1 text-xs text-[#77736a]">
                {adminLocale === "ru"
                  ? `Показано бронирований: ${visiblePayments.length}`
                  : `Bookings shown: ${visiblePayments.length}`}
              </p>
            </div>
            <button type="button" onClick={clearClientContext} className={secondaryButtonClass}>
              {adminLocale === "ru" ? "Показать все платежи" : "Show all payments"}
            </button>
          </div>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input className={inputClass} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("Search booking, client or service")} />
          <select className={inputClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PaymentStatus | "all")}>
            <option value="all">{t("All payment statuses")}</option>
            {(Object.keys(statusMessages) as PaymentStatus[]).map((status) => <option key={status} value={status}>{t(statusMessages[status])}</option>)}
          </select>
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs text-[#6f6c65]">
          <input type="checkbox" checked={includeCancelled} onChange={(event) => setIncludeCancelled(event.target.checked)} />
          {t("Include cancelled bookings")}
        </label>

        <div className="mt-5 grid max-h-[820px] gap-3 overflow-y-auto pr-1">
          {visiblePayments.length === 0 && <div className="rounded-2xl bg-white/80 p-5 text-sm text-[#77736a]">{t("No payment records found.")}</div>}
          {visiblePayments.map((payment) => {
            const active = payment.booking_id === selectedBookingId;
            return (
              <button
                key={payment.booking_id}
                type="button"
                onClick={() => void selectPayment(payment)}
                className={`rounded-[22px] border p-4 text-left transition ${active ? "border-[#17191f] bg-[#17191f] text-white" : "border-black/7 bg-white hover:border-[#9a742e]/35"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${active ? "text-[#d8b36a]" : "text-[#9a742e]"}`}>{payment.reference}</p>
                    <p className="mt-2 text-lg font-semibold">{payment.client_name}</p>
                    <p className={`mt-1 text-sm ${active ? "text-white/62" : "text-[#77736a]"}`}>{payment.service_title}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${active ? "bg-white/10" : "bg-[#eeebe3]"}`}>{t(statusMessages[payment.payment_status])}</span>
                </div>
                <p className={`mt-4 text-xs ${active ? "text-white/62" : "text-[#77736a]"}`}>{formatDateTime(payment.starts_at, payment.timezone, adminLocale)}</p>
                <div className={`mt-3 grid grid-cols-3 gap-2 text-xs ${active ? "text-white/68" : "text-[#66645f]"}`}>
                  <span>{t("Total")}: {formatMoney(payment.total_minor, payment.currency, adminLocale)}</span>
                  <span>{t("Paid")}: {formatMoney(payment.paid_minor, payment.currency, adminLocale)}</span>
                  <span>{t("Due")}: {formatMoney(payment.due_minor, payment.currency, adminLocale)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[30px] border border-black/8 bg-white p-5 shadow-[0_18px_55px_rgba(20,20,20,0.06)] sm:p-7">
        {!selectedPayment ? (
          <div className="py-16 text-center text-sm text-[#77736a]">{t("Select a booking to manage its payments.")}</div>
        ) : (
          <>
            <div className="flex flex-col gap-4 border-b border-black/8 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">{t("Payment details")}</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em]">{selectedPayment.reference}</h2>
                <p className="mt-2 text-sm text-[#77736a]">{selectedPayment.client_name} · {selectedPayment.service_title}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={buttonClass}
                  onClick={() => void startStripeCheckout()}
                  disabled={!canOperate || stripeLoading || !selectedPayment.payment_required || selectedPayment.due_minor <= 0 || ["draft", "cancelled"].includes(selectedPayment.booking_status)}
                >
                  {stripeLoading
                    ? (adminLocale === "ru" ? "Открываем Stripe…" : "Opening Stripe…")
                    : (adminLocale === "ru" ? "Оплатить через Stripe" : "Pay with Stripe")}
                </button>
                <button
                  type="button"
                  className={buttonClass}
                  onClick={() => void startLiqPayCheckout()}
                  disabled={!canOperate || liqpayLoading || !selectedPayment.payment_required || selectedPayment.due_minor <= 0 || ["draft", "cancelled"].includes(selectedPayment.booking_status)}
                >
                  {liqpayLoading
                    ? (adminLocale === "ru" ? "Открываем LiqPay…" : "Opening LiqPay…")
                    : (adminLocale === "ru" ? "Оплатить через LiqPay" : "Pay with LiqPay")}
                </button>
                <Link className={secondaryButtonClass} href={`/admin/bookings?booking=${selectedPayment.booking_id}`}>{t("Open booking")}</Link>
                <Link className={secondaryButtonClass} href={`/admin/clients?client=${selectedPayment.client_id}`}>{t("Open client")}</Link>
              </div>
            </div>

            {(notice || error) && <div className={`mt-5 rounded-2xl px-4 py-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"}`}>{error || notice}</div>}
            {!canOperate && <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{t("This role has read-only payment access.")}</div>}

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [t("Total"), selectedPayment.total_minor],
                [t("Paid"), selectedPayment.paid_minor],
                [t("Refunded"), selectedPayment.refunded_minor],
                [t("Due"), selectedPayment.due_minor],
              ].map(([label, amount]) => (
                <div key={String(label)} className="rounded-[22px] border border-black/8 bg-[#fffdfa] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a742e]">{label}</p>
                  <p className="mt-2 text-xl font-semibold">{formatMoney(Number(amount), selectedPayment.currency, adminLocale)}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-black/8 bg-[#eeebe3] p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a742e]">{t("Payment requirement")}</p>
                <p className="mt-1 text-sm text-[#66645f]">{selectedPayment.payment_required ? t("Payment is required for this booking.") : t("Payment is not required for this booking.")}</p>
              </div>
              <button type="button" className={secondaryButtonClass} onClick={() => void toggleRequired()} disabled={!canOperate || saving || selectedPayment.total_minor === 0}>
                {selectedPayment.payment_required ? t("Mark not required") : t("Require payment")}
              </button>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <form className="rounded-[24px] border border-black/8 bg-[#fffdfa] p-5" onSubmit={(event) => void recordEntry("payment", event)}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a742e]">{t("Record payment")}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label={t("Amount")}><input className={inputClass} inputMode="decimal" value={paymentDraft.amount} onChange={(event) => setPaymentDraft((current) => ({ ...current, amount: event.target.value }))} placeholder={minorToInput(selectedPayment.due_minor)} disabled={!canOperate} /></Field>
                  <Field label={t("Method")}><select className={inputClass} value={paymentDraft.method} onChange={(event) => setPaymentDraft((current) => ({ ...current, method: event.target.value as PaymentMethod }))} disabled={!canOperate}>{(Object.keys(methodMessages) as PaymentMethod[]).map((method) => <option key={method} value={method}>{t(methodMessages[method])}</option>)}</select></Field>
                  <Field label={t("Provider")}><input className={inputClass} value={paymentDraft.provider} onChange={(event) => setPaymentDraft((current) => ({ ...current, provider: event.target.value }))} disabled={!canOperate} /></Field>
                  <Field label={t("Provider reference")}><input className={inputClass} value={paymentDraft.provider_reference} onChange={(event) => setPaymentDraft((current) => ({ ...current, provider_reference: event.target.value }))} disabled={!canOperate} /></Field>
                  <div className="sm:col-span-2"><Field label={t("Note")}><textarea className={`${inputClass} min-h-24`} value={paymentDraft.note} onChange={(event) => setPaymentDraft((current) => ({ ...current, note: event.target.value }))} disabled={!canOperate} /></Field></div>
                </div>
                <button className={`${buttonClass} mt-4`} type="submit" disabled={!canOperate || saving || selectedPayment.due_minor <= 0 || !selectedPayment.payment_required}>{saving ? t("Saving…") : t("Record payment")}</button>
              </form>

              <form className="rounded-[24px] border border-black/8 bg-[#fffdfa] p-5" onSubmit={(event) => void recordEntry("refund", event)}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a742e]">{t("Record refund")}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label={t("Amount")}><input className={inputClass} inputMode="decimal" value={refundDraft.amount} onChange={(event) => setRefundDraft((current) => ({ ...current, amount: event.target.value }))} placeholder={minorToInput(Math.max(0, selectedPayment.paid_minor - selectedPayment.refunded_minor))} disabled={!canOperate} /></Field>
                  <Field label={t("Method")}><select className={inputClass} value={refundDraft.method} onChange={(event) => setRefundDraft((current) => ({ ...current, method: event.target.value as PaymentMethod }))} disabled={!canOperate}>{(Object.keys(methodMessages) as PaymentMethod[]).map((method) => <option key={method} value={method}>{t(methodMessages[method])}</option>)}</select></Field>
                  <Field label={t("Provider")}><input className={inputClass} value={refundDraft.provider} onChange={(event) => setRefundDraft((current) => ({ ...current, provider: event.target.value }))} disabled={!canOperate} /></Field>
                  <Field label={t("Provider reference")}><input className={inputClass} value={refundDraft.provider_reference} onChange={(event) => setRefundDraft((current) => ({ ...current, provider_reference: event.target.value }))} disabled={!canOperate} /></Field>
                  <div className="sm:col-span-2"><Field label={t("Note")}><textarea className={`${inputClass} min-h-24`} value={refundDraft.note} onChange={(event) => setRefundDraft((current) => ({ ...current, note: event.target.value }))} disabled={!canOperate} /></Field></div>
                </div>
                <button className="mt-4 rounded-full border border-red-200 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-red-700 disabled:cursor-not-allowed disabled:opacity-45" type="submit" disabled={!canOperate || saving || selectedPayment.paid_minor <= selectedPayment.refunded_minor}>{saving ? t("Saving…") : t("Record refund")}</button>
              </form>
            </div>

            <div className="mt-6 rounded-[24px] border border-black/8 bg-[#eeebe3] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a742e]">{t("Transaction history")}</p>
                  <p className="mt-1 text-sm text-[#77736a]">{t("Ledger entries are permanent. Corrections are recorded as new refunds or payments.")}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold">{transactions.length}</span>
              </div>
              <div className="mt-4 grid gap-3">
                {detailsLoading && <div className="rounded-2xl bg-white p-4 text-sm text-[#77736a]">{t("Loading transactions…")}</div>}
                {!detailsLoading && transactions.length === 0 && <div className="rounded-2xl bg-white p-4 text-sm text-[#77736a]">{t("No transactions yet.")}</div>}
                {!detailsLoading && transactions.map((transaction) => (
                  <article key={transaction.id} className="rounded-[20px] bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-[0.15em] ${transaction.kind === "refund" ? "text-red-700" : "text-emerald-700"}`}>{transaction.kind === "payment" ? t("Payment") : t("Refund")}</p>
                        <p className="mt-2 text-xl font-semibold">{transaction.kind === "refund" ? "−" : "+"}{formatMoney(transaction.amount_minor, transaction.currency, adminLocale)}</p>
                      </div>
                      <div className="text-right text-xs text-[#77736a]">
                        <p>{formatDateTime(transaction.occurred_at, selectedPayment.timezone, adminLocale)}</p>
                        <p className="mt-1">{transaction.provider} · {t(methodMessages[transaction.method])}</p>
                      </div>
                    </div>
                    {(transaction.provider_reference || transaction.note) && <div className="mt-3 border-t border-black/8 pt-3 text-xs leading-5 text-[#66645f]">
                      {transaction.provider_reference && <p>{t("Reference")}: {transaction.provider_reference}</p>}
                      {transaction.note && <p>{transaction.note}</p>}
                    </div>}
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3 text-xs text-[#77736a]">
              <span>{t("Booking status")}: {t(bookingStatusMessages[selectedPayment.booking_status])}</span>
              <span>·</span>
              <span>{t("Payment status")}: {t(statusMessages[selectedPayment.payment_status])}</span>
              <span>·</span>
              <span>{t("Transactions")}: {selectedPayment.transaction_count}</span>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
