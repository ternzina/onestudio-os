"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  PublicBookingManagementContext,
  PublicBookingManagementSlot,
} from "@/lib/booking/public-management";

type Locale = "ru" | "en";

type BookingManagementClientProps = {
  token: string;
};

const copy = {
  ru: {
    loading: "Загружаем бронирование…",
    loadError: "Ссылка недействительна или срок её действия истёк.",
    title: "Управление бронированием",
    reference: "Номер брони",
    service: "Услуга",
    when: "Дата и время",
    status: "Статус",
    confirmed: "Подтверждено",
    pending: "Ожидает подтверждения",
    hold: "Временная бронь",
    cancelled: "Отменено",
    completed: "Завершено",
    noShow: "Клиент не пришёл",
    addCalendar: "Добавить в календарь",
    backToSite: "Вернуться на сайт",
    reschedule: "Перенести бронь",
    chooseDate: "Новая дата",
    showTimes: "Показать свободное время",
    loadingTimes: "Проверяем…",
    availableTimes: "Свободное время",
    noTimes: "На эту дату свободного времени нет.",
    chooseTime: "Выберите новое время.",
    saveNewTime: "Подтвердить перенос",
    saving: "Сохраняем…",
    rescheduled: "Бронирование перенесено. Новое подтверждение отправлено на email.",
    remaining: "Осталось переносов",
    cancelTitle: "Отменить бронирование",
    cancelReason: "Причина, необязательно",
    cancelButton: "Отменить бронь",
    cancelling: "Отменяем…",
    cancelConfirm: "Отменить это бронирование? Освободившееся время снова станет доступно.",
    cancelledSuccess: "Бронирование отменено, время освобождено.",
    actionUnavailable: "Для этого бронирования действие больше недоступно.",
    conflict: "Это время уже заняли. Выберите другой вариант.",
    rateLimited: "Слишком много запросов. Подождите немного и повторите.",
    genericError: "Не удалось выполнить действие. Попробуйте ещё раз.",
    email: "Email клиента",
    party: "Количество человек",
    people: "чел.",
    cancellationReason: "Причина отмены",
  },
  en: {
    loading: "Loading booking…",
    loadError: "This link is invalid or has expired.",
    title: "Manage booking",
    reference: "Booking reference",
    service: "Service",
    when: "Date and time",
    status: "Status",
    confirmed: "Confirmed",
    pending: "Awaiting confirmation",
    hold: "Temporary hold",
    cancelled: "Cancelled",
    completed: "Completed",
    noShow: "No-show",
    addCalendar: "Add to calendar",
    backToSite: "Back to website",
    reschedule: "Reschedule booking",
    chooseDate: "New date",
    showTimes: "Show available times",
    loadingTimes: "Checking…",
    availableTimes: "Available times",
    noTimes: "There are no available times on this date.",
    chooseTime: "Choose a new time.",
    saveNewTime: "Confirm new time",
    saving: "Saving…",
    rescheduled: "The booking was rescheduled. A new confirmation was emailed.",
    remaining: "Reschedules remaining",
    cancelTitle: "Cancel booking",
    cancelReason: "Reason, optional",
    cancelButton: "Cancel booking",
    cancelling: "Cancelling…",
    cancelConfirm: "Cancel this booking? The time will become available again.",
    cancelledSuccess: "The booking was cancelled and the time was released.",
    actionUnavailable: "This action is no longer available for the booking.",
    conflict: "That time has just been booked. Choose another option.",
    rateLimited: "Too many requests. Wait a little and try again.",
    genericError: "The action could not be completed. Please try again.",
    email: "Client email",
    party: "Guests",
    people: "guests",
    cancellationReason: "Cancellation reason",
  },
} as const;

function localeFromContext(context: PublicBookingManagementContext | null): Locale {
  return context?.booking.locale?.toLowerCase().startsWith("en") ? "en" : "ru";
}

function formatDateTime(
  value: string,
  timezone: string,
  locale: Locale,
) {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

function statusLabel(status: string, locale: Locale) {
  const t = copy[locale];
  if (status === "confirmed") return t.confirmed;
  if (status === "pending") return t.pending;
  if (status === "hold") return t.hold;
  if (status === "cancelled") return t.cancelled;
  if (status === "completed") return t.completed;
  if (status === "no_show") return t.noShow;
  return status;
}

function actionError(code: string, locale: Locale) {
  const t = copy[locale];
  if (code.includes("slot")) return t.conflict;
  if (code.includes("rate_limited")) return t.rateLimited;
  if (
    code.includes("not_allowed") ||
    code.includes("limit") ||
    code.includes("link_not_found")
  ) {
    return t.actionUnavailable;
  }
  return t.genericError;
}

export default function BookingManagementClient({
  token,
}: BookingManagementClientProps) {
  const [context, setContext] =
    useState<PublicBookingManagementContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [fatalError, setFatalError] = useState("");
  const [actionErrorText, setActionErrorText] = useState("");
  const [success, setSuccess] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<PublicBookingManagementSlot[]>([]);
  const [selectedSlot, setSelectedSlot] =
    useState<PublicBookingManagementSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsRequested, setSlotsRequested] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reason, setReason] = useState("");
  const locale = localeFromContext(context);
  const t = copy[locale];

  const calendarHref = useMemo(
    () =>
      `/api/public/bookings/manage/calendar?token=${encodeURIComponent(token)}`,
    [token],
  );

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch(
          `/api/public/bookings/manage?token=${encodeURIComponent(token)}`,
          { cache: "no-store" },
        );
        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          context?: PublicBookingManagementContext;
        };

        if (!response.ok || !payload.context) {
          throw new Error(payload.error || "booking_management_link_not_found");
        }

        if (active) {
          setContext(payload.context);
          setDate(payload.context.booking.starts_at.slice(0, 10));
        }
      } catch {
        if (active) setFatalError(copy.ru.loadError);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [token]);

  async function refreshGoogleCalendar(next: PublicBookingManagementContext) {
    try {
      await fetch("/api/integrations/google-calendar/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          businessSlug: next.business.slug,
          bookingId: next.booking.id,
        }),
      });
    } catch {
      // Google Calendar remains optional.
    }
  }

  async function loadSlots() {
    if (!date || !context?.actions.can_reschedule) return;
    setLoadingSlots(true);
    setSlotsRequested(true);
    setSlots([]);
    setSelectedSlot(null);
    setActionErrorText("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/public/bookings/manage/slots?token=${encodeURIComponent(
          token,
        )}&date=${encodeURIComponent(date)}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        slots?: PublicBookingManagementSlot[];
      };

      if (!response.ok) {
        setActionErrorText(actionError(payload.error || "", locale));
        return;
      }

      setSlots(payload.slots ?? []);
    } catch {
      setActionErrorText(t.genericError);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function reschedule() {
    if (!selectedSlot || !context?.actions.can_reschedule) {
      setActionErrorText(t.chooseTime);
      return;
    }

    setSaving(true);
    setActionErrorText("");
    setSuccess("");

    try {
      const response = await fetch("/api/public/bookings/manage", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token,
          action: "reschedule",
          startsAt: selectedSlot.starts_at,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        context?: PublicBookingManagementContext;
      };

      if (!response.ok || !payload.context) {
        setActionErrorText(actionError(payload.error || "", locale));
        if ((payload.error || "").includes("slot")) await loadSlots();
        return;
      }

      setContext(payload.context);
      setDate(payload.context.booking.starts_at.slice(0, 10));
      setSlots([]);
      setSlotsRequested(false);
      setSelectedSlot(null);
      setSuccess(t.rescheduled);
      await refreshGoogleCalendar(payload.context);
    } catch {
      setActionErrorText(t.genericError);
    } finally {
      setSaving(false);
    }
  }

  async function cancelBooking() {
    if (!context?.actions.can_cancel) return;
    if (!window.confirm(t.cancelConfirm)) return;

    setSaving(true);
    setActionErrorText("");
    setSuccess("");

    try {
      const response = await fetch("/api/public/bookings/manage", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token,
          action: "cancel",
          reason,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        context?: PublicBookingManagementContext;
      };

      if (!response.ok || !payload.context) {
        setActionErrorText(actionError(payload.error || "", locale));
        return;
      }

      setContext(payload.context);
      setSlots([]);
      setSlotsRequested(false);
      setSelectedSlot(null);
      setSuccess(t.cancelledSuccess);
      await refreshGoogleCalendar(payload.context);
    } catch {
      setActionErrorText(t.genericError);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f1ea] px-5 py-12 text-[#191b20]">
        <div className="mx-auto max-w-3xl rounded-[34px] bg-white p-8 shadow-xl">
          {t.loading}
        </div>
      </main>
    );
  }

  if (fatalError || !context) {
    return (
      <main className="min-h-screen bg-[#f4f1ea] px-5 py-12 text-[#191b20]">
        <div className="mx-auto max-w-3xl rounded-[34px] bg-white p-8 shadow-xl">
          <h1 className="text-3xl font-semibold">{copy.ru.title}</h1>
          <p className="mt-4 text-[#716d65]">{fatalError || copy.ru.loadError}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f1ea] px-4 py-6 text-[#191b20] sm:px-8 sm:py-12">
      <section className="mx-auto max-w-4xl overflow-hidden rounded-[38px] border border-black/8 bg-white shadow-[0_30px_100px_rgba(25,25,25,0.12)]">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/8 px-6 py-5 sm:px-9">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9a742e]">
              {context.business.name}
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.045em]">
              {t.title}
            </h1>
          </div>
          <Link
            href={`/site/${context.business.slug}`}
            className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold"
          >
            {t.backToSite}
          </Link>
        </header>

        <div className="p-6 sm:p-9">
          <div className="grid gap-3 rounded-[28px] bg-[#f4f1ea] p-5 sm:grid-cols-2 sm:p-7">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#9a742e]">
                {t.reference}
              </p>
              <p className="mt-2 text-xl font-semibold">
                {context.booking.reference}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#9a742e]">
                {t.status}
              </p>
              <p className="mt-2 text-xl font-semibold">
                {statusLabel(context.booking.status, locale)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#9a742e]">
                {t.service}
              </p>
              <p className="mt-2 text-lg font-semibold">
                {context.service.title}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#9a742e]">
                {t.when}
              </p>
              <p className="mt-2 text-lg font-semibold">
                {formatDateTime(
                  context.booking.starts_at,
                  context.business.timezone,
                  locale,
                )}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#9a742e]">
                {t.email}
              </p>
              <p className="mt-2 text-sm font-semibold">
                {context.client.email}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#9a742e]">
                {t.party}
              </p>
              <p className="mt-2 text-sm font-semibold">
                {context.booking.party_size} {t.people}
              </p>
            </div>
          </div>

          <a
            href={calendarHref}
            className="mt-4 inline-flex rounded-full bg-[#17191f] px-6 py-3.5 text-sm font-semibold text-white"
          >
            {t.addCalendar}
          </a>

          {success && (
            <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {success}
            </p>
          )}
          {actionErrorText && (
            <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {actionErrorText}
            </p>
          )}

          {context.actions.can_reschedule && (
            <section className="mt-8 border-t border-black/8 pt-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold">{t.reschedule}</h2>
                  <p className="mt-1 text-sm text-[#716d65]">
                    {t.remaining}: {context.actions.reschedules_remaining}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#77736b]">
                  {t.chooseDate}
                  <input
                    type="date"
                    min={context.date_bounds.minimum_date}
                    max={context.date_bounds.maximum_date}
                    value={date}
                    onChange={(event) => {
                      setDate(event.target.value);
                      setSlots([]);
                      setSlotsRequested(false);
                      setSelectedSlot(null);
                    }}
                    className="rounded-2xl border border-black/10 px-4 py-3.5 text-base font-medium normal-case tracking-normal outline-none focus:border-[#9a742e]"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void loadSlots()}
                  disabled={loadingSlots}
                  className="self-end rounded-2xl bg-[#17191f] px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {loadingSlots ? t.loadingTimes : t.showTimes}
                </button>
              </div>

              {slots.length > 0 ? (
                <div className="mt-5 rounded-[24px] bg-[#f4f1ea] p-5">
                  <p className="text-sm font-semibold">{t.availableTimes}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {slots.map((slot) => {
                      const active =
                        selectedSlot?.starts_at === slot.starts_at;
                      return (
                        <button
                          key={slot.starts_at}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-full px-4 py-2.5 text-sm font-semibold ${
                            active
                              ? "bg-[#17191f] text-white"
                              : "bg-white text-[#191b20]"
                          }`}
                        >
                          {slot.local_start_time.slice(0, 5)}–
                          {slot.local_end_time.slice(0, 5)}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => void reschedule()}
                    disabled={!selectedSlot || saving}
                    className="mt-5 rounded-full bg-[#9a742e] px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    {saving ? t.saving : t.saveNewTime}
                  </button>
                </div>
              ) : (
                !loadingSlots &&
                slotsRequested && (
                  <p className="mt-4 text-sm text-[#716d65]">
                    {t.noTimes}
                  </p>
                )
              )}
            </section>
          )}

          {context.actions.can_cancel && (
            <section className="mt-8 border-t border-black/8 pt-8">
              <h2 className="text-2xl font-semibold">{t.cancelTitle}</h2>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={1000}
                placeholder={t.cancelReason}
                className="mt-4 min-h-24 w-full rounded-2xl border border-black/10 px-4 py-3.5 outline-none focus:border-red-400"
              />
              <button
                type="button"
                onClick={() => void cancelBooking()}
                disabled={saving}
                className="mt-4 rounded-full border border-red-200 bg-red-50 px-6 py-3.5 text-sm font-semibold text-red-700 disabled:opacity-50"
              >
                {saving ? t.cancelling : t.cancelButton}
              </button>
            </section>
          )}

          {context.booking.status === "cancelled" &&
            context.booking.cancellation_reason && (
              <div className="mt-8 rounded-[24px] bg-[#f4f1ea] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a742e]">
                  {t.cancellationReason}
                </p>
                <p className="mt-2 text-sm text-[#716d65]">
                  {context.booking.cancellation_reason}
                </p>
              </div>
            )}
        </div>
      </section>
    </main>
  );
}
