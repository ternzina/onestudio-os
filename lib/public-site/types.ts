export type PublicSiteSection =
  | "services"
  | "portfolio"
  | "booking"
  | "about"
  | "team"
  | "reviews"
  | "membership"
  | "gift"
  | "faq"
  | "safety"
  | "contact";

export type PublicSiteCanvasSection = "hero" | PublicSiteSection;
export type PublicSiteBlockColorMode = "theme" | "custom";
export type PublicSiteBlockColors = {
  mode?: PublicSiteBlockColorMode;
  background?: string;
  text?: string;
  accent?: string;
};

export type PublicSiteSystemSectionLayout = "default" | "panel";
export type PublicSiteSystemSectionTextAlign = "left" | "center" | "right";
export type PublicSiteSystemSectionBackgroundMode =
  | "theme"
  | "color"
  | "image"
  | "transparent";
export type PublicSiteSystemSectionBackgroundPosition =
  | "top"
  | "center"
  | "bottom";
export type PublicSiteSystemSectionBackgroundOverlay =
  | "none"
  | "soft"
  | "strong";

export type PublicSiteSystemSectionSettings = {
  layout?: PublicSiteSystemSectionLayout;
  content_width?: PublicSiteBlockWidth;
  padding_top?: PublicSiteBlockSpacing;
  padding_bottom?: PublicSiteBlockSpacing;
  section_height?: PublicSiteSectionHeight;
  text_align?: PublicSiteSystemSectionTextAlign;
  background_mode?: PublicSiteSystemSectionBackgroundMode;
  background_image_url?: string;
  background_position?: PublicSiteSystemSectionBackgroundPosition;
  background_overlay?: PublicSiteSystemSectionBackgroundOverlay;
  animation?: PublicSiteBlockAnimation;
  animate_on_mobile?: boolean;
  hide_on_desktop?: boolean;
  hide_on_tablet?: boolean;
  hide_on_mobile?: boolean;
};

export type PublicSiteContent = {
  template_id?: string;
  theme_accent?: string;
  theme_dark?: string;
  theme_surface?: string;
  section_colors?: Partial<Record<PublicSiteCanvasSection, PublicSiteBlockColors>>;
  system_section_settings?: Partial<Record<PublicSiteCanvasSection, PublicSiteSystemSectionSettings>>;
  brand_name?: string;
  site_summary?: string;
  seo_keywords?: string;
  favicon_url?: string;
  hero_image_url?: string;
  header_sticky?: boolean;
  header_logo_size?: "small" | "medium" | "large";
  header_logo_position?: "left" | "center";
  hero_layout?: "split" | "cover" | "text";
  hero_title_mobile_size?: "small" | "medium" | "large";
  hero_image_placement?: "left" | "right";
  hero_image_position?: "top" | "center" | "bottom";
  hero_image_fit?: "cover" | "contain";
  hero_primary_label?: string;
  hero_primary_url?: string;
  hero_secondary_label?: string;
  hero_secondary_url?: string;
  show_hero_secondary?: boolean;
  service_image_urls?: string[];
  service_card_images?: Record<string, string>;
  services_layout?: "cards" | "list";
  services_columns?: 2 | 3 | 4;
  services_show_description?: boolean;
  services_show_price?: boolean;
  services_show_duration?: boolean;
  services_button_label?: string;
  portfolio_layout?: "grid" | "masonry";
  portfolio_columns?: 2 | 3 | 4;
  portfolio_card_aspect?: "auto" | "square" | "landscape" | "portrait";
  portfolio_show_filters?: boolean;
  portfolio_lightbox?: boolean;
  portfolio_show_category?: boolean;
  portfolio_show_title?: boolean;
  portfolio_show_description?: boolean;
  portfolio_home_limit?: number;
  team_image_urls?: string[];
  membership_image_url?: string;
  membership_image_urls?: string[];
  gift_image_url?: string;
  gift_image_urls?: string[];
  seo_image_url?: string;
  seo_no_index?: boolean;
  show_social_icons?: boolean;
  social_links?: PublicSiteSocialLink[];
  google_analytics_id?: string;
  meta_pixel_id?: string;
  contact_hours?: string;
  contact_address?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_note?: string;
  contact_route_label?: string;
  map_query?: string;
  footer_note?: string;
  announcement_text?: string;
  popular_title?: string;
  work_filters?: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_text: string;
  about_title: string;
  about_text: string;
  about_image_url?: string;
  about_facts?: string;
  about_button_label?: string;
  about_button_url?: string;
  services_title: string;
  portfolio_title: string;
  contact_title: string;
  booking_label: string;
  services_label: string;
  portfolio_label: string;
  about_label: string;
  contact_label: string;
  team_title?: string;
  team_label?: string;
  team_items?: string;
  reviews_title?: string;
  reviews_label?: string;
  reviews_items?: string;
  reviews?: PublicSiteReview[];
  membership_title?: string;
  membership_label?: string;
  membership_text?: string;
  membership_items?: string;
  gift_title?: string;
  gift_label?: string;
  gift_text?: string;
  gift_items?: string;
  faq_title?: string;
  faq_label?: string;
  faq_items?: string;
  booking_title?: string;
  booking_text?: string;
  safety_title?: string;
  safety_label?: string;
  safety_items?: string;
  show_hero?: boolean;
  show_announcement?: boolean;
  show_services: boolean;
  show_portfolio: boolean;
  show_about: boolean;
  show_contact: boolean;
  show_team?: boolean;
  show_reviews?: boolean;
  show_membership?: boolean;
  show_gift?: boolean;
  show_faq?: boolean;
  show_booking?: boolean;
  show_safety?: boolean;
  custom_blocks?: PublicSiteCustomBlock[];
  pages?: PublicSitePage[];
  section_order?: PublicSiteSection[];
  layout_order?: string[];
  seo_title: string;
  seo_description: string;
};

export type PublicSiteCustomBlockKind =
  | "text"
  | "features"
  | "cta"
  | "slider"
  | "collage"
  | "video"
  | "media_text"
  | "columns";
export type PublicSiteCustomBlockTone = "light" | "accent" | "dark";
export type PublicSiteMediaSize = "full" | "wide" | "medium" | "compact";
export type PublicSiteMediaAspect =
  | "landscape"
  | "classic"
  | "square"
  | "portrait";
export type PublicSiteMediaFit = "cover" | "contain";
export type PublicSiteMediaFrame = "none" | "line" | "card";
export type PublicSiteBlockWidth = "full" | "wide" | "medium" | "narrow";
export type PublicSiteBlockSpacing = "none" | "compact" | "normal" | "airy";
export type PublicSiteSectionHeight = "auto" | "compact" | "medium" | "tall" | "screen";
export type PublicSiteMediaHeight = "auto" | "compact" | "medium" | "tall";
export type PublicSiteBlockAnimation = "none" | "fade" | "rise" | "scale";
export type PublicSiteMediaType = "image" | "video" | "calendar";
export type PublicSiteMediaPosition = "left" | "center" | "right";
export type PublicSiteColumnsCount = 2 | 3;
export type PublicSiteColumnCardMediaType = "none" | "image" | "video";

export type PublicSiteColumnCard = {
  id: string;
  title: string;
  text: string;
  media_type: PublicSiteColumnCardMediaType;
  media_url?: string;
  media_alt?: string;
  video_url?: string;
  video_poster_url?: string;
};

export type PublicSiteCustomBlock = {
  id: string;
  kind: PublicSiteCustomBlockKind;
  eyebrow: string;
  title: string;
  text: string;
  items: string;
  button_label: string;
  button_url: string;
  tone: PublicSiteCustomBlockTone;
  colors?: PublicSiteBlockColors;
  is_visible?: boolean;
  media_urls?: string[];
  slide_interval_seconds?: number;
  video_url?: string;
  video_poster_url?: string;
  media_url?: string;
  media_alt?: string;
  media_type?: PublicSiteMediaType;
  media_position?: PublicSiteMediaPosition;
  columns_count?: PublicSiteColumnsCount;
  cards?: PublicSiteColumnCard[];
  media_size?: PublicSiteMediaSize;
  media_aspect?: PublicSiteMediaAspect;
  media_fit?: PublicSiteMediaFit;
  media_frame?: PublicSiteMediaFrame;
  content_width?: PublicSiteBlockWidth;
  padding_top?: PublicSiteBlockSpacing;
  padding_bottom?: PublicSiteBlockSpacing;
  section_height?: PublicSiteSectionHeight;
  media_height?: PublicSiteMediaHeight;
  animation?: PublicSiteBlockAnimation;
  animate_on_mobile?: boolean;
};

export type PublicSiteSocialLink = {
  id: string;
  platform: string;
  url: string;
};

export type PublicSiteReview = {
  id: string;
  author: string;
  text: string;
  rating: number;
  source?: string;
  source_url?: string;
};

export type PublicSitePageType = "portfolio" | "custom";

export type PublicSitePage = {
  id: string;
  type: PublicSitePageType;
  slug: string;
  nav_label: string;
  eyebrow: string;
  title: string;
  intro: string;
  is_visible?: boolean;
  show_in_navigation: boolean;
  show_booking_cta: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_image_url?: string;
  seo_no_index?: boolean;
  blocks?: PublicSiteCustomBlock[];
};

export type PublicSiteService = {
  id: string;
  slug: string;
  kind: string;
  title: string;
  description: string;
  pricing_model: "fixed" | "per_hour" | "per_person" | "free" | "quote";
  price_minor: number | null;
  currency: string;
  duration_min_minutes: number | null;
  duration_max_minutes: number | null;
  capacity: number;
  requires_confirmation: boolean;
};

export type PublicSiteProjectImage = {
  id: string;
  image_url: string;
  image_alt: string;
  width: number | null;
  height: number | null;
};

export type PublicSiteProject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  image_alt: string;
  width: number | null;
  height: number | null;
  images?: PublicSiteProjectImage[];
};

export type PublicSiteData = {
  business: {
    id: string;
    slug: string;
    name: string;
    locale: string;
    primary_locale: string;
    currency: string;
    timezone: string;
  };
  content: PublicSiteContent;
  company: {
    display_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    website_url?: string;
    logo_url?: string;
  };
  services: PublicSiteService[];
  portfolio: PublicSiteProject[];
  capabilities: {
    booking: boolean;
    catalog: boolean;
    portfolio: boolean;
  };
  available_locales: string[];
  published_at: string | null;
};

export type PublicSiteEditorLocale = {
  locale: string;
  draft_content: PublicSiteContent;
  published_content: PublicSiteContent | null;
  published_at: string | null;
};

export type PublicSiteEditorData = {
  company?: {
    display_name?: string;
    logo_url?: string;
  };
  business: {
    id: string;
    slug: string;
    name: string;
    default_locale: string;
    default_currency: string;
  };
  site: {
    is_published: boolean;
    primary_locale: string;
    published_at: string | null;
    logo_draft_url?: string;
    logo_published_url?: string;
  };
  locales: PublicSiteEditorLocale[];
  services?: PublicSiteService[];
  portfolio?: PublicSiteProject[];
};
