export type SiteHomeContent = {
  hero_eyebrow_uk: string;
  hero_eyebrow_pl: string;
  hero_words_uk: string;
  hero_words_pl: string;
  hero_intro_uk: string;
  hero_intro_pl: string;
  hero_primary_button_uk: string;
  hero_primary_button_pl: string;
  hero_secondary_button_uk: string;
  hero_secondary_button_pl: string;
  directions_eyebrow_uk: string;
  directions_eyebrow_pl: string;
  directions_title_uk: string;
  directions_title_pl: string;
  directions_text_uk: string;
  directions_text_pl: string;
  collage_photoshoots_image_url: string;
  collage_interiors_image_url: string;
  collage_learning_image_url: string;
  collage_equipment_image_url: string;
  collage_photoshoots_label_uk: string;
  collage_photoshoots_label_pl: string;
  collage_interiors_label_uk: string;
  collage_interiors_label_pl: string;
  collage_learning_label_uk: string;
  collage_learning_label_pl: string;
  collage_equipment_label_uk: string;
  collage_equipment_label_pl: string;
};

export const fallbackSiteHomeContent: SiteHomeContent = {
  hero_eyebrow_uk: "Творча фотостудія",
  hero_eyebrow_pl: "Kreatywne studio fotograficzne",
  hero_words_uk: "фотосесій, оренди, навчання",
  hero_words_pl: "sesji, wynajmu, szkoleń",
  hero_intro_uk:
    "Фотосесії, оренда залів, навчання фотографів та творчі проєкти в просторі OneStudio OS.",
  hero_intro_pl:
    "Sesje zdjęciowe, wynajem sal, szkolenia dla fotografów i kreatywne projekty w przestrzeni OneStudio OS.",
  hero_primary_button_uk: "Обрати напрям",
  hero_primary_button_pl: "Wybierz kierunek",
  hero_secondary_button_uk: "Звʼязатися",
  hero_secondary_button_pl: "Kontakt",
  directions_eyebrow_uk: "Напрями студії",
  directions_eyebrow_pl: "Kierunki studia",
  directions_title_uk: "Оберіть свій формат",
  directions_title_pl: "Wybierz swój format",
  directions_text_uk:
    "Один простір може працювати по-різному: як місце для особистої зйомки, студія для оренди, навчальний майданчик або сцена для творчого проєкту.",
  directions_text_pl:
    "Jedna przestrzeń może działać na wiele sposobów: jako miejsce na osobistą sesję, studio do wynajęcia, przestrzeń szkoleniowa albo scena dla kreatywnego projektu.",
  collage_photoshoots_image_url: "/images/site/home/photoshoots.webp",
  collage_interiors_image_url: "/images/site/home/interior.webp",
  collage_learning_image_url: "/images/site/home/learning.webp",
  collage_equipment_image_url: "/images/site/home/equipment.webp",
  collage_photoshoots_label_uk: "Фотосесії",
  collage_photoshoots_label_pl: "Sesje",
  collage_interiors_label_uk: "Інтерʼєри",
  collage_interiors_label_pl: "Wnętrza",
  collage_learning_label_uk: "Навчання",
  collage_learning_label_pl: "Szkolenia",
  collage_equipment_label_uk: "Техніка",
  collage_equipment_label_pl: "Sprzęt",
};

const localImageByR2Name: Record<string, string> = {
  "1783806495433-39850f5a-75b9-46e5-a66c-d7835cc8a08d-93894c9d-f225-4cc1-8450-b07d66b019ca.webp":
    "/images/site/home/photoshoots.webp",
  "1783898303114-home-interior-73547d4a-cebc-4a54-a46c-592b2f0cd957.webp":
    "/images/site/home/interior.webp",
  "1783898313372-home-learning-16d2319c-763a-44a3-8528-355abf4ea051.webp":
    "/images/site/home/learning.webp",
  "1783898283381-home-camera-ef870b4a-df21-4ed7-9767-77ebc28eba2f.webp":
    "/images/site/home/equipment.webp",
};

export function preferLocalHomeImage(value: string, fallback: string) {
  const cleanValue = value?.trim() || fallback;
  const fileName = cleanValue.split("/").pop() || "";
  return localImageByR2Name[fileName] || cleanValue;
}
