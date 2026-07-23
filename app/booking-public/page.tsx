"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

type Package = {
  id: string;
  title: string;
  description: string | null;
  description_uk: string | null;
  description_pl: string | null;
  price: number;
  duration_minutes: number | null;
  duration_label_uk: string | null;
  duration_label_pl: string | null;
  photos_count: number | null;
  currency: string | null;
  deposit_amount: number | null;
  is_constructor: boolean;
};

type PackageAddon = { id: string; title_uk: string; title_pl: string; description_uk: string | null; description_pl: string | null; price: number };

type Interior = {
  id: string;
  name: string;
  description: string | null;
  description_uk: string | null;
  description_pl: string | null;
  photo_url: string | null;
  image_url: string | null;
};

type Photographer = {
  id: string;
  name: string;
  position: string | null;
  bio: string | null;
  bio_uk: string | null;
  bio_pl: string | null;
  photo_url: string | null;
  image_url: string | null;
};

type BookedSlot = {
  booking_time: string;
};

type BookingSuccessDetails = {
  bookingReference: string;
  bookingDate: string;
  bookingTime: string;
  endTime: string;
  durationHours: number;
  packageTitle: string;
  totalAmount: number;
  depositAmount: number;
  currency: string;
  interiorName: string;
  photographerName: string;
};

const fixedPackageDurationHours = 3;
const constructorDurationOptions = [1, 2, 3, 4, 5];
const constructorPrices: Record<number, number> = {
  1: 1000,
  2: 1600,
  3: 2200,
  4: 3000,
  5: 3500,
};

const normalizeTime = (time: string | null | undefined) => (time || "").slice(0, 5);

const timeToMinutes = (time: string) => {
  const [hours, minutes] = normalizeTime(time).split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

const getEndTime = (startTime: string, durationHours: number) =>
  minutesToTime(timeToMinutes(startTime) + durationHours * 60);

const createBookingId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));

  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
    .slice(6, 8)
    .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
};

const defaultCurrency = "PLN";
const bookingDepositAmount = 500;
const initialPaymentStatus = "pending_payment";

type BookingLanguage = "uk" | "pl";

const bookingTranslations = {
  uk: {
    brand: "SISTERS PHOTO STUDIO",
    checking: "Завантажуємо бронювання...",
    privateBooking: "Public Booking",
    title: "Забронювати зйомку",
    subtitle:
      "Заповніть контакти, оберіть пакет, дату та вільний час. Реєстрація не потрібна.",
    loadingData: "Завантажуємо пакети та вільні години...",
    missingDataTitle: "Поки не вистачає даних для бронювання",
    missingDataDescription:
      "У таблицях packages, interiors і team мають бути активні рядки з is_active = true. Інтерʼєр і спеціаліст обираються автоматично.",
    bookingSentLabel: "Booking sent",
    bookingSentTitle: "Заявка відправлена",
    bookingSentDescription:
      "Студія скоро звʼяжеться з вами для підтвердження деталей. Лист-підтвердження надіслано на ваш email. Якщо його немає у «Вхідних», перевірте папку «Спам».",
    requestStatus: "Статус заявки",
    pending: "Очікує підтвердження",
    payment: "Оплата",
    paymentPending: "Очікує оплату передплати",
    paymentCancelled: "Оплату скасовано. Бронювання збережено — можна повторити оплату.",
    payNow: "Оплатити передплату",
    redirectingPayment: "Відкриваємо безпечну оплату Stripe…",
    totalAmount: "Повна вартість",
    depositAmount: "Передплата",
    dateAndTime: "Дата і час",
    package: "Пакет",
    copyDetails: "Скопіювати деталі заявки",
    copiedDetails: "Деталі заявки скопійовані",
    goDashboard: "Увійти в кабінет",
    createAnother: "Створити ще одну бронь",
    backToSite: "Повернутися на сайт",
    step01: "Step 01",
    step02: "Step 02",
    step03: "Step 03",
    step04: "Step 04",
    step05: "Step 05",
    clientContacts: "Ваші контакти",
    clientName: "Імʼя",
    clientNamePlaceholder: "Ваше імʼя",
    clientPhone: "Телефон",
    clientPhonePlaceholder: "+48 ...",
    clientEmail: "Email",
    clientEmailPlaceholder: "name@email.com",
    choosePackage: "Оберіть пакет",
    choosePhotographer: "Оберіть спеціаліста",
    shootDate: "Дата зйомки",
    chooseDate: "Оберіть дату",
    studioWorksDaily: "Студія працює щодня.",
    chooseDateHint:
      "Оберіть зручну дату, починаючи з сьогоднішнього дня, і вільний час для зйомки.",
    chooseTime: "Оберіть час",
    duration: "Тривалість зйомки",
    durationHint: "Оберіть, скільки годин триватиме фотосесія. Зайняті години всередині обраного діапазону враховуються автоматично.",
    hour: "година",
    hours: "години",
    timeRange: "Час зйомки",
    tooLate: "Пізно",
    checkingSlots: "Перевіряємо вільні слоти...",
    booked: "Зайнято",
    past: "Минуло",
    selectDateFirst: "Спочатку оберіть дату, потім зʼявляться доступні години.",
    selectFreeHour:
      "Оберіть одну з вільних годин студії. Зайняті слоти позначені “Зайнято”, минулі години — “Минуло”.",
    todayFutureOnly: "Для сьогоднішньої дати доступні тільки майбутні години.",
    notes: "Коментар",
    notesPlaceholder:
      "Наприклад: сімейна зйомка, мама з дитиною, хочу ніжне світло...",
    openingDashboard: "Зараз відкриємо особистий кабінет...",
    finalCheck: "Final check",
    selectedTitle: "Ви обрали",
    date: "Дата",
    time: "Час",
    price: "Ціна",
    noDate: "Дата не обрана",
    noTime: "Час не обрано",
    noPackage: "Пакет не обрано",
    noPrice: "Ціна не обрана",
    noInterior: "Інтерʼєр не обрано",
    noPhotographer: "Фотограф не обраний",
    afterSubmit:
      "Після бронювання відкриється безпечна сторінка Stripe для оплати передплати.",
    submit: "Забронювати й оплатити",
    submitting: "Готуємо оплату...",
    minutes: "хв",
    photos: "фото",
    timeClarified: "Час уточнюється",
    errors: {
      loginRequired: "Заповніть імʼя, телефон та email",
      selectPackageInteriorPhotographer: "Оберіть пакет",
      selectDate: "Оберіть дату зйомки",
      pastDate: "Не можна забронювати зйомку на минулу дату",
      selectTime: "Оберіть час зйомки",
      pastTime: "Не можна забронювати минулий час. Оберіть майбутній слот.",
      bookedTime: "Цей час уже зайнятий. Оберіть інший слот.",
      packageNotFound: "Вибраний пакет не знайдено",
      bookedTimeDetailed: "Цей час уже зайнятий. Оберіть інший час.",
      outsideWorkingHours: "Обрана тривалість виходить за межі робочого часу. Оберіть раніший початок.",
      copyFailed: "Не вдалося скопіювати деталі заявки",
      checkoutFailed: "Бронювання збережено, але сторінка оплати не відкрилася. Натисніть «Оплатити передплату» ще раз.",
    },
    success: "Заявка відправлена",
    copyTextTitle: "Заявка на зйомку відправлена",
    copyTextStatus: "Статус: очікує підтвердження",
    copyTextStudioContact: "Студія скоро звʼяжеться для підтвердження деталей.",
  },
  pl: {
    brand: "SISTERS PHOTO STUDIO",
    checking: "Sprawdzamy logowanie...",
    privateBooking: "Public Booking",
    title: "Zarezerwuj sesję",
    subtitle:
      "Wpisz dane kontaktowe, wybierz pakiet, wnętrze, datę i dostępną godzinę. Rejestracja nie jest wymagana.",
    loadingData: "Ładujemy pakiety i dostępne godziny...",
    missingDataTitle: "Brakuje danych do rezerwacji",
    missingDataDescription:
      "W tabelach packages, interiors i team muszą być aktywne wiersze z is_active = true. Wnętrze i specjalista są wybierani automatycznie.",
    bookingSentLabel: "Booking sent",
    bookingSentTitle: "Zgłoszenie wysłane",
    bookingSentDescription:
      "Studio wkrótce skontaktuje się z Tobą, aby potwierdzić szczegóły. Wiadomość z potwierdzeniem została wysłana na Twój email. Jeśli nie ma jej w Odebranych, sprawdź folder Spam.",
    requestStatus: "Status zgłoszenia",
    pending: "Oczekuje na potwierdzenie",
    payment: "Płatność",
    paymentPending: "Oczekuje na wpłatę zadatku",
    paymentCancelled: "Płatność anulowana. Rezerwacja jest zapisana — możesz ponowić płatność.",
    payNow: "Zapłać zadatek",
    redirectingPayment: "Otwieramy bezpieczną płatność Stripe…",
    totalAmount: "Pełna cena",
    depositAmount: "Zadatek",
    dateAndTime: "Data i godzina",
    package: "Pakiet",
    copyDetails: "Skopiuj szczegóły zgłoszenia",
    copiedDetails: "Szczegóły zgłoszenia skopiowane",
    goDashboard: "Zaloguj się do panelu",
    createAnother: "Utwórz kolejną rezerwację",
    backToSite: "Wróć na stronę",
    step01: "Krok 01",
    step02: "Krok 02",
    step03: "Krok 03",
    step04: "Krok 04",
    step05: "Krok 05",
    clientContacts: "Dane kontaktowe",
    clientName: "Imię",
    clientNamePlaceholder: "Twoje imię",
    clientPhone: "Telefon",
    clientPhonePlaceholder: "+48 ...",
    clientEmail: "Email",
    clientEmailPlaceholder: "name@email.com",
    choosePackage: "Wybierz pakiet",
    choosePhotographer: "Wybierz specjalistę",
    shootDate: "Data sesji",
    chooseDate: "Wybierz datę",
    studioWorksDaily: "Studio pracuje codziennie.",
    chooseDateHint: "Wybierz dogodną datę od dzisiaj oraz wolną godzinę sesji.",
    chooseTime: "Wybierz godzinę",
    duration: "Czas trwania sesji",
    durationHint: "Wybierz liczbę godzin sesji. Zajęte godziny wewnątrz wybranego zakresu są sprawdzane automatycznie.",
    hour: "godzina",
    hours: "godziny",
    timeRange: "Czas sesji",
    tooLate: "Za późno",
    checkingSlots: "Sprawdzamy dostępne godziny...",
    booked: "Zajęte",
    past: "Minęło",
    selectDateFirst:
      "Najpierw wybierz datę, potem pojawią się dostępne godziny.",
    selectFreeHour:
      "Wybierz jedną z dostępnych godzin studia. Zajęte terminy są oznaczone “Zajęte”, minione godziny — “Minęło”.",
    todayFutureOnly: "Dla dzisiejszej daty dostępne są tylko przyszłe godziny.",
    notes: "Komentarz",
    notesPlaceholder:
      "Na przykład: sesja rodzinna, mama z dzieckiem, zależy mi na delikatnym świetle...",
    openingDashboard: "Za chwilę otworzymy panel klienta...",
    finalCheck: "Final check",
    selectedTitle: "Wybrano",
    date: "Data",
    time: "Godzina",
    price: "Cena",
    noDate: "Nie wybrano daty",
    noTime: "Nie wybrano godziny",
    noPackage: "Nie wybrano pakietu",
    noPrice: "Nie wybrano ceny",
    noInterior: "Nie wybrano wnętrza",
    noPhotographer: "Nie wybrano fotografa",
    afterSubmit:
      "Po utworzeniu rezerwacji otworzy się bezpieczna strona Stripe do wpłaty zadatku.",
    submit: "Zarezerwuj i zapłać",
    submitting: "Przygotowujemy płatność...",
    minutes: "min",
    photos: "zdjęć",
    timeClarified: "Godzina do ustalenia",
    errors: {
      loginRequired: "Wpisz imię, telefon i email",
      selectPackageInteriorPhotographer: "Wybierz pakiet",
      selectDate: "Wybierz datę sesji",
      pastDate: "Nie można zarezerwować sesji na minioną datę",
      selectTime: "Wybierz godzinę sesji",
      pastTime:
        "Nie można zarezerwować minionej godziny. Wybierz przyszły termin.",
      bookedTime: "Ta godzina jest już zajęta. Wybierz inny termin.",
      packageNotFound: "Wybrany pakiet nie został znaleziony",
      bookedTimeDetailed: "Ta godzina jest już zajęta. Wybierz inną godzinę.",
      outsideWorkingHours: "Wybrany czas trwania wykracza poza godziny pracy. Wybierz wcześniejszy początek.",
      copyFailed: "Nie udało się skopiować szczegółów zgłoszenia",
      checkoutFailed: "Rezerwacja została zapisana, ale strona płatności się nie otworzyła. Kliknij ponownie „Zapłać zadatek”.",
    },
    success: "Zgłoszenie wysłane",
    copyTextTitle: "Zgłoszenie na sesję wysłane",
    copyTextStatus: "Status: oczekuje na potwierdzenie",
    copyTextStudioContact:
      "Studio wkrótce skontaktuje się w celu potwierdzenia szczegółów.",
  },
} as const;

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getIsPhotographerTeamMember = (member: Photographer) => {
  const searchText = `${member.name} ${member.position || ""}`.toLowerCase();

  return (
    searchText.includes("фотограф") ||
    searchText.includes("fotograf") ||
    searchText.includes("photographer")
  );
};

export default function BookingPage() {
  const todayDate = useMemo(() => getTodayDateString(), []);

  const [lang, setLang] = useState<BookingLanguage>("uk");
  const [bookingEnabled, setBookingEnabled] = useState(true);
  const [durationHours, setDurationHours] = useState(fixedPackageDurationHours);
  const [openHour, setOpenHour] = useState(10);
  const [closeHour, setCloseHour] = useState(18);

  const workingHours = useMemo(
    () => Array.from({ length: Math.max(closeHour - openHour, 0) }, (_, index) => `${String(openHour + index).padStart(2, "0")}:00`),
    [openHour, closeHour],
  );

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
        .select("photo_booking_enabled,photo_open_hour,photo_close_hour")
        .eq("id", "main")
        .maybeSingle();

      if (!data) return;
      setBookingEnabled(data.photo_booking_enabled !== false);
      setOpenHour(Number(data.photo_open_hour || 10));
      setCloseHour(Number(data.photo_close_hour || 18));
    };
    loadPageSettings();
  }, []);

  const changeLang = (nextLang: BookingLanguage) => {
    setLang(nextLang);
    window.localStorage.setItem("sisters-language", nextLang);
  };

  const bt = bookingTranslations[lang];

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [packages, setPackages] = useState<Package[]>([]);
  const [packageAddons, setPackageAddons] = useState<PackageAddon[]>([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [interiors, setInteriors] = useState<Interior[]>([]);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);

  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [selectedInteriorId, setSelectedInteriorId] = useState("");
  const [selectedPhotographerId, setSelectedPhotographerId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [notes, setNotes] = useState("");

  const [isChecking, setIsChecking] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [bookingSuccessDetails, setBookingSuccessDetails] =
    useState<BookingSuccessDetails | null>(null);
  const [copiedSuccessDetails, setCopiedSuccessDetails] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dataErrorMessage, setDataErrorMessage] = useState("");
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

  const selectedPackage = useMemo(() => {
    return packages.find((item) => item.id === selectedPackageId) || null;
  }, [packages, selectedPackageId]);

  const selectedAddons = useMemo(() => packageAddons.filter(item => selectedAddonIds.includes(item.id)), [packageAddons, selectedAddonIds]);
  const addonsTotal = selectedAddons.reduce((sum, item) => sum + Number(item.price), 0);
  const constructorBasePrice = constructorPrices[durationHours] || constructorPrices[1];
  const packageBasePrice = selectedPackage?.is_constructor ? constructorBasePrice : Number(selectedPackage?.price || 0);
  const bookingTotal = packageBasePrice + addonsTotal;

  const selectedInterior = useMemo(() => {
    return interiors.find((item) => item.id === selectedInteriorId) || null;
  }, [interiors, selectedInteriorId]);

  const selectedPhotographer = useMemo(() => {
    return (
      photographers.find((item) => item.id === selectedPhotographerId) || null
    );
  }, [photographers, selectedPhotographerId]);

  const selectedCurrency = selectedPackage?.currency || defaultCurrency;
  const selectedDepositAmount = selectedPackage
    ? Math.min(
        Number(selectedPackage.deposit_amount ?? bookingDepositAmount),
        bookingTotal,
      )
    : bookingDepositAmount;

  const selectedEndTime = bookingTime ? getEndTime(bookingTime, durationHours) : "";

  const hasTimeRangeConflict = (startTime: string, hours = durationHours, times = bookedTimes) => {
    const start = timeToMinutes(startTime);
    const end = start + hours * 60;
    return times.some((time) => {
      const bookedStart = timeToMinutes(time);
      return start < bookedStart + 60 && bookedStart < end;
    });
  };

  const isOutsideWorkingHours = (startTime: string, hours = durationHours) =>
    timeToMinutes(startTime) + hours * 60 > closeHour * 60;

  const getPackageDescription = (item: Package) => {
    return lang === "pl"
      ? item.description_pl || item.description || ""
      : item.description_uk || item.description || "";
  };

  const getPackageMeta = (item: Package) => {
    const durationLabel =
      lang === "pl" ? item.duration_label_pl : item.duration_label_uk;

    if (durationLabel?.trim()) {
      return durationLabel;
    }

    const parts: string[] = [];

    if (item.duration_minutes) {
      parts.push(`${item.duration_minutes} ${bt.minutes}`);
    }

    if (item.photos_count) {
      parts.push(`${item.photos_count} ${bt.photos}`);
    }

    return parts.join(" · ") || bt.timeClarified;
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
    const loadBookingData = async () => {
      setIsChecking(true);
      setIsLoadingData(true);
      setErrorMessage("");
      setDataErrorMessage("");

      setIsChecking(false);

      const [packagesResult, interiorsResult, teamResult] = await Promise.all([
        supabase
          .from("packages")
          .select(
            "id, title, description, description_uk, description_pl, price, duration_minutes, duration_label_uk, duration_label_pl, photos_count, currency, deposit_amount, sort_order, is_constructor",
          )
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("price", { ascending: true }),

        supabase
          .from("interiors")
          .select(
            "id, name, description, description_uk, description_pl, photo_url, image_url, sort_order",
          )
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),

        supabase
          .from("team")
          .select(
            "id, name, position, bio, bio_uk, bio_pl, photo_url, image_url, sort_order",
          )
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
      ]);

      if (packagesResult.error) {
        setDataErrorMessage(packagesResult.error.message);
        setIsLoadingData(false);
        return;
      }

      if (interiorsResult.error) {
        setDataErrorMessage(interiorsResult.error.message);
        setIsLoadingData(false);
        return;
      }

      if (teamResult.error) {
        setDataErrorMessage(teamResult.error.message);
        setIsLoadingData(false);
        return;
      }

      const loadedPackages = (packagesResult.data || []) as Package[];
      const loadedInteriors = (interiorsResult.data || []) as Interior[];
      const loadedTeam = (teamResult.data || []) as Photographer[];
      const photographerTeamMembers = loadedTeam.filter(
        getIsPhotographerTeamMember,
      );
      const loadedPhotographers =
        photographerTeamMembers.length > 0
          ? photographerTeamMembers
          : loadedTeam;

      setPackages(loadedPackages);
      setInteriors(loadedInteriors);
      setPhotographers(loadedPhotographers);

      if (loadedPackages.length > 0) {
        const requestedPackageId = new URLSearchParams(window.location.search).get("package");
        const requestedPackage = loadedPackages.find(item => item.id === requestedPackageId);
        setSelectedPackageId(requestedPackage?.id || loadedPackages[0].id);
      }

      if (loadedInteriors.length > 0) {
        setSelectedInteriorId(loadedInteriors[0].id);
      }

      if (loadedPhotographers.length > 0) {
        setSelectedPhotographerId(loadedPhotographers[0].id);
      }

      setIsLoadingData(false);
    };

    loadBookingData();
  }, []);

  useEffect(() => {
    const loadAddons = async () => {
      const { data } = await supabase.from("package_addons").select("id,title_uk,title_pl,description_uk,description_pl,price").eq("is_active", true).order("sort_order");
      setPackageAddons(((data || []) as PackageAddon[]).map(item => ({ ...item, price: Number(item.price) })));
    };
    loadAddons();
  }, []);

  useEffect(() => {
    if (!selectedPackage) return;

    if (!selectedPackage.is_constructor) {
      setSelectedAddonIds([]);
    }

    setDurationHours(
      selectedPackage.is_constructor ? 1 : fixedPackageDurationHours,
    );
    setBookingTime("");
  }, [selectedPackage]);

  useEffect(() => {
    const loadBookedSlots = async () => {
      if (!bookingDate) {
        setBookedTimes([]);
        return;
      }

      setIsLoadingSlots(true);
      setErrorMessage("");

      const { data, error } = await supabase.rpc("get_booked_times_for_date", {
        selected_date: bookingDate,
      });

      if (error) {
        setErrorMessage(error.message);
        setBookedTimes([]);
        setIsLoadingSlots(false);
        return;
      }

      const times = ((data || []) as BookedSlot[]).map((slot) =>
        slot.booking_time.slice(0, 5),
      );

      setBookedTimes(times);

      if (bookingTime && (hasTimeRangeConflict(bookingTime, durationHours, times) || isOutsideWorkingHours(bookingTime, durationHours))) {
        setBookingTime("");
      }

      setIsLoadingSlots(false);
    };

    loadBookedSlots();
  }, [bookingDate]);

  useEffect(() => {
    if (bookingTime && (hasTimeRangeConflict(bookingTime) || isOutsideWorkingHours(bookingTime))) {
      setBookingTime("");
    }
  }, [durationHours, bookedTimes]);

  const startCheckout = async (bookingReference: string) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingKind: "photoshoot",
          reference: bookingReference,
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

    if (isSubmitting) {
      return;
    }

    if (!clientName.trim() || !clientPhone.trim() || !clientEmail.trim()) {
      setErrorMessage(bt.errors.loginRequired);
      return;
    }

    if (!selectedPackageId || !selectedInteriorId || !selectedPhotographerId) {
      setErrorMessage(bt.errors.selectPackageInteriorPhotographer);
      return;
    }

    if (!bookingDate) {
      setErrorMessage(bt.errors.selectDate);
      return;
    }

    if (bookingDate < todayDate) {
      setErrorMessage(bt.errors.pastDate);
      setBookingTime("");
      return;
    }

    if (!bookingTime) {
      setErrorMessage(bt.errors.selectTime);
      return;
    }

    if (getIsPastTimeForToday(bookingTime)) {
      setErrorMessage(bt.errors.pastTime);
      setBookingTime("");
      return;
    }

    if (isOutsideWorkingHours(bookingTime)) {
      setErrorMessage(bt.errors.outsideWorkingHours);
      return;
    }

    if (hasTimeRangeConflict(bookingTime)) {
      setErrorMessage(bt.errors.bookedTime);
      return;
    }

    if (!selectedPackage) {
      setErrorMessage(bt.errors.packageNotFound);
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");
    setCopiedSuccessDetails(false);
    setErrorMessage("");

    const { data: latestBookedTimes, error: latestBookedTimesError } =
      await supabase.rpc("get_booked_times_for_date", {
        selected_date: bookingDate,
      });

    if (latestBookedTimesError) {
      setErrorMessage(latestBookedTimesError.message);
      setIsSubmitting(false);
      return;
    }

    const latestTimes = ((latestBookedTimes || []) as BookedSlot[]).map((slot) =>
      slot.booking_time.slice(0, 5),
    );

    setBookedTimes(latestTimes);

    if (hasTimeRangeConflict(bookingTime, durationHours, latestTimes)) {
      setErrorMessage(bt.errors.bookedTimeDetailed);
      setBookingTime("");
      setIsSubmitting(false);
      return;
    }

    const bookingId = createBookingId();

    const { error } = await supabase.from("bookings").insert({
      id: bookingId,
      client_name: clientName.trim(),
      client_phone: clientPhone.trim(),
      client_email: clientEmail.trim(),
      language: lang,
      package_id: selectedPackageId,
      interior_id: selectedInteriorId,
      photographer_id: selectedPhotographerId,
      booking_date: bookingDate,
      booking_time: bookingTime,
      duration_hours: durationHours,
      end_time: getEndTime(bookingTime, durationHours),
      status: "pending",
      total_price: bookingTotal,
      selected_addons: selectedAddons.map(item => ({ id: item.id, title: lang === "pl" ? item.title_pl : item.title_uk, price: item.price })),
      notes: notes.trim() || null,
      payment_status: initialPaymentStatus,
      payment_provider: null,
      payment_id: null,
      deposit_amount: selectedDepositAmount,
      total_amount: bookingTotal,
      currency: selectedCurrency,
      paid_at: null,
    });

    if (error) {
      if (error.code === "23505") {
        setErrorMessage(bt.errors.bookedTimeDetailed);
      } else {
        setErrorMessage(error.message);
      }

      setIsSubmitting(false);
      return;
    }

    try {
      const emailResponse = await fetch("/api/booking-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingType: "photoshoot",
          bookingId,
        }),
      });

      if (!emailResponse.ok) {
        console.error("Booking email notification failed");
      }
    } catch (emailError) {
      console.error("Booking email notification failed", emailError);
    }

    setBookingSuccessDetails({
      bookingReference: bookingId,
      bookingDate,
      bookingTime,
      endTime: getEndTime(bookingTime, durationHours),
      durationHours,
      packageTitle: selectedPackage?.title || bt.noPackage,
      totalAmount: bookingTotal,
      depositAmount: selectedDepositAmount,
      currency: selectedCurrency,
      interiorName: selectedInterior?.name || bt.noInterior,
      photographerName: selectedPhotographer?.name || bt.noPhotographer,
    });
    setSuccessMessage(bt.success);
    setBookingDate("");
    setBookingTime("");
    setDurationHours(1);
    setSelectedAddonIds([]);
    setNotes("");
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setBookedTimes([]);
    setCancelledPaymentReference("");
    await startCheckout(bookingId);
  };

  const formatPrice = (price: number, currency = defaultCurrency) => {
    return `${new Intl.NumberFormat(lang === "pl" ? "pl-PL" : "uk-UA").format(price)} ${currency}`;
  };

  const handleCopySuccessDetails = async () => {
    if (!bookingSuccessDetails) return;

    const text = [
      bt.brand,
      "",
      bt.copyTextTitle,
      bt.copyTextStatus,
      `${bt.date}: ${bookingSuccessDetails.bookingDate}`,
      `${bt.time}: ${bookingSuccessDetails.bookingTime}–${bookingSuccessDetails.endTime}`,
      `${bt.package}: ${bookingSuccessDetails.packageTitle}`,
      `${bt.totalAmount}: ${formatPrice(bookingSuccessDetails.totalAmount, bookingSuccessDetails.currency)}`,
      `${bt.depositAmount}: ${formatPrice(bookingSuccessDetails.depositAmount, bookingSuccessDetails.currency)}`,
      `${bt.payment}: ${bt.paymentPending}`,
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

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F1EA] text-[#2B1A12]">
        <div className="text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#A67C52]">
            {bt.brand}
          </p>

          <p className="text-sm text-[#7A6252]">{bt.checking}</p>
        </div>
      </main>
    );
  }

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
            href="/sesje-zdjeciowe"
            className="rounded-full border border-white/15 bg-white/8 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#fff7ef] backdrop-blur transition hover:bg-white/14"
          >
            ← {lang === "pl" ? "Wróć do sesji" : "Повернутися до фотосесій"}
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
          className="relative mb-8 overflow-hidden rounded-[40px] border border-white/12 bg-[#2f1d15] px-7 py-12 text-center shadow-[0_30px_120px_rgba(0,0,0,0.36)] sm:px-12 sm:py-16"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(8,6,4,0.40), rgba(8,6,4,0.88)), url('/images/site/photoshoots/hero.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-[#f2a7b8]">
            {bt.privateBooking}
          </p>

          <h1 className="font-serif text-5xl font-normal leading-[0.98] tracking-[-0.05em] text-[#fff7ef] sm:text-7xl">
            {bt.title}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#e8d2c0] sm:text-base">
            {bt.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="rounded-[40px] border border-white/12 bg-[#f6efe8] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.36)] sm:p-10"
        >
          {isLoadingData && (
            <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 px-5 py-5 text-sm text-[#7A6252]">
              {bt.loadingData}
            </div>
          )}

          {!isLoadingData && dataErrorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-5 text-sm text-red-700">
              {dataErrorMessage}
            </div>
          )}

          {!isLoadingData && cancelledPaymentReference && !bookingSuccessDetails && (
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

          {!isLoadingData &&
            !dataErrorMessage &&
            (packages.length === 0 ||
              interiors.length === 0 ||
              photographers.length === 0) && (
              <div className="rounded-[28px] border border-dashed border-[#D8C4B3] bg-[#F7F1EA]/70 px-6 py-10 text-center">
                <p className="text-lg font-medium text-[#2B1A12]">
                  {bt.missingDataTitle}
                </p>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7A6252]">
                  {bt.missingDataDescription}
                </p>
              </div>
            )}

          {!isLoadingData && !dataErrorMessage && bookingSuccessDetails && (
            <div className="rounded-[32px] border border-green-200 bg-green-50/80 p-6 text-center sm:p-8">
              <p className="mb-3 text-xs uppercase tracking-[0.24em] text-green-700">
                {bt.bookingSentLabel}
              </p>

              <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#2B1A12]">
                {bt.bookingSentTitle}
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#6E5748]">
                {bt.bookingSentDescription}
              </p>

              {errorMessage && (
                <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              <div className="mx-auto mt-6 grid max-w-2xl gap-3 rounded-[24px] border border-green-200 bg-white/70 p-5 text-left">
                <div className="rounded-2xl border border-[#E6CFA8] bg-[#FFF4DD] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                    {bt.requestStatus}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#7A5528]">
                    {bt.pending}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E5D5C8] bg-[#FFFDFB] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                    {bt.payment}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#7A5528]">
                    {bt.paymentPending}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                    {bt.dateAndTime}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#2B1A12]">
                    {bookingSuccessDetails.bookingDate} в{" "}
                    {bookingSuccessDetails.bookingTime}–{bookingSuccessDetails.endTime}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                    {bt.package}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#2B1A12]">
                    {bookingSuccessDetails.packageTitle}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                      {bt.totalAmount}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#2B1A12]">
                      {formatPrice(
                        bookingSuccessDetails.totalAmount,
                        bookingSuccessDetails.currency,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                      {bt.depositAmount}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#2B1A12]">
                      {formatPrice(
                        bookingSuccessDetails.depositAmount,
                        bookingSuccessDetails.currency,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col items-center gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => startCheckout(bookingSuccessDetails.bookingReference)}
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

                {copiedSuccessDetails && (
                  <p className="text-sm text-green-800">{bt.copiedDetails}</p>
                )}
              </div>

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setBookingSuccessDetails(null);
                    setSuccessMessage("");
                    setCopiedSuccessDetails(false);
                  }}
                  className="rounded-full border border-[#D8C4B3] bg-white/80 px-6 py-4 text-xs font-medium uppercase tracking-[0.16em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
                >
                  {bt.createAnother}
                </button>

                <Link
                  href="/"
                  className="rounded-full bg-[#2B1A12] px-6 py-4 text-xs font-medium uppercase tracking-[0.16em] text-[#F7F1EA] transition hover:bg-[#4A2D1E]"
                >
                  {bt.backToSite}
                </Link>
              </div>
            </div>
          )}

          {!isLoadingData &&
            !dataErrorMessage &&
            !bookingSuccessDetails &&
            packages.length > 0 &&
            interiors.length > 0 &&
            photographers.length > 0 && (
              <form onSubmit={handleBooking} className="space-y-8">
                <div>
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#A67C52]">
                      {bt.step01}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                      {bt.clientContacts}
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
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
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#A67C52]">
                      {bt.step02}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                      {bt.choosePackage}
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {packages.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedPackageId(item.id)}
                        className={`rounded-[28px] border p-5 text-left transition ${
                          selectedPackageId === item.id
                            ? "border-[#2B1A12] bg-[#2B1A12] text-[#F7F1EA] shadow-[0_18px_50px_rgba(43,26,18,0.20)]"
                            : "border-[#E5D5C8] bg-white/80 text-[#2B1A12] hover:border-[#A67C52]"
                        }`}
                      >
                        <p className="text-lg font-semibold tracking-[-0.03em]">
                          {item.title}
                        </p>

                        {getPackageDescription(item) && (
                          <p
                            className={`mt-3 text-sm leading-6 ${
                              selectedPackageId === item.id
                                ? "text-[#E8D8CC]"
                                : "text-[#7A6252]"
                            }`}
                          >
                            {getPackageDescription(item)}
                          </p>
                        )}

                        <p className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
                          {formatPrice(
                            item.price,
                            item.currency || defaultCurrency,
                          )}
                        </p>

                        <div
                          className={`mt-3 text-xs uppercase tracking-[0.14em] ${
                            selectedPackageId === item.id
                              ? "text-[#D8C4B3]"
                              : "text-[#A67C52]"
                          }`}
                        >
                          {getPackageMeta(item)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedPackage?.is_constructor && (
                  <div className="rounded-[30px] border border-[#D8C4B3] bg-[#FFFDFB] p-5 sm:p-6">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#A67C52]">{lang === "pl" ? "Dodatkowe usługi" : "Додаткові послуги"}</p>
                    <h2 className="mt-2 text-2xl font-semibold">{lang === "pl" ? "Zbuduj swoją sesję" : "Створіть свою фотосесію"}</h2>
                    <p className="mt-2 text-sm text-[#7A6252]">{lang === "pl" ? "Fotograf jest już w cenie. Wybierz dodatkowe usługi — możesz zaznaczyć kilka." : "Фотограф уже включений у вартість. Оберіть додаткові послуги — можна вибрати декілька."}</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-[#A67C52] bg-[#F5E9DD] p-4 text-left shadow-[0_12px_30px_rgba(166,124,82,0.10)]">
                        <div className="flex items-start justify-between gap-3"><span className="font-semibold">{lang === "pl" ? "Fotograf" : "Фотограф"}</span><span className="rounded-full bg-[#2B1A12] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">{lang === "pl" ? "W cenie" : "Включено"}</span></div>
                        <p className="mt-2 text-sm leading-5 text-[#7A6252]">{lang === "pl" ? "Podstawowa sesja fotograficzna. Tej usługi nie można wyłączyć." : "Базова фотосесія. Цю послугу не можна вимкнути."}</p>
                        <p className="mt-3 text-sm font-semibold text-[#5B3825]">{formatPrice(constructorBasePrice, selectedCurrency)} · {durationHours} {durationHours === 1 ? bt.hour : bt.hours}</p>
                      </div>
                      {packageAddons.map(item => {
                        const selected = selectedAddonIds.includes(item.id);
                        return <button key={item.id} type="button" onClick={() => setSelectedAddonIds(current => selected ? current.filter(id => id !== item.id) : [...current, item.id])} className={`rounded-2xl border p-4 text-left transition ${selected ? "border-[#2B1A12] bg-[#2B1A12] text-white" : "border-[#E5D5C8] bg-white text-[#2B1A12]"}`}>
                          <div className="flex items-start justify-between gap-3"><span className="font-semibold">{lang === "pl" ? item.title_pl : item.title_uk}</span><span className="shrink-0 font-semibold">+{formatPrice(item.price, selectedCurrency)}</span></div>
                          {(lang === "pl" ? item.description_pl : item.description_uk) && <p className={`mt-2 text-sm leading-5 ${selected ? "text-[#E8D8CC]" : "text-[#7A6252]"}`}>{lang === "pl" ? item.description_pl : item.description_uk}</p>}
                        </button>;
                      })}
                    </div>
                    <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#F5E9DD] px-4 py-4"><span className="text-sm font-medium">{lang === "pl" ? "Razem" : "Разом"}</span><span className="text-xl font-semibold">{formatPrice(bookingTotal, selectedCurrency)}</span></div>
                  </div>
                )}


                <div>
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#A67C52]">
                      {bt.step03}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                      {bt.shootDate}
                    </h2>
                  </div>

                  <div>
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
                        setBookingTime("");
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
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#A67C52]">
                      {bt.step04}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                      {bt.chooseTime}
                    </h2>
                  </div>

                  {selectedPackage?.is_constructor && (
                    <div className="mb-6 rounded-[26px] border border-[#E5D5C8] bg-[#FFFDFB]/80 p-4 sm:p-5">
                      <p className="text-sm font-semibold text-[#2B1A12]">{bt.duration}</p>
                      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {constructorDurationOptions.map((hours) => (
                          <button
                            key={hours}
                            type="button"
                            onClick={() => {
                              setDurationHours(hours);
                              setErrorMessage("");
                            }}
                            className={`rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                              durationHours === hours
                                ? "border-[#2B1A12] bg-[#2B1A12] text-[#F7F1EA] shadow-[0_12px_28px_rgba(43,26,18,0.16)]"
                                : "border-[#D8C4B3] bg-white text-[#2B1A12] hover:border-[#A67C52]"
                            }`}
                          >
                            {hours} {hours === 1 ? bt.hour : bt.hours}
                          </button>
                        ))}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-[#7A6252]">{bt.durationHint}</p>
                    </div>
                  )}

                  {isLoadingSlots && (
                    <p className="mb-3 text-sm text-[#7A6252]">
                      {bt.checkingSlots}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {workingHours.map((time) => {
                      const isBooked = hasTimeRangeConflict(time);
                      const isPastTimeToday = getIsPastTimeForToday(time);
                      const isTooLate = isOutsideWorkingHours(time);
                      const isSelected = bookingTime === time;

                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={
                            isBooked ||
                            isPastTimeToday ||
                            isTooLate ||
                            isLoadingSlots ||
                            !bookingDate
                          }
                          onClick={() => {
                            setBookingTime(time);
                            setErrorMessage("");
                          }}
                          className={`rounded-2xl border px-4 py-4 text-sm font-medium tracking-[0.08em] transition ${
                            isBooked || isPastTimeToday || isTooLate
                              ? "cursor-not-allowed border-[#D8C4B3] bg-[#E8D8CC]/70 text-[#9C8778] opacity-70"
                              : isSelected
                                ? "border-[#2B1A12] bg-[#2B1A12] text-[#F7F1EA] shadow-[0_16px_34px_rgba(43,26,18,0.18)]"
                                : "border-[#D8C4B3] bg-white/80 text-[#2B1A12] hover:border-[#A67C52] hover:bg-[#FFFDFB]"
                          }`}
                        >
                          <span
                            className={
                              isBooked || isPastTimeToday || isTooLate ? "line-through" : ""
                            }
                          >
                            {time}
                          </span>

                          {isBooked && (
                            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.16em] no-underline">
                              {bt.booked}
                            </span>
                          )}

                          {!isBooked && isPastTimeToday && (
                            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.16em] no-underline">
                              {bt.past}
                            </span>
                          )}

                          {!isBooked && !isPastTimeToday && isTooLate && (
                            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.16em] no-underline">
                              {bt.tooLate}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {!bookingDate && (
                    <p className="mt-3 text-sm text-[#7A6252]">
                      {bt.selectDateFirst}
                    </p>
                  )}

                  {bookingDate && !bookingTime && (
                    <p className="mt-3 text-sm text-[#7A6252]">
                      {bt.selectFreeHour}
                    </p>
                  )}

                  {bookingDate === todayDate && (
                    <p className="mt-2 text-sm text-[#8A5A36]">
                      {bt.todayFutureOnly}
                    </p>
                  )}

                  {bookingTime && (
                    <div className="mt-4 rounded-2xl border border-[#CDB399] bg-[#F5E9DD] px-4 py-3 text-sm text-[#5B3825]">
                      <span className="font-semibold">{bt.timeRange}:</span>{" "}
                      {bookingTime}–{selectedEndTime} · {durationHours} {durationHours === 1 ? bt.hour : bt.hours}
                    </div>
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
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                  />
                </div>

                {successMessage && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                    {successMessage} {bt.openingDashboard}
                  </div>
                )}

                {errorMessage && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}

                <div className="rounded-[28px] border border-[#E5D5C8] bg-[#F7F1EA]/70 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#A67C52]">
                    {bt.finalCheck}
                  </p>

                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                    {bt.selectedTitle}
                  </h3>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#E5D5C8] bg-white/70 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                        {bt.date}
                      </p>
                      <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                        {bookingDate || bt.noDate}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#E5D5C8] bg-white/70 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                        {bt.time}
                      </p>
                      <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                        {bookingTime ? `${bookingTime}–${selectedEndTime}` : bt.noTime}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#E5D5C8] bg-white/70 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                        {bt.package}
                      </p>
                      <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                        {selectedPackage?.title || bt.noPackage}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#E5D5C8] bg-white/70 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                        {bt.price}
                      </p>
                      <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                        {selectedPackage
                          ? formatPrice(bookingTotal, selectedCurrency)
                          : bt.noPrice}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#E5D5C8] bg-white/70 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                        {bt.depositAmount}
                      </p>
                      <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                        {formatPrice(selectedDepositAmount, selectedCurrency)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#E5D5C8] bg-white/70 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                        {bt.payment}
                      </p>
                      <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                        {bt.paymentPending}
                      </p>
                    </div>
                  </div>

                  {selectedPackage?.is_constructor && (
                    <div className="mt-4 rounded-2xl border border-[#E5D5C8] bg-white/70 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">{lang === "pl" ? "Wybrane usługi" : "Обрані послуги"}</p>
                      <div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-[#2B1A12] px-3 py-2 text-sm text-white">{lang === "pl" ? "Fotograf · w cenie" : "Фотограф · включено"}</span>{selectedAddons.map(item => <span key={item.id} className="rounded-full bg-[#F5E9DD] px-3 py-2 text-sm text-[#5B3825]">{lang === "pl" ? item.title_pl : item.title_uk} · +{formatPrice(item.price, selectedCurrency)}</span>)}</div>
                    </div>
                  )}

                  <p className="mt-5 text-sm leading-6 text-[#7A6252]">
                    {bt.afterSubmit}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-[#2B1A12] px-6 py-4 text-sm font-medium uppercase tracking-[0.18em] text-[#F7F1EA] shadow-[0_18px_40px_rgba(43,26,18,0.22)] transition hover:bg-[#4A2D1E] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? bt.submitting : bt.submit}
                </button>
              </form>
            )}
        </motion.div>
      </section>
    </main>
  );
}
