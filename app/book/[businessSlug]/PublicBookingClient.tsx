"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  AvailableSlotRecord,
  PublicBookingConfirmation,
  PublicBookingContext,
  PublicBookingService,
} from "@/lib/modules/contracts";

type PublicLocale = "ru" | "en";

type PublicBookingClientProps = {
  initialContext: PublicBookingContext;
  initialServiceSlug?: string;
  initialDate?: string;
  branding?: {
    brandName: string;
    accent: string;
    dark: string;
    surface: string;
    homeHref: string;
  } | null;
};

type PublicBookingConfirmationView = PublicBookingConfirmation & {
  payment_required?: boolean;
  payment_status?: string;
  due_minor?: number;
  email_queued?: boolean;
  manage_url?: string | null;
  calendar_url?: string | null;
};

const copy = {
  ru: {
    booking: "Онлайн-бронирование",
    chooseService: "Выберите услугу",
    service: "Услуга",
    duration: "Длительность",
    partySize: "Количество человек",
    date: "Дата",
    checkSlots: "Показать свободное время",
    checking: "Проверяем…",
    availableTime: "Свободное время",
    selectTime: "Выберите подходящее время",
    noSlots: "На эту дату свободного времени нет.",
    details: "Ваши данные",
    name: "Имя",
    email: "Email",
    phone: "Телефон",
    phoneOptional: "необязательно",
    notes: "Комментарий",
    notesPlaceholder: "Пожелания или важная информация",
    submit: "Забронировать",
    submitting: "Создаём бронь…",
    selectSlotFirst: "Сначала выберите свободное время.",
    requiredFields: "Заполните имя и корректный email.",
    conflict: "Это время уже заняли. Мы обновили список свободных слотов.",
    genericError: "Не удалось создать бронирование. Попробуйте ещё раз.",
    rateLimited: "Слишком много попыток. Подождите немного и попробуйте снова.",
    gatewayUnavailable: "Сервис бронирования временно недоступен. Попробуйте ещё раз позже.",
    confirmedTitle: "Бронирование подтверждено",
    pendingTitle: "Заявка отправлена",
    confirmedText: "Время закреплено за вами.",
    pendingText: "Студия проверит заявку и подтвердит бронирование.",
    reference: "Номер брони",
    when: "Когда",
    total: "Стоимость",
    newBooking: "Создать ещё одну бронь",
    back: "На главную",
    backToSite: "Вернуться на сайт",
    minutes: "мин",
    person: "чел.",
    free: "Бесплатно",
    quote: "Цена по запросу",
    perHour: "за час",
    perPerson: "за человека",
    from: "от",
    requiresConfirmation: "Требует подтверждения",
    instantConfirmation: "Подтверждается сразу",
    noServices: "Сейчас нет услуг, доступных для онлайн-бронирования.",
    loadingError: "Не удалось загрузить свободное время.",
    slotsPrompt: "Нажмите «Показать свободное время», чтобы загрузить варианты.",
    privacyNote: "Контактные данные используются только для этого бронирования.",
    paymentPending: "Оплата ожидается",
    paymentPendingText: "Бронь создана. Студия пришлёт ссылку или инструкции по оплате.",
    paymentPaid: "Оплачено",
    paymentNotRequired: "Оплата не требуется",
    emailQueued: "Письмо с подтверждением поставлено в очередь.",
    emailNotQueued: "Сохраните номер брони. Письмо пока не поставлено в очередь.",
    manageBooking: "Управлять бронью",
    addToCalendar: "Добавить в календарь",
  },
  en: {
    booking: "Online booking",
    chooseService: "Choose a service",
    service: "Service",
    duration: "Duration",
    partySize: "Guests",
    date: "Date",
    checkSlots: "Show available times",
    checking: "Checking…",
    availableTime: "Available time",
    selectTime: "Choose a suitable time",
    noSlots: "There are no available times on this date.",
    details: "Your details",
    name: "Name",
    email: "Email",
    phone: "Phone",
    phoneOptional: "optional",
    notes: "Notes",
    notesPlaceholder: "Requests or important information",
    submit: "Book now",
    submitting: "Creating booking…",
    selectSlotFirst: "Choose an available time first.",
    requiredFields: "Enter your name and a valid email.",
    conflict: "That time was just booked. We refreshed the available slots.",
    genericError: "The booking could not be created. Please try again.",
    rateLimited: "Too many attempts. Wait a little and try again.",
    gatewayUnavailable: "Booking is temporarily unavailable. Please try again later.",
    confirmedTitle: "Booking confirmed",
    pendingTitle: "Request sent",
    confirmedText: "The time is reserved for you.",
    pendingText: "The business will review and confirm your request.",
    reference: "Booking reference",
    when: "When",
    total: "Total",
    newBooking: "Create another booking",
    back: "Back to home",
    backToSite: "Back to website",
    minutes: "min",
    person: "guests",
    free: "Free",
    quote: "Price on request",
    perHour: "per hour",
    perPerson: "per person",
    from: "from",
    requiresConfirmation: "Requires confirmation",
    instantConfirmation: "Instant confirmation",
    noServices: "There are currently no services available for online booking.",
    loadingError: "Available times could not be loaded.",
    slotsPrompt: "Select “Show available times” to load the options.",
    privacyNote: "Contact details are used only for this booking.",
    paymentPending: "Payment pending",
    paymentPendingText: "The booking was created. The business will send a payment link or instructions.",
    paymentPaid: "Paid",
    paymentNotRequired: "No payment required",
    emailQueued: "The confirmation email has been queued.",
    emailNotQueued: "Save the booking reference. The email has not been queued yet.",
    manageBooking: "Manage booking",
    addToCalendar: "Add to calendar",
  },
} as const;

function durationOptions(service: PublicBookingService) {
  const minimum = service.duration_min_minutes;
  const maximum = service.duration_max_minutes ?? minimum;
  const step = service.duration_step_minutes ?? Math.max(1, maximum - minimum || minimum);
  const values: number[] = [];

  for (let value = minimum; value <= maximum; value += step) {
    values.push(value);
    if (values.length > 96) break;
  }

  return values.length > 0 ? values : [minimum];
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function formatMoney(service: PublicBookingService, duration: number, partySize: number, locale: PublicLocale) {
  if (service.pricing_model === "free") return copy[locale].free;
  if (service.pricing_model === "quote" || service.price_minor === null) return copy[locale].quote;

  let amount = service.price_minor;
  if (service.pricing_model === "per_hour") amount = Math.round(service.price_minor * duration / 60);
  if (service.pricing_model === "per_person") amount = service.price_minor * partySize;

  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US", {
    style: "currency",
    currency: service.currency,
  }).format(amount / 100);
}

function formatConfirmationDate(confirmation: PublicBookingConfirmation, locale: PublicLocale) {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: confirmation.timezone,
  }).format(new Date(confirmation.starts_at));
}

function bookingErrorMessage(message: string, locale: PublicLocale) {
  if (message.includes("booking_slot_unavailable") || message.includes("booking_slot_conflict")) {
    return copy[locale].conflict;
  }
  if (message.includes("invalid_public_booking_client_email") || message.includes("invalid_public_booking_client_name")) {
    return copy[locale].requiredFields;
  }
  if (message.includes("booking_rate_limited")) return copy[locale].rateLimited;
  if (message.includes("booking_gateway_unavailable")) return copy[locale].gatewayUnavailable;
  return copy[locale].genericError;
}

function dateRange(minimum: string, maximum: string) {
  const dates: string[] = [];
  const current = new Date(`${minimum}T12:00:00Z`);
  const end = new Date(`${maximum}T12:00:00Z`);

  while (current <= end && dates.length < 370) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
}

function calendarDateParts(value: string, locale: PublicLocale) {
  const date = new Date(`${value}T12:00:00Z`);
  const language = locale === "ru" ? "ru-RU" : "en-US";
  return {
    weekday: new Intl.DateTimeFormat(language, { weekday: "short", timeZone: "UTC" })
      .format(date)
      .replace(".", ""),
    day: new Intl.DateTimeFormat(language, { day: "2-digit", timeZone: "UTC" }).format(date),
    month: new Intl.DateTimeFormat(language, { month: "short", timeZone: "UTC" })
      .format(date)
      .replace(".", ""),
  };
}

export default function PublicBookingClient({
  initialContext,
  initialServiceSlug,
  initialDate,
  branding,
}: PublicBookingClientProps) {
  const defaultLocale: PublicLocale = initialContext.business.default_locale.toLowerCase().startsWith("ru") ? "ru" : "en";
  const [locale, setLocale] = useState<PublicLocale>(defaultLocale);
  const initialService =
    initialContext.services.find((item) => item.slug === initialServiceSlug) ??
    initialContext.services[0];
  const [serviceId, setServiceId] = useState(initialService?.id ?? "");
  const service = useMemo(
    () => initialContext.services.find((item) => item.id === serviceId) ?? initialContext.services[0],
    [initialContext.services, serviceId],
  );
  const [duration, setDuration] = useState(service?.duration_min_minutes ?? 60);
  const [partySize, setPartySize] = useState(1);
  const requestedDate =
    initialDate &&
    initialDate >= initialContext.date_bounds.minimum_date &&
    initialDate <= initialContext.date_bounds.maximum_date
      ? initialDate
      : initialContext.date_bounds.minimum_date;
  const [date, setDate] = useState(requestedDate);
  const [slots, setSlots] = useState<AvailableSlotRecord[]>([]);
  const [slotsRequested, setSlotsRequested] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlotRecord | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  const slotLoadLock = useRef(false);
  const requestKeyRef = useRef<string | null>(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmation, setConfirmation] = useState<PublicBookingConfirmationView | null>(null);
  const [calendarPage, setCalendarPage] = useState(0);
  const t = copy[locale];
  const allDates = useMemo(
    () =>
      dateRange(
        initialContext.date_bounds.minimum_date,
        initialContext.date_bounds.maximum_date,
      ),
    [
      initialContext.date_bounds.maximum_date,
      initialContext.date_bounds.minimum_date,
    ],
  );
  const visibleDates = allDates.slice(calendarPage * 14, calendarPage * 14 + 14);
  const hasPreviousDates = calendarPage > 0;
  const hasNextDates = (calendarPage + 1) * 14 < allDates.length;
  const selectDate = (value: string) => {
    setDate(value);
    setSlots([]);
    setSlotsRequested(false);
    setSelectedSlot(null);
    requestKeyRef.current = null;
  };

  useEffect(() => {
    const stored = window.localStorage.getItem("onestudio_public_booking_locale");
    if (stored === "ru" || stored === "en") setLocale(stored);
  }, []);

  useEffect(() => {
    const index = allDates.indexOf(requestedDate);
    if (index >= 0) setCalendarPage(Math.floor(index / 14));
  }, [allDates, requestedDate]);

  useEffect(() => {
    window.localStorage.setItem("onestudio_public_booking_locale", locale);
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (!service) return;
    setDuration(service.duration_min_minutes);
    setPartySize(1);
    setSlots([]);
    setSlotsRequested(false);
    setSelectedSlot(null);
    requestKeyRef.current = null;
    setError("");
  }, [service]);

  async function refreshGoogleCalendar(bookingId?: string) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8_000);
    try {
      await fetch("/api/integrations/google-calendar/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          businessSlug: initialContext.business.slug,
          bookingId,
        }),
        signal: controller.signal,
      });
    } catch {
      // Google Calendar is optional. Canonical OneStudio availability remains
      // usable even if the provider is disconnected or temporarily unavailable.
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function loadSlots(preserveSelection = false) {
    if (!service || !date || slotLoadLock.current) return;
    slotLoadLock.current = true;
    setLoadingSlots(true);
    setSlotsRequested(true);
    setError("");
    if (!preserveSelection) {
      setSelectedSlot(null);
      requestKeyRef.current = null;
    }

    await refreshGoogleCalendar();
    const supabase = getSupabaseBrowserClient();
    const { data, error: slotError } = await supabase.rpc("get_service_available_slots", {
      p_business_id: initialContext.business.id,
      p_service_id: service.id,
      p_date: date,
      p_duration_minutes: duration,
      p_party_size: partySize,
    });

    setLoadingSlots(false);
    slotLoadLock.current = false;
    if (slotError) {
      setSlots([]);
      setError(t.loadingError);
      return;
    }

    const nextSlots = (data ?? []) as AvailableSlotRecord[];
    setSlots(nextSlots);
    if (preserveSelection) {
      setSelectedSlot((current) =>
        current && nextSlots.some((slot) => slot.starts_at === current.starts_at)
          ? current
          : null,
      );
    }
  }

  useEffect(() => {
    if (!slotsRequested || confirmation) return;

    const refreshVisibleSlots = () => {
      if (document.visibilityState === "visible") {
        void loadSlots(true);
      }
    };

    window.addEventListener("focus", refreshVisibleSlots);
    document.addEventListener("visibilitychange", refreshVisibleSlots);
    return () => {
      window.removeEventListener("focus", refreshVisibleSlots);
      document.removeEventListener("visibilitychange", refreshVisibleSlots);
    };
  }, [confirmation, date, duration, partySize, serviceId, slotsRequested]);

  async function submitBooking() {
    if (!service || !selectedSlot) {
      setError(t.selectSlotFirst);
      return;
    }
    if (!name.trim() || !isValidEmail(email)) {
      setError(t.requiredFields);
      return;
    }
    if (submitLock.current) return;

    submitLock.current = true;
    setSubmitting(true);
    setError("");
    const requestKey = requestKeyRef.current ?? crypto.randomUUID();
    requestKeyRef.current = requestKey;

    let response: Response;
    let payload: { ok?: boolean; error?: string; confirmation?: PublicBookingConfirmationView };
    try {
      response = await fetch("/api/public/bookings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          businessSlug: initialContext.business.slug,
          serviceId: service.id,
          startsAt: selectedSlot.starts_at,
          durationMinutes: duration,
          partySize,
          clientName: name.trim(),
          clientEmail: email.trim(),
          clientPhone: phone.trim(),
          locale,
          customerNotes: notes.trim(),
          requestKey,
        }),
      });
      payload = (await response.json()) as typeof payload;
    } catch {
      setSubmitting(false);
      submitLock.current = false;
      setError(t.gatewayUnavailable);
      return;
    }

    setSubmitting(false);
    submitLock.current = false;

    if (!response.ok || !payload.confirmation) {
      const code = payload.error || "public_booking_failed";
      setError(bookingErrorMessage(code, locale));
      if (code.includes("booking_slot")) await loadSlots();
      return;
    }

    const confirmationResult = payload.confirmation;
    requestKeyRef.current = null;
    setConfirmation(confirmationResult);
    await refreshGoogleCalendar(confirmationResult.booking_id);
  }

  function resetBooking() {
    setConfirmation(null);
    setSlots([]);
    setSlotsRequested(false);
    setSelectedSlot(null);
    setName("");
    setEmail("");
    setPhone("");
    setNotes("");
    requestKeyRef.current = null;
    setError("");
  }

  if (confirmation) {
    const confirmed = confirmation.status === "confirmed";
    const paymentPending = Boolean(
      confirmation.payment_required &&
      (confirmation.due_minor ?? confirmation.total_minor) > 0 &&
      confirmation.payment_status !== "paid",
    );
    const paymentLabel = paymentPending
      ? t.paymentPending
      : confirmation.payment_required
        ? t.paymentPaid
        : t.paymentNotRequired;
    return (
      <main
        className="min-h-screen px-5 py-8 text-[#191b20] sm:px-8 sm:py-14"
        style={{ backgroundColor: branding?.surface ?? "#f4f1ea" }}
      >
        <section className="mx-auto max-w-3xl rounded-[38px] border border-black/8 bg-white p-7 shadow-[0_30px_100px_rgba(25,25,25,0.12)] sm:p-12">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: branding?.accent ?? "#9a742e" }}>{branding?.brandName || initialContext.business.name}</p>
            <div className="flex rounded-full bg-[#eeebe3] p-1 text-xs font-semibold">
              {(["ru", "en"] as const).map((value) => (
                <button key={value} type="button" onClick={() => setLocale(value)} className={`rounded-full px-4 py-2 ${locale === value ? "bg-[#17191f] text-white" : "text-[#6d6961]"}`}>{value.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#dff3e8] text-3xl text-[#237355]">✓</div>
          <h1 className="mt-7 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">{confirmed ? t.confirmedTitle : t.pendingTitle}</h1>
          <p className="mt-4 text-base leading-7 text-[#716d65]">{confirmed ? t.confirmedText : t.pendingText}</p>
          <div className="mt-9 grid gap-3 rounded-[28px] bg-[#f4f1ea] p-5 sm:grid-cols-2 sm:p-7">
            <div><p className="text-xs uppercase tracking-[0.18em] text-[#9a742e]">{t.reference}</p><p className="mt-2 text-xl font-semibold">{confirmation.reference}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-[#9a742e]">{t.when}</p><p className="mt-2 text-lg font-semibold">{formatConfirmationDate(confirmation, locale)}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-[#9a742e]">{t.service}</p><p className="mt-2 text-lg font-semibold">{service?.title}</p></div>
            <div><p className="text-xs uppercase tracking-[0.18em] text-[#9a742e]">{t.total}</p><p className="mt-2 text-lg font-semibold">{service ? formatMoney(service, duration, partySize, locale) : ""}</p></div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-black/8 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">
                {paymentLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#716d65]">
                {paymentPending ? t.paymentPendingText : paymentLabel}
              </p>
            </div>
            <div className="rounded-[24px] border border-black/8 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9a742e]">Email</p>
              <p className="mt-2 text-sm leading-6 text-[#716d65]">
                {confirmation.email_queued ? t.emailQueued : t.emailNotQueued}
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {confirmation.manage_url && (
              <a href={confirmation.manage_url} className="rounded-full bg-[#17191f] px-6 py-3.5 text-center text-sm font-semibold text-white">
                {t.manageBooking}
              </a>
            )}
            {confirmation.calendar_url && (
              <a href={confirmation.calendar_url} className="rounded-full bg-[#9a742e] px-6 py-3.5 text-center text-sm font-semibold text-white">
                {t.addToCalendar}
              </a>
            )}
            <button type="button" onClick={resetBooking} className="rounded-full border border-black/10 px-6 py-3.5 text-sm font-semibold">{t.newBooking}</button>
            <Link href={branding?.homeHref ?? "/"} className="rounded-full border border-black/10 px-6 py-3.5 text-center text-sm font-semibold">{t.back}</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen px-4 py-5 text-[#191b20] sm:px-7 sm:py-8"
      style={{
        backgroundColor: branding?.surface ?? "#f4f1ea",
        "--booking-accent": branding?.accent ?? "#9a742e",
        "--booking-dark": branding?.dark ?? "#17191f",
      } as React.CSSProperties}
    >
      <section className="mx-auto max-w-6xl overflow-hidden rounded-[40px] border border-black/8 bg-white shadow-[0_35px_120px_rgba(25,25,25,0.12)]">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/8 px-6 py-5 sm:px-9">
          <div className="flex items-center gap-4">
            <Link
              href={branding?.homeHref ?? "/"}
              className="inline-flex min-h-10 items-center rounded-full border border-black/10 bg-white px-4 text-xs font-semibold text-[#5f5b54] transition hover:border-[var(--booking-accent)]"
            >
              <span className="mr-2 text-base" aria-hidden="true">←</span>
              {t.backToSite}
            </Link>
            <div>
            <Link href={branding?.homeHref ?? "/"} className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--booking-accent)]">
              {branding?.brandName || "OneStudio OS"}
            </Link>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.045em]">{initialContext.business.name}</h1>
            </div>
          </div>
          <div className="flex rounded-full bg-[#eeebe3] p-1 text-xs font-semibold">
            {(["ru", "en"] as const).map((value) => (
              <button key={value} type="button" onClick={() => setLocale(value)} className={`rounded-full px-4 py-2 ${locale === value ? "bg-[#17191f] text-white" : "text-[#6d6961]"}`}>{value.toUpperCase()}</button>
            ))}
          </div>
        </header>

        <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="bg-[var(--booking-dark)] p-6 text-white sm:p-10 lg:min-h-[760px]">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#d8b36a]">{t.booking}</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">{t.chooseService}</h2>
            <div className="mt-8 grid gap-3">
              {initialContext.services.map((item) => {
                const active = service?.id === item.id;
                return (
                  <button key={item.id} type="button" onClick={() => setServiceId(item.id)} className={`rounded-[24px] border p-5 text-left transition ${active ? "border-[#d8b36a] bg-white text-[#17191f]" : "border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"}`}>
                    <span className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${active ? "text-[#9a742e]" : "text-[#d8b36a]"}`}>{item.category_name ?? t.service}</span>
                    <span className="mt-2 block text-xl font-semibold">{item.title}</span>
                    {item.description && <span className={`mt-2 block text-sm leading-6 ${active ? "text-[#716d65]" : "text-white/60"}`}>{item.description}</span>}
                    <span className="mt-4 flex flex-wrap gap-2 text-xs">
                      <span className={`rounded-full px-3 py-1.5 ${active ? "bg-[#eeebe3]" : "bg-white/10"}`}>{item.duration_min_minutes} {t.minutes}</span>
                      <span className={`rounded-full px-3 py-1.5 ${active ? "bg-[#eeebe3]" : "bg-white/10"}`}>{formatMoney(item, item.duration_min_minutes, 1, locale)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="p-6 sm:p-10">
            {!service ? (
              <div className="rounded-[28px] bg-[#f4f1ea] p-7 text-[#716d65]">{t.noServices}</div>
            ) : (
              <>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a742e]">01 · {t.availableTime}</p>
                  <div className="mt-5 rounded-[26px] border border-black/8 bg-[#f7f3ef] p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--booking-accent)]">
                          {t.date}
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {visibleDates.length
                            ? `${calendarDateParts(visibleDates[0], locale).month} — ${
                                calendarDateParts(visibleDates[visibleDates.length - 1], locale).month
                              }`
                            : ""}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setCalendarPage((value) => Math.max(0, value - 1))} disabled={!hasPreviousDates} className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white text-sm disabled:opacity-25" aria-label="Previous dates">←</button>
                        <button type="button" onClick={() => setCalendarPage((value) => value + 1)} disabled={!hasNextDates} className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white text-sm disabled:opacity-25" aria-label="Next dates">→</button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
                      {visibleDates.map((value) => {
                        const parts = calendarDateParts(value, locale);
                        const active = date === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => selectDate(value)}
                            aria-pressed={active}
                            className={`rounded-2xl border px-2 py-3 text-center transition ${
                              active
                                ? "border-[var(--booking-dark)] bg-[var(--booking-dark)] text-white shadow-lg"
                                : "border-black/8 bg-white hover:border-[var(--booking-accent)]"
                            }`}
                          >
                            <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] opacity-55">{parts.weekday}</span>
                            <span className="mt-1 block text-lg font-semibold">{parts.day}</span>
                            <span className="block text-[9px] uppercase opacity-45">{parts.month}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#77736b]">{t.date}
                      <input type="date" min={initialContext.date_bounds.minimum_date} max={initialContext.date_bounds.maximum_date} value={date} onChange={(event) => { selectDate(event.target.value); const index = allDates.indexOf(event.target.value); if (index >= 0) setCalendarPage(Math.floor(index / 14)); }} className="rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-base font-medium normal-case tracking-normal text-[#191b20] outline-none focus:border-[#9a742e]" />
                    </label>
                    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#77736b]">{t.duration}
                      <select value={duration} onChange={(event) => { setDuration(Number(event.target.value)); setSlots([]); setSlotsRequested(false); setSelectedSlot(null); requestKeyRef.current = null; }} className="rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-base font-medium normal-case tracking-normal text-[#191b20] outline-none focus:border-[#9a742e]">
                        {durationOptions(service).map((value) => <option key={value} value={value}>{value} {t.minutes}</option>)}
                      </select>
                    </label>
                    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#77736b]">{t.partySize}
                      <input type="number" min={1} max={service.capacity} value={partySize} onChange={(event) => { setPartySize(Math.max(1, Math.min(service.capacity, Number(event.target.value) || 1))); setSlots([]); setSlotsRequested(false); setSelectedSlot(null); requestKeyRef.current = null; }} className="rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-base font-medium normal-case tracking-normal text-[#191b20] outline-none focus:border-[#9a742e]" />
                    </label>
                    <div className="flex items-end">
                      <button type="button" onClick={() => void loadSlots()} disabled={loadingSlots} className="w-full rounded-2xl bg-[#17191f] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-55">{loadingSlots ? t.checking : t.checkSlots}</button>
                    </div>
                  </div>
                  <div className="mt-5 rounded-[24px] bg-[#f4f1ea] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{t.selectTime}</p>
                      <p className="text-sm font-semibold text-[#9a742e]">{formatMoney(service, duration, partySize, locale)}</p>
                    </div>
                    {slots.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {slots.map((slot) => {
                          const active = selectedSlot?.starts_at === slot.starts_at;
                          return <button key={slot.starts_at} type="button" onClick={() => { setSelectedSlot(slot); requestKeyRef.current = crypto.randomUUID(); setError(""); }} className={`rounded-full px-4 py-2.5 text-sm font-semibold ${active ? "bg-[#17191f] text-white" : "bg-white text-[#191b20] shadow-sm"}`}>{slot.local_start_time.slice(0, 5)}–{slot.local_end_time.slice(0, 5)}</button>;
                        })}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm leading-6 text-[#77736b]">{loadingSlots ? t.checking : slotsRequested ? t.noSlots : t.slotsPrompt}</p>
                    )}
                  </div>
                </div>

                <div className="mt-10 border-t border-black/8 pt-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9a742e]">02 · {t.details}</p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#77736b]">{t.name}
                      <input value={name} onChange={(event) => setName(event.target.value)} maxLength={160} className="rounded-2xl border border-black/10 px-4 py-3.5 text-base font-medium normal-case tracking-normal text-[#191b20] outline-none focus:border-[#9a742e]" />
                    </label>
                    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#77736b]">{t.email}
                      <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} className="rounded-2xl border border-black/10 px-4 py-3.5 text-base font-medium normal-case tracking-normal text-[#191b20] outline-none focus:border-[#9a742e]" />
                    </label>
                    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#77736b]">{t.phone} <span className="font-normal normal-case tracking-normal">({t.phoneOptional})</span>
                      <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={40} className="rounded-2xl border border-black/10 px-4 py-3.5 text-base font-medium normal-case tracking-normal text-[#191b20] outline-none focus:border-[#9a742e]" />
                    </label>
                    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#77736b] sm:row-span-2">{t.notes}
                      <textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={4000} placeholder={t.notesPlaceholder} className="min-h-32 rounded-2xl border border-black/10 px-4 py-3.5 text-base font-medium normal-case tracking-normal text-[#191b20] outline-none focus:border-[#9a742e]" />
                    </label>
                  </div>
                  {error && <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-[#858078]">{t.privacyNote}</p>
                    <button type="button" onClick={submitBooking} disabled={submitting || !selectedSlot} className="rounded-full bg-[#17191f] px-7 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{submitting ? t.submitting : t.submit}</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
