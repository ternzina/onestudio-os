"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import BookingStats from "./components/BookingStats";
import BookingFilters from "./components/BookingFilters";
import BookingTabs from "./components/BookingTabs";
import PixoverGalleryPanel from "./components/PixoverGalleryPanel";

type BookingStatusFilter = "all" | "pending" | "confirmed" | "cancelled";
type BookingDateFilter = "all" | "today" | "future" | "past";
type BookingContactFilter = "all" | "not_contacted" | "contacted";
type BookingKindFilter = "all" | "photo" | "rental";
type BookingKind = "photo" | "rental";
type AdminPanelSection = "bookings" | "settings";

type AdminBooking = {
  id: string;
  booking_kind: BookingKind;
  user_id: string | null;
  booking_date: string;
  booking_time: string;
  status: string;
  total_price: number | null;
  payment_status: string | null;
  payment_provider: string | null;
  payment_id: string | null;
  deposit_amount: number | null;
  total_amount: number | null;
  currency: string | null;
  paid_at: string | null;
  notes: string | null;
  selected_addons: { id?: string; title: string; price: number }[];
  contacted_client: boolean;
  contacted_at: string | null;
  created_at: string;
  reminder_sent_at: string | null;
  client_name: string | null;
  client_phone: string | null;
  client_email: string | null;
  profiles: {
    name: string | null;
    phone: string | null;
    email: string | null;
    role: string | null;
  } | null;
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
  rental_order_id: string | null;
  rental_items: {
    id: string;
    rental_resource: string;
    booking_time: string;
    end_time: string | null;
    duration_hours: number;
    price_per_hour: number;
    total_price: number;
  }[];
};

const statusFilters: {
  value: BookingStatusFilter;
  label: string;
}[] = [
  { value: "all", label: "Все" },
  { value: "pending", label: "Ожидают" },
  { value: "confirmed", label: "Подтверждено" },
  { value: "cancelled", label: "Отменено" },
];

const dateFilters: {
  value: BookingDateFilter;
  label: string;
}[] = [
  { value: "all", label: "Все даты" },
  { value: "today", label: "Сегодня" },
  { value: "future", label: "Будущие" },
  { value: "past", label: "Прошедшие" },
];

const contactFilters: {
  value: BookingContactFilter;
  label: string;
}[] = [
  { value: "all", label: "Все" },
  { value: "not_contacted", label: "Не связались" },
  { value: "contacted", label: "Связались" },
];

const bookingKindFilters: {
  value: BookingKindFilter;
  label: string;
}[] = [
  { value: "all", label: "Все брони" },
  { value: "photo", label: "Фотосессии" },
  { value: "rental", label: "Аренда студии" },
];

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function AdminBookingsPage() {
  const router = useRouter();
  const todayDate = useMemo(() => getTodayDateString(), []);

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [activeStatusFilter, setActiveStatusFilter] =
    useState<BookingStatusFilter>("all");
  const [activeDateFilter, setActiveDateFilter] =
    useState<BookingDateFilter>("all");
  const [activeContactFilter, setActiveContactFilter] =
    useState<BookingContactFilter>("all");
  const [activeKindFilter, setActiveKindFilter] =
    useState<BookingKindFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isChecking, setIsChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(
    null,
  );
  const [updatingContactedId, setUpdatingContactedId] = useState<string | null>(
    null,
  );
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(
    null,
  );
  const [copiedContactBookingId, setCopiedContactBookingId] = useState<
    string | null
  >(null);
  const [copiedDetailsBookingId, setCopiedDetailsBookingId] = useState<
    string | null
  >(null);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesStatus =
        activeStatusFilter === "all" || booking.status === activeStatusFilter;

      const matchesDate =
        activeDateFilter === "all" ||
        (activeDateFilter === "today" && booking.booking_date === todayDate) ||
        (activeDateFilter === "future" && booking.booking_date > todayDate) ||
        (activeDateFilter === "past" && booking.booking_date < todayDate);

      const matchesContact =
        activeContactFilter === "all" ||
        (activeContactFilter === "contacted" && booking.contacted_client) ||
        (activeContactFilter === "not_contacted" && !booking.contacted_client);

      const matchesKind =
        activeKindFilter === "all" || booking.booking_kind === activeKindFilter;

      const cleanSearchQuery = searchQuery.trim().toLowerCase();
      const clientName = (
        booking.client_name ||
        booking.profiles?.name ||
        ""
      ).toLowerCase();
      const clientPhone = (
        booking.client_phone ||
        booking.profiles?.phone ||
        ""
      ).toLowerCase();
      const clientEmail = (
        booking.client_email ||
        booking.profiles?.email ||
        ""
      ).toLowerCase();

      const matchesSearch =
        !cleanSearchQuery ||
        clientName.includes(cleanSearchQuery) ||
        clientPhone.includes(cleanSearchQuery) ||
        clientEmail.includes(cleanSearchQuery);

      return (
        matchesStatus &&
        matchesDate &&
        matchesContact &&
        matchesKind &&
        matchesSearch
      );
    });
  }, [
    bookings,
    activeStatusFilter,
    activeDateFilter,
    activeContactFilter,
    activeKindFilter,
    searchQuery,
    todayDate,
  ]);

  const hasActiveFilters =
    activeDateFilter !== "all" ||
    activeStatusFilter !== "all" ||
    activeContactFilter !== "all" ||
    activeKindFilter !== "all" ||
    searchQuery.trim().length > 0;

  useEffect(() => {
    loadAdminPage();
  }, []);

  const handleAdminSectionChange = (section: AdminPanelSection) => {
    if (section === "settings") {
      router.push("/admin/settings");
      return;
    }

    router.push("/admin/bookings");
  };

  const handleResetFilters = () => {
    setActiveDateFilter("all");
    setActiveStatusFilter("all");
    setActiveContactFilter("all");
    setActiveKindFilter("all");
    setSearchQuery("");
  };

  async function loadAdminPage() {
    setIsChecking(true);
    setIsLoading(true);
    setErrorMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      router.replace("/login");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", session.user.id)
      .single();

    if (profileError) {
      setErrorMessage(profileError.message);
      setIsChecking(false);
      setIsLoading(false);
      return;
    }

    if (profile?.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    setIsChecking(false);

    const { data: photoBookingsData, error: photoBookingsError } =
      await supabase.from("bookings").select(`
        id,
        user_id,
        booking_date,
        booking_time,
        status,
        total_price,
        payment_status,
        payment_provider,
        payment_id,
        deposit_amount,
        total_amount,
        currency,
        paid_at,
        notes,
        selected_addons,
        contacted_client,
        contacted_at,
        created_at,
        reminder_sent_at,
        client_name,
        client_phone,
        client_email,
        profiles (
          name,
          phone,
          email,
          role
        ),
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
      `);

    if (photoBookingsError) {
      setErrorMessage(photoBookingsError.message);
      setIsLoading(false);
      return;
    }

    const { data: rentalBookingsData, error: rentalBookingsError } =
      await supabase.from("studio_bookings").select(`
        id,
        client_name,
        client_phone,
        client_email,
        booking_date,
        booking_time,
        status,
        notes,
        contacted_client,
        contacted_at,
        created_at,
        reminder_sent_at,
        rental_resource,
        duration_hours,
        end_time,
        price_per_hour,
        total_price,
        rental_order_id,
        payment_status,
        payment_provider,
        payment_id,
        currency,
        paid_at
      `);

    if (rentalBookingsError) {
      setErrorMessage(rentalBookingsError.message);
      setIsLoading(false);
      return;
    }

    const normalizedPhotoBookings = (photoBookingsData || []).map((booking) => ({
      ...booking,
      booking_kind: "photo" as const,
      selected_addons: Array.isArray(booking.selected_addons)
        ? booking.selected_addons
        : [],
      contacted_client: Boolean(booking.contacted_client),
      profiles: Array.isArray(booking.profiles)
        ? booking.profiles[0] || null
        : booking.profiles || null,
      packages: Array.isArray(booking.packages)
        ? booking.packages[0] || null
        : booking.packages || null,
      interiors: Array.isArray(booking.interiors)
        ? booking.interiors[0] || null
        : booking.interiors || null,
      team: Array.isArray(booking.team)
        ? booking.team[0] || null
        : booking.team || null,
      rental_order_id: null,
      rental_items: [],
    })) as AdminBooking[];

    const rentalRows = rentalBookingsData || [];
    const rentalGroups = new Map<string, (typeof rentalRows)[number][]>();

    for (const booking of rentalRows) {
      const groupKey = booking.rental_order_id || `legacy-${booking.id}`;
      const currentGroup = rentalGroups.get(groupKey) || [];
      currentGroup.push(booking);
      rentalGroups.set(groupKey, currentGroup);
    }

    const normalizedRentalBookings: AdminBooking[] = Array.from(
      rentalGroups.entries(),
    ).map(([, rows]) => {
      const sortedRows = [...rows].sort((firstRow, secondRow) =>
        String(firstRow.booking_time).localeCompare(
          String(secondRow.booking_time),
        ),
      );
      const firstRow = sortedRows[0];
      const totalPrice = sortedRows.reduce(
        (sum, row) => sum + Number(row.total_price || 0),
        0,
      );

      return {
        id: firstRow.rental_order_id || String(firstRow.id),
        booking_kind: "rental" as const,
        user_id: null,
        booking_date: firstRow.booking_date,
        booking_time: firstRow.booking_time,
        status: firstRow.status || "pending",
        total_price: totalPrice,
        payment_status: firstRow.payment_status || null,
        payment_provider:
          sortedRows.find((row) => row.payment_provider)?.payment_provider || null,
        payment_id:
          sortedRows.find((row) => row.payment_id)?.payment_id || null,
        deposit_amount: null,
        total_amount: totalPrice,
        currency: firstRow.currency || "PLN",
        paid_at: sortedRows.find((row) => row.paid_at)?.paid_at || null,
        notes: sortedRows.find((row) => row.notes)?.notes || null,
        selected_addons: [],
        contacted_client: sortedRows.every((row) =>
          Boolean(row.contacted_client),
        ),
        contacted_at:
          sortedRows.find((row) => row.contacted_at)?.contacted_at || null,
        created_at: firstRow.created_at,
        reminder_sent_at:
          sortedRows.find((row) => row.reminder_sent_at)?.reminder_sent_at ||
          null,
        client_name: firstRow.client_name || null,
        client_phone: firstRow.client_phone || null,
        client_email: firstRow.client_email || null,
        profiles: null,
        packages: null,
        interiors: { name: "Оренда студії" },
        team: null,
        rental_order_id: firstRow.rental_order_id || null,
        rental_items: sortedRows.map((row) => ({
          id: String(row.id),
          rental_resource: row.rental_resource || "studio",
          booking_time: row.booking_time,
          end_time: row.end_time || null,
          duration_hours: Number(row.duration_hours || 1),
          price_per_hour: Number(row.price_per_hour || 0),
          total_price: Number(row.total_price || 0),
        })),
      };
    });

    const normalizedBookings = [
      ...normalizedPhotoBookings,
      ...normalizedRentalBookings,
    ].sort((firstBooking, secondBooking) => {
      return (
        new Date(secondBooking.created_at).getTime() -
        new Date(firstBooking.created_at).getTime()
      );
    });

    setBookings(normalizedBookings);
    setIsLoading(false);
  };

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    setUpdatingBookingId(bookingId);
    setErrorMessage("");

    const currentBooking = bookings.find((booking) => booking.id === bookingId);
    const tableName =
      currentBooking?.booking_kind === "rental"
        ? "studio_bookings"
        : "bookings";

    let updateQuery = supabase.from(tableName).update({ status });

    updateQuery =
      currentBooking?.booking_kind === "rental" &&
      currentBooking.rental_order_id
        ? updateQuery.eq("rental_order_id", currentBooking.rental_order_id)
        : updateQuery.eq("id", bookingId);

    const { error } = await updateQuery;

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
              status,
            }
          : booking,
      ),
    );

    setUpdatingBookingId(null);
  };

  const handleToggleContacted = async (
    bookingId: string,
    contactedClient: boolean,
  ) => {
    setUpdatingContactedId(bookingId);
    setErrorMessage("");

    const contactedAt = contactedClient ? new Date().toISOString() : null;
    const currentBooking = bookings.find((booking) => booking.id === bookingId);
    const tableName =
      currentBooking?.booking_kind === "rental"
        ? "studio_bookings"
        : "bookings";

    let updateQuery = supabase.from(tableName).update({
      contacted_client: contactedClient,
      contacted_at: contactedAt,
    });

    updateQuery =
      currentBooking?.booking_kind === "rental" &&
      currentBooking.rental_order_id
        ? updateQuery.eq("rental_order_id", currentBooking.rental_order_id)
        : updateQuery.eq("id", bookingId);

    const { error } = await updateQuery;

    if (error) {
      setErrorMessage(error.message);
      setUpdatingContactedId(null);
      return;
    }

    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              contacted_client: contactedClient,
              contacted_at: contactedAt,
            }
          : booking,
      ),
    );

    setUpdatingContactedId(null);
  };

  const handleDeleteBooking = async (booking: AdminBooking) => {
    const clientName = getClientName(booking);
    const bookingType = getBookingKindLabel(booking);
    const confirmed = window.confirm(
      `Удалить бронь «${bookingType}» от ${clientName} на ${formatDate(
        booking.booking_date,
      )} в ${formatTime(booking.booking_time)}? Это действие нельзя отменить.`,
    );

    if (!confirmed) return;

    const deletingId = `${booking.booking_kind}-${booking.id}`;
    setDeletingBookingId(deletingId);
    setErrorMessage("");

    const tableName =
      booking.booking_kind === "rental" ? "studio_bookings" : "bookings";

    let deleteQuery = supabase.from(tableName).delete();

    deleteQuery =
      booking.booking_kind === "rental" && booking.rental_order_id
        ? deleteQuery.eq("rental_order_id", booking.rental_order_id)
        : deleteQuery.eq("id", booking.id);

    const { error } = await deleteQuery;

    if (error) {
      setErrorMessage(error.message);
      setDeletingBookingId(null);
      return;
    }

    setBookings((currentBookings) =>
      currentBookings.filter(
        (currentBooking) =>
          !(
            currentBooking.id === booking.id &&
            currentBooking.booking_kind === booking.booking_kind
          ),
      ),
    );

    setDeletingBookingId(null);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("ru-RU", {
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
    if (price === null) return "Цена не указана";

    return `${new Intl.NumberFormat("ru-RU").format(price)} ${currency}`;
  };

  const getBookingTotalAmount = (booking: AdminBooking) => {
    return (
      booking.total_amount ??
      booking.total_price ??
      booking.packages?.price ??
      null
    );
  };

  const getBookingDepositAmount = (booking: AdminBooking) => {
    return booking.deposit_amount ?? 500;
  };

  const formatPaymentAmount = (
    amount: number | null,
    currency: string | null,
  ) => {
    if (amount === null) return "Не указано";

    const paymentCurrency = currency || "PLN";

    return `${new Intl.NumberFormat("ru-RU").format(amount)} ${paymentCurrency}`;
  };

  const getPaymentStatusLabel = (paymentStatus: string | null) => {
    if (paymentStatus === "paid") return "Оплачено";
    if (paymentStatus === "pending_payment") return "Ожидает оплату";
    if (paymentStatus === "cancelled") return "Оплата отменена";
    if (paymentStatus === "refunded") return "Возврат";

    return "Оплата пока не требуется";
  };

  const getPaymentBadgeClass = (paymentStatus: string | null) => {
    if (paymentStatus === "paid") {
      return "border-green-200 bg-green-50 text-green-800";
    }

    if (paymentStatus === "pending_payment") {
      return "border-[#E6CFA8] bg-[#FFF4DD] text-[#7A5528]";
    }

    if (paymentStatus === "cancelled" || paymentStatus === "refunded") {
      return "border-[#E2BABA] bg-[#F6E3E3] text-[#8A3A3A]";
    }

    return "border-[#D8C4B3] bg-white/80 text-[#7A6252]";
  };

  const getPhoneHref = (phone: string) => {
    return `tel:${phone.replace(/[^+\d]/g, "")}`;
  };

  const getWhatsAppHref = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");

    return `https://wa.me/${cleanPhone}`;
  };

  const getClientName = (booking: AdminBooking) =>
    booking.client_name || booking.profiles?.name || "Имя не указано";

  const getClientPhone = (booking: AdminBooking) =>
    booking.client_phone || booking.profiles?.phone || "";

  const getClientEmail = (booking: AdminBooking) =>
    booking.client_email || booking.profiles?.email || "";

  const getIsPublicBooking = (booking: AdminBooking) =>
    !booking.user_id ||
    Boolean(
      booking.client_name || booking.client_phone || booking.client_email,
    );

  const getBookingSourceLabel = (booking: AdminBooking) =>
    booking.booking_kind === "rental"
      ? "Публічна бронь оренди"
      : getIsPublicBooking(booking)
        ? "Публічна бронь фотосесії"
        : "Кабінет клієнта";

  const getBookingKindLabel = (booking: AdminBooking) =>
    booking.booking_kind === "rental" ? "Оренда студії" : "Фотосесія";

  const getBookingKindBadgeClass = (booking: AdminBooking) =>
    booking.booking_kind === "rental"
      ? "border-[#C79A6B] bg-[#FFF1E3] text-[#7A4A12]"
      : "border-[#D8B4FE] bg-[#F4E8FF] text-[#5B2D82]";

  const getRentalResourceTitle = (resource: string) => {
    if (resource === "studio") return "Зал";
    if (resource === "makeup_room") return "Make-up room";

    return resource;
  };

  const getRentalSpacesLabel = (booking: AdminBooking) => {
    if (
      booking.booking_kind !== "rental" ||
      booking.rental_items.length === 0
    ) {
      return "Оренда студії";
    }

    return booking.rental_items
      .map((item) => getRentalResourceTitle(item.rental_resource))
      .join(" + ");
  };

  const getRentalItemsText = (booking: AdminBooking) =>
    booking.rental_items.map(
      (item) =>
        `${getRentalResourceTitle(item.rental_resource)}: ${formatTime(
          item.booking_time,
        )}–${formatTime(item.end_time || item.booking_time)}, ${
          item.duration_hours
        } ч., ${formatPrice(item.total_price, booking.currency || "PLN")}`,
    );

  const handleCopyClientContacts = async (booking: AdminBooking) => {
    const clientName = getClientName(booking);
    const clientPhone = getClientPhone(booking) || "Телефон не указан";
    const clientEmail = getClientEmail(booking) || "Email не указан";
    const packageTitle =
      booking.booking_kind === "rental"
        ? getRentalSpacesLabel(booking)
        : booking.packages?.title || "Пакет не выбран";

    const details = [
      "Sister's Photo Studio",
      "",
      `Тип заявки: ${getBookingSourceLabel(booking)}`,
      `Клиент: ${clientName}`,
      `Телефон: ${clientPhone}`,
      `Email: ${clientEmail}`,
      "",
      `${
        booking.booking_kind === "rental" ? "Дата аренды" : "Дата съёмки"
      }: ${formatDate(booking.booking_date)}`,
      `Время: ${formatTime(booking.booking_time)}`,
      `Пакет: ${packageTitle}`,
      ...(booking.booking_kind === "rental" ? getRentalItemsText(booking) : []),
      `Статус: ${getStatusLabel(booking.status)}`,
      `Оплата: ${getPaymentStatusLabel(booking.payment_status)}`,
    ];

    try {
      await navigator.clipboard.writeText(details.join("\n"));
      setCopiedContactBookingId(booking.id);

      window.setTimeout(() => {
        setCopiedContactBookingId((currentBookingId) =>
          currentBookingId === booking.id ? null : currentBookingId,
        );
      }, 2200);
    } catch {
      setErrorMessage("Не удалось скопировать контакты клиента");
    }
  };

  const handleCopyBookingDetails = async (booking: AdminBooking) => {
    const clientName = getClientName(booking);
    const clientPhone = getClientPhone(booking) || "Телефон не указан";
    const clientEmail = getClientEmail(booking) || "Email не указан";
    const packageTitle =
      booking.booking_kind === "rental"
        ? getRentalSpacesLabel(booking)
        : booking.packages?.title || "Пакет не выбран";
    const interiorName =
      booking.booking_kind === "rental"
        ? getRentalSpacesLabel(booking)
        : booking.interiors?.name || "Интерьер не выбран";
    const teamName =
      booking.booking_kind === "rental"
        ? "Не нужен для аренды"
        : booking.team?.name || "Фотограф не выбран";
    const contactStatus = booking.contacted_client ? "да" : "нет";
    const contactedAt = booking.contacted_at
      ? formatDateTime(booking.contacted_at)
      : "нет даты";
    const clientNotes = booking.notes || "Комментарий не указан";

    const details = [
      "Sister's Photo Studio",
      "",
      "Детали заявки",
      "",
      `Тип заявки: ${getBookingSourceLabel(booking)}`,
      `Клиент: ${clientName}`,
      `Телефон: ${clientPhone}`,
      `Email: ${clientEmail}`,
      "",
      `${
        booking.booking_kind === "rental" ? "Дата аренды" : "Дата съёмки"
      }: ${formatDate(booking.booking_date)}`,
      `Время: ${formatTime(booking.booking_time)}`,
      `Пакет: ${packageTitle}`,
      ...(booking.booking_kind === "rental" ? getRentalItemsText(booking) : []),
      `Цена: ${formatPrice(getBookingTotalAmount(booking), booking.currency || "PLN")}`,
      `Интерьер: ${interiorName}`,
      `Фотограф: ${teamName}`,
      `Статус: ${getStatusLabel(booking.status)}`,
      `Оплата: ${getPaymentStatusLabel(booking.payment_status)}`,
      `${booking.booking_kind === "rental" ? "Сумма оплаты" : "Предоплата"}: ${formatPaymentAmount(
        booking.booking_kind === "rental"
          ? getBookingTotalAmount(booking)
          : getBookingDepositAmount(booking),
        booking.currency,
      )}`,
      `Полная сумма: ${formatPaymentAmount(
        getBookingTotalAmount(booking),
        booking.currency,
      )}`,
      `Связались: ${contactStatus}`,
      `Когда связались: ${contactedAt}`,
      `Напоминание клиенту: ${getReminderLabel(booking)}`,
      `Заявка создана: ${formatDateTime(booking.created_at)}`,
      "",
      `Комментарий клиента: ${clientNotes}`,
    ];

    try {
      await navigator.clipboard.writeText(details.join("\n"));
      setCopiedDetailsBookingId(booking.id);

      window.setTimeout(() => {
        setCopiedDetailsBookingId((currentBookingId) =>
          currentBookingId === booking.id ? null : currentBookingId,
        );
      }, 2200);
    } catch {
      setErrorMessage("Не удалось скопировать детали заявки");
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "pending") return "Ожидает подтверждения";
    if (status === "confirmed") return "Подтверждено";
    if (status === "cancelled") return "Отменено";

    return "Неизвестный статус";
  };

  const getReminderLabel = (booking: AdminBooking) => {
    if (booking.reminder_sent_at) {
      return `отправлено ${formatDateTime(booking.reminder_sent_at)}`;
    }

    if (booking.status === "cancelled") {
      return "не требуется — бронь отменена";
    }

    if (booking.booking_date > todayDate) {
      return "ещё не отправлено";
    }

    return "не отправлялось";
  };

  const getReminderBadgeClass = (booking: AdminBooking) => {
    if (booking.reminder_sent_at) {
      return "border-green-200 bg-green-50 text-green-800";
    }

    if (booking.status === "cancelled") {
      return "border-[#D8C4B3] bg-[#F2E8DF] text-[#7A6252]";
    }

    if (booking.booking_date > todayDate) {
      return "border-[#E6CFA8] bg-[#FFF4DD] text-[#7A5528]";
    }

    return "border-[#D8C4B3] bg-white/80 text-[#7A6252]";
  };

  const getAdminHint = (booking: AdminBooking) => {
    if (booking.status === "pending" && !booking.contacted_client) {
      return "Новая заявка. Свяжитесь с клиентом перед подтверждением.";
    }

    if (booking.status === "pending" && booking.contacted_client) {
      return "Клиенту уже написали или позвонили. Теперь можно подтвердить съёмку.";
    }

    if (booking.status === "confirmed") {
      return "Съёмка подтверждена. Контакт с клиентом лучше держать под рукой.";
    }

    if (booking.status === "cancelled") {
      return "Заявка отменена. Статус подтверждения больше не меняем.";
    }

    return "Проверьте детали заявки перед изменением статуса.";
  };

  const getAdminHintClass = (booking: AdminBooking) => {
    if (booking.status === "pending" && !booking.contacted_client) {
      return "border-[#E6CFA8] bg-[#FFF4DD] text-[#7A5528]";
    }

    if (booking.status === "pending" && booking.contacted_client) {
      return "border-green-200 bg-green-50 text-green-800";
    }

    if (booking.status === "confirmed") {
      return "border-[#BFD8B8] bg-[#EAF5E7] text-[#3F6B3D]";
    }

    if (booking.status === "cancelled") {
      return "border-[#E2BABA] bg-[#F6E3E3] text-[#8A3A3A]";
    }

    return "border-[#D8C4B3] bg-[#F7F1EA] text-[#7A6252]";
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

  const getDateFilteredBookings = () => {
    return bookings.filter((booking) => {
      if (activeDateFilter === "all") return true;
      if (activeDateFilter === "today")
        return booking.booking_date === todayDate;
      if (activeDateFilter === "future")
        return booking.booking_date > todayDate;
      return booking.booking_date < todayDate;
    });
  };

  const getStatusAndDateFilteredBookings = () => {
    return bookings.filter((booking) => {
      const matchesStatus =
        activeStatusFilter === "all" || booking.status === activeStatusFilter;

      const matchesDate =
        activeDateFilter === "all" ||
        (activeDateFilter === "today" && booking.booking_date === todayDate) ||
        (activeDateFilter === "future" && booking.booking_date > todayDate) ||
        (activeDateFilter === "past" && booking.booking_date < todayDate);

      return matchesStatus && matchesDate;
    });
  };

  const getDateFilterCount = (filter: BookingDateFilter) => {
    if (filter === "all") {
      return bookings.length;
    }

    if (filter === "today") {
      return bookings.filter((booking) => booking.booking_date === todayDate)
        .length;
    }

    if (filter === "future") {
      return bookings.filter((booking) => booking.booking_date > todayDate)
        .length;
    }

    return bookings.filter((booking) => booking.booking_date < todayDate)
      .length;
  };

  const getStatusFilterCount = (filter: BookingStatusFilter) => {
    const dateFilteredBookings = getDateFilteredBookings();

    if (filter === "all") {
      return dateFilteredBookings.length;
    }

    return dateFilteredBookings.filter((booking) => booking.status === filter)
      .length;
  };

  const getContactFilterCount = (filter: BookingContactFilter) => {
    const statusAndDateFilteredBookings = getStatusAndDateFilteredBookings();

    if (filter === "all") {
      return statusAndDateFilteredBookings.length;
    }

    if (filter === "contacted") {
      return statusAndDateFilteredBookings.filter(
        (booking) => booking.contacted_client,
      ).length;
    }

    return statusAndDateFilteredBookings.filter(
      (booking) => !booking.contacted_client,
    ).length;
  };

  const getBookingKindFilterCount = (filter: BookingKindFilter) => {
    if (filter === "all") return bookings.length;

    return bookings.filter((booking) => booking.booking_kind === filter).length;
  };

  const contactedCount = bookings.filter(
    (booking) => booking.contacted_client,
  ).length;

  const notContactedCount = bookings.filter(
    (booking) => !booking.contacted_client,
  ).length;

  const photoBookingsCount = bookings.filter(
    (booking) => booking.booking_kind === "photo",
  ).length;

  const rentalBookingsCount = bookings.filter(
    (booking) => booking.booking_kind === "rental",
  ).length;

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F1EA] text-[#2B1A12]">
        <div className="text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#A67C52]">
            Sister&apos;s Photo Studio
          </p>

          <p className="text-sm text-[#7A6252]">Проверяем доступ...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F1EA] px-5 py-28 text-[#2B1A12]">
      <AdminHeader />

      <section className="mx-auto w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 overflow-hidden rounded-[42px] border border-[#E5D5C8] bg-[#2B1A12] p-7 text-[#F7F1EA] shadow-[0_28px_90px_rgba(43,26,18,0.22)] sm:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.32em] text-[#D9B98F]">
                Sisters Studio OS
              </p>

              <h1 className="text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">
                Бронирования студии
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#E8D8CC] sm:text-base">
                Здесь живут заявки на фотосессии и аренду. Настройки сайта,
                медиатека и другие большие разделы теперь вынесены в отдельные
                страницы, чтобы файл не разрастался обратно.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.18em] text-[#D9B98F]">
                  Все заявки
                </p>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
                  {bookings.length}
                </p>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.18em] text-[#D9B98F]">
                  Сегодня
                </p>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
                  {getDateFilterCount("today")}
                </p>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.18em] text-[#D9B98F]">
                  Фотосессии
                </p>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
                  {photoBookingsCount}
                </p>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.18em] text-[#D9B98F]">
                  Аренда
                </p>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">
                  {rentalBookingsCount}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <BookingTabs
          activeSection="bookings"
          onSectionChange={handleAdminSectionChange}
          onOpenMedia={() => router.push("/admin/portfolio")}
        />

        <BookingStats
          totalCount={bookings.length}
          todayCount={getDateFilterCount("today")}
          futureCount={getDateFilterCount("future")}
          contactedCount={contactedCount}
          notContactedCount={notContactedCount}
          photoBookingsCount={photoBookingsCount}
          rentalBookingsCount={rentalBookingsCount}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 rounded-[36px] border border-[#E5D5C8] bg-white/70 p-6 shadow-[0_24px_90px_rgba(83,54,37,0.12)] backdrop-blur-xl sm:p-8"
        >
          <BookingFilters
            isLoading={isLoading}
            query={searchQuery}
            onQueryChange={setSearchQuery}
            hasActiveFilters={hasActiveFilters}
            filteredBookingsCount={filteredBookings.length}
            onResetFilters={handleResetFilters}
            onRefresh={loadAdminPage}
            statusFilters={statusFilters}
            dateFilters={dateFilters}
            contactFilters={contactFilters}
            bookingKindFilters={bookingKindFilters}
            activeStatusFilter={activeStatusFilter}
            activeDateFilter={activeDateFilter}
            activeContactFilter={activeContactFilter}
            activeKindFilter={activeKindFilter}
            onStatusFilterChange={setActiveStatusFilter}
            onDateFilterChange={setActiveDateFilter}
            onContactFilterChange={setActiveContactFilter}
            onKindFilterChange={setActiveKindFilter}
            getStatusFilterCount={getStatusFilterCount}
            getDateFilterCount={getDateFilterCount}
            getContactFilterCount={getContactFilterCount}
            getBookingKindFilterCount={getBookingKindFilterCount}
          />

          {isLoading && (
            <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 px-5 py-5 text-sm text-[#7A6252]">
              Загружаем бронирования...
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
                Бронирований пока нет
              </p>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7A6252]">
                Когда клиенты начнут создавать заявки, они появятся здесь.
              </p>
            </div>
          )}

          {!isLoading &&
            !errorMessage &&
            bookings.length > 0 &&
            filteredBookings.length === 0 && (
              <div className="rounded-[28px] border border-dashed border-[#D8C4B3] bg-[#F7F1EA]/70 px-6 py-10 text-center">
                <p className="text-lg font-medium text-[#2B1A12]">
                  По этим фильтрам ничего не найдено
                </p>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7A6252]">
                  Попробуйте убрать часть фильтров или обновить список заявок.
                </p>
              </div>
            )}

          {!isLoading && !errorMessage && filteredBookings.length > 0 && (
            <div className="space-y-5">
              {filteredBookings.map((booking) => (
                <div
                  key={`${booking.booking_kind}-${booking.id}`}
                  className="rounded-[30px] border border-[#E5D5C8] bg-[#FFFDFB]/80 p-5 shadow-[0_18px_60px_rgba(83,54,37,0.10)]"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <div
                              className={`w-fit rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${getBookingKindBadgeClass(
                                booking,
                              )}`}
                            >
                              {booking.booking_kind === "rental"
                                ? "🏛 Оренда студії"
                                : "📸 Фотосесія"}
                            </div>
                          </div>

                          <p className="mt-4 text-xl font-semibold tracking-[-0.03em] text-[#2B1A12]">
                            {formatDate(booking.booking_date)} в{" "}
                            {formatTime(booking.booking_time)}
                          </p>

                          {booking.booking_kind === "rental" && (
                            <p className="mt-2 text-sm font-semibold text-[#8A5A36]">
                              {getRentalSpacesLabel(booking)} ·{" "}
                              {formatPrice(
                                getBookingTotalAmount(booking),
                                booking.currency || "PLN",
                              )}
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap gap-2 text-sm text-[#7A6252]">
                            <span>
                              Статус: {getStatusLabel(booking.status)}
                            </span>
                            <span>•</span>
                            <span>
                              Связь с клиентом:{" "}
                              {booking.contacted_client ? "да" : "нет"}
                            </span>
                          </div>

                          {booking.contacted_client && booking.contacted_at && (
                            <p className="mt-2 text-xs text-[#8A5A36]">
                              Связались: {formatDateTime(booking.contacted_at)}
                            </p>
                          )}

                          <div
                            className={`mt-4 max-w-2xl rounded-2xl border px-4 py-3 text-sm leading-6 ${getAdminHintClass(
                              booking,
                            )}`}
                          >
                            {getAdminHint(booking)}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <div
                            className={`w-fit rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${getBookingKindBadgeClass(
                              booking,
                            )}`}
                          >
                            {getBookingKindLabel(booking)}
                          </div>

                          {booking.status === "pending" &&
                            !booking.contacted_client && (
                              <div className="w-fit rounded-full border border-[#D9A85F] bg-[#FFE8B8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7A4A12] shadow-[0_10px_24px_rgba(122,74,18,0.12)]">
                                Новая заявка
                              </div>
                            )}

                          {getIsPublicBooking(booking) && (
                            <div className="w-fit rounded-full border border-[#D9A85F] bg-[#FFF4DD] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#7A4A12]">
                              Публічна бронь
                            </div>
                          )}

                          {booking.notes?.trim() && (
                            <div className="w-fit rounded-full border border-[#D8C4B3] bg-[#FFFDFB] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[#8A5A36]">
                              Комментарий есть
                            </div>
                          )}

                          <div
                            className={`w-fit rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] ${getReminderBadgeClass(
                              booking,
                            )}`}
                          >
                            {booking.reminder_sent_at
                              ? `✉ Напоминание отправлено ${formatDateTime(
                                  booking.reminder_sent_at,
                                )}`
                              : booking.status === "cancelled"
                                ? "Напоминание не требуется"
                                : booking.booking_date > todayDate
                                  ? "Напоминание ещё не отправлено"
                                  : "Напоминание не отправлялось"}
                          </div>

                          <div
                            className={`w-fit rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] ${getStatusBadgeClass(
                              booking.status,
                            )}`}
                          >
                            {getStatusLabel(booking.status)}
                          </div>

                          <div
                            className={`w-fit rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] ${
                              booking.contacted_client
                                ? "border-green-200 bg-green-50 text-green-800"
                                : "border-[#D8C4B3] bg-white/80 text-[#7A6252]"
                            }`}
                          >
                            {booking.contacted_client
                              ? "Связались"
                              : "Не связались"}
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

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                            Клиент
                          </p>

                          <div
                            className={`mt-2 w-fit rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                              getIsPublicBooking(booking)
                                ? "border-[#D9A85F] bg-[#FFF4DD] text-[#7A4A12]"
                                : "border-[#D8C4B3] bg-white/80 text-[#7A6252]"
                            }`}
                          >
                            {getBookingSourceLabel(booking)}
                          </div>

                          <p className="mt-3 text-sm font-medium text-[#2B1A12]">
                            {getClientName(booking)}
                          </p>

                          <p className="mt-1 text-xs text-[#7A6252]">
                            {getClientPhone(booking)
                              ? `Телефон: ${getClientPhone(booking)}`
                              : "Телефон не указан"}
                          </p>

                          <p className="mt-1 break-all text-xs text-[#7A6252]">
                            {getClientEmail(booking)
                              ? `Email: ${getClientEmail(booking)}`
                              : "Email не указан"}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {getClientPhone(booking) && (
                              <>
                                <a
                                  href={getPhoneHref(getClientPhone(booking))}
                                  className="rounded-full border border-[#D8C4B3] bg-white/80 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
                                >
                                  Позвонить
                                </a>

                                <a
                                  href={getWhatsAppHref(
                                    getClientPhone(booking),
                                  )}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-full border border-green-200 bg-green-50 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-green-800 transition hover:bg-green-100"
                                >
                                  WhatsApp
                                </a>
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => handleCopyClientContacts(booking)}
                              className="rounded-full border border-[#D8C4B3] bg-white/80 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
                            >
                              {copiedContactBookingId === booking.id
                                ? "Скопировано"
                                : "Контакты"}
                            </button>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                            Формат
                          </p>

                          <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                            {booking.booking_kind === "rental"
                              ? getRentalSpacesLabel(booking)
                              : booking.packages?.title || "Пакет не выбран"}
                          </p>

                          {booking.booking_kind === "rental" &&
                            booking.rental_items.map((item) => (
                              <div
                                key={item.id}
                                className="mt-3 rounded-xl border border-[#E5D5C8] bg-white/70 px-3 py-2"
                              >
                                <p className="text-xs font-semibold text-[#2B1A12]">
                                  {getRentalResourceTitle(item.rental_resource)}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-[#7A6252]">
                                  {formatTime(item.booking_time)}–
                                  {formatTime(
                                    item.end_time || item.booking_time,
                                  )}{" "}
                                  · {item.duration_hours} ч. ·{" "}
                                  {formatPrice(
                                    item.total_price,
                                    booking.currency || "PLN",
                                  )}
                                </p>
                              </div>
                            ))}

                          <p className="mt-1 text-xs text-[#7A6252]">
                            Цена:{" "}
                            {formatPrice(
                              getBookingTotalAmount(booking),
                              booking.currency || "PLN",
                            )}
                          </p>

                          <p className="mt-1 text-xs text-[#7A6252]">
                            {booking.booking_kind === "rental"
                              ? "К оплате"
                              : "Предоплата"}:{" "}
                            {formatPaymentAmount(
                              booking.booking_kind === "rental"
                                ? getBookingTotalAmount(booking)
                                : getBookingDepositAmount(booking),
                              booking.currency,
                            )}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                            Оплата
                          </p>

                          <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                            {getPaymentStatusLabel(booking.payment_status)}
                          </p>

                          <p className="mt-1 text-xs text-[#7A6252]">
                            Провайдер: {booking.payment_provider || "нет"}
                          </p>

                          <p className="mt-1 break-all text-xs text-[#7A6252]">
                            ID: {booking.payment_id || "нет"}
                          </p>

                          <p className="mt-1 text-xs text-[#7A6252]">
                            Оплачено: {booking.paid_at ? formatDateTime(booking.paid_at) : "нет"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                            Локация
                          </p>

                          <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                            {booking.booking_kind === "rental"
                              ? getRentalSpacesLabel(booking)
                              : booking.interiors?.name || "Интерьер не выбран"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                            Команда
                          </p>

                          <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                            {booking.booking_kind === "rental"
                              ? "Не нужно для аренды"
                              : booking.team?.name || "Фотограф не выбран"}
                          </p>

                          {booking.team?.position && (
                            <p className="mt-1 text-xs text-[#7A6252]">
                              {booking.team.position}
                            </p>
                          )}
                        </div>

                        <div className="rounded-2xl border border-[#E5D5C8] bg-[#F7F1EA]/70 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                            Заявка создана
                          </p>

                          <p className="mt-2 text-sm font-medium text-[#2B1A12]">
                            {formatDateTime(booking.created_at)}
                          </p>
                        </div>
                      </div>

                      {booking.notes && (
                        <p className="mt-5 max-w-3xl rounded-2xl bg-white/70 p-4 text-sm leading-6 text-[#6E5748]">
                          {booking.notes}
                        </p>
                      )}

                      {booking.selected_addons?.length > 0 && (
                        <div className="mt-5 max-w-3xl rounded-2xl border border-[#E5D5C8] bg-white/80 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-[#A67C52]">
                            Услуги конструктора
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {booking.selected_addons.map((item, index) => (
                              <span
                                key={`${item.id || item.title}-${index}`}
                                className="rounded-full bg-[#F5E9DD] px-3 py-2 text-sm text-[#5B3825]"
                              >
                                {item.title} · +{item.price} zł
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {booking.booking_kind === "photo" && (
                        <PixoverGalleryPanel
                          bookingId={booking.id}
                          clientName={getClientName(booking)}
                          clientEmail={getClientEmail(booking)}
                        />
                      )}
                    </div>

                    <div className="flex flex-col gap-3 lg:w-52">
                      <button
                        type="button"
                        onClick={() => handleCopyBookingDetails(booking)}
                        className="rounded-full border border-[#D8C4B3] bg-white/80 px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252] transition hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
                      >
                        {copiedDetailsBookingId === booking.id
                          ? "Скопировано"
                          : "Скопировать всё"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleContacted(
                            booking.id,
                            !booking.contacted_client,
                          )
                        }
                        disabled={updatingContactedId === booking.id}
                        className={`rounded-full border px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          booking.contacted_client
                            ? "border-[#D8C4B3] bg-white/80 text-[#7A6252] hover:bg-[#2B1A12] hover:text-[#F7F1EA]"
                            : "border-green-200 bg-green-50 text-green-800 hover:bg-green-100"
                        }`}
                      >
                        {updatingContactedId === booking.id
                          ? "Обновляем..."
                          : booking.contacted_client
                            ? "Отметить как не связались"
                            : "Отметить: связались"}
                      </button>

                      {booking.status === "pending" && (
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(booking.id, "confirmed")
                            }
                            disabled={
                              updatingBookingId === booking.id ||
                              !booking.contacted_client
                            }
                            className={`rounded-full px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] shadow-[0_14px_34px_rgba(43,26,18,0.20)] transition disabled:cursor-not-allowed ${
                              booking.contacted_client
                                ? "bg-[#2B1A12] text-[#F7F1EA] hover:bg-[#4A2D1E] disabled:opacity-60"
                                : "bg-[#D8C4B3] text-[#7A6252] opacity-70 shadow-none"
                            }`}
                          >
                            {updatingBookingId === booking.id
                              ? "Обновляем..."
                              : "Подтвердить"}
                          </button>

                          {!booking.contacted_client && (
                            <p className="text-center text-xs leading-5 text-[#8A5A36]">
                              Сначала отметьте, что связались с клиентом.
                            </p>
                          )}
                        </div>
                      )}

                      {(booking.status === "pending" ||
                        booking.status === "confirmed") && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateStatus(booking.id, "cancelled")
                          }
                          disabled={updatingBookingId === booking.id}
                          className="rounded-full border border-[#D8C4B3] bg-white/80 px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#8A5A36] transition hover:border-[#2B1A12] hover:bg-[#2B1A12] hover:text-[#F7F1EA] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingBookingId === booking.id
                            ? "Обновляем..."
                            : "Отменить"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteBooking(booking)}
                        disabled={
                          deletingBookingId ===
                          `${booking.booking_kind}-${booking.id}`
                        }
                        className="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingBookingId ===
                        `${booking.booking_kind}-${booking.id}`
                          ? "Удаляем..."
                          : "Удалить бронь"}
                      </button>

                      {booking.status === "cancelled" && (
                        <div className="rounded-2xl border border-[#D8C4B3] bg-[#F2E8DF] px-4 py-3 text-center text-xs font-medium uppercase tracking-[0.14em] text-[#7A6252]">
                          Заявка отменена
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
