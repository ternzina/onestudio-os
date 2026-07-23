"use client";

import Link from "next/link";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { LanguageProvider, useLanguage } from "@/lib/language-provider";

const content = {
  pl: {
    eyebrow: "Sisters Photo Studio · dokument prawny",
    title: "Polityka prywatności",
    intro:
      "Poniżej wyjaśniamy, jakie dane przetwarzamy podczas korzystania ze strony, kontaktu, zakładania konta i rezerwacji usług.",
    updated: "Ostatnia aktualizacja: 14 lipca 2026 r.",
    sections: [
      {
        title: "1. Administrator danych",
        paragraphs: [
          "Administratorem danych osobowych jest Viktor Butskiy, prowadzący działalność gospodarczą pod firmą Viktor Butskiy Produkty Mrożone, NIP 9512560505, pod adresem: ul. Taśmowa 1, lok. 202, 02-677 Warszawa, działający w ramach marki Sisters Photo Studio.",
          "W sprawach dotyczących danych osobowych można skontaktować się pod adresem: contact@sistersstudio.pl.",
        ],
      },
      {
        title: "2. Jakie dane przetwarzamy",
        paragraphs: [
          "W zależności od sposobu korzystania z serwisu możemy przetwarzać: imię i nazwisko, adres e-mail, numer telefonu, dane konta, treść wiadomości, dane rezerwacji i wybranych usług, informacje o płatności, adres IP, dane techniczne urządzenia oraz historię niezbędną do obsługi zamówienia.",
          "Jeżeli klient wyrazi zgodę na publikację zdjęć, opinii lub materiałów z sesji, możemy również przetwarzać wizerunek i treści przekazane do publikacji.",
        ],
      },
      {
        title: "3. Cele i podstawy prawne",
        bullets: [
          "obsługa zapytań, rezerwacji, konta i wykonanie umowy — art. 6 ust. 1 lit. b RODO;",
          "realizacja obowiązków księgowych, podatkowych i innych obowiązków prawnych — art. 6 ust. 1 lit. c RODO;",
          "ochrona serwisu, zapobieganie nadużyciom, ustalanie lub obrona roszczeń oraz organizacja obsługi klienta — prawnie uzasadniony interes administratora, art. 6 ust. 1 lit. f RODO;",
          "publikacja wizerunku, opinii lub wysyłka dobrowolnych informacji marketingowych — zgoda, art. 6 ust. 1 lit. a RODO, jeżeli jest wymagana.",
        ],
      },
      {
        title: "4. Odbiorcy danych",
        paragraphs: [
          "Dane mogą być powierzane podmiotom pomagającym prowadzić serwis i realizować usługi, w szczególności dostawcom hostingu, bazy danych i logowania, poczty transakcyjnej, przechowywania plików, obsługi płatności, księgowości oraz wsparcia technicznego. Obecnie infrastruktura serwisu może korzystać m.in. z usług Vercel, Supabase, Cloudflare i Resend, a logowanie społecznościowe — z usług Google lub Apple.",
          "Podmioty te otrzymują wyłącznie dane potrzebne do wykonania powierzonych zadań i działają na podstawie odpowiednich umów lub własnych obowiązków prawnych.",
        ],
      },
      {
        title: "5. Przekazywanie danych poza EOG",
        paragraphs: [
          "Niektórzy dostawcy technologiczni mogą przetwarzać dane poza Europejskim Obszarem Gospodarczym. W takim przypadku przekazanie odbywa się na podstawie mechanizmów dopuszczonych przez RODO, takich jak decyzja stwierdzająca odpowiedni stopień ochrony lub standardowe klauzule umowne.",
        ],
      },
      {
        title: "6. Okres przechowywania",
        paragraphs: [
          "Dane przechowujemy tylko tak długo, jak jest to potrzebne do obsługi zapytania, konta, rezerwacji lub wykonania umowy, a następnie przez okres wymagany przepisami albo potrzebny do dochodzenia i obrony roszczeń. Dane przetwarzane na podstawie zgody przechowujemy do jej wycofania, chyba że istnieje inna podstawa prawna dalszego przetwarzania.",
        ],
      },
      {
        title: "7. Prawa użytkownika",
        paragraphs: [
          "Na zasadach określonych w RODO przysługuje prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia, wniesienia sprzeciwu oraz wycofania zgody w dowolnym momencie. Wycofanie zgody nie wpływa na zgodność z prawem wcześniejszego przetwarzania.",
          "Przysługuje również prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych: uodo.gov.pl.",
        ],
      },
      {
        title: "8. Dobrowolność podania danych",
        paragraphs: [
          "Podanie danych jest dobrowolne, lecz dane oznaczone jako niezbędne są potrzebne do utworzenia konta, kontaktu, dokonania rezerwacji lub wykonania usługi. Bez nich realizacja danej czynności może być niemożliwa.",
        ],
      },
      {
        title: "9. Pliki techniczne i pamięć przeglądarki",
        paragraphs: [
          "Serwis wykorzystuje wyłącznie mechanizmy techniczne potrzebne do prawidłowego działania, bezpieczeństwa, utrzymania sesji użytkownika i zapamiętania wybranego języka. Obecnie nie stosujemy reklamowych plików cookie ani profilowania marketingowego. Jeżeli w przyszłości zostaną uruchomione narzędzia analityczne lub marketingowe wymagające zgody, użytkownik otrzyma możliwość jej udzielenia przed ich włączeniem.",
        ],
      },
      {
        title: "10. Zautomatyzowane decyzje i zmiany polityki",
        paragraphs: [
          "Dane nie są wykorzystywane do podejmowania wobec użytkownika decyzji wywołujących skutki prawne wyłącznie w sposób zautomatyzowany. Polityka może być aktualizowana wraz ze zmianą serwisu, dostawców lub przepisów. Aktualna wersja jest zawsze dostępna pod tym adresem.",
        ],
      },
    ],
    contact: "Masz pytanie dotyczące swoich danych?",
    contactCta: "Napisz do nas",
    rulesCta: "Zobacz regulamin",
  },
  uk: {
    eyebrow: "Sisters Photo Studio · юридичний документ",
    title: "Політика конфіденційності",
    intro:
      "Нижче пояснюємо, які дані обробляємо під час користування сайтом, зв’язку зі студією, створення облікового запису та бронювання послуг.",
    updated: "Останнє оновлення: 14 липня 2026 року.",
    sections: [
      {
        title: "1. Адміністратор даних",
        paragraphs: [
          "Адміністратором персональних даних є Viktor Butskiy, який здійснює підприємницьку діяльність під назвою Viktor Butskiy Produkty Mrożone, NIP 9512560505, за адресою: ul. Taśmowa 1, lok. 202, 02-677 Warszawa та працює під брендом Sisters Photo Studio.",
          "З питань щодо персональних даних можна звертатися за адресою: contact@sistersstudio.pl.",
        ],
      },
      {
        title: "2. Які дані ми обробляємо",
        paragraphs: [
          "Залежно від способу користування сервісом ми можемо обробляти: ім’я та прізвище, електронну адресу, номер телефону, дані облікового запису, зміст повідомлень, дані бронювання та вибраних послуг, інформацію про оплату, IP-адресу, технічні дані пристрою й історію, необхідну для обслуговування замовлення.",
          "Якщо клієнт погоджується на публікацію фотографій, відгуків або матеріалів із фотосесії, ми також можемо обробляти зображення особи й переданий для публікації контент.",
        ],
      },
      {
        title: "3. Цілі та правові підстави",
        bullets: [
          "опрацювання звернень, бронювань, облікового запису та виконання договору — ст. 6 ч. 1 літ. b GDPR;",
          "виконання бухгалтерських, податкових та інших юридичних обов’язків — ст. 6 ч. 1 літ. c GDPR;",
          "захист сервісу, запобігання зловживанням, встановлення або захист правових вимог та організація обслуговування клієнтів — законний інтерес адміністратора, ст. 6 ч. 1 літ. f GDPR;",
          "публікація зображення, відгуку або надсилання добровільних маркетингових матеріалів — згода, ст. 6 ч. 1 літ. a GDPR, якщо вона необхідна.",
        ],
      },
      {
        title: "4. Одержувачі даних",
        paragraphs: [
          "Дані можуть передаватися суб’єктам, які допомагають підтримувати сайт і надавати послуги, зокрема постачальникам хостингу, бази даних і входу, транзакційної пошти, зберігання файлів, оплати, бухгалтерії та технічної підтримки. Інфраструктура може користуватися, зокрема, послугами Vercel, Supabase, Cloudflare і Resend, а соціальний вхід — послугами Google або Apple.",
          "Ці суб’єкти отримують лише дані, необхідні для виконання доручених завдань, і діють на підставі відповідних договорів або власних юридичних обов’язків.",
        ],
      },
      {
        title: "5. Передача даних за межі ЄЕЗ",
        paragraphs: [
          "Деякі технологічні постачальники можуть обробляти дані за межами Європейської економічної зони. У такому разі передача здійснюється на підставі дозволених GDPR механізмів, наприклад рішення про належний рівень захисту або стандартних договірних положень.",
        ],
      },
      {
        title: "6. Строк зберігання",
        paragraphs: [
          "Ми зберігаємо дані лише стільки, скільки потрібно для опрацювання звернення, облікового запису, бронювання або виконання договору, а потім — протягом строку, встановленого законом чи необхідного для реалізації та захисту вимог. Дані, що обробляються на підставі згоди, зберігаються до її відкликання, якщо немає іншої правової підстави.",
        ],
      },
      {
        title: "7. Права користувача",
        paragraphs: [
          "На умовах GDPR ви маєте право на доступ, виправлення, видалення, обмеження обробки, перенесення даних, заперечення та відкликання згоди в будь-який момент. Відкликання згоди не впливає на законність попередньої обробки.",
          "Ви також маєте право подати скаргу до Prezesa Urzędu Ochrony Danych Osobowych: uodo.gov.pl.",
        ],
      },
      {
        title: "8. Добровільність надання даних",
        paragraphs: [
          "Надання даних є добровільним, але дані, позначені як необхідні, потрібні для створення облікового запису, зв’язку, бронювання або надання послуги. Без них відповідна дія може бути неможливою.",
        ],
      },
      {
        title: "9. Технічні файли та пам’ять браузера",
        paragraphs: [
          "Сервіс використовує лише технічні механізми, необхідні для роботи, безпеки, підтримання сесії та запам’ятовування вибраної мови. Наразі ми не використовуємо рекламні cookie або маркетингове профілювання. Якщо в майбутньому з’являться аналітичні чи маркетингові інструменти, що потребують згоди, користувач зможе надати її до їх увімкнення.",
        ],
      },
      {
        title: "10. Автоматизовані рішення та зміни політики",
        paragraphs: [
          "Дані не використовуються для ухвалення рішень, що створюють юридичні наслідки для користувача виключно автоматизованим способом. Політика може оновлюватися через зміни сервісу, постачальників або законодавства. Актуальна версія завжди доступна за цією адресою.",
        ],
      },
    ],
    contact: "Маєте запитання щодо своїх даних?",
    contactCta: "Написати нам",
    rulesCta: "Переглянути правила",
  },
} as const;

function PrivacyContent() {
  const { lang } = useLanguage();
  const page = content[lang];

  return (
    <main className="min-h-screen bg-[#f6efe8] text-[#2b1b14]">
      <Header />

      <section className="relative overflow-hidden bg-[#080604] px-6 pb-20 pt-36 text-[#fff7ef] sm:px-10 lg:px-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_24%,rgba(242,167,184,0.14),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(216,185,153,0.12),transparent_34%)]" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#e8c2c9]">
            {page.eyebrow}
          </p>
          <h1 className="font-serif text-[48px] leading-[1.02] tracking-[-0.035em] sm:text-[64px] lg:text-[82px]">
            {page.title}
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-8 text-[#e8d2c0] sm:text-lg">
            {page.intro}
          </p>
          <p className="mt-5 text-sm text-[#e8c2c9]">{page.updated}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-6 px-6 py-16 sm:px-10 lg:px-0">
        {page.sections.map((section) => (
          <article
            key={section.title}
            className="rounded-[2rem] border border-[#d8c0ad] bg-white/72 p-7 shadow-lg shadow-[#7a5237]/8 sm:p-9"
          >
            <h2 className="text-2xl font-semibold">{section.title}</h2>
            {"paragraphs" in section ? (
              <div className="mt-5 space-y-4 text-[15px] leading-7 text-[#65483a]">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : null}
            {"bullets" in section ? (
              <ul className="mt-5 space-y-3 text-[15px] leading-7 text-[#65483a]">
                {section.bullets.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a6b4d]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}

        <div className="rounded-[2rem] bg-[#2f1d15] p-8 text-white sm:p-10">
          <h2 className="text-3xl font-semibold">{page.contact}</h2>
          <div className="mt-7 flex flex-col gap-4 sm:flex-row">
            <a
              href="mailto:contact@sistersstudio.pl"
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#f2a7b8] px-7 text-xs font-bold uppercase tracking-[0.18em] text-[#160c0a] transition hover:bg-[#ffc0cc]"
            >
              {page.contactCta}
            </a>
            <Link
              href="/regulamin"
              className="inline-flex h-14 items-center justify-center rounded-full border border-white/22 px-7 text-xs font-bold uppercase tracking-[0.18em] transition hover:border-[#f2a7b8] hover:text-[#f2a7b8]"
            >
              {page.rulesCta}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function PrivacyPage() {
  return (
    <LanguageProvider>
      <PrivacyContent />
    </LanguageProvider>
  );
}
