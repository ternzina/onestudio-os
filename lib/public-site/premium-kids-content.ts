import type { PublicSiteContent } from "@/lib/public-site/types";

export const PREMIUM_KIDS_TEMPLATE_KEY = "premium-kids-center" as const;

export type PremiumKidsContent = {
  brand_name: string;
  brand_tagline: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_description: string;
  primary_cta_label: string;
  secondary_cta_label: string;
  intro_eyebrow: string;
  intro_title: string;
  intro_description: string;
  programs_title: string;
  programs_description: string;
  age_groups: string[];
  approach_title: string;
  approach_items: string[];
  schedule_title: string;
  schedule_description: string;
  teachers_title: string;
  teachers: string[];
  gallery_title: string;
  gallery_captions: string[];
  reviews_title: string;
  reviews: string[];
  faq_title: string;
  faq: string[];
  final_cta_eyebrow: string;
  final_cta_title: string;
  final_cta_label: string;
  footer_description: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
};

export const DEFAULT_PREMIUM_KIDS_CONTENT: PremiumKidsContent = {
  brand_name: "BEMBI",
  brand_tagline: "Discovery Platform",
  hero_eyebrow: "Learning ecosystem · Warszawa / online",
  hero_title: "Место для\nбольших\nоткрытий",
  hero_description: "Программы, в которых детям интересно расти, исследовать и открывать новое.",
  primary_cta_label: "Найти занятие",
  secondary_cta_label: "Открыть библиотеку заданий",
  intro_eyebrow: "Программы по возрастам",
  intro_title: "Интерес растёт вместе с ребёнком",
  intro_description: "Выберите возраст — мы покажем направления, в которых сейчас будет особенно интересно.",
  programs_title: "Живые занятия — часть большой экосистемы",
  programs_description: "Выберите возраст и день. После занятия ребёнок может продолжить тему дома с материалами платформы.",
  age_groups: ["2–3 · Раннее развитие · Музыка и движение · Сенсорная мастерская", "4–5 · Творчество · Английский язык · Театральная студия", "6–7 · Подготовка к школе · Математика · Научная лаборатория", "8–10 · Юный исследователь · Арт-лаборатория · Семейные мастер-классы"],
  approach_title: "Маршрут, где каждый шаг имеет смысл",
  approach_items: ["Маленькие группы — до восьми детей, чтобы слышать каждого.", "Интерес ведёт — сначала вопрос и любопытство, затем навык.", "Без перегрузки — концентрация, движение и паузы в естественном ритме.", "Безопасная среда — материалы по возрасту и понятные правила.", "Связь с родителями — короткая обратная связь после занятия."],
  schedule_title: "Неделя, в которой есть место новому",
  schedule_description: "Выберите день и посмотрите занятия, возраст и наличие мест.",
  teachers_title: "Люди, рядом с которыми интересно пробовать",
  teachers: ["Елена Новак · Педагог и автор программ", "Ян Левандовский · Science & making mentor", "Марта Ковальска · Художник-педагог", "Оливия Вишневска · Музыка, движение и язык"],
  gallery_title: "Не постановка. Настоящий процесс открытия",
  gallery_captions: ["Большой формат", "Сначала вопрос", "Вместе", "Движение и ритм", "Пространство"],
  reviews_title: "Спокойствие тоже можно почувствовать",
  reviews: ["Здесь не торопят с ответом. Ребёнок возвращается домой не уставшим, а с новым вопросом. · мама Леи", "Нам спокойно объяснили, как устроена программа и почему именно этот темп сейчас подходит. · семья Марека", "После лаборатории опыт продолжился дома — и впервые это была идея ребёнка. · папа Нины"],
  faq_title: "Перед первым визитом",
  faq: ["С какого возраста можно посещать занятия? · Программы начинаются с двух лет.", "Можно ли прийти на пробное занятие? · Да, чтобы познакомиться с педагогом и группой.", "Сколько детей в группе? · Обычно от пяти до восьми.", "Как выбрать программу? · Начните с возраста и текущего интереса."],
  final_cta_eyebrow: "BEMBI · Kids Discovery Platform",
  final_cta_title: "Первое открытие начинается\nс одного занятия.",
  final_cta_label: "Записаться на пробное занятие",
  footer_description: "Образовательная экосистема, где дети учатся через практику, игру, эксперименты и творчество.",
  contact_email: "",
  contact_phone: "",
  contact_address: "",
};

function strings(value: unknown, fallback: string[]) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, 32) : fallback;
}

export function resolvePremiumKidsContent(content?: PublicSiteContent): PremiumKidsContent {
  const raw = content?.template_content?.[PREMIUM_KIDS_TEMPLATE_KEY];
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
  const result = { ...DEFAULT_PREMIUM_KIDS_CONTENT };
  for (const key of Object.keys(result) as Array<keyof PremiumKidsContent>) {
    const value = source[key];
    if (Array.isArray(result[key])) {
      (result as Record<string, unknown>)[key] = strings(value, result[key] as string[]);
    } else if (typeof value === "string") {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  if (!source.brand_name && content?.brand_name) result.brand_name = content.brand_name;
  return result;
}

export function withPremiumKidsContent(content: PublicSiteContent, premium: PremiumKidsContent): PublicSiteContent {
  return {
    ...content,
    brand_name: premium.brand_name,
    template_content: {
      ...(content.template_content ?? {}),
      [PREMIUM_KIDS_TEMPLATE_KEY]: premium,
    },
  };
}
