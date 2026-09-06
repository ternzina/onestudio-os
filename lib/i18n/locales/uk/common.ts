import { common as englishCommon } from "../en/common";

export const common = {
  ...englishCommon,
  languageLabel: "Мова",
  languageNames: { ru: "Русский", en: "English", uk: "Українська", pl: "Polski", de: "Deutsch", es: "Español", fr: "Français", pt: "Português" },
  accessibility: { openLargerPreview: "Відкрити збільшений перегляд", productScreenshot: "Знімок екрана продукту" },
  header: { ...englishCommon.header, navigationLabel: "Навігація OneStudio", menuLabel: "Меню", product: "Продукт", oneStudio: "OneStudio", productMenuLabel: "Меню продукту", oneStudioMenuLabel: "Меню OneStudio", demo: "Обрати демо", features: "Можливості", workflow: "Як це працює", login: "Увійти", openMenu: "Відкрити меню" },
  footer: {
    ...englishCommon.footer,
    navigationLabel: "Навігація OneStudio",
    brandDescription: "Сайт, дизайн та інструменти для вашого проєкту.",
    product: "ПРОДУКТ", oneStudio: "ONESTUDIO", information: "ІНФОРМАЦІЯ",
    links: { features: "Можливості", templates: "Шаблони", components: "Компоненти", pricing: "Тарифи", about: "Про OneStudio", website: "Сайт під ключ", faq: "FAQ", blog: "Журнал", contact: "Контакти", privacy: "Конфіденційність", terms: "Умови" },
    copyright: "© OneStudio OS - усі права захищено",
  },
  legal: { navigationLabel: "Юридична навігація", lastUpdated: "Оновлено" },
  metadata: {
    home: { title: "OneStudio OS - сайт, дизайн і бізнес-система", description: "Сайт, дизайн та робочі модулі для сервісного бізнесу." },
    components: { title: "Компоненти - OneStudio OS", description: "Бібліотека компонентів, блоків і можливостей дизайну OneStudio." },
    about: { title: "Про OneStudio - OneStudio OS", description: "Чому OneStudio поєднує сайт, клієнтів і щоденну роботу в одній системі." },
    blog: { title: "Журнал - OneStudio OS", description: "Нові компоненти, можливості дизайну та оновлення OneStudio: коротко й по суті." },
    contact: { title: "Контакти - OneStudio", description: "Зв’яжіться з OneStudio щодо платформи, тарифів або сайту під ключ." },
    demos: { title: "Шаблони - OneStudio", description: "Готові дизайни сайтів OneStudio для різних проєктів." },
    faq: { title: "FAQ - OneStudio OS", description: "Відповіді про запуск, налаштування та використання OneStudio." },
    features: { title: "Можливості - OneStudio", description: "Сайт, записи, клієнти та робочі інструменти в OneStudio." },
    pricing: { title: "Тарифи - OneStudio OS", description: "Оберіть тариф OneStudio для сайту та робочих модулів." },
    website: { title: "Сайт під ключ - OneStudio OS", description: "Створюємо, налаштовуємо й запускаємо сайт під ключ у OneStudio." },
    privacy: { title: "Політика конфіденційності", description: "Як OneStudio OS збирає, використовує, зберігає та захищає персональні дані, включно з даними Google Calendar." },
    terms: { title: "Умови використання", description: "Умови доступу до бізнес-платформи OneStudio OS та її використання." },
  },
} as const;
