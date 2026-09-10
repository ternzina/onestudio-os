import type { Locale } from "./config";
import type { JournalCategory } from "@/lib/seo/journal-articles";

type JournalUiCopy = {
  eyebrow: string;
  name: string;
  headline: string;
  lead: string;
  libraryTitle: string;
  libraryLead: string;
  allCategories: string;
  loadMore: string;
  articleCount: (count: number) => string;
  readArticle: string;
  categoryLabels: Record<JournalCategory, string>;
  homepage: {
    eyebrow: string;
    title: string;
    viewAll: string;
  };
};

const english: JournalUiCopy = {
  eyebrow: "ONE STUDIO JOURNAL",
  name: "OneStudio Journal",
  headline: "Ideas, guides and practical knowledge for service businesses",
  lead: "Practical materials about websites, online booking, CRM, marketing, SEO and the systems that help a service business grow.",
  libraryTitle: "Explore the library",
  libraryLead: "Browse focused articles designed to turn a business question into a useful next step.",
  allCategories: "All",
  loadMore: "Load more articles",
  articleCount: (count) => `${count} ${count === 1 ? "article" : "articles"}`,
  readArticle: "Read article",
  categoryLabels: {
    Business: "Business",
    Websites: "Websites",
    Booking: "Booking",
    CRM: "CRM",
    Marketing: "Marketing",
    SEO: "SEO",
  },
  homepage: {
    eyebrow: "FROM THE JOURNAL",
    title: "Useful ideas for running a better service business",
    viewAll: "View all articles",
  },
};

const russian: JournalUiCopy = {
  eyebrow: "ЖУРНАЛ ONESTUDIO",
  name: "Журнал OneStudio",
  headline: "Идеи, инструкции и практические знания для сервисного бизнеса",
  lead: "Практические материалы о сайтах, онлайн-бронировании, CRM, маркетинге, SEO и системах, которые помогают развивать сервисный бизнес.",
  libraryTitle: "Библиотека материалов",
  libraryLead: "Выбирайте полезные статьи, которые помогают превратить вопрос бизнеса в понятный следующий шаг.",
  allCategories: "Все",
  loadMore: "Показать ещё статьи",
  articleCount: (count) => `${count} ${count % 10 === 1 && count % 100 !== 11 ? "статья" : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20) ? "статьи" : "статей"}`,
  readArticle: "Читать статью",
  categoryLabels: {
    Business: "Бизнес",
    Websites: "Сайты",
    Booking: "Бронирование",
    CRM: "CRM",
    Marketing: "Маркетинг",
    SEO: "SEO",
  },
  homepage: {
    eyebrow: "ИЗ ЖУРНАЛА",
    title: "Полезные идеи для развития сервисного бизнеса",
    viewAll: "Смотреть все статьи",
  },
};

export function getJournalUiCopy(locale: Locale): JournalUiCopy {
  return locale === "ru" ? russian : english;
}

export function formatJournalDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
