import { createPublicSiteCustomBlock } from "./custom-block-registry.ts";
import type { PublicSiteCoreBlockPresetId, PublicSiteCustomBlock, PublicSiteCustomBlockKind } from "./types.ts";

export type CoreBlockCategory = "Business" | "Social proof" | "Content" | "Conversion" | "Advanced";
export type CoreBlockPreset = { id: PublicSiteCoreBlockPresetId; category: CoreBlockCategory; label: string; description: string; kind: PublicSiteCustomBlockKind };

export const PUBLIC_SITE_CORE_BLOCK_LIBRARY: readonly CoreBlockPreset[] = [
  { id: "about", category: "Business", label: "About", description: "Tell your story with editable text and media.", kind: "media_text" },
  { id: "services", category: "Business", label: "Services", description: "Present your main services in clear editable cards.", kind: "columns" },
  { id: "team", category: "Business", label: "Team", description: "Introduce team members with names, roles and photos.", kind: "columns" },
  { id: "pricing", category: "Business", label: "Pricing / Packages", description: "Compare packages, prices and next-step actions.", kind: "columns" },
  { id: "contact", category: "Business", label: "Contact", description: "Share contact details and guide visitors to get in touch.", kind: "media_text" },
  { id: "portfolio", category: "Social proof", label: "Portfolio", description: "Show selected work in an editable media collection.", kind: "collage" },
  { id: "gallery", category: "Social proof", label: "Gallery", description: "Create a visual gallery from editable images.", kind: "slider" },
  { id: "reviews", category: "Social proof", label: "Reviews", description: "Build trust with editable client testimonials.", kind: "columns" },
  { id: "faq", category: "Social proof", label: "FAQ", description: "Answer common client questions in structured cards.", kind: "columns" },
  { id: "text", category: "Content", label: "Text", description: "Add a rich heading and body text with shared typography.", kind: "text" },
  { id: "text-media", category: "Content", label: "Text + Media", description: "Place rich text beside an editable image or video.", kind: "media_text" },
  { id: "cards", category: "Content", label: "Cards", description: "Organize related information into editable cards.", kind: "columns" },
  { id: "video", category: "Content", label: "Video", description: "Add YouTube, Vimeo or a hosted video with a poster.", kind: "video" },
  { id: "cta", category: "Conversion", label: "Call to Action / CTA", description: "Invite visitors to act with the unified button editor.", kind: "cta" },
  { id: "html-embed", category: "Advanced", label: "HTML / Embed", description: "Add safe custom markup or an external HTTPS widget.", kind: "html_embed" },
  { id: "spacer-divider", category: "Advanced", label: "Spacer / Divider", description: "Add controlled spacing or a subtle divider.", kind: "spacer" },
];

const card = (id: string, n: number, title: string, text: string) => ({ id: `${id}-card-${n}`, title, text, media_type: "none" as const });

export function createPublicSiteCoreBlockPreset(presetId: PublicSiteCoreBlockPresetId, id = `block-${Date.now()}`): PublicSiteCustomBlock {
  const preset = PUBLIC_SITE_CORE_BLOCK_LIBRARY.find(item => item.id === presetId) ?? PUBLIC_SITE_CORE_BLOCK_LIBRARY[9];
  const base = createPublicSiteCustomBlock(preset.kind, id);
  const variants: Partial<Record<PublicSiteCoreBlockPresetId, Partial<PublicSiteCustomBlock>>> = {
    about: { eyebrow: "О НАС", title: "История, которой мы гордимся", text: "Расскажите, для кого вы работаете, во что верите и чем ваш подход отличается.", button_label: "Связаться", button_url: "#contact" },
    services: { eyebrow: "УСЛУГИ", title: "Чем мы можем помочь", text: "Выберите подходящее направление.", cards: [card(id,1,"Основная услуга","Коротко опишите результат для клиента."),card(id,2,"Дополнительная услуга","Объясните, кому подходит это предложение."),card(id,3,"Индивидуальное решение","Предложите связаться для деталей.")] },
    team: { eyebrow: "КОМАНДА", title: "Люди, которые создают результат", cards: [card(id,1,"Имя специалиста","Роль и короткая профессиональная история."),card(id,2,"Имя специалиста","Роль и область экспертизы."),card(id,3,"Имя специалиста","Роль и сильная сторона.")] },
    pricing: { eyebrow: "ЦЕНЫ И ПАКЕТЫ", title: "Выберите подходящий формат", cards: [card(id,1,"Базовый · от 100","Что входит в пакет и для кого он подходит."),card(id,2,"Оптимальный · от 250","Самый популярный набор услуг."),card(id,3,"Премиум · по запросу","Индивидуальный объём и сопровождение.")], button_label: "Уточнить детали", button_url: "#contact" },
    contact: { eyebrow: "КОНТАКТЫ", title: "Давайте обсудим ваш запрос", text: "Телефон: +380 00 000 00 00\nEmail: hello@example.com\nАдрес и часы работы можно указать здесь.", button_label: "Написать нам", button_url: "#contact", media_type: "calendar" },
    portfolio: { eyebrow: "ПОРТФОЛИО", title: "Избранные проекты", text: "Покажите лучшие работы и результаты для клиентов." },
    gallery: { eyebrow: "ГАЛЕРЕЯ", title: "Посмотрите, как это выглядит", text: "Замените примеры своими фотографиями." },
    reviews: { eyebrow: "ОТЗЫВЫ", title: "Что говорят клиенты", cards: [card(id,1,"Имя клиента","Опишите конкретный положительный опыт и результат."),card(id,2,"Имя клиента","Добавьте честный отзыв о сотрудничестве."),card(id,3,"Имя клиента","Расскажите, почему клиент рекомендует вас.")] },
    faq: { eyebrow: "FAQ", title: "Частые вопросы", cards: [card(id,1,"Как начать?","Оставьте заявку — мы уточним задачу и предложим следующий шаг."),card(id,2,"Сколько это занимает?","Укажите обычные сроки или формат работы."),card(id,3,"Что входит в стоимость?","Перечислите основные составляющие предложения.")] },
    cards: { eyebrow: "КАРТОЧКИ", title: "Важное по пунктам" },
  };
  return { ...base, ...(variants[presetId] ?? {}), id, preset_id: presetId };
}
