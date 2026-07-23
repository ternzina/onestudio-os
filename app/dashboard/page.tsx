"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Lang = "uk" | "pl";

type ClientProfile = {
  name: string | null;
  phone: string | null;
  email: string | null;
  role: string | null;
};

type ClientBooking = {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_price: number | null;
  payment_status: string | null;
  payment_provider: string | null;
  deposit_amount: number | null;
  total_amount: number | null;
  currency: string | null;
  paid_at: string | null;
  notes: string | null;
  contacted_client: boolean;
  contacted_at: string | null;
  created_at: string;
  packages: {
    title: string;
    price: number;
  } | null;
  interiors: {
    name: string;
  } | null;
  team: {
    name: string;
    position: string | null;
  } | null;
};

const dashboardText = {
  uk: {
    eyebrow: "Мій розклад",
    title: "Мої найближчі зйомки",
    description:
      "Найближчі записи показуються першими. Тут можна переглянути деталі бронювання та скасувати заявку, якщо плани змінилися.",
    stats: {
      total: "Усього заявок",
      pending: "Очікують відповіді",
      cancelled: "Скасовано",
    },
    profile: {
      eyebrow: "Профіль",
      title: "Мої дані",
      description:
        "Ці контакти бачить студія у заявці на зйомку. Ім’я та телефон можна оновити тут, а email використовується для входу.",
      edit: "Редагувати дані",
      name: "Ім’я",
      phone: "Телефон",
      email: "Email",
      missingName: "Ім’я не вказано",
      missingPhone: "Телефон не вказано",
      missingEmail: "Email не вказано",
      namePlaceholder: "Ваше ім’я",
      emailNote:
        "Email використовується для входу, тому тут він тільки відображається.",
      saving: "Зберігаємо...",
      save: "Зберегти",
      cancel: "Скасувати",
      saved: "Дані оновлено",
      userError: "Не вдалося визначити користувача",
      nameError: "Введіть ім’я",
      phoneError: "Введіть телефон",
    },
    bookings: {
      eyebrow: "Бронювання",
      title: "Мої бронювання",
      refresh: "Оновити",
      refreshing: "Оновлюємо...",
      loading: "Завантажуємо бронювання...",
      emptyTitle: "У вас поки немає бронювань",
      emptyDescription:
        "Оберіть пакет, інтер’єр, фотографа та зручний час, щоб створити першу заявку.",
      status: "Статус",
      newRequest: "Нова заявка",
      commentSent: "Коментар надіслано",
      package: "Пакет",
      price: "Ціна",
      interior: "Інтер’єр",
      photographer: "Фотограф",
      payment: "Оплата",
      deposit: "Передоплата",
      created: "Заявку створено",
      copy: "Скопіювати деталі",
      copied: "Деталі скопійовано",
      copyError: "Не вдалося скопіювати деталі заявки",
      cancelling: "Скасовуємо...",
      cancelBooking: "Скасувати бронювання",
      cancelledBooking: "Бронювання скасовано",
      notSelected: "Не обрано",
      noPrice: "Ціну не вказано",
      copiedTitle: "Sisters Photo Studio",
      copyLines: {
        date: "Дата зйомки",
        time: "Час",
        status: "Статус",
        payment: "Оплата",
        package: "Пакет",
        price: "Ціна",
        interior: "Інтер’єр",
        photographer: "Фотограф",
        created: "Заявку створено",
        contact: "Зв’язок зі студією",
        comment: "Коментар",
      },
    },
    statusLabels: {
      pending: "Очікує підтвердження",
      confirmed: "Підтверджено",
      cancelled: "Скасовано",
      unknown: "Невідомий статус",
    },
    statusDescriptions: {
      pending: "Заявку отримано. Студія скоро зв’яжеться з вами.",
      confirmed: "Зйомку підтверджено. Чекаємо на вас у студії.",
      cancelled: "Це бронювання скасовано.",
      unknown: "Статус бронювання уточнюється.",
    },
    contact: {
      contactedWithDate: "Студія вже зв’язалася з вами:",
      contacted: "Студія вже зв’язалася з вами.",
      notNeeded: "За цією заявкою зв’язок більше не потрібен.",
      waiting:
        "Студія скоро зв’яжеться з вами для уточнення деталей.",
      labelContacted: "Студія зв’язалася",
      labelNotNeeded: "Зв’язок не потрібен",
      labelWaiting: "Очікуйте зв’язку",
    },
    payment: {
      paid: "Оплачено",
      pending: "Очікує оплату",
      cancelled: "Оплату скасовано",
      refunded: "Повернення оформлено",
      notRequired: "Оплата поки не потрібна",
    },
  },
  pl: {
    eyebrow: "Mój harmonogram",
    title: "Moje najbliższe sesje",
    description:
      "Najbliższe rezerwacje wyświetlają się jako pierwsze. Tutaj możesz sprawdzić szczegóły rezerwacji i anulować zgłoszenie, jeśli plany się zmieniły.",
    stats: {
      total: "Wszystkie zgłoszenia",
      pending: "Oczekują na odpowiedź",
      cancelled: "Anulowane",
    },
    profile: {
      eyebrow: "Profil",
      title: "Moje dane",
      description:
        "Te dane kontaktowe widzi studio w zgłoszeniu na sesję. Imię i telefon możesz zaktualizować tutaj, a email służy do logowania.",
      edit: "Edytuj dane",
      name: "Imię",
      phone: "Telefon",
      email: "Email",
      missingName: "Imię nie podane",
      missingPhone: "Telefon nie podany",
      missingEmail: "Email nie podany",
      namePlaceholder: "Twoje imię",
      emailNote:
        "Email służy do logowania, dlatego tutaj jest tylko wyświetlany.",
      saving: "Zapisujemy...",
      save: "Zapisz",
      cancel: "Anuluj",
      saved: "Dane zostały zaktualizowane",
      userError: "Nie udało się określić użytkownika",
      nameError: "Wpisz imię",
      phoneError: "Wpisz telefon",
    },
    bookings: {
      eyebrow: "Rezerwacje",
      title: "Moje rezerwacje",
      refresh: "Odśwież",
      refreshing: "Odświeżamy...",
      loading: "Ładujemy rezerwacje...",
      emptyTitle: "Nie masz jeszcze rezerwacji",
      emptyDescription:
        "Wybierz pakiet, wnętrze, fotografa i dogodny termin, aby utworzyć pierwsze zgłoszenie.",
      status: "Status",
      newRequest: "Nowe zgłoszenie",
      commentSent: "Komentarz wysłany",
      package: "Pakiet",
      price: "Cena",
      interior: "Wnętrze",
      photographer: "Fotograf",
      payment: "Płatność",
      deposit: "Zaliczka",
      created: "Zgłoszenie utworzono",
      copy: "Skopiuj szczegóły",
      copied: "Szczegóły skopiowane",
      copyError: "Nie udało się skopiować szczegółów zgłoszenia",
      cancelling: "Anulujemy...",
      cancelBooking: "Anuluj rezerwację",
      cancelledBooking: "Rezerwacja anulowana",
      notSelected: "Nie wybrano",
      noPrice: "Cena nie podana",
      copiedTitle: "Sisters Photo Studio",
      copyLines: {
        date: "Data sesji",
        time: "Godzina",
        status: "Status",
        payment: "Płatność",
        package: "Pakiet",
        price: "Cena",
        interior: "Wnętrze",
        photographer: "Fotograf",
        created: "Zgłoszenie utworzono",
        contact: "Kontakt ze studiem",
        comment: "Komentarz",
      },
    },
    statusLabels: {
      pending: "Oczekuje na potwierdzenie",
      confirmed: "Potwierdzone",
      cancelled: "Anulowane",
      unknown: "Nieznany status",
    },
    statusDescriptions: {
      pending: "Zgłoszenie zostało przyjęte. Studio wkrótce się z Tobą skontaktuje.",
      confirmed: "Sesja została potwierdzona. Czekamy na Ciebie w studio.",
      cancelled: "Ta rezerwacja została anulowana.",
      unknown: "Status rezerwacji jest doprecyzowywany.",
    },
    contact: {
      contactedWithDate: "Studio już skontaktowało się z Tobą:",
      contacted: "Studio już skontaktowało się z Tobą.",
      notNeeded: "Dla tego zgłoszenia kontakt nie jest już potrzebny.",
      waiting:
        "Studio wkrótce skontaktuje się z Tobą, aby doprecyzować szczegóły.",
      labelContacted: "Studio się skontaktowało",
      labelNotNeeded: "Kontakt niepotrzebny",
      labelWaiting: "Oczekuj kontaktu",
    },
    payment: {
      paid: "Opłacono",
      pending: "Oczekuje na płatność",
      cancelled: "Płatność anulowana",
      refunded: "Zwrot wykonany",
      notRequired: "Płatność nie jest jeszcze wymagana",
    },
  },
} as const;

export default function DashboardPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("uk");
  const t = dashboardText[lang];

  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [bookings, setBookings] = useState<ClientBooking[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [profileSuccessMessage, setProfileSuccessMessage] = useState("");
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(
    null,
  );
  const [copiedBookingId, setCopiedBookingId] = useState<string | null>(null);

  useEffect(() => {
    const savedLang = window.localStorage.getItem("sisters-language");

    if (savedLang === "uk" || savedLang === "pl") {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLanguageChange = (nextLang: Lang) => {
    setLang(nextLang);
    window.localStorage.setItem("sisters-language", nextLang);
  };

  async function loadDashboard() {
    setIsLoading(true);
    setErrorMessage("");
    setProfileSuccessMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setIsLoading(false);
      router.replace("/login");
      return;
    }

    setUserId(session.user.id);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("name, phone, email, role")
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      setErrorMessage(profileError.message);
      setIsLoading(false);
      return;
    }

    setProfile(profileData);
    setEditName(profileData?.name || "");
    setEditPhone(profileData?.phone || "");

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        booking_date,
        booking_time,
        status,
        total_price,
        payment_status,
        payment_provider,
        deposit_amount,
        total_amount,
        currency,
        paid_at,
        notes,
        contacted_client,
        contacted_at,
        created_at,
        packages (
          title,
          price
        ),
        interiors (
          name
        ),
        team (
          name,
          position
        )
      `,
      )
      .eq("user_id", session.user.id)
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    const normalizedBookings = (data || []).map(
      (booking) => ({
        ...booking,
        packages: Array.isArray(booking.packages)
          ? booking.packages[0] || null
          : booking.packages || null,
        interiors: Array.isArray(booking.interiors)
          ? booking.interiors[0] || null
          : booking.interiors || null,
        team: Array.isArray(booking.team)
          ? booking.team[0] || null
          : booking.team || null,
      }),
    ) as ClientBooking[];

    setBookings(normalizedBookings);
    setIsLoading(false);
  }

  const handleStartEditingProfile = () => {
    setEditName(profile?.name || "");
    setEditPhone(profile?.phone || "");
    setProfileSuccessMessage("");
    setErrorMessage("");
    setIsEditingProfile(true);
  };

  const handleCancelEditingProfile = () => {
    setEditName(profile?.name || "");
    setEditPhone(profile?.phone || "");
    setProfileSuccessMessage("");
    setErrorMessage("");
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setErrorMessage("");
    setProfileSuccessMessage("");

    const cleanName = editName.trim();
    const cleanPhone = editPhone.trim();

    if (!userId) {
      setErrorMessage(t.profile.userError);
      setIsSavingProfile(false);
      return;
    }

    if (!cleanName) {
      setErrorMessage(t.profile.nameError);
      setIsSavingProfile(false);
      return;
    }

    if (!cleanPhone) {
      setErrorMessage(t.profile.phoneError);
      setIsSavingProfile(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        name: cleanName,
        phone: cleanPhone,
      })
      .eq("id", userId);

    if (error) {
      setErrorMessage(error.message);
      setIsSavingProfile(false);
      return;
    }

    setProfile((currentProfile) => ({
      name: cleanName,
      phone: cleanPhone,
      email: currentProfile?.email || null,
      role: currentProfile?.role || "client",
    }));

    setProfileSuccessMessage(t.profile.saved);
    setIsEditingProfile(false);
    setIsSavingProfile(false);
  };

  const handleCancelBooking = async (bookingId: string) => {
    setUpdatingBookingId(bookingId);
    setErrorMessage("");

    const { error } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
      })
      .eq("id", bookingId);

    if (error) {
      setErrorMessage(error.message);
      setUpdatingBookingId(null);
      return;
    }

    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status: "cancelled",
            }
          : booking,
      ),
    );

    setUpdatingBookingId(null);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(lang === "pl" ? "pl-PL" : "uk-UA", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString(lang === "pl" ? "pl-PL" : "uk-UA", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const formatPrice = (price: number | null, currency = "PLN") => {
    if (price === null) return t.bookings.noPrice;

    return `${new Intl.NumberFormat(lang === "pl" ? "pl-PL" : "uk-UA").format(
      price,
    )} ${currency}`;
  };

  const getBookingTotalAmount = (booking: ClientBooking) => {
    return booking.total_amount ?? booking.total_price ?? booking.packages?.price ?? null;
  };

  const getBookingCurrency = (booking: ClientBooking) => {
    return booking.currency || "PLN";
  };

  const buildBookingCopyText = (booking: ClientBooking) => {
    const lines = [
      t.bookings.copiedTitle,
      `${t.bookings.copyLines.date}: ${formatDate(booking.booking_date)}`,
      `${t.bookings.copyLines.time}: ${formatTime(booking.booking_time)}`,
      `${t.bookings.copyLines.status}: ${getStatusLabel(booking.status)}`,
      `${t.bookings.copyLines.payment}: ${getPaymentStatusLabel(
        booking.payment_status,
      )}`,
      `${t.bookings.copyLines.package}: ${
        booking.packages?.title || t.bookings.notSelected
      }`,
      `${t.bookings.copyLines.price}: ${formatPrice(
        getBookingTotalAmount(booking),
        getBookingCurrency(booking),
      )}`,
      `${t.bookings.copyLines.interior}: ${
        booking.interiors?.name || t.bookings.notSelected
      }`,
      `${t.bookings.copyLines.photographer}: ${
        booking.team?.name || t.bookings.notSelected
      }`,
      `${t.bookings.copyLines.created}: ${formatDate(booking.created_at)}`,
      `${t.bookings.copyLines.contact}: ${getContactDescription(booking)}`,
    ];

    if (booking.notes) {
      lines.push(`${t.bookings.copyLines.comment}: ${booking.notes}`);
    }

    return lines.join("\n");
  };

  const handleCopyBookingDetails = async (booking: ClientBooking) => {
    setErrorMessage("");

    try {
      await navigator.clipboard.writeText(buildBookingCopyText(booking));
      setCopiedBookingId(booking.id);

      window.setTimeout(() => {
        setCopiedBookingId((currentBookingId) =>
          currentBookingId === booking.id ? null : currentBookingId,
        );
      }, 2500);
    } catch {
      setErrorMessage(t.bookings.copyError);
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "pending") return t.statusLabels.pending;
    if (status === "confirmed") return t.statusLabels.confirmed;
    if (status === "cancelled") return t.statusLabels.cancelled;

    return t.statusLabels.unknown;
  };

  const getStatusDescription = (status: string) => {
    if (status === "pending") return t.statusDescriptions.pending;
    if (status === "confirmed") return t.statusDescriptions.confirmed;
    if (status === "cancelled") return t.statusDescriptions.cancelled;

    return t.statusDescriptions.unknown;
  };

  const getContactDescription = (booking: ClientBooking) => {
    if (booking.contacted_client && booking.contacted_at) {
      return `${t.contact.contactedWithDate} ${formatDateTime(
        booking.contacted_at,
      )}.`;
    }

    if (booking.contacted_client) return t.contact.contacted;

    if (booking.status === "cancelled") return t.contact.notNeeded;

    return t.contact.waiting;
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === "confirmed") {
      return "border-[#BFD8B8] bg-[#EAF5E7] text-[#3F6B3D]";
    }

    if (status === "cancelled") {
      return "border-[#E2BABA] bg-[#F6E3E3] text-[#8A3A3A]";
    }

    if (status === "pending") {
      return "border-[#E6CFA8] bg-[#FFF4DD] text-[#7A5528]";
    }

    return "border-[#D8C4B3] bg-[#F7F1EA] text-[#7A6252]";
  };

  const getContactBadgeClass = (booking: ClientBooking) => {
    if (booking.contacted_client) {
      return "border-[#BFD8B8] bg-[#EAF5E7] text-[#3F6B3D]";
    }

    if (booking.status === "cancelled") {
      return "border-[#D8C4B3] bg-[#F2E8DF] text-[#7A6252]";
    }

    return "border-[#E6CFA8] bg-[#FFF4DD] text-[#7A5528]";
  };

  const getContactLabel = (booking: ClientBooking) => {
    if (booking.contacted_client) return t.contact.labelContacted;
    if (booking.status === "cancelled") return t.contact.labelNotNeeded;

    return t.contact.labelWaiting;
  };

  const getPaymentStatusLabel = (paymentStatus: string | null) => {
    if (paymentStatus === "paid") return t.payment.paid;
    if (paymentStatus === "pending_payment") return t.payment.pending;
    if (paymentStatus === "cancelled") return t.payment.cancelled;
    if (paymentStatus === "refunded") return t.payment.refunded;

    return t.payment.notRequired;
  };

  const getPaymentBadgeClass = (paymentStatus: string | null) => {
    if (paymentStatus === "paid") {
      return "border-[#BFD8B8] bg-[#EAF5E7] text-[#3F6B3D]";
    }

    if (paymentStatus === "pending_payment") {
      return "border-[#E6CFA8] bg-[#FFF4DD] text-[#7A5528]";
    }

    if (paymentStatus === "cancelled" || paymentStatus === "refunded") {
      return "border-[#E2BABA] bg-[#F6E3E3] text-[#8A3A3A]";
    }

    return "border-[#D8C4B3] bg-[#F2E8DF] text-[#7A6252]";
  };

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending",
  ).length;
  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "cancelled",
  ).length;

  return (
    <main className="min-h-screen bg-[#F7F1EA] px-5 py-24 text-[#2B1A12]">
      <section className="mx-auto w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mb-10"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-[0.28em] text-[#A67C52]">
              {t.eyebrow}
            </p>

            <div className="flex rounded-full border border-[#D8C4B3] bg-white/70 p-1 text-xs font-medium uppercase tracking-[0.12em] text-[#7A6252]">
              {(["uk", "pl"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleLanguageChange(item)}
                  className={`rounded-full px-3 py-2 transition ${
                    lang === item
                      ? "bg-[#2B1A12] text-[#F7F1EA]"
                      : "hover:text-[#2B1A12]"
                  }`}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[#2B1A12] sm:text-6xl">
            {t.title}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#7A6252] sm:text-base">
            {t.description}
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-[28px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_18px_60px_rgba(83,54,37,0.10)] backdrop-blur-xl">
            <p className="text-sm text-[#7A6252]">{t.stats.total}</p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
              {totalBookings}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_18px_60px_rgba(83,54,37,0.10)] backdrop-blur-xl">
            <p className="text-sm text-[#7A6252]">{t.stats.pending}</p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
              {pendingBookings}
            </p>
          </div>

          <div className="rounded-[28px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_18px_60px_rgba(83,54,37,0.10)] backdrop-blur-xl">
            <p className="text-sm text-[#7A6252]">{t.stats.cancelled}</p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.04em]">
              {cancelledBookings}
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-8 rounded-[32px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_18px_60px_rgba(83,54,37,0.10)] backdrop-blur-xl sm:p-7"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#A67C52]">
                {t.profile.eyebrow}
              </p>

              <h2 className="text-2xl font-semibold tracking-[-0.04em]">
                {t.profile.title}
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-[#7A6252]">
                {t.profile.description}
              </p>

              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={handleStartEditingProfile}
                  className="mt-5 rounded-full border border-[#D8C4B3] bg-white/80 px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
                >
                  {t.profile.edit}
                </button>
              )}
            </div>

            {!isEditingProfile && (
              <div className="grid gap-3 lg:min-w-[360px]">
                <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                    {t.profile.name}
                  </p>

                  <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                    {profile?.name || t.profile.missingName}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                    {t.profile.phone}
                  </p>

                  <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                    {profile?.phone || t.profile.missingPhone}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                    {t.profile.email}
                  </p>

                  <p className="mt-2 break-all text-sm font-medium text-[#2B1A12]">
                    {profile?.email || t.profile.missingEmail}
                  </p>
                </div>
              </div>
            )}

            {isEditingProfile && (
              <div className="grid gap-4 lg:min-w-[420px]">
                <div>
                  <label
                    htmlFor="edit-name"
                    className="mb-2 block text-sm font-medium text-[#6E5748]"
                  >
                    {t.profile.name}
                  </label>

                  <input
                    id="edit-name"
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    placeholder={t.profile.namePlaceholder}
                    className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-phone"
                    className="mb-2 block text-sm font-medium text-[#6E5748]"
                  >
                    {t.profile.phone}
                  </label>

                  <input
                    id="edit-phone"
                    type="tel"
                    value={editPhone}
                    onChange={(event) => setEditPhone(event.target.value)}
                    placeholder="+48 000 000 000"
                    className="w-full rounded-2xl border border-[#D8C4B3] bg-white/80 px-4 py-3 text-[#2B1A12] outline-none transition placeholder:text-[#B8A292] focus:border-[#A67C52] focus:ring-2 focus:ring-[#A67C52]/20"
                  />
                </div>

                <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                    {t.profile.email}
                  </p>

                  <p className="mt-2 break-all text-sm font-medium text-[#2B1A12]">
                    {profile?.email || t.profile.missingEmail}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#7A6252]">
                    {t.profile.emailNote}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="rounded-full bg-[#2B1A12] px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#F7F1EA] shadow-[0_14px_34px_rgba(43,26,18,0.20)] transition hover:bg-[#4A2D1E] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingProfile ? t.profile.saving : t.profile.save}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelEditingProfile}
                    disabled={isSavingProfile}
                    className="rounded-full border border-[#D8C4B3] bg-white/80 px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {t.profile.cancel}
                  </button>
                </div>
              </div>
            )}
          </div>

          {profileSuccessMessage && (
            <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800">
              {profileSuccessMessage}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.18,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-8 rounded-[36px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_24px_90px_rgba(83,54,37,0.12)] backdrop-blur-xl sm:p-8"
        >
          <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.24em] text-[#A67C52]">
                {t.bookings.eyebrow}
              </p>

              <h2 className="text-2xl font-semibold tracking-[-0.04em]">
                {t.bookings.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
              disabled={isLoading}
              className="w-fit rounded-full border border-[#D8C4B3] bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? t.bookings.refreshing : t.bookings.refresh}
            </button>
          </div>

          {isLoading && (
            <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 px-5 py-5 text-sm text-[#7A6252]">
              {t.bookings.loading}
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-5 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && bookings.length === 0 && (
            <div className="rounded-[28px] border border-dashed border-[#D8C4B3] bg-[#F7F1EA]/70 px-6 py-10 text-center">
              <p className="text-lg font-medium text-[#2B1A12]">
                {t.bookings.emptyTitle}
              </p>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7A6252]">
                {t.bookings.emptyDescription}
              </p>
            </div>
          )}

          {!isLoading && bookings.length > 0 && (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`rounded-[28px] border p-5 shadow-[0_14px_40px_rgba(83,54,37,0.08)] ${
                    booking.status === "cancelled"
                      ? "border-[#E5D5C8] bg-[#F2E8DF]/70 opacity-75"
                      : "border-[#E5D5C8] bg-[#FFFDFB]/80"
                  }`}
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xl font-semibold tracking-[-0.03em] text-[#2B1A12]">
                            {formatDate(booking.booking_date)}{" "}
                            {lang === "pl" ? "o" : "о"}{" "}
                            {formatTime(booking.booking_time)}
                          </p>

                          <p className="mt-2 text-sm text-[#7A6252]">
                            {t.bookings.status}: {getStatusLabel(booking.status)}
                          </p>

                          <p className="mt-2 max-w-xl text-sm leading-6 text-[#8A5A36]">
                            {getStatusDescription(booking.status)}
                          </p>

                          <div
                            className={`mt-4 max-w-xl rounded-2xl border px-4 py-3 text-sm leading-6 ${getContactBadgeClass(
                              booking,
                            )}`}
                          >
                            {getContactDescription(booking)}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {booking.status === "pending" &&
                            !booking.contacted_client && (
                              <div className="w-fit rounded-full border border-[#E6CFA8] bg-[#FFF4DD] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7A5528]">
                                {t.bookings.newRequest}
                              </div>
                            )}

                          {booking.notes?.trim() && (
                            <div className="w-fit rounded-full border border-[#E6CFA8] bg-[#FFF4DD] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#7A5528]">
                              {t.bookings.commentSent}
                            </div>
                          )}

                          <div
                            className={`w-fit rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] ${getStatusBadgeClass(
                              booking.status,
                            )}`}
                          >
                            {getStatusLabel(booking.status)}
                          </div>

                          <div
                            className={`w-fit rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] ${getContactBadgeClass(
                              booking,
                            )}`}
                          >
                            {getContactLabel(booking)}
                          </div>

                          <div
                            className={`w-fit rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] ${getPaymentBadgeClass(
                              booking.payment_status,
                            )}`}
                          >
                            {getPaymentStatusLabel(booking.payment_status)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                        <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                            {t.bookings.package}
                          </p>

                          <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                            {booking.packages?.title || t.bookings.notSelected}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                            {t.bookings.price}
                          </p>

                          <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                            {formatPrice(
                              getBookingTotalAmount(booking),
                              getBookingCurrency(booking),
                            )}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                            {t.bookings.interior}
                          </p>

                          <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                            {booking.interiors?.name || t.bookings.notSelected}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                            {t.bookings.photographer}
                          </p>

                          <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                            {booking.team?.name || t.bookings.notSelected}
                          </p>

                          {booking.team?.position && (
                            <p className="mt-1 text-xs text-[#7A6252]">
                              {booking.team.position}
                            </p>
                          )}
                        </div>

                        <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                            {t.bookings.payment}
                          </p>

                          <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                            {getPaymentStatusLabel(booking.payment_status)}
                          </p>

                          {booking.deposit_amount !== null && (
                            <p className="mt-1 text-xs text-[#7A6252]">
                              {t.bookings.deposit}:{" "}
                              {formatPrice(
                                booking.deposit_amount,
                                getBookingCurrency(booking),
                              )}
                            </p>
                          )}
                        </div>

                        <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                            {t.bookings.created}
                          </p>

                          <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                            {formatDate(booking.created_at)}
                          </p>
                        </div>
                      </div>

                      {booking.notes && (
                        <p className="mt-5 max-w-3xl rounded-2xl bg-white/70 p-4 text-sm leading-6 text-[#6E5748]">
                          {booking.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 lg:w-52">
                      <button
                        type="button"
                        onClick={() => handleCopyBookingDetails(booking)}
                        className="rounded-full border border-[#D8C4B3] bg-white/80 px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:border-[#2B1A12] hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
                      >
                        {t.bookings.copy}
                      </button>

                      {copiedBookingId === booking.id && (
                        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center text-xs font-medium uppercase tracking-[0.14em] text-green-800">
                          {t.bookings.copied}
                        </div>
                      )}

                      {(booking.status === "pending" ||
                        booking.status === "confirmed") && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={updatingBookingId === booking.id}
                          className="rounded-full border border-[#D8C4B3] bg-white/80 px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#8A5A36] transition hover:border-[#2B1A12] hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingBookingId === booking.id
                            ? t.bookings.cancelling
                            : t.bookings.cancelBooking}
                        </button>
                      )}

                      {booking.status === "cancelled" && (
                        <div className="rounded-2xl border border-[#D8C4B3] bg-[#F2E8DF] px-4 py-3 text-center text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252]">
                          {t.bookings.cancelledBooking}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </section>
    </main>
  );
}
