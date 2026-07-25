import { createHash, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export type LiqPayAdapterStatus = {
  provider: "liqpay";
  configured: boolean;
  mode: "sandbox" | "live" | "unknown";
  missing: string[];
};

export type LiqPayPayload = Record<string, string | number | boolean | null | undefined>;

const text = (name: string) => (process.env[name] || "").trim();

export function getLiqPayAdapterStatus(): LiqPayAdapterStatus {
  const publicKey = text("LIQPAY_PUBLIC_KEY");
  const privateKey = text("LIQPAY_PRIVATE_KEY");
  const missing: string[] = [];
  if (!publicKey) missing.push("LIQPAY_PUBLIC_KEY");
  if (!privateKey) missing.push("LIQPAY_PRIVATE_KEY");
  return {
    provider: "liqpay",
    configured: missing.length === 0,
    mode: publicKey.startsWith("sandbox_") || privateKey.startsWith("sandbox_")
      ? "sandbox"
      : publicKey && privateKey
        ? "live"
        : "unknown",
    missing,
  };
}

export function liqPayPublicKey() {
  const key = text("LIQPAY_PUBLIC_KEY");
  if (!key) throw new Error("Missing LIQPAY_PUBLIC_KEY");
  return key;
}

export function liqPayPrivateKey() {
  const key = text("LIQPAY_PRIVATE_KEY");
  if (!key) throw new Error("Missing LIQPAY_PRIVATE_KEY");
  return key;
}

export function encodeLiqPayData(payload: LiqPayPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

export function decodeLiqPayData<T extends Record<string, unknown>>(data: string): T {
  const decoded = Buffer.from(data, "base64").toString("utf8");
  return JSON.parse(decoded) as T;
}

export function signLiqPayData(data: string) {
  const privateKey = liqPayPrivateKey();
  return createHash("sha3-256")
    .update(`${privateKey}${data}${privateKey}`, "utf8")
    .digest("base64");
}

export function verifyLiqPaySignature(data: string, signature: string) {
  const expected = Buffer.from(signLiqPayData(data), "utf8");
  const actual = Buffer.from(signature, "utf8");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function buildLiqPayCheckout(payload: LiqPayPayload) {
  const data = encodeLiqPayData({
    version: 7,
    public_key: liqPayPublicKey(),
    action: "pay",
    ...payload,
  });
  return {
    checkoutUrl: "https://www.liqpay.ua/api/3/checkout",
    data,
    signature: signLiqPayData(data),
  };
}

export function paymentServiceClient() {
  const url = text("SUPABASE_URL") || text("NEXT_PUBLIC_SUPABASE_URL");
  const key = text("SUPABASE_SERVICE_ROLE_KEY") || text("SUPABASE_SECRET_KEY");
  if (!url || !key) throw new Error("Missing Supabase service credentials");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function liqPayOrderId(bookingId: string) {
  return `onestudio:${bookingId}:${crypto.randomUUID()}`;
}

export function bookingIdFromLiqPayOrderId(orderId: string) {
  const match = /^onestudio:([0-9a-f-]{36}):[0-9a-f-]{36}$/i.exec(orderId);
  return match?.[1] || null;
}

export async function recordLiqPayCallback(payload: Record<string, unknown>) {
  if (payload.status !== "success" || payload.action !== "pay") {
    return { recorded: false, reason: String(payload.status || "not_success") };
  }

  const orderId = typeof payload.order_id === "string" ? payload.order_id : "";
  const bookingId = bookingIdFromLiqPayOrderId(orderId);
  const amountMinor = Math.round(Number(payload.amount || 0) * 100);
  const currency = String(payload.currency || "").toUpperCase();
  const providerReference = String(payload.payment_id || payload.transaction_id || orderId);

  if (!bookingId || !Number.isInteger(amountMinor) || amountMinor <= 0 || !/^[A-Z]{3}$/.test(currency)) {
    throw new Error("liqpay_callback_payload_invalid");
  }

  if (String(payload.public_key || "") !== liqPayPublicKey()) {
    throw new Error("liqpay_public_key_mismatch");
  }

  const supabase = paymentServiceClient();
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id,business_id,currency,total_minor,paid_minor,refunded_minor,payment_required")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError || !booking) throw bookingError || new Error("liqpay_booking_not_found");
  const dueMinor = Math.max(0, booking.total_minor - Math.max(0, booking.paid_minor - booking.refunded_minor));
  if (!booking.payment_required || booking.currency !== currency || amountMinor > dueMinor) {
    throw new Error("liqpay_payment_mismatch");
  }

  const { data, error } = await supabase.rpc("append_payment_transaction", {
    p_booking_id: bookingId,
    p_kind: "payment",
    p_amount_minor: amountMinor,
    p_method: "online",
    p_provider: "liqpay",
    p_provider_reference: providerReference,
    p_note: "LiqPay Checkout payment",
    p_occurred_at: new Date().toISOString(),
    p_idempotency_key: `liqpay:${orderId}:${providerReference}`,
    p_metadata: {
      source: "liqpay_checkout",
      liqpay_order_id: orderId,
      liqpay_payment_id: payload.payment_id || null,
      liqpay_transaction_id: payload.transaction_id || null,
      liqpay_paytype: payload.paytype || null,
      liqpay_sender_card_mask2: payload.sender_card_mask2 || null,
      liqpay_status: payload.status,
    },
  });

  if (error) throw error;
  return { recorded: true, transactionId: data };
}
