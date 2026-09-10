import { components as englishComponents } from "../en/components";
export const components = { ...englishComponents, page: { eyebrow: "KOMPONENTY", titleBefore: "Więcej sposobów", titleAccent: "na pokazanie Twojej firmy.", lead: "Gotowe bloki, elementy interaktywne i efekty wizualne do stron tworzonych w OneStudio.", catalogEyebrow: "BIBLIOTEKA", catalogTitle: "Wybierz odpowiedni blok.", catalogLead: "Podglądy działających komponentów z aktualnej biblioteki OneStudio.", categoryLabel: "Kategorie komponentów", all: "Wszystkie", previewLabel: "Podgląd" }, categories: {
    hero: "Hero",
    galleries: "Galerie",
    "social-proof": "Opinie",
    forms: "Formularze / Lista oczekujących",
    typography: "Tekst / Typografia",
    backgrounds: "Tła",
    motion: "Ruch i efekty",
    interactive: "3D / Interakcje",
  }, items: {
    gallery: { label: "Galeria", description: "Okrągła galeria z przeciąganiem i bezwładnością." },
    motion: { label: "Ruch", description: "Pochylona siatka kolumn obrazów poruszająca się podczas przewijania." },
    waitlist: { label: "Lista oczekujących", description: "Formularz wczesnego dostępu obok ruchomego strumienia obrazów." },
    hero: { label: "Hero", description: "Pierwszy ekran ze sceną wizualną, zmieniającymi się kadrami i świetlnym śladem." },
    "social-proof": { label: "Opinie", description: "Sekwencja opinii z awatarami i płynnymi zmianami stanów." },
    "floating-lines": { label: "Płynące linie", description: "Płynne świetlne linie z paralaksą i reakcją na kursor." },
    "magic-rings": { label: "Magiczne pierścienie", description: "Shaderowe pierścienie z głębią, reakcją na najechanie i impulsem po kliknięciu." },
    strands: { label: "Świetlne włókna", description: "Miękkie kolorowe włókna WebGL z poświatą i efektem szkła." },
    "glow-cursor": { label: "Świetlny kursor", description: "Interaktywny świetlny ślad podążający za kursorem wewnątrz bloku." },
    "particle-text": { label: "Tekst z cząstek", description: "Tekst składa się z cząstek i reaguje na ruch wskaźnika." },
    "card-spread": { label: "Wachlarz kart", description: "Interaktywny wachlarz obrazów unoszących się po najechaniu." },
    "bending-marquee": { label: "Zakrzywiony pasek tekstowy", description: "Ruchoma typografia na trójwymiarowej zakrzywionej taśmie." },
  } } as const;
