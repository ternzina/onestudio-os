import { blog as englishBlog } from "../en/blog";
const categories: Record<string, string> = { Site: "Strona", Design: "Design", Interactive: "Interakcja", Content: "Treść", System: "System", Effects: "Efekty", Testimonials: "Opinie", Gallery: "Galeria" };
function localizeExcerpt(id: string) {
  if (id.startsWith("hero-")) return "Wyrazisty hero z wizualną sceną, mocnym komunikatem i ruchem: dla stron, które chcą od razu zbudować nastrój.";
  if (id.startsWith("social-proof-") || id === "comments-3") return "Opinie, imiona i reakcje zebrane w żywy strumień przybliżają głosy klientów do głównej propozycji.";
  if (id.startsWith("waitlist-")) return "Formularz wczesnego dostępu z krótkim komunikatem i ruchomym feedem obrazów: dla produktu, kolekcji lub wydarzenia.";
  if (id.startsWith("stats-")) return "Blok z dużymi wskaźnikami, skalami lub graficznym wzorem pomaga jasno pokazać wyniki i dynamikę.";
  if (id.startsWith("faq-")) return "Pytania, kategorie i rozwijane odpowiedzi w uporządkowanej kompozycji, wygodnej także przy większej ilości informacji.";
  if (id.startsWith("navigation-") || id.startsWith("navbar-")) return "Responsywna nawigacja z czytelną hierarchią, dodatkowymi linkami i menu mobilnym dla wielopoziomowych treści.";
  if (id.startsWith("card-")) return "Siatka kart z krótką informacją, statusem i jasnym działaniem: dla zespołu, katalogu, biblioteki lub kierunków.";
  if (id.startsWith("showcase-")) return "Wizualna kolekcja z przełączanymi kategoriami i lekkim ruchem, dobra do portfolio, case studies i zbiorów.";
  if (id.startsWith("features-")) return "Karty funkcji, w których szczegóły pojawiają się podczas interakcji, pomagają wyjaśnić produkt bez ściany tekstu.";
  if (id.startsWith("cta-")) return "Wyrazisty lub spokojny końcowy call to action z komunikatem, przyciskiem i akcentem wizualnym domyka stronę.";
  if (id.startsWith("list-")) return "Lista z wyszukiwaniem, filtrowaniem lub przeciąganiem pomaga szybko znajdować i porządkować materiały.";
  if (id.startsWith("analytics-")) return "Interaktywny wykres z przełączaniem metryk i wyróżnieniem wartości pozwala zwięźle pokazać rozkład i wyniki.";
  if (id.startsWith("pricing-")) return "Blok cenowy z jasnymi różnicami i przełączaniem okresu rozliczeń pomaga szybko wybrać właściwy poziom dostępu.";
  if (id === "forms-4") return "Rozbudowany formularz z polami, wyborem opcji i przemyślanymi stanami wpisywania do zapytania lub procesu.";
  if (id === "footer-4") return "Duża stopka z polem zapisu, grupami linków i mocnym finałem tworzy pełne zakończenie strony.";
  return "Czytelna kompozycja z krótkimi objaśnieniami do przedstawienia nowej usługi lub procesu pracy.";
}
export const blog = { ...englishBlog, languageLabel: "Język", navigationLabel: "Główna nawigacja", menuLabel: "Otwórz menu", eyebrow: "DZIENNIK", title: "Nowości w OneStudio", lead: "Nowe komponenty, możliwości designu i aktualizacje systemu: krótko i konkretnie.", catalogTitle: "Najnowsze aktualizacje", catalogLead: "Krótkie notatki o tym, co pojawiło się w bibliotece i gdzie może się przydać.", updateCount: "41 wpisów", componentsLabel: "komponentów i możliwości", dateNote: "dat publikacji w dzienniku", articleNoteLabel: "Notatka dziennika", nav: [["Główna", "/"], ["FAQ", "/faq"], ["Funkcje", "/features"], ["Demo", "/demos"], ["O OneStudio", "/about"]], articles: englishBlog.articles.map((article) => ({ ...article, category: categories[article.category] ?? article.category, excerpt: localizeExcerpt(article.id) })) } as const;
