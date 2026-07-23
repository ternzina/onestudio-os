"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

type BookingLanguage = "uk" | "pl";
type RentalResourceId = "studio" | "makeup_room";

type RentalResource = {
  id: RentalResourceId;
  title: Record<BookingLanguage, string>;
  shortTitle: Record<BookingLanguage, string>;
  pricePerHour: number;
};

type RentalSelection = {
  enabled: boolean;
  durationHours: number;
  bookingTime: string;
};

type RentalSelections = Record<RentalResourceId, RentalSelection>;

type BookedRentalSlot = {
  booking_time: string | null;
  duration_hours: number | null;
  end_time: string | null;
  rental_resource: string | null;
  status: string | null;
};

type BookingSuccessItem = {
  rentalResource: RentalResourceId;
  rentalResourceTitle: string;
  bookingTime: string;
  endTime: string;
  durationHours: number;
  pricePerHour: number;
  totalPrice: number;
};

type BookingSuccessDetails = {
  bookingDate: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  orderId: string;
  items: BookingSuccessItem[];
  totalPrice: number;
};

const defaultRentalResources: RentalResource[] = [
  {
    id: "studio",
    title: {
      uk: "Зал / Studio",
      pl: "Sala / Studio",
    },
    shortTitle: {
      uk: "Зал",
      pl: "Sala",
    },
    pricePerHour: 200,
  },
  {
    id: "makeup_room",
    title: {
      uk: "Make-up room / кімната макіяжу",
      pl: "Make-up room / pokój do makijażu",
    },
    shortTitle: {
      uk: "Кімната макіяжу",
      pl: "Make-up room",
    },
    pricePerHour: 50,
  },
];

const defaultDurationOptions = [1, 2, 3, 4, 5];

const bookingTranslations = {
  uk: {
    brand: "SISTERS PHOTO STUDIO",
    label: "Оренда студії",
    title: "Забронювати студію",
    subtitle:
      "Оберіть зал, make-up room або обидва простори в одному замовленні. Реєстрація не потрібна, заявка одразу потрапить у студію.",
    backToRental: "Повернутися до оренди",
    step01: "Крок 01",
    step02: "Крок 02",
    step03: "Крок 03",
    contacts: "Ваші контакти",
    rentalDetails: "Що бронюємо",
    rentalResource: "Простір",
    selectedSpaces: "Обрані простори",
    enableResource: "Додати до замовлення",
    disableResource: "Прибрати",
    duration: "Тривалість",
    durationHint:
      "Можна обрати зал і make-up room разом. Кожен простір має свій час і свою тривалість, а внизу рахується загальна сума.",
    pricePerHour: "Ціна за годину",
    dateTitle: "Дата оренди",
    timeTitle: "Вільний час",
    clientName: "Імʼя",
    clientNamePlaceholder: "Ваше імʼя",
    clientPhone: "Телефон",
    clientPhonePlaceholder: "+48 ...",
    clientEmail: "Email",
    clientEmailPlaceholder: "name@email.com",
    chooseDate: "Оберіть дату",
    studioWorksDaily: "Студія працює щодня.",
    chooseDateHint:
      "Оберіть дату, починаючи з сьогоднішнього дня. Після цього нижче зʼявляться вільні години для кожного простору.",
    checkingSlots: "Перевіряємо зайняті години...",
    booked: "Зайнято",
    past: "Минуло",
    tooLate: "Пізно",
    notSelected: "Не обрано",
    selectDateFirst: "Спочатку оберіть дату, потім зʼявляться години.",
    selectFreeHour:
      "Оберіть стартову годину для кожного простору в замовленні. Наприклад: make-up room 09:00–10:00, зал 10:00–12:00.",
    todayFutureOnly: "Для сьогоднішньої дати доступні тільки майбутні години.",
    notes: "Коментар",
    notesPlaceholder:
      "Наприклад: фотозйомка для бренду, відео, beauty-контент, кількість людей...",
    finalCheck: "Перевірка",
    selectedTitle: "Ви обрали",
    date: "Дата",
    time: "Час",
    timeRange: "Діапазон часу",
    total: "Разом",
    orderTotal: "Загальна сума",
    payment: "Оплата",
    paymentPending: "Очікує повну оплату",
    paymentCancelled: "Оплату скасовано. Бронювання збережено — можна повторити оплату.",
    payNow: "Оплатити оренду",
    redirectingPayment: "Відкриваємо безпечну оплату Stripe…",
    noDate: "Дата не обрана",
    noTime: "Час не обрано",
    requestStatus: "Статус заявки",
    pending: "Очікує підтвердження",
    studioRental: "Оренда студії",
    order: "Замовлення",
    afterSubmit:
      "Після бронювання відкриється безпечна сторінка Stripe для повної оплати оренди.",
    submit: "Забронювати й оплатити",
    submitting: "Готуємо оплату...",
    successLabel: "Заявка відправлена",
    successTitle: "Студія заброньована попередньо",
    successDescription:
      "Ми отримали вашу заявку. Студія скоро звʼяжеться з вами для підтвердження часу. Лист-підтвердження надіслано на ваш email. Якщо його немає у «Вхідних», перевірте папку «Спам».",
    createAnother: "Створити ще одну бронь",
    backToSite: "Повернутися на сайт",
    copyDetails: "Скопіювати деталі заявки",
    copiedDetails: "Деталі заявки скопійовані",
    copyTextTitle: "Заявка на оренду студії",
    copyTextStatus: "Статус: очікує підтвердження",
    copyTextStudioContact: "Студія скоро звʼяжеться для підтвердження деталей.",
    errors: {
      fillContacts: "Заповніть імʼя, телефон та email",
      selectResource: "Оберіть хоча б один простір: зал, make-up room або обидва.",
      selectDate: "Оберіть дату оренди",
      pastDate: "Не можна забронювати минулу дату",
      selectTime: "Оберіть час для кожного обраного простору.",
      pastTime: "Не можна забронювати минулий час. Оберіть майбутній слот.",
      bookedTime:
        "Один з обраних часів уже зайнятий. Перевірте зал і make-up room та оберіть інший слот.",
      outsideWorkingHours:
        "Одна з обраних тривалостей виходить за межі робочого часу. Оберіть раніший старт.",
      copyFailed: "Не вдалося скопіювати деталі заявки",
      checkoutFailed: "Бронювання збережено, але сторінка оплати не відкрилася. Натисніть «Оплатити оренду» ще раз.",
    },
  },
  pl: {
    brand: "SISTERS PHOTO STUDIO",
    label: "Wynajem studia",
    title: "Zarezerwuj studio",
    subtitle:
      "Wybierz salę, make-up room albo obie przestrzenie w jednym zamówieniu. Rejestracja nie jest wymagana, zgłoszenie trafi od razu do studia.",
    backToRental: "Wróć do wynajmu",
    step01: "Krok 01",
    step02: "Krok 02",
    step03: "Krok 03",
    contacts: "Dane kontaktowe",
    rentalDetails: "Co rezerwujesz",
    rentalResource: "Przestrzeń",
    selectedSpaces: "Wybrane przestrzenie",
    enableResource: "Dodaj do zamówienia",
    disableResource: "Usuń",
    duration: "Czas trwania",
    durationHint:
      "Możesz wybrać salę i make-up room razem. Każda przestrzeń ma swoją godzinę i czas trwania, a na dole liczy się suma całego zamówienia.",
    pricePerHour: "Cena za godzinę",
    dateTitle: "Data wynajmu",
    timeTitle: "Dostępna godzina",
    clientName: "Imię",
    clientNamePlaceholder: "Twoje imię",
    clientPhone: "Telefon",
    clientPhonePlaceholder: "+48 ...",
    clientEmail: "Email",
    clientEmailPlaceholder: "name@email.com",
    chooseDate: "Wybierz datę",
    studioWorksDaily: "Studio pracuje codziennie.",
    chooseDateHint:
      "Wybierz datę od dzisiaj. Potem poniżej pojawią się dostępne godziny dla każdej przestrzeni.",
    checkingSlots: "Sprawdzamy zajęte godziny...",
    booked: "Zajęte",
    past: "Minęło",
    tooLate: "Za późno",
    notSelected: "Nie wybrano",
    selectDateFirst: "Najpierw wybierz datę, potem pojawią się godziny.",
    selectFreeHour:
      "Wybierz godzinę startu dla każdej przestrzeni w zamówieniu. Na przykład: make-up room 09:00–10:00, sala 10:00–12:00.",
    todayFutureOnly: "Dla dzisiejszej daty dostępne są tylko przyszłe godziny.",
    notes: "Komentarz",
    notesPlaceholder:
      "Na przykład: sesja dla marki, wideo, beauty-content, liczba osób...",
    finalCheck: "Sprawdzenie",
    selectedTitle: "Wybrano",
    date: "Data",
    time: "Godzina",
    timeRange: "Zakres czasu",
    total: "Razem",
    orderTotal: "Suma zamówienia",
    payment: "Płatność",
    paymentPending: "Oczekuje na pełną płatność",
    paymentCancelled: "Płatność anulowana. Rezerwacja jest zapisana — możesz ponowić płatność.",
    payNow: "Zapłać za wynajem",
    redirectingPayment: "Otwieramy bezpieczną płatność Stripe…",
    noDate: "Nie wybrano daty",
    noTime: "Nie wybrano godziny",
    requestStatus: "Status zgłoszenia",
    pending: "Oczekuje na potwierdzenie",
    studioRental: "Wynajem studia",
    order: "Zamówienie",
    afterSubmit:
      "Po utworzeniu rezerwacji otworzy się bezpieczna strona Stripe do pełnej płatności za wynajem.",
    submit: "Zarezerwuj i zapłać",
    submitting: "Przygotowujemy płatność...",
    successLabel: "Zgłoszenie wysłane",
    successTitle: "Studio wstępnie zarezerwowane",
    successDescription:
      "Otrzymaliśmy Twoje zgłoszenie. Studio wkrótce skontaktuje się z Tobą, aby potwierdzić godzinę. Wiadomość z potwierdzeniem została wysłana na Twój email. Jeśli nie ma jej w Odebranych, sprawdź folder Spam.",
    createAnother: "Utwórz kolejną rezerwację",
    backToSite: "Wróć na stronę",
    copyDetails: "Skopiuj szczegóły zgłoszenia",
    copiedDetails: "Szczegóły zgłoszenia skopiowane",
    copyTextTitle: "Zgłoszenie wynajmu studia",
    copyTextStatus: "Status: oczekuje na potwierdzenie",
    copyTextStudioContact:
      "Studio wkrótce skontaktuje się w celu potwierdzenia szczegółów.",
    errors: {
      fillContacts: "Wpisz imię, telefon i email",
      selectResource: "Wybierz przynajmniej jedną przestrzeń: salę, make-up room albo obie.",
      selectDate: "Wybierz datę wynajmu",
      pastDate: "Nie można zarezerwować minionej daty",
      selectTime: "Wybierz godzinę dla każdej wybranej przestrzeni.",
      pastTime:
        "Nie można zarezerwować minionej godziny. Wybierz przyszły termin.",
      bookedTime:
        "Jeden z wybranych terminów jest już zajęty. Sprawdź salę i make-up room oraz wybierz inny slot.",
      outsideWorkingHours:
        "Jeden z wybranych czasów trwania wychodzi poza godziny pracy. Wybierz wcześniejszy start.",
      copyFailed: "Nie udało się skopiować szczegółów zgłoszenia",
      checkoutFailed: "Rezerwacja została zapisana, ale strona płatności się nie otworzyła. Kliknij ponownie „Zapłać za wynajem”.",
    },
  },
} as const;

const createDefaultRentalSelections = (): RentalSelections => ({
  studio: {
    enabled: true,
    durationHours: 1,
    bookingTime: "",
  },
  makeup_room: {
    enabled: false,
    durationHours: 1,
    bookingTime: "",
  },
});

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeTime = (time: string | null | undefined) => (time || "").slice(0, 5);

const timeToMinutes = (time: string) => {
  const [hours, minutes] = normalizeTime(time).split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const getEndTime = (startTime: string, durationHours: number) =>
  minutesToTime(timeToMinutes(startTime) + durationHours * 60);

const getDurationLabel = (hours: number, lang: BookingLanguage) => {
  if (lang === "pl") {
    if (hours === 1) return "1 godzina";
    if (hours >= 2 && hours <= 4) return `${hours} godziny`;
    return `${hours} godzin`;
  }

  if (hours === 1) return "1 година";
  if (hours >= 2 && hours <= 4) return `${hours} години`;
  return `${hours} годин`;
};

const formatPrice = (price: number) => `${price} zł`;

const getSlotResource = (slot: BookedRentalSlot): RentalResourceId => {
  if (slot.rental_resource === "makeup_room") return "makeup_room";
  return "studio";
};

const getActiveBookedSlots = (slots: BookedRentalSlot[]) =>
  slots.filter((slot) => {
    const status = (slot.status || "").toLowerCase();
    return !["cancelled", "canceled", "deleted", "rejected"].includes(status);
  });

const getBookedSlotRange = (slot: BookedRentalSlot) => {
  const startTime = normalizeTime(slot.booking_time);
  const startMinutes = timeToMinutes(startTime);
  const durationHours = slot.duration_hours && slot.duration_hours > 0 ? slot.duration_hours : 1;
  const endMinutes = slot.end_time
    ? timeToMinutes(normalizeTime(slot.end_time))
    : startMinutes + durationHours * 60;

  return {
    startMinutes,
    endMinutes,
  };
};

const hasSlotConflict = ({
  startTime,
  durationHours,
  rentalResource,
  bookedSlots,
}: {
  startTime: string;
  durationHours: number;
  rentalResource: RentalResourceId;
  bookedSlots: BookedRentalSlot[];
}) => {
  const requestedStart = timeToMinutes(startTime);
  const requestedEnd = requestedStart + durationHours * 60;

  return getActiveBookedSlots(bookedSlots).some((slot) => {
    if (!slot.booking_time) return false;
    if (getSlotResource(slot) !== rentalResource) return false;

    const bookedRange = getBookedSlotRange(slot);

    return requestedStart < bookedRange.endMinutes && bookedRange.startMinutes < requestedEnd;
  });
};

const isOutsideWorkingHours = (startTime: string, durationHours: number, closingHour = 22) => {
  const endMinutes = timeToMinutes(startTime) + durationHours * 60;
  return endMinutes > closingHour * 60;
};

const createOrderId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `rental-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export default function StudioRentalBookingPage() {
  const todayDate = useMemo(() => getTodayDateString(), []);

  const [lang, setLang] = useState<BookingLanguage>("uk");
  const [bookingEnabled, setBookingEnabled] = useState(true);
  const [durationOptions, setDurationOptions] = useState(defaultDurationOptions);
  const [openHour, setOpenHour] = useState(9);
  const [closeHour, setCloseHour] = useState(22);
  const [studioPrice, setStudioPrice] = useState(200);
  const [makeupPrice, setMakeupPrice] = useState(50);

  const rentalResources = useMemo(
    () => defaultRentalResources.map((resource) => ({ ...resource, pricePerHour: resource.id === "studio" ? studioPrice : makeupPrice })),
    [studioPrice, makeupPrice],
  );
  const workingHours = useMemo(
    () => Array.from({ length: Math.max(closeHour - openHour, 0) }, (_, index) => `${String(openHour + index).padStart(2, "0")}:00`),
    [openHour, closeHour],
  );
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [rentalSelections, setRentalSelections] = useState<RentalSelections>(
    createDefaultRentalSelections,
  );
  const [bookingDate, setBookingDate] = useState("");
  const [notes, setNotes] = useState("");
  const [bookedSlots, setBookedSlots] = useState<BookedRentalSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [bookingSuccessDetails, setBookingSuccessDetails] =
    useState<BookingSuccessDetails | null>(null);
  const [copiedSuccessDetails, setCopiedSuccessDetails] = useState(false);
  const [cancelledPaymentReference, setCancelledPaymentReference] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const reference = searchParams.get("reference") || "";

    if (
      searchParams.get("payment") === "cancelled" &&
      /^[a-zA-Z0-9_-]{8,200}$/.test(reference)
    ) {
      setCancelledPaymentReference(reference);
    }
  }, []);

  useEffect(() => {
    const savedLang = window.localStorage.getItem("sisters-language");

    if (savedLang === "uk" || savedLang === "pl") {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    const loadPageSettings = async () => {
      const { data } = await supabase
        .from("booking_page_settings")
        .select("rental_booking_enabled,rental_open_hour,rental_close_hour,rental_duration_options,studio_price_per_hour,makeup_price_per_hour")
        .eq("id", "main")
        .maybeSingle();
      if (!data) return;
      setBookingEnabled(data.rental_booking_enabled !== false);
      setOpenHour(Number(data.rental_open_hour || 9));
      setCloseHour(Number(data.rental_close_hour || 22));
      setStudioPrice(Number(data.studio_price_per_hour || 200));
      setMakeupPrice(Number(data.makeup_price_per_hour || 50));
      if (Array.isArray(data.rental_duration_options) && data.rental_duration_options.length) {
        const nextOptions = data.rental_duration_options.map(Number).sort((a, b) => a - b);
        setDurationOptions(nextOptions);
        setRentalSelections((current) => ({
          studio: { ...current.studio, durationHours: nextOptions.includes(current.studio.durationHours) ? current.studio.durationHours : nextOptions[0] },
          makeup_room: { ...current.makeup_room, durationHours: nextOptions.includes(current.makeup_room.durationHours) ? current.makeup_room.durationHours : nextOptions[0] },
        }));
      }
    };
    loadPageSettings();
  }, []);

  const bt = bookingTranslations[lang];

  const selectedBookingItems = useMemo(
    () =>
      rentalResources
        .filter((resource) => rentalSelections[resource.id].enabled)
        .map((resource) => {
          const selection = rentalSelections[resource.id];
          const totalPrice = selection.durationHours * resource.pricePerHour;
          const endTime = selection.bookingTime
            ? getEndTime(selection.bookingTime, selection.durationHours)
            : "";

          return {
            resource,
            selection,
            resourceTitle: resource.title[lang],
            shortTitle: resource.shortTitle[lang],
            pricePerHour: resource.pricePerHour,
            totalPrice,
            endTime,
            timeRange: selection.bookingTime ? `${selection.bookingTime}–${endTime}` : bt.noTime,
          };
        }),
    [bt.noTime, lang, rentalSelections, rentalResources],
  );

  const orderTotalPrice = selectedBookingItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );

  const selectedSpacesLabel =
    selectedBookingItems.length > 0
      ? selectedBookingItems.map((item) => item.shortTitle).join(" + ")
      : bt.notSelected;

  const selectedTimeRangesLabel =
    selectedBookingItems.length > 0
      ? selectedBookingItems
          .map((item) => `${item.shortTitle}: ${item.timeRange}`)
          .join(" · ")
      : bt.noTime;

  const changeLang = (nextLang: BookingLanguage) => {
    setLang(nextLang);
    window.localStorage.setItem("sisters-language", nextLang);
  };

  const updateRentalSelection = (
    resourceId: RentalResourceId,
    partialSelection: Partial<RentalSelection>,
  ) => {
    setRentalSelections((currentSelections) => ({
      ...currentSelections,
      [resourceId]: {
        ...currentSelections[resourceId],
        ...partialSelection,
      },
    }));
  };

  const resetSelectedTimes = () => {
    setRentalSelections((currentSelections) => ({
      studio: {
        ...currentSelections.studio,
        bookingTime: "",
      },
      makeup_room: {
        ...currentSelections.makeup_room,
        bookingTime: "",
      },
    }));
  };

  const getIsPastTimeForToday = (time: string) => {
    if (bookingDate !== todayDate) return false;

    const now = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    const selectedSlotDate = new Date(now);

    selectedSlotDate.setHours(hours, minutes, 0, 0);

    return selectedSlotDate <= now;
  };

  useEffect(() => {
    const loadBookedSlots = async () => {
      if (!bookingDate) {
        setBookedSlots([]);
        return;
      }

      setIsLoadingSlots(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("studio_bookings")
        .select("booking_time,duration_hours,end_time,rental_resource,status")
        .eq("booking_date", bookingDate);

      if (error) {
        setErrorMessage(error.message);
        setBookedSlots([]);
        setIsLoadingSlots(false);
        return;
      }

      const nextBookedSlots = ((data || []) as BookedRentalSlot[]).map((slot) => ({
        ...slot,
        booking_time: normalizeTime(slot.booking_time),
        end_time: slot.end_time ? normalizeTime(slot.end_time) : null,
      }));

      setBookedSlots(nextBookedSlots);
      setIsLoadingSlots(false);
    };

    loadBookedSlots();
  }, [bookingDate]);

  useEffect(() => {
    setRentalSelections((currentSelections) => {
      let hasChanges = false;

      const nextSelections: RentalSelections = {
        studio: { ...currentSelections.studio },
        makeup_room: { ...currentSelections.makeup_room },
      };

      rentalResources.forEach((resource) => {
        const selection = currentSelections[resource.id];

        if (!selection.bookingTime) return;

        const shouldClearTime =
          !selection.enabled ||
          hasSlotConflict({
            startTime: selection.bookingTime,
            durationHours: selection.durationHours,
            rentalResource: resource.id,
            bookedSlots,
          }) ||
          isOutsideWorkingHours(selection.bookingTime, selection.durationHours, closeHour) ||
          getIsPastTimeForToday(selection.bookingTime);

        if (shouldClearTime) {
          nextSelections[resource.id].bookingTime = "";
          hasChanges = true;
        }
      });

      return hasChanges ? nextSelections : currentSelections;
    });
  }, [bookedSlots, bookingDate, rentalSelections, closeHour, rentalResources]);

  const validateSelectedItems = (items: typeof selectedBookingItems) => {
    if (items.length === 0) {
      return bt.errors.selectResource;
    }

    const hasMissingTime = items.some((item) => !item.selection.bookingTime);

    if (hasMissingTime) {
      return bt.errors.selectTime;
    }

    const hasPastTime = items.some((item) =>
      getIsPastTimeForToday(item.selection.bookingTime),
    );

    if (hasPastTime) {
      return bt.errors.pastTime;
    }

    const hasTooLateTime = items.some((item) =>
      isOutsideWorkingHours(item.selection.bookingTime, item.selection.durationHours, closeHour),
    );

    if (hasTooLateTime) {
      return bt.errors.outsideWorkingHours;
    }

    const hasConflict = items.some((item) =>
      hasSlotConflict({
        startTime: item.selection.bookingTime,
        durationHours: item.selection.durationHours,
        rentalResource: item.resource.id,
        bookedSlots,
      }),
    );

    if (hasConflict) {
      return bt.errors.bookedTime;
    }

    return "";
  };

  const startCheckout = async (orderId: string) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingKind: "rental",
          reference: orderId,
        }),
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Stripe Checkout failed");
      }

      window.location.assign(data.url);
    } catch (checkoutError) {
      console.error("Stripe Checkout failed", checkoutError);
      setErrorMessage(bt.errors.checkoutFailed);
      setIsSubmitting(false);
    }
  };

  const handleBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (!clientName.trim() || !clientPhone.trim() || !clientEmail.trim()) {
      setErrorMessage(bt.errors.fillContacts);
      return;
    }

    if (!bookingDate) {
      setErrorMessage(bt.errors.selectDate);
      return;
    }

    if (bookingDate < todayDate) {
      setErrorMessage(bt.errors.pastDate);
      resetSelectedTimes();
      return;
    }

    const firstValidationError = validateSelectedItems(selectedBookingItems);

    if (firstValidationError) {
      setErrorMessage(firstValidationError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setCopiedSuccessDetails(false);

    const { data: latestBookedSlots, error: latestBookedSlotsError } = await supabase
      .from("studio_bookings")
      .select("booking_time,duration_hours,end_time,rental_resource,status")
      .eq("booking_date", bookingDate);

    if (latestBookedSlotsError) {
      setErrorMessage(latestBookedSlotsError.message);
      setIsSubmitting(false);
      return;
    }

    const latestSlots = ((latestBookedSlots || []) as BookedRentalSlot[]).map((slot) => ({
      ...slot,
      booking_time: normalizeTime(slot.booking_time),
      end_time: slot.end_time ? normalizeTime(slot.end_time) : null,
    }));

    setBookedSlots(latestSlots);

    const hasLatestConflict = selectedBookingItems.some((item) =>
      hasSlotConflict({
        startTime: item.selection.bookingTime,
        durationHours: item.selection.durationHours,
        rentalResource: item.resource.id,
        bookedSlots: latestSlots,
      }),
    );

    if (hasLatestConflict) {
      setErrorMessage(bt.errors.bookedTime);
      setIsSubmitting(false);
      return;
    }

    const orderId = createOrderId();

    const bookingRows = selectedBookingItems.map((item) => {
      const calculatedEndTime = getEndTime(
        item.selection.bookingTime,
        item.selection.durationHours,
      );

      return {
        rental_order_id: orderId,
        client_name: clientName.trim(),
        client_phone: clientPhone.trim(),
        client_email: clientEmail.trim(),
        language: lang,
        booking_date: bookingDate,
        booking_time: item.selection.bookingTime,
        end_time: calculatedEndTime,
        duration_hours: item.selection.durationHours,
        rental_resource: item.resource.id,
        price_per_hour: item.pricePerHour,
        total_price: item.totalPrice,
        status: "pending",
        notes: notes.trim() || null,
        payment_status: "pending_payment",
        payment_provider: null,
        payment_id: null,
        currency: "PLN",
        paid_at: null,
      };
    });

    const { error } = await supabase.from("studio_bookings").insert(bookingRows);

    if (error) {
      if (error.code === "23505") {
        setErrorMessage(bt.errors.bookedTime);
      } else {
        setErrorMessage(error.message);
      }

      setIsSubmitting(false);
      return;
    }

    const successItems: BookingSuccessItem[] = selectedBookingItems.map((item) => ({
      rentalResource: item.resource.id,
      rentalResourceTitle: item.resourceTitle,
      bookingTime: item.selection.bookingTime,
      endTime: getEndTime(item.selection.bookingTime, item.selection.durationHours),
      durationHours: item.selection.durationHours,
      pricePerHour: item.pricePerHour,
      totalPrice: item.totalPrice,
    }));

    try {
      const emailResponse = await fetch("/api/booking-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingType: "rental",
          orderId,
        }),
      });

      if (!emailResponse.ok) {
        console.error("Studio booking email notification failed");
      }
    } catch (emailError) {
      console.error("Studio booking email notification failed", emailError);
    }

    setBookingSuccessDetails({
      bookingDate,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim(),
      orderId,
      items: successItems,
      totalPrice: orderTotalPrice,
    });

    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setRentalSelections(createDefaultRentalSelections());
    setBookingDate("");
    setNotes("");
    setBookedSlots([]);
    setCancelledPaymentReference("");
    await startCheckout(orderId);
  };

  const handleCopySuccessDetails = async () => {
    if (!bookingSuccessDetails) return;

    const itemRows = bookingSuccessDetails.items.flatMap((item) => [
      `${bt.rentalResource}: ${item.rentalResourceTitle}`,
      `${bt.duration}: ${getDurationLabel(item.durationHours, lang)}`,
      `${bt.pricePerHour}: ${formatPrice(item.pricePerHour)}`,
      `${bt.timeRange}: ${item.bookingTime}–${item.endTime}`,
      `${bt.total}: ${formatPrice(item.totalPrice)}`,
      "",
    ]);

    const text = [
      bt.brand,
      "",
      bt.copyTextTitle,
      bt.copyTextStatus,
      `${bt.date}: ${bookingSuccessDetails.bookingDate}`,
      "",
      ...itemRows,
      `${bt.orderTotal}: ${formatPrice(bookingSuccessDetails.totalPrice)}`,
      `${bt.payment}: ${bt.paymentPending}`,
      `${bt.clientName}: ${bookingSuccessDetails.clientName}`,
      `${bt.clientPhone}: ${bookingSuccessDetails.clientPhone}`,
      `${bt.clientEmail}: ${bookingSuccessDetails.clientEmail}`,
      "",
      bt.copyTextStudioContact,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopiedSuccessDetails(true);
    } catch {
      setErrorMessage(bt.errors.copyFailed);
    }
  };

  if (!bookingEnabled) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F1EA] px-5 text-[#2B1A12]">
        <div className="max-w-xl rounded-[36px] border border-[#E5D5C8] bg-white/80 p-8 text-center shadow-[0_24px_80px_rgba(83,54,37,0.12)]">
          <p className="text-xs uppercase tracking-[0.28em] text-[#A67C52]">Sisters Photo Studio</p>
          <h1 className="mt-4 text-3xl font-semibold">{lang === "pl" ? "Rezerwacja jest chwilowo niedostępna" : "Бронювання тимчасово недоступне"}</h1>
          <p className="mt-4 text-sm leading-6 text-[#7A6252]">{lang === "pl" ? "Skontaktuj się ze studiem, aby ustalić termin." : "Зв’яжіться зі студією, щоб узгодити дату."}</p>
          <Link href="/kontakt" className="mt-6 inline-flex rounded-full bg-[#2B1A12] px-6 py-3 text-sm font-semibold text-white">{lang === "pl" ? "Kontakt" : "Контакти"}</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#080604] px-5 py-8 text-[#2B1A12] sm:px-8 sm:py-10">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(242,167,184,0.18),transparent_32%),radial-gradient(circle_at_85%_16%,rgba(216,185,153,0.16),transparent_30%),linear-gradient(180deg,rgba(8,6,4,0.16),rgba(8,6,4,0.88))]" />

      <section className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/wynajem-studia"
            className="rounded-full border border-white/15 bg-white/8 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#fff7ef] backdrop-blur transition hover:bg-white/14"
          >
            ← {bt.backToRental}
          </Link>

          <div className="inline-flex rounded-full border border-white/15 bg-white/10 p-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#e8d2c0] shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur">
            {(["uk", "pl"] as BookingLanguage[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => changeLang(item)}
                className={`rounded-full px-4 py-2 transition ${
                  lang === item
                    ? "bg-[#fff7ef] text-[#2B1A12]"
                    : "hover:bg-white/10 hover:text-white"
                }`}
              >
                {item === "uk" ? "UA" : "PL"}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 overflow-hidden rounded-[40px] border border-white/12 bg-[#f6efe8] shadow-[0_30px_120px_rgba(0,0,0,0.36)]"
        >
          <div className="grid lg:grid-cols-[0.86fr_1.14fr]">
            <div
              className="relative min-h-[360px] bg-[#2f1d15] p-8 text-[#fff7ef] sm:p-10"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(8,6,4,0.32), rgba(8,6,4,0.88)), url('/images/site/rental/hero.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="relative z-10 flex h-full min-h-[300px] flex-col justify-between">
                <div>
                  <p className="mb-5 text-xs font-semibold uppercase tracking-[0.32em] text-[#f2a7b8]">
                    {bt.label}
                  </p>

                  <h1 className="max-w-xl font-serif text-[44px] font-normal leading-[0.98] tracking-[-0.05em] text-[#fff7ef] sm:text-[64px]">
                    {bt.title}
                  </h1>

                  <p className="mt-6 max-w-md text-sm leading-7 text-[#e8d2c0] sm:text-base">
                    {bt.subtitle}
                  </p>
                </div>

                <div className="mt-10 grid gap-3 text-sm text-[#e8d2c0]">
                  <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#f2a7b8]">
                      {bt.requestStatus}
                    </p>
                    <p className="mt-1 font-medium text-white">{bt.pending}</p>
                  </div>

                  <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#f2a7b8]">
                      {bt.selectedSpaces}
                    </p>
                    <p className="mt-1 font-medium text-white">
                      {selectedSpacesLabel} · {formatPrice(orderTotalPrice)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#f2a7b8]">
                      {bt.timeRange}
                    </p>
                    <p className="mt-1 font-medium text-white">
                      {bookingDate || bt.noDate} · {selectedTimeRangesLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-10">
              {cancelledPaymentReference && !bookingSuccessDetails && (
                <div className="mb-5 rounded-2xl border border-[#E6CFA8] bg-[#FFF4DD] px-5 py-4 text-center text-sm text-[#7A5528]">
                  <p>{bt.paymentCancelled}</p>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => startCheckout(cancelledPaymentReference)}
                    className="mt-3 rounded-full bg-[#2B1A12] px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#F7F1EA] disabled:opacity-60"
                  >
                    {isSubmitting ? bt.redirectingPayment : bt.payNow}
                  </button>
                </div>
              )}

              {bookingSuccessDetails ? (
                <div className="rounded-[32px] border border-green-200 bg-green-50/80 p-6 text-center sm:p-8">
                  <p className="mb-3 text-xs uppercase tracking-[0.24em] text-green-700">
                    {bt.successLabel}
                  </p>

                  <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#2B1A12]">
                    {bt.successTitle}
                  </h2>

                  <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#6E5748]">
                    {bt.successDescription}
                  </p>

                  {errorMessage && (
                    <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {errorMessage}
                    </div>
                  )}

                  <div className="mx-auto mt-6 grid max-w-2xl gap-3 rounded-[24px] border border-green-200 bg-white/70 p-5 text-left">
                    <div className="rounded-2xl border border-green-100 bg-white/70 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                        {bt.date}
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#2B1A12]">
                        {bookingSuccessDetails.bookingDate}
                      </p>
                    </div>

                    {bookingSuccessDetails.items.map((item) => (
                      <div
                        key={`${item.rentalResource}-${item.bookingTime}`}
                        className="rounded-2xl border border-green-100 bg-white/70 p-4"
                      >
                        <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                          {item.rentalResourceTitle}
                        </p>

                        <div className="mt-3 grid gap-2 text-sm text-[#2B1A12] sm:grid-cols-2">
                          <p>
                            {bt.timeRange}:{" "}
                            <span className="font-medium">
                              {item.bookingTime}–{item.endTime}
                            </span>
                          </p>
                          <p>
                            {bt.duration}:{" "}
                            <span className="font-medium">
                              {getDurationLabel(item.durationHours, lang)}
                            </span>
                          </p>
                          <p>
                            {bt.pricePerHour}:{" "}
                            <span className="font-medium">
                              {formatPrice(item.pricePerHour)}
                            </span>
                          </p>
                          <p>
                            {bt.total}:{" "}
                            <span className="font-medium">{formatPrice(item.totalPrice)}</span>
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="rounded-2xl border border-green-200 bg-green-100/60 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-green-800">
                        {bt.orderTotal}
                      </p>
                      <p className="mt-1 text-xl font-semibold text-[#2B1A12]">
                        {formatPrice(bookingSuccessDetails.totalPrice)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#E6CFA8] bg-[#FFF4DD] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                        {bt.payment}
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#7A5528]">
                        {bt.paymentPending}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-green-100 bg-white/70 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                        {bt.clientName}
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#2B1A12]">
                        {bookingSuccessDetails.clientName}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => startCheckout(bookingSuccessDetails.orderId)}
                      className="rounded-full bg-[#2B1A12] px-6 py-3 text-xs font-medium uppercase tracking-[0.16em] text-[#F7F1EA] transition hover:bg-[#4A2D1E] disabled:opacity-60"
                    >
                      {isSubmitting ? bt.redirectingPayment : bt.payNow}
                    </button>

                    <button
                      type="button"
                      onClick={handleCopySuccessDetails}
                      className="rounded-full border border-green-200 bg-white/80 px-6 py-3 text-xs font-medium uppercase tracking-[0.16em] text-green-800 transition hover:bg-green-100"
                    >
                      {bt.copyDetails}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBookingSuccessDetails(null);
                        setCopiedSuccessDetails(false);
                        setErrorMessage("");
                      }}
                      className="rounded-full border border-[#D8C4B3] bg-white/80 px-6 py-3 text-xs font-medium uppercase tracking-[0.16em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
                    >
                      {bt.createAnother}
                    </button>

                    <Link
                      href="/"
                      className="rounded-full bg-[#2B1A12] px-6 py-3 text-xs font-medium uppercase tracking-[0.16em] text-[#F7F1EA] transition hover:bg-[#4A2D1E]"
                    >
                      {bt.backToSite}
                    </Link>
                  </div>

                  {copiedSuccessDetails && (
                    <p className="mt-4 text-sm text-green-800">{bt.copiedDetails}</p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-8">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#A67C52]">
                      {bt.step01}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                      {bt.contacts}
                    </h2>

                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                      <div>
                        <label
                          htmlFor="clientName"
                          className="mb-2 block text-sm font-medium text-[#6E5748]"
                        >
                          {bt.clientName}
                        </label>
                        <input
                          id="clientName"
                          type="text"
                          value={clientName}
                          onChange={(event) => setClientName(event.target.value)}
                          placeholder={bt.clientNamePlaceholder}
                          required
                          className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="clientPhone"
                          className="mb-2 block text-sm font-medium text-[#6E5748]"
                        >
                          {bt.clientPhone}
                        </label>
                        <input
                          id="clientPhone"
                          type="tel"
                          value={clientPhone}
                          onChange={(event) => setClientPhone(event.target.value)}
                          placeholder={bt.clientPhonePlaceholder}
                          required
                          className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="clientEmail"
                          className="mb-2 block text-sm font-medium text-[#6E5748]"
                        >
                          {bt.clientEmail}
                        </label>
                        <input
                          id="clientEmail"
                          type="email"
                          value={clientEmail}
                          onChange={(event) => setClientEmail(event.target.value)}
                          placeholder={bt.clientEmailPlaceholder}
                          required
                          className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#A67C52]">
                      {bt.step02}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                      {bt.dateTitle}
                    </h2>

                    <div className="mt-5">
                      <label
                        htmlFor="bookingDate"
                        className="mb-2 block text-sm font-medium text-[#6E5748]"
                      >
                        {bt.chooseDate}
                      </label>

                      <input
                        id="bookingDate"
                        type="date"
                        min={todayDate}
                        value={bookingDate}
                        onChange={(event) => {
                          setBookingDate(event.target.value);
                          resetSelectedTimes();
                          setErrorMessage("");
                        }}
                        required
                        className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-[#2B1A12] outline-none transition focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20 sm:max-w-sm"
                      />

                      <div className="mt-3 rounded-2xl border border-[#E5D5C8] bg-[#FFFDFB]/80 px-4 py-3 text-sm leading-6 text-[#7A6252]">
                        <p className="font-medium text-[#2B1A12]">
                          {bt.studioWorksDaily}
                        </p>

                        <p className="mt-1">{bt.chooseDateHint}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#A67C52]">
                      {bt.step03}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                      {bt.rentalDetails}
                    </h2>

                    <div className="mt-4 rounded-2xl border border-[#E5D5C8] bg-[#FFFDFB]/80 px-4 py-3 text-sm leading-6 text-[#7A6252]">
                      <p className="font-medium text-[#2B1A12]">{bt.durationHint}</p>
                      {isLoadingSlots && <p className="mt-1">{bt.checkingSlots}</p>}
                    </div>

                    <div className="mt-5 grid gap-5">
                      {rentalResources.map((resource) => {
                        const selection = rentalSelections[resource.id];
                        const itemTotal = selection.durationHours * resource.pricePerHour;
                        const selectedEndTime = selection.bookingTime
                          ? getEndTime(selection.bookingTime, selection.durationHours)
                          : "";
                        const selectedRange = selection.bookingTime
                          ? `${selection.bookingTime}–${selectedEndTime}`
                          : bt.noTime;

                        return (
                          <div
                            key={resource.id}
                            className={`rounded-[30px] border p-5 transition ${
                              selection.enabled
                                ? "border-[#2B1A12] bg-white/85 shadow-[0_18px_42px_rgba(43,26,18,0.08)]"
                                : "border-[#D8C4B3] bg-white/45"
                            }`}
                          >
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                              <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-[#A67C52]">
                                  {bt.rentalResource}
                                </p>

                                <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#2B1A12]">
                                  {resource.title[lang]}
                                </h3>

                                <p className="mt-2 text-sm text-[#7A6252]">
                                  {formatPrice(resource.pricePerHour)} / h ·{" "}
                                  {selection.enabled ? selectedRange : bt.notSelected}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  updateRentalSelection(resource.id, {
                                    enabled: !selection.enabled,
                                    bookingTime: selection.enabled ? "" : selection.bookingTime,
                                  });
                                  setErrorMessage("");
                                }}
                                className={`rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                                  selection.enabled
                                    ? "bg-[#2B1A12] text-[#F7F1EA] hover:bg-[#4A2D1E]"
                                    : "border border-[#D8C4B3] bg-white/80 text-[#7A6252] hover:border-[#A67C52] hover:text-[#2B1A12]"
                                }`}
                              >
                                {selection.enabled ? bt.disableResource : bt.enableResource}
                              </button>
                            </div>

                            {selection.enabled && (
                              <div className="mt-5 space-y-5">
                                <div>
                                  <p className="mb-2 text-sm font-medium text-[#6E5748]">
                                    {bt.duration}
                                  </p>

                                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                                    {durationOptions.map((duration) => {
                                      const isSelected = selection.durationHours === duration;
                                      const optionTotalPrice = duration * resource.pricePerHour;

                                      return (
                                        <button
                                          key={duration}
                                          type="button"
                                          onClick={() => {
                                            updateRentalSelection(resource.id, {
                                              durationHours: duration,
                                            });
                                            setErrorMessage("");
                                          }}
                                          className={`rounded-2xl border px-3 py-3 text-center text-sm font-semibold transition ${
                                            isSelected
                                              ? "border-[#2B1A12] bg-[#2B1A12] text-[#F7F1EA]"
                                              : "border-[#D8C4B3] bg-white/80 text-[#2B1A12] hover:border-[#A67C52] hover:bg-[#FFFDFB]"
                                          }`}
                                        >
                                          <span>{duration}h</span>
                                          <span
                                            className={`mt-1 block text-[10px] uppercase tracking-[0.12em] ${
                                              isSelected ? "text-[#F2D6C6]" : "text-[#A67C52]"
                                            }`}
                                          >
                                            {formatPrice(optionTotalPrice)}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div>
                                  <p className="mb-2 text-sm font-medium text-[#6E5748]">
                                    {bt.timeTitle}
                                  </p>

                                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {workingHours.map((time) => {
                                      const isBooked = hasSlotConflict({
                                        startTime: time,
                                        durationHours: selection.durationHours,
                                        rentalResource: resource.id,
                                        bookedSlots,
                                      });
                                      const isPastTimeToday = getIsPastTimeForToday(time);
                                      const isTooLate = isOutsideWorkingHours(
                                        time,
                                        selection.durationHours,
                                        closeHour,
                                      );
                                      const isSelected = selection.bookingTime === time;
                                      const timeRange = `${time}–${getEndTime(
                                        time,
                                        selection.durationHours,
                                      )}`;

                                      return (
                                        <button
                                          key={`${resource.id}-${time}`}
                                          type="button"
                                          disabled={
                                            isBooked ||
                                            isPastTimeToday ||
                                            isTooLate ||
                                            isLoadingSlots ||
                                            !bookingDate
                                          }
                                          onClick={() => {
                                            updateRentalSelection(resource.id, {
                                              bookingTime: time,
                                            });
                                            setErrorMessage("");
                                          }}
                                          className={`rounded-2xl border px-3 py-4 text-sm font-medium transition ${
                                            isBooked || isPastTimeToday || isTooLate
                                              ? "cursor-not-allowed border-[#D8C4B3] bg-[#E8D8CC]/70 text-[#9C8778] opacity-70"
                                              : isSelected
                                                ? "border-[#2B1A12] bg-[#2B1A12] text-[#F7F1EA] shadow-[0_16px_34px_rgba(43,26,18,0.18)]"
                                                : "border-[#D8C4B3] bg-white/80 text-[#2B1A12] hover:border-[#A67C52] hover:bg-[#FFFDFB]"
                                          }`}
                                        >
                                          <span
                                            className={`block text-base tracking-[0.08em] ${
                                              isBooked || isPastTimeToday || isTooLate
                                                ? "line-through"
                                                : ""
                                            }`}
                                          >
                                            {time}
                                          </span>

                                          <span className="mt-1 block text-[11px] tracking-[0.06em] opacity-80">
                                            {timeRange}
                                          </span>

                                          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.16em]">
                                            {isBooked
                                              ? bt.booked
                                              : isPastTimeToday
                                                ? bt.past
                                                : isTooLate
                                                  ? bt.tooLate
                                                  : formatPrice(itemTotal)}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {!bookingDate && (
                                    <p className="mt-3 text-sm text-[#7A6252]">
                                      {bt.selectDateFirst}
                                    </p>
                                  )}

                                  {bookingDate && !selection.bookingTime && (
                                    <p className="mt-3 text-sm text-[#7A6252]">
                                      {bt.selectFreeHour}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {bookingDate === todayDate && (
                      <p className="mt-3 text-sm text-[#8A5A36]">{bt.todayFutureOnly}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="notes"
                      className="mb-2 block text-sm font-medium text-[#6E5748]"
                    >
                      {bt.notes}
                    </label>

                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder={bt.notesPlaceholder}
                      rows={4}
                      className="w-full resize-none rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                    />
                  </div>

                  <div className="rounded-[28px] border border-[#E5D5C8] bg-[#F7F1EA]/70 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#A67C52]">
                      {bt.finalCheck}
                    </p>

                    <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                      {bt.selectedTitle}
                    </h3>

                    <div className="mt-5 grid gap-3">
                      {selectedBookingItems.length === 0 ? (
                        <div className="rounded-2xl border border-[#E5D5C8] bg-white/70 p-4">
                          <p className="text-sm font-medium text-[#2B1A12]">
                            {bt.notSelected}
                          </p>
                        </div>
                      ) : (
                        selectedBookingItems.map((item) => (
                          <div
                            key={item.resource.id}
                            className="rounded-2xl border border-[#E5D5C8] bg-white/70 p-4"
                          >
                            <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                              {item.resourceTitle}
                            </p>

                            <div className="mt-3 grid gap-2 text-sm text-[#2B1A12] sm:grid-cols-4">
                              <p>
                                {bt.duration}:{" "}
                                <span className="font-medium">
                                  {getDurationLabel(item.selection.durationHours, lang)}
                                </span>
                              </p>
                              <p>
                                {bt.timeRange}:{" "}
                                <span className="font-medium">{item.timeRange}</span>
                              </p>
                              <p>
                                {bt.pricePerHour}:{" "}
                                <span className="font-medium">
                                  {formatPrice(item.pricePerHour)}
                                </span>
                              </p>
                              <p>
                                {bt.total}:{" "}
                                <span className="font-medium">
                                  {formatPrice(item.totalPrice)}
                                </span>
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-4 rounded-2xl border border-[#E5D5C8] bg-white/70 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                        {bt.orderTotal}
                      </p>
                      <p className="mt-2 text-xl font-semibold text-[#2B1A12]">
                        {formatPrice(orderTotalPrice)}
                      </p>
                      <p className="mt-1 text-sm text-[#7A6252]">
                        {bookingDate || bt.noDate} · {selectedSpacesLabel}
                      </p>
                      <p className="mt-2 text-sm font-medium text-[#7A5528]">
                        {bt.payment}: {bt.paymentPending}
                      </p>
                    </div>

                    <p className="mt-5 text-sm leading-6 text-[#7A6252]">
                      {bt.afterSubmit}
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-full bg-[#2B1A12] px-6 py-4 text-sm font-medium uppercase tracking-[0.18em] text-[#F7F1EA] shadow-[0_18px_40px_rgba(43,26,18,0.22)] transition hover:bg-[#4A2D1E] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? bt.submitting : bt.submit}
                  </button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
