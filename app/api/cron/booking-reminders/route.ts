import { createClient } from "@supabase/supabase-js";
import {
  RESEND_FROM,
  STUDIO_ADDRESS,
  STUDIO_NAME,
  STUDIO_SITE_URL,
  STUDIO_TIME_ZONE,
} from "@/lib/server/studio-brand";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Language = "uk" | "pl";

type PhotoBooking = {
  id: string;
  client_name: string | null;
  client_email: string | null;
  booking_date: string;
  booking_time: string | null;
  end_time: string | null;
  duration_hours: number | null;
  status: string | null;
  language: string | null;
  reminder_sent_at: string | null;
  reminder_locked_at: string | null;
};

type StudioBooking = PhotoBooking & {
  rental_order_id: string | null;
  rental_resource: string | null;
};

type ReminderPayload = {
  clientName: string;
  clientEmail: string;
  bookingDate: string;
  language: Language;
  bookingType: "photo" | "rental";
  details: string[];
};

type AdminSummaryItem = {
  bookingType: "photo" | "rental";
  clientName: string;
  clientEmail: string;
  details: string[];
};

const CANCELLED_STATUSES = new Set([
  "cancelled",
  "canceled",
  "deleted",
  "rejected",
]);

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function getLanguage(value: string | null | undefined): Language {
  return value?.toLowerCase().startsWith("pl") ? "pl" : "uk";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isCancelled(status: string | null): boolean {
  return CANCELLED_STATUSES.has((status || "").toLowerCase());
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeTime(value: string | null | undefined): string {
  return value ? value.slice(0, 5) : "";
}

function getTomorrowAtStudio(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STUDIO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  const tomorrow = new Date(Date.UTC(year, month - 1, day + 1));

  return [
    tomorrow.getUTCFullYear(),
    String(tomorrow.getUTCMonth() + 1).padStart(2, "0"),
    String(tomorrow.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function formatDate(dateValue: string, language: Language): string {
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  return new Intl.DateTimeFormat(language === "pl" ? "pl-PL" : "uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getRentalResourceName(
  resource: string | null,
  language: Language,
): string {
  if (resource === "makeup_room") {
    return language === "pl"
      ? "Make-up room / pokój do makijażu"
      : "Make-up room / кімната макіяжу";
  }

  return language === "pl" ? "Sala / Studio" : "Зал / Studio";
}

function buildReminderEmail(payload: ReminderPayload) {
  const isPolish = payload.language === "pl";
  const clientName = escapeHtml(payload.clientName || (isPolish ? "Kliencie" : "Клієнте"));
  const bookingDate = escapeHtml(formatDate(payload.bookingDate, payload.language));
  const bookingType = isPolish
    ? payload.bookingType === "rental"
      ? "Wynajem studia"
      : "Sesja zdjęciowa"
    : payload.bookingType === "rental"
      ? "Оренда студії"
      : "Фотосесія";

  const copy = isPolish
    ? {
        subject: `Przypomnienie: jutro czekamy na Ciebie · ${STUDIO_NAME}`,
        preview: `Przypomnienie o jutrzejszej rezerwacji w ${STUDIO_NAME}`,
        title: "Do zobaczenia jutro",
        greeting: `Dzień dobry, ${clientName}!`,
        intro: `Przypominamy o Twojej jutrzejszej rezerwacji w ${STUDIO_NAME}.`,
        typeLabel: "Rodzaj rezerwacji",
        dateLabel: "Data",
        timeLabel: "Godzina",
        addressLabel: "Adres studia",
        button: "Przejdź na stronę",
        footer: "Jeśli Twoje plany się zmieniły, po prostu odpowiedz na tę wiadomość.",
      }
    : {
        subject: `Нагадування: завтра чекаємо на вас · ${STUDIO_NAME}`,
        preview: `Нагадування про завтрашнє бронювання в ${STUDIO_NAME}`,
        title: "До зустрічі завтра",
        greeting: `Вітаємо, ${clientName}!`,
        intro: `Нагадуємо про ваше завтрашнє бронювання в ${STUDIO_NAME}.`,
        typeLabel: "Тип бронювання",
        dateLabel: "Дата",
        timeLabel: "Час",
        addressLabel: "Адреса студії",
        button: "Перейти на сайт",
        footer: "Якщо ваші плани змінилися, просто дайте відповідь на цей лист.",
      };

  const detailRows = payload.details
    .map(
      (detail) => `
        <div style="padding:8px 0;color:#2f211b;font-size:15px;line-height:1.5;">
          ${escapeHtml(detail)}
        </div>`,
    )
    .join("");
  const addressBlock = STUDIO_ADDRESS
    ? `<div style="margin-top:22px;padding:18px 20px;border:1px solid #eadbd0;border-radius:18px;">
                  <div style="color:#9a7868;font-size:12px;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(copy.addressLabel)}</div>
                  <div style="margin-top:6px;font-size:15px;font-weight:700;">${escapeHtml(STUDIO_ADDRESS)}</div>
                </div>`
    : "";

  const html = `<!doctype html>
<html lang="${payload.language}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(copy.subject)}</title>
  </head>
  <body style="margin:0;background:#f4eee9;font-family:Arial,sans-serif;color:#2f211b;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(copy.preview)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4eee9;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffaf6;border-radius:24px;overflow:hidden;border:1px solid #eadbd0;">
            <tr>
              <td style="padding:34px 34px 18px;text-align:center;background:#2b1c17;color:#fffaf6;">
                <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;opacity:.8;">${escapeHtml(STUDIO_NAME)}</div>
                <h1 style="margin:14px 0 0;font-family:Georgia,serif;font-size:34px;font-weight:normal;">${escapeHtml(copy.title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 34px;">
                <p style="margin:0 0 10px;font-size:18px;font-weight:700;">${copy.greeting}</p>
                <p style="margin:0 0 24px;color:#6d554a;font-size:15px;line-height:1.65;">${escapeHtml(copy.intro)}</p>
                <div style="background:#f7eee8;border-radius:18px;padding:18px 20px;">
                  <div style="padding:8px 0;border-bottom:1px solid #eadbd0;">
                    <div style="color:#9a7868;font-size:12px;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(copy.typeLabel)}</div>
                    <div style="margin-top:4px;font-size:16px;font-weight:700;">${escapeHtml(bookingType)}</div>
                  </div>
                  <div style="padding:14px 0 6px;">
                    <div style="color:#9a7868;font-size:12px;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(copy.dateLabel)}</div>
                    <div style="margin-top:4px;font-size:16px;font-weight:700;">${bookingDate}</div>
                  </div>
                  <div style="padding-top:6px;">
                    <div style="color:#9a7868;font-size:12px;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(copy.timeLabel)}</div>
                    ${detailRows}
                  </div>
                </div>
                ${addressBlock}
                <div style="padding-top:26px;text-align:center;">
                  <a href="${STUDIO_SITE_URL}" style="display:inline-block;background:#2b1c17;color:#fffaf6;text-decoration:none;padding:14px 24px;border-radius:999px;font-size:14px;font-weight:700;">${escapeHtml(copy.button)}</a>
                </div>
                <p style="margin:26px 0 0;color:#80695e;font-size:13px;line-height:1.6;text-align:center;">${escapeHtml(copy.footer)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    copy.greeting,
    copy.intro,
    `${copy.typeLabel}: ${bookingType}`,
    `${copy.dateLabel}: ${formatDate(payload.bookingDate, payload.language)}`,
    `${copy.timeLabel}: ${payload.details.join("; ")}`,
    STUDIO_ADDRESS ? `${copy.addressLabel}: ${STUDIO_ADDRESS}` : "",
    copy.footer,
  ].filter(Boolean).join("\n\n");

  return { subject: copy.subject, html, text };
}

async function sendReminder(apiKey: string, payload: ReminderPayload) {
  const email = buildReminderEmail(payload);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [payload.clientEmail],
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`Resend error ${response.status}: ${JSON.stringify(data)}`);
  }
}

function formatAdminDate(dateValue: string): string {
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

async function sendAdminSummary(
  apiKey: string,
  recipients: string[],
  targetDate: string,
  items: AdminSummaryItem[],
  errors: string[],
) {
  const photoCount = items.filter((item) => item.bookingType === "photo").length;
  const rentalCount = items.filter((item) => item.bookingType === "rental").length;
  const formattedDate = formatAdminDate(targetDate);
  const itemRows = items
    .map((item) => {
      const typeLabel =
        item.bookingType === "rental" ? "Аренда студии" : "Фотосессия";

      return `
        <div style="margin-top:12px;padding:16px 18px;border:1px solid #eadbd0;border-radius:16px;background:#fffaf6;">
          <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#9a7868;">${escapeHtml(typeLabel)}</div>
          <div style="margin-top:6px;font-size:16px;font-weight:700;color:#2f211b;">${escapeHtml(item.clientName || "Имя не указано")}</div>
          <div style="margin-top:4px;font-size:13px;color:#80695e;">${escapeHtml(item.clientEmail)}</div>
          <div style="margin-top:8px;font-size:14px;line-height:1.6;color:#2f211b;">${item.details.map(escapeHtml).join("<br>")}</div>
        </div>`;
    })
    .join("");
  const errorRows = errors.length
    ? `<div style="margin-top:20px;padding:16px 18px;border:1px solid #e2baba;border-radius:16px;background:#f6e3e3;color:#8a3a3a;">
        <strong>Ошибки: ${errors.length}</strong><br>
        ${errors.map(escapeHtml).join("<br>")}
      </div>`
    : `<div style="margin-top:20px;padding:14px 18px;border:1px solid #bfe0bf;border-radius:16px;background:#edf8ed;color:#316b3a;">Ошибок нет</div>`;
  const subject = `Напоминания клиентам на ${formattedDate} · ${STUDIO_NAME}`;
  const html = `<!doctype html>
<html lang="ru">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
  <body style="margin:0;background:#f4eee9;font-family:Arial,sans-serif;color:#2f211b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px;background:#f4eee9;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:24px;overflow:hidden;">
          <tr><td style="padding:30px 32px;background:#2b1c17;color:#fffaf6;text-align:center;">
            <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;opacity:.8;">${escapeHtml(STUDIO_NAME)}</div>
            <h1 style="margin:12px 0 0;font-family:Georgia,serif;font-size:30px;font-weight:normal;">Напоминания отправлены</h1>
          </td></tr>
          <tr><td style="padding:30px 32px;">
            <p style="margin:0;font-size:16px;line-height:1.6;">Клиентам с бронями на <strong>${escapeHtml(formattedDate)}</strong> отправлены автоматические письма.</p>
            <div style="margin-top:20px;padding:16px 18px;border-radius:16px;background:#f7eee8;font-size:15px;line-height:1.7;">
              Фотосессии: <strong>${photoCount}</strong><br>
              Аренда студии: <strong>${rentalCount}</strong><br>
              Всего писем: <strong>${items.length}</strong>
            </div>
            ${itemRows}
            ${errorRows}
            <div style="padding-top:24px;text-align:center;">
              <a href="${STUDIO_SITE_URL}/admin/bookings" style="display:inline-block;background:#2b1c17;color:#fffaf6;text-decoration:none;padding:14px 24px;border-radius:999px;font-size:14px;font-weight:700;">Открыть бронирования</a>
            </div>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
  const text = [
    `Напоминания клиентам на ${formattedDate}`,
    `Фотосессии: ${photoCount}`,
    `Аренда студии: ${rentalCount}`,
    `Всего писем: ${items.length}`,
    "",
    ...items.map(
      (item) =>
        `${item.bookingType === "rental" ? "Аренда" : "Фотосессия"}: ${item.clientName || "Имя не указано"}, ${item.clientEmail}, ${item.details.join("; ")}`,
    ),
    "",
    errors.length ? `Ошибки: ${errors.join("; ")}` : "Ошибок нет",
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: recipients,
      subject,
      html,
      text,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      `Resend admin summary error ${response.status}: ${JSON.stringify(data)}`,
    );
  }
}

function getLockCutoff(): string {
  return new Date(Date.now() - 30 * 60 * 1000).toISOString();
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authorization = request.headers.get("authorization");

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
    const serviceRoleKey =
      process.env.SUPABASE_SECRET_KEY?.trim() ||
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!serviceRoleKey) {
      throw new Error(
        "Missing environment variable: SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY",
      );
    }
    const resendApiKey = getRequiredEnv("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const targetDate = getTomorrowAtStudio();
    const lockCutoff = getLockCutoff();
    const errors: string[] = [];
    const adminSummaryItems: AdminSummaryItem[] = [];
    let sent = 0;
    let skipped = 0;

    const { data: photoData, error: photoError } = await supabase
      .from("bookings")
      .select("id,client_name,client_email,booking_date,booking_time,end_time,duration_hours,status,language,reminder_sent_at,reminder_locked_at")
      .eq("booking_date", targetDate)
      .is("reminder_sent_at", null);

    if (photoError) {
      throw photoError;
    }

    for (const booking of (photoData || []) as PhotoBooking[]) {
      const clientEmail = booking.client_email?.trim() || "";

      if (isCancelled(booking.status) || !isValidEmail(clientEmail)) {
        skipped += 1;
        continue;
      }

      const lockTime = new Date().toISOString();
      const { data: claimedRows, error: claimError } = await supabase
        .from("bookings")
        .update({ reminder_locked_at: lockTime })
        .eq("id", booking.id)
        .is("reminder_sent_at", null)
        .or(`reminder_locked_at.is.null,reminder_locked_at.lt.${lockCutoff}`)
        .select("id");

      if (claimError) {
        errors.push(`bookings/${booking.id}: ${claimError.message}`);
        continue;
      }

      if (!claimedRows?.length) {
        skipped += 1;
        continue;
      }

      const startTime = normalizeTime(booking.booking_time);
      const endTime = normalizeTime(booking.end_time);
      const timeRange = endTime ? `${startTime}–${endTime}` : startTime;

      try {
        await sendReminder(resendApiKey, {
          clientName: booking.client_name?.trim() || "",
          clientEmail,
          bookingDate: booking.booking_date,
          language: getLanguage(booking.language),
          bookingType: "photo",
          details: [timeRange],
        });

        const { error: markError } = await supabase
          .from("bookings")
          .update({
            reminder_sent_at: new Date().toISOString(),
            reminder_locked_at: null,
          })
          .eq("id", booking.id);

        if (markError) {
          errors.push(`bookings/${booking.id}/mark: ${markError.message}`);
        }

        adminSummaryItems.push({
          bookingType: "photo",
          clientName: booking.client_name?.trim() || "",
          clientEmail,
          details: [timeRange],
        });

        sent += 1;
      } catch (error) {
        await supabase
          .from("bookings")
          .update({ reminder_locked_at: null })
          .eq("id", booking.id);
        errors.push(`bookings/${booking.id}/send: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    const { data: studioData, error: studioError } = await supabase
      .from("studio_bookings")
      .select("id,rental_order_id,client_name,client_email,booking_date,booking_time,end_time,duration_hours,rental_resource,status,language,reminder_sent_at,reminder_locked_at")
      .eq("booking_date", targetDate);

    if (studioError) {
      throw studioError;
    }

    const rentalGroups = new Map<string, StudioBooking[]>();

    for (const booking of (studioData || []) as StudioBooking[]) {
      const key = booking.rental_order_id || booking.id;
      const current = rentalGroups.get(key) || [];
      current.push(booking);
      rentalGroups.set(key, current);
    }

    for (const [orderId, rows] of rentalGroups) {
      const first = rows[0];
      const clientEmail = first.client_email?.trim() || "";

      if (
        rows.some((row) => row.reminder_sent_at) ||
        rows.every((row) => isCancelled(row.status)) ||
        !isValidEmail(clientEmail)
      ) {
        skipped += 1;
        continue;
      }

      const activeRows = rows.filter((row) => !isCancelled(row.status));
      const activeIds = activeRows.map((row) => row.id);
      const lockTime = new Date().toISOString();
      const { data: claimedRows, error: claimError } = await supabase
        .from("studio_bookings")
        .update({ reminder_locked_at: lockTime })
        .in("id", activeIds)
        .is("reminder_sent_at", null)
        .or(`reminder_locked_at.is.null,reminder_locked_at.lt.${lockCutoff}`)
        .select("id");

      if (claimError) {
        errors.push(`studio_bookings/${orderId}: ${claimError.message}`);
        continue;
      }

      if ((claimedRows || []).length !== activeIds.length) {
        const claimedIds = (claimedRows || []).map((row) => row.id);

        if (claimedIds.length) {
          await supabase
            .from("studio_bookings")
            .update({ reminder_locked_at: null })
            .in("id", claimedIds);
        }

        skipped += 1;
        continue;
      }

      const language = getLanguage(first.language);
      const details = activeRows.map((row) => {
        const resource = getRentalResourceName(row.rental_resource, language);
        const startTime = normalizeTime(row.booking_time);
        const endTime = normalizeTime(row.end_time);
        return `${resource}: ${endTime ? `${startTime}–${endTime}` : startTime}`;
      });

      try {
        await sendReminder(resendApiKey, {
          clientName: first.client_name?.trim() || "",
          clientEmail,
          bookingDate: first.booking_date,
          language,
          bookingType: "rental",
          details,
        });

        const { error: markError } = await supabase
          .from("studio_bookings")
          .update({
            reminder_sent_at: new Date().toISOString(),
            reminder_locked_at: null,
          })
          .in("id", activeIds);

        if (markError) {
          errors.push(`studio_bookings/${orderId}/mark: ${markError.message}`);
        }

        adminSummaryItems.push({
          bookingType: "rental",
          clientName: first.client_name?.trim() || "",
          clientEmail,
          details,
        });

        sent += 1;
      } catch (error) {
        await supabase
          .from("studio_bookings")
          .update({ reminder_locked_at: null })
          .in("id", activeIds);
        errors.push(`studio_bookings/${orderId}/send: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    let adminSummarySent = false;

    if (adminSummaryItems.length > 0 || errors.length > 0) {
      const adminRecipients = (process.env.STUDIO_EMAIL || "")
        .split(",")
        .map((email) => email.trim())
        .filter(isValidEmail);

      if (adminRecipients.length === 0) {
        errors.push("Admin summary skipped: STUDIO_EMAIL is missing or invalid");
      } else {
        try {
          await sendAdminSummary(
            resendApiKey,
            adminRecipients,
            targetDate,
            adminSummaryItems,
            [...errors],
          );
          adminSummarySent = true;
        } catch (error) {
          errors.push(
            `admin-summary/send: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    }

    return Response.json({
      success: errors.length === 0,
      targetDate,
      sent,
      skipped,
      adminSummarySent,
      errors,
    });
  } catch (error) {
    console.error("Booking reminder cron error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Reminder job failed" },
      { status: 500 },
    );
  }
}
