import type { Locale } from "./config";
import type { GuideCategory } from "../guides/types";
import { guides as en } from "./locales/en/guides.ts";
import { guides as ru } from "./locales/ru/guides.ts";
import { guides as uk } from "./locales/uk/guides.ts";
import { guides as de } from "./locales/de/guides.ts";
import { guides as es } from "./locales/es/guides.ts";
import { guides as fr } from "./locales/fr/guides.ts";
import { guides as pl } from "./locales/pl/guides.ts";
import { guides as pt } from "./locales/pt/guides.ts";

export type GuidesUiCopy = {
  eyebrow: string;
  name: string;
  navigationLabel: string;
  headline: string;
  lead: string;
  libraryTitle: string;
  libraryLead: string;
  allCategories: string;
  loadMore: string;
  readArticle: string;
  articleNouns: Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
  categoryLabels: Record<GuideCategory, string>;
  homepage: { eyebrow: string; title: string; accent: string; viewAll: string };
  backToGuides: string;
  faqTitle: string;
  relatedLabel: string;
};

const guidesCopy: Record<Locale, GuidesUiCopy> = { en, ru, uk, de, es, fr, pl, pt };

export function getGuidesUiCopy(locale: Locale): GuidesUiCopy {
  return guidesCopy[locale];
}

export function formatGuideCount(count: number, locale: Locale) {
  const nouns = guidesCopy[locale].articleNouns;
  return `${count} ${nouns[new Intl.PluralRules(locale).select(count)] ?? nouns.other}`;
}

export function formatGuideDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : locale, {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
