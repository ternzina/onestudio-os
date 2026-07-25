import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export type StripeAdapterStatus = {
  provider: "stripe";
  configured: boolean;
  mode: "test" | "live" | "unknown";
  missing: string[];
};

const text = (name: string) => (process.env[name] || "").trim();

export function getStripeAdapterStatus(): StripeAdapterStatus {
  const secret = text("STRIPE_SECRET_KEY");
  const webhook = text("STRIPE_WEBHOOK_SECRET");
  const missing: string[] = [];
  if (!secret) missing.push("STRIPE_SECRET_KEY");
  if (!webhook) missing.push("STRIPE_WEBHOOK_SECRET");
  return {
    provider: "stripe",
    configured: missing.length === 0,
    mode: secret.startsWith("sk_test_") ? "test" : secret.startsWith("sk_live_") ? "live" : "unknown",
    missing,
  };
}

export function stripeClient() {
  const key = text("STRIPE_SECRET_KEY");
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key);
}

export function stripeWebhookSecret() {
  const secret = text("STRIPE_WEBHOOK_SECRET");
  if (!secret) throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  return secret;
}

export function paymentServiceClient() {
  const url = text("SUPABASE_URL") || text("NEXT_PUBLIC_SUPABASE_URL");
  const key = text("SUPABASE_SERVICE_ROLE_KEY") || text("SUPABASE_SECRET_KEY");
  if (!url || !key) throw new Error("Missing Supabase service credentials");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function recordPaidCheckout(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return { recorded: false, reason: "not_paid" };

  const bookingId = session.metadata?.booking_id;
  const businessId = session.metadata?.business_id;
  const expectedAmount = Number(session.metadata?.amount_minor || 0);
  const amount = session.amount_total || 0;
  const currency = (session.currency || "").toUpperCase();

  if (!bookingId || !businessId || !expectedAmount || amount !== expectedAmount) {
    throw new Error("stripe_checkout_metadata_invalid");
  }

  const paymentIntent = typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id || null;

  const supabase = paymentServiceClient();
  const { data, error } = await supabase.rpc("append_payment_transaction", {
    p_booking_id: bookingId,
    p_kind: "payment",
    p_amount_minor: amount,
    p_method: "online",
    p_provider: "stripe",
    p_provider_reference: paymentIntent || session.id,
    p_note: "Stripe Checkout payment",
    p_occurred_at: new Date().toISOString(),
    p_idempotency_key: `stripe-checkout:${session.id}`,
    p_metadata: {
      source: "stripe_checkout",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntent,
      stripe_customer_email: session.customer_details?.email || session.customer_email || null,
      stripe_currency: currency,
      business_id: businessId,
    },
  });

  if (error) throw error;
  return { recorded: true, transactionId: data };
}
