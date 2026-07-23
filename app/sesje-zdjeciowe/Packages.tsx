"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../../lib/language-provider";
import { usePhotoshootsContent } from "../../lib/photoshoots-content";
import { supabase } from "../../lib/supabase";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import AnimatedTitle from "@/components/ui/AnimatedTitle";

const blush = "#E9A7B3";

type PackageItem = {
  id?: string;
  isConstructor?: boolean;
  title: string;
  price: string;
  label: string;
  popular?: boolean;
  description: string;
  includes: string[];
  details: {
    title: string;
    text: string;
  }[];
  bookingButton?: string;
};

type SupabasePackage = {
  id: string | number;
  title: string | null;
  price: number | null;
  description_uk: string | null;
  description_pl: string | null;
  duration_label_uk: string | null;
  duration_label_pl: string | null;
  button_label_uk: string | null;
  button_label_pl: string | null;
  currency: string | null;
  is_active: boolean | null;
  sort_order: number | null;
  is_constructor: boolean | null;
};

type PackageAddon = { id: string; title_uk: string; title_pl: string; price: number };

const packageContent: Record<"uk" | "pl", PackageItem[]> = {
  uk: [
    {
      title: "Premium Light",
      price: "2900 PLN",
      label: "Легка premium-зйомка",
      description:
        "Для персональної зйомки з повною стилізацією, beauty-підготовкою та готовим результатом.",
      includes: ["Образи", "Зачіска і макіяж", "Кольорокорекція", "Детальна ретуш"],
      details: [
        {
          title: "Образи",
          text:
            "2 образи, підібрані спеціально під ваш запит, зовнішність та формат зйомки. Заздалегідь ви отримуєте декілька варіантів стилізацій та обираєте ті, які найбільше відгукуються. Одяг, взуття та аксесуари стиліст готує і привозить на зйомку.",
        },
        {
          title: "Зачіска і макіяж",
          text:
            "Професійна beauty-команда готує вас до зйомки. У роботі використовуються premium та гіпоалергенні матеріали, щоб образ гармонійно підкреслював саме вашу зовнішність.",
        },
        {
          title: "Результат",
          text:
            "1 година фотосесії, 100+ фото у кольорокорекції та 15 фото у детальній ретуші на ваш вибір.",
        },
      ],
    },
    {
      title: "Premium Standart",
      price: "4000 PLN",
      label: "Популярний вибір",
      popular: true,
      description:
        "Для зйомки з фото, відео, легкими змінами образу та більш різноманітним результатом.",
      includes: [
        "Образи",
        "Зачіска і макіяж",
        "Відеограф",
        "Кольорокорекція",
        "Детальна ретуш",
        "Готове відео",
      ],
      details: [
        {
          title: "Образи",
          text:
            "2 образи, підібрані спеціально під ваш запит, зовнішність та формат зйомки. Стиліст заздалегідь готує одяг, взуття та аксесуари і привозить усе на зйомку.",
        },
        {
          title: "Зачіска і макіяж",
          text:
            "Beauty-команда готує вас до зйомки в 4 руки. Під час процесу команда може зробити легкі зміни в образі для різноманіття фото.",
        },
        {
          title: "Відеограф",
          text:
            "Професійна відеозйомка всього процесу. Ви отримуєте всі вдалі відеоматеріали та одне професійно змонтоване відео за вашими побажаннями.",
        },
        {
          title: "Результат",
          text:
            "2 години зйомки, 200+ фото у кольорокорекції, 40 фото у детальній ретуші на ваш вибір, усі вдалі відео та 1 професійно змонтоване відео.",
        },
      ],
    },
    {
      title: "Premium Exclusive",
      price: "4800 PLN",
      label: "Максимальний формат",
      description:
        "Для повної premium-історії з трьома образами, зміною стилю та двома готовими відео.",
      includes: [
        "Образи",
        "Зачіска і макіяж",
        "Відеограф",
        "Зміна образу",
        "Кольорокорекція",
        "Детальна ретуш",
        "2 готові відео",
      ],
      details: [
        {
          title: "Образи",
          text:
            "3 образи, підібрані спеціально під ваш запит, зовнішність та формат зйомки. Стиліст готує одяг, взуття та аксесуари і привозить усе на зйомку.",
        },
        {
          title: "Зачіска і макіяж",
          text:
            "Beauty-команда готує вас до зйомки в 4 руки. Всередині зйомки команда робить кардинальну зміну образу, щоб створити різні настрої та візуальні історії.",
        },
        {
          title: "Відеограф",
          text:
            "Професійна відеозйомка всього процесу. Ви отримуєте всі вдалі відеоматеріали та два професійно змонтованих відео за вашими побажаннями.",
        },
        {
          title: "Результат",
          text:
            "2,5 години зйомки, 200+ фото у кольорокорекції, 30 фото у детальній ретуші на ваш вибір, усі вдалі відео та 2 професійно змонтованих відео.",
        },
      ],
    },
  ],
  pl: [
    {
      title: "Premium Light",
      price: "2900 PLN",
      label: "Lekka sesja premium",
      description:
        "Dla osobistej sesji z pełną stylizacją, przygotowaniem beauty i gotowym efektem.",
      includes: ["Stylizacje", "Fryzura i makijaż", "Korekcja kolorów", "Retusz szczegółowy"],
      details: [
        {
          title: "Stylizacje",
          text:
            "2 stylizacje dobrane specjalnie do Twoich potrzeb, urody i formatu sesji. Wcześniej otrzymujesz kilka propozycji stylizacji i wybierasz te, które najbardziej do Ciebie pasują. Ubrania, buty i dodatki przygotowuje stylistka i przywozi na sesję.",
        },
        {
          title: "Fryzura i makijaż",
          text:
            "Profesjonalny zespół beauty przygotowuje Cię do sesji. Pracujemy na materiałach premium i hipoalergicznych, aby look harmonijnie podkreślał właśnie Twoją urodę.",
        },
        {
          title: "Efekt",
          text:
            "1 godzina sesji zdjęciowej, 100+ zdjęć w korekcji kolorów oraz 15 zdjęć w szczegółowym retuszu do wyboru.",
        },
      ],
    },
    {
      title: "Premium Standart",
      price: "4000 PLN",
      label: "Popularny wybór",
      popular: true,
      description:
        "Dla sesji z fotografią, wideo, lekkimi zmianami stylizacji i bardziej różnorodnym efektem.",
      includes: [
        "Stylizacje",
        "Fryzura i makijaż",
        "Wideograf",
        "Korekcja kolorów",
        "Retusz szczegółowy",
        "Gotowe wideo",
      ],
      details: [
        {
          title: "Stylizacje",
          text:
            "2 stylizacje dobrane specjalnie do Twoich potrzeb, urody i formatu sesji. Stylistka wcześniej przygotowuje ubrania, buty i dodatki oraz przywozi wszystko na sesję.",
        },
        {
          title: "Fryzura i makijaż",
          text:
            "Zespół beauty przygotowuje Cię do sesji w 4 ręce. W trakcie procesu można wprowadzić lekkie zmiany w looku, aby zdjęcia były bardziej różnorodne.",
        },
        {
          title: "Wideograf",
          text:
            "Profesjonalne nagranie całego procesu. Otrzymujesz wszystkie udane materiały wideo oraz jedno profesjonalnie zmontowane wideo zgodnie z Twoimi oczekiwaniami.",
        },
        {
          title: "Efekt",
          text:
            "2 godziny sesji, 200+ zdjęć w korekcji kolorów, 40 zdjęć w szczegółowym retuszu do wyboru, wszystkie udane wideo oraz 1 profesjonalnie zmontowany film.",
        },
      ],
    },
    {
      title: "Premium Exclusive",
      price: "4800 PLN",
      label: "Maksymalny format",
      description:
        "Dla pełnej historii premium z trzema stylizacjami, zmianą looku i dwoma gotowymi filmami.",
      includes: [
        "Stylizacje",
        "Fryzura i makijaż",
        "Wideograf",
        "Zmiana looku",
        "Korekcja kolorów",
        "Retusz szczegółowy",
        "2 gotowe wideo",
      ],
      details: [
        {
          title: "Stylizacje",
          text:
            "3 stylizacje dobrane specjalnie do Twoich potrzeb, urody i formatu sesji. Stylistka przygotowuje ubrania, buty i dodatki oraz przywozi wszystko na sesję.",
        },
        {
          title: "Fryzura i makijaż",
          text:
            "Zespół beauty przygotowuje Cię do sesji w 4 ręce. W trakcie sesji wykonywana jest wyraźna zmiana looku, aby stworzyć różne nastroje i historie wizualne.",
        },
        {
          title: "Wideograf",
          text:
            "Profesjonalne nagranie całego procesu. Otrzymujesz wszystkie udane materiały wideo oraz dwa profesjonalnie zmontowane filmy zgodnie z Twoimi oczekiwaniami.",
        },
        {
          title: "Efekt",
          text:
            "2,5 godziny sesji, 200+ zdjęć w korekcji kolorów, 30 zdjęć w szczegółowym retuszu do wyboru, wszystkie udane wideo oraz 2 profesjonalnie zmontowane filmy.",
        },
      ],
    },
  ],
};

const packageDetailsLabel = {
  uk: "Деталі пакета",
  pl: "Szczegóły pakietu",
};

const collapseLabel = {
  uk: "Згорнути",
  pl: "Zwiń",
};

const importantLabel = {
  uk: "Важливо",
  pl: "Ważne",
};

const importantText = {
  uk:
    "Студія або локація, додатковий реквізит, сет-дизайн, проїзд за межі Варшави, складний анімаційний монтаж та відео довше 1 хвилини оплачуються окремо.",
  pl:
    "Studio lub lokalizacja, dodatkowe rekwizyty, set design, dojazd poza Warszawę, złożony montaż animacyjny oraz wideo dłuższe niż 1 minuta są płatne osobno.",
};

const loadingText = {
  uk: "Оновлюємо пакети з адмінки...",
  pl: "Aktualizujemy pakiety z panelu admina...",
};

const fallbackNotice = {
  uk: "Показуємо запасні пакети. Дані з адмінки не завантажилися.",
  pl: "Pokazujemy pakiety zapasowe. Dane z panelu admina nie załadowały się.",
};

function normalizeTitle(title: string) {
  return title.toLowerCase().replace(/\s+/g, " ").trim();
}

function findStaticPackage(dbTitle: string, staticPackages: PackageItem[]) {
  const normalizedDbTitle = normalizeTitle(dbTitle);

  const exactMatch = staticPackages.find(
    (item) => normalizeTitle(item.title) === normalizedDbTitle
  );

  if (exactMatch) return exactMatch;

  if (normalizedDbTitle.includes("light")) {
    return staticPackages.find((item) => normalizeTitle(item.title).includes("light"));
  }

  if (
    normalizedDbTitle.includes("standart") ||
    normalizedDbTitle.includes("standard")
  ) {
    return staticPackages.find((item) =>
      normalizeTitle(item.title).includes("standart")
    );
  }

  if (normalizedDbTitle.includes("exclusive")) {
    return staticPackages.find((item) => normalizeTitle(item.title).includes("exclusive"));
  }

  return undefined;
}

function formatPackagePrice(price: number | null, currency: string | null) {
  if (price === null) return "Cena na zapytanie";

  const packageCurrency = currency || "PLN";

  return `${new Intl.NumberFormat("pl-PL").format(price)} ${packageCurrency}`;
}

function buildPackageItems(
  rows: SupabasePackage[],
  staticPackages: PackageItem[],
  lang: "uk" | "pl"
) {
  if (!rows.length) return staticPackages;

  return rows.map((row, index) => {
    const title = row.title?.trim() || staticPackages[index]?.title || "Package";
    const staticPackage =
      findStaticPackage(title, staticPackages) ||
      staticPackages[index] ||
      staticPackages[0];

    const descriptionFromDb =
      lang === "uk" ? row.description_uk : row.description_pl;
    const labelFromDb =
      lang === "uk" ? row.duration_label_uk : row.duration_label_pl;
    const buttonLabelFromDb =
      lang === "uk" ? row.button_label_uk : row.button_label_pl;

    return {
      ...staticPackage,
      id: String(row.id),
      isConstructor: Boolean(row.is_constructor),
      title,
      price: formatPackagePrice(row.price, row.currency),
      label: labelFromDb?.trim() || staticPackage.label,
      description: descriptionFromDb?.trim() || staticPackage.description,
      bookingButton: buttonLabelFromDb?.trim() || undefined,
    };
  });
}

export default function Packages() {
  const { lang } = useLanguage();
  const t = usePhotoshootsContent(lang);
  const [openPackageIndex, setOpenPackageIndex] = useState<number | null>(null);
  const [databasePackages, setDatabasePackages] = useState<SupabasePackage[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [addons, setAddons] = useState<PackageAddon[]>([]);
  const [constructorStartPrice, setConstructorStartPrice] = useState(1000);

  useEffect(() => {
    let isMounted = true;

    async function loadPackages() {
      setIsLoadingPackages(true);
      setHasLoadError(false);

      const { data, error } = await supabase
        .from("packages")
        .select(
          "id, title, price, description_uk, description_pl, duration_label_uk, duration_label_pl, button_label_uk, button_label_pl, currency, is_active, sort_order, is_constructor"
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("price", { ascending: true });

      if (!isMounted) return;

      if (error) {
        setHasLoadError(true);
        setDatabasePackages([]);
        setIsLoadingPackages(false);
        return;
      }

      setDatabasePackages((data || []) as SupabasePackage[]);
      setIsLoadingPackages(false);
    }

    loadPackages();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    supabase.from("booking_page_settings").select("constructor_price_1_hour").eq("id", "main").maybeSingle().then(({ data }) => {
      if (data?.constructor_price_1_hour !== null && data?.constructor_price_1_hour !== undefined) {
        setConstructorStartPrice(Number(data.constructor_price_1_hour));
      }
    });
  }, []);

  useEffect(() => {
    supabase.from("package_addons").select("id,title_uk,title_pl,price").eq("is_active", true).order("sort_order").then(({ data }) => {
      setAddons(((data || []) as PackageAddon[]).map(item => ({ ...item, price: Number(item.price) })));
    });
  }, []);

  const packages = buildPackageItems(databasePackages, packageContent[lang], lang);
  const regularPackages = packages.filter(item => !item.isConstructor);
  const constructorPackage = packages.find(item => item.isConstructor);
  const activePackage =
    openPackageIndex !== null ? packages[openPackageIndex] : undefined;

  function showDetails(index: number) {
    setOpenPackageIndex((current) => (current === index ? null : index));

    window.setTimeout(() => {
      const details = document.getElementById("package-details");
      details?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  return (
    <section id="packages" className="bg-[#120E0C] py-32 text-[#F7EFE6]">
      <div className="mx-auto max-w-7xl px-8">
        <AnimatedTitle eyebrow={t.packages.eyebrow} title={t.packages.title} />

        <p className="mx-auto mb-5 max-w-3xl text-center text-lg leading-8 text-[#C8B7A5]">
          {t.packages.description}
        </p>

        {isLoadingPackages && (
          <p className="mb-10 text-center text-sm text-[#E9A7B3]/75">
            {loadingText[lang]}
          </p>
        )}

        {hasLoadError && (
          <p className="mb-10 text-center text-sm text-[#E9A7B3]/75">
            {fallbackNotice[lang]}
          </p>
        )}

        {!isLoadingPackages && !hasLoadError && (
          <div className="mb-10" />
        )}

        <div className="grid items-stretch gap-8 lg:grid-cols-3">
          {regularPackages.map((item, index) => {
            const isActive = openPackageIndex === index;

            return (
              <AnimatedSection key={`${item.title}-${index}`} delay={index * 0.12}>
                <article
                  className={[
                    "relative flex h-full min-h-[560px] flex-col rounded-[34px] border p-8 shadow-[0_28px_80px_rgba(0,0,0,0.24)] transition duration-300",
                    item.popular
                      ? "border-[#E9A7B3]/75 bg-[radial-gradient(circle_at_top,#32201F_0%,#1B1410_48%,#15100D_100%)]"
                      : "border-[#E6B98F]/22 bg-[linear-gradient(180deg,#1C1512_0%,#17110F_100%)]",
                    isActive ? "ring-1 ring-[#E9A7B3]/65" : "",
                  ].join(" ")}
                >
                  <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#E9A7B3]/60 to-transparent" />

                  <div className="mb-8 flex min-h-10 items-center">
                    <span
                      className={[
                        "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em]",
                        item.popular
                          ? "bg-[#E9A7B3] text-[#130D09] shadow-[0_18px_45px_rgba(233,167,179,0.22)]"
                          : "border border-[#E9A7B3]/35 bg-[#E9A7B3]/8 text-[#E9A7B3]",
                      ].join(" ")}
                    >
                      {item.popular ? t.packages.popular : item.label}
                    </span>
                  </div>

                  <div className="border-b border-[#E6B98F]/16 pb-8">
                    <h3 className="mb-6 text-3xl font-light leading-tight">
                      {item.title}
                    </h3>

                    <p className="mb-7 text-5xl font-light tracking-wide text-[#E6B98F]">
                      {item.price}
                    </p>

                    <p className="leading-8 text-[#C8B7A5]">
                      {item.description}
                    </p>
                  </div>

                  <ul className="grid gap-4 py-8">
                    {item.includes.map((include) => (
                      <li key={include} className="flex items-start gap-3 text-[#D9C7B7]">
                        <span
                          className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-[#130D09]"
                          style={{ backgroundColor: blush }}
                        >
                          ✓
                        </span>
                        <span className="text-sm font-semibold uppercase tracking-[0.14em]">
                          {include}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto grid gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => showDetails(index)}
                      className="inline-flex w-full justify-center rounded-full border border-[#E9A7B3]/35 px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[#E9A7B3] transition duration-300 hover:bg-[#E9A7B3]/12"
                    >
                      {isActive ? t.packages.hideButton : t.packages.detailsButton}
                    </button>

                    <a
                      href={`/booking-public?package=${encodeURIComponent(item.id || "")}`}
                      className="inline-flex w-full justify-center rounded-full border border-[#E9A7B3]/60 px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.16em] text-[#F7EFE6] transition duration-300 hover:bg-[#E9A7B3] hover:text-[#130D09]"
                    >
                      {item.bookingButton || t.packages.bookingButton}
                    </a>
                  </div>
                </article>
              </AnimatedSection>
            );
          })}
        </div>

        {constructorPackage && (
          <AnimatedSection delay={0.12}>
            <article className="relative mt-8 overflow-hidden rounded-[38px] border border-[#E9A7B3]/55 bg-[radial-gradient(circle_at_90%_20%,rgba(233,167,179,0.16),transparent_30%),linear-gradient(120deg,#211714_0%,#18110F_55%,#241716_100%)] p-6 shadow-[0_32px_100px_rgba(0,0,0,0.34)] md:p-9">
              <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[#E9A7B3] to-transparent" />
              <div className="grid gap-8 xl:grid-cols-[0.8fr_1.35fr_0.75fr] xl:items-center">
                <div>
                  <span className="inline-flex rounded-full border border-[#E9A7B3]/45 bg-[#E9A7B3]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#E9A7B3]">{lang === "pl" ? "Stwórz swój pakiet" : "Створіть свій пакет"}</span>
                  <h3 className="mt-5 font-serif text-4xl font-light leading-none text-[#F7EFE6] md:text-5xl">{lang === "pl" ? "Konstruktor sesji" : "Конструктор фотосесії"}</h3>
                  <p className="mt-5 max-w-md leading-7 text-[#C8B7A5]">{constructorPackage.description}</p>
                  <p className="mt-6 text-sm uppercase tracking-[0.18em] text-[#C8B7A5]">{lang === "pl" ? "Fotograf w cenie · od" : "Фотограф включений · від"}</p>
                  <p className="mt-1 text-4xl font-light text-[#E6B98F]">{new Intl.NumberFormat("pl-PL").format(constructorStartPrice)} PLN</p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="flex min-h-[170px] flex-col items-center justify-between rounded-[24px] border border-[#E9A7B3]/70 bg-[#E9A7B3]/12 p-4 text-center shadow-[0_18px_45px_rgba(233,167,179,0.10)]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E9A7B3] text-xl font-bold text-[#130D09]">✓</div>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.13em] text-[#F7EFE6]">{lang === "pl" ? "Fotograf" : "Фотограф"}</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#E9A7B3]">{lang === "pl" ? "W cenie" : "Включено"}</p>
                  </div>
                  {addons.slice(0, 3).map((addon) => (
                    <div key={addon.id} className="flex min-h-[170px] flex-col items-center justify-between rounded-[24px] border border-[#E6B98F]/22 bg-black/10 p-4 text-center transition hover:-translate-y-1 hover:border-[#E9A7B3]/65 hover:bg-[#E9A7B3]/8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E9A7B3]/45 text-2xl text-[#E9A7B3]">+</div>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.13em] text-[#F7EFE6]">{lang === "pl" ? addon.title_pl : addon.title_uk}</p>
                      <p className="mt-3 text-xs text-[#C8B7A5]">+{new Intl.NumberFormat("pl-PL").format(addon.price)} PLN</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-[28px] border border-[#E9A7B3]/35 bg-[#E9A7B3]/8 p-5 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#E9A7B3]/15 text-xl text-[#E9A7B3]">✦</div>
                  <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#D9C7B7]">{lang === "pl" ? "Twoja sesja" : "Ваша фотосесія"}</p>
                  <p className="mt-2 text-sm font-semibold uppercase leading-6 tracking-[0.12em] text-[#E9A7B3]">{lang === "pl" ? "Cena obliczy się automatycznie" : "Ціна розрахується автоматично"}</p>
                  <a href={`/booking-public?package=${encodeURIComponent(constructorPackage.id || "")}`} className="mt-6 inline-flex w-full justify-center rounded-2xl bg-[#E9A7B3] px-5 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[#130D09] shadow-[0_18px_45px_rgba(233,167,179,0.22)] transition hover:bg-[#F2BDC6]">{constructorPackage.bookingButton || (lang === "pl" ? "Stwórz swój pakiet" : "Створити свій пакет")}</a>
                </div>
              </div>
            </article>
          </AnimatedSection>
        )}

        <div id="package-details" className="scroll-mt-28">
          {activePackage && (
            <AnimatedSection delay={0.1}>
              <div className="mt-16 rounded-[38px] border border-[#E9A7B3]/35 bg-[#1A1411] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.22)] md:p-10">
                <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#E9A7B3]">
                      {packageDetailsLabel[lang]}
                    </p>
                    <h3 className="text-3xl font-light text-[#F7EFE6] md:text-5xl">
                      {activePackage.title}
                    </h3>
                    <p className="mt-4 text-3xl font-light tracking-wide text-[#E6B98F]">
                      {activePackage.price}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpenPackageIndex(null)}
                    className="w-fit rounded-full border border-[#E9A7B3]/35 px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#E9A7B3] transition duration-300 hover:bg-[#E9A7B3]/12"
                  >
                    {collapseLabel[lang]}
                  </button>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {activePackage.details.map((detail) => (
                    <div
                      key={detail.title}
                      className="rounded-[24px] border border-[#E6B98F]/14 bg-[#E6B98F]/5 p-6"
                    >
                      <h5 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#E9A7B3]">
                        {detail.title}
                      </h5>
                      <p className="leading-8 text-[#D9C7B7]">{detail.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          )}
        </div>

        <AnimatedSection delay={0.22}>
          <div className="mt-12 rounded-[28px] border border-[#E9A7B3]/20 bg-[#1A1411] px-8 py-7 text-center text-[#C8B7A5]">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#E9A7B3]">
              {importantLabel[lang]}
            </p>
            <p className="leading-8">{importantText[lang]}</p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
