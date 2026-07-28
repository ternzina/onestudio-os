export type PublicSiteContent = {
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
  show_services: boolean;
  show_portfolio: boolean;
  show_about: boolean;
  show_contact: boolean;
  seo_title: string;
  seo_description: string;
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
