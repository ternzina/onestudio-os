"use client";

import { useAdminI18n } from "@/components/i18n/AdminI18nProvider";
import type { AdminMessage } from "@/lib/i18n/admin";

export type UnifiedTimelineRow = {
  event_key: string;
  source: "client" | "booking" | "payment" | "document" | "notification" | string;
  event_type: string;
  title: string;
  detail: string;
  occurred_at: string;
  related_id: string | null;
  status: string | null;
  amount_minor: number | null;
  currency: string | null;
  metadata: Record<string, unknown>;
};

const titleMessages: Record<string, AdminMessage> = {
  "Booking created": "Booking created",
  "Booking updated": "Booking updated",
  "Booking status changed": "Booking status changed",
  "Booking cancelled": "Booking cancelled",
  "Client created": "Client created",
  "Client updated": "Client updated",
  "Client archived": "Client archived",
  "Client restored": "Client restored",
  "Clients merged": "Clients merged",
  "Payment received": "Payment received",
  "Refund issued": "Refund issued",
  "Document generated": "Document generated",
  "Document sent": "Document sent",
  "Document delivery failed": "Document delivery failed",
  "Document voided": "Document voided",
  "Document updated": "Document updated",
  "Notification sent": "Notification sent",
  "Notification failed": "Notification failed",
  "Notification scheduled": "Notification scheduled",
  "Notification cancelled": "Notification cancelled.",
  "Notification queued": "Notification queued",
};

const sourceMessages: Record<string, AdminMessage> = {
  client: "Client",
  booking: "Booking",
  payment: "Payment",
  document: "Document",
  notification: "Notification",
};

function formatDateTime(value: string, timezone: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

function formatMoney(amountMinor: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US", {
    style: "currency",
    currency,
  }).format(amountMinor / 100);
}

export default function UnifiedTimeline({
  rows,
  loading,
  timezone,
}: {
  rows: UnifiedTimelineRow[];
  loading: boolean;
  timezone: string;
}) {
  const { locale, t } = useAdminI18n();

  if (loading) {
    return <p className="text-sm text-[#77736a]">{t("Loading…")}</p>;
  }

  if (rows.length === 0) {
    return <p className="text-sm text-[#77736a]">{t("No activity yet.")}</p>;
  }

  return (
    <div className="grid max-h-[520px] gap-3 overflow-y-auto pr-1">
      {rows.map((row) => {
        const titleMessage = titleMessages[row.title];
        const sourceMessage = sourceMessages[row.source];
        return (
          <article key={row.event_key} className="rounded-2xl border border-black/8 bg-white/85 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{titleMessage ? t(titleMessage) : row.title}</p>
                {row.detail && <p className="mt-1 text-xs leading-5 text-[#77736a]">{row.detail}</p>}
              </div>
              <span className="rounded-full bg-[#eeebe3] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5f594f]">
                {sourceMessage ? t(sourceMessage) : row.source}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#77736a]">
              <span>{formatDateTime(row.occurred_at, timezone, locale)}</span>
              <span className="flex items-center gap-2">
                {row.status && <span className="rounded-full border border-black/8 px-2.5 py-1">{row.status}</span>}
                {row.amount_minor !== null && row.currency && (
                  <strong className="text-[#17191f]">{formatMoney(row.amount_minor, row.currency, locale)}</strong>
                )}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
