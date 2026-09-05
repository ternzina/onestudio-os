"use server";

import { createHash, randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { contactEmail } from "@/lib/site-content";
import { RESEND_FROM } from "@/lib/server/studio-brand";
import {
  contactValuesFromFormData,
  validateContactValues,
  type ContactFormValues,
  type ContactFieldErrors,
} from "./contact-validation";

export type ContactActionState = {
  status: "idle" | "invalid" | "success" | "unavailable";
  errors: ContactFieldErrors;
};

const CONTACT_IP_RATE_LIMIT = 5;
const CONTACT_IP_RATE_WINDOW_SECONDS = 15 * 60;
const CONTACT_EMAIL_RATE_LIMIT = 3;
const CONTACT_EMAIL_RATE_WINDOW_SECONDS = 30 * 60;

type ResendErrorBody = {
  name?: string;
  message?: string;
};

function envText(name: string) {
  return (process.env[name] || "").trim();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function contactMessageText(values: ContactFormValues) {
  return [
    `Name: ${values.name}`,
    `Email: ${values.email}`,
    values.phone ? `Phone: ${values.phone}` : null,
    `Topic: ${values.topic}`,
    "",
    "Message:",
    values.message,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

function contactMessageHtml(values: ContactFormValues, subject: string) {
  const field = (label: string, value: string) =>
    `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#332f29"><strong>${escapeHtml(label)}</strong><br>${escapeHtml(value).replaceAll("\n", "<br>")}</p>`;

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f3f0e9;font-family:Arial,sans-serif;color:#17191f">
    <div style="padding:28px 14px">
      <div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #e5e0d6;border-radius:24px;padding:30px">
        <h1 style="margin:0 0 24px;font-size:28px;line-height:1.25;color:#17191f">${escapeHtml(subject)}</h1>
        ${field("Name", values.name)}
        ${field("Email", values.email)}
        ${values.phone ? field("Phone", values.phone) : ""}
        ${field("Topic", values.topic)}
        ${field("Message", values.message)}
      </div>
    </div>
  </body>
</html>`;
}

function hashRateLimitValue(secret: string, kind: string, value: string) {
  return createHash("sha256")
    .update(`${secret}:${kind}:${value}`)
    .digest("hex");
}

function clientIp(requestHeaders: Headers) {
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip")?.trim() ||
    "unknown"
  ).slice(0, 100);
}

async function claimRateLimit(
  supabaseAdmin: SupabaseClient,
  keyHash: string,
  limit: number,
  windowSeconds: number,
) {
  const { data, error } = await supabaseAdmin.rpc(
    "claim_booking_email_rate_limit",
    {
      p_ip_hash: keyHash,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    } as never,
  );

  if (error) throw error;
  return data === true;
}

async function claimContactRateLimits(email: string) {
  const supabaseUrl = envText("NEXT_PUBLIC_SUPABASE_URL") || envText("SUPABASE_URL");
  const supabaseSecretKey =
    envText("SUPABASE_SERVICE_ROLE_KEY") || envText("SUPABASE_SECRET_KEY");
  const rateLimitSecret =
    envText("BOOKING_EMAIL_RATE_LIMIT_SECRET") || supabaseSecretKey;

  if (!supabaseUrl || !supabaseSecretKey || !rateLimitSecret) return false;

  const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const requestHeaders = await headers();
  const ip = clientIp(requestHeaders);

  const ipAllowed = await claimRateLimit(
    supabaseAdmin,
    hashRateLimitValue(rateLimitSecret, "public-contact-ip", ip),
    CONTACT_IP_RATE_LIMIT,
    CONTACT_IP_RATE_WINDOW_SECONDS,
  );
  if (!ipAllowed) return false;

  return claimRateLimit(
    supabaseAdmin,
    hashRateLimitValue(rateLimitSecret, "public-contact-email", email),
    CONTACT_EMAIL_RATE_LIMIT,
    CONTACT_EMAIL_RATE_WINDOW_SECONDS,
  );
}

function providerError(status: number, raw: string) {
  let parsed: ResendErrorBody = {};
  try {
    parsed = JSON.parse(raw) as ResendErrorBody;
  } catch {
    // Keep provider response details out of the client-facing action state.
  }

  return `${parsed.name ? `${parsed.name}: ` : ""}${parsed.message || `Resend HTTP ${status}`}`.slice(0, 400);
}

async function sendContactEmail(values: ContactFormValues) {
  const apiKey = envText("RESEND_API_KEY");
  const fromEmail = envText("RESEND_FROM_EMAIL");

  if (!apiKey || !isValidEmail(fromEmail)) {
    console.error("Public contact email is not configured", {
      hasResendApiKey: Boolean(apiKey),
      hasValidResendFromEmail: isValidEmail(fromEmail),
    });
    return false;
  }

  const subject = `OneStudio contact: ${values.topic}`;
  const text = contactMessageText(values);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `onestudio/public-contact/${randomUUID()}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [contactEmail],
        reply_to: values.email,
        subject,
        text,
        html: contactMessageHtml(values, subject),
      }),
      signal: AbortSignal.timeout(12_000),
    });

    const raw = await response.text();
    if (!response.ok) {
      console.error("Public contact email provider rejected the message", {
        status: response.status,
        error: providerError(response.status, raw),
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Public contact email delivery failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export async function submitContactMessage(
  _previousState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const values = contactValuesFromFormData(formData);

  if (values.honeypot) {
    return { status: "unavailable", errors: {} };
  }

  const errors = validateContactValues(values);
  if (Object.keys(errors).length > 0) {
    return { status: "invalid", errors };
  }

  try {
    if (!(await claimContactRateLimits(values.email.toLowerCase()))) {
      return { status: "unavailable", errors: {} };
    }
  } catch (error) {
    console.error("Public contact anti-spam check failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return { status: "unavailable", errors: {} };
  }

  const sent = await sendContactEmail(values);
  return { status: sent ? "success" : "unavailable", errors: {} };
}
