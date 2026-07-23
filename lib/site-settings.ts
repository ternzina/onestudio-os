export type SiteContactSettings = {
  phone: string;
  email: string;
  address: string;
};

export type SiteGlobalSettings = {
  studio_name: string;
  logo_text: string;
  instagram_url: string;
  tiktok_url: string;
  facebook_url: string;
  footer_text_uk: string;
  footer_text_pl: string;
};

export const fallbackContactSettings: SiteContactSettings = {
  phone: "",
  email: "hello@onestudioos.com",
  address: "",
};

export const fallbackGlobalSettings: SiteGlobalSettings = {
  studio_name: "OneStudio OS",
  logo_text: "OneStudio OS",
  instagram_url: "",
  tiktok_url: "",
  facebook_url: "",
  footer_text_uk:
    "Premium-зйомки з повною організацією процесу: ідея, образи, beauty-підготовка, фото, відео та фінальний результат.",
  footer_text_pl:
    "Sesje premium z pełną organizacją procesu: koncepcja, stylizacje, przygotowanie beauty, zdjęcia, wideo i finalny efekt.",
};

export type PublicSiteSettings = {
  contacts: SiteContactSettings;
  global: SiteGlobalSettings;
};
