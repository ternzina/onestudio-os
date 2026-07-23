"use client";

import { createContext, createElement, useContext, type ReactNode } from "react";
import type { Language } from "./translations";

export type PhotoshootsCopy = {
  hero: {
    eyebrow: string;
    titlePart1: string;
    titleAccent: string;
    titlePart2: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    features: string[];
    backgroundImage: string;
  };
  packages: {
    eyebrow: string;
    title: string;
    description: string;
    popular: string;
    detailsButton: string;
    hideButton: string;
    bookingButton: string;
  };
  portfolio: {
    eyebrow: string;
    title: string;
    description: string;
  };
  booking: {
    eyebrow: string;
    title: string;
    description: string;
    button: string;
  };
};

export const fallbackPhotoshootsContent: Record<Language, PhotoshootsCopy> = {
  uk: {
    hero: {
      eyebrow: "Преміальна фотостудія у Варшаві",
      titlePart1: "Ваша зйомка",
      titleAccent: "продумана до",
      titlePart2: "найменших деталей",
      description: "Створюємо індивідуальні фото- та відеозйомки під ваш запит, стиль і цілі. Команда бере на себе ідею, образи, beauty-підготовку, координацію процесу та фінальний результат.",
      primaryCta: "Забронювати зйомку",
      secondaryCta: "Дізнатися більше",
      features: ["Premium-зйомки", "Повна організація", "Фото + відео"],
      backgroundImage: "/images/site/photoshoots/hero.webp",
    },
    packages: {
      eyebrow: "Пакети",
      title: "Оберіть формат вашої premium-зйомки",
      description: "Кожен пакет створений для зйомки, де команда бере на себе ідею, образи, beauty-підготовку, координацію процесу та фінальний результат.",
      popular: "Популярний вибір",
      detailsButton: "Детальніше про пакет",
      hideButton: "Сховати деталі",
      bookingButton: "Забронювати зйомку",
    },
    portfolio: {
      eyebrow: "Портфоліо",
      title: "Візуальні історії, створені з увагою до деталей",
      description: "Кадри, у яких працюють світло, стиль, образ і настрій.",
    },
    booking: {
      eyebrow: "Бронювання",
      title: "Залиште заявку на зйомку",
      description: "Напишіть нам зручну дату, формат зйомки та ваші побажання. Ми допоможемо обрати пакет і підготувати деталі.",
      button: "Забронювати зйомку",
    },
  },
  pl: {
    hero: {
      eyebrow: "Premium studio fotograficzne w Warszawie",
      titlePart1: "Twoja sesja",
      titleAccent: "przemyślana w",
      titlePart2: "najdrobniejszych szczegółach",
      description: "Tworzymy indywidualne sesje foto i wideo dopasowane do Twoich celów, stylu i potrzeb. Zespół zajmuje się koncepcją, stylizacją, przygotowaniem beauty, koordynacją procesu i finalnym efektem.",
      primaryCta: "Zarezerwuj sesję",
      secondaryCta: "Dowiedz się więcej",
      features: ["Sesje premium", "Pełna organizacja", "Foto + wideo"],
      backgroundImage: "/images/site/photoshoots/hero.webp",
    },
    packages: {
      eyebrow: "Pakiety",
      title: "Wybierz format swojej sesji premium",
      description: "Każdy pakiet został stworzony z myślą o sesji, w której zespół przejmuje koncepcję, stylizację, przygotowanie beauty, koordynację i finalny efekt.",
      popular: "Popularny wybór",
      detailsButton: "Szczegóły pakietu",
      hideButton: "Ukryj szczegóły",
      bookingButton: "Zarezerwuj sesję",
    },
    portfolio: {
      eyebrow: "Portfolio",
      title: "Historie wizualne tworzone z dbałością o detale",
      description: "Kadry, w których pracują światło, styl, wizerunek i nastrój.",
    },
    booking: {
      eyebrow: "Rezerwacja",
      title: "Zostaw zgłoszenie na sesję",
      description: "Napisz dogodną datę, format sesji i swoje oczekiwania. Pomożemy wybrać pakiet i przygotować szczegóły.",
      button: "Zarezerwuj sesję",
    },
  },
};

export type PhotoshootsContentRow = Record<string, unknown>;

const PhotoshootsContentContext =
  createContext<PhotoshootsContentRow | null>(null);

export function PhotoshootsContentProvider({
  children,
  row,
}: {
  children: ReactNode;
  row: PhotoshootsContentRow | null;
}) {
  return createElement(PhotoshootsContentContext.Provider, { value: row }, children);
}

function value(row: PhotoshootsContentRow | null, key: string, fallback: string) {
  const candidate = row?.[key];
  return typeof candidate === "string" && candidate.trim() ? candidate : fallback;
}

function heroImage(row: PhotoshootsContentRow | null, fallback: string) {
  const image = value(row, "hero_background_image", fallback);
  return image.includes("1783714914872-sisters-hero-girls-")
    ? "/images/site/photoshoots/hero.webp"
    : image;
}

function makeContent(
  lang: Language,
  row: PhotoshootsContentRow | null,
): PhotoshootsCopy {
  const f = fallbackPhotoshootsContent[lang];
  const suffix = lang === "uk" ? "uk" : "pl";

  return {
    hero: {
      eyebrow: value(row, `hero_eyebrow_${suffix}`, f.hero.eyebrow),
      titlePart1: value(row, `hero_title_part1_${suffix}`, f.hero.titlePart1),
      titleAccent: value(row, `hero_title_accent_${suffix}`, f.hero.titleAccent),
      titlePart2: value(row, `hero_title_part2_${suffix}`, f.hero.titlePart2),
      description: value(row, `hero_description_${suffix}`, f.hero.description),
      primaryCta: value(row, `hero_primary_cta_${suffix}`, f.hero.primaryCta),
      secondaryCta: value(row, `hero_secondary_cta_${suffix}`, f.hero.secondaryCta),
      features: [1, 2, 3].map((n) => value(row, `hero_feature_${n}_${suffix}`, f.hero.features[n - 1])),
      backgroundImage: heroImage(row, f.hero.backgroundImage),
    },
    packages: {
      eyebrow: value(row, `packages_eyebrow_${suffix}`, f.packages.eyebrow),
      title: value(row, `packages_title_${suffix}`, f.packages.title),
      description: value(row, `packages_description_${suffix}`, f.packages.description),
      popular: value(row, `packages_popular_${suffix}`, f.packages.popular),
      detailsButton: value(row, `packages_details_button_${suffix}`, f.packages.detailsButton),
      hideButton: value(row, `packages_hide_button_${suffix}`, f.packages.hideButton),
      bookingButton: value(row, `packages_booking_button_${suffix}`, f.packages.bookingButton),
    },
    portfolio: {
      eyebrow: value(row, `portfolio_eyebrow_${suffix}`, f.portfolio.eyebrow),
      title: value(row, `portfolio_title_${suffix}`, f.portfolio.title),
      description: value(row, `portfolio_description_${suffix}`, f.portfolio.description),
    },
    booking: {
      eyebrow: value(row, `booking_eyebrow_${suffix}`, f.booking.eyebrow),
      title: value(row, `booking_title_${suffix}`, f.booking.title),
      description: value(row, `booking_description_${suffix}`, f.booking.description),
      button: value(row, `booking_button_${suffix}`, f.booking.button),
    },
  };
}

export function usePhotoshootsContent(lang: Language) {
  const row = useContext(PhotoshootsContentContext);
  return makeContent(lang, row);
}
