import type { PublicSiteContent } from "./types.ts";
import { replaceTemplateContentPreservingEditorState } from "./template-native-section-state.ts";

export const VELORA_TEMPLATE_KEY = "velora-event-venue" as const;
export type VeloraItem = Record<string, string>;
export type VeloraContent = {
  version: 1;
  brand: string;
  plum: string;
  muted: string;
  secondary: string;
  border: string;
  warm: string;
  overlay: string;
  buttonForeground: string;
  navigation: VeloraItem[];
  header: VeloraItem;
  hero: VeloraItem;
  availability: VeloraItem;
  venuesPresentation: VeloraItem;
  venues: VeloraItem[];
  formatsPresentation: VeloraItem;
  formats: VeloraItem[];
  transformation: VeloraItem;
  storyPresentation: VeloraItem;
  story: VeloraItem[];
  packagesPresentation: VeloraItem;
  packages: VeloraItem[];
  includedPresentation: VeloraItem;
  included: VeloraItem[];
  galleryPresentation: VeloraItem;
  gallery: VeloraItem[];
  cateringPresentation: VeloraItem;
  catering: VeloraItem[];
  decor: VeloraItem;
  coordinator: VeloraItem;
  plannerPresentation: VeloraItem;
  planner: VeloraItem[];
  facts: VeloraItem[];
  reviewsPresentation: VeloraItem;
  reviews: VeloraItem[];
  faqPresentation: VeloraItem;
  faq: VeloraItem[];
  contact: VeloraItem;
  footer: VeloraItem;
  customPages: VeloraItem;
};

const asset = (name: string) => `/templates/velora/${name}.webp`;

export const DEFAULT_VELORA_CONTENT: VeloraContent = {
  version: 1,
  brand: "VELORA",
  plum: "#2D394F",
  muted: "#B7B4AE",
  secondary: "#7F96B8",
  border: "#6D5B39",
  warm: "#F2D59B",
  overlay: "#050912",
  buttonForeground: "#09111F",
  navigation: [
    { label: "Przestrzenie", href: "#venues" },
    { label: "Doświadczenia", href: "#packages" },
    { label: "Historie", href: "#stories" },
    { label: "Galeria", href: "#gallery" },
  ],
  header: {
    venuesPageLabel: "Poznaj sale",
    availabilityLabel: "Sprawdź termin",
    menuLabel: "Menu",
  },
  hero: {
    eyebrow: "VELORA · EVENT HOUSE · WARSZAWA",
    title: "Wieczór, który zostaje z Wami na zawsze.",
    text: "Światło, smak i przestrzeń prowadzone przez jeden zespół — od pierwszego szkicu aż po ostatni toast.",
    primaryLabel: "Sprawdź dostępność",
    primaryUrl: "#availability",
    secondaryLabel: "Zobacz przestrzenie",
    secondaryUrl: "#venues",
    image: asset("hero"),
    alt: "Wieczorna sala VELORA rozświetlona żyrandolami i świecami",
    traits: "Warszawa · 3 przestrzenie · 12–220 gości",
    scrollLabel: "Odkryj VELORA",
  },
  facts: [
    { value: "640+", label: "zrealizowanych wieczorów" },
    { value: "11", label: "lat doświadczenia" },
    { value: "4,9/5", label: "ocena gości demo" },
    { value: "220", label: "gości bez kompromisów" },
  ],
  venuesPresentation: {
    eyebrow: "SIGNATURE VENUES",
    title: "Jedno miejsce. Trzy zupełnie różne nastroje.",
    pageLabel: "Porównaj wszystkie przestrzenie",
    text: "Wybierz skalę i charakter. My dopasujemy światło, układ oraz tempo wieczoru.",
  },
  venues: [
    {
      name: "Grand Hall",
      mood: "Filmowy rozmach",
      capacity: "80–220 gości",
      area: "420 m²",
      features: "Wysokie sklepienie · scena · panoramiczne okna",
      formats: "Wesela · gale · premiery",
      seating: "bankiet 220 · teatr 300",
      image: asset("grand-hall"),
      alt: "Grand Hall przygotowany na elegancki wieczorny bankiet",
      cta: "Wybieram Grand Hall",
    },
    {
      name: "Garden Room",
      mood: "Światło i ogród",
      capacity: "40–110 gości",
      area: "240 m²",
      features: "Oranżeria · taras · plan deszczowy pod dachem",
      formats: "Ceremonie · kolacje · urodziny",
      seating: "bankiet 110 · koktajl 160",
      image: asset("garden-room"),
      alt: "Garden Room z zielenią i stołami przy naturalnym świetle",
      cta: "Wybieram Garden Room",
    },
    {
      name: "Atelier",
      mood: "Prywatnie i blisko",
      capacity: "12–48 gości",
      area: "110 m²",
      features: "Prywatny bar · kominek · osobne wejście",
      formats: "Kolacje · jubileusze · spotkania",
      seating: "stół 32 · koktajl 48",
      image: asset("atelier"),
      alt: "Kameralne Atelier ze stołem przygotowanym na prywatną kolację",
      cta: "Wybieram Atelier",
    },
  ],
  formatsPresentation: {
    eyebrow: "TWÓJ FORMAT",
    title: "Zobacz swój wieczór, zanim zaczniemy go planować.",
  },
  formats: [
    "Wesele",
    "Kolacja prywatna",
    "Urodziny",
    "Event firmowy",
    "Pokaz i premiera",
    "Ceremonia",
  ].map((title, index) => ({
    number: `0${index + 1}`,
    title,
    text: [
      "Ceremonia, kolacja i taniec w jednej płynnej historii.",
      "Jeden stół, autorskie menu i pełna prywatność.",
      "Świętowanie w rytmie, który pasuje do Was.",
      "Gościnność połączona z precyzyjną produkcją.",
      "Scenografia, światło i zaplecze dla mocnego debiutu.",
      "W ogrodzie lub pod dachem — bez stresu o pogodę.",
    ][index],
  })),
  transformation: {
    eyebrow: "TRANSFORMACJA",
    title: "Ta sama sala. Zupełnie inna opowieść.",
    text: "Przesuń, aby zobaczyć, jak światło, tekstylia i florystyka zmieniają pustą architekturę w gotowy wieczór.",
    beforeLabel: "Przed",
    afterLabel: "Po",
    beforeImage: asset("empty-hall"),
    beforeAlt: "Pusta sala przed przygotowaniem wydarzenia",
    afterImage: asset("dressed-hall"),
    afterAlt: "Ta sama sala po pełnej aranżacji wydarzenia",
  },
  storyPresentation: {
    eyebrow: "OD CISZY DO OSTATNIEGO TAŃCA",
    title: "Przestrzeń budzi się krok po kroku.",
    text: "Nie dokładamy dekoracji. Budujemy napięcie: światło, stół, kwiaty, ludzie, muzyka.",
  },
  story: [
    "Pusta sala",
    "Pierwsze światło",
    "Nakryty stół",
    "Kwiaty",
    "Goście",
    "Wieczór",
  ].map((title, index) => ({
    number: `0${index + 1}`,
    title,
    text: [
      "Architektura daje rytm.",
      "Ciepło wydobywa detale.",
      "Każde miejsce czeka na gościa.",
      "Kolor nadaje ton.",
      "Przestrzeń zaczyna żyć.",
      "Wszystko płynie bez wysiłku.",
    ][index],
  })),
  packagesPresentation: {
    eyebrow: "GOTOWE DOŚWIADCZENIA",
    title: "Wybierz, ile chcemy wziąć na siebie.",
    pageLabel: "Poznaj pakiety w szczegółach",
    text: "Każdy poziom można spersonalizować — różni je skala oprawy i czas, który odzyskujecie.",
  },
  packages: [
    {
      name: "Essential",
      result: "Piękna, spokojna podstawa",
      price: "od 16 900 zł",
      for: "dla kameralnych wydarzeń",
      includes: "Przestrzeń · meble · podstawowe światło · opieka gospodarza",
      decor: "subtelne akcenty",
      menu: "menu sezonowe",
      image: asset("atelier"),
      alt: "Kameralny stół w pakiecie Essential",
      cta: "Wybieram Essential",
    },
    {
      name: "Signature",
      result: "Spójna atmosfera od wejścia",
      price: "od 31 900 zł",
      for: "dla wesel i większych kolacji",
      includes:
        "Pełna sala · welcome drink · światło · koordynacja · florystyka",
      decor: "indywidualna paleta",
      menu: "menu Signature i pairing",
      image: asset("dinner"),
      alt: "Kolacja przy świecach w pakiecie Signature",
      cta: "Wybieram Signature",
    },
    {
      name: "Iconic",
      result: "Wieczór z pełną reżyserią",
      price: "od 57 900 zł",
      for: "dla wydarzeń o dużej skali",
      includes:
        "Wyłączność · scenografia · produkcja · pełny zespół · próba generalna",
      decor: "autorska instalacja",
      menu: "menu tworzone od zera",
      image: asset("event"),
      alt: "Duże wieczorne wydarzenie w pakiecie Iconic",
      cta: "Wybieram Iconic",
    },
  ],
  includedPresentation: {
    eyebrow: "W CENIE SPOKOJU",
    title: "Dziesięć rzeczy, których nie musicie koordynować.",
    text: "Jedna odpowiedzialna ekipa, jeden harmonogram i zero telefonów do pięciu podwykonawców.",
  },
  included: [
    "Przestrzeń",
    "Meble",
    "Światło",
    "Dźwięk",
    "Zastawa",
    "Dekor",
    "Koordynacja",
    "Montaż",
    "Sprzątanie",
    "Opieka zespołu",
  ].map((title, index) => ({
    number: String(index + 1).padStart(2, "0"),
    title,
  })),
  cateringPresentation: {
    eyebrow: "MENU & DRINKS",
    title: "Smak, który pasuje do tempa wieczoru.",
    text: "Sezonowe menu, autorskie koktajle i serwis, który pojawia się dokładnie wtedy, kiedy powinien.",
    image: asset("menu"),
    alt: "Eleganckie danie serwowane podczas kolacji w VELORA",
    cta: "Porozmawiajmy o menu",
  },
  catering: [
    {
      title: "Menu sezonowe",
      text: "Cztery lub sześć dań, także w wersjach roślinnych.",
      meta: "od 290 zł / osoba",
    },
    {
      title: "Welcome ritual",
      text: "Champagne, koktajl autorski lub bezalkoholowy pairing.",
      meta: "dopasowany do okazji",
    },
    {
      title: "Wasze smaki",
      text: "Degustacja i personalizacja przed wydarzeniem.",
      meta: "bez sztywnego schematu",
    },
  ],
  decor: {
    eyebrow: "DESIGN & DECOR",
    title: "Nie dekorujemy sali. Projektujemy nastrój.",
    text: "Florystyka, światło, tekstylia, papeteria i plan stołów powstają jako jeden moodboard — z Waszym stylem, nie katalogowym zestawem.",
    image: asset("decor"),
    alt: "Moodboard dekoracji z florystyką, światłem i elegancką zastawą",
  },
  coordinator: {
    eyebrow: "TWÓJ KOORDYNATOR",
    title: "Ktoś, kto pamięta o wszystkim — żebyście Wy nie musieli.",
    text: "Marta prowadzi spotkania, zbiera decyzje i pilnuje dostawców. W dniu wydarzenia jest pół kroku przed harmonogramem, a dla Was po prostu dostępna.",
    promise: "Jeden kontakt od pierwszej rozmowy do końca wieczoru.",
    image: asset("team"),
    alt: "Zespół koordynatorów wydarzeń podczas przygotowań",
  },
  reviewsPresentation: {
    eyebrow: "VELORA DEMO STORIES",
    title: "Prawdziwe potrzeby. Demonstracyjne historie.",
    disclaimer:
      "Historie i imiona poniżej są fikcyjną treścią prezentacyjną VELORA.",
  },
  reviews: [
    {
      quote:
        "Chcieliśmy kolacji, która po deserze naturalnie zmieni się w imprezę. Nie sprawdzaliśmy zegarka ani razu.",
      author: "Ola & Michał · historia demo",
      meta: "Wesele · Grand Hall · 126 gości",
      task: "ceremonia i taniec bez przerw",
      image: asset("story"),
      alt: "Goście demonstracyjnego wesela podczas wieczornego przyjęcia",
    },
    {
      quote:
        "Zespół dostał krótkie założenia, a oddał nam kompletny wieczór — od światła po ostatni drink.",
      author: "Studio North · historia demo",
      meta: "Premiera · Garden Room · 84 gości",
      task: "marka miała być obecna, lecz subtelna",
      image: asset("event"),
      alt: "Demonstracyjne wydarzenie premierowe w Garden Room",
    },
    {
      quote:
        "Atelier miało domową bliskość, ale serwis restauracji na najwyższym poziomie.",
      author: "Rodzina W. · historia demo",
      meta: "Jubileusz · Atelier · 28 gości",
      task: "prywatnie, bez sztywnego protokołu",
      image: asset("atelier"),
      alt: "Demonstracyjna kameralna kolacja jubileuszowa",
    },
  ],
  galleryPresentation: {
    eyebrow: "PO ZMROKU",
    title: "Zobacz, jak VELORA żyje.",
    dialogLabel: "Galeria wydarzeń VELORA",
    closeLabel: "Zamknij galerię",
    openLabel: "Otwórz zdjęcie",
    previousLabel: "Poprzednie zdjęcie",
    nextLabel: "Następne zdjęcie",
  },
  gallery: [
    { image: asset("grand-hall"), alt: "Wieczorny bankiet w Grand Hall" },
    { image: asset("dinner"), alt: "Goście przy stole oświetlonym świecami" },
    { image: asset("menu"), alt: "Detal sezonowego menu VELORA" },
    { image: asset("garden-room"), alt: "Ceremonia w jasnym Garden Room" },
    { image: asset("decor"), alt: "Florystyka i złote detale stołu" },
    {
      image: asset("event"),
      alt: "Tłum podczas dużego wieczornego wydarzenia",
    },
  ],
  plannerPresentation: {
    eyebrow: "JAK TO DZIAŁA",
    title: "Od daty do gotowego wieczoru — bez chaosu.",
    text: "Zaczynamy od krótkiej rozmowy. Dopiero potem powstaje propozycja dopasowana do ludzi, miejsca i budżetu.",
  },
  planner: [
    {
      number: "01",
      title: "Sprawdzamy termin",
      text: "Odpowiedź w ciągu jednego dnia roboczego.",
    },
    {
      number: "02",
      title: "Rozmawiamy",
      text: "30 minut o gościach, rytmie i priorytetach.",
    },
    {
      number: "03",
      title: "Dostajecie propozycję",
      text: "Sala, menu, oprawa i jasny budżet.",
    },
    {
      number: "04",
      title: "Planujemy",
      text: "Decyzje trafiają do jednego harmonogramu.",
    },
    {
      number: "05",
      title: "Świętujecie",
      text: "Zespół prowadzi dzień, Wy jesteście z gośćmi.",
    },
  ],
  faqPresentation: {
    eyebrow: "BEZ NIEDOMÓWIEŃ",
    title: "Pytania, które warto zadać przed rezerwacją.",
  },
  faq: [
    [
      "Co dokładnie obejmuje cena?",
      "Zakres zależy od pakietu, ale zawsze otrzymujecie przestrzeń, wyposażenie, przygotowanie i opiekę zespołu. Oferta pokazuje każdą pozycję.",
    ],
    [
      "Czy możemy zmienić pakiet?",
      "Tak. Pakiet jest punktem startu, a menu, dekor i produkcję konfigurujemy indywidualnie.",
    ],
    [
      "Co, jeśli pada?",
      "Garden Room ma pełny wariant ceremonii pod dachem. Decyzję o planie pogodowym podejmujemy bez dopłat 24 godziny wcześniej.",
    ],
    [
      "Czy możemy mieć własnych podwykonawców?",
      "Tak, po wcześniejszym uzgodnieniu montażu, bezpieczeństwa i harmonogramu z koordynatorem.",
    ],
    [
      "Kiedy najlepiej rezerwować?",
      "Soboty w sezonie warto rezerwować 10–14 miesięcy wcześniej. Kolacje i eventy firmowe często mieszczą się w 6–10 tygodniach.",
    ],
    [
      "Jak działa zaliczka?",
      "Termin potwierdza umowa i zaliczka opisana w indywidualnej ofercie. Sama wiadomość z formularza nie blokuje daty.",
    ],
    [
      "Czy można przełożyć wydarzenie?",
      "Warunki zmiany i anulacji zapisujemy jasno w umowie; zawsze najpierw szukamy nowego dostępnego terminu.",
    ],
    [
      "Czy obiekt jest dostępny?",
      "Wszystkie sale mają bezprogowy dostęp, windę i dostępną toaletę. Indywidualne potrzeby omawiamy przed wizytą.",
    ],
    [
      "Czy jest parking?",
      "Tak, dostępnych jest 46 miejsc oraz strefa bezpiecznego podjazdu dla taxi.",
    ],
    [
      "Do której może trwać wydarzenie?",
      "Standardowo do 2:00, z możliwością przedłużenia po uzgodnieniu serwisu i ochrony.",
    ],
  ].map(([question, answer]) => ({ question, answer })),
  availability: {
    eyebrow: "OSTATNI KROK",
    title: "Zacznijmy od Waszej daty.",
    text: "To niezobowiązujące zapytanie. Marta sprawdzi kalendarz i wróci z dwiema najlepiej dopasowanymi opcjami.",
    dateLabel: "Data",
    formatLabel: "Format",
    formatPlaceholder: "Wybierz format",
    guestsLabel: "Liczba gości",
    guestsPlaceholder: "np. 80",
    venueLabel: "Przestrzeń",
    venuePlaceholder: "Wybierz salę",
    packageLabel: "Pakiet",
    packagePlaceholder: "Wybierz pakiet",
    nameLabel: "Imię i nazwisko",
    emailLabel: "E-mail",
    phoneLabel: "Telefon",
    submit: "Sprawdź dostępność",
    pending: "Wysyłamy…",
    idle: "Odpowiemy w ciągu jednego dnia roboczego. Formularz nie blokuje daty.",
    success:
      "Dziękujemy. Koordynator wróci z dostępnością w ciągu jednego dnia roboczego.",
    error:
      "Nie udało się wysłać zapytania. Sprawdź dane lub skontaktuj się telefonicznie.",
    ariaLabel: "Formularz sprawdzenia dostępności VELORA",
    subject: "Sprawdzenie terminu VELORA",
  },
  contact: {
    eyebrow: "ODWIEDŹ NAS",
    title: "Najlepiej poczuć tę przestrzeń na żywo.",
    text: "Umów prywatne oprowadzanie i zobacz trzy sale w ich naturalnym świetle.",
    address: "ul. Wieczorna 24 · Warszawa",
    phone: "+48 22 555 24 24",
    email: "events@velora.house",
    hours: "codziennie · 10:00–21:00",
    map: "VELORA · Warszawa",
    mapAria: "Lokalizacja demonstracyjna VELORA",
    cta: "Sprawdź termin",
  },
  footer: {
    note: "Event house · Warszawa",
    copyright: "© 2026 VELORA · fikcyjna marka demonstracyjna",
  },
  customPages: {
    homeLabel: "Strona główna",
    venuesLabel: "Przestrzenie",
    packagesLabel: "Pakiety",
    areaLabel: "Powierzchnia",
    formatLabel: "Najlepszy format",
    requestLabel: "Sprawdź ten wariant",
    venuesEyebrow: "TRZY CHARAKTERY",
    venuesTitle: "Przestrzeń, która pracuje dla Waszego scenariusza.",
    venuesIntro:
      "Od wielkiego wejścia po kolację przy jednym stole. Porównaj atmosferę, skalę i zaplecze bez przekopywania tabel.",
    packagesEyebrow: "TRZY POZIOMY OPIEKI",
    packagesTitle: "Im większa oprawa, tym mniej decyzji po Waszej stronie.",
    packagesIntro:
      "Każdy pakiet daje piękne wydarzenie. Wybieracie skalę produkcji i ilość czasu, którą chcecie odzyskać.",
  },
};

const clone = <T>(value: T): T => structuredClone(value);
const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));
const text = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value : fallback;
const mergeObject = (fallback: VeloraItem, value: unknown): VeloraItem =>
  !isObject(value)
    ? clone(fallback)
    : Object.fromEntries(
        Object.entries(fallback).map(([key, defaultValue]) => [
          key,
          text(value[key], defaultValue),
        ]),
      );
const mergeItems = (fallback: VeloraItem[], value: unknown): VeloraItem[] =>
  !Array.isArray(value)
    ? clone(fallback)
    : fallback.map((item, index) => mergeObject(item, value[index]));
export function isSafeVeloraImageSrc(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const src = value.trim();
  return src.startsWith("/") || /^https:\/\//i.test(src);
}

const objectKeys = [
  "header",
  "hero",
  "availability",
  "venuesPresentation",
  "formatsPresentation",
  "transformation",
  "storyPresentation",
  "packagesPresentation",
  "includedPresentation",
  "galleryPresentation",
  "cateringPresentation",
  "decor",
  "coordinator",
  "plannerPresentation",
  "reviewsPresentation",
  "faqPresentation",
  "contact",
  "footer",
  "customPages",
] as const;
const listKeys = [
  "navigation",
  "venues",
  "formats",
  "story",
  "packages",
  "included",
  "gallery",
  "catering",
  "planner",
  "facts",
  "reviews",
  "faq",
] as const;
const imageSlots: Array<[keyof VeloraContent, string]> = [
  ["hero", "image"],
  ["transformation", "beforeImage"],
  ["transformation", "afterImage"],
  ["cateringPresentation", "image"],
  ["decor", "image"],
  ["coordinator", "image"],
];

export function resolveVeloraContent(
  content?: PublicSiteContent,
): VeloraContent {
  const defaults = clone(DEFAULT_VELORA_CONTENT);
  const raw = content?.template_content?.[VELORA_TEMPLATE_KEY];
  if (!isObject(raw)) return defaults;
  const source = raw as Partial<VeloraContent>;
  const result = {
    ...defaults,
    brand: text(source.brand, defaults.brand),
    plum: text(source.plum, defaults.plum),
    muted: text(source.muted, defaults.muted),
    secondary: text(source.secondary, defaults.secondary),
    border: text(source.border, defaults.border),
    warm: text(source.warm, defaults.warm),
    overlay: text(source.overlay, defaults.overlay),
    buttonForeground: text(source.buttonForeground, defaults.buttonForeground),
  };
  for (const key of objectKeys)
    result[key] = mergeObject(defaults[key], source[key]);
  for (const key of listKeys)
    result[key] = mergeItems(defaults[key], source[key]);
  for (const [key, field] of imageSlots) {
    const item = result[key] as VeloraItem;
    const fallback = defaults[key] as VeloraItem;
    item[field] = isSafeVeloraImageSrc(item[field])
      ? item[field]
      : fallback[field];
  }
  for (const key of ["venues", "packages", "gallery", "reviews"] as const)
    result[key] = result[key].map((item, index) => ({
      ...item,
      image: isSafeVeloraImageSrc(item.image)
        ? item.image
        : defaults[key][index].image,
    }));
  return result;
}

export function withVeloraContent(
  content: PublicSiteContent,
  value: VeloraContent,
  preserveEditorState = true,
) {
  return replaceTemplateContentPreservingEditorState(
    content,
    VELORA_TEMPLATE_KEY,
    clone(value) as unknown as Record<string, unknown>,
    preserveEditorState,
  );
}
