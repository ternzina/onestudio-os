"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { LanguageProvider, useLanguage } from "../../lib/language-provider";
import LearningExtraBlocksRenderer, { type LearningExtraBlock } from "../../components/learning/LearningExtraBlocksRenderer";


export type LearningDbContent = {
  [key: string]: string | number | undefined;
};

export type LearningProgramRow = {
  id: string;
  title_uk: string;
  title_pl: string;
  description_uk: string;
  description_pl: string;
  image_url: string;
  media_type: "image" | "video";
  price_text_uk: string;
  price_text_pl: string;
  duration_uk: string;
  duration_pl: string;
  is_active: boolean;
  sort_order: number;
};

export type LearningBenefitRow = {
  id: string;
  text_uk: string;
  text_pl: string;
  is_active: boolean;
  sort_order: number;
};

const pageText = {
  uk: {
    eyebrow: "Sisters Studio Academy",
    titleTop: "Навчання",
    titleBottom: "фотографів",
    description:
      "Курси, воркшопи та індивідуальний менторинг у просторі Sisters Studio. Вчимо працювати зі світлом, моделлю, камерою та атмосферою кадру.",
    primaryButton: "Обрати програму",
    secondaryButton: "На головну",
    imageAltLearning: "Навчання фотографів",
    imageAltCamera: "Камера та обладнання",
    practiceTitle: "Практика",
    practiceText:
      "Не суха теорія, а робота в студії зі світлом, камерою та реальними задачами.",
    formatsEyebrow: "Формати навчання",
    formatsTitle: "Для різного рівня та цілей",
    includesEyebrow: "Що входить",
    includesTitle: "Навчання у живій студійній атмосфері",
    storiesEyebrow: "Результати після навчання",
    storiesTitle: "Історії наших випускниць",
    storiesDescription:
      "Справжні історії про нові навички, впевненість у роботі та професійні результати після навчання у Sisters Studio Academy.",
    programs: [
      {
        title: "Курс для початківців",
        text: "Основи камери, світла, композиції та впевненої роботи під час зйомки.",
      },
      {
        title: "Практика у студії",
        text: "Робота зі студійним світлом, моделлю, фонами та професійною атмосферою.",
      },
      {
        title: "Менторинг 1:1",
        text: "Індивідуальний розбір, портфоліо, стиль, помилки та план розвитку фотографа.",
      },
    ],
    benefits: [
      "Практика в реальному студійному просторі",
      "Робота зі світлом та обладнанням",
      "Поради від практикуючих фотографів",
      "Можливість створити кадри для портфоліо",
    ],
  },
  pl: {
    eyebrow: "Sisters Studio Academy",
    titleTop: "Szkolenia",
    titleBottom: "fotografów",
    description:
      "Kursy, warsztaty i indywidualny mentoring w przestrzeni Sisters Studio. Uczymy pracy ze światłem, modelką, aparatem i atmosferą kadru.",
    primaryButton: "Wybierz program",
    secondaryButton: "Na stronę główną",
    imageAltLearning: "Szkolenia fotografów",
    imageAltCamera: "Aparat i sprzęt",
    practiceTitle: "Praktyka",
    practiceText:
      "Nie sucha teoria, ale praca w studio ze światłem, aparatem i prawdziwymi zadaniami.",
    formatsEyebrow: "Formaty szkoleń",
    formatsTitle: "Dla różnych poziomów i celów",
    includesEyebrow: "Co obejmuje",
    includesTitle: "Nauka w żywej atmosferze studia",
    storiesEyebrow: "Rezultaty po szkoleniu",
    storiesTitle: "Historie naszych absolwentek",
    storiesDescription:
      "Prawdziwe historie o nowych umiejętnościach, pewności w pracy i zawodowych rezultatach po szkoleniu w Sisters Studio Academy.",
    programs: [
      {
        title: "Kurs dla początkujących",
        text: "Podstawy aparatu, światła, kompozycji i pewnej pracy podczas sesji.",
      },
      {
        title: "Praktyka w studio",
        text: "Praca ze światłem studyjnym, modelką, tłami i profesjonalną atmosferą.",
      },
      {
        title: "Mentoring 1:1",
        text: "Indywidualna analiza, portfolio, styl, błędy i plan rozwoju fotografa.",
      },
    ],
    benefits: [
      "Praktyka w prawdziwej przestrzeni studyjnej",
      "Praca ze światłem i sprzętem",
      "Wskazówki od praktykujących fotografów",
      "Możliwość stworzenia kadrów do portfolio",
    ],
  },
};

type LearningContentProps = {
  dbContent: LearningDbContent | null;
  dbPrograms: LearningProgramRow[];
  dbBenefits: LearningBenefitRow[];
  extraBlocks: LearningExtraBlock[];
};

function LearningContent({ dbContent, dbPrograms, dbBenefits, extraBlocks }: LearningContentProps) {
  const { lang } = useLanguage();
  const fallback = pageText[lang];

  const value = (field: string, fallbackValue: string) => {
    const dbValue = dbContent?.[field];
    return typeof dbValue === "string" && dbValue.trim() ? dbValue : fallbackValue;
  };

  const t = {
    ...fallback,
    eyebrow: value(`hero_eyebrow_${lang}`, fallback.eyebrow),
    titleTop: value(`hero_title_top_${lang}`, fallback.titleTop),
    titleBottom: value(`hero_title_bottom_${lang}`, fallback.titleBottom),
    description: value(`hero_description_${lang}`, fallback.description),
    primaryButton: value(`primary_button_${lang}`, fallback.primaryButton),
    secondaryButton: value(`secondary_button_${lang}`, fallback.secondaryButton),
    practiceTitle: value(`practice_title_${lang}`, fallback.practiceTitle),
    practiceText: value(`practice_text_${lang}`, fallback.practiceText),
    formatsEyebrow: value(`formats_eyebrow_${lang}`, fallback.formatsEyebrow),
    formatsTitle: value(`formats_title_${lang}`, fallback.formatsTitle),
    includesEyebrow: value(`includes_eyebrow_${lang}`, fallback.includesEyebrow),
    includesTitle: value(`includes_title_${lang}`, fallback.includesTitle),
  };

  const programs = dbPrograms.length
    ? dbPrograms.map((item) => ({
        id: item.id,
        title: lang === "uk" ? item.title_uk : item.title_pl,
        text: lang === "uk" ? item.description_uk : item.description_pl,
        imageUrl: item.image_url,
        mediaType: item.media_type || "image",
        price: lang === "uk" ? item.price_text_uk : item.price_text_pl,
        duration: lang === "uk" ? item.duration_uk : item.duration_pl,
      }))
    : fallback.programs.map((item, index) => ({
        ...item,
        id: String(index),
        imageUrl: "",
        mediaType: "image" as const,
        price: "",
        duration: "",
      }));

  const benefits = dbBenefits.length
    ? dbBenefits.map((item) => (lang === "uk" ? item.text_uk : item.text_pl))
    : fallback.benefits;

  const configuredHeroImageOne = value(
    "hero_image_one_url",
    "/images/site/home/learning.webp",
  );
  const configuredHeroImageTwo = value(
    "hero_image_two_url",
    "/images/site/home/equipment.webp",
  );
  const heroImageOne = configuredHeroImageOne.includes("1783898313372-home-learning-")
    ? "/images/site/home/learning.webp"
    : configuredHeroImageOne;
  const heroImageTwo = configuredHeroImageTwo.includes("1783898283381-home-camera-")
    ? "/images/site/home/equipment.webp"
    : configuredHeroImageTwo;

  return (
    <main className="min-h-screen bg-[#0B0908] text-[#FFF7F2]">
      <Header />

      <section className="relative overflow-hidden px-5 pb-24 pt-36 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(245,162,183,0.15),transparent_30%),radial-gradient(circle_at_18%_34%,rgba(92,51,43,0.55),transparent_34%),linear-gradient(180deg,#0B0908_0%,#080504_100%)]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="mb-7 text-xs font-semibold uppercase tracking-[0.45em] text-[#F5A2B7]/80">
                {t.eyebrow}
              </p>

              <h1 className="font-serif text-5xl leading-[0.95] text-[#FFF7F2] sm:text-7xl lg:text-8xl">
                {t.titleTop}
                <span className="block text-[#F5A2B7]">{t.titleBottom}</span>
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-[#E7D8CF]">
                {t.description}
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#programs"
                  className="inline-flex items-center justify-center rounded-xl bg-[#F5A2B7] px-9 py-5 text-sm font-bold uppercase tracking-[0.18em] text-[#150B09] shadow-[0_0_38px_rgba(245,162,183,0.24)] transition hover:scale-[1.02]"
                >
                  {t.primaryButton}
                  <span className="ml-4">→</span>
                </a>

                <Link
                  href="/#directions"
                  className="inline-flex items-center justify-center rounded-xl border border-[#F5A2B7]/45 px-9 py-5 text-sm font-bold uppercase tracking-[0.18em] text-[#F5A2B7] transition hover:bg-[#F5A2B7]/10"
                >
                  {t.secondaryButton}
                </Link>
              </div>
            </div>

            <div className="relative min-h-[520px]">
              <div className="absolute left-[8%] top-[4%] z-0 font-serif text-[430px] leading-none text-[#F5A2B7]/[0.045]">
                S
              </div>

              <div className="absolute inset-0 rounded-full bg-[#F5A2B7]/10 blur-[90px]" />

              <div className="absolute left-[8%] top-[2%] z-30 h-[330px] w-[270px] rotate-[-4deg] overflow-hidden rounded-[30px] border border-[#F5A2B7]/25 bg-gradient-to-br from-[#1A0F0C] to-[#3A201C] shadow-[0_0_45px_rgba(245,162,183,0.13)] md:h-[390px] md:w-[320px]">
                <Image
                  src={heroImageOne}
                  alt={t.imageAltLearning}
                  fill
                  sizes="(max-width: 768px) 270px, 320px"
                  preload
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="absolute bottom-[2%] right-[4%] z-20 h-[260px] w-[330px] rotate-[5deg] overflow-hidden rounded-[30px] border border-[#F5A2B7]/25 bg-gradient-to-br from-[#1A0F0C] to-[#3A201C] shadow-[0_0_45px_rgba(245,162,183,0.13)]">
                <Image
                  src={heroImageTwo}
                  alt={t.imageAltCamera}
                  fill
                  sizes="330px"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="absolute right-[10%] top-[14%] z-40 rounded-[28px] border border-[#F5A2B7]/25 bg-[#120B09]/85 p-7 shadow-[0_0_45px_rgba(245,162,183,0.1)] backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#F5A2B7]">
                  {t.practiceTitle}
                </p>
                <p className="mt-3 max-w-[230px] text-sm leading-6 text-[#E7D8CF]">
                  {t.practiceText}
                </p>
              </div>
            </div>
          </div>

          <LearningExtraBlocksRenderer placement="after_hero" blocks={extraBlocks} />

          <section id="programs" className="mt-24">
            <div className="mb-9">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.42em] text-[#F5A2B7]/75">
                {t.formatsEyebrow}
              </p>

              <h2 className="font-serif text-4xl text-[#FFF7F2] sm:text-5xl">
                {t.formatsTitle}
              </h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {programs.map((program) => (
                <article
                  key={program.id}
                  className="rounded-[28px] border border-[#F5A2B7]/22 bg-[#120B09]/82 p-8 shadow-[0_0_35px_rgba(245,162,183,0.05)]"
                >
                  {program.imageUrl ? (
                    <div className="relative mb-7 aspect-[4/3] overflow-hidden rounded-[22px] border border-[#F5A2B7]/20 bg-black">
                      {program.mediaType === "video" ? (
                        <video
                          src={program.imageUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Image
                          src={program.imageUrl}
                          alt={program.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-cover"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-[#F5A2B7]/35 bg-[#F5A2B7]/10 text-3xl text-[#F5A2B7]">◇</div>
                  )}
                  <h3 className="font-serif text-3xl text-[#FFF7F2]">{program.title}</h3>
                  <p className="mt-5 text-sm leading-7 text-[#D7C8C0]">{program.text}</p>
                  {(program.duration || program.price) && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {program.duration && <span className="rounded-full border border-[#F5A2B7]/25 px-3 py-1 text-xs text-[#E7D8CF]">{program.duration}</span>}
                      {program.price && <span className="rounded-full bg-[#F5A2B7]/10 px-3 py-1 text-xs text-[#F5A2B7]">{program.price}</span>}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>

          <LearningExtraBlocksRenderer placement="after_programs" blocks={extraBlocks} />

          <section className="mt-20 rounded-[36px] border border-[#F5A2B7]/20 bg-[#100A08]/70 p-8 shadow-[0_0_60px_rgba(245,162,183,0.06)] sm:p-10 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.42em] text-[#F5A2B7]/75">
                  {t.includesEyebrow}
                </p>

                <h2 className="font-serif text-4xl text-[#FFF7F2]">
                  {t.includesTitle}
                </h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="border-l border-[#F5A2B7]/25 pl-5 text-sm leading-7 text-[#D7C8C0]"
                  >
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <LearningExtraBlocksRenderer placement="after_benefits" blocks={extraBlocks} />
          <LearningExtraBlocksRenderer placement="page_bottom" blocks={extraBlocks} />

          <section className="relative mt-24 overflow-hidden rounded-[36px] border border-[#F5A2B7]/20 bg-[#100A08]/80 px-5 py-10 shadow-[0_0_70px_rgba(245,162,183,0.07)] sm:px-10 sm:py-14 lg:px-14">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#F5A2B7]/10 blur-[90px]" />
            <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-[#6A382F]/25 blur-[100px]" />

            <div className="relative mx-auto max-w-5xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#F5A2B7]/75">
                {fallback.storiesEyebrow}
              </p>
              <h2 className="mt-4 font-serif text-4xl text-[#FFF7F2] sm:text-5xl lg:text-6xl">
                {fallback.storiesTitle}
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-[#D7C8C0] sm:text-base">
                {fallback.storiesDescription}
              </p>

              <div className="relative mt-9 aspect-video overflow-hidden rounded-[24px] border border-[#F5A2B7]/25 bg-black shadow-[0_24px_70px_rgba(0,0,0,0.42)] sm:mt-11 sm:rounded-[30px]">
                <video
                  src="/videos/training-student-story.mp4"
                  poster="/images/site/training-student-story-poster.webp"
                  controls
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function LearningPageClient(props: LearningContentProps) {
  return (
    <LanguageProvider>
      <LearningContent {...props} />
    </LanguageProvider>
  );
}
