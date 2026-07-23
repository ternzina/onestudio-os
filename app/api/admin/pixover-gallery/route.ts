import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminSupabase } from "@/lib/adminAuth";
import { RESEND_FROM, STUDIO_NAME } from "@/lib/server/studio-brand";

type GalleryRow = {
  id: string;
  booking_reference: string;
  pixover_url: string;
  access_password: string | null;
  public_token: string;
  status: "draft" | "sent";
  sent_at: string | null;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function getServiceClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function cleanText(value: unknown, maxLength = 500) {
  return String(value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(value: unknown) {
  return cleanText(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeHttpsUrl(value: unknown) {
  let raw = cleanText(value, 2000);
  if (raw && !/^https?:\/\//i.test(raw)) raw = `https://${raw}`;

  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function formatDate(value: string, language: "uk" | "pl") {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;

  const [, year, month, day] = match;
  return new Intl.DateTimeFormat(language === "pl" ? "pl-PL" : "uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))));
}

function buildEmailHtml(input: {
  language: "uk" | "pl";
  clientName: string;
  bookingDate: string;
  galleryPageUrl: string;
  password: string;
}) {
  const isPolish = input.language === "pl";
  const title = isPolish ? "Twoje zdjęcia są gotowe" : "Ваші фотографії готові";
  const greeting = isPolish
    ? `Dzień dobry, ${escapeHtml(input.clientName)}!`
    : `Вітаємо, ${escapeHtml(input.clientName)}!`;
  const intro = isPolish
    ? "Przygotowaliśmy Twoją prywatną galerię po sesji zdjęciowej."
    : "Ми підготували вашу приватну галерею після фотосесії.";
  const button = isPolish ? "Otwórz moją galerię" : "Відкрити мою галерею";
  const passwordBlock = input.password
    ? `<p style="margin:16px 0 0;color:#6e5748;font-size:14px">${
        isPolish ? "Hasło do galerii" : "Пароль до галереї"
      }: <strong style="color:#2b1a12">${escapeHtml(input.password)}</strong></p>`
    : "";

  return `<!doctype html>
  <html lang="${input.language}">
    <body style="margin:0;background:#f7f1ea;font-family:Arial,sans-serif;color:#2b1a12">
      <div style="padding:32px 16px">
        <div style="max-width:620px;margin:0 auto;background:#fffdfb;border:1px solid #e5d5c8;border-radius:24px;overflow:hidden">
          <div style="padding:38px 32px;text-align:center;background:#2b1a12;color:#fff8f2">
            <div style="font-size:13px;letter-spacing:3px;text-transform:uppercase">${escapeHtml(STUDIO_NAME)}</div>
            <h1 style="margin:18px 0 0;font-family:Georgia,serif;font-size:32px;font-weight:400">${title}</h1>
          </div>
          <div style="padding:32px">
            <p style="margin:0;font-size:18px;font-weight:600">${greeting}</p>
            <p style="margin:16px 0 0;color:#6e5748;font-size:15px;line-height:1.7">${intro}</p>
            <p style="margin:16px 0 0;color:#6e5748;font-size:14px">${
              isPolish ? "Data sesji" : "Дата фотосесії"
            }: <strong>${escapeHtml(formatDate(input.bookingDate, input.language))}</strong></p>
            ${passwordBlock}
            <div style="margin:28px 0;text-align:center">
              <a href="${escapeHtml(input.galleryPageUrl)}" style="display:inline-block;border-radius:999px;background:#2b1a12;color:#fff;text-decoration:none;padding:15px 26px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase">${button}</a>
            </div>
            <p style="margin:0;color:#8a7566;font-size:12px;line-height:1.6;text-align:center">${
              isPolish
                ? "Ten link jest prywatny. Nie udostępniaj go osobom trzecim."
                : "Це приватне посилання. Не передавайте його стороннім особам."
            }</p>
          </div>
        </div>
      </div>
    </body>
  </html>`;
}

export async function GET(request: NextRequest) {
  const { error } = await getAdminSupabase(request);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const bookingId = cleanText(request.nextUrl.searchParams.get("bookingId"));
  if (!isUuid(bookingId)) {
    return NextResponse.json(
      { error: "Некорректный ID брони." },
      { status: 400 },
    );
  }

  const service = getServiceClient();
  if (!service) {
    return NextResponse.json(
      { error: "Supabase не настроен на сервере." },
      { status: 500 },
    );
  }

  const { data, error: loadError } = await service
    .from("client_galleries")
    .select(
      "id, booking_reference, pixover_url, access_password, public_token, status, sent_at",
    )
    .eq("booking_kind", "photo")
    .eq("booking_reference", bookingId)
    .maybeSingle();

  if (loadError) {
    return NextResponse.json({ error: loadError.message }, { status: 500 });
  }

  return NextResponse.json({ gallery: data as GalleryRow | null });
}

export async function POST(request: NextRequest) {
  const { error } = await getAdminSupabase(request);
  if (error) return NextResponse.json({ error }, { status: 401 });

  const body = await request.json().catch(() => null);
  const bookingId = cleanText(body?.bookingId);
  const pixoverUrl = normalizeHttpsUrl(body?.pixoverUrl);
  const password = cleanText(body?.password, 200);
  const sendEmail = body?.sendEmail === true;

  if (!isUuid(bookingId) || !pixoverUrl) {
    return NextResponse.json(
      { error: "Проверьте ID брони и ссылку Pixover." },
      { status: 400 },
    );
  }

  const service = getServiceClient();
  if (!service) {
    return NextResponse.json(
      { error: "Supabase не настроен на сервере." },
      { status: 500 },
    );
  }

  const { data: booking, error: bookingError } = await service
    .from("bookings")
    .select("id, client_name, client_email, booking_date, language")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError || !booking) {
    return NextResponse.json(
      { error: bookingError?.message || "Фотосессия не найдена." },
      { status: 404 },
    );
  }

  const now = new Date().toISOString();
  const { data: existingGallery, error: existingGalleryError } = await service
    .from("client_galleries")
    .select("status, sent_at")
    .eq("booking_kind", "photo")
    .eq("booking_reference", bookingId)
    .maybeSingle();

  if (existingGalleryError) {
    return NextResponse.json(
      { error: existingGalleryError.message },
      { status: 500 },
    );
  }

  const { data: gallery, error: saveError } = await service
    .from("client_galleries")
    .upsert(
      {
        booking_kind: "photo",
        booking_reference: bookingId,
        client_name: cleanText(booking.client_name) || "Клиент",
        client_email: cleanText(booking.client_email).toLowerCase() || null,
        booking_date: booking.booking_date,
        language: booking.language === "pl" ? "pl" : "uk",
        pixover_url: pixoverUrl,
        access_password: password || null,
        status: existingGallery?.status || "draft",
        sent_at: existingGallery?.sent_at || null,
        updated_at: now,
      },
      { onConflict: "booking_kind,booking_reference" },
    )
    .select(
      "id, booking_reference, pixover_url, access_password, public_token, status, sent_at",
    )
    .single();

  if (saveError || !gallery) {
    return NextResponse.json(
      { error: saveError?.message || "Не удалось сохранить галерею." },
      { status: 500 },
    );
  }

  if (sendEmail) {
    const resendKey = process.env.RESEND_API_KEY;
    const clientEmail = cleanText(booking.client_email).toLowerCase();

    if (!resendKey || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      return NextResponse.json(
        { error: "Не настроен Resend или в брони нет правильного email." },
        { status: 400 },
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.STRIPE_SITE_URL ||
      new URL(request.url).origin;
    const galleryPageUrl = `${baseUrl.replace(/\/$/, "")}/gallery/${gallery.public_token}`;
    const language = booking.language === "pl" ? "pl" : "uk";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [clientEmail],
        subject:
          language === "pl"
            ? `Twoje zdjęcia są gotowe · ${STUDIO_NAME}`
            : `Ваші фотографії готові · ${STUDIO_NAME}`,
        html: buildEmailHtml({
          language,
          clientName: cleanText(booking.client_name) || "Клієнте",
          bookingDate: booking.booking_date,
          galleryPageUrl,
          password,
        }),
      }),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      console.error("Pixover gallery email failed:", details);

      return NextResponse.json(
        { error: "Галерея сохранена, но письмо не отправилось." },
        { status: 502 },
      );
    }

    const { error: sentStatusError } = await service
      .from("client_galleries")
      .update({ status: "sent", sent_at: now, updated_at: now })
      .eq("id", gallery.id);

    if (sentStatusError) {
      return NextResponse.json(
        {
          error:
            "Письмо отправлено, но статус отправки не сохранился. Обновите страницу.",
        },
        { status: 500 },
      );
    }

    gallery.status = "sent";
    gallery.sent_at = now;
  }

  return NextResponse.json({ gallery });
}
