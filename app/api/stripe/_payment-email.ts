import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import type { BookingKind, BookingLanguage } from "./_shared";
import {
  RESEND_FROM,
  STUDIO_ADDRESS,
  STUDIO_NAME,
  STUDIO_SITE_URL,
} from "@/lib/server/studio-brand";

type PaymentEmailContext = {
  bookingKind: BookingKind;
  reference: string;
  language: BookingLanguage;
  amountTotal: number;
  currency: string;
};

type BookingEmailDetails = {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  bookingDate: string;
  bookingTime: string;
  service: string;
};

type SendResult = {
  success: boolean;
  adminSent: boolean;
  clientSent: boolean;
};

const textValue = (value: unknown, fallback = "") => {
  const text = String(value ?? "").trim();
  return (text || fallback).replace(/[\r\n\t]+/g, " ").slice(0, 500);
};

const escapeHtml = (value: unknown, fallback = "") =>
  textValue(value, fallback)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const shortTime = (value: unknown) => textValue(value).slice(0, 5);

const formatBookingDate = (value: string, language: BookingLanguage) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) return value;

  const [, year, month, day] = match;
  return new Intl.DateTimeFormat(language === "pl" ? "pl-PL" : "uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))));
};

const formatAmount = (amountTotal: number, currency: string, language: BookingLanguage) =>
  new Intl.NumberFormat(language === "pl" ? "pl-PL" : "uk-UA", {
    style: "currency",
    currency,
  }).format(amountTotal / 100);

const getRentalResource = (value: unknown, language: BookingLanguage) => {
  const resource = textValue(value).toLowerCase();

  if (resource === "studio") {
    return language === "pl" ? "Sala / Studio" : "Зал / Studio";
  }

  if (resource === "makeup" || resource === "makeup_room") {
    return "Make-up room";
  }

  return language === "pl" ? "Wynajem studia" : "Оренда студії";
};

const loadPhotoshootDetails = async (
  supabase: SupabaseClient,
  reference: string,
  language: BookingLanguage,
): Promise<BookingEmailDetails> => {
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      "client_name,client_email,client_phone,booking_date,booking_time,package_id",
    )
    .eq("id", reference)
    .single();

  if (error || !booking) {
    throw new Error("Could not load photoshoot payment email details");
  }

  let service = language === "pl" ? "Sesja zdjęciowa" : "Фотосесія";

  if (booking.package_id) {
    const { data: packageData } = await supabase
      .from("packages")
      .select("title")
      .eq("id", booking.package_id)
      .maybeSingle();

    if (packageData?.title) {
      service = textValue(packageData.title, service);
    }
  }

  return {
    clientName: textValue(booking.client_name, language === "pl" ? "Kliencie" : "Клієнте"),
    clientEmail: textValue(booking.client_email),
    clientPhone: textValue(booking.client_phone, "—"),
    bookingDate: textValue(booking.booking_date, "—"),
    bookingTime: shortTime(booking.booking_time) || "—",
    service,
  };
};

const loadRentalDetails = async (
  supabase: SupabaseClient,
  reference: string,
  language: BookingLanguage,
): Promise<BookingEmailDetails> => {
  const { data, error } = await supabase
    .from("studio_bookings")
    .select(
      "client_name,client_email,client_phone,booking_date,booking_time,end_time,rental_resource,duration_hours",
    )
    .eq("rental_order_id", reference)
    .order("booking_time", { ascending: true });

  if (error || !data || data.length === 0) {
    throw new Error("Could not load rental payment email details");
  }

  const first = data[0];
  const service = data
    .map((row) => {
      const resource = getRentalResource(row.rental_resource, language);
      const start = shortTime(row.booking_time);
      const end = shortTime(row.end_time);
      const hours = Number(row.duration_hours || 1);
      const duration = language === "pl" ? `${hours} godz.` : `${hours} год.`;
      return `${resource}: ${start}–${end}, ${duration}`;
    })
    .join(" · ");

  return {
    clientName: textValue(first.client_name, language === "pl" ? "Kliencie" : "Клієнте"),
    clientEmail: textValue(first.client_email),
    clientPhone: textValue(first.client_phone, "—"),
    bookingDate: textValue(first.booking_date, "—"),
    bookingTime: data
      .map((row) => `${shortTime(row.booking_time)}–${shortTime(row.end_time)}`)
      .join(" · "),
    service,
  };
};

const sendResendEmail = async (
  apiKey: string,
  payload: Record<string, unknown>,
  idempotencyKey: string,
) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Resend payment email failed", {
      status: response.status,
      response: responseData,
      idempotencyKey,
    });
  }

  return response.ok;
};

const emailShell = (content: string) => `
<!doctype html>
<html lang="pl">
  <body style="margin:0;background:#f7f1ea;color:#2b1a12;font-family:Arial,sans-serif">
    <div style="max-width:640px;margin:0 auto;padding:32px 18px">
      <div style="background:#ffffff;border:1px solid #e5d5c8;border-radius:28px;padding:32px">
        <p style="margin:0 0 22px;color:#a67c52;font-size:12px;letter-spacing:3px;text-transform:uppercase">${escapeHtml(STUDIO_NAME)}</p>
        ${content}
      </div>
    </div>
  </body>
</html>`;

const detailRow = (label: string, value: string) => `
  <tr>
    <td style="padding:9px 12px 9px 0;color:#8a6f5e;font-size:13px;vertical-align:top">${escapeHtml(label)}</td>
    <td style="padding:9px 0;color:#2b1a12;font-size:14px;font-weight:600;vertical-align:top">${escapeHtml(value)}</td>
  </tr>`;

const buildClientEmail = (
  details: BookingEmailDetails,
  context: PaymentEmailContext,
  siteUrl: string,
) => {
  const isPolish = context.language === "pl";
  const amount = formatAmount(context.amountTotal, context.currency, context.language);
  const date = formatBookingDate(details.bookingDate, context.language);
  const subject = isPolish
    ? `Płatność potwierdzona · ${STUDIO_NAME}`
    : `Оплату підтверджено · ${STUDIO_NAME}`;
  const title = isPolish ? "Dziękujemy — płatność potwierdzona" : "Дякуємо — оплату підтверджено";
  const intro = isPolish
    ? `Dzień dobry, ${details.clientName}! Otrzymaliśmy Twoją płatność za rezerwację.`
    : `Вітаємо, ${details.clientName}! Ми отримали оплату за ваше бронювання.`;
  const rows = [
    detailRow(isPolish ? "Usługa" : "Послуга", details.service),
    detailRow(isPolish ? "Data" : "Дата", date),
    detailRow(isPolish ? "Godzina" : "Час", details.bookingTime),
    detailRow(isPolish ? "Zapłacono" : "Сплачено", amount),
    detailRow(isPolish ? "Numer rezerwacji" : "Номер бронювання", context.reference),
  ].join("");
  const addressHtml = STUDIO_ADDRESS
    ? `<p style="margin:22px 0 6px;color:#6e5748;font-size:14px;line-height:1.7">${isPolish ? "Adres studia" : "Адреса студії"}: <strong>${escapeHtml(STUDIO_ADDRESS)}</strong></p>`
    : "";
  const html = emailShell(`
    <div style="display:inline-block;margin-bottom:18px;border-radius:999px;background:#eaf8ef;color:#176b3a;padding:9px 14px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px">${isPolish ? "Zapłacono" : "Оплачено"}</div>
    <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:32px;line-height:1.15">${escapeHtml(title)}</h1>
    <p style="margin:0 0 22px;color:#6e5748;font-size:15px;line-height:1.7">${escapeHtml(intro)}</p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #eadfd5;border-bottom:1px solid #eadfd5">${rows}</table>
    ${addressHtml}
    <a href="${escapeHtml(siteUrl)}" style="display:inline-block;margin-top:18px;border-radius:999px;background:#2b1a12;color:#fff7ef;padding:13px 22px;text-decoration:none;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px">${isPolish ? "Przejdź na stronę" : "Перейти на сайт"}</a>
    <p style="margin:24px 0 0;color:#9a8374;font-size:12px;line-height:1.6">${isPolish ? "W razie pytań odpowiedz na tę wiadomość." : "Якщо виникнуть запитання, дайте відповідь на цей лист."}</p>
  `);
  const text = [
    title,
    intro,
    `${isPolish ? "Usługa" : "Послуга"}: ${details.service}`,
    `${isPolish ? "Data" : "Дата"}: ${date}`,
    `${isPolish ? "Godzina" : "Час"}: ${details.bookingTime}`,
    `${isPolish ? "Zapłacono" : "Сплачено"}: ${amount}`,
    `${isPolish ? "Numer rezerwacji" : "Номер бронювання"}: ${context.reference}`,
    STUDIO_ADDRESS
      ? `${isPolish ? "Adres studia" : "Адреса студії"}: ${STUDIO_ADDRESS}`
      : "",
  ].filter(Boolean).join("\n");

  return { subject, html, text };
};

const buildAdminEmail = (
  details: BookingEmailDetails,
  context: PaymentEmailContext,
  siteUrl: string,
  stripeSessionId: string,
) => {
  const amount = formatAmount(context.amountTotal, context.currency, "uk");
  const date = formatBookingDate(details.bookingDate, "uk");
  const subject = `Оплату отримано: ${amount} · ${details.clientName}`;
  const rows = [
    detailRow("Клієнт", details.clientName),
    detailRow("Email", details.clientEmail || "—"),
    detailRow("Телефон", details.clientPhone),
    detailRow("Послуга", details.service),
    detailRow("Дата", date),
    detailRow("Час", details.bookingTime),
    detailRow("Сплачено", amount),
    detailRow("Номер бронювання", context.reference),
    detailRow("Stripe ID", stripeSessionId),
  ].join("");
  const html = emailShell(`
    <div style="display:inline-block;margin-bottom:18px;border-radius:999px;background:#eaf8ef;color:#176b3a;padding:9px 14px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Оплачено</div>
    <h1 style="margin:0 0 14px;font-family:Georgia,serif;font-size:32px;line-height:1.15">Отримано оплату ${escapeHtml(amount)}</h1>
    <p style="margin:0 0 22px;color:#6e5748;font-size:15px;line-height:1.7">Платіж Stripe підтверджено. Бронювання вже позначене як оплачене в адмінці.</p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #eadfd5;border-bottom:1px solid #eadfd5">${rows}</table>
    <a href="${escapeHtml(siteUrl)}/admin/bookings" style="display:inline-block;margin-top:22px;border-radius:999px;background:#2b1a12;color:#fff7ef;padding:13px 22px;text-decoration:none;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px">Відкрити бронювання</a>
  `);
  const text = [
    "Оплату отримано",
    `Клієнт: ${details.clientName}`,
    `Email: ${details.clientEmail || "—"}`,
    `Телефон: ${details.clientPhone}`,
    `Послуга: ${details.service}`,
    `Дата: ${date}`,
    `Час: ${details.bookingTime}`,
    `Сплачено: ${amount}`,
    `Номер бронювання: ${context.reference}`,
    `Stripe ID: ${stripeSessionId}`,
  ].join("\n");

  return { subject, html, text };
};

export const sendPaymentConfirmationEmails = async (
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session,
  context: PaymentEmailContext,
): Promise<SendResult> => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const studioEmails = (process.env.STUDIO_EMAIL || "")
    .split(",")
    .map((email) => email.trim())
    .filter(isValidEmail);

  if (!apiKey || studioEmails.length === 0) {
    console.error("Payment email configuration is missing");
    return { success: false, adminSent: false, clientSent: false };
  }

  const details =
    context.bookingKind === "photoshoot"
      ? await loadPhotoshootDetails(supabase, context.reference, context.language)
      : await loadRentalDetails(supabase, context.reference, context.language);
  const siteUrl = STUDIO_SITE_URL;
  const clientEmail = buildClientEmail(details, context, siteUrl);
  const adminEmail = buildAdminEmail(details, context, siteUrl, session.id);
  const hasClientEmail = isValidEmail(details.clientEmail);

  const [adminSent, clientSent] = await Promise.all([
    sendResendEmail(
      apiKey,
      {
        from: RESEND_FROM,
        to: studioEmails,
        reply_to: hasClientEmail ? details.clientEmail : undefined,
        subject: adminEmail.subject,
        html: adminEmail.html,
        text: adminEmail.text,
      },
      `stripe-payment-admin/${session.id}`,
    ),
    hasClientEmail
      ? sendResendEmail(
          apiKey,
          {
            from: RESEND_FROM,
            to: [details.clientEmail],
            subject: clientEmail.subject,
            html: clientEmail.html,
            text: clientEmail.text,
          },
          `stripe-payment-client/${session.id}`,
        )
      : Promise.resolve(true),
  ]);

  return {
    success: adminSent && clientSent,
    adminSent,
    clientSent: hasClientEmail ? clientSent : false,
  };
};
