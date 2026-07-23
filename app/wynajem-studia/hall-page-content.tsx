"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import { useLanguage } from "../../lib/language-provider";

const halls = {
  cyklorama: {
    pl: {
      eyebrow: "Sisters Studio · sala do wynajęcia",
      title: "Cyklorama",
      description:
        "Jasna, minimalistyczna przestrzeń do sesji portretowych, modowych, reklamowych i nagrań wideo. To miejsce dla projektów, w których najważniejszy jest czysty kadr, światło i pełna kontrola nad kompozycją.",
      image: "https://cdn.sistersstudio.pl/site/static/rental/e603ab1d2539-cyklorama.webp",
      goodFor: [
        "sesje wizerunkowe",
        "zdjęcia produktowe",
        "lookbooki",
        "nagrania wideo",
        "content dla marek",
      ],
      details: [
        ["Powierzchnia", "do uzupełnienia"],
        ["Światło dzienne", "do uzupełnienia"],
        ["Liczba osób", "do uzupełnienia"],
        ["Minimalny czas", "do uzupełnienia"],
      ],
      zonesTitle: "Co znajduje się w przestrzeni?",
      zones: [
        "cyklorama / jasna strefa zdjęciowa",
        "miejsce do przygotowania modelki lub klientki",
        "podstawowe elementy do pracy na planie",
        "możliwość pracy z własnym sprzętem",
      ],
      equipmentTitle: "Sprzęt i wyposażenie",
      equipmentNote:
        "Ten blok uzupełnimy po otrzymaniu pełnej listy sprzętu od klienta.",
      equipment: [
        "światło studyjne: do uzupełnienia",
        "statywy: do uzupełnienia",
        "modyfikatory światła: do uzupełnienia",
        "tła / akcesoria: do uzupełnienia",
      ],
      priceTitle: "Cennik",
      priceNote:
        "Cennik zostanie uzupełniony po potwierdzeniu stawek, minimalnego czasu wynajmu, zadatku i zasad dopłat.",
      prices: [
        ["1 godzina", "do uzupełnienia"],
        ["2 godziny", "do uzupełnienia"],
        ["3 godziny", "do uzupełnienia"],
        ["Cały dzień", "wycena indywidualna"],
      ],
      rulesTitle: "Ważne zasady",
      rules: [
        "czas wynajmu obejmuje przygotowanie, sesję, sprzątnięcie i opuszczenie przestrzeni",
        "obuwie używane na cykloramie musi być czyste",
        "materiały brudzące, konfetti, brokat, dym, płyny i zwierzęta wymagają wcześniejszej zgody",
        "zabrudzenie lub uszkodzenie cykloramy może wiązać się z dodatkową opłatą",
      ],
    },
    uk: {
      eyebrow: "Sisters Studio · зал для оренди",
      title: "Циклорама",
      description:
        "Світлий мінімалістичний простір для портретних, fashion, рекламних зйомок і відео. Це місце для проєктів, де важливі чистий кадр, світло і повний контроль над композицією.",
      image: "https://cdn.sistersstudio.pl/site/static/rental/e603ab1d2539-cyklorama.webp",
      goodFor: [
        "іміджеві зйомки",
        "предметна фотографія",
        "lookbook",
        "відео",
        "контент для брендів",
      ],
      details: [
        ["Площа", "додамо"],
        ["Денне світло", "додамо"],
        ["Кількість людей", "додамо"],
        ["Мінімальний час", "додамо"],
      ],
      zonesTitle: "Що є в просторі?",
      zones: [
        "циклорама / світла знімальна зона",
        "місце для підготовки моделі або клієнтки",
        "базові елементи для роботи на зйомці",
        "можливість працювати зі своїм обладнанням",
      ],
      equipmentTitle: "Обладнання",
      equipmentNote:
        "Цей блок заповнимо після того, як клієнт дасть повний список обладнання.",
      equipment: [
        "студійне світло: додамо",
        "стійки: додамо",
        "модифікатори світла: додамо",
        "фони / аксесуари: додамо",
      ],
      priceTitle: "Прайс",
      priceNote:
        "Прайс додамо після підтвердження ставок, мінімального часу оренди, передоплати і доплат.",
      prices: [
        ["1 година", "додамо"],
        ["2 години", "додамо"],
        ["3 години", "додамо"],
        ["Весь день", "індивідуально"],
      ],
      rulesTitle: "Важливі правила",
      rules: [
        "час оренди включає підготовку, зйомку, прибирання та вихід із простору",
        "взуття для циклорами має бути чистим",
        "матеріали, що бруднять, конфеті, блискітки, дим, рідини та тварини потребують попереднього погодження",
        "забруднення або пошкодження циклорами може передбачати додаткову оплату",
      ],
    },
  },
  "cieple-wnetrze": {
    pl: {
      eyebrow: "Sisters Studio · sala do wynajęcia",
      title: "Ciepłe wnętrze",
      description:
        "Przytulna przestrzeń z miękkim światłem, eleganckimi detalami i kobiecym klimatem. Idealna do lifestyle, beauty, sesji rodzinnych, kobiecych oraz contentu na social media.",
      image: "https://cdn.sistersstudio.pl/site/static/rental/4816054102cd-warm-interior.webp",
      goodFor: [
        "sesje kobiece",
        "beauty content",
        "sesje rodzinne",
        "reels i stories",
        "materiały lifestyle",
      ],
      details: [
        ["Powierzchnia", "do uzupełnienia"],
        ["Światło dzienne", "do uzupełnienia"],
        ["Liczba osób", "do uzupełnienia"],
        ["Minimalny czas", "do uzupełnienia"],
      ],
      zonesTitle: "Co znajduje się w przestrzeni?",
      zones: [
        "gotowa aranżacja wnętrza",
        "miejsce do przygotowania modelki lub klientki",
        "dekoracje i detale do zdjęć",
        "możliwość tworzenia foto i video contentu",
      ],
      equipmentTitle: "Sprzęt i wyposażenie",
      equipmentNote:
        "Ten blok uzupełnimy po otrzymaniu pełnej listy sprzętu od klienta.",
      equipment: [
        "światło studyjne: do uzupełnienia",
        "meble i dekoracje: do uzupełnienia",
        "akcesoria beauty: do uzupełnienia",
        "dodatkowe wyposażenie: do uzupełnienia",
      ],
      priceTitle: "Cennik",
      priceNote:
        "Cennik zostanie uzupełniony po potwierdzeniu stawek, minimalnego czasu wynajmu, zadatku i zasad dopłat.",
      prices: [
        ["1 godzina", "do uzupełnienia"],
        ["2 godziny", "do uzupełnienia"],
        ["3 godziny", "do uzupełnienia"],
        ["Cały dzień", "wycena indywidualna"],
      ],
      rulesTitle: "Ważne zasady",
      rules: [
        "czas wynajmu obejmuje przygotowanie, sesję, sprzątnięcie i opuszczenie przestrzeni",
        "dekoracje i meble należy traktować ostrożnie",
        "przestawianie większych elementów warto wcześniej uzgodnić ze Studiem",
        "materiały mogące zabrudzić wnętrze wymagają wcześniejszej zgody",
      ],
    },
    uk: {
      eyebrow: "Sisters Studio · зал для оренди",
      title: "Теплий інтер’єр",
      description:
        "Затишний простір із м’яким світлом, елегантними деталями та жіночим настроєм. Ідеально для lifestyle, beauty, сімейних, жіночих зйомок і контенту для соцмереж.",
      image: "https://cdn.sistersstudio.pl/site/static/rental/4816054102cd-warm-interior.webp",
      goodFor: [
        "жіночі зйомки",
        "beauty content",
        "сімейні фотосесії",
        "reels і stories",
        "lifestyle-матеріали",
      ],
      details: [
        ["Площа", "додамо"],
        ["Денне світло", "додамо"],
        ["Кількість людей", "додамо"],
        ["Мінімальний час", "додамо"],
      ],
      zonesTitle: "Що є в просторі?",
      zones: [
        "готова інтер’єрна зона",
        "місце для підготовки моделі або клієнтки",
        "декор і деталі для фото",
        "можливість створювати фото та відеоконтент",
      ],
      equipmentTitle: "Обладнання",
      equipmentNote:
        "Цей блок заповнимо після того, як клієнт дасть повний список обладнання.",
      equipment: [
        "студійне світло: додамо",
        "меблі та декор: додамо",
        "beauty-аксесуари: додамо",
        "додаткове обладнання: додамо",
      ],
      priceTitle: "Прайс",
      priceNote:
        "Прайс додамо після підтвердження ставок, мінімального часу оренди, передоплати і доплат.",
      prices: [
        ["1 година", "додамо"],
        ["2 години", "додамо"],
        ["3 години", "додамо"],
        ["Весь день", "індивідуально"],
      ],
      rulesTitle: "Важливі правила",
      rules: [
        "час оренди включає підготовку, зйомку, прибирання та вихід із простору",
        "декор і меблі потрібно використовувати обережно",
        "перестановку великих елементів краще погодити зі студією",
        "матеріали, що можуть забруднити інтер’єр, потребують попереднього погодження",
      ],
    },
  },
  loft: {
    pl: {
      eyebrow: "Sisters Studio · sala do wynajęcia",
      title: "Loft / ciemne wnętrze",
      description:
        "Klimatyczna przestrzeń z głębią, mocniejszym nastrojem i bardziej wyrazistym charakterem. Sprawdzi się przy sesjach fashion, portretach biznesowych, nagraniach eksperckich i kampaniach marek.",
      image: "https://cdn.sistersstudio.pl/site/static/rental/de1b73278c2f-loft-interior.webp",
      goodFor: [
        "sesje fashion",
        "portrety biznesowe",
        "nagrania eksperckie",
        "kampanie marek",
        "projekty artystyczne",
      ],
      details: [
        ["Powierzchnia", "do uzupełnienia"],
        ["Światło dzienne", "do uzupełnienia"],
        ["Liczba osób", "do uzupełnienia"],
        ["Minimalny czas", "do uzupełnienia"],
      ],
      zonesTitle: "Co znajduje się w przestrzeni?",
      zones: [
        "ciemna aranżacja do zdjęć i wideo",
        "elementy loftowe i mocniejsze tło",
        "przestrzeń do portretów i kampanii",
        "możliwość pracy z własnym światłem",
      ],
      equipmentTitle: "Sprzęt i wyposażenie",
      equipmentNote:
        "Ten blok uzupełnimy po otrzymaniu pełnej listy sprzętu od klienta.",
      equipment: [
        "światło studyjne: do uzupełnienia",
        "meble i dekoracje: do uzupełnienia",
        "statywy i akcesoria: do uzupełnienia",
        "dodatkowe wyposażenie: do uzupełnienia",
      ],
      priceTitle: "Cennik",
      priceNote:
        "Cennik zostanie uzupełniony po potwierdzeniu stawek, minimalnego czasu wynajmu, zadatku i zasad dopłat.",
      prices: [
        ["1 godzina", "do uzupełnienia"],
        ["2 godziny", "do uzupełnienia"],
        ["3 godziny", "do uzupełnienia"],
        ["Cały dzień", "wycena indywidualna"],
      ],
      rulesTitle: "Ważne zasady",
      rules: [
        "czas wynajmu obejmuje przygotowanie, sesję, sprzątnięcie i opuszczenie przestrzeni",
        "elementy scenografii należy traktować ostrożnie",
        "większe zmiany aranżacji wymagają wcześniejszego uzgodnienia",
        "projekty z dymem, płynami, ogniem lub materiałami sypkimi wymagają zgody Studia",
      ],
    },
    uk: {
      eyebrow: "Sisters Studio · зал для оренди",
      title: "Loft / темний інтер’єр",
      description:
        "Атмосферний простір із глибиною, сильнішим настроєм і виразним характером. Підійде для fashion, бізнес-портретів, експертних відео та кампаній брендів.",
      image: "https://cdn.sistersstudio.pl/site/static/rental/de1b73278c2f-loft-interior.webp",
      goodFor: [
        "fashion-зйомки",
        "бізнес-портрети",
        "експертні відео",
        "кампанії брендів",
        "арт-проєкти",
      ],
      details: [
        ["Площа", "додамо"],
        ["Денне світло", "додамо"],
        ["Кількість людей", "додамо"],
        ["Мінімальний час", "додамо"],
      ],
      zonesTitle: "Що є в просторі?",
      zones: [
        "темна зона для фото та відео",
        "loft-елементи та виразний фон",
        "простір для портретів і кампаній",
        "можливість працювати зі своїм світлом",
      ],
      equipmentTitle: "Обладнання",
      equipmentNote:
        "Цей блок заповнимо після того, як клієнт дасть повний список обладнання.",
      equipment: [
        "студійне світло: додамо",
        "меблі та декор: додамо",
        "стійки та аксесуари: додамо",
        "додаткове обладнання: додамо",
      ],
      priceTitle: "Прайс",
      priceNote:
        "Прайс додамо після підтвердження ставок, мінімального часу оренди, передоплати і доплат.",
      prices: [
        ["1 година", "додамо"],
        ["2 години", "додамо"],
        ["3 години", "додамо"],
        ["Весь день", "індивідуально"],
      ],
      rulesTitle: "Важливі правила",
      rules: [
        "час оренди включає підготовку, зйомку, прибирання та вихід із простору",
        "елементи сценографії потрібно використовувати обережно",
        "великі зміни в інтер’єрі потребують попереднього погодження",
        "проєкти з димом, рідинами, вогнем або сипучими матеріалами потребують дозволу студії",
      ],
    },
  },
};

type HallKey = keyof typeof halls;

function HallPageContent({ hallKey }: { hallKey: HallKey }) {
  const { lang } = useLanguage();
  const hall = halls[hallKey][lang];

  return (
    <main className="min-h-screen bg-[#f6efe8] text-[#2b1b14]">
      <Header />

      <section
        className="relative min-h-[86vh] overflow-hidden bg-[#080604] px-6 pt-28 text-[#fff7ef] sm:px-8 lg:px-12"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(8, 6, 4, 0.94) 0%, rgba(8, 6, 4, 0.76) 38%, rgba(8, 6, 4, 0.24) 68%, rgba(8, 6, 4, 0.08) 100%), url('${hall.image}')`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#080604]/10 via-transparent to-[#080604]/76" />

        <div className="relative z-10 mx-auto flex min-h-[calc(86vh-7rem)] max-w-7xl items-center">
          <div className="max-w-[720px] pb-12 pt-12">
            <nav
              aria-label={lang === "pl" ? "Okruszki" : "Навігаційний ланцюжок"}
              className="mb-7 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#e8d2c0]/75"
            >
              <Link href="/" className="transition hover:text-[#f2a7b8]">
                {lang === "pl" ? "Strona główna" : "Головна"}
              </Link>
              <span aria-hidden="true">/</span>
              <Link
                href="/wynajem-studia"
                className="transition hover:text-[#f2a7b8]"
              >
                {lang === "pl" ? "Wynajem studia" : "Оренда студії"}
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-[#f2a7b8]">
                {hall.title}
              </span>
            </nav>

            <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.34em] text-[#e8c2c9] sm:text-xs">
              {hall.eyebrow}
            </p>

            <h1 className="font-serif text-[54px] font-normal leading-[1] tracking-[-0.035em] text-[#fff7ef] sm:text-[76px] lg:text-[96px]">
              {hall.title}
            </h1>

            <p className="mt-8 max-w-[600px] text-base leading-8 text-[#e8d2c0] sm:text-lg">
              {hall.description}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/kontakt"
                className="inline-flex h-14 items-center justify-center rounded-md bg-[#f2a7b8] px-8 text-center text-[12px] font-bold uppercase tracking-[0.12em] text-[#160c0a] transition hover:bg-[#ffc0cc]"
              >
                {lang === "pl" ? "Zarezerwuj studio" : "Забронювати студію"}
              </Link>

              <a
                href="#cennik"
                className="inline-flex h-14 items-center justify-center rounded-md border border-white/28 px-8 text-center text-[12px] font-bold uppercase tracking-[0.12em] text-[#fff7ef] transition hover:border-[#f2a7b8] hover:text-[#f2a7b8]"
              >
                {lang === "pl" ? "Zobacz cennik" : "Подивитися прайс"}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-16 sm:px-10 lg:grid-cols-4 lg:px-20">
        {hall.details.map(([label, value]) => (
          <div
            key={label}
            className="rounded-[1.5rem] border border-[#d8c0ad] bg-white/72 p-6 shadow-lg shadow-[#7a5237]/8"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6b4d]">
              {label}
            </p>
            <p className="mt-3 text-xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-16 sm:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:px-20">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#9a6b4d]">
            {lang === "pl" ? "Dla jakich projektów?" : "Для яких проєктів?"}
          </p>
          <h2 className="text-3xl font-semibold sm:text-4xl">
            {lang === "pl" ? "Najlepiej sprawdzi się przy" : "Найкраще підходить для"}
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {hall.goodFor.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[#d8c0ad] bg-white/74 px-5 py-3 text-sm font-medium text-[#3a241a]"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="bg-[#2f1d15] px-6 py-20 text-white sm:px-10 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#d8b999]">
              {hall.zonesTitle}
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">
              {lang === "pl" ? "Układ, aranżacje i możliwości" : "Зони, інтер’єр і можливості"}
            </h2>
          </div>

          <div className="grid gap-3">
            {hall.zones.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/8 px-5 py-4 text-white/86"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-10 lg:grid-cols-2 lg:px-20">
        <div className="rounded-[2rem] border border-[#d8c0ad] bg-white/72 p-8 shadow-xl shadow-[#7a5237]/10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#9a6b4d]">
            {hall.equipmentTitle}
          </p>
          <p className="mb-6 leading-7 text-[#65483a]">{hall.equipmentNote}</p>

          <ul className="space-y-3">
            {hall.equipment.map((item) => (
              <li
                key={item}
                className="rounded-2xl bg-[#f6efe8] px-5 py-4 text-[#65483a]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div
          id="cennik"
          className="rounded-[2rem] border border-[#d8c0ad] bg-white/72 p-8 shadow-xl shadow-[#7a5237]/10"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#9a6b4d]">
            {hall.priceTitle}
          </p>
          <p className="mb-6 leading-7 text-[#65483a]">{hall.priceNote}</p>

          <div className="space-y-3">
            {hall.prices.map(([name, price]) => (
              <div
                key={name}
                className="flex items-center justify-between gap-5 rounded-2xl bg-[#f6efe8] px-5 py-4"
              >
                <span className="font-semibold text-[#3a241a]">{name}</span>
                <span className="text-[#65483a]">{price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 sm:px-10 lg:px-20">
        <div className="grid gap-8 rounded-[2rem] bg-[#d8b999] p-8 shadow-xl shadow-[#7a5237]/10 sm:p-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#6c4634]">
              {hall.rulesTitle}
            </p>
            <h2 className="text-3xl font-semibold text-[#2b1b14]">
              {lang === "pl" ? "Przed rezerwacją" : "Перед бронюванням"}
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#4c3327]">
              {lang === "pl" ? (
                <>
                  Pełne zasady znajdziesz na stronie{" "}
                  <Link
                    href="/regulamin"
                    className="font-semibold underline underline-offset-4"
                  >
                    Правила
                  </Link>
                  .
                </>
              ) : (
                <>
                  Повні правила є на сторінці{" "}
                  <Link
                    href="/regulamin"
                    className="font-semibold underline underline-offset-4"
                  >
                    Правила
                  </Link>
                  .
                </>
              )}
            </p>
          </div>

          <ul className="space-y-3">
            {hall.rules.map((item) => (
              <li
                key={item}
                className="rounded-2xl bg-white/45 px-5 py-4 text-sm leading-6 text-[#4c3327]"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

export { HallPageContent };
