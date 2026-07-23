import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Галерея клиента · Sister's Photo Studio",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ token: string }>;
};

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

function formatDate(value: string | null, language: "uk" | "pl") {
  if (!value) return "";
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

export default async function ClientGalleryPage({ params }: Props) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) notFound();

  const service = getServiceClient();
  if (!service) notFound();

  const { data: gallery } = await service
    .from("client_galleries")
    .select(
      "client_name, booking_date, language, pixover_url, access_password, status",
    )
    .eq("public_token", token)
    .eq("status", "sent")
    .maybeSingle();

  if (!gallery) notFound();

  const language: "uk" | "pl" = gallery.language === "pl" ? "pl" : "uk";
  const isPolish = language === "pl";

  return (
    <main className="min-h-screen bg-[#160d09] px-4 py-12 text-[#f8efe7] sm:px-6">
      <section className="mx-auto flex min-h-[78vh] max-w-3xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[32px] border border-white/15 bg-[#24140e] shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
          <div className="border-b border-white/10 px-6 py-10 text-center sm:px-12 sm:py-14">
            <p className="text-xs uppercase tracking-[0.32em] text-[#d8ad8d]">
              Sister&apos;s Photo Studio
            </p>
            <h1 className="mt-5 font-serif text-4xl tracking-[-0.03em] sm:text-5xl">
              {isPolish ? "Twoje zdjęcia są gotowe" : "Ваші фотографії готові"}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#d8c6ba] sm:text-base">
              {isPolish
                ? `${gallery.client_name ? `${gallery.client_name}, p` : "P"}rzygotowaliśmy dla Ciebie prywatną galerię z tej sesji.`
                : `${gallery.client_name ? `${gallery.client_name}, м` : "М"}и зберегли для вас особливі моменти цієї зйомки у приватній галереї.`}
            </p>
          </div>

          <div className="px-6 py-9 text-center sm:px-12 sm:py-12">
            {gallery.booking_date && (
              <p className="text-sm text-[#c9b5a7]">
                {isPolish ? "Data sesji" : "Дата фотосесії"} ·{" "}
                {formatDate(gallery.booking_date, language)}
              </p>
            )}

            {gallery.access_password && (
              <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-[#76523e] bg-[#1b0f0a] px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#b9957e]">
                  {isPolish ? "Hasło do galerii" : "Пароль до галереї"}
                </p>
                <p className="mt-2 break-all text-lg font-semibold tracking-[0.08em] text-white">
                  {gallery.access_password}
                </p>
              </div>
            )}

            <a
              href={gallery.pixover_url}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex rounded-full bg-[#f4e7dd] px-7 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#2b1a12] transition hover:bg-white"
            >
              {isPolish ? "Otwórz moją galerię" : "Відкрити мою галерею"}
            </a>

            <p className="mx-auto mt-7 max-w-md text-xs leading-6 text-[#9f8c80]">
              {isPolish
                ? "To prywatny link. Prosimy nie udostępniać go osobom trzecim."
                : "Це приватне посилання. Будь ласка, не передавайте його стороннім особам."}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
