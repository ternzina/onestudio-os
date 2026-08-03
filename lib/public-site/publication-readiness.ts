export type PublicationCheckStatus = "ready" | "warning" | "blocked";

export type PublicationCheck = {
  id: string;
  label: string;
  description: string;
  status: PublicationCheckStatus;
};

export type PublicationReadiness = {
  checks: PublicationCheck[];
  canPublish: boolean;
  readyCount: number;
  warningCount: number;
  blockedCount: number;
};

type PublicationReadinessInput = {
  businessName: string;
  content: Record<string, unknown> | null;
  serviceCount: number;
  portfolioCount?: number;
  logoUrl?: string | null;
};

function readText(content: Record<string, unknown> | null, key: string) {
  const value = content?.[key];
  return typeof value === "string" ? value.trim() : "";
}

function readBoolean(
  content: Record<string, unknown> | null,
  key: string,
  fallback: boolean,
) {
  const value = content?.[key];
  return typeof value === "boolean" ? value : fallback;
}


function isVideoProviderUrl(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.includes("youtube.com/") ||
    normalized.includes("youtu.be/") ||
    normalized.includes("vimeo.com/")
  );
}

function isDirectVideoUrl(value: string) {
  const normalized = value.trim().toLowerCase().split(/[?#]/)[0];
  return [".mp4", ".webm", ".mov", ".m4v", ".ogv"].some((extension) =>
    normalized.endsWith(extension),
  );
}

function isInvalidImageUrl(value: unknown) {
  return (
    typeof value === "string" &&
    Boolean(value.trim()) &&
    (isVideoProviderUrl(value) || isDirectVideoUrl(value))
  );
}

function findInvalidImageReference(
  content: Record<string, unknown> | null,
  logoUrl?: string | null,
) {
  if (isInvalidImageUrl(logoUrl)) return "логотип";
  if (!content) return null;

  const singleImageFields: Array<[string, string]> = [
    ["favicon_url", "favicon"],
    ["hero_image_url", "главное изображение"],
    ["about_image_url", "изображение блока «О нас»"],
    ["membership_image_url", "изображение клуба"],
    ["gift_image_url", "изображение сертификата"],
    ["seo_image_url", "SEO-изображение"],
  ];

  for (const [key, label] of singleImageFields) {
    if (isInvalidImageUrl(content[key])) return label;
  }

  const imageLists: Array<[string, string]> = [
    ["service_image_urls", "изображение услуги"],
    ["team_image_urls", "фотография команды"],
    ["membership_image_urls", "изображение клуба"],
    ["gift_image_urls", "изображение сертификата"],
  ];

  for (const [key, label] of imageLists) {
    const values = content[key];
    if (Array.isArray(values) && values.some(isInvalidImageUrl)) return label;
  }

  const serviceCardImages = content.service_card_images;
  if (
    serviceCardImages &&
    typeof serviceCardImages === "object" &&
    Object.values(serviceCardImages).some(isInvalidImageUrl)
  ) {
    return "изображение карточки услуги";
  }

  return null;
}
function hasUsefulImage(
  content: Record<string, unknown> | null,
  logoUrl?: string | null,
) {
  if (logoUrl?.trim()) return true;

  return [
    "hero_image_url",
    "about_image_url",
    "seo_image_url",
    "favicon_url",
  ].some((key) => Boolean(readText(content, key)));
}

export function publicationLocaleLabel(locale: string) {
  const normalized = locale.trim().toLowerCase();
  const labels: Record<string, string> = {
    ru: "Русский",
    uk: "Українська",
    ua: "Українська",
    en: "English",
    pl: "Polski",
    de: "Deutsch",
    fr: "Français",
    es: "Español",
    it: "Italiano",
  };

  return labels[normalized] || locale.toUpperCase();
}

export function evaluatePublicationReadiness({
  businessName,
  content,
  serviceCount,
  portfolioCount = 0,
  logoUrl,
}: PublicationReadinessInput): PublicationReadiness {
  const heroTitle = readText(content, "hero_title");
  const heroText = readText(content, "hero_text");
  const brandName =
    readText(content, "brand_name") || businessName.trim();
  const contactReady = [
    readText(content, "contact_email"),
    readText(content, "contact_phone"),
    readText(content, "contact_address"),
  ].some(Boolean);
  const showServices = readBoolean(content, "show_services", true);
  const showPortfolio = readBoolean(content, "show_portfolio", true);
  const showContact = readBoolean(content, "show_contact", true);
  const seoReady = Boolean(
    readText(content, "seo_title") && readText(content, "seo_description"),
  );
  const searchDisabled = readBoolean(content, "seo_no_index", false);
  const invalidImageReference = findInvalidImageReference(content, logoUrl);

  const checks: PublicationCheck[] = [
    {
      id: "draft",
      label: "Черновик языка сохранён",
      description: content
        ? "OneStudio нашёл содержимое, которое будет опубликовано."
        : "Сначала сохраните этот язык в редакторе.",
      status: content ? "ready" : "blocked",
    },
    {
      id: "images-valid",
      label: "Файлы изображений проходят проверку",
      description: invalidImageReference
        ? `В поле «${invalidImageReference}» обнаружена ссылка на видео. Перенесите её в поле для видео.`
        : "В полях изображений нет ссылок на видеофайлы или видеосервисы.",
      status: invalidImageReference ? "blocked" : "ready",
    },
    {
      id: "identity",
      label: "Название и первый экран",
      description:
        brandName && heroTitle && heroText
          ? "Название, заголовок и вводный текст заполнены."
          : "Проверьте название, главный заголовок и короткое описание.",
      status: brandName && heroTitle && heroText ? "ready" : "warning",
    },
    {
      id: "services",
      label: "Услуги и цены",
      description: !showServices
        ? "Блок услуг отключён и не будет показан посетителям."
        : serviceCount > 0
          ? `Подготовлено услуг: ${serviceCount}.`
          : "Блок услуг включён, но в каталоге пока нет услуг.",
      status: !showServices || serviceCount > 0 ? "ready" : "warning",
    },
    {
      id: "contacts",
      label: "Контакты",
      description: !showContact
        ? "Контактный блок отключён."
        : contactReady
          ? "Посетители смогут связаться с вами."
          : "Добавьте телефон, email или адрес, чтобы посетителю было куда обратиться.",
      status: !showContact || contactReady ? "ready" : "warning",
    },
    {
      id: "visual",
      label: "Логотип или главное изображение",
      description: hasUsefulImage(content, logoUrl)
        ? "У сайта есть визуальный материал для первого впечатления."
        : "Добавьте логотип или главное изображение. Сайт можно опубликовать и без них.",
      status: hasUsefulImage(content, logoUrl) ? "ready" : "warning",
    },
    {
      id: "portfolio",
      label: "Портфолио",
      description: !showPortfolio
        ? "Портфолио отключено."
        : portfolioCount > 0
          ? `Опубликовано проектов: ${portfolioCount}.`
          : "Портфолио включено, но работы ещё не добавлены.",
      status: !showPortfolio || portfolioCount > 0 ? "ready" : "warning",
    },
    {
      id: "seo",
      label: "Заголовок и описание для поиска",
      description: searchDisabled
        ? "Индексация поисковиками сейчас отключена в настройках SEO."
        : seoReady
          ? "SEO-заголовок и описание заполнены."
          : "Заполните SEO-заголовок и описание. Это рекомендация, а не блокировка.",
      status: !searchDisabled && seoReady ? "ready" : "warning",
    },
  ];

  const readyCount = checks.filter((check) => check.status === "ready").length;
  const warningCount = checks.filter((check) => check.status === "warning").length;
  const blockedCount = checks.filter((check) => check.status === "blocked").length;

  return {
    checks,
    canPublish: blockedCount === 0,
    readyCount,
    warningCount,
    blockedCount,
  };
}
