import { components as englishComponents } from "../en/components";

export const components = {
  ...englishComponents,
  page: { eyebrow: "КОМПОНЕНТИ", titleBefore: "Більше способів", titleAccent: "показати ваш бізнес.", lead: "Готові блоки, інтерактивні елементи та візуальні ефекти для сторінок OneStudio.", catalogEyebrow: "БІБЛІОТЕКА", catalogTitle: "Оберіть потрібний будівельний блок.", catalogLead: "Живі прев’ю реальних компонентів із поточної бібліотеки OneStudio.", categoryLabel: "Категорії компонентів", all: "Усі", previewLabel: "Попередній перегляд" },
  categories: { hero: "Перший екран", galleries: "Галереї", "social-proof": "Відгуки", forms: "Форми / Лист очікування", motion: "Рух і ефекти" },
  items: { gallery: { label: "Галерея", description: "Кругова галерея з перетягуванням та інерцією." }, motion: { label: "Рух", description: "Похила сітка колонок із зображеннями, що рухаються під час прокручування." }, waitlist: { label: "Лист очікування", description: "Форма раннього доступу поруч із живою стрічкою зображень." }, hero: { label: "Перший екран", description: "Перший екран із візуальною сценою, зміною кадрів і світловим слідом." }, "social-proof": { label: "Відгуки", description: "Послідовність відгуків з аватарами та плавною зміною станів." } },
} as const;
