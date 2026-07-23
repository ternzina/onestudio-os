import { NextResponse } from "next/server";
import { applyCheckoutSessionStatus, getStripe } from "../_shared";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const sessionId = new URL(request.url).searchParams.get("session_id");

    if (!sessionId || !/^cs_[a-zA-Z0-9_]+$/.test(sessionId)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const payment = await applyCheckoutSessionStatus(session);

    return NextResponse.json({
      status: payment.paymentStatus,
      bookingKind: payment.bookingKind,
      reference: payment.reference,
      language: payment.language,
      amountTotal: payment.amountTotal,
      currency: payment.currency,
    });
  } catch (error) {
    console.error("Stripe session verification failed", error);
    return NextResponse.json(
      { error: "Could not verify payment" },
      { status: 500 },
    );
  }
}
