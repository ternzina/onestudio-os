export type HomeCarouselSettings = {
  enabled: boolean;
  autoplay_delay_ms: number;
};

export type HomeCarouselSlide = {
  id: string;
  image_url: string;
  title_uk: string;
  title_pl: string;
  text_uk: string;
  text_pl: string;
  alt_uk: string;
  alt_pl: string;
  is_active: boolean;
  sort_order: number;
};

export const fallbackHomeCarouselSettings: HomeCarouselSettings = {
  enabled: false,
  autoplay_delay_ms: 5000,
};

export const normalizeCarouselDelay = (value: number) =>
  Math.min(12000, Math.max(2000, Number(value) || 5000));
