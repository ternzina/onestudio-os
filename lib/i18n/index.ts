import { normalizeLocale, type Locale } from "./config";
import { about as ruAbout } from "./locales/ru/about";
import { about as enAbout } from "./locales/en/about";
import { blog as ruBlog } from "./locales/ru/blog";
import { blog as enBlog } from "./locales/en/blog";
import { common as ruCommon } from "./locales/ru/common";
import { common as enCommon } from "./locales/en/common";
import { components as ruComponents } from "./locales/ru/components";
import { components as enComponents } from "./locales/en/components";
import { contact as ruContact } from "./locales/ru/contact";
import { contact as enContact } from "./locales/en/contact";
import { demos as ruDemos } from "./locales/ru/demos";
import { demos as enDemos } from "./locales/en/demos";
import { faq as ruFaq } from "./locales/ru/faq";
import { faq as enFaq } from "./locales/en/faq";
import { features as ruFeatures } from "./locales/ru/features";
import { features as enFeatures } from "./locales/en/features";
import { home as ruHome } from "./locales/ru/home";
import { home as enHome } from "./locales/en/home";
import { legal as ruLegal } from "./locales/ru/legal";
import { legal as enLegal } from "./locales/en/legal";
import { pricing as ruPricing } from "./locales/ru/pricing";
import { pricing as enPricing } from "./locales/en/pricing";
import { website as ruWebsite } from "./locales/ru/website";
import { website as enWebsite } from "./locales/en/website";
import { about as ukAbout } from "./locales/uk/about";
import { blog as ukBlog } from "./locales/uk/blog";
import { common as ukCommon } from "./locales/uk/common";
import { components as ukComponents } from "./locales/uk/components";
import { contact as ukContact } from "./locales/uk/contact";
import { demos as ukDemos } from "./locales/uk/demos";
import { faq as ukFaq } from "./locales/uk/faq";
import { features as ukFeatures } from "./locales/uk/features";
import { home as ukHome } from "./locales/uk/home";
import { legal as ukLegal } from "./locales/uk/legal";
import { pricing as ukPricing } from "./locales/uk/pricing";
import { website as ukWebsite } from "./locales/uk/website";
import { about as plAbout } from "./locales/pl/about";
import { blog as plBlog } from "./locales/pl/blog";
import { common as plCommon } from "./locales/pl/common";
import { components as plComponents } from "./locales/pl/components";
import { contact as plContact } from "./locales/pl/contact";
import { demos as plDemos } from "./locales/pl/demos";
import { faq as plFaq } from "./locales/pl/faq";
import { features as plFeatures } from "./locales/pl/features";
import { home as plHome } from "./locales/pl/home";
import { legal as plLegal } from "./locales/pl/legal";
import { pricing as plPricing } from "./locales/pl/pricing";
import { website as plWebsite } from "./locales/pl/website";
import { about as deAbout } from "./locales/de/about";
import { blog as deBlog } from "./locales/de/blog";
import { common as deCommon } from "./locales/de/common";
import { components as deComponents } from "./locales/de/components";
import { contact as deContact } from "./locales/de/contact";
import { demos as deDemos } from "./locales/de/demos";
import { faq as deFaq } from "./locales/de/faq";
import { features as deFeatures } from "./locales/de/features";
import { home as deHome } from "./locales/de/home";
import { legal as deLegal } from "./locales/de/legal";
import { pricing as dePricing } from "./locales/de/pricing";
import { website as deWebsite } from "./locales/de/website";
import { about as esAbout } from "./locales/es/about";
import { blog as esBlog } from "./locales/es/blog";
import { common as esCommon } from "./locales/es/common";
import { components as esComponents } from "./locales/es/components";
import { contact as esContact } from "./locales/es/contact";
import { demos as esDemos } from "./locales/es/demos";
import { faq as esFaq } from "./locales/es/faq";
import { features as esFeatures } from "./locales/es/features";
import { home as esHome } from "./locales/es/home";
import { legal as esLegal } from "./locales/es/legal";
import { pricing as esPricing } from "./locales/es/pricing";
import { website as esWebsite } from "./locales/es/website";
import { about as frAbout } from "./locales/fr/about";
import { blog as frBlog } from "./locales/fr/blog";
import { common as frCommon } from "./locales/fr/common";
import { components as frComponents } from "./locales/fr/components";
import { contact as frContact } from "./locales/fr/contact";
import { demos as frDemos } from "./locales/fr/demos";
import { faq as frFaq } from "./locales/fr/faq";
import { features as frFeatures } from "./locales/fr/features";
import { home as frHome } from "./locales/fr/home";
import { legal as frLegal } from "./locales/fr/legal";
import { pricing as frPricing } from "./locales/fr/pricing";
import { website as frWebsite } from "./locales/fr/website";
import { about as ptAbout } from "./locales/pt/about";
import { blog as ptBlog } from "./locales/pt/blog";
import { common as ptCommon } from "./locales/pt/common";
import { components as ptComponents } from "./locales/pt/components";
import { contact as ptContact } from "./locales/pt/contact";
import { demos as ptDemos } from "./locales/pt/demos";
import { faq as ptFaq } from "./locales/pt/faq";
import { features as ptFeatures } from "./locales/pt/features";
import { home as ptHome } from "./locales/pt/home";
import { legal as ptLegal } from "./locales/pt/legal";
import { pricing as ptPricing } from "./locales/pt/pricing";
import { website as ptWebsite } from "./locales/pt/website";

const ruTranslations = {
  about: ruAbout,
  blog: ruBlog,
  common: ruCommon,
  components: ruComponents,
  contact: ruContact,
  demos: ruDemos,
  faq: ruFaq,
  features: ruFeatures,
  home: ruHome,
  legal: ruLegal,
  pricing: ruPricing,
  website: ruWebsite,
};

type Widen<T> =
  T extends string ? string
    : T extends number ? number
      : T extends boolean ? boolean
        : T extends readonly (infer Item)[] ? readonly Widen<Item>[]
          : T extends object ? { readonly [Key in keyof T]: Widen<T[Key]> }
            : T;

export type Translations = Widen<typeof ruTranslations>;

const enTranslations: Translations = {
  about: enAbout,
  blog: enBlog,
  common: enCommon,
  components: enComponents,
  contact: enContact,
  demos: enDemos,
  faq: enFaq,
  features: enFeatures,
  home: enHome,
  legal: enLegal,
  pricing: enPricing,
  website: enWebsite,
};

const localeTranslations: Record<Locale, Translations> = {
  ru: ruTranslations,
  en: enTranslations,
  uk: { about: ukAbout, blog: ukBlog, common: ukCommon, components: ukComponents, contact: ukContact, demos: ukDemos, faq: ukFaq, features: ukFeatures, home: ukHome, legal: ukLegal, pricing: ukPricing, website: ukWebsite },
  pl: { about: plAbout, blog: plBlog, common: plCommon, components: plComponents, contact: plContact, demos: plDemos, faq: plFaq, features: plFeatures, home: plHome, legal: plLegal, pricing: plPricing, website: plWebsite },
  de: { about: deAbout, blog: deBlog, common: deCommon, components: deComponents, contact: deContact, demos: deDemos, faq: deFaq, features: deFeatures, home: deHome, legal: deLegal, pricing: dePricing, website: deWebsite },
  es: { about: esAbout, blog: esBlog, common: esCommon, components: esComponents, contact: esContact, demos: esDemos, faq: esFaq, features: esFeatures, home: esHome, legal: esLegal, pricing: esPricing, website: esWebsite },
  fr: { about: frAbout, blog: frBlog, common: frCommon, components: frComponents, contact: frContact, demos: frDemos, faq: frFaq, features: frFeatures, home: frHome, legal: frLegal, pricing: frPricing, website: frWebsite },
  pt: { about: ptAbout, blog: ptBlog, common: ptCommon, components: ptComponents, contact: ptContact, demos: ptDemos, faq: ptFaq, features: ptFeatures, home: ptHome, legal: ptLegal, pricing: ptPricing, website: ptWebsite },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeFallback<T>(fallback: T, candidate: unknown): T {
  if (!isRecord(fallback) || !isRecord(candidate)) {
    return (candidate === undefined ? fallback : candidate) as T;
  }

  const merged: Record<string, unknown> = { ...fallback };
  for (const [key, value] of Object.entries(candidate)) {
    merged[key] = isRecord(fallback[key]) && isRecord(value)
      ? mergeFallback(fallback[key], value)
      : value;
  }
  return merged as T;
}

export function getTranslations(locale: Locale | string) {
  const normalized = normalizeLocale(locale);
  return mergeFallback(enTranslations, localeTranslations[normalized]);
}
