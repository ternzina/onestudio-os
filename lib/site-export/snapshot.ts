import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { CASH_PATH_GUIDE_CATEGORY_REGISTRY } from "../public-site/cashpath-guide-categories.ts";
import { safePublicEmbedUrl } from "../public-site/safe-html.ts";
import type { PublicSiteContent, PublicSiteCustomBlock, PublicSiteData, PublicSitePage } from "../public-site/types.ts";
import { absoluteUrl, escapeHtml, plainText, richToHtml } from "./html.ts";
import { restoreClippedNavLabel, restoreClippedSeoTitle } from "./clipped-title.ts";
import { attachResponsiveHero } from "./responsive-hero.ts";
import type { ExportAsset, ExportPage, ExportWarning, GuideCard, SiteSnapshot } from "./types.ts";

const SECRET_KEY = /secret|password|service_role|private_key|api[_-]?key|access_token|refresh_token|authorization|supabase/i;
const SECRET_VALUE = /eyJ[a-zA-Z0-9_-]{20,}|sb_secret_|sb_publishable_|sk_(live|test)_|rk_live_|whsec_|SUPABASE_SERVICE_ROLE/i;
const ASSET_EXT = /\.(png|jpe?g|gif|webp|svg|avif|ico|woff2?|ttf|otf)(\?|#|$)/i;
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED = new Set(["guides", "loan-comparison-worksheet"]);

const EXPLORE_LINKS: Array<[string, string]> = [
  ["About", "about"],
  ["Contact", "contact"],
  ["FAQ", "faq"],
  ["Rates & Fees", "rates-fees"],
  ["Responsible Lending", "responsible-lending"],
  ["Guides", "guides"],
];
const INFO_LINKS: Array<[string, string]> = [
  ["Privacy Policy", "privacy-policy"],
  ["Terms of Use", "terms-of-use"],
  ["E-Consent", "e-consent"],
  ["Advertiser Disclosure", "advertiser-disclosure"],
  ["Do Not Sell or Share My Personal Information", "do-not-sell-share"],
  ["Disclaimer", "disclaimer"],
];

export type BuildSnapshotOptions = {
  canonicalOrigin: string;
  usingDraft?: boolean;
  projectRoot?: string;
  allowRemoteFetch?: boolean;
};

function warning(code: string, message: string, blocksStatic = false): ExportWarning {
  return { code, message, blocksStatic };
}

export function assertCanonicalOrigin(value: string): string {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Укажите канонический адрес сайта, например https://cashpath.org");
  }
  if (url.protocol !== "https:") throw new Error("Канонический адрес должен начинаться с https://");
  const host = url.hostname.toLowerCase();
  if (host === "onestudioos.com" || host.endsWith(".onestudioos.com") || host.endsWith(".vercel.app")) {
    throw new Error("Канонический адрес самостоятельного сайта не может быть доменом OneStudio OS или Vercel.");
  }
  return url.origin;
}

function scrub(value: unknown, warnings: ExportWarning[]): unknown {
  if (Array.isArray(value)) return value.map((item) => scrub(item, warnings));
  if (!value || typeof value !== "object") {
    if (typeof value === "string" && SECRET_VALUE.test(value)) {
      warnings.push(warning("secret_removed", "Из экспорта удалено значение, похожее на секретный ключ."));
      return "";
    }
    return value;
  }
  const output: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (SECRET_KEY.test(key) && key !== "leadsgate_aid" && key !== "leadsgate_template") {
      warnings.push(warning("secret_field_removed", "Секретное поле удалено из экспорта."));
      continue;
    }
    output[key] = scrub(item, warnings);
  }
  return output;
}

function categorySlug(name?: string): string | undefined {
  return CASH_PATH_GUIDE_CATEGORY_REGISTRY.find((category) => category.name === name)?.slug;
}

function pageCategory(page: PublicSitePage): string | undefined {
  const value = (page as PublicSitePage & { category?: string }).category;
  return typeof value === "string" && value.trim() ? value : undefined;
}

function renderBlock(block: PublicSiteCustomBlock, warnings: ExportWarning[]): { title: string; bodyHtml: string } | null {
  if (block.is_visible === false) return null;
  if (block.kind === "leadsgate_form") {
    const aid = block.leadsgate_aid ?? "";
    if (!/^\d{1,12}$/.test(aid)) {
      warnings.push(warning("leadsgate_invalid", "Форма заявки пропущена: публичный идентификатор провайдера не задан.", true));
      return null;
    }
    return {
      title: "",
      bodyHtml: `<div class="leadsgate" data-leadsgate-aid="${escapeHtml(aid)}" data-leadsgate-template="wallet-lines"></div>`,
    };
  }
  if (block.kind === "html_embed") {
    const src = safePublicEmbedUrl(block.embed_url);
    if (src) {
      warnings.push(warning("third_party_embed", "Страница содержит внешний https-embed. Он не обращается к OneStudio OS, но зависит от чужого сайта."));
      return {
        title: plainText(block.title),
        bodyHtml: `<iframe src="${escapeHtml(src)}" title="${escapeHtml(block.embed_title || "Embedded content")}" loading="lazy" referrerpolicy="no-referrer"></iframe>`,
      };
    }
    warnings.push(warning("html_embed", "HTML-блок очищен от скриптов и встроен как статическая разметка."));
    return { title: plainText(block.title), bodyHtml: richToHtml(block.html_source) };
  }
  const title = plainText(block.title);
  const textHtml = richToHtml(block.text);
  const items = (block.items ?? "").split("\n").map((item) => item.trim()).filter(Boolean);
  const list = items.length ? `<ul class="plain-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "";
  const media = [block.media_url, ...(block.media_urls ?? [])].filter((url): url is string => Boolean(url && ASSET_EXT.test(url)));
  const images = media.map((url) => `<img src="${escapeHtml(url)}" alt="${escapeHtml(block.media_alt || plainText(block.title))}">`).join("");
  if (!title && !textHtml && !list && !images) {
    warnings.push(warning("block_simplified", `Блок «${block.kind}» экспортирован без интерактивности студии.`));
    return null;
  }
  return { title, bodyHtml: `${textHtml}${list}${images}` };
}

function collectAssetUrls(value: unknown, into: Set<string>) {
  if (typeof value === "string") {
    if (ASSET_EXT.test(value) && (value.startsWith("/") || value.startsWith("https://") || value.startsWith("http://"))) into.add(value.split("#")[0]);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectAssetUrls(item, into));
    return;
  }
  if (value && typeof value === "object") Object.values(value).forEach((item) => collectAssetUrls(item, into));
}

function assetName(url: string, index: number): string {
  const clean = url.split("?")[0];
  const base = path.posix.basename(clean).replace(/[^a-zA-Z0-9._-]/g, "-") || `asset-${index}`;
  return `media/${index}-${base}`;
}

async function loadAsset(url: string, archivePath: string, projectRoot: string, allowRemoteFetch: boolean, warnings: ExportWarning[]): Promise<ExportAsset | null> {
  if (url.startsWith("/")) {
    const relative = url.replace(/^\/+/, "");
    if (relative.includes("..")) return null;
    const file = path.resolve(projectRoot, "public", relative);
    const publicRoot = path.resolve(projectRoot, "public");
    if (!file.startsWith(publicRoot) || !existsSync(file)) {
      warnings.push(warning("missing_asset", `Локальный файл ${url} не найден и не попал в архив.`));
      return null;
    }
    return { archivePath, bytes: readFileSync(file) };
  }
  if (!allowRemoteFetch) {
    warnings.push(warning("remote_asset", `Удалённый файл оставлен ссылкой: ${url}. Для полной автономности включите загрузку медиа при экспорте.`, true));
    return null;
  }
  try {
    const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(String(response.status));
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 8_000_000) throw new Error("too_large");
    return { archivePath, bytes };
  } catch {
    warnings.push(warning("remote_asset_failed", `Не удалось скачать ${url}. В экспорте останется внешняя ссылка.`, true));
    return null;
  }
}

function rewriteAssets(html: string, map: Map<string, string>): string {
  let output = html;
  for (const [from, to] of map) output = output.split(from).join(`/${to}`);
  return output;
}

export async function buildSiteSnapshot(site: PublicSiteData, options: BuildSnapshotOptions): Promise<SiteSnapshot> {
  const warnings: ExportWarning[] = [];
  const canonicalOrigin = assertCanonicalOrigin(options.canonicalOrigin);
  const content = scrub(site.content, warnings) as PublicSiteContent;
  const templateId = content.template_id || "generic";
  const cashpath = templateId === "cashpath";
  const brandName = content.brand_name || site.company.display_name || site.business.name || "Site";
  const pages = (content.pages ?? []).filter((page) => page.is_visible !== false);
  if (cashpath) {
    const { CASH_PATH_GUIDES } = await import("../public-site/cashpath-guides.generated.ts");
    const categoriesBySlug = new Map(CASH_PATH_GUIDES.map((guide) => [guide.slug, guide.category]));
    for (const page of pages) {
      const category = categoriesBySlug.get(page.slug);
      if (category && !pageCategory(page)) (page as PublicSitePage & { category?: string }).category = category;
    }
  }

  if (options.usingDraft) warnings.push(warning("draft_export", "Экспортируется черновик: опубликованной версии этой локали нет."));
  if (content.show_booking) warnings.push(warning("booking_omitted", "Онлайн-запись OneStudio OS не входит в автономный сайт. Кнопка записи не вызывает студию.", true));
  warnings.push(warning("analytics_omitted", "События аналитики OneStudio OS не отправляются из экспортированного сайта."));
  if ((site.available_locales?.length ?? 1) > 1) warnings.push(warning("single_locale", "В архив входит только выбранная локаль."));

  const formBlock = content.custom_blocks?.find((block) => block.kind === "leadsgate_form" && block.is_visible !== false);
  const form = formBlock && /^\d{1,12}$/.test(formBlock.leadsgate_aid ?? "")
    ? {
        aid: formBlock.leadsgate_aid as string,
        template: "wallet-lines" as const,
        eyebrow: formBlock.eyebrow || "",
        title: formBlock.title || "",
        text: formBlock.text || "",
      }
    : null;
  if (cashpath && !form) warnings.push(warning("leadsgate_missing", "Форма заявки CashPath не найдена в контенте.", true));
  if (form) warnings.push(warning("leadsgate_provider", "Форма заявки открывает виджет провайдера apichannels.com в браузере. Запросы не проходят через OneStudio OS."));

  const exportPages: ExportPage[] = [];
  let restoredTitles = 0;
  for (const page of pages) {
    if (!SAFE_SLUG.test(page.slug) || RESERVED.has(page.slug)) {
      warnings.push(warning("page_skipped", `Страница «${page.slug}» пропущена: адрес зарезервирован или небезопасен.`));
      continue;
    }
    const categoryName = cashpath ? pageCategory(page) : undefined;
    const blocks = (page.blocks ?? []).flatMap((block) => {
      const rendered = renderBlock(block, warnings);
      return rendered ? [{ id: block.id, title: rendered.title, bodyHtml: rendered.bodyHtml }] : [];
    });
    const toc = blocks.filter((block) => block.title.length > 0).map((block) => ({ id: block.id, label: block.title }));
    const heading = plainText(page.title) || page.nav_label || page.slug;
    const restoredSeo = restoreClippedSeoTitle(page.seo_title || "", heading, brandName);
    if (restoredSeo.restored) restoredTitles += 1;
    exportPages.push({
      slug: page.slug,
      path: page.type === "portfolio" ? `/${page.slug}` : `/p/${page.slug}`,
      kind: page.type === "portfolio" ? "portfolio" : "custom",
      title: heading,
      navLabel: restoreClippedNavLabel(page.nav_label || "", heading, restoredSeo.restored),
      eyebrow: plainText(page.eyebrow),
      introHtml: richToHtml(page.intro),
      seoTitle: restoredSeo.seoTitle || page.seo_title || `${page.nav_label || page.slug} | ${brandName}`,
      seoDescription: page.seo_description || plainText(page.intro),
      noIndex: page.seo_no_index === true || content.seo_no_index === true,
      categoryName,
      categorySlug: categorySlug(categoryName),
      blocks,
      toc: toc.length >= 4 ? toc : [],
      related: [],
      worksheetCallout: cashpath && page.slug === "how-to-compare-personal-loan-offers",
    });
  }
  if (restoredTitles > 0) {
    warnings.push(warning("seo_title_restored", `Экспорт собрал ${restoredTitles} обрезанных SEO-заголовков заново из полного названия той же страницы. Видимый заголовок не укорачивался, база не изменялась.`));
  }
  const clippedTitles = exportPages.filter((page) => page.seoTitle.length === 70).length;
  if (clippedTitles > 0) {
    warnings.push(warning("seo_title_clipped", `После восстановления осталось ${clippedTitles} SEO-заголовков длиной 70 символов: у этих страниц в снимке нет более полного названия. Экспорт не дописывает их по чужому источнику и не записывает в базу.`));
  }

  const guides: GuideCard[] = exportPages.filter((page) => page.categoryName && page.categorySlug && !page.noIndex).map((page) => ({
    slug: page.slug,
    title: page.title,
    navLabel: page.navLabel,
    description: page.seoDescription,
    categoryName: page.categoryName as string,
    categorySlug: page.categorySlug as string,
    path: page.path,
  }));
  for (const page of exportPages) {
    if (!page.categoryName) continue;
    page.related = guides.filter((guide) => guide.categoryName === page.categoryName && guide.slug !== page.slug).slice(0, 4)
      .map((guide) => ({ slug: guide.slug, title: guide.title, path: guide.path }));
  }

  const categories = cashpath ? CASH_PATH_GUIDE_CATEGORY_REGISTRY.map((category) => ({
    slug: category.slug,
    name: category.name,
    title: category.pageTitle,
    seoTitle: category.seoTitle,
    description: category.description,
    intro: category.intro,
  })) : [];

  const urls = new Set<string>();
  collectAssetUrls(content, urls);
  if (content.favicon_url) urls.add(content.favicon_url);
  if (content.seo_image_url) urls.add(content.seo_image_url);
  if (content.hero_image_url) urls.add(content.hero_image_url);
  if (cashpath) urls.add("/templates/cashpath/hero-woman-wide-v2.png").add("/templates/cashpath/favicon.svg");
  const assetMap = new Map<string, string>();
  const assets: ExportAsset[] = [];
  let index = 0;
  for (const url of urls) {
    if (assets.length >= 40) {
      warnings.push(warning("asset_limit", "В архив вошло не больше 40 медиафайлов."));
      break;
    }
    const archivePath = assetName(url, index);
    index += 1;
    const loaded = await loadAsset(url, archivePath, options.projectRoot || process.cwd(), options.allowRemoteFetch === true, warnings);
    if (!loaded) continue;
    assetMap.set(url, archivePath);
    assets.push(loaded);
  }

  const apply = <T>(value: T): T => JSON.parse(rewriteAssets(JSON.stringify(value), assetMap)) as T;
  const rewrittenPages = apply(exportPages);
  const heroImage = assetMap.get("/templates/cashpath/hero-woman-wide-v2.png")
    || assetMap.get(content.hero_image_url || "")
    || assetMap.get(content.seo_image_url || "")
    || "";
  const heroSources = await attachResponsiveHero(assets, heroImage, warnings);
  const favicon = assetMap.get("/templates/cashpath/favicon.svg") || assetMap.get(content.favicon_url || "") || "";

  const snapshot: SiteSnapshot = {
    templateId,
    brandName,
    businessSlug: site.business.slug,
    canonicalOrigin,
    locale: site.business.locale || "en",
    seoTitle: content.seo_title || brandName,
    seoDescription: content.seo_description || content.site_summary || plainText(content.hero_text),
    seoKeywords: content.seo_keywords || "",
    noIndex: content.seo_no_index === true,
    faviconPath: favicon ? `/${favicon}` : "",
    heroImagePath: heroImage ? `/${heroImage}` : "",
    heroSources,
    hero: {
      eyebrow: plainText(content.hero_eyebrow),
      title: plainText(content.hero_title) || brandName,
      text: plainText(content.hero_text),
    },
    form,
    pages: rewrittenPages,
    guides: apply(guides),
    categories,
    includeGuides: cashpath,
    includeWorksheet: cashpath,
    pageFooter: null,
    homeHtml: "",
    assets,
    warnings,
    redirects: [
      { source: `/site/${site.business.slug}`, destination: "/", statusCode: 301 },
      { source: `/site/${site.business.slug}/p/:path*`, destination: "/p/:path*", statusCode: 301 },
    ],
    usingDraft: options.usingDraft === true,
  };
  snapshot.pageFooter = pageFooterFor(snapshot);
  snapshot.homeHtml = rewriteAssets(genericHomeHtml(snapshot), assetMap);
  return snapshot;
}

function pageFooterFor(snapshot: SiteSnapshot): SiteSnapshot["pageFooter"] {
  if (snapshot.templateId === "cashpath") {
    const links = cashPathFooter(snapshot);
    const href = (slug: string) => slug === "guides" ? "/p/guides" : `/p/${slug}`;
    return {
      variant: "cashpath",
      statement: "CashPath is not a lender and does not make credit decisions.",
      columns: [
        { title: "Explore", links: links.explore.map(([label, slug]) => ({ label, href: href(slug) })) },
        { title: "Information", links: links.info.map(([label, slug]) => ({ label, href: href(slug) })) },
      ],
    };
  }
  const contact = snapshot.pages.find((page) => page.slug === "contact");
  return contact ? { variant: "links", links: [{ label: "Contact", href: contact.path }] } : null;
}

function genericHomeHtml(snapshot: SiteSnapshot): string {
  if (snapshot.templateId === "cashpath") return "";
  const contact = snapshot.pages.find((page) => page.slug === "contact");
  const pageLinks = snapshot.pages.slice(0, 24).map((page) => `<li><a href="${escapeHtml(page.path)}">${escapeHtml(page.navLabel)}</a></li>`).join("");
  return `<main class="generic"><header class="generic-header"><a href="/">${escapeHtml(snapshot.brandName)}</a></header><section class="generic-hero"><p>${escapeHtml(snapshot.hero.eyebrow)}</p><h1>${escapeHtml(snapshot.hero.title)}</h1><p>${escapeHtml(snapshot.hero.text)}</p></section><section><h2>Pages</h2><ul>${pageLinks}</ul></section><footer>${contact ? `<a href="${escapeHtml(contact.path)}">Contact</a>` : ""}</footer></main>`;
}

export function cashPathFooter(snapshot: SiteSnapshot): { explore: Array<[string, string]>; info: Array<[string, string]> } {
  const has = new Set(snapshot.pages.map((page) => page.slug));
  return {
    explore: EXPLORE_LINKS.filter(([, slug]) => slug === "guides" || has.has(slug)),
    info: INFO_LINKS.filter(([, slug]) => has.has(slug)),
  };
}

export function homeJsonLd(snapshot: SiteSnapshot): Record<string, unknown> {
  const url = snapshot.canonicalOrigin;
  const organization = { "@type": "Organization", "@id": `${url}/#organization`, name: snapshot.brandName, url };
  const website = { "@type": "WebSite", "@id": `${url}/#website`, name: snapshot.brandName, url, publisher: { "@id": `${url}/#organization` } };
  if (snapshot.templateId !== "cashpath") return { "@context": "https://schema.org", "@graph": [organization, website] };
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      website,
      {
        "@type": "FAQPage",
        "@id": `${url}/#faq`,
        mainEntity: [
          ["Is CashPath a lender?", "No. CashPath is not a lender and does not make credit decisions."],
          ["Does submitting a request guarantee approval?", "No. Eligibility and available offers are determined by participating providers."],
          ["Do I have to accept an offer?", "No. A request does not require you to accept an offer."],
          ["Who determines rates and fees?", "The provider determines rates, fees, and other terms."],
        ].map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })),
      },
    ],
  };
}

export function pageJsonLd(snapshot: SiteSnapshot, page: ExportPage): Record<string, unknown> | null {
  if (!page.categorySlug) return null;
  const pageUrl = absoluteUrl(snapshot.canonicalOrigin, page.path);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: page.title,
    description: page.seoDescription,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    isPartOf: { "@type": "WebSite", "@id": `${snapshot.canonicalOrigin}/#website` },
    publisher: { "@type": "Organization", name: snapshot.brandName, url: snapshot.canonicalOrigin },
  };
}

export function breadcrumbJsonLd(snapshot: SiteSnapshot, items: Array<{ label: string; path?: string }>): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.path ? { item: absoluteUrl(snapshot.canonicalOrigin, item.path) } : {}),
    })),
  };
}
