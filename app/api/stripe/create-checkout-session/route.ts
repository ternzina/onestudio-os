import { NextResponse } from "next/server";
import {
  applyCheckoutSessionStatus,
  getBookingReturnPath,
  getSiteUrl,
  getStripe,
  loadPaymentRecord,
  markCheckoutSession,
  toMinorUnits,
  type BookingKind,
} from "../_shared";

export const runtime = "nodejs";

const isBookingKind = (value: unknown): value is BookingKind =>
  value === "photoshoot" || value === "rental";

const isSafeReference = (value: unknown): value is string =>
  typeof value === "string" && /^[a-zA-Z0-9_-]{8,200}$/.test(value);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      bookingKind?: unknown;
      reference?: unknown;
    };

    if (!isBookingKind(body.bookingKind) || !isSafeReference(body.reference)) {
      return NextResponse.json(
        { error: "Invalid booking payment request" },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const payment = await loadPaymentRecord(body.bookingKind, body.reference);

    if (payment.existingPaymentId?.startsWith("cs_")) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(
          payment.existingPaymentId,
        );

        if (existingSession.payment_status === "paid") {
          await applyCheckoutSessionStatus(existingSession);
          return NextResponse.json(
            { error: "Booking is already paid" },
            { status: 409 },
          );
        }

        if (existingSession.status === "open" && existingSession.url) {
          return NextResponse.json({ url: existingSession.url });
        }
      } catch (error) {
        console.warn("Could not reuse the previous Stripe session", error);
      }
    }

    const siteUrl = getSiteUrl(request);
    const returnPath = getBookingReturnPath(body.bookingKind);
    const cancelUrl = new URL(returnPath, siteUrl);
    cancelUrl.searchParams.set("payment", "cancelled");
    cancelUrl.searchParams.set("reference", body.reference);

    const metadata = {
      booking_kind: body.bookingKind,
      booking_reference: body.reference,
      language: payment.language,
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: body.reference,
      customer_email: payment.customerEmail || undefined,
      locale: payment.language === "pl" ? "pl" : "auto",
      success_url: `${siteUrl}/oplata/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl.toString(),
      metadata,
      payment_intent_data: { metadata },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: payment.currency,
            unit_amount: toMinorUnits(payment.amount),
            product_data: {
              name: payment.productName,
              description:
                body.bookingKind === "photoshoot"
                  ? `Zadatek. Pełna cena rezerwacji: ${payment.totalAmount} ${payment.currency.toUpperCase()}`
                  : "Pełna opłata za wynajem studia",
            },
          },
        },
      ],
    });

    if (!session.url) {
      throw new Error("Stripe did not return a Checkout URL");
    }

    await markCheckoutSession(body.bookingKind, body.reference, session.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout session creation failed", error);

    const message = error instanceof Error ? error.message : "Unknown error";
    const isNotFound = message.includes("not found");
    const isAlreadyPaid = message.includes("already paid");
    const isConfigurationError =
      message.includes("not configured") ||
      message.includes("blocked") ||
      message.includes("STRIPE_SITE_URL");

    return NextResponse.json(
      {
        error: isConfigurationError
          ? "Payment service is not configured"
          : isAlreadyPaid
            ? "Booking is already paid"
            : isNotFound
              ? "Booking not found"
              : "Could not start payment",
      },
      { status: isConfigurationError ? 503 : isNotFound ? 404 : isAlreadyPaid ? 409 : 500 },
    );
  }
}
