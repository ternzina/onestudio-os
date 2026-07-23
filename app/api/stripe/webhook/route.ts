import { NextResponse } from "next/server";
import Stripe from "stripe";
import { applyCheckoutSessionStatus, getStripe } from "../_shared";

export const runtime = "nodejs";

const handledEvents = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.expired",
]);

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured" },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  try {
    const payload = await request.text();
    const event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );

    if (handledEvents.has(event.type)) {
      await applyCheckoutSessionStatus(
        event.data.object as Stripe.Checkout.Session,
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook failed", error);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }
}
