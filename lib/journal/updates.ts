import type { Locale } from "../i18n/config";
import { updates as en } from "../i18n/locales/en/updates.ts";
import { updates as ru } from "../i18n/locales/ru/updates.ts";
import { updates as uk } from "../i18n/locales/uk/updates.ts";
import { updates as de } from "../i18n/locales/de/updates.ts";
import { updates as es } from "../i18n/locales/es/updates.ts";
import { updates as fr } from "../i18n/locales/fr/updates.ts";
import { updates as pl } from "../i18n/locales/pl/updates.ts";
import { updates as pt } from "../i18n/locales/pt/updates.ts";
import type { JournalUpdate } from "./update-types";

const localizedHistory = { en, ru, uk, de, es, fr, pl, pt };

/** Separate from JOURNAL_ARTICLES: these notes do not create article routes. */
export const JOURNAL_UPDATES: Record<Locale, readonly JournalUpdate[]> = {
  en: en.entries,
  ru: ru.entries,
  uk: uk.entries,
  de: de.entries,
  es: es.entries,
  fr: fr.entries,
  pl: pl.entries,
  pt: pt.entries,
};

export function getJournalUpdates(locale: Locale): readonly JournalUpdate[] {
  return JOURNAL_UPDATES[locale];
}

export function getJournalUpdatesCopy(locale: Locale) {
  const { title, lead, noteLabel } = localizedHistory[locale];
  return { title, lead, noteLabel };
}
