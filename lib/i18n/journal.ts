import type { Locale } from "./config";
import { journal as en } from "./locales/en/journal.ts";
import { journal as ru } from "./locales/ru/journal.ts";
import { journal as uk } from "./locales/uk/journal.ts";
import { journal as de } from "./locales/de/journal.ts";
import { journal as es } from "./locales/es/journal.ts";
import { journal as fr } from "./locales/fr/journal.ts";
import { journal as pl } from "./locales/pl/journal.ts";
import { journal as pt } from "./locales/pt/journal.ts";

const journalCopy = { en, ru, uk, de, es, fr, pl, pt };

export function getJournalUiCopy(locale: Locale) {
  return journalCopy[locale];
}
