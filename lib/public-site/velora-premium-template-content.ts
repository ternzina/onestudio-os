import type { PublicSiteContent, PublicSiteTypography } from "./types.ts";
import type { VeloraNativeSectionId } from "./velora-premium-template-contract.ts";
import { replaceTemplateContentPreservingEditorState } from "./template-native-section-state.ts";

export const VELORA_TEMPLATE_KEY = "velora-event-venue" as const;
export type VeloraItem = Record<string, string>;
export type VeloraContent = {
  version: 1;
  headingTypography: Partial<Record<VeloraNativeSectionId, PublicSiteTypography>>;
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
  headingTypography: {},
  brand: "VELORA",
  plum: "#2D394F",
  muted: "#B7B4AE",
  secondary: "#7F96B8",
  border: "#6D5B39",
  warm: "#F2D59B",
  overlay: "#050912",
  buttonForeground: "#09111F",
  navigation: [
    { label: "Пространства", href: "#venues" },
    { label: "Впечатления", href: "#packages" },
    { label: "Истории", href: "#stories" },
    { label: "Галерея", href: "#gallery" },
  ],
  header: {
    venuesPageLabel: "Посмотреть залы",
    availabilityLabel: "Проверить дату",
    menuLabel: "Меню",
  },
  hero: {
    eyebrow: "VELORA · EVENT HOUSE · КИЕВ",
    title: "Вечер, который останется с вами навсегда.",
    text: "Свет, вкус и пространство в руках одной команды — от первого эскиза до последнего тоста.",
    primaryLabel: "Проверить дату",
    primaryUrl: "#availability",
    secondaryLabel: "Посмотреть пространства",
    secondaryUrl: "#venues",
    image: asset("hero-cinematic"),
    alt: "Вечерний зал VELORA, наполненный свечами и тёплым светом",
    traits: "Киев · 3 пространства · от 12 до 220 гостей",
    scrollLabel: "Открыть VELORA",
  },
  facts: [
    { value: "640+", label: "проведённых событий" },
    { value: "11", label: "лет опыта" },
    { value: "4,9/5", label: "оценка гостей демо" },
    { value: "220", label: "гостей без компромиссов" },
  ],
  venuesPresentation: {
    eyebrow: "SIGNATURE VENUES",
    title: "Одно место. Три совершенно разных настроения.",
    pageLabel: "Сравнить все пространства",
    text: "Выберите масштаб и характер. Мы настроим свет, планировку и ритм вечера.",
  },
  venues: [
    {
      name: "Grand Hall",
      mood: "Кинематографический размах",
      capacity: "80–220 гостей",
      area: "420 m²",
      features: "Высокий потолок · сцена · панорамные окна",
      formats: "Свадьбы · гала-ужины · премьеры",
      seating: "банкет 220 · театр 300",
      image: asset("grand-hall-cinematic"),
      alt: "Grand Hall перед элегантным вечерним банкетом",
      cta: "Выбрать Grand Hall",
    },
    {
      name: "Garden Room",
      mood: "Свет и сад",
      capacity: "40–110 гостей",
      area: "240 m²",
      features: "Оранжерея · терраса · крытый план на случай дождя",
      formats: "Церемонии · ужины · дни рождения",
      seating: "банкет 110 · коктейль 160",
      image: asset("garden-room-cinematic"),
      alt: "Светлый Garden Room в окружении зелени",
      cta: "Выбрать Garden Room",
    },
    {
      name: "Atelier",
      mood: "Камерно и близко",
      capacity: "12–48 гостей",
      area: "110 m²",
      features: "Собственный бар · камин · отдельный вход",
      formats: "Ужины · юбилеи · закрытые встречи",
      seating: "за столом 32 · коктейль 48",
      image: asset("atelier-cinematic"),
      alt: "Камерный Atelier с сервированным столом и камином",
      cta: "Выбрать Atelier",
    },
  ],
  formatsPresentation: {
    eyebrow: "ВАШ ФОРМАТ",
    title: "Увидьте свой вечер ещё до начала планирования.",
  },
  formats: [
    "Свадьба",
    "Частный ужин",
    "День рождения",
    "Корпоративное событие",
    "Показ или премьера",
    "Церемония",
  ].map((title, index) => ({
    number: `0${index + 1}`,
    title,
    text: [
      "Церемония, ужин и танцы складываются в одну историю.",
      "Один стол, авторское меню и полная приватность.",
      "Праздник в ритме, который подходит именно вам.",
      "Гостеприимство, соединённое с точной организацией.",
      "Сценография, свет и техника для сильного дебюта.",
      "В саду или под крышей — без тревоги о погоде.",
    ][index],
  })),
  transformation: {
    eyebrow: "ПРЕОБРАЖЕНИЕ",
    title: "Тот же зал. Совсем другая история.",
    text: "Передвиньте ползунок и посмотрите, как свет, текстиль и флористика превращают пустое пространство в готовый вечер.",
    beforeLabel: "До",
    afterLabel: "После",
    beforeImage: asset("transformation-before-v2"),
    beforeAlt: "Пустой зал до подготовки события",
    afterImage: asset("transformation-after-v2"),
    afterAlt: "Тот же зал после полной подготовки события",
  },
  storyPresentation: {
    eyebrow: "ОТ ТИШИНЫ ДО ПОСЛЕДНЕГО ТАНЦА",
    title: "Пространство оживает шаг за шагом.",
    text: "Мы не просто добавляем декор. Мы создаём напряжение: свет, стол, цветы, люди, музыка.",
  },
  story: [
    "Пустой зал",
    "Первый свет",
    "Сервировка",
    "Цветы",
    "Гости",
    "Вечер",
  ].map((title, index) => ({
    number: `0${index + 1}`,
    title,
    text: [
      "Архитектура задаёт ритм.",
      "Тёплый свет открывает детали.",
      "Каждое место ждёт своего гостя.",
      "Цвет задаёт настроение.",
      "Пространство начинает жить.",
      "Всё течёт легко и естественно.",
    ][index],
  })),
  packagesPresentation: {
    eyebrow: "ГОТОВЫЕ ВПЕЧАТЛЕНИЯ",
    title: "Выберите, сколько забот мы возьмём на себя.",
    pageLabel: "Посмотреть пакеты подробно",
    text: "Каждый уровень можно настроить под себя — они отличаются масштабом оформления и временем, которое мы вам возвращаем.",
  },
  packages: [
    {
      name: "Essential",
      result: "Красивое и спокойное основание",
      price: "от 16 900 €",
      for: "для камерных событий",
      includes: "Пространство · мебель · базовый свет · забота команды",
      decor: "тонкие акценты",
      menu: "сезонное меню",
      image: asset("atelier-cinematic"),
      alt: "Камерный стол в пакете Essential",
      cta: "Выбрать Essential",
    },
    {
      name: "Signature",
      result: "Цельная атмосфера с первого шага",
      price: "от 31 900 €",
      for: "для свадеб и больших ужинов",
      includes:
        "Весь зал · welcome drink · свет · координация · флористика",
      decor: "индивидуальная палитра",
      menu: "меню Signature и pairing",
      image: asset("grand-hall-cinematic"),
      alt: "Ужин при свечах в пакете Signature",
      cta: "Выбрать Signature",
    },
    {
      name: "Iconic",
      result: "Вечер с полной режиссурой",
      price: "от 57 900 €",
      for: "для событий большого масштаба",
      includes:
        "Эксклюзивность · сценография · продакшн · полная команда · репетиция",
      decor: "авторская инсталляция",
      menu: "меню, созданное с нуля",
      image: asset("celebration-cinematic"),
      alt: "Большое вечернее событие в пакете Iconic",
      cta: "Выбрать Iconic",
    },
  ],
  includedPresentation: {
    eyebrow: "СПОКОЙСТВИЕ ВКЛЮЧЕНО",
    title: "Десять вещей, которые вам не придётся координировать.",
    text: "Одна ответственная команда, один план и никаких звонков пяти разным подрядчикам.",
  },
  included: [
    "Пространство",
    "Мебель",
    "Свет",
    "Звук",
    "Сервировка",
    "Декор",
    "Координация",
    "Монтаж",
    "Уборка",
    "Забота команды",
  ].map((title, index) => ({
    number: String(index + 1).padStart(2, "0"),
    title,
  })),
  cateringPresentation: {
    eyebrow: "MENU & DRINKS",
    title: "Вкус, который поддерживает ритм вечера.",
    text: "Сезонное меню, авторские коктейли и сервис, появляющийся ровно в нужный момент.",
    image: asset("menu-cinematic"),
    alt: "Изысканные блюда и напитки во время ужина VELORA",
    cta: "Обсудить меню",
  },
  catering: [
    {
      title: "Сезонное меню",
      text: "Четыре или шесть курсов, включая растительные варианты.",
      meta: "от 290 € / гость",
    },
    {
      title: "Welcome ritual",
      text: "Champagne, авторский коктейль или безалкогольный pairing.",
      meta: "под характер события",
    },
    {
      title: "Ваши вкусы",
      text: "Дегустация и персонализация до события.",
      meta: "без жёсткой схемы",
    },
  ],
  decor: {
    eyebrow: "DESIGN & DECOR",
    title: "Мы не украшаем зал. Мы проектируем настроение.",
    text: "Флористика, свет, текстиль, полиграфия и план столов складываются в единый moodboard — с вашим характером, а не готовым набором из каталога.",
    image: asset("garden-room-cinematic"),
    alt: "Декор VELORA с флористикой, светом и элегантной сервировкой",
  },
  coordinator: {
    eyebrow: "ВАШ КООРДИНАТОР",
    title: "Человек, который помнит обо всём — чтобы вам не пришлось.",
    text: "Марта ведёт встречи, собирает решения и контролирует подрядчиков. В день события она на полшага впереди расписания, но всегда рядом с вами.",
    promise: "Один человек на связи — от первой встречи до конца вечера.",
    image: asset("coordinator-cinematic"),
    alt: "Координатор VELORA готовит зал к событию",
  },
  reviewsPresentation: {
    eyebrow: "VELORA DEMO STORIES",
    title: "Настоящие запросы. Демонстрационные истории.",
    disclaimer:
      "Истории и имена ниже — вымышленный демонстрационный контент VELORA.",
  },
  reviews: [
    {
      quote:
        "Мы хотели ужин, который после десерта естественно превратится в праздник. За весь вечер ни разу не посмотрели на часы.",
      author: "Оля и Михаил · демо-история",
      meta: "Свадьба · Grand Hall · 126 гостей",
      task: "церемония и танцы без пауз",
      image: asset("celebration-cinematic"),
      alt: "Гости демонстрационной свадьбы танцуют вечером",
    },
    {
      quote:
        "Команда получила короткий бриф, а вернула нам целый вечер — от света до последнего коктейля.",
      author: "Studio North · демо-история",
      meta: "Премьера · Garden Room · 84 гостя",
      task: "бренд должен был звучать тонко",
      image: asset("grand-hall-cinematic"),
      alt: "Демонстрационная премьера в Garden Room",
    },
    {
      quote:
        "В Atelier было по-домашнему близко, но с сервисом ресторана высокого уровня.",
      author: "Семья В. · демо-история",
      meta: "Юбилей · Atelier · 28 гостей",
      task: "приватно, без строгого протокола",
      image: asset("atelier-cinematic"),
      alt: "Демонстрационный камерный юбилейный ужин",
    },
  ],
  galleryPresentation: {
    eyebrow: "ПОСЛЕ ЗАКАТА",
    title: "Посмотрите, как оживает VELORA.",
    dialogLabel: "Галерея событий VELORA",
    closeLabel: "Закрыть галерею",
    openLabel: "Открыть фотографию",
    previousLabel: "Предыдущая фотография",
    nextLabel: "Следующая фотография",
  },
  gallery: [
    { image: asset("grand-hall-cinematic"), alt: "Вечерний банкет в Grand Hall" },
    { image: asset("celebration-cinematic"), alt: "Гости танцуют в свете вечернего зала" },
    { image: asset("menu-cinematic"), alt: "Сезонное меню и напитки VELORA" },
    { image: asset("garden-room-cinematic"), alt: "Церемония в светлом Garden Room" },
    { image: asset("coordinator-cinematic"), alt: "Координатор готовит сервировку" },
    {
      image: asset("atelier-cinematic"),
      alt: "Камерный вечер в Atelier",
    },
  ],
  plannerPresentation: {
    eyebrow: "КАК ЭТО РАБОТАЕТ",
    title: "От даты до готового вечера — без хаоса.",
    text: "Начинаем с короткого разговора. Затем создаём предложение под ваших гостей, пространство и бюджет.",
  },
  planner: [
    {
      number: "01",
      title: "Проверяем дату",
      text: "Ответим в течение одного рабочего дня.",
    },
    {
      number: "02",
      title: "Разговариваем",
      text: "30 минут о гостях, ритме и приоритетах.",
    },
    {
      number: "03",
      title: "Готовим предложение",
      text: "Зал, меню, оформление и понятный бюджет.",
    },
    {
      number: "04",
      title: "Планируем",
      text: "Все решения попадают в единый график.",
    },
    {
      number: "05",
      title: "Вы празднуете",
      text: "Команда ведёт день, а вы остаётесь с гостями.",
    },
  ],
  faqPresentation: {
    eyebrow: "БЕЗ НЕДОСКАЗАННОСТИ",
    title: "Вопросы, которые стоит задать до бронирования.",
  },
  faq: [
    [
      "Что именно входит в стоимость?",
      "Состав зависит от пакета, но пространство, оснащение, подготовка и забота команды включены всегда. В предложении каждая позиция видна отдельно.",
    ],
    [
      "Можно ли изменить пакет?",
      "Да. Пакет — это отправная точка, а меню, декор и продакшн мы настраиваем индивидуально.",
    ],
    [
      "Что будет, если пойдёт дождь?",
      "Для Garden Room предусмотрен полноценный сценарий под крышей. Решение о погодном плане принимаем за 24 часа без доплаты.",
    ],
    [
      "Можно ли пригласить своих подрядчиков?",
      "Да, если заранее согласовать монтаж, безопасность и график с координатором.",
    ],
    [
      "Когда лучше бронировать?",
      "Субботы в сезон стоит бронировать за 10–14 месяцев. Для ужинов и корпоративных событий часто достаточно 6–10 недель.",
    ],
    [
      "Как работает предоплата?",
      "Дату подтверждают договор и предоплата, указанная в предложении. Само сообщение из формы дату не блокирует.",
    ],
    [
      "Можно ли перенести событие?",
      "Условия переноса и отмены ясно прописаны в договоре; сначала мы всегда ищем новую доступную дату.",
    ],
    [
      "Доступно ли пространство для маломобильных гостей?",
      "Во всех залах есть безбарьерный доступ, лифт и доступная уборная. Индивидуальные потребности обсуждаем до визита.",
    ],
    [
      "Есть ли парковка?",
      "Да, доступны 46 мест и безопасная зона высадки для такси.",
    ],
    [
      "До которого часа может длиться событие?",
      "Стандартно до 2:00, с возможностью продления после согласования сервиса и охраны.",
    ],
  ].map(([question, answer]) => ({ question, answer })),
  availability: {
    eyebrow: "ПОСЛЕДНИЙ ШАГ",
    title: "Начнём с вашей даты.",
    text: "Это ни к чему не обязывает. Марта проверит календарь и вернётся с двумя наиболее подходящими вариантами.",
    dateLabel: "Дата",
    formatLabel: "Формат",
    formatPlaceholder: "Выберите формат",
    guestsLabel: "Количество гостей",
    guestsPlaceholder: "например, 80",
    venueLabel: "Пространство",
    venuePlaceholder: "Выберите зал",
    packageLabel: "Пакет",
    packagePlaceholder: "Выберите пакет",
    nameLabel: "Имя и фамилия",
    emailLabel: "E-mail",
    phoneLabel: "Телефон",
    submit: "Проверить дату",
    pending: "Отправляем…",
    idle: "Ответим в течение одного рабочего дня. Форма не блокирует дату.",
    success:
      "Спасибо. Координатор вернётся с доступными вариантами в течение одного рабочего дня.",
    error:
      "Не удалось отправить запрос. Проверьте данные или свяжитесь с нами по телефону.",
    ariaLabel: "Форма проверки даты VELORA",
    subject: "Проверка даты VELORA",
  },
  contact: {
    eyebrow: "ПРИХОДИТЕ К НАМ",
    title: "Это пространство лучше почувствовать вживую.",
    text: "Запишитесь на частный просмотр и увидьте три зала в их естественном свете.",
    address: "ул. Большая Житомирская, 24 · Киев",
    phone: "+380 44 555 24 24",
    email: "events@velora.house",
    hours: "ежедневно · 10:00–21:00",
    map: "VELORA · Киев",
    mapAria: "Демонстрационная локация VELORA",
    cta: "Проверить дату",
  },
  footer: {
    note: "Event house · Киев",
    tagline:
      "Создаём вечера, которые остаются с вами — в свете, вкусе и каждой тихой детали.",
    cta: "Начать с вашей даты",
    navigationLabel: "Исследовать",
    contactLabel: "Связаться",
    languageLabel: "Язык",
    topLabel: "Наверх",
    copyright: "© 2026 VELORA · вымышленный демонстрационный бренд",
  },
  customPages: {
    homeLabel: "Главная",
    venuesLabel: "Пространства",
    packagesLabel: "Пакеты",
    areaLabel: "Площадь",
    formatLabel: "Лучший формат",
    requestLabel: "Проверить этот вариант",
    venuesEyebrow: "ТРИ ХАРАКТЕРА",
    venuesTitle: "Пространство, которое работает на ваш сценарий.",
    venuesIntro:
      "От большого выхода до ужина за одним столом. Сравните атмосферу, масштаб и возможности без скучных таблиц.",
    packagesEyebrow: "ТРИ УРОВНЯ ЗАБОТЫ",
    packagesTitle: "Чем больше постановка, тем меньше решений остаётся вам.",
    packagesIntro:
      "Каждый пакет создаёт красивое событие. Вы выбираете масштаб и количество времени, которое хотите вернуть себе.",
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
    headingTypography: isObject(source.headingTypography)
      ? source.headingTypography as Partial<Record<VeloraNativeSectionId, PublicSiteTypography>>
      : {},
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
