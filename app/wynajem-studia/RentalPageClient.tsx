"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LanguageProvider, useLanguage } from "../../lib/language-provider";
import {
  fallbackSiteRentalContent,
  splitRentalLines,
  type RentalCondition,
  type RentalFaqItem,
  type SiteRentalContent,
} from "@/lib/rental-content";
import type { RentalAvailabilityDay } from "@/lib/public-site-data";

type StudioZone = {
  id: string;
  name: string;
  name_uk: string;
  name_pl: string;
  description_uk: string;
  description_pl: string;
  image_url: string;
};

type SiteContacts = {
  address: string;
  hours_uk: string;
  hours_pl: string;
  google_maps_query: string;
};

export type RentalPageClientProps = {
  initialContent: SiteRentalContent;
  initialZones: StudioZone[];
  initialContacts: SiteContacts;
  rentalVideoEnabled: boolean;
  rentalVideoUrl: string;
  calendarEnabled: boolean;
  initialAvailability: RentalAvailabilityDay[];
};

const dateKey = (date: Date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, "0"),
  String(date.getDate()).padStart(2, "0"),
].join("-");

function AvailabilityCalendar({
  availability,
  pl,
}: {
  availability: RentalAvailabilityDay[];
  pl: boolean;
}) {
  const today = useMemo(() => {
    const current = new Date();
    return new Date(current.getFullYear(), current.getMonth(), current.getDate());
  }, []);
  const [monthOffset, setMonthOffset] = useState(0);
  const visibleMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = (visibleMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const statusByDate = useMemo(
    () => new Map(availability.map((item) => [item.date, item.status])),
    [availability],
  );
  const weekDays = pl
    ? ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"]
    : ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
  const monthTitle = new Intl.DateTimeFormat(pl ? "pl-PL" : "uk-UA", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);
  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  return (
    <section className="border-y border-[#dfcdbf] bg-[#fffaf6]">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[.7fr_1.3fr] lg:items-center lg:px-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.3em] text-[#8e6652]">
            {pl ? "Dostępność studia" : "Доступність студії"}
          </p>
          <h2 className="mt-3 font-serif text-4xl uppercase leading-tight">
            {pl ? "Sprawdź zajęte dni" : "Перевірте зайняті дні"}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-[#725446]">
            {pl
              ? "Zaznaczenie oznacza, że część lub cały dzień jest już zarezerwowany. Dokładne wolne godziny zobaczysz podczas rezerwacji."
              : "Позначка означає, що частина або весь день уже заброньовані. Точні вільні години ви побачите під час бронювання."}
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-[#604333]">
            <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-[#d7a46d]" />{pl ? "Częściowo zajęty" : "Частково зайнятий"}</span>
            <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-[#5b3a2d]" />{pl ? "Brak wolnych godzin" : "Немає вільних годин"}</span>
          </div>
          <Link href="/wynajem-studia/rezerwacja" className="mt-7 inline-flex rounded-lg bg-[#2b1b14] px-6 py-4 text-xs font-bold uppercase tracking-[.12em] text-white">
            {pl ? "Wybierz dokładną godzinę" : "Обрати точний час"}
          </Link>
        </div>

        <div className="rounded-2xl border border-[#dcc9bb] bg-white p-4 shadow-[0_20px_60px_rgba(83,54,37,.08)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={() => setMonthOffset((value) => Math.max(0, value - 1))} disabled={monthOffset === 0} aria-label={pl ? "Poprzedni miesiąc" : "Попередній місяць"} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dcc9bb] text-xl disabled:opacity-25">‹</button>
            <p className="text-center font-serif text-xl font-semibold capitalize">{monthTitle}</p>
            <button type="button" onClick={() => setMonthOffset((value) => Math.min(5, value + 1))} disabled={monthOffset === 5} aria-label={pl ? "Następny miesiąc" : "Наступний місяць"} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dcc9bb] text-xl disabled:opacity-25">›</button>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-1 text-center">
            {weekDays.map((day) => <div key={day} className="py-2 text-[11px] font-bold uppercase text-[#9a7865]">{day}</div>)}
            {cells.map((day, index) => {
              if (day === null) return <div key={`empty-${index}`} />;
              const currentDate = new Date(year, month, day);
              const isPast = currentDate < today;
              const status = statusByDate.get(dateKey(currentDate));
              const title = status === "full"
                ? (pl ? "Brak wolnych godzin" : "Немає вільних годин")
                : status === "partial"
                  ? (pl ? "Częściowo zajęty" : "Частково зайнятий")
                  : (pl ? "Wolny dzień" : "Вільний день");

              return (
                <div key={day} title={title} className={`relative flex aspect-square items-center justify-center rounded-xl text-sm ${isPast ? "text-[#c9b8ab]" : "text-[#38251c]"} ${status === "full" ? "bg-[#5b3a2d] font-semibold text-white" : status === "partial" ? "bg-[#f2dfc9] font-semibold" : "bg-[#faf6f2]"}`}>
                  {day}
                  {status === "partial" ? <span className="absolute bottom-1.5 h-1.5 w-1.5 rounded-full bg-[#b6763c]" /> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function StudioVideoOverview({ videoUrl, pl }: { videoUrl: string; pl: boolean }) {
  return (
    <section className="bg-[#28170f] px-5 py-14 text-[#fffaf5] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-xs font-bold uppercase tracking-[.3em] text-[#d8a889]">
          {pl ? "Zobacz studio" : "Побачте студію"}
        </p>
        <h2 className="mt-3 font-serif text-4xl uppercase leading-tight sm:text-5xl">
          {pl ? "Wideo prezentacja studia" : "Відеоогляд фотостудії"}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#e2d2c8]">
          {pl
            ? "Zobacz przestrzeń, wnętrza i atmosferę studia przed rezerwacją."
            : "Подивіться простір, інтер’єри й атмосферу студії перед бронюванням."}
        </p>
        <div className="mt-8 aspect-video overflow-hidden rounded-2xl border border-white/15 bg-black shadow-[0_28px_80px_rgba(0,0,0,.38)] sm:rounded-[28px]">
          <video
            src={videoUrl}
            poster={videoUrl === "/videos/training-student-story.mp4" ? "/images/site/training-student-story-poster.webp" : undefined}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

const fallbackGalleryImages = [
  "/images/rental/cyklorama.webp",
  "/images/rental/warm-interior.webp",
  "/images/rental/loft-interior.webp",
  "/images/rental/equipment.webp",
  "/images/rental/creative-session.webp",
];

const equipmentR2Image = "https://cdn.sistersstudio.pl/portrait/1784073556756-photoequipment-e39e6c7b-6546-4276-b7cc-e464f922cefa.webp";

const fallbackZones: StudioZone[] = [
  {
    id: "cyclorama",
    name: "Cyklorama",
    name_uk: "Циклорама",
    name_pl: "Cyklorama",
    description_uk: "Професійний простір для fashion, beauty, портретних і предметних зйомок.",
    description_pl: "Profesjonalna przestrzeń do sesji fashion, beauty, portretowych i produktowych.",
    image_url: fallbackGalleryImages[0],
  },
  {
    id: "classic",
    name: "Classic Studio",
    name_uk: "Classic Studio",
    name_pl: "Classic Studio",
    description_uk: "Теплий інтерʼєр для контенту, персональних зйомок і брендів.",
    description_pl: "Ciepłe wnętrze do contentu, sesji osobistych i dla marek.",
    image_url: fallbackGalleryImages[1],
  },
  {
    id: "makeup",
    name: "Make-up room",
    name_uk: "Make-up room",
    name_pl: "Make-up room",
    description_uk: "Місце для макіяжу, зачіски та підготовки образів.",
    description_pl: "Miejsce do makijażu, fryzury i przygotowania stylizacji.",
    image_url: fallbackGalleryImages[4],
  },
];

type IconName =
  | "calendar" | "clock" | "mail" | "camera" | "hourglass" | "repeat"
  | "timer" | "card" | "flash" | "sun" | "aperture" | "video"
  | "photographer" | "videographer" | "beauty" | "hanger" | "content" | "heart"
  | "makeup" | "background" | "map" | "softbox" | "dish" | "monitor";

function LineIcon({ name, className = "h-8 w-8" }: { name: IconName; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths: Record<IconName, ReactNode> = {
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18M8 14h2M14 14h2M8 18h2"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>,
    camera: <><path d="M4 8h4l2-3h4l2 3h4a2 2 0 0 1 2 2v9H2v-9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="14" r="4"/></>,
    hourglass: <><path d="M6 3h12M6 21h12M7 3c0 5 5 5 5 9s-5 4-5 9M17 3c0 5-5 5-5 9s5 4 5 9"/></>,
    repeat: <><path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3"/></>,
    timer: <><circle cx="12" cy="13" r="8"/><path d="M9 2h6M12 5v2M12 13l3-3"/></>,
    card: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></>,
    flash: <><path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    aperture: <><circle cx="12" cy="12" r="9"/><path d="m12 3 4 7M20 9h-8M17 19l-4-7M4 15h8M7 5l4 7M4 9h8"/></>,
    video: <><rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3"/></>,
    photographer: <><circle cx="9" cy="6" r="3"/><path d="M3 21v-5a6 6 0 0 1 12 0v5M16 11h5v7h-5M17 11l1-2h2l1 2"/></>,
    videographer: <><rect x="4" y="7" width="12" height="12" rx="2"/><path d="m16 11 5-3v10l-5-3M8 7V4h4v3"/></>,
    beauty: <><path d="M6 21V8l3-5 3 5v13M9 3l3 5M15 21V11l3-3 3 3v10"/></>,
    hanger: <><path d="M12 8V6a2 2 0 1 0-2-2M12 8 3 17h18l-9-9Z"/></>,
    content: <><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01"/></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>,
    makeup: <><circle cx="8" cy="8" r="4"/><path d="M8 12v9M4 16h8M17 4v13M14 17h6v4h-6z"/></>,
    background: <><path d="M5 4h14M7 4v16M17 4v16M5 20h14"/><path d="M7 16c4-3 6-3 10 0"/></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/></>,
    softbox: <><path d="m4 4 9 2-2 9-8-4 1-7Z"/><path d="M11 15 8 21M11 15l4 6M11 15v6M13 8l4-2v8l-5-2"/></>,
    dish: <><path d="M5 5c8 0 13 4 14 10-6 1-11-1-14-6V5Z"/><path d="M8 8c4 1 7 3 9 6M12 14l-2 7M12 14l5 7M12 14v7"/><circle cx="9" cy="9" r="1.5"/></>,
    monitor: <><rect x="3" y="3" width="18" height="14" rx="2"/><path d="m10 8 5 3-5 3V8ZM8 21h8M12 17v4"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...common}>{paths[name]}</svg>;
}

const hasText = (value: string) => /[\p{L}\p{N}]/u.test(value || "");

function RentalPageContent({ initialContent, initialZones, initialContacts, rentalVideoEnabled, rentalVideoUrl, calendarEnabled, initialAvailability }: RentalPageClientProps) {
  const { lang } = useLanguage();
  const pl = lang === "pl";
  const content = initialContent;
  const zones = initialZones;
  const contacts = initialContacts;
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const galleryImages = [
    content.gallery_image_1_url || fallbackGalleryImages[0],
    content.gallery_image_2_url || fallbackGalleryImages[1],
    content.gallery_image_3_url || fallbackGalleryImages[2],
    content.gallery_image_4_url || fallbackGalleryImages[3],
    content.gallery_image_5_url || fallbackGalleryImages[4],
  ];

  const copy = useMemo(() => ({
    heroEyebrow: pl ? "Wynajem studia fotograficznego w Warszawie" : "Оренда фотостудії у Варшаві",
    heroTitle: pl ? "Przestrzeń dla Twojej sesji" : "Простір для вашої зйомки",
    heroText: pl ? "Studio do zdjęć, wideo, beauty i contentu. Profesjonalne światło, tła i sprzęt są już przygotowane." : "Студія для фото, відео, beauty та контент-зйомок. Професійне світло, фони та техніка — усе готове для вашого проєкту.",
    book: pl ? "Zarezerwuj" : "Забронювати",
    check: pl ? "Sprawdź wolny termin" : "Перевірити вільний час",
    spaces: pl ? content.zones_eyebrow_pl : content.zones_eyebrow_uk,
    details: pl ? "Szczegóły →" : "Детальніше →",
    galleryEyebrow: pl ? "Zobacz przestrzeń" : "Побачте простір",
    galleryTitle: pl ? "Przed rezerwacją" : "До бронювання",
    galleryButton: pl ? "Otwórz galerię" : "Відкрити галерею",
    includedEyebrow: pl ? "Co obejmuje cena" : "Що входить у вартість",
    includedTitle: pl ? "Wszystko, czego potrzebujesz, jest już w studio" : "Усе необхідне вже у студії",
    includedText: pl ? "Profesjonalne światło, tła i sprzęt są przygotowane do Twojej sesji." : "Професійне світло, фони та техніка вже підготовлені для вашої зйомки.",
    fullEquipment: pl ? "Pełna lista wyposażenia" : "Повний список обладнання",
    forWho: pl ? "Dla kogo" : "Для кого",
    forWhoTitle: pl ? "Studio do zdjęć, wideo, beauty i contentu" : "Студія для фото, відео, beauty та контенту",
    process: pl ? "Jak przebiega wynajem" : "Як відбувається оренда",
    faq: pl ? "Częste pytania" : "Часті запитання",
    fullRules: pl ? "Pełny regulamin wynajmu" : "Повні правила оренди",
    fullRulesNote: pl ? "Przed rezerwacją sprawdź wszystkie zasady korzystania ze studia." : "Перед бронюванням ознайомтеся з усіма правилами користування студією.",
    location: pl ? "Jesteśmy w Warszawie" : "Ми у Варшаві",
    maps: pl ? "Otwórz Google Maps" : "Відкрити Google Maps",
    directions: pl ? "Jak nas znaleźć" : "Як нас знайти",
    finalTitle: pl ? "Gotowi zarezerwować studio?" : "Готові забронювати студію?",
    finalText: pl ? "Wybierz datę i dogodny czas — potwierdzenie otrzymasz na email." : "Оберіть дату та зручний час — підтвердження прийде на email.",
  }), [content.zones_eyebrow_pl, content.zones_eyebrow_uk, pl]);

  const displayedZones = [...zones, ...fallbackZones].slice(0, 3).map((zone, index) => ({
    ...zone,
    title: pl ? zone.name_pl || zone.name : zone.name_uk || zone.name,
    description: pl ? zone.description_pl || zone.description_uk : zone.description_uk || zone.description_pl,
    image_url: zone.image_url || galleryImages[index],
  }));

  const equipmentCategories = content.equipment_categories.filter((category) =>
    splitRentalLines(pl ? category.items_pl : category.items_uk).length > 0,
  );
  const displayedEquipment = equipmentCategories.length >= 4
    ? equipmentCategories
    : fallbackSiteRentalContent.equipment_categories;
  const equipmentItems = displayedEquipment.map((category) =>
    splitRentalLines(pl ? category.items_pl : category.items_uk),
  );
  const equipmentHighlights = [
    {
      title: pl ? "Światło" : "Світло",
      icon: "softbox" as IconName,
      items: [...(equipmentItems[0] || []), ...(equipmentItems[1] || [])].slice(0, 3),
    },
    {
      title: pl ? "Modyfikatory" : "Модифікатори",
      icon: "dish" as IconName,
      items: (equipmentItems[2] || []).slice(0, 3),
    },
    {
      title: pl ? "Do wideo i contentu" : "Для відео та контенту",
      icon: "monitor" as IconName,
      items: (equipmentItems[3] || []).slice(0, 3),
    },
  ];

  const processSteps = pl ? [
    ["Wybierz datę", "Sprawdź kalendarz i wybierz dogodny dzień."],
    ["Wskaż godzinę", "Wybierz początek i długość wynajmu."],
    ["Odbierz potwierdzenie", "Wyślemy potwierdzenie na email."],
    ["Przyjedź na sesję", "Studio jest przygotowane — możesz tworzyć."],
  ] : [
    ["Оберіть дату", "Перегляньте розклад та оберіть зручну дату."],
    ["Вкажіть час", "Виберіть початок та тривалість оренди."],
    ["Отримайте підтвердження", "Ми надішлемо підтвердження на email."],
    ["Приїжджайте на зйомку", "Студія підготовлена — починайте творити."],
  ];

  const conditionIcons: IconName[] = ["clock", "timer", "hourglass", "repeat"];
  const fallbackConditionText = pl ? "Szczegółowe zasady zobaczysz przed potwierdzeniem rezerwacji." : "Детальні умови ви побачите перед підтвердженням бронювання.";
  const conditionIds = ["start", "late", "finish", "changes"];
  const displayedConditions = conditionIds.map((id): RentalCondition => {
    const fallbackCondition = fallbackSiteRentalContent.rental_conditions.find((item) => item.id === id)!;
    const saved = content.rental_conditions.find((item) => item.id === fallbackCondition.id);
    return {
      ...fallbackCondition,
      ...saved,
      title_uk: saved && hasText(saved.title_uk) ? saved.title_uk : fallbackCondition.title_uk,
      title_pl: saved && hasText(saved.title_pl) ? saved.title_pl : fallbackCondition.title_pl,
      text_uk: saved && hasText(saved.text_uk) ? saved.text_uk : fallbackConditionText,
      text_pl: saved && hasText(saved.text_pl) ? saved.text_pl : fallbackConditionText,
    };
  });

  const audience = pl ? ["Fotografom", "Filmowcom", "Branży beauty", "Markom odzieżowym", "Twórcom contentu", "Sesjom osobistym"] : ["Фотографам", "Відеографам", "Beauty-майстрам", "Брендам одягу", "Контент-кріейторам", "Особистим зйомкам"];
  const audienceIcons: IconName[] = ["photographer", "videographer", "beauty", "hanger", "content", "heart"];

  const faqIds = ["included", "prepayment", "cancel", "start", "late", "finish", "extend", "makeup", "photographer", "video", "props", "shoes", "invoice"];
  const displayedFaq = faqIds.map((id): RentalFaqItem | null => {
    const fallbackFaq = fallbackSiteRentalContent.faq_items.find((item) => item.id === id);
    const saved = content.faq_items.find((item) => item.id === id);
    if (!fallbackFaq) return null;
    return {
      ...fallbackFaq,
      ...saved,
      question_uk: saved && hasText(saved.question_uk) ? saved.question_uk : fallbackFaq.question_uk,
      question_pl: saved && hasText(saved.question_pl) ? saved.question_pl : fallbackFaq.question_pl,
      answer_uk: saved && hasText(saved.answer_uk) ? saved.answer_uk : fallbackFaq.answer_uk,
      answer_pl: saved && hasText(saved.answer_pl) ? saved.answer_pl : fallbackFaq.answer_pl,
    };
  }).filter((item): item is RentalFaqItem => Boolean(item));

  const mapQuery = contacts.google_maps_query || contacts.address;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
  const heroImage = hasText(content.hero_image_url) ? content.hero_image_url : "/images/rental/rental-hero-wide.webp";
  const locationPhoto = content.location_door_image_url || content.location_image_url || galleryImages[2];

  return (
    <main className="min-h-screen bg-[#f7f0e9] text-[#2b1b14]">
      <Header />

      <section className="relative min-h-[700px] overflow-hidden bg-[#120c08] px-5 pt-28 text-white sm:px-8 lg:px-12">
        <Image src={heroImage} alt="Sisters Photo Studio" fill priority quality={86} sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,6,4,.94)_0%,rgba(10,6,4,.75)_42%,rgba(10,6,4,.18)_76%)]" />
        <div className="relative z-10 mx-auto flex min-h-[572px] max-w-7xl items-center">
          <div className="max-w-xl py-14">
            <p className="text-xs font-bold uppercase tracking-[.3em] text-[#e8b99d]">{copy.heroEyebrow}</p>
            <h1 className="mt-6 font-serif text-5xl uppercase leading-[1.02] sm:text-6xl">{copy.heroTitle}</h1>
            <p className="mt-6 max-w-lg text-sm leading-7 text-white/78">{copy.heroText}</p>
            <div className="mt-7 inline-flex rounded-xl bg-[#ead0ad] px-5 py-3 text-2xl font-semibold text-[#2b1b14]">{content.rental_price}</div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/wynajem-studia/rezerwacja" className="rounded-xl bg-[#e9a0b0] px-7 py-4 text-xs font-bold uppercase tracking-[.14em] text-[#2b1b14]">{copy.book}</Link>
              <Link href="/wynajem-studia/rezerwacja" className="rounded-xl border border-white/55 px-7 py-4 text-xs font-bold uppercase tracking-[.14em]">{copy.check}</Link>
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs text-white/65"><LineIcon name="mail" className="h-4 w-4" />{pl ? "Potwierdzenie rezerwacji na email" : "Підтвердження бронювання на email"}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
        <p className="text-xs font-bold uppercase tracking-[.3em] text-[#8e6652]">{copy.spaces}</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {displayedZones.map((zone) => (
            <article key={zone.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-[#d9ccc1]">
              <img src={zone.image_url} alt={zone.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <h2 className="text-xl font-semibold">{zone.title}</h2>
                <p className="mt-2 text-xs text-white/75">{copy.details}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 grid overflow-hidden rounded-xl border border-[#decbbc] bg-white sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["clock" as IconName, content.rental_price, pl ? "za godzinę" : "за годину"],
            ["makeup" as IconName, "Make-up room", content.makeup_price],
            ["background" as IconName, content.backgrounds_count, pl ? "teł fotograficznych" : "фотографічних фонів"],
            ["clock" as IconName, pl ? contacts.hours_pl : contacts.hours_uk, pl ? "codziennie" : "щодня"],
          ].map(([icon, value, label]) => (
            <div key={`${value}-${label}`} className="flex items-center gap-4 border-b border-r border-[#eaded5] p-5 lg:border-b-0">
              <LineIcon name={icon as IconName} className="h-10 w-10 shrink-0 text-[#7f5b49]" />
              <div><p className="font-semibold">{value}</p><p className="mt-1 text-xs text-[#725446]">{label}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[#e0d0c3] bg-[#fffaf6]">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 py-12 sm:px-8 lg:grid-cols-[.44fr_1.56fr] lg:px-12">
          <div className="flex flex-col items-start justify-center">
            <p className="text-xs font-bold uppercase tracking-[.3em] text-[#8e6652]">{copy.galleryEyebrow}</p>
            <h2 className="mt-2 font-serif text-4xl uppercase leading-tight">{copy.galleryTitle}</h2>
            <a href="#spaces" className="mt-6 rounded-lg border border-[#ca928b] px-5 py-3 text-xs font-bold uppercase tracking-[.12em] text-[#a2665e]">{copy.galleryButton}</a>
          </div>
          <div id="spaces" className="grid grid-cols-2 gap-2 sm:min-h-[430px] sm:grid-cols-3 sm:grid-rows-2">
            <img src={galleryImages[0]} alt="Cyklorama" className="col-span-2 aspect-[4/3] w-full rounded-xl object-cover sm:col-span-1 sm:row-span-2 sm:aspect-auto sm:h-full" />
            <img src={galleryImages[1]} alt="Classic Studio" className="aspect-square w-full rounded-xl object-cover sm:aspect-auto sm:h-full" />
            <img src={galleryImages[2]} alt="Loft Studio" className="aspect-square w-full rounded-xl object-cover sm:aspect-auto sm:h-full" />
            <img src={galleryImages[3]} alt="Studio equipment" className="aspect-square w-full rounded-xl object-cover sm:aspect-auto sm:h-full" />
            <img src={galleryImages[4]} alt="Make-up room" className="aspect-square w-full rounded-xl object-cover sm:aspect-auto sm:h-full" />
          </div>
        </div>
      </section>

      <section className="bg-[#28170f] text-[#fffaf5]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1.5fr_.92fr] lg:items-stretch lg:px-12">
          <div className="flex min-w-0 flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[.3em] text-[#d8a889]">{copy.includedEyebrow}</p>
            <h2 className="mt-4 font-serif text-4xl uppercase leading-[1.04] sm:text-5xl">{copy.includedTitle}</h2>
            <p className="mt-5 text-sm leading-7 text-white/65">{copy.includedText}</p>

            <div className="mt-7 grid gap-3 md:grid-cols-3">
              {equipmentHighlights.map((group) => <article key={group.title} className="min-h-64 rounded-xl border border-white/20 bg-white/[.025] p-5">
                <LineIcon name={group.icon} className="h-11 w-11 text-[#e5a3b2]" />
                <h3 className="mt-5 text-sm font-bold uppercase tracking-[.12em]">{group.title}</h3>
                <div className="mt-5 space-y-3 text-sm leading-6 text-white/70">
                  {group.items.map((item) => <p key={item} className="flex gap-2"><span className="text-[#e5a3b2]">•</span>{item}</p>)}
                </div>
              </article>)}
            </div>

            <div className="mt-3 overflow-hidden rounded-lg border border-white/25">
              <button type="button" onClick={() => setEquipmentOpen((current) => !current)} className="flex w-full items-center justify-between px-5 py-4 text-left text-xs font-bold uppercase tracking-[.12em]">
                {copy.fullEquipment}<span className="text-xl">{equipmentOpen ? "−" : "+"}</span>
              </button>
              {equipmentOpen ? <div className="grid gap-6 border-t border-white/20 p-5 sm:grid-cols-2">
                {displayedEquipment.map((category) => <div key={category.id}>
                  <p className="font-semibold">{pl ? category.title_pl : category.title_uk}</p>
                  <div className="mt-3 space-y-2 text-xs leading-5 text-white/65">{splitRentalLines(pl ? category.items_pl : category.items_uk).map((item) => <p key={item}>• {item}</p>)}</div>
                </div>)}
              </div> : null}
            </div>
          </div>

          <div className="min-h-[520px] overflow-hidden rounded-xl">
            <img src={content.equipment_image_url || equipmentR2Image} alt="Sisters Studio equipment" className="h-full w-full object-cover object-center" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-7 lg:grid-cols-[.58fr_1fr_.72fr] lg:items-center">
          <div><p className="text-xs font-bold uppercase tracking-[.3em] text-[#a06e58]">{copy.forWho}</p><h2 className="mt-3 font-serif text-4xl uppercase leading-[1.04]">{copy.forWhoTitle}</h2></div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {audience.map((item, index) => <article key={item} className="flex min-h-28 flex-col items-center justify-center rounded-xl border border-[#dfcfc2] bg-white p-4 text-center">
              <LineIcon name={audienceIcons[index]} className="h-8 w-8 text-[#a06e58]" /><p className="mt-3 text-xs font-semibold">{item}</p>
            </article>)}
          </div>
          <img src={content.audience_image_url || galleryImages[4]} alt="Content session in Sisters Studio" className="aspect-[4/3] h-full w-full rounded-xl object-cover" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8 lg:px-12">
        <p className="text-xs font-bold uppercase tracking-[.3em] text-[#8e6652]">{copy.process}</p>
        <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {processSteps.map(([title, text], index) => <article key={title} className="flex gap-4 border-b border-[#d8c2b2] pb-6 lg:border-b-0 lg:border-r lg:pr-5">
            <span className="font-serif text-4xl text-[#bd8a70]">{String(index + 1).padStart(2, "0")}</span>
            <div><LineIcon name={(["calendar", "clock", "mail", "camera"] as IconName[])[index]} className="h-7 w-7 text-[#664839]" /><h3 className="mt-3 text-sm font-semibold">{title}</h3><p className="mt-2 text-xs leading-5 text-[#725446]">{text}</p></div>
          </article>)}
        </div>
        <div className="mt-7 grid overflow-hidden rounded-xl border border-[#dfcdbf] bg-[#f0e4d9] sm:grid-cols-2 lg:grid-cols-4">
          {displayedConditions.map((condition, index) => <article key={condition.id} className="flex gap-3 border-b border-r border-[#dfcdbf] p-5 lg:border-b-0">
            <LineIcon name={conditionIcons[index]} className="h-7 w-7 shrink-0 text-[#664839]" />
            <div><h3 className="text-sm font-semibold">{pl ? condition.title_pl : condition.title_uk}</h3><p className="mt-2 text-xs leading-5 text-[#725446]">{pl ? condition.text_pl : condition.text_uk}</p></div>
          </article>)}
        </div>
        <div className="mt-4 flex flex-col gap-4 rounded-xl border border-[#dfcdbf] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-xs leading-5 text-[#725446]">{copy.fullRulesNote}</p>
          <Link href="/regulamin" className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#2b1b14] px-5 py-3 text-xs font-bold uppercase tracking-[.11em] text-white transition hover:bg-[#4b3024]">
            {copy.fullRules}<span aria-hidden="true" className="ml-2">→</span>
          </Link>
        </div>
      </section>

      {rentalVideoEnabled && rentalVideoUrl ? <StudioVideoOverview videoUrl={rentalVideoUrl} pl={pl} /> : null}

      {calendarEnabled ? <AvailabilityCalendar availability={initialAvailability} pl={pl} /> : null}

      <section className="border-y border-[#e0d0c3] bg-[#fffaf6]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-xs font-bold uppercase tracking-[.3em] text-[#8e6652]">{copy.faq}</p>
            <Link href="/regulamin" className="text-xs font-bold uppercase tracking-[.1em] text-[#8e6652] underline decoration-[#d5b9a8] underline-offset-4 hover:text-[#2b1b14]">{copy.fullRules} →</Link>
          </div>
          <div className="mt-6 grid gap-2 lg:grid-cols-2">
            {displayedFaq.map((faq, index) => {
              const open = openFaq === index;
              const answer = pl ? faq.answer_pl : faq.answer_uk;
              return <article key={faq.id} className="self-start overflow-hidden rounded-lg border border-[#dcc9bb] bg-white">
                <button type="button" onClick={() => setOpenFaq(open ? -1 : index)} className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold">{pl ? faq.question_pl : faq.question_uk}<span className="text-xl">{open ? "−" : "+"}</span></button>
                {open && hasText(answer) ? <p className="border-t border-[#eaded5] px-5 py-4 text-xs leading-6 text-[#725446]">{answer}</p> : null}
              </article>;
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
        <div className="overflow-hidden rounded-xl border border-[#dcc9bb] bg-white">
          <div className="grid lg:h-[320px] lg:grid-cols-[.9fr_1.15fr_1fr]">
            <div className="flex flex-col justify-center p-7">
              <p className="text-xs font-bold uppercase tracking-[.3em] text-[#8e6652]">{copy.location}</p>
              <p className="mt-4 font-serif text-2xl font-semibold leading-tight">{contacts.address}</p>
              <div className="mt-6 flex flex-wrap gap-2"><a href={mapsUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-[#2b1b14] px-5 py-3 text-xs font-bold uppercase tracking-[.1em] text-white">{copy.maps}</a><a href={mapsUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-[#cbb2a1] px-5 py-3 text-xs font-bold uppercase tracking-[.1em]">{copy.directions}</a></div>
            </div>
            <iframe src={mapEmbedUrl} title="Sisters Photo Studio map" loading="lazy" className="h-[320px] w-full border-0 lg:h-full" referrerPolicy="no-referrer-when-downgrade" />
            <div className="h-[320px] lg:h-full"><img src={locationPhoto} alt="Sisters Studio entrance" className="h-full w-full object-cover object-center" /></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-6 rounded-xl bg-[#dbb68f] px-7 py-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-5"><span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/70"><LineIcon name="calendar" className="h-7 w-7" /></span><div><h2 className="font-serif text-3xl uppercase">{copy.finalTitle}</h2><p className="mt-1 text-sm text-[#604333]">{copy.finalText}</p></div></div>
          <Link href="/wynajem-studia/rezerwacja" className="shrink-0 rounded-lg bg-[#2b1b14] px-7 py-4 text-xs font-bold uppercase tracking-[.12em] text-white">{copy.check}</Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function RentalPageClient(props: RentalPageClientProps) {
  return <LanguageProvider><RentalPageContent {...props} /></LanguageProvider>;
}
