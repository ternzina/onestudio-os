import type { PublicSiteContent, PublicSiteCustomBlock, PublicSiteCustomBlockKind, PublicSiteMediaPosition, PublicSiteTypography } from "@/lib/public-site/types";
import { clonePublicSiteCustomBlock, createPublicSiteCustomBlock } from "@/lib/public-site/custom-block-registry";

export const PREMIUM_KIDS_TEMPLATE_KEY = "premium-kids-center" as const;

export type PremiumKidsSemanticBlockType = "header" | "hero" | "intro" | "approach" | "schedule" | "teachers" | "gallery" | "reviews" | "faq" | "programs" | "final" | "footer";
export type PremiumKidsUniversalBlockType = Extract<PublicSiteCustomBlockKind, "text" | "media_text" | "columns">;
export type PremiumKidsBlockType = PremiumKidsSemanticBlockType | PremiumKidsUniversalBlockType;

type PremiumKidsLegacyContent = {
  hidden_sections: string[];
  heading_typography: Record<string, PublicSiteTypography>;
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

export type PremiumKidsEditableKey = Exclude<keyof PremiumKidsLegacyContent, "hidden_sections" | "heading_typography">;
export type PremiumKidsBlockProps = Partial<Record<PremiumKidsEditableKey, string | string[]>> & { heading_typography?: PublicSiteTypography; universal_block?: PublicSiteCustomBlock };
export type PremiumKidsBlock = { id: string; type: PremiumKidsBlockType; visible: boolean; props: PremiumKidsBlockProps };
export type PremiumKidsContent = PremiumKidsLegacyContent & { blocks: PremiumKidsBlock[] };

export type PremiumKidsBlockDefinition = {
  type: PremiumKidsBlockType;
  label: string;
  description: string;
  defaultId: string;
  fieldKeys: readonly PremiumKidsEditableKey[];
  capabilities: { add: boolean; reorder: boolean; duplicate: boolean; delete: boolean; visibility: boolean; reset: boolean; typography: boolean };
};

const editable = { add: true, reorder: true, duplicate: true, delete: true, visibility: true, reset: true, typography: false } as const;
const required = { add: false, reorder: false, duplicate: false, delete: false, visibility: false, reset: true, typography: false } as const;

export const PREMIUM_KIDS_BLOCK_REGISTRY: readonly PremiumKidsBlockDefinition[] = [
  { type: "header", label: "Header / Brand", description: "Логотип, название и глобальная подпись", defaultId: "bembi-header", fieldKeys: ["brand_name", "brand_tagline"], capabilities: required },
  { type: "hero", label: "Hero", description: "Обязательный первый экран и основные действия", defaultId: "bembi-hero", fieldKeys: ["hero_eyebrow", "hero_title", "hero_description", "primary_cta_label", "secondary_cta_label"], capabilities: { ...required, typography: true } },
  { type: "intro", label: "Intro", description: "Позиционирование и возрастной навигатор", defaultId: "bembi-intro", fieldKeys: ["intro_eyebrow", "intro_title", "intro_description", "age_groups"], capabilities: editable },
  { type: "approach", label: "Approach", description: "Принципы образовательного подхода", defaultId: "bembi-approach", fieldKeys: ["approach_title", "approach_items"], capabilities: editable },
  { type: "schedule", label: "Schedule", description: "Заголовок и пояснение расписания", defaultId: "bembi-schedule", fieldKeys: ["schedule_title", "schedule_description"], capabilities: editable },
  { type: "teachers", label: "Teachers", description: "Команда и путь первого занятия", defaultId: "bembi-teachers", fieldKeys: ["teachers_title", "teachers"], capabilities: editable },
  { type: "gallery", label: "Gallery", description: "Галерея и подписи", defaultId: "bembi-gallery", fieldKeys: ["gallery_title", "gallery_captions"], capabilities: editable },
  { type: "reviews", label: "Reviews", description: "Отзывы родителей", defaultId: "bembi-reviews", fieldKeys: ["reviews_title", "reviews"], capabilities: editable },
  { type: "faq", label: "FAQ", description: "Вопросы и ответы", defaultId: "bembi-faq", fieldKeys: ["faq_title", "faq"], capabilities: editable },
  { type: "programs", label: "Programs", description: "Программы центра и образовательная среда", defaultId: "bembi-programs", fieldKeys: ["programs_title", "programs_description"], capabilities: editable },
  { type: "final", label: "Final CTA", description: "Финальный призыв к действию", defaultId: "bembi-final", fieldKeys: ["final_cta_eyebrow", "final_cta_title", "final_cta_label"], capabilities: editable },
  { type: "footer", label: "Footer", description: "Описание и контакты", defaultId: "bembi-footer", fieldKeys: ["footer_description", "contact_email", "contact_phone", "contact_address"], capabilities: required },
  { type: "text", label: "Текстовый блок", description: "Свободный заголовок и rich text в стиле BEMBI", defaultId: "bembi-text", fieldKeys: [], capabilities: { ...editable, typography: true } },
  { type: "media_text", label: "Текст и изображение", description: "BEMBI-композиция с изображением слева или справа", defaultId: "bembi-media-text", fieldKeys: [], capabilities: { ...editable, typography: true } },
  { type: "columns", label: "Две или три колонки", description: "Редактируемые карточки в визуальной системе BEMBI", defaultId: "bembi-columns", fieldKeys: [], capabilities: { ...editable, typography: true } },
] as const;

export const DEFAULT_PREMIUM_KIDS_CONTENT: PremiumKidsLegacyContent = {
  hidden_sections: [], heading_typography: {}, brand_name: "BEMBI", brand_tagline: "Discovery Platform", hero_eyebrow: "Learning ecosystem · Warszawa / online", hero_title: "Место для\nбольших\nоткрытий", hero_description: "Программы, в которых детям интересно расти, исследовать и открывать новое.", primary_cta_label: "Найти занятие", secondary_cta_label: "Открыть библиотеку заданий", intro_eyebrow: "Программы по возрастам", intro_title: "Интерес растёт вместе с ребёнком", intro_description: "Выберите возраст — мы покажем направления, в которых сейчас будет особенно интересно.", programs_title: "Живые занятия — часть большой экосистемы", programs_description: "Выберите возраст и день. После занятия ребёнок может продолжить тему дома с материалами платформы.",
  age_groups: ["2–3 · Раннее развитие · Музыка и движение · Сенсорная мастерская", "4–5 · Творчество · Английский язык · Театральная студия", "6–7 · Подготовка к школе · Математика · Научная лаборатория", "8–10 · Юный исследователь · Арт-лаборатория · Семейные мастер-классы"],
  approach_title: "Маршрут, где каждый шаг имеет смысл", approach_items: ["Маленькие группы — до восьми детей, чтобы слышать каждого.", "Интерес ведёт — сначала вопрос и любопытство, затем навык.", "Без перегрузки — концентрация, движение и паузы в естественном ритме.", "Безопасная среда — материалы по возрасту и понятные правила.", "Связь с родителями — короткая обратная связь после занятия."], schedule_title: "Неделя, в которой есть место новому", schedule_description: "Выберите день и посмотрите занятия, возраст и наличие мест.", teachers_title: "Люди, рядом с которыми интересно пробовать", teachers: ["Елена Новак · Педагог и автор программ", "Ян Левандовский · Science & making mentor", "Марта Ковальска · Художник-педагог", "Оливия Вишневска · Музыка, движение и язык"], gallery_title: "Не постановка. Настоящий процесс открытия", gallery_captions: ["Большой формат", "Сначала вопрос", "Вместе", "Движение и ритм", "Пространство"], reviews_title: "Спокойствие тоже можно почувствовать", reviews: ["Здесь не торопят с ответом. Ребёнок возвращается домой не уставшим, а с новым вопросом. · мама Леи", "Нам спокойно объяснили, как устроена программа и почему именно этот темп сейчас подходит. · семья Марека", "После лаборатории опыт продолжился дома — и впервые это была идея ребёнка. · папа Нины"], faq_title: "Перед первым визитом", faq: ["С какого возраста можно посещать занятия? · Программы начинаются с двух лет.", "Можно ли прийти на пробное занятие? · Да, чтобы познакомиться с педагогом и группой.", "Сколько детей в группе? · Обычно от пяти до восьми.", "Как выбрать программу? · Начните с возраста и текущего интереса."], final_cta_eyebrow: "BEMBI · Kids Discovery Platform", final_cta_title: "Первое открытие начинается\nс одного занятия.", final_cta_label: "Записаться на пробное занятие", footer_description: "Образовательная экосистема, где дети учатся через практику, игру, эксперименты и творчество.", contact_email: "", contact_phone: "", contact_address: "",
};

const definitionMap = new Map(PREMIUM_KIDS_BLOCK_REGISTRY.map((definition) => [definition.type, definition]));
const requiredTypes = new Set<PremiumKidsBlockType>(["header", "hero", "footer"]);
export function isPremiumKidsUniversalBlockType(type: PremiumKidsBlockType): type is PremiumKidsUniversalBlockType { return type === "text" || type === "media_text" || type === "columns"; }

function cloneValue<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function strings(value: unknown, fallback: string[]) { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, 32) : cloneValue(fallback); }
function isTypography(value: unknown): value is PublicSiteTypography { return Boolean(value && typeof value === "object" && !Array.isArray(value)); }

function resolveLegacy(source: Record<string, unknown>, content?: PublicSiteContent): PremiumKidsLegacyContent {
  const result = cloneValue(DEFAULT_PREMIUM_KIDS_CONTENT);
  for (const key of Object.keys(result) as Array<keyof PremiumKidsLegacyContent>) {
    const value = source[key];
    if (key === "heading_typography") result.heading_typography = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, PublicSiteTypography> : {};
    else if (key === "hidden_sections") result.hidden_sections = strings(value, []);
    else if (Array.isArray(result[key])) (result as Record<string, unknown>)[key] = strings(value, result[key] as string[]);
    else if (typeof value === "string") (result as Record<string, unknown>)[key] = value;
  }
  if (!source.brand_name && content?.brand_name) result.brand_name = content.brand_name;
  return result;
}

export function getPremiumKidsBlockDefinition(type: PremiumKidsBlockType) { return definitionMap.get(type)!; }

export function createPremiumKidsDefaultBlock(type: PremiumKidsBlockType, legacy: PremiumKidsLegacyContent = DEFAULT_PREMIUM_KIDS_CONTENT, id = getPremiumKidsBlockDefinition(type).defaultId, mediaPosition?: PublicSiteMediaPosition): PremiumKidsBlock {
  const definition = getPremiumKidsBlockDefinition(type);
  const props: PremiumKidsBlockProps = {};
  if (type === "text" || type === "media_text" || type === "columns") {
    props.universal_block = createPublicSiteCustomBlock(type, id, mediaPosition);
    if (type === "media_text") {
      props.universal_block.media_url = "/images/demos/premium-kids-center/studio-interior.webp";
      props.universal_block.media_alt = "Пространство детского центра BEMBI";
    }
  }
  for (const key of definition.fieldKeys) props[key] = cloneValue(legacy[key]) as string | string[];
  const typography = legacy.heading_typography[type];
  if (typography) props.heading_typography = cloneValue(typography);
  return { id, type, visible: !legacy.hidden_sections.includes(type), props };
}

export function createDefaultPremiumKidsBlocks(legacy: PremiumKidsLegacyContent = DEFAULT_PREMIUM_KIDS_CONTENT) { return PREMIUM_KIDS_BLOCK_REGISTRY.filter((definition) => !isPremiumKidsUniversalBlockType(definition.type)).map((definition) => createPremiumKidsDefaultBlock(definition.type, legacy)); }

function normalizeBlocks(raw: unknown[], legacy: PremiumKidsLegacyContent) {
  const used = new Set<string>();
  const seenRequired = new Set<PremiumKidsBlockType>();
  const blocks = raw.slice(0, 64).flatMap((item, index): PremiumKidsBlock[] => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const source = item as Record<string, unknown>;
    if (typeof source.type !== "string" || !definitionMap.has(source.type as PremiumKidsBlockType)) return [];
    const type = source.type as PremiumKidsBlockType;
    if (requiredTypes.has(type) && seenRequired.has(type)) return [];
    if (requiredTypes.has(type)) seenRequired.add(type);
    let id = typeof source.id === "string" && /^[a-zA-Z0-9][a-zA-Z0-9_-]{1,79}$/.test(source.id) ? source.id : `${type}-${index + 1}`;
    while (used.has(id)) id = `${id}-${index + 1}`;
    used.add(id);
    const defaults = createPremiumKidsDefaultBlock(type, legacy, id);
    const rawProps = source.props && typeof source.props === "object" && !Array.isArray(source.props) ? source.props as Record<string, unknown> : {};
    for (const key of getPremiumKidsBlockDefinition(type).fieldKeys) {
      const fallback = defaults.props[key]; const value = rawProps[key];
      if (Array.isArray(fallback)) defaults.props[key] = strings(value, fallback);
      else if (typeof value === "string") defaults.props[key] = value;
    }
    if (isTypography(rawProps.heading_typography)) defaults.props.heading_typography = rawProps.heading_typography;
    if ((type === "text" || type === "media_text" || type === "columns") && rawProps.universal_block && typeof rawProps.universal_block === "object" && !Array.isArray(rawProps.universal_block)) {
      const universal = rawProps.universal_block as PublicSiteCustomBlock;
      if (universal.kind === type) defaults.props.universal_block = { ...createPublicSiteCustomBlock(type, id), ...cloneValue(universal), id, kind: type };
    }
    return [{ ...defaults, id, visible: requiredTypes.has(type) ? true : source.visible !== false }];
  });
  for (const type of ["header", "hero", "footer"] as const) if (!blocks.some((block) => block.type === type)) blocks.push(createPremiumKidsDefaultBlock(type, legacy));
  const header = blocks.find((block) => block.type === "header")!; const hero = blocks.find((block) => block.type === "hero")!; const footer = blocks.find((block) => block.type === "footer")!;
  return [header, hero, ...blocks.filter((block) => block !== header && block !== hero && block !== footer), footer];
}

function flattenBlocks(legacy: PremiumKidsLegacyContent, blocks: PremiumKidsBlock[]) {
  const result = cloneValue(legacy);
  result.hidden_sections = blocks.filter((block) => !block.visible).map((block) => block.id);
  result.heading_typography = {};
  for (const definition of PREMIUM_KIDS_BLOCK_REGISTRY) {
    const block = blocks.find((candidate) => candidate.type === definition.type);
    if (!block) continue;
    for (const key of definition.fieldKeys) if (block.props[key] !== undefined) (result as Record<string, unknown>)[key] = cloneValue(block.props[key]);
    if (block.props.heading_typography) result.heading_typography[block.id] = cloneValue(block.props.heading_typography);
  }
  return result;
}

export function resolvePremiumKidsContent(content?: PublicSiteContent): PremiumKidsContent {
  const raw = content?.template_content?.[PREMIUM_KIDS_TEMPLATE_KEY];
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : {};
  const legacy = resolveLegacy(source, content);
  const blocks = Array.isArray(source.blocks) ? normalizeBlocks(source.blocks, legacy) : createDefaultPremiumKidsBlocks(legacy);
  return { ...flattenBlocks(legacy, blocks), blocks };
}

export function premiumKidsContentForBlock(content: PremiumKidsContent, block: PremiumKidsBlock): PremiumKidsContent {
  const next = { ...content, heading_typography: block.props.heading_typography ? { [block.id]: block.props.heading_typography, [block.type]: block.props.heading_typography } : {}, blocks: content.blocks };
  for (const [key, value] of Object.entries(block.props)) if (key !== "heading_typography") (next as unknown as Record<string, unknown>)[key] = value;
  return next;
}

export function replacePremiumKidsBlocks(content: PremiumKidsContent, blocks: PremiumKidsBlock[]): PremiumKidsContent { return { ...flattenBlocks(content, blocks), blocks }; }
export function movePremiumKidsBlock(content: PremiumKidsContent, sourceId: string, targetId: string) { const blocks = [...content.blocks]; const from = blocks.findIndex((block) => block.id === sourceId); const to = blocks.findIndex((block) => block.id === targetId); if (from < 2 || to < 2 || from >= blocks.length - 1 || to >= blocks.length - 1 || from === to || !getPremiumKidsBlockDefinition(blocks[from].type).capabilities.reorder || !getPremiumKidsBlockDefinition(blocks[to].type).capabilities.reorder) return content; const [moved] = blocks.splice(from, 1); blocks.splice(to, 0, moved); return replacePremiumKidsBlocks(content, blocks); }
export function duplicatePremiumKidsBlock(content: PremiumKidsContent, blockId: string, newId: string) { const index = content.blocks.findIndex((block) => block.id === blockId); if (index < 0 || !getPremiumKidsBlockDefinition(content.blocks[index].type).capabilities.duplicate || content.blocks.some((block) => block.id === newId)) return content; const copy = { ...cloneValue(content.blocks[index]), id: newId }; if (copy.props.universal_block) copy.props.universal_block = clonePublicSiteCustomBlock(copy.props.universal_block, newId); const blocks = [...content.blocks]; blocks.splice(index + 1, 0, copy); return replacePremiumKidsBlocks(content, blocks); }
export function addPremiumKidsBlock(content: PremiumKidsContent, type: PremiumKidsBlockType, id: string, mediaPosition?: PublicSiteMediaPosition) { const definition = getPremiumKidsBlockDefinition(type); if (!definition.capabilities.add || content.blocks.some((block) => block.id === id)) return content; const blocks = [...content.blocks]; blocks.splice(blocks.length - 1, 0, createPremiumKidsDefaultBlock(type, DEFAULT_PREMIUM_KIDS_CONTENT, id, mediaPosition)); return replacePremiumKidsBlocks(content, blocks); }
export function deletePremiumKidsBlock(content: PremiumKidsContent, blockId: string) { const block = content.blocks.find((candidate) => candidate.id === blockId); if (!block || !getPremiumKidsBlockDefinition(block.type).capabilities.delete) return content; return replacePremiumKidsBlocks(content, content.blocks.filter((candidate) => candidate.id !== blockId)); }
export function setPremiumKidsBlockVisibility(content: PremiumKidsContent, blockId: string, visible: boolean) { const block = content.blocks.find((candidate) => candidate.id === blockId); if (!block || !getPremiumKidsBlockDefinition(block.type).capabilities.visibility) return content; return replacePremiumKidsBlocks(content, content.blocks.map((candidate) => candidate.id === blockId ? { ...candidate, visible } : candidate)); }
export function resetPremiumKidsBlock(content: PremiumKidsContent, blockId: string) { const block = content.blocks.find((candidate) => candidate.id === blockId); if (!block) return content; const reset = createPremiumKidsDefaultBlock(block.type, DEFAULT_PREMIUM_KIDS_CONTENT, block.id, block.props.universal_block?.media_position); reset.visible = block.visible; return replacePremiumKidsBlocks(content, content.blocks.map((candidate) => candidate.id === blockId ? reset : candidate)); }
export function restoreOriginalPremiumKidsContent() { const blocks = createDefaultPremiumKidsBlocks(); return { ...cloneValue(DEFAULT_PREMIUM_KIDS_CONTENT), blocks } as PremiumKidsContent; }

export function withPremiumKidsContent(content: PublicSiteContent, premium: PremiumKidsContent): PublicSiteContent {
  return { ...content, brand_name: premium.brand_name, template_content: { ...(content.template_content ?? {}), [PREMIUM_KIDS_TEMPLATE_KEY]: premium } };
}
