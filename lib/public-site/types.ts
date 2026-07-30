export type PublicSiteContent = {
  template_id?: string;
  theme_accent?: string;
  theme_dark?: string;
  theme_surface?: string;
  brand_name?: string;
  site_summary?: string;
  seo_keywords?: string;
  favicon_url?: string;
  hero_image_url?: string;
  service_image_urls?: string[];
  team_image_urls?: string[];
  membership_image_url?: string;
  gift_image_url?: string;
  seo_image_url?: string;
  seo_no_index?: boolean;
  show_social_icons?: boolean;
  social_links?: PublicSiteSocialLink[];
  google_analytics_id?: string;
  meta_pixel_id?: string;
  contact_hours?: string;
  contact_address?: string;
  map_query?: string;
  announcement_text?: string;
  popular_title?: string;
  work_filters?: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_text: string;
  about_title: string;
  about_text: string;
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
  gift_title?: string;
  gift_label?: string;
  gift_text?: string;
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
export type PublicSiteMediaType = "image" | "video" | "calendar";
export type PublicSiteMediaPosition = "left" | "right";
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
  };
  locales: PublicSiteEditorLocale[];
};
