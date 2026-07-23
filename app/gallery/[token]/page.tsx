import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { STUDIO_NAME } from "@/lib/server/studio-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Private gallery · ${STUDIO_NAME}`,
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ token: string }>;
};

type Copy = {
  ready: string;
  intro: (name: string | null) => string;
  date: string;
  password: string;
  open: string;
  privacy: string;
};

const copyByLanguage: Record<string, Copy> = {
  en: {
    ready: "Your private gallery is ready",
    intro: (name) => `${name ? `${name}, y` : "Y"}our files are waiting in a private gallery prepared for this project.`,
    date: "Project date",
    password: "Gallery password",
    open: "Open private gallery",
    privacy: "This is a private link. Share it only with people who should have access.",
  },
  ru: {
    ready: "Ваша личная галерея готова",
    intro: (name) => `${name ? `${name}, в` : "В"}аши материалы собраны в приватной галерее этого проекта.`,
    date: "Дата проекта",
    password: "Пароль галереи",
    open: "Открыть личную галерею",
    privacy: "Это приватная ссылка. Передавайте её только тем, кому нужен доступ.",
  },
  uk: {
    ready: "Ваша особиста галерея готова",
    intro: (name) => `${name ? `${name}, в` : "В"}аші матеріали зібрані у приватній галереї цього проєкту.`,
    date: "Дата проєкту",
    password: "Пароль галереї",
    open: "Відкрити особисту галерею",
    privacy: "Це приватне посилання. Передавайте його лише тим, кому потрібен доступ.",
  },
  pl: {
    ready: "Twoja prywatna galeria jest gotowa",
    intro: (name) => `${name ? `${name}, Twoje` : "Twoje"} materiały czekają w prywatnej galerii tego projektu.`,
    date: "Data projektu",
    password: "Hasło do galerii",
    open: "Otwórz prywatną galerię",
    privacy: "To prywatny link. Udostępniaj go tylko osobom, które powinny mieć dostęp.",
  },
};

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function formatDate(value: string | null, language: string) {
  if (!value) return "";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  const [, year, month, day] = match;
  const locale = language === "ru" ? "ru-RU" : language === "uk" ? "uk-UA" : language === "pl" ? "pl-PL" : "en-GB";
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(Number(year), Number(month) - 1, Number(day))),
  );
}

export default async function ClientGalleryPage({ params }: Props) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) notFound();

  const service = getServiceClient();
  if (!service) notFound();

  const { data: gallery } = await service
    .from("client_galleries")
    .select("client_name,booking_date,language,pixover_url,access_password,status")
    .eq("public_token", token)
    .eq("status", "sent")
    .maybeSingle();

  if (!gallery) notFound();

  const language = String(gallery.language || "en").split("-")[0].toLowerCase();
  const copy = copyByLanguage[language] || copyByLanguage.en;

  return (
    <main className="min-h-screen bg-[#111318] px-4 py-12 text-[#f7f4ed] sm:px-6">
      <section className="mx-auto flex min-h-[78vh] max-w-3xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[32px] border border-white/12 bg-[#1a1d24] shadow-[0_30px_100px_rgba(0,0,0,0.42)]">
          <div className="border-b border-white/10 px-6 py-10 text-center sm:px-12 sm:py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d8b36a]">{STUDIO_NAME}</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">{copy.ready}</h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/68 sm:text-base">{copy.intro(gallery.client_name)}</p>
          </div>

          <div className="px-6 py-9 text-center sm:px-12 sm:py-12">
            {gallery.booking_date && <p className="text-sm text-white/65">{copy.date} · {formatDate(gallery.booking_date, language)}</p>}

            {gallery.access_password && (
              <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-white/12 bg-black/20 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-[#d8b36a]">{copy.password}</p>
                <p className="mt-2 break-all text-lg font-semibold tracking-[0.08em] text-white">{gallery.access_password}</p>
              </div>
            )}

            <a href={gallery.pixover_url} target="_blank" rel="noreferrer" className="mt-8 inline-flex rounded-full bg-[#f5f1e8] px-7 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#17191f] transition hover:bg-white">
              {copy.open}
            </a>

            <p className="mx-auto mt-7 max-w-md text-xs leading-6 text-white/45">{copy.privacy}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
