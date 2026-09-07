export const supportedLocales = ["ru", "en", "uk", "pl", "de", "es", "fr", "pt"] as const;

export const localeNames: Record<Locale, string> = {
  ru: "Русский",
  en: "English",
  uk: "Українська",
  pl: "Polski",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  pt: "Português",
};

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "ru";

/** Default for the canonical OneStudio marketing surface only. */
export const platformMarketingLocale: Locale = "en";

export const contactTopicValues = [
  "platform",
  "website",
  "pricing",
  "technical",
  "other",
] as const;

export type ContactTopicValue = (typeof contactTopicValues)[number];

export function isLocale(value: string): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function normalizeLocale(value: string | null | undefined): Locale {
  return value && isLocale(value) ? value : defaultLocale;
}
