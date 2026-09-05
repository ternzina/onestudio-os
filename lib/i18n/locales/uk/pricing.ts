import { pricing as englishPricing } from "../en/pricing";

export const pricing = {
  ...englishPricing,
  hero: { eyebrow: "ТАРИФИ", title: ["Оберіть тариф", "для своїх задач"], lead: "Тарифи для різних потреб і бюджетів." },
  plansHeading: "Тарифи OneStudio", plansSupporting: "14 днів безкоштовно на тарифах OneStudio.",
  planLabels: { included: "Входить у тариф", storage: "Медіа" },
  plans: {
    site: { ...englishPricing.plans.site, description: "Для сайту, портфоліо та простої присутності бізнесу онлайн.", features: ["Власний сайт", "Візуальний редактор", "Контактні форми та заявки", "Портфоліо / галереї", "Базова аналітика", "10 GB трафіку на місяць"], cta: "Створити сайт" },
    business: { ...englishPricing.plans.business, description: "Усе з Site плюс записи, клієнти, оплати та робочі процеси.", features: ["Усе з Site", "Онлайн-запис", "Розклад", "Послуги та ціни", "Співробітники / ресурси", "CRM / база клієнтів", "Онлайн-оплати / депозити", "Сповіщення / нагадування", "100 GB трафіку на місяць"], cta: "Почати", badge: "Найпопулярніший" },
    pro: { ...englishPricing.plans.pro, description: "Усе з Business плюс більше співробітників / ресурсів, медіа та трафіку.", features: ["Усе з Business", "Більше співробітників / ресурсів", "До 3 сайтів", "100 GB медіа", "500 GB трафіку на місяць"], cta: "Обрати Pro" },
  },
  comparison: {
    ...englishPricing.comparison, title: "Технічні характеристики",
    sectionTitles: { websiteDesign: "САЙТ І ДИЗАЙН", storageTraffic: "СХОВИЩЕ І ТРАФІК", clientWork: "РОБОТА З КЛІЄНТАМИ", teamResources: "КОМАНДА І РЕСУРСИ" },
    rowLabels: { websiteCount: "Кількість сайтів", ssl: "SSL / захищене з’єднання", hosting: "Хостинг сайту", mobile: "Адаптація для мобільних пристроїв", visualEditor: "Візуальний редактор", basicTemplates: "Базові шаблони", basicBlocks: "Базові блоки", imageOptimization: "Оптимізація зображень", media: "Медіа", monthlyTraffic: "Трафік на місяць", contactForms: "Контактні форми та заявки", onlineBooking: "Онлайн-запис", schedule: "Розклад", services: "Послуги та ціни", crm: "CRM / база клієнтів", payments: "Онлайн-оплати / депозити", notifications: "Сповіщення / нагадування", staffResources: "Співробітники / ресурси" },
    valueLabels: { standard: "Стандартний рівень", more: "Більше співробітників / ресурсів" }, yesLabel: "Входить у тариф", noLabel: "Не входить у тариф", priceUnitLabel: "/ місяць", annualPriceLabel: "/ місяць при оплаті за рік",
  },
  billing: { monthly: "Місяць", annual: "Рік", priceUnit: "/ місяць", annualNote: "до 68% вигідніше", annualTotal: "на рік", ariaLabel: "Період оплати" },
  design: { eyebrow: "PREMIUM DESIGN LIBRARY", title: "Premium Design Library", body: "Відкрийте всю бібліотеку преміальних блоків, інтерактивних ефектів та анімацій OneStudio.", priceSuffix: "разово", tagline: "Одна покупка. Вся бібліотека.", note: "Premium Design Library купується окремо й не входить до тарифів або 14-денного безкоштовного періоду.", cta: "Відкрити бібліотеку", items: [{ label: "Premium Blocks", description: "Преміальні будівельні блоки для сторінок і виразних секцій." }, { label: "Premium Effects", description: "Інтерактивні ефекти для потрібного візуального акценту." }, { label: "Premium animations", description: "Анімації та інтерактивні візуальні компоненти OneStudio." }] },
  faq: { eyebrow: "FAQ ПРО ТАРИФИ", title: "Кілька коротких відповідей про тарифи.", more: "Більше відповідей →", compactAriaLabel: "Питання про тарифи", items: [{ question: "Чи є безкоштовний пробний період?", answer: "Так. Тарифи OneStudio можна безкоштовно випробовувати протягом 14 днів." }, { question: "Чи можна підключити власний домен?", answer: "Так. Власний домен доступний на платних тарифах OneStudio." }, { question: "Що буде, якщо сайт перевищить ліміт трафіку?", answer: "OneStudio не вимикає сайт одразу через одноразове перевищення ліміту. Якщо високий трафік стане постійним, можна перейти на інший тариф або додати трафік." }, { question: "Чи можна змінити тариф пізніше?", answer: "Так. Тариф можна змінити разом зі змінами потреб вашого бізнесу." }] },
} as const;
