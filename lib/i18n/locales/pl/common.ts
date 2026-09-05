import { common as englishCommon } from "../en/common";

export const common = {
  ...englishCommon,
  languageLabel: "Język",
  languageNames: { ru: "Русский", en: "English", uk: "Українська", pl: "Polski", de: "Deutsch", es: "Español", fr: "Français", pt: "Português" },
  accessibility: { openLargerPreview: "Otwórz większy podgląd", productScreenshot: "Zrzut ekranu produktu" },
  header: { ...englishCommon.header, navigationLabel: "Nawigacja OneStudio", menuLabel: "Menu", product: "Produkt", oneStudio: "OneStudio", productMenuLabel: "Menu produktu", oneStudioMenuLabel: "Menu OneStudio", demo: "Wybierz demo", features: "Funkcje", workflow: "Jak to działa", login: "Zaloguj się", openMenu: "Otwórz menu" },
  footer: {
    ...englishCommon.footer,
    navigationLabel: "Nawigacja OneStudio", brandDescription: "Strona, design i narzędzia dla Twojego projektu.", product: "PRODUKT", oneStudio: "ONESTUDIO", information: "INFORMACJE",
    links: { features: "Funkcje", templates: "Szablony", components: "Komponenty", pricing: "Cennik", about: "O OneStudio", website: "Strona pod klucz", faq: "FAQ", blog: "Dziennik", contact: "Kontakt", privacy: "Prywatność", terms: "Warunki" }, copyright: "© OneStudio OS - wszelkie prawa zastrzeżone",
  },
  legal: { navigationLabel: "Nawigacja prawna", lastUpdated: "Ostatnia aktualizacja" },
  metadata: {
    home: { title: "OneStudio OS - strona, design i system biznesowy", description: "Strona, design i moduły operacyjne dla firm usługowych." },
    components: { title: "Komponenty - OneStudio OS", description: "Biblioteka komponentów, bloków i możliwości designu OneStudio." },
    about: { title: "O OneStudio - OneStudio OS", description: "Dlaczego OneStudio łączy stronę, klientów i codzienną pracę w jednym systemie." },
    blog: { title: "Dziennik - OneStudio OS", description: "Nowe komponenty, możliwości designu i aktualizacje OneStudio: krótko i konkretnie." },
    contact: { title: "Kontakt - OneStudio", description: "Skontaktuj się z OneStudio w sprawie platformy, planów lub strony pod klucz." },
    demos: { title: "Szablony - OneStudio", description: "Gotowe projekty stron OneStudio dla różnych projektów." },
    faq: { title: "FAQ - OneStudio OS", description: "Odpowiedzi o uruchamianiu, dostosowywaniu i korzystaniu z OneStudio." },
    features: { title: "Funkcje - OneStudio", description: "Strona, rezerwacje, klienci i narzędzia pracy w OneStudio." },
    pricing: { title: "Cennik - OneStudio OS", description: "Wybierz plan OneStudio dla swojej strony i modułów pracy." },
    website: { title: "Strona pod klucz - OneStudio OS", description: "Tworzymy, konfigurujemy i uruchamiamy stronę pod klucz w OneStudio." },
    privacy: { title: "Polityka prywatności", description: "Jak OneStudio OS zbiera, wykorzystuje, przechowuje i chroni dane osobowe, w tym dane Google Calendar." },
    terms: { title: "Warunki korzystania z usługi", description: "Warunki dostępu do platformy biznesowej OneStudio OS i korzystania z niej." },
  },
} as const;
