import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { STUDIO_SITE_URL } from "@/lib/server/studio-brand";
import { stripeClient } from "@/lib/server/payments/stripe-adapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const bookingId = typeof body.bookingId === "string" ? body.bookingId : "";
  if (!bookingId) return NextResponse.json({ ok: false, error: "booking_id_required" }, { status: 400 });

  const { data, error } = await supabase.rpc("get_stripe_checkout_booking", {
    p_booking_id: bookingId,
  });
  const booking = Array.isArray(data) ? data[0] : null;
  if (error || !booking) {
    return NextResponse.json({ ok: false, error: error?.message || "booking_not_found" }, { status: 404 });
  }

  if (!booking.payment_required || booking.due_minor <= 0) {
    return NextResponse.json({ ok: false, error: "nothing_to_pay" }, { status: 409 });
  }

  const stripe = stripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: booking.booking_id,
    customer_email: booking.client_email || undefined,
    success_url: `${STUDIO_SITE_URL}/admin/payments?booking=${booking.booking_id}&stripe=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${STUDIO_SITE_URL}/admin/payments?booking=${booking.booking_id}&stripe=cancelled`,
    metadata: {
      booking_id: booking.booking_id,
      business_id: booking.business_id,
      amount_minor: String(booking.due_minor),
      booking_reference: booking.reference,
    },
    payment_intent_data: {
      metadata: {
        booking_id: booking.booking_id,
        business_id: booking.business_id,
        booking_reference: booking.reference,
      },
    },
    line_items: [{
      quantity: 1,
      price_data: {
        currency: String(booking.currency).toLowerCase(),
        unit_amount: booking.due_minor,
        product_data: {
          name: `${booking.service_title} · ${booking.reference}`,
          description: `Booking payment for ${booking.client_name}`,
        },
      },
    }],
  });

  if (!session.url) return NextResponse.json({ ok: false, error: "checkout_url_missing" }, { status: 500 });
  return NextResponse.json({ ok: true, url: session.url, sessionId: session.id });
}
