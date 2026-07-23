import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { sendPaymentConfirmationEmails } from "./_payment-email";

export type BookingKind = "photoshoot" | "rental";
export type BookingLanguage = "uk" | "pl";

type PaymentRecord = {
  bookingKind: BookingKind;
  reference: string;
  language: BookingLanguage;
  customerEmail: string | null;
  currency: string;
  amount: number;
  totalAmount: number;
  productName: string;
  existingPaymentId: string | null;
  paymentStatus: string | null;
};

let stripeClient: Stripe | null = null;

export const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  const isTestKey = secretKey.startsWith("sk_test_");
  const livePaymentsAllowed = process.env.STRIPE_ALLOW_LIVE_PAYMENTS === "true";

  if (!isTestKey && !livePaymentsAllowed) {
    throw new Error(
      "Live Stripe payments are blocked. Use sk_test_ or explicitly set STRIPE_ALLOW_LIVE_PAYMENTS=true.",
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
};

export const getServerSupabase = () => {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase server credentials are not configured");
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

const normalizeLanguage = (value: unknown): BookingLanguage =>
  value === "pl" ? "pl" : "uk";

const normalizeCurrency = (value: unknown) => {
  const currency = String(value || "PLN").trim().toLowerCase();
  return /^[a-z]{3}$/.test(currency) ? currency : "pln";
};

export const toMinorUnits = (amount: number) => Math.round(amount * 100);

const constructorPrices: Record<number, number> = {
  1: 1000,
  2: 1600,
  3: 2200,
  4: 3000,
  5: 3500,
};

const getConstructorPrice = (durationHours: number) =>
  constructorPrices[durationHours];

const loadPhotoshootPayment = async (reference: string): Promise<PaymentRecord> => {
  const supabase = getServerSupabase();
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select(
      "id,package_id,duration_hours,selected_addons,client_email,language,payment_status,payment_id",
    )
    .eq("id", reference)
    .single();

  if (bookingError || !booking) {
    throw new Error("Booking not found");
  }

  if (booking.payment_status === "paid") {
    throw new Error("Booking is already paid");
  }

  const { data: packageData, error: packageError } = await supabase
    .from("packages")
    .select("id,title,price,currency,deposit_amount,is_constructor")
    .eq("id", booking.package_id)
    .single();

  if (packageError || !packageData) {
    throw new Error("Booking package not found");
  }

  let basePrice = Number(packageData.price || 0);

  if (packageData.is_constructor) {
    const constructorDuration = Number(booking.duration_hours || 1);

    if (![1, 2, 3, 4, 5].includes(constructorDuration)) {
      throw new Error("Invalid constructor booking duration");
    }

    basePrice = getConstructorPrice(constructorDuration);
  } else if (Number(booking.duration_hours) !== 3) {
    throw new Error("Invalid fixed package booking duration");
  }

  const rawAddons = Array.isArray(booking.selected_addons)
    ? booking.selected_addons
    : [];
  const addonIds = rawAddons
    .map((item) =>
      typeof item === "string"
        ? item
        : item && typeof item === "object" && "id" in item
          ? String(item.id)
          : "",
    )
    .filter((id) => /^[0-9a-f-]{36}$/i.test(id));

  let addonsTotal = 0;

  if (addonIds.length > 0) {
    const { data: addons, error: addonsError } = await supabase
      .from("package_addons")
      .select("id,price")
      .in("id", addonIds)
      .eq("is_active", true);

    if (addonsError) {
      throw new Error("Could not verify booking add-ons");
    }

    addonsTotal = (addons || []).reduce(
      (sum, addon) => sum + Number(addon.price || 0),
      0,
    );
  }

  const totalAmount = basePrice + addonsTotal;
  const configuredDeposit = Number(packageData.deposit_amount ?? 500);
  const depositAmount = Math.min(Math.max(configuredDeposit, 0), totalAmount);
  const currency = normalizeCurrency(packageData.currency);

  if (!Number.isFinite(totalAmount) || !Number.isFinite(depositAmount) || depositAmount <= 0) {
    throw new Error("Invalid booking price");
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      total_price: totalAmount,
      total_amount: totalAmount,
      deposit_amount: depositAmount,
      currency: currency.toUpperCase(),
      payment_status: "pending_payment",
    })
    .eq("id", reference);

  if (updateError) {
    throw new Error("Could not prepare booking payment");
  }

  return {
    bookingKind: "photoshoot",
    reference,
    language: normalizeLanguage(booking.language),
    customerEmail: booking.client_email || null,
    currency,
    amount: depositAmount,
    totalAmount,
    productName: `Sisters Photo Studio — ${packageData.title}`,
    existingPaymentId: booking.payment_id || null,
    paymentStatus: booking.payment_status || null,
  };
};

const loadRentalPayment = async (reference: string): Promise<PaymentRecord> => {
  const supabase = getServerSupabase();
  const { data: rows, error: rowsError } = await supabase
    .from("studio_bookings")
    .select(
      "id,client_email,language,rental_resource,duration_hours,payment_status,payment_id",
    )
    .eq("rental_order_id", reference)
    .order("created_at", { ascending: true });

  if (rowsError || !rows || rows.length === 0) {
    throw new Error("Rental booking not found");
  }

  if (rows.some((row) => row.payment_status === "paid")) {
    throw new Error("Rental booking is already paid");
  }

  const { data: settings } = await supabase
    .from("booking_page_settings")
    .select("studio_price_per_hour,makeup_price_per_hour")
    .eq("id", "main")
    .maybeSingle();

  const studioPrice = Number(settings?.studio_price_per_hour ?? 200);
  const makeupPrice = Number(settings?.makeup_price_per_hour ?? 50);
  let totalAmount = 0;

  for (const row of rows) {
    const isMakeup =
      row.rental_resource === "makeup_room" || row.rental_resource === "makeup";
    const pricePerHour = isMakeup ? makeupPrice : studioPrice;
    const rowTotal = pricePerHour * Number(row.duration_hours || 1);
    totalAmount += rowTotal;

    const { error: updateError } = await supabase
      .from("studio_bookings")
      .update({
        price_per_hour: pricePerHour,
        total_price: rowTotal,
        currency: "PLN",
        payment_status: "pending_payment",
      })
      .eq("id", row.id);

    if (updateError) {
      throw new Error("Could not prepare rental payment");
    }
  }

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw new Error("Invalid rental price");
  }

  return {
    bookingKind: "rental",
    reference,
    language: normalizeLanguage(rows[0].language),
    customerEmail: rows[0].client_email || null,
    currency: "pln",
    amount: totalAmount,
    totalAmount,
    productName: "Sisters Photo Studio — wynajem studia",
    existingPaymentId: rows.find((row) => row.payment_id)?.payment_id || null,
    paymentStatus: rows[0].payment_status || null,
  };
};

export const loadPaymentRecord = (bookingKind: BookingKind, reference: string) =>
  bookingKind === "photoshoot"
    ? loadPhotoshootPayment(reference)
    : loadRentalPayment(reference);

export const getBookingReturnPath = (bookingKind: BookingKind) =>
  bookingKind === "photoshoot"
    ? "/booking-public"
    : "/wynajem-studia/rezerwacja";

export const getSiteUrl = (request: Request) => {
  const configuredUrl = process.env.STRIPE_SITE_URL?.trim();
  const requestOrigin = new URL(request.url).origin;
  const siteUrl = configuredUrl || requestOrigin;

  if (!/^https?:\/\//i.test(siteUrl)) {
    throw new Error("STRIPE_SITE_URL must start with http:// or https://");
  }

  return siteUrl.replace(/\/$/, "");
};

export const markCheckoutSession = async (
  bookingKind: BookingKind,
  reference: string,
  sessionId: string,
) => {
  const supabase = getServerSupabase();
  const table = bookingKind === "photoshoot" ? "bookings" : "studio_bookings";
  const column = bookingKind === "photoshoot" ? "id" : "rental_order_id";
  const { error } = await supabase
    .from(table)
    .update({
      payment_status: "pending_payment",
      payment_provider: "stripe",
      payment_id: sessionId,
    })
    .eq(column, reference);

  if (error) {
    throw new Error("Could not save Stripe Checkout session");
  }
};

export const applyCheckoutSessionStatus = async (
  session: Stripe.Checkout.Session,
) => {
  const bookingKind = session.metadata?.booking_kind as BookingKind | undefined;
  const reference = session.metadata?.booking_reference;

  if (
    (bookingKind !== "photoshoot" && bookingKind !== "rental") ||
    !reference
  ) {
    throw new Error("Stripe session does not contain booking metadata");
  }

  const supabase = getServerSupabase();
  const table = bookingKind === "photoshoot" ? "bookings" : "studio_bookings";
  const column = bookingKind === "photoshoot" ? "id" : "rental_order_id";
  const isPaid = session.payment_status === "paid";
  const isCancelled = session.status === "expired";
  const paymentStatus = isPaid
    ? "paid"
    : isCancelled
      ? "cancelled"
      : "pending_payment";
  const update = {
    payment_status: paymentStatus,
    payment_provider: "stripe",
    payment_id: session.id,
    paid_at: isPaid ? new Date().toISOString() : null,
  };

  let query = supabase.from(table).update(update).eq(column, reference);

  if (!isPaid) {
    query = query.neq("payment_status", "paid");
  }

  const { error } = await query;

  if (error) {
    throw new Error("Could not update booking payment status");
  }

  const paymentResult = {
    bookingKind,
    reference,
    language: normalizeLanguage(session.metadata?.language),
    paymentStatus,
    amountTotal: session.amount_total || 0,
    currency: (session.currency || "pln").toUpperCase(),
  };

  if (isPaid) {
    try {
      const latestSession =
        session.metadata?.payment_emails_sent === "true"
          ? session
          : await getStripe().checkout.sessions.retrieve(session.id);

      if (latestSession.metadata?.payment_emails_sent !== "true") {
        const emailResult = await sendPaymentConfirmationEmails(
          supabase,
          latestSession,
          paymentResult,
        );

        if (emailResult.success) {
          await getStripe().checkout.sessions.update(session.id, {
            metadata: { payment_emails_sent: "true" },
          });
        }
      }
    } catch (emailError) {
      console.error("Stripe payment confirmation email failed", emailError);
    }
  }

  return paymentResult;
};

export type { PaymentRecord };
