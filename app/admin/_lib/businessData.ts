import { supabase } from "@/lib/supabase";

export type BusinessRecordKind = "photo" | "rental";

export type BusinessRecord = {
  id: string;
  kind: BusinessRecordKind;
  bookingDate: string;
  bookingTime: string;
  bookingStatus: string;
  bookingAmount: number;
  paymentAmount: number;
  paymentStatus: string | null;
  paymentProvider: string | null;
  paymentId: string | null;
  currency: string;
  paidAt: string | null;
  createdAt: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  rentalHours: number;
};

type PhotoBookingRow = {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string | null;
  total_price: number | null;
  total_amount: number | null;
  deposit_amount: number | null;
  payment_status: string | null;
  payment_provider: string | null;
  payment_id: string | null;
  currency: string | null;
  paid_at: string | null;
  created_at: string;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
};

type RentalBookingRow = {
  id: string;
  rental_order_id: string | null;
  booking_date: string;
  booking_time: string;
  status: string | null;
  total_price: number | null;
  duration_hours: number | null;
  rental_resource: string | null;
  payment_status: string | null;
  payment_provider: string | null;
  payment_id: string | null;
  currency: string | null;
  paid_at: string | null;
  created_at: string;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
};

const asNumber = (value: unknown) => {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
};

const choosePaymentStatus = (rows: RentalBookingRow[]) => {
  if (rows.some((row) => row.payment_status === "paid")) return "paid";
  if (rows.some((row) => row.payment_status === "pending_payment")) {
    return "pending_payment";
  }
  if (rows.some((row) => row.payment_status === "cancelled")) {
    return "cancelled";
  }

  return rows.find((row) => row.payment_status)?.payment_status || null;
};

const isStudioResource = (resource: string | null) =>
  resource !== "makeup" && resource !== "makeup_room";

export async function loadBusinessRecords(): Promise<BusinessRecord[]> {
  const [photoResult, rentalResult] = await Promise.all([
    supabase.from("bookings").select(`
      id,
      booking_date,
      booking_time,
      status,
      total_price,
      total_amount,
      deposit_amount,
      payment_status,
      payment_provider,
      payment_id,
      currency,
      paid_at,
      created_at,
      client_name,
      client_email,
      client_phone
    `),
    supabase.from("studio_bookings").select(`
      id,
      rental_order_id,
      booking_date,
      booking_time,
      status,
      total_price,
      duration_hours,
      rental_resource,
      payment_status,
      payment_provider,
      payment_id,
      currency,
      paid_at,
      created_at,
      client_name,
      client_email,
      client_phone
    `),
  ]);

  if (photoResult.error) throw photoResult.error;
  if (rentalResult.error) throw rentalResult.error;

  const photoRecords: BusinessRecord[] = (
    (photoResult.data || []) as PhotoBookingRow[]
  ).map((booking) => {
    const bookingAmount = asNumber(
      booking.total_amount ?? booking.total_price,
    );
    const configuredDeposit = asNumber(booking.deposit_amount);

    return {
      id: booking.id,
      kind: "photo",
      bookingDate: booking.booking_date,
      bookingTime: booking.booking_time,
      bookingStatus: booking.status || "pending",
      bookingAmount,
      paymentAmount:
        configuredDeposit > 0 ? configuredDeposit : bookingAmount,
      paymentStatus: booking.payment_status,
      paymentProvider: booking.payment_provider,
      paymentId: booking.payment_id,
      currency: booking.currency || "PLN",
      paidAt: booking.paid_at,
      createdAt: booking.created_at,
      clientName: booking.client_name || "Без имени",
      clientEmail: booking.client_email || "",
      clientPhone: booking.client_phone || "",
      rentalHours: 0,
    };
  });

  const rentalRows = (rentalResult.data || []) as RentalBookingRow[];
  const rentalGroups = new Map<string, RentalBookingRow[]>();

  for (const row of rentalRows) {
    const key = row.rental_order_id || `legacy-${row.id}`;
    rentalGroups.set(key, [...(rentalGroups.get(key) || []), row]);
  }

  const rentalRecords: BusinessRecord[] = Array.from(
    rentalGroups.entries(),
  ).map(([groupId, rows]) => {
    const sortedRows = [...rows].sort((first, second) =>
      String(first.booking_time).localeCompare(String(second.booking_time)),
    );
    const first = sortedRows[0];
    const studioRows = sortedRows.filter((row) =>
      isStudioResource(row.rental_resource),
    );
    const rentalHoursSource = studioRows.length > 0 ? studioRows : sortedRows;

    return {
      id: first.rental_order_id || groupId,
      kind: "rental",
      bookingDate: first.booking_date,
      bookingTime: first.booking_time,
      bookingStatus: first.status || "pending",
      bookingAmount: sortedRows.reduce(
        (sum, row) => sum + asNumber(row.total_price),
        0,
      ),
      paymentAmount: sortedRows.reduce(
        (sum, row) => sum + asNumber(row.total_price),
        0,
      ),
      paymentStatus: choosePaymentStatus(sortedRows),
      paymentProvider:
        sortedRows.find((row) => row.payment_provider)?.payment_provider ||
        null,
      paymentId:
        sortedRows.find((row) => row.payment_id)?.payment_id || null,
      currency: first.currency || "PLN",
      paidAt: sortedRows.find((row) => row.paid_at)?.paid_at || null,
      createdAt: first.created_at,
      clientName: first.client_name || "Без имени",
      clientEmail: first.client_email || "",
      clientPhone: first.client_phone || "",
      rentalHours: rentalHoursSource.reduce(
        (sum, row) => sum + asNumber(row.duration_hours),
        0,
      ),
    };
  });

  return [...photoRecords, ...rentalRecords].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime(),
  );
}

export const getPaymentState = (paymentStatus: string | null) => {
  if (paymentStatus === "paid") return "paid" as const;
  if (paymentStatus === "pending_payment") return "pending" as const;
  if (paymentStatus === "cancelled") return "cancelled" as const;
  return "not_started" as const;
};

export const formatMoney = (amount: number, currency = "PLN") =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount);

export const formatBookingDate = (date: string) => {
  if (!date) return "—";
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

export const formatDateTime = (value: string | null) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};
