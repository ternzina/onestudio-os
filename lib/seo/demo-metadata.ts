import type { Metadata } from "next";
import { createPageMetadata } from "../../app/_seo/site.ts";

// These routes expose a Russian homepage and a distinct English translation.
export const LOCALIZED_DEMOS = {
  "align-pilates-studio": ["ALIGN Pilates Studio", "Pilates studio", "студии пилатеса"],
  "ritmo-dance-studio": ["RITMO Dance Studio", "Dance studio", "танцевальной студии"],
  "pawhaus-grooming-studio": ["PAWHAUS Grooming Studio", "Pet grooming", "груминг-салона"],
  "rastem-center": ["RASTEM", "Children’s learning center", "детского центра"],
  "blackline-tattoo": ["BLACKLINE", "Tattoo studio", "тату-студии"],
  "bloom-floral-studio": ["BLOOM Floral Atelier", "Florist", "цветочной мастерской"],
  "lumea-beauty": ["LUMÉA Beauty Studio", "Beauty salon", "салона красоты"],
  "vow-films": ["VOW FILMS", "Wedding videographer", "свадебного видеографа"],
} as const;

export function createDemoMetadata(
  slug: keyof typeof LOCALIZED_DEMOS,
  locale: "ru" | "en",
): Metadata {
  const [name, englishType, russianType] = LOCALIZED_DEMOS[slug];
  const root = `/demos/${slug}`;
  const path = locale === "en" ? `${root}/en` : root;
  const title = locale === "en"
    ? `${englishType} website template demo: ${name}`
    : `${name} — демо шаблона сайта ${russianType}`;
  const description = locale === "en"
    ? `Explore the ${name} website template by OneStudio OS. Preview its design, service sections and contact experience, then use it for your business website.`
    : `Посмотрите демо шаблона ${name} от OneStudio OS: дизайн сайта ${russianType}, разделы услуг и контакты. Используйте шаблон для собственного бизнеса.`;
  const metadata = createPageMetadata({ title, description, path });
  return {
    ...metadata,
    alternates: { canonical: path, languages: { ru: root, en: `${root}/en`, "x-default": root } },
    openGraph: { ...metadata.openGraph, locale: locale === "en" ? "en_US" : "ru_RU" },
  };
}

export const LOCALIZED_DEMO_PATHS = Object.keys(LOCALIZED_DEMOS)
  .flatMap((slug) => [`/demos/${slug}`, `/demos/${slug}/en`]);
