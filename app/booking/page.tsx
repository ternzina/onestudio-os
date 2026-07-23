"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
};

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

type ClientProfile = {
  name: string | null;
  phone: string | null;
  email: string | null;
};

type BookingSuccessDetails = {
  bookingDate: string;
  bookingTime: string;
  packageTitle: string;
  totalAmount: number;
  depositAmount: number;
  currency: string;
  interiorName: string;
  photographerName: string;
};

const workingHours = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

const defaultCurrency = "PLN";
const bookingDepositAmount = 500;
const initialPaymentStatus = "not_required";

type BookingLanguage = "uk" | "pl";

const bookingTranslations = {
  uk: {
    brand: "SISTERS PHOTO STUDIO",
    checking: "Перевіряємо вхід...",
    privateBooking: "Private Booking",
    title: "Забронювати зйомку",
    subtitle:
      "Оберіть пакет, інтерʼєр, дату та вільний час. Зайняті слоти будуть закриті.",
    loadingData: "Завантажуємо пакети, інтерʼєри та команду...",
    missingDataTitle: "Поки не вистачає даних для бронювання",
    missingDataDescription:
      "У таблицях packages, interiors і team мають бути активні рядки з is_active = true.",
    bookingSentLabel: "Booking sent",
    bookingSentTitle: "Заявка відправлена",
    bookingSentDescription:
      "Студія скоро звʼяжеться з вами для підтвердження деталей. Статус заявки можна подивитися в особистому кабінеті.",
    requestStatus: "Статус заявки",
    pending: "Очікує підтвердження",
    payment: "Оплата",
    paymentNotRequired: "Оплата поки не потрібна",
    totalAmount: "Повна вартість",
    depositAmount: "Передплата",
    dateAndTime: "Дата і час",
    package: "Пакет",
    interior: "Інтерʼєр",
    photographer: "Фотограф",
    copyDetails: "Скопіювати деталі заявки",
    copiedDetails: "Деталі заявки скопійовані",
    goDashboard: "Перейти в кабінет",
    createAnother: "Створити ще одну бронь",
    step01: "Step 01",
    step02: "Step 02",
    step03: "Step 03",
    step04: "Step 04",
    step05: "Step 05",
    choosePackage: "Оберіть пакет",
    chooseInterior: "Оберіть інтерʼєр",
    choosePhotographer: "Оберіть спеціаліста",
    shootDate: "Дата зйомки",
    chooseDate: "Оберіть дату",
    studioWorksDaily: "Студія працює щодня.",
    chooseDateHint:
      "Оберіть зручну дату, починаючи з сьогоднішнього дня, і вільний час для зйомки.",
    chooseTime: "Оберіть час",
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
      "Після відправлення заявки студія звʼяжеться з вами для підтвердження дати та деталей зйомки.",
    submit: "Забронювати",
    submitting: "Відправляємо заявку...",
    minutes: "хв",
    photos: "фото",
    timeClarified: "Час уточнюється",
    errors: {
      loginRequired: "Спочатку потрібно увійти в акаунт",
      selectPackageInteriorPhotographer:
        "Оберіть пакет і інтерʼєр",
      selectDate: "Оберіть дату зйомки",
      pastDate: "Не можна забронювати зйомку на минулу дату",
      selectTime: "Оберіть час зйомки",
      pastTime: "Не можна забронювати минулий час. Оберіть майбутній слот.",
      bookedTime:
        "Цей час уже зайнятий. Оберіть інший слот.",
      packageNotFound: "Вибраний пакет не знайдено",
      bookedTimeDetailed:
        "Цей час уже зайнятий. Оберіть інший час.",
      copyFailed: "Не вдалося скопіювати деталі заявки",
    },
    success: "Заявка відправлена",
    copyTextTitle: "Заявка на зйомку відправлена",
    copyTextStatus: "Статус: очікує підтвердження",
    copyTextStudioContact: "Студія скоро звʼяжеться для підтвердження деталей.",
  },
  pl: {
    brand: "SISTERS PHOTO STUDIO",
    checking: "Sprawdzamy logowanie...",
    privateBooking: "Private Booking",
    title: "Zarezerwuj sesję",
    subtitle:
      "Wybierz pakiet, wnętrze, datę i dostępną godzinę. Zajęte terminy będą zablokowane.",
    loadingData: "Ładujemy pakiety, wnętrza i zespół...",
    missingDataTitle: "Brakuje danych do rezerwacji",
    missingDataDescription:
      "W tabelach packages, interiors i team muszą być aktywne wiersze z is_active = true.",
    bookingSentLabel: "Booking sent",
    bookingSentTitle: "Zgłoszenie wysłane",
    bookingSentDescription:
      "Studio wkrótce skontaktuje się z Tobą, aby potwierdzić szczegóły. Status zgłoszenia możesz sprawdzić w panelu klienta.",
    requestStatus: "Status zgłoszenia",
    pending: "Oczekuje na potwierdzenie",
    payment: "Płatność",
    paymentNotRequired: "Płatność nie jest teraz wymagana",
    totalAmount: "Pełna cena",
    depositAmount: "Zadatek",
    dateAndTime: "Data i godzina",
    package: "Pakiet",
    interior: "Wnętrze",
    photographer: "Fotograf",
    copyDetails: "Skopiuj szczegóły zgłoszenia",
    copiedDetails: "Szczegóły zgłoszenia skopiowane",
    goDashboard: "Przejdź do panelu",
    createAnother: "Utwórz kolejną rezerwację",
    step01: "Krok 01",
    step02: "Krok 02",
    step03: "Krok 03",
    step04: "Krok 04",
    step05: "Krok 05",
    choosePackage: "Wybierz pakiet",
    chooseInterior: "Wybierz wnętrze",
    choosePhotographer: "Wybierz specjalistę",
    shootDate: "Data sesji",
    chooseDate: "Wybierz datę",
    studioWorksDaily: "Studio pracuje codziennie.",
    chooseDateHint: "Wybierz dogodną datę od dzisiaj oraz wolną godzinę sesji.",
    chooseTime: "Wybierz godzinę",
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
      "Po wysłaniu zgłoszenia studio skontaktuje się z Tobą, aby potwierdzić datę i szczegóły sesji.",
    submit: "Zarezerwuj",
    submitting: "Wysyłamy zgłoszenie...",
    minutes: "min",
    photos: "zdjęć",
    timeClarified: "Godzina do ustalenia",
    errors: {
      loginRequired: "Najpierw zaloguj się na konto",
      selectPackageInteriorPhotographer:
        "Wybierz pakiet i wnętrze",
      selectDate: "Wybierz datę sesji",
      pastDate: "Nie można zarezerwować sesji na minioną datę",
      selectTime: "Wybierz godzinę sesji",
      pastTime:
        "Nie można zarezerwować minionej godziny. Wybierz przyszły termin.",
      bookedTime:
        "Ta godzina jest już zajęta. Wybierz inny termin.",
      packageNotFound: "Wybrany pakiet nie został znaleziony",
      bookedTimeDetailed:
        "Ta godzina jest już zajęta. Wybierz inną godzinę.",
      copyFailed: "Nie udało się skopiować szczegółów zgłoszenia",
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
  const router = useRouter();
  const todayDate = useMemo(() => getTodayDateString(), []);

  const [lang, setLang] = useState<BookingLanguage>("uk");

  useEffect(() => {
    const savedLang = window.localStorage.getItem("sisters-language");

    if (savedLang === "uk" || savedLang === "pl") {
      setLang(savedLang);
    }
  }, []);

  const changeLang = (nextLang: BookingLanguage) => {
    setLang(nextLang);
    window.localStorage.setItem("sisters-language", nextLang);
  };

  const bt = bookingTranslations[lang];

  const [userId, setUserId] = useState<string | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(
    null,
  );

  const [packages, setPackages] = useState<Package[]>([]);
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

  const selectedPackage = useMemo(() => {
    return packages.find((item) => item.id === selectedPackageId) || null;
  }, [packages, selectedPackageId]);

  const selectedInterior = useMemo(() => {
    return interiors.find((item) => item.id === selectedInteriorId) || null;
  }, [interiors, selectedInteriorId]);

  const selectedPhotographer = useMemo(() => {
    return (
      photographers.find((item) => item.id === selectedPhotographerId) || null
    );
  }, [photographers, selectedPhotographerId]);

  const selectedCurrency = selectedPackage?.currency || defaultCurrency;
  const selectedDepositAmount =
    selectedPackage?.deposit_amount ?? bookingDepositAmount;

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

  const getInteriorDescription = (item: Interior) => {
    return lang === "pl"
      ? item.description_pl || item.description || ""
      : item.description_uk || item.description || "";
  };

  const getInteriorImage = (item: Interior) => {
    return item.image_url || item.photo_url || "";
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

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      setUserId(session.user.id);
      setIsChecking(false);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("name, phone, email")
        .eq("id", session.user.id)
        .single();

      if (profileData) {
        setClientProfile(profileData);
      } else {
        setClientProfile({
          name: session.user.user_metadata?.name || null,
          phone: session.user.user_metadata?.phone || null,
          email: session.user.email || null,
        });
      }

      const [packagesResult, interiorsResult, teamResult] = await Promise.all([
        supabase
          .from("packages")
          .select(
            "id, title, description, description_uk, description_pl, price, duration_minutes, duration_label_uk, duration_label_pl, photos_count, currency, deposit_amount, sort_order",
          )
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("price", { ascending: true }),

        supabase
          .from("interiors")
          .select("id, name, description, description_uk, description_pl, photo_url, image_url, sort_order")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),

        supabase
          .from("team")
          .select("id, name, position, bio, bio_uk, bio_pl, photo_url, image_url, sort_order")
          .eq("is_active", true)
          .neq("name", "Sisters Photo Studio")
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
      const photographerTeamMembers = loadedTeam.filter(getIsPhotographerTeamMember);
      const loadedPhotographers =
        photographerTeamMembers.length > 0 ? photographerTeamMembers : loadedTeam;

      setPackages(loadedPackages);
      setInteriors(loadedInteriors);
      setPhotographers(loadedPhotographers);

      if (loadedPackages.length > 0) {
        setSelectedPackageId(loadedPackages[0].id);
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
  }, [router]);

  useEffect(() => {
    const loadBookedSlots = async () => {
      if (!selectedPhotographerId || !bookingDate) {
        setBookedTimes([]);
        return;
      }

      setIsLoadingSlots(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("bookings")
        .select("booking_time")
        .eq("photographer_id", selectedPhotographerId)
        .eq("booking_date", bookingDate)
        .neq("status", "cancelled");

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

      if (bookingTime && times.includes(bookingTime)) {
        setBookingTime("");
      }

      setIsLoadingSlots(false);
    };

    loadBookedSlots();
  }, [selectedPhotographerId, bookingDate, bookingTime]);

  const handleBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!userId) {
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

    if (bookedTimes.includes(bookingTime)) {
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

    const { error } = await supabase.from("bookings").insert({
      user_id: userId,
      package_id: selectedPackageId,
      interior_id: selectedInteriorId,
      photographer_id: selectedPhotographerId,
      booking_date: bookingDate,
      booking_time: bookingTime,
      status: "pending",
      total_price: selectedPackage.price,
      notes: notes.trim() || null,
      payment_status: initialPaymentStatus,
      payment_provider: null,
      payment_id: null,
      deposit_amount: selectedDepositAmount,
      total_amount: selectedPackage.price,
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
          clientName: clientProfile?.name,
          clientPhone: clientProfile?.phone,
          clientEmail: clientProfile?.email,
          bookingDate,
          bookingTime,
          packageTitle: selectedPackage?.title,
          interiorName: selectedInterior?.name,
          photographerName: selectedPhotographer?.name,
          totalPrice: selectedPackage?.price,
          notes,
        }),
      });

      if (!emailResponse.ok) {
        console.error("Booking email notification failed");
      }
    } catch (emailError) {
      console.error("Booking email notification failed", emailError);
    }

    setBookingSuccessDetails({
      bookingDate,
      bookingTime,
      packageTitle: selectedPackage?.title || bt.noPackage,
      totalAmount: selectedPackage.price,
      depositAmount: selectedDepositAmount,
      currency: selectedCurrency,
      interiorName: selectedInterior?.name || bt.noInterior,
      photographerName: selectedPhotographer?.name || bt.noPhotographer,
    });
    setSuccessMessage(bt.success);
    setBookingDate("");
    setBookingTime("");
    setNotes("");
    setBookedTimes([]);
    setIsSubmitting(false);
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
      `${bt.time}: ${bookingSuccessDetails.bookingTime}`,
      `${bt.package}: ${bookingSuccessDetails.packageTitle}`,
      `${bt.totalAmount}: ${formatPrice(bookingSuccessDetails.totalAmount, bookingSuccessDetails.currency)}`,
      `${bt.depositAmount}: ${formatPrice(bookingSuccessDetails.depositAmount, bookingSuccessDetails.currency)}`,
      `${bt.payment}: ${bt.paymentNotRequired}`,
      `${bt.interior}: ${bookingSuccessDetails.interiorName}`,
      `${bt.photographer}: ${bookingSuccessDetails.photographerName}`,
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

  return (
    <main className="min-h-screen bg-[#F7F1EA] px-5 py-24 text-[#2B1A12]">
      <section className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex justify-end">
          <div className="inline-flex rounded-full border border-[#E5D5C8] bg-white/70 p-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7A6252] shadow-[0_12px_30px_rgba(83,54,37,0.10)]">
            {(["uk", "pl"] as BookingLanguage[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => changeLang(item)}
                className={`rounded-full px-4 py-2 transition ${
                  lang === item
                    ? "bg-[#2B1A12] text-[#F7F1EA]"
                    : "hover:bg-[#F7F1EA] hover:text-[#2B1A12]"
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
          className="mb-10 text-center"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#A67C52]">
            {bt.privateBooking}
          </p>

          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#2B1A12] sm:text-6xl">
            {bt.title}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#7A6252] sm:text-base">
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
          className="rounded-[36px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_24px_90px_rgba(83,54,37,0.14)] backdrop-blur-xl sm:p-10"
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
                    {bt.paymentNotRequired}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                    {bt.dateAndTime}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#2B1A12]">
                    {bookingSuccessDetails.bookingDate} в{" "}
                    {bookingSuccessDetails.bookingTime}
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
                      {formatPrice(bookingSuccessDetails.totalAmount, bookingSuccessDetails.currency)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                      {bt.depositAmount}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#2B1A12]">
                      {formatPrice(bookingSuccessDetails.depositAmount, bookingSuccessDetails.currency)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                      {bt.interior}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#2B1A12]">
                      {bookingSuccessDetails.interiorName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                      {bt.photographer}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#2B1A12]">
                      {bookingSuccessDetails.photographerName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col items-center gap-3">
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
                  onClick={() => router.push("/dashboard")}
                  className="rounded-full bg-[#2B1A12] px-6 py-4 text-xs font-medium uppercase tracking-[0.16em] text-[#F7F1EA] shadow-[0_16px_34px_rgba(43,26,18,0.20)] transition hover:bg-[#4A2D1E]"
                >
                  {bt.goDashboard}
                </button>

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
                          {formatPrice(item.price, item.currency || defaultCurrency)}
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

                <div>
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[#A67C52]">
                      {bt.step02}
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                      {bt.chooseInterior}
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    {interiors.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedInteriorId(item.id)}
                        className={`overflow-hidden rounded-[28px] border text-left transition ${
                          selectedInteriorId === item.id
                            ? "border-[#2B1A12] bg-[#2B1A12] text-[#F7F1EA] shadow-[0_18px_50px_rgba(43,26,18,0.20)]"
                            : "border-[#E5D5C8] bg-white/80 text-[#2B1A12] hover:border-[#A67C52]"
                        }`}
                      >
                        {getInteriorImage(item) && (
                          <div className="h-36 overflow-hidden bg-[#E5D5C8]">
                            <img
                              src={getInteriorImage(item)}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}

                        <div className="p-5">
                          <p className="text-lg font-semibold tracking-[-0.03em]">
                            {item.name}
                          </p>

                          {getInteriorDescription(item) && (
                            <p
                              className={`mt-3 text-sm leading-6 ${
                                selectedInteriorId === item.id
                                  ? "text-[#E8D8CC]"
                                  : "text-[#7A6252]"
                              }`}
                            >
                              {getInteriorDescription(item)}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

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

                  {isLoadingSlots && (
                    <p className="mb-3 text-sm text-[#7A6252]">
                      {bt.checkingSlots}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {workingHours.map((time) => {
                      const isBooked = bookedTimes.includes(time);
                      const isPastTimeToday = getIsPastTimeForToday(time);
                      const isSelected = bookingTime === time;

                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={
                            isBooked ||
                            isPastTimeToday ||
                            isLoadingSlots ||
                            !bookingDate
                          }
                          onClick={() => {
                            setBookingTime(time);
                            setErrorMessage("");
                          }}
                          className={`rounded-2xl border px-4 py-4 text-sm font-medium tracking-[0.08em] transition ${
                            isBooked || isPastTimeToday
                              ? "cursor-not-allowed border-[#D8C4B3] bg-[#E8D8CC]/70 text-[#9C8778] opacity-70"
                              : isSelected
                                ? "border-[#2B1A12] bg-[#2B1A12] text-[#F7F1EA] shadow-[0_16px_34px_rgba(43,26,18,0.18)]"
                                : "border-[#D8C4B3] bg-white/80 text-[#2B1A12] hover:border-[#A67C52] hover:bg-[#FFFDFB]"
                          }`}
                        >
                          <span
                            className={
                              isBooked || isPastTimeToday ? "line-through" : ""
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
                        {bookingTime || bt.noTime}
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
                          ? formatPrice(selectedPackage.price, selectedCurrency)
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
                        {bt.paymentNotRequired}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#E5D5C8] bg-white/70 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                        {bt.interior}
                      </p>
                      <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                        {selectedInterior?.name || bt.noInterior}
                      </p>
                    </div>

                  </div>

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
