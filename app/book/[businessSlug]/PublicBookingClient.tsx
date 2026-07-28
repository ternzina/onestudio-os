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
    confirmedTitle: "Бронирование подтверждено",
    pendingTitle: "Заявка отправлена",
    confirmedText: "Время закреплено за вами.",
    pendingText: "Студия проверит заявку и подтвердит бронирование.",
    reference: "Номер брони",
    when: "Когда",
    total: "Стоимость",
    newBooking: "Создать ещё одну бронь",
    back: "На главную",
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
    confirmedTitle: "Booking confirmed",
    pendingTitle: "Request sent",
    confirmedText: "The time is reserved for you.",
    pendingText: "The business will review and confirm your request.",
    reference: "Booking reference",
    when: "When",
    total: "Total",
    newBooking: "Create another booking",
    back: "Back to home",
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
  return copy[locale].genericError;
}

export default function PublicBookingClient({ initialContext }: PublicBookingClientProps) {
  const defaultLocale: PublicLocale = initialContext.business.default_locale.toLowerCase().startsWith("ru") ? "ru" : "en";
  const [locale, setLocale] = useState<PublicLocale>(defaultLocale);
  const [serviceId, setServiceId] = useState(initialContext.services[0]?.id ?? "");
  const service = useMemo(
    () => initialContext.services.find((item) => item.id === serviceId) ?? initialContext.services[0],
    [initialContext.services, serviceId],
  );
  const [duration, setDuration] = useState(service?.duration_min_minutes ?? 60);
  const [partySize, setPartySize] = useState(1);
  const [date, setDate] = useState(initialContext.date_bounds.minimum_date);
  const [slots, setSlots] = useState<AvailableSlotRecord[]>([]);
  const [slotsRequested, setSlotsRequested] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlotRecord | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmation, setConfirmation] = useState<PublicBookingConfirmation | null>(null);
  const t = copy[locale];

  useEffect(() => {
    const stored = window.localStorage.getItem("onestudio_public_booking_locale");
    if (stored === "ru" || stored === "en") setLocale(stored);
  }, []);

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
    setError("");
  }, [service]);

  async function loadSlots() {
    if (!service || !date) return;
    setLoadingSlots(true);
    setSlotsRequested(true);
    setError("");
    setSelectedSlot(null);

    const supabase = getSupabaseBrowserClient();
    const { data, error: slotError } = await supabase.rpc("get_service_available_slots", {
      p_business_id: initialContext.business.id,
      p_service_id: service.id,
      p_date: date,
      p_duration_minutes: duration,
      p_party_size: partySize,
    });

    setLoadingSlots(false);
    if (slotError) {
      setSlots([]);
      setError(t.loadingError);
      return;
    }

    setSlots((data ?? []) as AvailableSlotRecord[]);
  }

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
    const requestKey = crypto.randomUUID();
    const supabase = getSupabaseBrowserClient();
    const { data, error: bookingError } = await supabase.rpc("create_public_booking", {
      p_business_slug: initialContext.business.slug,
      p_service_id: service.id,
      p_starts_at: selectedSlot.starts_at,
      p_duration_minutes: duration,
      p_party_size: partySize,
      p_client_name: name.trim(),
      p_client_email: email.trim(),
      p_client_phone: phone.trim() || null,
      p_locale: locale,
      p_customer_notes: notes.trim(),
      p_request_key: requestKey,
    });

    setSubmitting(false);
    submitLock.current = false;

    if (bookingError) {
      setError(bookingErrorMessage(bookingError.message, locale));
      if (bookingError.message.includes("booking_slot")) await loadSlots();
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;
    if (!result) {
      setError(t.genericError);
      return;
    }

    setConfirmation(result as PublicBookingConfirmation);
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
    setError("");
  }

  if (confirmation) {
    const confirmed = confirmation.status === "confirmed";
    return (
      <main className="min-h-screen bg-[#f4f1ea] px-5 py-8 text-[#191b20] sm:px-8 sm:py-14">
        <section className="mx-auto max-w-3xl rounded-[38px] border border-black/8 bg-white p-7 shadow-[0_30px_100px_rgba(25,25,25,0.12)] sm:p-12">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9a742e]">{initialContext.business.name}</p>
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
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={resetBooking} className="rounded-full bg-[#17191f] px-6 py-3.5 text-sm font-semibold text-white">{t.newBooking}</button>
            <Link href="/" className="rounded-full border border-black/10 px-6 py-3.5 text-center text-sm font-semibold">{t.back}</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f1ea] px-4 py-5 text-[#191b20] sm:px-7 sm:py-8">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-[40px] border border-black/8 bg-white shadow-[0_35px_120px_rgba(25,25,25,0.12)]">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/8 px-6 py-5 sm:px-9">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9a742e]">OneStudio OS</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.045em]">{initialContext.business.name}</h1>
          </div>
          <div className="flex rounded-full bg-[#eeebe3] p-1 text-xs font-semibold">
            {(["ru", "en"] as const).map((value) => (
              <button key={value} type="button" onClick={() => setLocale(value)} className={`rounded-full px-4 py-2 ${locale === value ? "bg-[#17191f] text-white" : "text-[#6d6961]"}`}>{value.toUpperCase()}</button>
            ))}
          </div>
        </header>

        <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="bg-[#17191f] p-6 text-white sm:p-10 lg:min-h-[760px]">
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
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#77736b]">{t.date}
                      <input type="date" min={initialContext.date_bounds.minimum_date} max={initialContext.date_bounds.maximum_date} value={date} onChange={(event) => { setDate(event.target.value); setSlots([]); setSlotsRequested(false); setSelectedSlot(null); }} className="rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-base font-medium normal-case tracking-normal text-[#191b20] outline-none focus:border-[#9a742e]" />
                    </label>
                    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#77736b]">{t.duration}
                      <select value={duration} onChange={(event) => { setDuration(Number(event.target.value)); setSlots([]); setSlotsRequested(false); setSelectedSlot(null); }} className="rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-base font-medium normal-case tracking-normal text-[#191b20] outline-none focus:border-[#9a742e]">
                        {durationOptions(service).map((value) => <option key={value} value={value}>{value} {t.minutes}</option>)}
                      </select>
                    </label>
                    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#77736b]">{t.partySize}
                      <input type="number" min={1} max={service.capacity} value={partySize} onChange={(event) => { setPartySize(Math.max(1, Math.min(service.capacity, Number(event.target.value) || 1))); setSlots([]); setSlotsRequested(false); setSelectedSlot(null); }} className="rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-base font-medium normal-case tracking-normal text-[#191b20] outline-none focus:border-[#9a742e]" />
                    </label>
                    <div className="flex items-end">
                      <button type="button" onClick={loadSlots} disabled={loadingSlots} className="w-full rounded-2xl bg-[#17191f] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-55">{loadingSlots ? t.checking : t.checkSlots}</button>
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
                          return <button key={slot.starts_at} type="button" onClick={() => { setSelectedSlot(slot); setError(""); }} className={`rounded-full px-4 py-2.5 text-sm font-semibold ${active ? "bg-[#17191f] text-white" : "bg-white text-[#191b20] shadow-sm"}`}>{slot.local_start_time.slice(0, 5)}–{slot.local_end_time.slice(0, 5)}</button>;
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
