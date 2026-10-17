import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { absoluteUrl, escapeHtml } from "./html.ts";
import { buildSiteSnapshot, type BuildSnapshotOptions } from "./snapshot.ts";
import { renderStaticSite } from "./static-site.ts";
import type { ExportFile, ExportFormat, SiteSnapshot } from "./types.ts";
import type { PublicSiteData } from "../public-site/types.ts";

const SECRET_VALUE = /eyJ[a-zA-Z0-9_-]{20,}|sb_secret_|SUPABASE_SERVICE_ROLE|sk_live_|whsec_/;

function walk(directory: string, prefix = ""): ExportFile[] {
  const files: ExportFile[] = [];
  for (const name of readdirSync(directory)) {
    const full = path.join(directory, name);
    const relative = prefix ? `${prefix}/${name}` : name;
    if (statSync(full).isDirectory()) files.push(...walk(full, relative));
    else files.push({ path: relative, body: readFileSync(full) });
  }
  return files;
}

function sitemapXml(snapshot: SiteSnapshot): string {
  const urls = sitemapEntries(snapshot).map((entry) => `  <url><loc>${escapeHtml(entry.url)}</loc><changefreq>${entry.changeFrequency}</changefreq><priority>${entry.priority}</priority></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

function sitemapEntries(snapshot: SiteSnapshot): Array<{ url: string; changeFrequency: "weekly" | "monthly"; priority: number }> {
  if (snapshot.noIndex) return [];
  const entries: Array<{ url: string; changeFrequency: "weekly" | "monthly"; priority: number }> = [
    { url: absoluteUrl(snapshot.canonicalOrigin, "/"), changeFrequency: "weekly", priority: 1 },
  ];
  for (const page of snapshot.pages) {
    if (!page.noIndex) entries.push({ url: absoluteUrl(snapshot.canonicalOrigin, page.path), changeFrequency: "weekly", priority: 0.8 });
  }
  if (snapshot.includeGuides) {
    entries.push({ url: absoluteUrl(snapshot.canonicalOrigin, "/p/guides"), changeFrequency: "weekly", priority: 0.8 });
    for (const category of snapshot.categories) {
      entries.push({ url: absoluteUrl(snapshot.canonicalOrigin, `/p/guides/${category.slug}`), changeFrequency: "weekly", priority: 0.7 });
    }
  }
  if (snapshot.includeWorksheet) entries.push({ url: absoluteUrl(snapshot.canonicalOrigin, "/p/loan-comparison-worksheet"), changeFrequency: "monthly", priority: 0.8 });
  return entries;
}

function robotsTxt(snapshot: SiteSnapshot): string {
  if (snapshot.noIndex) return "User-agent: *\nDisallow: /\n";
  return `User-agent: *\nAllow: /\n\nSitemap: ${snapshot.canonicalOrigin}/sitemap.xml\nHost: ${snapshot.canonicalOrigin}\n`;
}

function notes(snapshot: SiteSnapshot): string {
  const lines = [
    "# Экспорт сайта",
    "",
    `Сайт: ${snapshot.brandName}`,
    `Канонический адрес: ${snapshot.canonicalOrigin}`,
    `Шаблон: ${snapshot.templateId}`,
    "",
    "Архив не содержит секретных ключей OneStudio OS, Supabase, Stripe или Vercel.",
    "Домен, DNS и продакшен-настройки исходного сайта этим архивом не изменяются.",
    "",
    "## Предупреждения",
    "",
  ];
  if (!snapshot.warnings.length) lines.push("Нет.");
  for (const item of snapshot.warnings) {
    lines.push(`- ${item.blocksStatic ? "Статический экспорт неполный. " : ""}${item.message}`);
  }
  lines.push("", "Форма LeadsGate, если она есть, открывается в браузере и обращается только к провайдеру apichannels.com.");
  return `${lines.join("\n")}\n`;
}

function readme(snapshot: SiteSnapshot, format: ExportFormat): string {
  const run = format === "next"
    ? ["```bash", "npm install", "npm run build", "npm run start", "```", "", "Сайт слушает порт 3000 и не обращается к API OneStudio OS."]
    : ["Раздайте эту папку любым статическим сервером:", "", "```bash", "python3 -m http.server 4173", "```", "", "Откройте http://127.0.0.1:4173/ ."];
  return [
    `# ${snapshot.brandName}`,
    "",
    "Автономный экспорт. Для запуска не нужны OneStudio OS, его база данных, панель администратора или секретные ключи.",
    "",
    ...run,
    "",
    `Канонический адрес в метаданных: ${snapshot.canonicalOrigin}`,
    "",
    "Файл `.env.example` ничего не включает в приложение. Секреты в архив не входят.",
    "Публикация этого проекта на новом хосте не переключает домен и DNS текущего продакшена.",
    "",
  ].join("\n");
}

function envExample(snapshot: SiteSnapshot): string {
  return [
    "# Секреты не требуются. Сайт запускается без этого файла.",
    `# Канонический адрес уже записан в данных экспорта: ${snapshot.canonicalOrigin}`,
    "# SITE_URL=",
    "# Публичный идентификатор формы провайдера, если она есть, уже лежит в data/site.json.",
    "# Это не секретный ключ. Раскомментируйте только если провайдер выдал другой публичный aid.",
    "# LEADSGATE_AID=",
    "",
  ].join("\n");
}

export async function buildSiteExport(site: PublicSiteData, format: ExportFormat, options: BuildSnapshotOptions): Promise<{ files: ExportFile[]; snapshot: SiteSnapshot }> {
  const snapshot = await buildSiteSnapshot(site, options);
  const files: ExportFile[] = [];
  const siteJson = {
    templateId: snapshot.templateId,
    brandName: snapshot.brandName,
    canonicalOrigin: snapshot.canonicalOrigin,
    locale: snapshot.locale,
    seoTitle: snapshot.seoTitle,
    seoDescription: snapshot.seoDescription,
    noIndex: snapshot.noIndex,
    seoKeywords: snapshot.seoKeywords,
    faviconPath: snapshot.faviconPath,
    heroImagePath: snapshot.heroImagePath,
    shareImagePath: snapshot.heroImagePath,
    heroSources: snapshot.heroSources,
    hero: snapshot.hero,
    form: snapshot.form,
    homeHtml: snapshot.homeHtml,
  };
  if (format === "static") {
    files.push(...renderStaticSite(snapshot, options.projectRoot || process.cwd()));
    files.push({ path: "sitemap.xml", body: sitemapXml(snapshot) });
    files.push({ path: "robots.txt", body: robotsTxt(snapshot) });
    files.push({ path: "_redirects", body: snapshot.redirects.map((rule) => `${rule.source} ${rule.destination} ${rule.statusCode}`).join("\n") + "\n" });
    files.push({ path: "vercel.json", body: JSON.stringify({ redirects: snapshot.redirects }, null, 2) });
  } else {
    const templateRoot = path.join(options.projectRoot || process.cwd(), "lib/site-export/standalone");
    files.push(...walk(templateRoot).filter((file) => file.path !== "package.json"));
    files.push({
      path: "package.json",
      body: JSON.stringify({
        ...JSON.parse(readFileSync(path.join(templateRoot, "package.json"), "utf8")),
        name: `exported-${snapshot.businessSlug}`.replace(/[^a-z0-9-]/gi, "-").slice(0, 48),
      }, null, 2),
    });
    files.push({ path: "data/site.json", body: JSON.stringify(siteJson) });
    files.push({ path: "data/index.json", body: JSON.stringify({ pages: snapshot.pages.map((page) => ({ slug: page.slug })) }) });
    files.push({ path: "data/guides.json", body: JSON.stringify(snapshot.guides.map(({ slug, title, navLabel, description, categoryName, categorySlug, path: guidePath }) => ({ slug, title, navLabel, description, categoryName, categorySlug, path: guidePath }))) });
    files.push({ path: "data/categories.json", body: JSON.stringify(snapshot.categories) });
    files.push({ path: "data/redirects.json", body: JSON.stringify(snapshot.redirects) });
    files.push({ path: "data/sitemap.json", body: JSON.stringify(sitemapEntries(snapshot)) });
    for (const page of snapshot.pages) files.push({ path: `data/pages/${page.slug}.json`, body: JSON.stringify(page) });
    const { staticStyles } = await import("./static-site.ts");
    files.push({ path: "app/globals.css", body: staticStyles(options.projectRoot || process.cwd()) });
    files.push({ path: ".gitignore", body: "node_modules\n.next\n.env\n.env.local\n" });
  }
  for (const asset of snapshot.assets) {
    files.push({ path: format === "next" ? `public/${asset.archivePath}` : asset.archivePath, body: asset.bytes });
  }
  files.push({ path: "EXPORT-NOTES.md", body: notes(snapshot) });
  files.push({ path: "README.md", body: readme(snapshot, format) });
  files.push({ path: ".env.example", body: envExample(snapshot) });
  for (const file of files) {
    if (Buffer.isBuffer(file.body)) continue;
    if (SECRET_VALUE.test(file.body)) file.body = file.body.replace(SECRET_VALUE, "[removed]");
  }
  return { files, snapshot };
}
