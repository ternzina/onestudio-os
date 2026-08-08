import type {
  PublicSiteColumnCard,
  PublicSiteCustomBlock,
  PublicSiteCustomBlockKind,
  PublicSiteMediaPosition,
} from "./types";

export type PublicSiteCustomBlockDefinition = {
  kind: PublicSiteCustomBlockKind;
  label: string;
  description: string;
  premiumSupported: boolean;
};

export type PublicSiteCustomBlockLibraryItem = PublicSiteCustomBlockDefinition & {
  id: string;
  mediaPosition?: PublicSiteMediaPosition;
};

export const PUBLIC_SITE_CUSTOM_BLOCK_REGISTRY = [
  { kind: "text", label: "Text block", description: "A free heading and text section.", premiumSupported: true },
  { kind: "features", label: "Feature cards", description: "Three or more editable advantages.", premiumSupported: false },
  { kind: "cta", label: "Call to action", description: "Text with a button and link.", premiumSupported: false },
  { kind: "media_text", label: "Text + image or video", description: "A split section with media on the left or right.", premiumSupported: true },
  { kind: "columns", label: "Two or three columns", description: "A row of two or three editable content cards.", premiumSupported: true },
  { kind: "slider", label: "Image slider", description: "Automatic slides with an interval from two seconds.", premiumSupported: false },
  { kind: "collage", label: "Коллаж", description: "Несколько фотографий слева, по центру или справа.", premiumSupported: false },
  { kind: "video", label: "Video block", description: "YouTube, Vimeo or a direct video file.", premiumSupported: false },
] as const satisfies readonly PublicSiteCustomBlockDefinition[];

export const PREMIUM_UNIVERSAL_BLOCK_LIBRARY: readonly PublicSiteCustomBlockLibraryItem[] = [
  { ...PUBLIC_SITE_CUSTOM_BLOCK_REGISTRY[0], id: "text", label: "Текстовый блок" },
  { ...PUBLIC_SITE_CUSTOM_BLOCK_REGISTRY[3], id: "text-image", label: "Текст + изображение", mediaPosition: "right" },
  { ...PUBLIC_SITE_CUSTOM_BLOCK_REGISTRY[3], id: "image-text", label: "Изображение + текст", mediaPosition: "left" },
  { ...PUBLIC_SITE_CUSTOM_BLOCK_REGISTRY[4], id: "columns-3", label: "Две или три колонки" },
] as const;

export function defaultPublicSiteColumnCards(blockId: string): PublicSiteColumnCard[] {
  return [1, 2, 3].map((number) => ({
    id: `${blockId}-card-${number}`,
    title: `${number === 1 ? "Первый" : number === 2 ? "Второй" : "Третий"} блок`,
    text: "Добавьте короткое описание",
    media_type: "none",
  }));
}

export function publicSiteBlockColumnCards(block: PublicSiteCustomBlock): PublicSiteColumnCard[] {
  if (block.cards?.length) return block.cards;
  const cards = block.items.split("\n").map((item, index) => {
    const [title, ...detail] = item.split("·");
    return { id: `${block.id}-card-${index + 1}`, title: title.trim(), text: detail.join("·").trim(), media_type: "none" as const };
  }).filter(card => card.title || card.text);
  return cards.length ? cards : defaultPublicSiteColumnCards(block.id);
}

export function createPublicSiteCustomBlock(kind: PublicSiteCustomBlockKind, id = `block-${Date.now()}`, mediaPosition?: PublicSiteMediaPosition): PublicSiteCustomBlock {
  const presets: Record<PublicSiteCustomBlockKind, Pick<PublicSiteCustomBlock, "eyebrow" | "title" | "text" | "items" | "button_label">> = {
    text: { eyebrow: "НОВЫЙ БЛОК", title: "Расскажите о важном", text: "Добавьте сюда собственный текст. Этот блок можно использовать для истории, условий или любого сообщения.", items: "", button_label: "" },
    features: { eyebrow: "ПРЕИМУЩЕСТВА", title: "Почему выбирают нас", text: "", items: "Первое преимущество · Короткое пояснение\nВторое преимущество · Короткое пояснение\nТретье преимущество · Короткое пояснение", button_label: "" },
    cta: { eyebrow: "СЛЕДУЮЩИЙ ШАГ", title: "Готовы записаться?", text: "Добавьте короткое приглашение и ведите посетителя на нужную страницу.", items: "", button_label: "Перейти" },
    slider: { eyebrow: "ГАЛЕРЕЯ", title: "Слайды с фотографиями", text: "Изображения меняются автоматически. Интервал можно настроить от двух секунд.", items: "", button_label: "" },
    collage: { eyebrow: "КОЛЛАЖ", title: "История в нескольких кадрах", text: "Соберите выразительный коллаж из нескольких фотографий.", items: "", button_label: "" },
    video: { eyebrow: "ВИДЕО", title: "Покажите атмосферу", text: "Добавьте ссылку на YouTube, Vimeo или прямую ссылку на видеофайл.", items: "", button_label: "" },
    media_text: { eyebrow: "О СТУДИИ", title: "Текст и изображение рядом", text: "Расскажите о студии, услуге или мастере. Медиа можно расположить слева или справа.", items: "", button_label: "Подробнее" },
    columns: { eyebrow: "ВАЖНОЕ", title: "Два или три смысловых блока", text: "Соберите короткий раздел из нескольких аккуратных карточек.", items: "Первый блок · Добавьте короткое описание\nВторой блок · Добавьте короткое описание\nТретий блок · Добавьте короткое описание", button_label: "" },
  };
  const preset = presets[kind];
  const hasMedia = ["slider", "collage", "video", "media_text"].includes(kind);
  return {
    id, kind, ...preset,
    button_url: kind === "cta" || kind === "media_text" ? "#booking" : "",
    tone: kind === "cta" ? "accent" : "light",
    is_visible: true,
    media_urls: kind === "slider" || kind === "collage" ? ["/templates/gloss/gloss-gallery-1.webp", "/templates/gloss/gloss-gallery-2.webp", ...(kind === "collage" ? ["/templates/gloss/gloss-gallery-3.webp"] : [])] : undefined,
    slide_interval_seconds: kind === "slider" ? 4 : undefined,
    video_url: kind === "video" ? "" : undefined,
    video_poster_url: kind === "video" ? "" : undefined,
    media_url: kind === "media_text" ? "/templates/gloss/gloss-gallery-4.webp" : undefined,
    media_alt: kind === "media_text" ? "Интерьер и работа студии" : undefined,
    media_type: kind === "media_text" ? "image" : undefined,
    media_position: kind === "media_text" ? mediaPosition ?? "right" : kind === "collage" ? "center" : undefined,
    columns_count: kind === "columns" ? 3 : undefined,
    cards: kind === "columns" ? defaultPublicSiteColumnCards(id) : undefined,
    media_size: hasMedia ? "wide" : undefined,
    media_aspect: hasMedia ? "landscape" : undefined,
    media_fit: hasMedia ? "cover" : undefined,
    media_frame: hasMedia ? "line" : undefined,
    content_width: "wide", padding_top: "normal", padding_bottom: "normal", section_height: "auto",
    media_height: hasMedia ? "auto" : undefined, animation: "none", animate_on_mobile: true,
  };
}

export function clonePublicSiteCustomBlock(block: PublicSiteCustomBlock, nextId: string): PublicSiteCustomBlock {
  return {
    ...JSON.parse(JSON.stringify(block)) as PublicSiteCustomBlock,
    id: nextId,
    cards: block.cards?.map((card, index) => ({ ...card, id: `${nextId}-card-${index + 1}` })),
  };
}
