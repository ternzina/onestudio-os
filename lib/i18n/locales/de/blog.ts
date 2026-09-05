import { blog as englishBlog } from "../en/blog";
const categories: Record<string, string> = { Site: "Website", Design: "Design", Interactive: "Interaktion", Content: "Inhalte", System: "System", Effects: "Effekte", Testimonials: "Kundenstimmen", Gallery: "Galerie" };
function localizeExcerpt(id: string) {
  if (id.startsWith("hero-")) return "Ein ausdrucksstarker Hero mit visueller Szene, klarer Botschaft und Bewegung: für Seiten, die sofort Atmosphäre schaffen sollen.";
  if (id.startsWith("social-proof-") || id === "comments-3") return "Kundenstimmen, Namen und Reaktionen in einem lebendigen Stream bringen die Stimme der Kunden näher an das Angebot.";
  if (id.startsWith("waitlist-")) return "Ein Formular für frühen Zugang mit kurzer Botschaft und bewegtem Bilder-Feed: für Produkt, Kollektion oder Event.";
  if (id.startsWith("stats-")) return "Ein Block mit großen Kennzahlen, Skalen oder grafischem Muster macht Ergebnisse und Entwicklung klar sichtbar.";
  if (id.startsWith("faq-")) return "Fragen, Kategorien und ausklappbare Antworten in einer geordneten Komposition, auch bei vielen Erklärungen gut zu nutzen.";
  if (id.startsWith("navigation-") || id.startsWith("navbar-")) return "Responsive Navigation mit klarer Hierarchie, zusätzlichen Links und mobilem Menü für Inhalte mit mehreren Ebenen.";
  if (id.startsWith("card-")) return "Ein Kartenraster mit kurzen Informationen, Status und klarer Aktion: für Team, Katalog, Bibliothek oder Richtungen.";
  if (id.startsWith("showcase-")) return "Eine visuelle Sammlung mit wechselnden Kategorien und leichter Bewegung: passend für Portfolio, Cases und Kollektionen.";
  if (id.startsWith("features-")) return "Funktionskarten, deren Details bei der Interaktion sichtbar werden, erklären Produktbereiche ohne eine Textwand.";
  if (id.startsWith("cta-")) return "Ein ausdrucksstarker oder ruhiger Abschluss mit Botschaft, Button und visuellem Akzent gibt der Seite einen klaren Schluss.";
  if (id.startsWith("list-")) return "Eine Liste mit Suche, Filter oder Drag-and-drop hilft, Inhalte schnell zu finden und zu ordnen.";
  if (id.startsWith("analytics-")) return "Ein interaktives Diagramm mit Metrikwechsel und hervorgehobenen Werten zeigt Verteilungen und Ergebnisse kompakt.";
  if (id.startsWith("pricing-")) return "Ein Preisblock mit klaren Unterschieden und Abrechnungswechsel hilft, schnell die passende Zugriffsstufe zu wählen.";
  if (id === "forms-4") return "Ein ausführliches Formular mit Feldern, Auswahlmöglichkeiten und durchdachten Eingabestatus für Anfrage oder Workflow.";
  if (id === "footer-4") return "Ein großer Footer mit Anmeldefeld, Linkgruppen und starkem Abschluss bildet den letzten Bildschirm der Seite.";
  return "Eine klare Komposition mit kurzen Erklärungen für die Vorstellung eines neuen Services oder Arbeitsablaufs.";
}
export const blog = { ...englishBlog, languageLabel: "Sprache", navigationLabel: "Hauptnavigation", menuLabel: "Menü öffnen", eyebrow: "JOURNAL", title: "Neu bei OneStudio", lead: "Neue Komponenten, Designmöglichkeiten und System-Updates: kurz und nützlich.", catalogTitle: "Neueste Updates", catalogLead: "Kurze Notizen zu neuen Bibliotheksinhalten und ihrem möglichen Einsatz.", updateCount: "41 Einträge", componentsLabel: "Komponenten und Möglichkeiten", dateNote: "Veröffentlichungsdaten im Journal", articleNoteLabel: "Journal-Notiz", nav: [["Startseite", "/"], ["FAQ", "/faq"], ["Funktionen", "/features"], ["Demos", "/demos"], ["Über OneStudio", "/about"]], articles: englishBlog.articles.map((article) => ({ ...article, category: categories[article.category] ?? article.category, excerpt: localizeExcerpt(article.id) })) } as const;
