export const BUILDER_PAGES = [
  { slug: 'home', title: 'Главная', path: '/', icon: '🏠' },
  { slug: 'photoshoots', title: 'Фотосессии', path: '/sesje-zdjeciowe', icon: '📸' },
  { slug: 'rental', title: 'Аренда', path: '/wynajem-studia', icon: '🏢' },
  { slug: 'learning', title: 'Навчання', path: '/szkolenia', icon: '🎓' },
  { slug: 'portfolio', title: 'Портфолио', path: '/portfolio', icon: '🖼️' },
  { slug: 'contact', title: 'Контакты', path: '/kontakt', icon: '📞' },
] as const;

export type BuilderPageSlug = (typeof BUILDER_PAGES)[number]['slug'];

export type PageBlockType =
  | 'heading'
  | 'text'
  | 'image'
  | 'video'
  | 'button'
  | 'spacer';

export type PageBlockContent = {
  title_uk?: string;
  title_pl?: string;
  text_uk?: string;
  text_pl?: string;
  media_url?: string;
  alt_uk?: string;
  alt_pl?: string;
  button_label_uk?: string;
  button_label_pl?: string;
  button_href?: string;
  height?: number;
};

export type PageBlockStyles = {
  align?: 'left' | 'center' | 'right';
  width?: 'narrow' | 'normal' | 'wide' | 'full';
  background?: 'transparent' | 'light' | 'dark' | 'accent';
};

export type PageBlock = {
  id: string;
  page_slug: string;
  zone: string;
  block_type: PageBlockType;
  name: string;
  content: PageBlockContent;
  styles: PageBlockStyles;
  sort_order: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
};

export type BuilderSystemSection = {
  id: string;
  title: string;
  description: string;
  icon: string;
  editHref: string;
  zoneAfter: string;
};

export const SYSTEM_SECTIONS: Record<string, BuilderSystemSection[]> = {
  home: [
    {
      id: 'hero',
      title: 'Hero',
      description: 'Логотип, тексты первого экрана и кнопки.',
      icon: '✦',
      editHref: '/admin/settings#home',
      zoneAfter: 'after_hero',
    },
    {
      id: 'collage',
      title: 'Коллаж',
      description: 'Четыре фотографии и подписи UA/PL.',
      icon: '🖼️',
      editHref: '/admin/settings#home',
      zoneAfter: 'after_collage',
    },
    {
      id: 'directions',
      title: 'Направления',
      description: 'Аренда, фотосессии и обучение.',
      icon: '◇',
      editHref: '/admin/settings#home',
      zoneAfter: 'after_directions',
    },
  ],
  photoshoots: [
    {
      id: 'hero',
      title: 'Hero',
      description: 'Первый экран страницы фотосессий.',
      icon: '✦',
      editHref: '/admin/settings#photoshoots',
      zoneAfter: 'after_hero',
    },
    {
      id: 'packages',
      title: 'Пакеты',
      description: 'Карточки пакетов, цены и состав.',
      icon: '▦',
      editHref: '/admin/settings#packages',
      zoneAfter: 'after_packages',
    },
    {
      id: 'interiors',
      title: 'Интерьеры',
      description: 'Зоны студии и фотографии.',
      icon: '◫',
      editHref: '/admin/settings#interiors',
      zoneAfter: 'after_interiors',
    },
    {
      id: 'portfolio',
      title: 'Портфолио',
      description: 'Подборка работ на странице фотосессий.',
      icon: '🖼️',
      editHref: '/admin/settings#portfolio',
      zoneAfter: 'after_portfolio',
    },
    {
      id: 'team',
      title: 'Команда',
      description: 'Фотографы и специалисты студии.',
      icon: '👥',
      editHref: '/admin/settings#team',
      zoneAfter: 'after_team',
    },
    {
      id: 'testimonials',
      title: 'Отзывы',
      description: 'Отзывы клиентов.',
      icon: '♡',
      editHref: '/admin/settings#testimonials',
      zoneAfter: 'after_testimonials',
    },
    {
      id: 'booking',
      title: 'Бронирование',
      description: 'Финальный CTA и кнопка записи.',
      icon: '📅',
      editHref: '/admin/settings#photoshoots',
      zoneAfter: 'after_booking',
    },
  ],
  rental: [
    {
      id: 'hero',
      title: 'Hero аренды',
      description: 'Заголовок, описание и первый экран.',
      icon: '✦',
      editHref: '/admin/settings#rental',
      zoneAfter: 'after_hero',
    },
    {
      id: 'zones',
      title: 'Зоны студии',
      description: 'Интерьеры и пространства для аренды.',
      icon: '◫',
      editHref: '/admin/settings#rental',
      zoneAfter: 'after_zones',
    },
    {
      id: 'equipment',
      title: 'Оборудование',
      description: 'Оснащение и возможности студии.',
      icon: '⚙',
      editHref: '/admin/settings#rental',
      zoneAfter: 'after_equipment',
    },
    {
      id: 'booking',
      title: 'Бронирование аренды',
      description: 'Переход к выбору даты и времени.',
      icon: '📅',
      editHref: '/admin/settings#rental',
      zoneAfter: 'after_booking',
    },
  ],
  learning: [
    {
      id: 'hero',
      title: 'Hero обучения',
      description: 'Первый экран и фотографии.',
      icon: '✦',
      editHref: '/admin/settings#learning',
      zoneAfter: 'after_hero',
    },
    {
      id: 'programs',
      title: 'Программы',
      description: 'Курсы, практика и менторинг.',
      icon: '▦',
      editHref: '/admin/settings#learning',
      zoneAfter: 'after_programs',
    },
    {
      id: 'benefits',
      title: 'Что входит',
      description: 'Преимущества и содержание обучения.',
      icon: '✓',
      editHref: '/admin/settings#learning',
      zoneAfter: 'after_benefits',
    },
  ],
  portfolio: [
    {
      id: 'portfolio',
      title: 'Галерея портфолио',
      description: 'Категории, порядок и видимость фотографий.',
      icon: '🖼️',
      editHref: '/admin/portfolio',
      zoneAfter: 'after_portfolio',
    },
  ],
  contact: [
    {
      id: 'contact',
      title: 'Контакты',
      description: 'Адрес, телефон, карта и реквизиты.',
      icon: '📞',
      editHref: '/admin/settings#contacts',
      zoneAfter: 'after_contact',
    },
  ],
};

export function getPageZones(pageSlug: string) {
  const sections = SYSTEM_SECTIONS[pageSlug] ?? [];
  return [
    { value: 'before_main', label: 'Перед основным содержимым' },
    ...sections.map((section) => ({
      value: section.zoneAfter,
      label: `После «${section.title}»`,
    })),
    { value: 'after_main', label: 'После основного содержимого' },
  ];
}

export const BLOCK_LIBRARY: Array<{
  type: PageBlockType;
  title: string;
  description: string;
  icon: string;
}> = [
  { type: 'heading', title: 'Заголовок', description: 'Заголовок UA и PL', icon: 'H' },
  { type: 'text', title: 'Текст', description: 'Абзац или описание', icon: '¶' },
  { type: 'image', title: 'Фото', description: 'Изображение из R2', icon: '🖼️' },
  { type: 'video', title: 'Видео', description: 'MP4 или WebM из R2', icon: '▶' },
  { type: 'button', title: 'Кнопка', description: 'Ссылка с подписью', icon: '↗' },
  { type: 'spacer', title: 'Отступ', description: 'Вертикальное пространство', icon: '↕' },
];

export function createDefaultBlock(
  type: PageBlockType,
  pageSlug: string,
  sortOrder: number
): Omit<PageBlock, 'id'> {
  const firstZone = getPageZones(pageSlug)[0]?.value ?? 'before_main';

  const base = {
    page_slug: pageSlug,
    zone: firstZone,
    block_type: type,
    name: BLOCK_LIBRARY.find((item) => item.type === type)?.title ?? 'Блок',
    sort_order: sortOrder,
    is_visible: true,
    styles: {
      align: 'center' as const,
      width: 'normal' as const,
      background: 'transparent' as const,
    },
  };

  switch (type) {
    case 'heading':
      return { ...base, content: { title_uk: 'Новий заголовок', title_pl: 'Nowy tytuł' } };
    case 'text':
      return { ...base, content: { text_uk: 'Новий текст', text_pl: 'Nowy tekst' } };
    case 'image':
      return { ...base, content: { media_url: '', alt_uk: '', alt_pl: '' } };
    case 'video':
      return { ...base, content: { media_url: '' } };
    case 'button':
      return {
        ...base,
        content: {
          button_label_uk: 'Дізнатися більше',
          button_label_pl: 'Dowiedz się więcej',
          button_href: '/',
        },
      };
    case 'spacer':
      return { ...base, content: { height: 64 } };
  }
}
