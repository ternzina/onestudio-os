"use client";

import { useEffect, useMemo, useState } from "react";
import AnimatedTitle from "@/components/ui/AnimatedTitle";
import PremiumContainer from "@/components/ui/PremiumContainer";
import { useLanguage } from "../../lib/language-provider";
import { supabase } from "../../lib/supabase";

const defaultImage = "/images/team/logo.webp";

const content = {
  uk: {
    eyebrow: "КОМАНДА",
    title: "Команда, яка створює вашу зйомку від ідеї до результату",
    detailsEyebrow: "Детальніше",
    detailsTitle: "Про кожного спеціаліста",
    detailsDescription:
      "Розкрийте потрібний блок, щоб побачити досвід і роль кожного учасника команди.",
    team: [
      {
        name: "Sisters Photo Studio",
        role: "Команда повного циклу",
        text: "Від ідеї та стилізації до beauty-підготовки, фото, відео й фінального результату.",
        image: "/images/team/logo.webp",
        isLogo: true,
      },
      {
        name: "Катя Тернавська",
        role: "Фотограф",
        text: "Студійні зйомки, робота зі світлом та допомога з позуванням.",
        image: "https://cdn.sistersstudio.pl/site/team/1783870732493-tempimagebojtd1-ec434c45-ddb0-4ef9-b4de-02309668a25e.webp",
      },
      {
        name: "Настя Тернавська",
        role: "Відеограф",
        text: "Знімає атмосферу процесу та створює професійні відео під формат вашої зйомки.",
        image: "https://cdn.sistersstudio.pl/site/team/1783870763060-tempimage263yih-46adc3ea-34e6-4e9c-a647-0d81fa1a8970.webp",
      },
      {
        name: "Hanna Sushkova",
        role: "Стиліст / арт-директор",
        text: "Продумує образи, деталі, фон і концепцію, щоб усе працювало в одній історії.",
        image: "https://cdn.sistersstudio.pl/site/team/1783870749030-tempimagef4kreq-a2df2048-cf90-480a-b86f-86073af57d16.webp",
      },
      {
        name: "Karina Lutsiuk",
        role: "Hair stylist",
        text: "Створює зачіски для fashion, beauty та commercial-зйомок із сучасними техніками й текстурами.",
        image: "https://cdn.sistersstudio.pl/site/team/1783870787054-tempimagelcfynh-3fc357dc-bf20-4e72-9e26-200736d54c59.webp",
      },
      {
        name: "Anya Moloko",
        role: "Візажист",
        text: "Підбирає макіяж під зовнішність, тип шкіри, стиль зйомки та ваші побажання.",
        image: "https://cdn.sistersstudio.pl/site/team/1783871596207-tempimagegxsvym-d8f7f52f-1813-4108-ba7d-10ec18576b22.webp",
      },
    ],
    details: [
      {
        title: "Фотограф",
        name: "Катя Тернавська",
        body: [
          "Фотограф із 10-річним досвідом. За цей час провела навчання з нуля для понад 50 фотографів.",
          "Допомагає виглядати впевнено й природно у кадрі. Спеціалізується на студійних зйомках та роботі зі світлом будь-якої складності.",
          "Її суперсила — бачити фотогенічність у кожній людині та підкреслювати зовнішність через ракурс, світло й настрій, щоб у кадрі ви виглядали дорого і в гармонії з собою.",
        ],
      },
      {
        title: "Відеограф",
        name: "Настя Тернавська",
        body: [
          "Відеограф із досвідом у зйомці більше 2 років, у монтажі — більше 3 років.",
          "Працює з блогерами та медійними особистостями, створюючи атмосферні відеоматеріали й готові ролики під запит клієнта.",
          "Використовує професійну техніку: Sony A7, обʼєктив 35mm 1.4, стабілізатор та мікрофон.",
        ],
      },
      {
        title: "Стиліст / арт-директор",
        name: "Hanna Sushkova",
        body: [
          "Креативний директор і стиліст із досвідом роботи на зйомках більше 3 років.",
          "Створює не просто продумані до деталей стильні образи, а візуальну історію, яка відображає ідею та внутрішній світ людини або бренду.",
          "Для неї важливо, щоб кожна деталь, образ, фон, світло, макіяж та зачіска працювали разом в одній концепції.",
        ],
      },
      {
        title: "Hair stylist",
        name: "Karina Lutsiuk",
        body: [
          "Досвід у сфері hair styling більше 3 років. Працює з fashion, beauty та commercial-зйомками.",
          "Створює зачіски будь-якої складності з використанням сучасних технік і трендових текстур.",
          "Має досвід роботи з блогерами, брендами, експертами та на телебаченні.",
        ],
      },
      {
        title: "Візажист",
        name: "Anya Moloko",
        body: [
          "Візажист із 3-річним досвідом. Працювала з моделями на Paris Fashion Week, співпрацює із зірками, блогерами, інфлюенсерами та брендами.",
          "Легко виконує різні запити на високому рівні, враховуючи особливості шкіри, зовнішності, доречність образу та побажання клієнта.",
        ],
      },
    ],
  },
  pl: {
    eyebrow: "ZESPÓŁ",
    title: "Zespół, który tworzy sesję od pomysłu do gotowego efektu",
    detailsEyebrow: "Więcej",
    detailsTitle: "O każdym specjaliście",
    detailsDescription:
      "Rozwiń wybrany blok, aby zobaczyć doświadczenie i rolę każdego członka zespołu.",
    team: [
      {
        name: "Sisters Photo Studio",
        role: "Zespół pełnego cyklu",
        text: "Od pomysłu i stylizacji po przygotowanie beauty, zdjęcia, wideo i finalny efekt.",
        image: "/images/team/logo.webp",
        isLogo: true,
      },
      {
        name: "Katya Ternavska",
        role: "Fotograf",
        text: "Sesje studyjne, praca ze światłem i pomoc w pozowaniu.",
        image: "https://cdn.sistersstudio.pl/site/team/1783870732493-tempimagebojtd1-ec434c45-ddb0-4ef9-b4de-02309668a25e.webp",
      },
      {
        name: "Nastia Ternavska",
        role: "Wideograf",
        text: "Uchwyca atmosferę procesu i tworzy profesjonalne wideo dopasowane do formatu sesji.",
        image: "https://cdn.sistersstudio.pl/site/team/1783870763060-tempimage263yih-46adc3ea-34e6-4e9c-a647-0d81fa1a8970.webp",
      },
      {
        name: "Hanna Sushkova",
        role: "Stylistka / art director",
        text: "Przemyśla stylizacje, detale, tło i koncepcję, aby wszystko działało jako jedna historia.",
        image: "https://cdn.sistersstudio.pl/site/team/1783870749030-tempimagef4kreq-a2df2048-cf90-480a-b86f-86073af57d16.webp",
      },
      {
        name: "Karina Lutsiuk",
        role: "Hair stylist",
        text: "Tworzy fryzury do sesji fashion, beauty i commercial, używając nowoczesnych technik i tekstur.",
        image: "https://cdn.sistersstudio.pl/site/team/1783870787054-tempimagelcfynh-3fc357dc-bf20-4e72-9e26-200736d54c59.webp",
      },
      {
        name: "Anya Moloko",
        role: "Makeup artist",
        text: "Dobiera makijaż do urody, typu skóry, stylu sesji i Twoich życzeń.",
        image: "https://cdn.sistersstudio.pl/site/team/1783871596207-tempimagegxsvym-d8f7f52f-1813-4108-ba7d-10ec18576b22.webp",
      },
    ],
    details: [
      {
        title: "Fotograf",
        name: "Katya Ternavska",
        body: [
          "Fotograf z 10-letnim doświadczeniem. W tym czasie przeprowadziła szkolenia od podstaw dla ponad 50 fotografów.",
          "Pomaga wyglądać pewnie i naturalnie w kadrze. Specjalizuje się w sesjach studyjnych i pracy ze światłem o różnym poziomie trudności.",
          "Jej mocną stroną jest dostrzeganie fotogeniczności w każdej osobie oraz podkreślanie urody przez kąt, światło i nastrój, aby w kadrze wyglądać elegancko i w harmonii ze sobą.",
        ],
      },
      {
        title: "Wideograf",
        name: "Nastia Ternavska",
        body: [
          "Wideograf z ponad 2-letnim doświadczeniem w nagrywaniu i ponad 3-letnim doświadczeniem w montażu.",
          "Pracuje z blogerami i osobami medialnymi, tworząc atmosferyczne materiały wideo oraz gotowe rolki dopasowane do potrzeb klienta.",
          "Korzysta z profesjonalnego sprzętu: Sony A7, obiektywu 35 mm 1.4, stabilizatora i mikrofonu.",
        ],
      },
      {
        title: "Stylistka / art director",
        name: "Hanna Sushkova",
        body: [
          "Kreatywna dyrektorka i stylistka z ponad 3-letnim doświadczeniem pracy przy sesjach.",
          "Tworzy nie tylko dopracowane stylizacje, ale wizualną historię, która odzwierciedla pomysł oraz wewnętrzny świat osoby lub marki.",
          "Ważne jest dla niej, aby każdy detal, stylizacja, tło, światło, makijaż i fryzura działały razem w jednej koncepcji.",
        ],
      },
      {
        title: "Hair stylist",
        name: "Karina Lutsiuk",
        body: [
          "Ponad 3 lata doświadczenia w hair stylingu. Pracuje przy sesjach fashion, beauty i commercial.",
          "Tworzy fryzury o różnym poziomie trudności, wykorzystując nowoczesne techniki i modne tekstury.",
          "Ma doświadczenie we współpracy z blogerami, markami, ekspertami oraz przy projektach telewizyjnych.",
        ],
      },
      {
        title: "Makeup artist",
        name: "Anya Moloko",
        body: [
          "Makeup artist z 3-letnim doświadczeniem. Pracowała z modelkami podczas Paris Fashion Week oraz współpracuje z gwiazdami, blogerami, influencerami i markami.",
          "Z łatwością realizuje różne życzenia na wysokim poziomie, uwzględniając typ skóry, urodę, charakter stylizacji i potrzeby klienta.",
        ],
      },
    ],
  },
} as const;

type TeamRow = {
  id: string;
  name: string | null;
  position: string | null;
  bio_uk: string | null;
  bio_pl: string | null;
  image_url: string | null;
  instagram_url: string | null;
  is_active: boolean | null;
  sort_order: number | null;
};

type DisplayPerson = {
  id: string;
  name: string;
  role: string;
  text: string;
  image: string;
  instagramUrl: string;
  isLogo?: boolean;
  detailsBody: readonly string[];
};

type DetailItem = {
  title: string;
  name: string;
  body: readonly string[];
};

function splitBio(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function getShortText(text: string) {
  const cleanText = text.trim();

  if (cleanText.length <= 170) return cleanText;

  return `${cleanText.slice(0, 167).trim()}...`;
}

function isStudioLogo(name: string, image: string) {
  const normalizedName = name.toLowerCase();
  const normalizedImage = image.toLowerCase();

  return (
    normalizedName.includes("sisters") ||
    normalizedName.includes("studio") ||
    normalizedImage.includes("logo")
  );
}

export default function Team() {
  const [openIndex, setOpenIndex] = useState(0);
  const [teamRows, setTeamRows] = useState<TeamRow[]>([]);
  const { lang } = useLanguage();
  const current = content[lang];

  useEffect(() => {
    async function loadTeam() {
      const { data, error } = await supabase
        .from("team")
        .select(
          "id, name, position, bio_uk, bio_pl, image_url, instagram_url, is_active, sort_order"
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (!error && data) {
        setTeamRows(data as TeamRow[]);
      }
    }

    loadTeam();
  }, []);

  const fallbackTeam: DisplayPerson[] = current.team.map((person, index) => {
    const detail = current.details.find((item) => item.name === person.name);

    return {
      id: `${person.name}-${index}`,
      name: person.name,
      role: person.role,
      text: person.text,
      image: person.image,
      instagramUrl: "",
      isLogo: "isLogo" in person ? person.isLogo : false,
      detailsBody: detail?.body || [person.text],
    };
  });

  const databaseTeam: DisplayPerson[] = useMemo(() => {
    return teamRows
      .filter((person) => person.name?.trim())
      .map((person, index) => {
        const name = person.name?.trim() || "Sisters Studio";
        const image = person.image_url?.trim() || fallbackTeam[index]?.image || defaultImage;
        const bio = lang === "uk" ? person.bio_uk || "" : person.bio_pl || "";
        const cleanBio = bio.trim();
        const role = person.position?.trim() || fallbackTeam[index]?.role || "Sisters Studio";
        const detailsBody = splitBio(cleanBio || fallbackTeam[index]?.text || role);

        return {
          id: person.id,
          name,
          role,
          text: getShortText(cleanBio || fallbackTeam[index]?.text || role),
          image,
          instagramUrl: person.instagram_url?.trim() || "",
          isLogo: isStudioLogo(name, image),
          detailsBody,
        };
      });
  }, [teamRows, lang, fallbackTeam]);

  const visibleTeam = databaseTeam.length > 0 ? databaseTeam : fallbackTeam;

  const details: DetailItem[] =
    databaseTeam.length > 0
      ? visibleTeam
          .filter((person) => !person.isLogo)
          .map((person) => ({
            title: person.role,
            name: person.name,
            body: person.detailsBody.length > 0 ? person.detailsBody : [person.text],
          }))
      : current.details.map((item) => ({
          title: item.title,
          name: item.name,
          body: [...item.body],
        }));

  return (
    <section id="team" className="bg-[#0B0908] py-24 sm:py-28 lg:py-32">
      <PremiumContainer>
        <AnimatedTitle eyebrow={current.eyebrow} title={current.title} />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {visibleTeam.map((person) => (
            <article
              key={`${person.id}-${person.name}`}
              className="group min-h-[250px] rounded-[30px] border border-[#4A332B] bg-[radial-gradient(circle_at_top_left,rgba(217,141,162,0.10),rgba(23,16,13,0.96)_48%)] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.24)] transition duration-300 hover:border-[#D98DA2]/70 hover:bg-[#1D1411] sm:p-7"
            >
              <div className="flex h-full flex-col gap-6 sm:flex-row sm:items-center">
                <div className="relative mx-auto h-[132px] w-[132px] shrink-0 overflow-hidden rounded-full border border-[#D98DA2]/55 bg-[#100B09] shadow-[0_18px_45px_rgba(0,0,0,0.28)] sm:mx-0">
                  {person.isLogo ? (
                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(217,141,162,0.32),rgba(23,16,13,0.94)_72%)] p-5">
                      <img
                        src={person.image}
                        alt={person.name}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        className="h-full w-full rounded-full object-contain drop-shadow-[0_14px_30px_rgba(217,141,162,0.24)]"
                      />
                    </div>
                  ) : (
                    <img
                      src={person.image}
                      alt={person.name}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                    />
                  )}
                </div>

                <div className="min-w-0 text-center sm:text-left">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#D98DA2]">
                    {person.role}
                  </p>

                  <h3 className="font-serif text-[26px] leading-tight text-[#FFF7EF] sm:text-[27px]">
                    {person.name}
                  </h3>

                  <div className="mx-auto my-4 h-px w-14 bg-[#D98DA2]/60 sm:mx-0" />

                  <p className="text-[14px] leading-7 text-[#D8C9BF]">
                    {person.text}
                  </p>

                  {person.instagramUrl && (
                    <a
                      href={person.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex rounded-full border border-[#D98DA2]/35 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D98DA2] transition hover:bg-[#D98DA2]/12"
                    >
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {details.length > 0 && (
          <div className="mt-12 rounded-[32px] border border-[#4A332B] bg-[#15100D] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-7 lg:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#D98DA2]">
                  {current.detailsEyebrow}
                </p>
                <h3 className="mt-3 font-serif text-[32px] leading-tight text-[#FFF7EF] sm:text-[42px]">
                  {current.detailsTitle}
                </h3>
              </div>

              <p className="max-w-[360px] text-[14px] leading-7 text-[#D8C9BF] sm:text-right">
                {current.detailsDescription}
              </p>
            </div>

            <div className="space-y-3">
              {details.map((item, index) => {
                const isOpen = openIndex === index;

                return (
                  <div
                    key={`${item.title}-${item.name}`}
                    className="overflow-hidden rounded-[24px] border border-[#4A332B] bg-[#100B09]/70"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-[#1D1411] sm:px-6"
                      aria-expanded={isOpen}
                    >
                      <span>
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.28em] text-[#D98DA2]">
                          {item.title}
                        </span>
                        <span className="mt-1 block font-serif text-[24px] text-[#FFF7EF]">
                          {item.name}
                        </span>
                      </span>

                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#D98DA2]/50 text-[24px] leading-none text-[#D98DA2]"
                        aria-hidden="true"
                      >
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-6 sm:px-6">
                        <div className="h-px w-full bg-[#4A332B]" />
                        <div className="grid gap-4 pt-5 md:grid-cols-3">
                          {item.body.map((paragraph) => (
                            <p
                              key={paragraph}
                              className="rounded-[18px] border border-[#4A332B]/70 bg-[#17100D] p-4 text-[15px] leading-7 text-[#D8C9BF]"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </PremiumContainer>
    </section>
  );
}
