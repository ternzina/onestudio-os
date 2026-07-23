export type Language = "uk" | "pl";

export const translations = {
  uk: {
    header: {
      nav: {
        home: "Головна",
        interiors: "Інтер’єри",
        rent: "Оренда студії",
        packages: "Пакети",
        team: "Команда",
        portfolio: "Портфоліо",
        contacts: "Контакти",
      },
      cta: "Забронювати",
    },
    hero: {
      eyebrow: "Преміальна фотостудія",
      titlePart1: "Ваша зйомка",
      titleAccent: "продумана до",
      titlePart2: "найменших деталей",
      description:
        "Створюємо індивідуальні фото- та відеозйомки під ваш запит, стиль і цілі. Команда бере на себе ідею, образи, beauty-підготовку, координацію процесу та фінальний результат.",
      primaryCta: "Забронювати зйомку",
      secondaryCta: "Дізнатися більше",
      features: ["Premium-зйомки", "Повна організація", "Фото + відео"],
    },
    packages: {
      eyebrow: "Пакети",
      title: "Оберіть формат вашої premium-зйомки",
      description:
        "Кожен пакет створений для зйомки, де команда бере на себе ідею, образи, beauty-підготовку, координацію процесу та фінальний результат.",
      popular: "Популярний вибір",
      detailsButton: "Детальніше про пакет",
      hideButton: "Сховати деталі",
      bookingButton: "Забронювати зйомку",
    },
    interiors: {
      eyebrow: "Інтер’єри",
      title: "Простори для різних візуальних історій",
      description:
        "Оберіть атмосферу під вашу зйомку: чисту циклораму, м’який теплий інтер’єр або темний loft для більш драматичних кадрів.",
      note: "Студія або додаткова локація оплачуються окремо.",
    },
    portfolio: {
      eyebrow: "Портфоліо",
      title: "Візуальні історії, створені з увагою до деталей",
      description:
        "Кадри, у яких працюють світло, стиль, образ і настрій.",
    },
    team: {
      eyebrow: "Команда",
      title: "Команда, яка веде вас від ідеї до готового результату",
      description:
        "Професіонали, які створюють концепцію, образи, beauty-підготовку, фото, відео та фінальну подачу.",
      detailsTitle: "Про кожного спеціаліста",
    },
    booking: {
      eyebrow: "Бронювання",
      title: "Залиште заявку на зйомку",
      description:
        "Напишіть нам зручну дату, формат зйомки та ваші побажання. Ми допоможемо обрати пакет і підготувати деталі.",
    },
    rental: {
      heroEyebrow: "OneStudio OS",
      heroTitle: "Оренда фотостудії та творчого простору",
      heroDescription:
        "Стильний простір для фотосесій, відеозйомок, beauty-контенту та роботи над візуальними проєктами. Оберіть потрібну атмосферу, забронюйте час і створюйте матеріал у місці, підготовленому для красивого кадру.",
      primaryCta: "Забронювати час",
      secondaryCta: "Подивитися простори",
      heroCardEyebrow: "Студія погодинно",
      heroCardTitle: "Фото, відео, beauty, content",
      heroCardText:
        "Один простір, кілька настроїв і готові інтер’єри для роботи.",
      spacesEyebrow: "Простори для оренди",
      spacesTitle: "Оберіть атмосферу вашої зйомки",
      spaces: [
        {
          title: "Циклорама",
          text: "Світлий мінімалістичний простір для портретних, fashion, рекламних зйомок і відео. Ідеальний варіант, коли потрібен чистий кадр і професійний результат.",
          items: [
            "іміджеві зйомки",
            "предметна фотографія",
            "lookbook",
            "відеозйомки",
          ],
        },
        {
          title: "Теплий інтер’єр",
          text: "Затишна зона з м’яким світлом, елегантними деталями й жіночим настроєм. Добре підходить для lifestyle, beauty, сімейних і романтичних кадрів.",
          items: [
            "жіночі зйомки",
            "beauty content",
            "сімейні фотосесії",
            "reels і stories",
          ],
        },
        {
          title: "Loft / темний інтер’єр",
          text: "Атмосферний простір із глибиною, характером і більш виразним настроєм. Підходить для портретів, fashion, експертного контенту та креативних проєктів.",
          items: [
            "fashion-зйомки",
            "бізнес-портрети",
            "експертні відео",
            "кампанії для брендів",
          ],
        },
      ],
      includedEyebrow: "Що входить у вартість?",
      includedTitle:
        "Все, що потрібно для спокійної роботи на знімальному майданчику",
      includedDescription:
        "Ви орендуєте не просто приміщення, а готовий простір для створення фото, відео та матеріалів для бренду.",
      included: [
        "стильні зони, готові до зйомки",
        "простір для підготовки моделі або клієнтки",
        "базове обладнання студії",
        "місце для макіяжу та стилізації",
        "доступ до Wi-Fi",
        "кава, чай і спокійна атмосфера роботи",
        "можливість онлайн-бронювання",
      ],
      forWhoEyebrow: "Для кого?",
      forWhoTitle: "Студія для фотографів, творців і брендів",
      forWhoDescription:
        "Простір підходить для камерних зйомок і для більших проєктів із фотографом, моделлю, макіяжем та відеозйомкою.",
      forWho: [
        "фотографів",
        "візажисток і стилісток",
        "контент-креаторів",
        "beauty-брендів",
        "тренерів, експертів і викладачів",
        "людей, яким потрібен простір для приватної або бізнес-зйомки",
      ],
      reservationEyebrow: "Як працює бронювання?",
      reservationSteps: [
        "Оберіть простір",
        "Перевірте доступний час",
        "Надішліть заявку",
        "Отримайте підтвердження",
        "Приходьте і створюйте",
      ],
      finalTitle: "Хочете орендувати студію?",
      finalDescription:
        "Забронюйте час і напишіть нам, який проєкт хочете реалізувати. Ми допоможемо підібрати простір для фотосесії, відеозйомки або контенту для вашого бренду.",
      finalCta: "Забронювати час",
    },
    footer: {
      description:
        "Premium-зйомки у Варшаві з повною організацією процесу.",
    },
  },
  pl: {
    header: {
      nav: {
        home: "Strona główna",
        interiors: "Wnętrza",
        rent: "Wynajem studia",
        packages: "Pakiety",
        team: "Zespół",
        portfolio: "Portfolio",
        contacts: "Kontakt",
      },
      cta: "Zarezerwuj",
    },
    hero: {
      eyebrow: "Premium studio fotograficzne",
      titlePart1: "Twoja sesja",
      titleAccent: "przemyślana w",
      titlePart2: "najdrobniejszych szczegółach",
      description:
        "Tworzymy indywidualne sesje foto i wideo dopasowane do Twoich celów, stylu i potrzeb. Zespół zajmuje się koncepcją, stylizacją, przygotowaniem beauty, koordynacją procesu i finalnym efektem.",
      primaryCta: "Zarezerwuj sesję",
      secondaryCta: "Dowiedz się więcej",
      features: ["Sesje premium", "Pełna organizacja", "Foto + wideo"],
    },
    packages: {
      eyebrow: "Pakiety",
      title: "Wybierz format swojej sesji premium",
      description:
        "Każdy pakiet został stworzony z myślą o sesji, w której zespół przejmuje koncepcję, stylizację, przygotowanie beauty, koordynację i finalny efekt.",
      popular: "Popularny wybór",
      detailsButton: "Szczegóły pakietu",
      hideButton: "Ukryj szczegóły",
      bookingButton: "Zarezerwuj sesję",
    },
    interiors: {
      eyebrow: "Wnętrza",
      title: "Przestrzenie dla różnych historii wizualnych",
      description:
        "Wybierz atmosferę sesji: czystą cykloramę, miękkie ciepłe wnętrze albo ciemny loft do bardziej dramatycznych kadrów.",
      note: "Studio lub dodatkowa lokalizacja są płatne osobno.",
    },
    portfolio: {
      eyebrow: "Portfolio",
      title: "Historie wizualne tworzone z dbałością o detale",
      description:
        "Kadry, w których pracują światło, styl, wizerunek i nastrój.",
    },
    team: {
      eyebrow: "Zespół",
      title: "Zespół, który prowadzi Cię od pomysłu do gotowego efektu",
      description:
        "Profesjonaliści, którzy tworzą koncepcję, stylizacje, przygotowanie beauty, zdjęcia, wideo i finalną prezentację.",
      detailsTitle: "Więcej o każdym specjaliście",
    },
    booking: {
      eyebrow: "Rezerwacja",
      title: "Zostaw zgłoszenie na sesję",
      description:
        "Napisz dogodną datę, format sesji i swoje oczekiwania. Pomożemy wybrać pakiet i przygotować szczegóły.",
    },
    rental: {
      heroEyebrow: "OneStudio OS",
      heroTitle: "Wynajem studia fotograficznego i kreatywnej przestrzeni",
      heroDescription:
        "Stylowa przestrzeń do sesji zdjęciowych, nagrań wideo, tworzenia contentu oraz pracy kreatywnej. Wybierz wnętrze, zarezerwuj termin i twórz w miejscu przygotowanym pod piękny kadr.",
      primaryCta: "Zarezerwuj termin",
      secondaryCta: "Zobacz przestrzenie",
      heroCardEyebrow: "Studio na godziny",
      heroCardTitle: "Foto, video, beauty, content",
      heroCardText:
        "Jedna przestrzeń, kilka klimatów i gotowe wnętrza do pracy.",
      spacesEyebrow: "Przestrzenie do wynajęcia",
      spacesTitle: "Wybierz klimat swojej sesji",
      spaces: [
        {
          title: "Cyklorama",
          text: "Jasna, minimalistyczna przestrzeń do sesji portretowych, modowych, reklamowych oraz nagrań wideo. Idealna, kiedy potrzebujesz czystego kadru i profesjonalnego efektu.",
          items: [
            "sesje wizerunkowe",
            "zdjęcia produktowe",
            "lookbooki",
            "nagrania video",
          ],
        },
        {
          title: "Ciepłe wnętrze",
          text: "Przytulna aranżacja z miękkim światłem, eleganckimi detalami i kobiecym klimatem. Dobrze sprawdza się przy sesjach lifestyle, beauty, rodzinnych i romantycznych.",
          items: [
            "sesje kobiece",
            "beauty content",
            "sesje rodzinne",
            "reels i stories",
          ],
        },
        {
          title: "Loft / ciemne wnętrze",
          text: "Klimatyczna przestrzeń z głębią, charakterem i mocniejszym nastrojem. Dobra do portretów, sesji fashion, materiałów eksperckich i bardziej wyrazistych projektów.",
          items: [
            "sesje fashion",
            "portrety biznesowe",
            "nagrania eksperckie",
            "kampanie marek",
          ],
        },
      ],
      includedEyebrow: "Co jest w cenie?",
      includedTitle:
        "Wszystko, czego potrzebujesz do spokojnej pracy na planie",
      includedDescription:
        "Wynajmujesz nie tylko pomieszczenie, ale gotową przestrzeń do tworzenia zdjęć, filmów i materiałów dla marki.",
      included: [
        "stylowe aranżacje gotowe do zdjęć",
        "przestrzeń do przygotowania modelki lub klientki",
        "podstawowe wyposażenie studia",
        "miejsce na makijaż i stylizację",
        "dostęp do Wi-Fi",
        "kawa, herbata i spokojna atmosfera pracy",
        "możliwość rezerwacji terminu online",
      ],
      forWhoEyebrow: "Dla kogo?",
      forWhoTitle: "Studio dla twórców, fotografów i marek",
      forWhoDescription:
        "Przestrzeń sprawdzi się przy małych, kameralnych sesjach oraz przy większych projektach z fotografem, modelką, makijażem i nagraniami.",
      forWho: [
        "fotografów",
        "makijażystek i stylistek",
        "twórców contentu",
        "marek beauty",
        "trenerów, edukatorów i ekspertów",
        "osób, które potrzebują miejsca na sesję prywatną lub biznesową",
      ],
      reservationEyebrow: "Jak działa rezerwacja?",
      reservationSteps: [
        "Wybierz przestrzeń",
        "Sprawdź dostępny termin",
        "Wyślij zgłoszenie",
        "Otrzymaj potwierdzenie",
        "Przyjdź i twórz",
      ],
      finalTitle: "Chcesz wynająć studio?",
      finalDescription:
        "Zarezerwuj termin i napisz nam, jaki projekt chcesz zrealizować. Pomożemy dobrać przestrzeń do sesji, nagrania lub contentu dla Twojej marki.",
      finalCta: "Zarezerwuj termin",
    },
    footer: {
      description:
        "Sesje premium z pełną organizacją procesu.",
    },
  },
} as const;
