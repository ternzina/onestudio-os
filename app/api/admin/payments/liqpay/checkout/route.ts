import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { STUDIO_SITE_URL } from "@/lib/server/studio-brand";
import {
  buildLiqPayCheckout,
  liqPayOrderId,
} from "@/lib/server/payments/liqpay-adapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const bookingId = typeof body.bookingId === "string" ? body.bookingId : "";
  if (!bookingId) return NextResponse.json({ ok: false, error: "booking_id_required" }, { status: 400 });

  const { data, error } = await supabase.rpc("get_liqpay_checkout_booking", {
    p_booking_id: bookingId,
  });
  const booking = Array.isArray(data) ? data[0] : null;
  if (error || !booking) {
    return NextResponse.json({ ok: false, error: error?.message || "booking_not_found" }, { status: 404 });
  }
  if (!booking.payment_required || booking.due_minor <= 0) {
    return NextResponse.json({ ok: false, error: "nothing_to_pay" }, { status: 409 });
  }

  const orderId = liqPayOrderId(booking.booking_id);
  const checkout = buildLiqPayCheckout({
    amount: (booking.due_minor / 100).toFixed(2),
    currency: booking.currency,
    description: `${booking.service_title} · ${booking.reference}`.slice(0, 200),
    order_id: orderId,
    language: booking.locale === "en" ? "en" : "uk",
    result_url: `${STUDIO_SITE_URL}/admin/payments?booking=${booking.booking_id}&liqpay=returned`,
    server_url: `${STUDIO_SITE_URL}/api/liqpay/callback`,
    info: JSON.stringify({
      booking_id: booking.booking_id,
      business_id: booking.business_id,
      amount_minor: booking.due_minor,
    }),
  });

  return NextResponse.json({ ok: true, ...checkout, orderId });
}
