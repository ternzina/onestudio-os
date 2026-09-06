import { common as englishCommon } from "../en/common";

export const common = {
  ...englishCommon,
  languageLabel: "Sprache",
  languageNames: { ru: "Русский", en: "English", uk: "Українська", pl: "Polski", de: "Deutsch", es: "Español", fr: "Français", pt: "Português" },
  accessibility: { openLargerPreview: "Größere Vorschau öffnen", productScreenshot: "Produkt-Screenshot" },
  header: { ...englishCommon.header, navigationLabel: "OneStudio-Navigation", menuLabel: "Menü", product: "Produkt", oneStudio: "OneStudio", productMenuLabel: "Produktmenü", oneStudioMenuLabel: "OneStudio-Menü", demo: "Demo auswählen", features: "Funktionen", workflow: "So funktioniert es", login: "Anmelden", openMenu: "Menü öffnen" },
  footer: {
    ...englishCommon.footer,
    navigationLabel: "OneStudio-Navigation", brandDescription: "Website, Design und Tools für dein Projekt.", product: "PRODUKT", oneStudio: "ONESTUDIO", information: "INFORMATIONEN",
    links: { features: "Funktionen", templates: "Vorlagen", components: "Komponenten", pricing: "Preise", about: "Über OneStudio", website: "Website nach Maß", faq: "FAQ", blog: "Journal", contact: "Kontakt", privacy: "Datenschutz", terms: "Bedingungen" }, copyright: "© OneStudio OS - Alle Rechte vorbehalten",
  },
  legal: { navigationLabel: "Rechtliche Navigation", lastUpdated: "Zuletzt aktualisiert" },
  metadata: {
    home: { title: "OneStudio OS - Website, Design und Business-System", description: "Website, Design und operative Module für Dienstleistungsunternehmen." },
    components: { title: "Komponenten - OneStudio OS", description: "Eine Bibliothek von OneStudio-Komponenten, Blöcken und Designmöglichkeiten." },
    about: { title: "Über OneStudio - OneStudio OS", description: "Warum OneStudio Website, Kunden und tägliche Arbeit in einem System verbindet." },
    blog: { title: "Journal - OneStudio OS", description: "Neue Komponenten, Designmöglichkeiten und OneStudio-Updates: kurz und nützlich." },
    contact: { title: "Kontakt - OneStudio", description: "Kontaktiere OneStudio zur Plattform, zu Tarifen oder zu einer Website nach Maß." },
    demos: { title: "Vorlagen - OneStudio", description: "Fertige OneStudio-Website-Designs für verschiedene Projekte." },
    faq: { title: "FAQ - OneStudio OS", description: "Antworten zum Start, zur Anpassung und zur Nutzung von OneStudio." },
    features: { title: "Funktionen - OneStudio", description: "Website, Buchungen, Kunden und Arbeitswerkzeuge in OneStudio." },
    pricing: { title: "Preise - OneStudio OS", description: "Wähle einen OneStudio-Plan für deine Website und Arbeitsmodule." },
    website: { title: "Website nach Maß - OneStudio OS", description: "Wir erstellen, konfigurieren und veröffentlichen deine Website nach Maß in OneStudio." },
    privacy: { title: "Datenschutzerklärung", description: "Wie OneStudio OS personenbezogene Daten einschließlich Google-Calendar-Daten erhebt, nutzt, speichert und schützt." },
    terms: { title: "Nutzungsbedingungen", description: "Bedingungen für den Zugang zur OneStudio-OS-Businessplattform und ihre Nutzung." },
  },
} as const;
