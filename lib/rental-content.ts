export type RentalEquipmentCategory = {
  id: string;
  title_uk: string;
  title_pl: string;
  items_uk: string;
  items_pl: string;
};

export type RentalFaqItem = {
  id: string;
  question_uk: string;
  question_pl: string;
  answer_uk: string;
  answer_pl: string;
};

export type RentalCondition = {
  id: string;
  title_uk: string;
  title_pl: string;
  text_uk: string;
  text_pl: string;
};

export type RentalSpecification = {
  id: string;
  label_uk: string;
  label_pl: string;
  value_uk: string;
  value_pl: string;
};

export type SiteRentalContent = {
  hero_image_url: string;
  hero_eyebrow_uk: string;
  hero_eyebrow_pl: string;
  hero_title_uk: string;
  hero_title_pl: string;
  hero_description_uk: string;
  hero_description_pl: string;
  primary_cta_uk: string;
  primary_cta_pl: string;
  secondary_cta_uk: string;
  secondary_cta_pl: string;
  rental_price: string;
  makeup_price: string;
  backgrounds_count: string;
  trust_items_uk: string;
  trust_items_pl: string;
  zones_eyebrow_uk: string;
  zones_eyebrow_pl: string;
  zones_title_uk: string;
  zones_title_pl: string;
  gallery_image_1_url: string;
  gallery_image_2_url: string;
  gallery_image_3_url: string;
  gallery_image_4_url: string;
  gallery_image_5_url: string;
  specifications_eyebrow_uk: string;
  specifications_eyebrow_pl: string;
  specifications_title_uk: string;
  specifications_title_pl: string;
  studio_specifications: RentalSpecification[];
  video_url: string;
  video_poster_url: string;
  video_eyebrow_uk: string;
  video_eyebrow_pl: string;
  video_title_uk: string;
  video_title_pl: string;
  video_description_uk: string;
  video_description_pl: string;
  video_cta_uk: string;
  video_cta_pl: string;
  included_eyebrow_uk: string;
  included_eyebrow_pl: string;
  included_title_uk: string;
  included_title_pl: string;
  included_description_uk: string;
  included_description_pl: string;
  included_items_uk: string;
  included_items_pl: string;
  equipment_image_url: string;
  equipment_help_uk: string;
  equipment_help_pl: string;
  equipment_categories: RentalEquipmentCategory[];
  for_who_eyebrow_uk: string;
  for_who_eyebrow_pl: string;
  for_who_title_uk: string;
  for_who_title_pl: string;
  for_who_description_uk: string;
  for_who_description_pl: string;
  for_who_items_uk: string;
  for_who_items_pl: string;
  audience_image_url: string;
  reservation_eyebrow_uk: string;
  reservation_eyebrow_pl: string;
  reservation_steps_uk: string;
  reservation_steps_pl: string;
  reservation_note_uk: string;
  reservation_note_pl: string;
  rental_conditions: RentalCondition[];
  reviews_eyebrow_uk: string;
  reviews_eyebrow_pl: string;
  reviews_title_uk: string;
  reviews_title_pl: string;
  google_reviews_url: string;
  faq_eyebrow_uk: string;
  faq_eyebrow_pl: string;
  faq_title_uk: string;
  faq_title_pl: string;
  faq_items: RentalFaqItem[];
  location_image_url: string;
  location_door_image_url: string;
  location_eyebrow_uk: string;
  location_eyebrow_pl: string;
  location_title_uk: string;
  location_title_pl: string;
  location_description_uk: string;
  location_description_pl: string;
  location_floor_uk: string;
  location_floor_pl: string;
  location_entrance_uk: string;
  location_entrance_pl: string;
  location_parking_uk: string;
  location_parking_pl: string;
  location_stop_uk: string;
  location_stop_pl: string;
  location_route_uk: string;
  location_route_pl: string;
  final_title_uk: string;
  final_title_pl: string;
  final_description_uk: string;
  final_description_pl: string;
  final_cta_uk: string;
  final_cta_pl: string;
};

export const fallbackEquipmentCategories: RentalEquipmentCategory[] = [
  {
    id: "flash",
    title_uk: "Імпульсне світло",
    title_pl: "Światło błyskowe",
    items_uk: "Godox QS600II — 3 шт.\nQuadralite Pulse X1200 — 1 шт.",
    items_pl: "Godox QS600II — 3 szt.\nQuadralite Pulse X1200 — 1 szt.",
  },
  {
    id: "continuous",
    title_uk: "Постійне світло",
    title_pl: "Światło ciągłe",
    items_uk:
      "Godox SL-150W III\nFomei WiFi 100B LED\nJinbei EF-150D LED\nNanlite FS-300B Bi-Color\nNanlite FC-500B Bi-Color",
    items_pl:
      "Godox SL-150W III\nFomei WiFi 100B LED\nJinbei EF-150D LED\nNanlite FS-300B Bi-Color\nNanlite FC-500B Bi-Color",
  },
  {
    id: "modifiers",
    title_uk: "Модифікатори та насадки",
    title_pl: "Modyfikatory i nasadki",
    items_uk:
      "Nanlite Parabolic Softbox 120 см\nGlareOne Softbox 40×180 см\nGlareOne Octa Softbox 150 Pro\nQuadralite Softbox 80×120 см\nBeauty Dish\nReflectors",
    items_pl:
      "Nanlite Parabolic Softbox 120 cm\nGlareOne Softbox 40×180 cm\nGlareOne Octa Softbox 150 Pro\nQuadralite Softbox 80×120 cm\nBeauty Dish\nReflectors",
  },
  {
    id: "video",
    title_uk: "Відео, контент і фони",
    title_pl: "Wideo, content i tła",
    items_uk:
      "Телесуфлер (Prompter)\nGreen Screen (Chroma Key)\nДим-машина\nПроєктор\nКабель TetherPro\nTriplex\n20 фотографічних фонів",
    items_pl:
      "Teleprompter\nGreen Screen (Chroma Key)\nWytwornica dymu\nProjektor\nKabel TetherPro\nTriplex\n20 teł fotograficznych",
  },
  {
    id: "comfort",
    title_uk: "Комфорт і підготовка",
    title_pl: "Komfort i przygotowanie",
    items_uk: "",
    items_pl: "",
  },
];

export const fallbackRentalConditions: RentalCondition[] = [
  {
    id: "minimum",
    title_uk: "Мінімальний час оренди",
    title_pl: "Minimalny czas wynajmu",
    text_uk: "Мінімальна тривалість бронювання визначається під час вибору часу в календарі.",
    text_pl: "Minimalny czas rezerwacji zobaczysz podczas wyboru terminu w kalendarzu.",
  },
  {
    id: "changes",
    title_uk: "Перенесення та скасування",
    title_pl: "Zmiana i anulowanie",
    text_uk: "Умови перенесення, скасування та повернення оплати залежать від строку звернення. Перевірте повні правила оренди.",
    text_pl: "Warunki zmiany terminu, anulowania i zwrotu płatności zależą od terminu zgłoszenia. Sprawdź pełny regulamin wynajmu.",
  },
  {
    id: "late",
    title_uk: "Запізнення і продовження",
    title_pl: "Spóźnienie i przedłużenie",
    text_uk: "Запізнення не переносить час завершення. Продовження можливе лише після погодження, якщо наступний час вільний.",
    text_pl: "Spóźnienie nie przesuwa godziny zakończenia. Przedłużenie jest możliwe po uzgodnieniu, jeśli kolejny termin jest wolny.",
  },
  {
    id: "payment",
    title_uk: "Оплата та підтвердження",
    title_pl: "Płatność i potwierdzenie",
    text_uk: "Бронювання підтверджується після узгодження дати та виконання умов оплати.",
    text_pl: "Rezerwacja zostaje potwierdzona po uzgodnieniu terminu i spełnieniu warunków płatności.",
  },
  {
    id: "start",
    title_uk: "Коли починається час оренди",
    title_pl: "Kiedy zaczyna się czas wynajmu",
    text_uk: "Час оренди починається у заброньовану годину. Підготовка, макіяж і переодягання входять у час бронювання.",
    text_pl: "Czas wynajmu zaczyna się o zarezerwowanej godzinie. Przygotowanie, makijaż i przebieranie wliczają się w czas rezerwacji.",
  },
  {
    id: "finish",
    title_uk: "Закінчення оренди і вихід зі студії",
    title_pl: "Koniec wynajmu i opuszczenie studia",
    text_uk: "До завершення бронювання потрібно закінчити зйомку, зібрати речі й реквізит та залишити студію.",
    text_pl: "Przed końcem rezerwacji należy zakończyć sesję, zebrać rzeczy i rekwizyty oraz opuścić studio.",
  },
];

export const fallbackRentalSpecifications: RentalSpecification[] = [
  { id: "area", label_uk: "Площа студії", label_pl: "Powierzchnia studia", value_uk: "", value_pl: "" },
  { id: "ceiling", label_uk: "Висота стелі", label_pl: "Wysokość sufitu", value_uk: "", value_pl: "" },
  { id: "cyclorama", label_uk: "Розмір циклорами", label_pl: "Wymiary cykloramy", value_uk: "", value_pl: "" },
  { id: "daylight", label_uk: "Природне світло", label_pl: "Światło dzienne", value_uk: "", value_pl: "" },
  { id: "people", label_uk: "Максимальна кількість людей", label_pl: "Maksymalna liczba osób", value_uk: "", value_pl: "" },
  { id: "floor", label_uk: "Поверх і ліфт", label_pl: "Piętro i winda", value_uk: "", value_pl: "" },
  { id: "climate", label_uk: "Кондиціонер / опалення", label_pl: "Klimatyzacja / ogrzewanie", value_uk: "", value_pl: "" },
  { id: "pets", label_uk: "Зйомка з тваринами", label_pl: "Sesje ze zwierzętami", value_uk: "", value_pl: "" },
  { id: "video", label_uk: "Відеозйомка", label_pl: "Nagrania wideo", value_uk: "", value_pl: "" },
  { id: "access", label_uk: "Доступ із технікою", label_pl: "Dostęp ze sprzętem", value_uk: "", value_pl: "" },
];

export const fallbackRentalFaq: RentalFaqItem[] = [
  {
    id: "included",
    question_uk: "Що входить у вартість?",
    question_pl: "Co obejmuje cena?",
    answer_uk:
      "У вартість входить оренда простору та обладнання, перелічене вище. Додаткові послуги узгоджуються окремо.",
    answer_pl:
      "Cena obejmuje wynajem przestrzeni i sprzęt wymieniony powyżej. Dodatkowe usługi ustalamy osobno.",
  },
  {
    id: "prepayment",
    question_uk: "Чи потрібно платити заздалегідь?",
    question_pl: "Czy trzeba zapłacić z góry?",
    answer_uk: "Оплата здійснюється до початку оренди. Бронювання вважається підтвердженим після узгодження дати та способу оплати.",
    answer_pl: "Płatność odbywa się przed rozpoczęciem wynajmu. Rezerwacja jest potwierdzona po uzgodnieniu terminu i formy płatności.",
  },
  {
    id: "cancel",
    question_uk: "Чи можна перенести або скасувати бронювання?",
    question_pl: "Czy można przełożyć lub anulować rezerwację?",
    answer_uk: "Так. Умови перенесення, скасування та повернення оплати залежать від строку звернення — перегляньте повні правила оренди.",
    answer_pl: "Tak. Warunki zmiany terminu, anulowania i zwrotu płatności zależą od terminu zgłoszenia — sprawdź pełny regulamin wynajmu.",
  },
  {
    id: "start",
    question_uk: "З якого моменту рахується час оренди?",
    question_pl: "Od którego momentu liczony jest czas wynajmu?",
    answer_uk: "Час оренди починається у заброньовану годину. Підготовка, макіяж і переодягання входять у час бронювання.",
    answer_pl: "Czas wynajmu zaczyna się o zarezerwowanej godzinie. Przygotowanie, makijaż i przebieranie wliczają się w czas rezerwacji.",
  },
  {
    id: "late",
    question_uk: "Що буде, якщо я запізнюся?",
    question_pl: "Co się stanie, jeśli się spóźnię?",
    answer_uk: "Запізнення не переносить час завершення оренди та не зменшує її вартість.",
    answer_pl: "Spóźnienie nie przesuwa godziny zakończenia wynajmu i nie obniża jego ceny.",
  },
  {
    id: "finish",
    question_uk: "Коли потрібно закінчити зйомку і залишити студію?",
    question_pl: "Kiedy trzeba zakończyć sesję i opuścić studio?",
    answer_uk: "До завершення бронювання потрібно закінчити зйомку, зібрати особисті речі й реквізит та залишити студію.",
    answer_pl: "Przed końcem rezerwacji należy zakończyć sesję, zebrać rzeczy osobiste i rekwizyty oraz opuścić studio.",
  },
  {
    id: "extend",
    question_uk: "Чи можна продовжити час?",
    question_pl: "Czy można przedłużyć czas?",
    answer_uk: "Так, якщо після вас немає іншого бронювання та адміністратор підтвердив продовження. Додатковий час оплачується окремо.",
    answer_pl: "Tak, jeśli po Państwa rezerwacji nie ma kolejnej i administrator potwierdzi przedłużenie. Dodatkowy czas jest płatny osobno.",
  },
  {
    id: "makeup",
    question_uk: "Чи потрібно бронювати make-up room окремо?",
    question_pl: "Czy make-up room trzeba rezerwować osobno?",
    answer_uk: "Додайте make-up room під час оформлення оренди.",
    answer_pl: "Dodaj make-up room podczas rezerwacji studia.",
  },
  {
    id: "photographer",
    question_uk: "Чи можна прийти зі своїм фотографом?",
    question_pl: "Czy można przyjść z własnym fotografem?",
    answer_uk: "Так. Оренда простору не вимагає замовлення фотографа студії.",
    answer_pl: "Tak. Wynajem przestrzeni nie wymaga zamawiania fotografa studia.",
  },
  {
    id: "video",
    question_uk: "Чи можна знімати відео або Reels?",
    question_pl: "Czy można nagrywać wideo lub Reels?",
    answer_uk: "Так, студія підходить для фото, відео та content-зйомок.",
    answer_pl: "Tak, studio nadaje się do zdjęć, wideo i contentu.",
  },
  {
    id: "props",
    question_uk: "Чи можна приносити їжу, тварин або конфеті?",
    question_pl: "Czy można przynieść jedzenie, zwierzęta lub konfetti?",
    answer_uk: "Тварини, їжа, конфеті, дим, фарби та інший нестандартний реквізит потребують попереднього погодження зі студією.",
    answer_pl: "Zwierzęta, jedzenie, konfetti, dym, farby i inne niestandardowe rekwizyty wymagają wcześniejszego uzgodnienia ze studiem.",
  },
  {
    id: "shoes",
    question_uk: "Чи потрібно перевзуватися?",
    question_pl: "Czy trzeba zmienić obuwie?",
    answer_uk: "Так. У студії потрібно користуватися чистим змінним взуттям, щоб не пошкодити та не забруднити поверхні й циклораму.",
    answer_pl: "Tak. W studio obowiązuje czyste obuwie zmienne, aby nie zabrudzić ani nie uszkodzić powierzchni i cykloramy.",
  },
  {
    id: "invoice",
    question_uk: "Чи можна отримати fakturę?",
    question_pl: "Czy można otrzymać fakturę?",
    answer_uk: "Так, fakturę можна отримати за запитом. Перед оплатою підготуйте правильні реквізити.",
    answer_pl: "Tak, fakturę można otrzymać na życzenie. Przed płatnością przygotuj prawidłowe dane do faktury.",
  },
  {
    id: "tax",
    question_uk: "Ціни вказані brutto чи netto?",
    question_pl: "Czy ceny są brutto czy netto?",
    answer_uk: "",
    answer_pl: "",
  },
  {
    id: "parking",
    question_uk: "Де можна припаркуватися?",
    question_pl: "Gdzie można zaparkować?",
    answer_uk: "",
    answer_pl: "",
  },
];

export const fallbackSiteRentalContent: SiteRentalContent = {
  hero_image_url: "/images/rental/rental-hero-wide.webp",
  hero_eyebrow_uk: "Оренда фотостудії",
  hero_eyebrow_pl: "Wynajem studia fotograficznego",
  hero_title_uk: "Ваша зйомка починається з простору, який уже готовий",
  hero_title_pl: "Twoja sesja zaczyna się w przestrzeni, która jest już gotowa",
  hero_description_uk:
    "Світло, фони та професійна техніка вже на місці. Вам залишається обрати час і приїхати з ідеєю.",
  hero_description_pl:
    "Światło, tła i profesjonalny sprzęt są już na miejscu. Wybierz termin i przyjedź ze swoim pomysłem.",
  primary_cta_uk: "Перевірити вільний час",
  primary_cta_pl: "Sprawdź wolny termin",
  secondary_cta_uk: "Подивитися студію",
  secondary_cta_pl: "Zobacz studio",
  rental_price: "200 zł / h",
  makeup_price: "+50 zł",
  backgrounds_count: "20",
  trust_items_uk:
    "Обладнання входить у вартість\nОнлайн-бронювання\nПідтвердження на email",
  trust_items_pl:
    "Sprzęt w cenie\nRezerwacja online\nPotwierdzenie na email",
  zones_eyebrow_uk: "Оберіть простір",
  zones_eyebrow_pl: "Wybierz przestrzeń",
  zones_title_uk: "Оберіть простір під свою ідею",
  zones_title_pl: "Wybierz przestrzeń do swojego pomysłu",
  gallery_image_1_url: "/images/rental/cyklorama.webp",
  gallery_image_2_url: "/images/rental/warm-interior.webp",
  gallery_image_3_url: "/images/rental/loft-interior.webp",
  gallery_image_4_url: "/images/rental/equipment.webp",
  gallery_image_5_url: "/images/rental/creative-session.webp",
  specifications_eyebrow_uk: "Характеристики студії",
  specifications_eyebrow_pl: "Parametry studia",
  specifications_title_uk: "Усе важливе для підготовки зйомки",
  specifications_title_pl: "Wszystko, co ważne przy planowaniu sesji",
  studio_specifications: fallbackRentalSpecifications,
  video_url: "",
  video_poster_url: "",
  video_eyebrow_uk: "Відеоекскурсія",
  video_eyebrow_pl: "Wideoprezentacja",
  video_title_uk: "Подивіться студію за 60 секунд",
  video_title_pl: "Zobacz studio w 60 sekund",
  video_description_uk:
    "Пройдіться залами, побачте світло, циклораму та make-up room ще до бронювання.",
  video_description_pl:
    "Zobacz przestrzeń, światło, cykloramę i make-up room jeszcze przed rezerwacją.",
  video_cta_uk: "Дивитися відео",
  video_cta_pl: "Obejrzyj wideo",
  included_eyebrow_uk: "Що входить у вартість",
  included_eyebrow_pl: "Co obejmuje cena",
  included_title_uk: "Не везіть світло і стійки — усе вже у студії",
  included_title_pl: "Nie zabieraj lamp i statywów — wszystko jest już w studio",
  included_description_uk:
    "Оберіть категорію, щоб переглянути повний список техніки.",
  included_description_pl:
    "Wybierz kategorię, aby zobaczyć pełną listę sprzętu.",
  included_items_uk: "",
  included_items_pl: "",
  equipment_image_url: "/images/rental/equipment.webp",
  equipment_help_uk:
    "Не знаєте, яке світло обрати? Адміністратор допоможе підготувати студію.",
  equipment_help_pl:
    "Nie wiesz, jakie światło wybrać? Administrator pomoże przygotować studio.",
  equipment_categories: fallbackEquipmentCategories,
  for_who_eyebrow_uk: "Створено для ваших проєктів",
  for_who_eyebrow_pl: "Stworzone dla Twoich projektów",
  for_who_title_uk: "Від особистого портрета до кампанії бренду",
  for_who_title_pl: "Od osobistego portretu po kampanię marki",
  for_who_description_uk:
    "Простір адаптується до різних форматів зйомки та творчих задач.",
  for_who_description_pl:
    "Przestrzeń dopasowuje się do różnych formatów sesji i kreatywnych zadań.",
  for_who_items_uk:
    "Фотографам\nВідеографам\nBeauty-майстрам\nБрендам одягу\nКонтент-кріейторам\nОсобистим зйомкам",
  for_who_items_pl:
    "Fotografom\nFilmowcom\nSpecjalistom beauty\nMarkom odzieżowym\nTwórcom contentu\nSesjom osobistym",
  audience_image_url: "/images/rental/creative-session.webp",
  reservation_eyebrow_uk: "Бронювання без зайвих переписок",
  reservation_eyebrow_pl: "Rezerwacja bez zbędnych wiadomości",
  reservation_steps_uk:
    "Оберіть дату\nВкажіть час\nОтримайте підтвердження\nПриїжджайте на зйомку",
  reservation_steps_pl:
    "Wybierz datę\nWskaż godzinę\nOdbierz potwierdzenie\nPrzyjedź na sesję",
  reservation_note_uk:
    "Перед бронюванням ознайомтеся з правилами оренди студії.",
  reservation_note_pl:
    "Przed rezerwacją zapoznaj się z regulaminem wynajmu studia.",
  rental_conditions: fallbackRentalConditions,
  reviews_eyebrow_uk: "Нас рекомендують",
  reviews_eyebrow_pl: "Polecają nas",
  reviews_title_uk: "Студія, до якої хочеться повертатися",
  reviews_title_pl: "Studio, do którego chce się wracać",
  google_reviews_url: "",
  faq_eyebrow_uk: "Запитання перед бронюванням",
  faq_eyebrow_pl: "Pytania przed rezerwacją",
  faq_title_uk: "Усе важливе перед вашою зйомкою",
  faq_title_pl: "Wszystko, co ważne przed sesją",
  faq_items: fallbackRentalFaq,
  location_image_url: "",
  location_door_image_url: "",
  location_eyebrow_uk: "Наша локація",
  location_eyebrow_pl: "Nasza lokalizacja",
  location_title_uk: "Щоб ви знайшли нас з першого разу",
  location_title_pl: "Aby łatwo trafić do nas za pierwszym razem",
  location_description_uk: "",
  location_description_pl: "",
  location_floor_uk: "",
  location_floor_pl: "",
  location_entrance_uk: "",
  location_entrance_pl: "",
  location_parking_uk: "",
  location_parking_pl: "",
  location_stop_uk: "",
  location_stop_pl: "",
  location_route_uk: "",
  location_route_pl: "",
  final_title_uk: "Ваша дата може бути вільною",
  final_title_pl: "Twój termin może być wolny",
  final_description_uk:
    "Перевірте календар і забронюйте зручний час онлайн.",
  final_description_pl:
    "Sprawdź kalendarz i zarezerwuj dogodny termin online.",
  final_cta_uk: "Перевірити вільний час",
  final_cta_pl: "Sprawdź wolny termin",
};

export const rentalContentSelect = Object.keys(fallbackSiteRentalContent).join(", ");

const mergeById = <T extends { id: string }>(value: unknown, fallback: T[]): T[] => {
  if (!Array.isArray(value) || value.length === 0) return fallback;
  const current = value as T[];
  const currentIds = new Set(current.map((item) => item.id));
  return [...current, ...fallback.filter((item) => !currentIds.has(item.id))];
};

export const normalizeRentalContent = (
  value: Partial<SiteRentalContent> | null | undefined,
): SiteRentalContent => {
  const normalized = {
    ...fallbackSiteRentalContent,
    ...(value || {}),
    equipment_categories: mergeById(
      value?.equipment_categories,
      fallbackEquipmentCategories,
    ),
    rental_conditions: mergeById(value?.rental_conditions, fallbackRentalConditions),
    studio_specifications: mergeById(
      value?.studio_specifications,
      fallbackRentalSpecifications,
    ),
    faq_items: mergeById(value?.faq_items, fallbackRentalFaq),
  } as SiteRentalContent;

  const optionalTextFields = new Set<keyof SiteRentalContent>([
    "video_url", "video_poster_url", "google_reviews_url",
    "location_image_url", "location_door_image_url", "location_description_uk",
    "location_description_pl", "location_entrance_uk", "location_entrance_pl",
    "location_parking_uk", "location_parking_pl", "location_stop_uk",
    "location_stop_pl", "location_route_uk", "location_route_pl",
    "included_items_uk", "included_items_pl",
  ]);

  for (const key of Object.keys(fallbackSiteRentalContent) as Array<keyof SiteRentalContent>) {
    const fallbackValue = fallbackSiteRentalContent[key];
    const currentValue = normalized[key];
    if (
      typeof fallbackValue === "string" &&
      typeof currentValue === "string" &&
      !optionalTextFields.has(key) &&
      !/[\p{L}\p{N}]/u.test(currentValue)
    ) {
      (normalized as Record<string, unknown>)[key] = fallbackValue;
    }
  }

  return normalized;
};

export const splitRentalLines = (value: string, fallback: string[] = []) => {
  const lines = (value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /[\p{L}\p{N}]/u.test(line));
  return lines.length ? lines : fallback;
};
