import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { createElement, type ComponentType, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import * as journalCopy from "../lib/i18n/journal.ts";
import * as guidesCopy from "../lib/i18n/guides.ts";
import * as guidesRegistry from "../lib/seo/guide-articles.ts";
import nextConfig from "../next.config.ts";
import type { Locale } from "../lib/i18n/config.ts";
import * as history from "../lib/journal/updates.ts";
import {
  GUIDE_ARTICLES,
  getGuideArticle,
  getGuideCategories,
  getLatestGuideArticles,
  type GuideArticleSummary,
} from "../lib/seo/guide-articles.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const archive = JSON.parse(read("./fixtures/journal-history-963ae06.json")) as {
  preservedIds: string[];
  locales: Record<Locale, { count: number; sha256: string }>;
};

for (const locale of Object.keys(archive.locales) as Locale[]) {
  test(`${locale}: every historical update field matches base 963ae06`, () => {
    const updates = history.getJournalUpdates(locale);
    assert.equal(new Set(updates.map((entry) => entry.id)).size, updates.length);
    const preserved = archive.preservedIds.map((id) => {
      const entry = updates.find((update) => update.id === id);
      assert.ok(entry, `Missing historical update: ${locale}/${id}`);
      return entry;
    });
    assert.equal(preserved.length, archive.locales[locale].count);
    // Includes id, componentId, title, publishedAt, date, category, excerpt and tone.
    // New notes may be appended without modifying this historical snapshot.
    assert.equal(
      createHash("sha256").update(JSON.stringify(preserved)).digest("hex"),
      archive.locales[locale].sha256,
    );
    assert.equal(preserved[0].title, "Hero 7");
    assert.equal(preserved[0].publishedAt, "2026-07-04");
    assert.equal(preserved.at(-1)!.title, "How it works 4");
    assert.equal(preserved.at(-1)!.publishedAt, "2026-09-02");
  });
}

test("updates keep every preview association without acquiring SEO article routes", () => {
  const previewRegistry = read("../components/blog-previews/blog-preview-registry.ts");
  for (const updates of Object.values(history.JOURNAL_UPDATES)) {
    for (const entry of updates) {
      assert.match(previewRegistry, new RegExp(`"${entry.componentId}": \\{`));
      assert.equal(getGuideArticle(entry.id), undefined);
      assert.equal(entry.href, undefined);
      assert.ok(!("slug" in entry) && !("sections" in entry));
    }
  }
  for (const article of GUIDE_ARTICLES) assert.ok(!("componentId" in article));
  for (const path of ["../app/guides/[slug]/page.tsx", "../app/sitemap.ts"]) {
    assert.doesNotMatch(read(path), /JOURNAL_UPDATES|getJournalUpdates/);
  }
});

const require = createRequire(import.meta.url);

/** Render the actual section components; isolate unrelated shell and live demos. */
function loadTsx<T>(path: string, dependencies: Record<string, unknown> = {}): T {
  const compiled = ts.transpileModule(read(path), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const loadedModule = { exports: {} };
  const localRequire = (id: string) => {
    if (id in dependencies) return dependencies[id];
    if (id.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
    if (["react", "react/jsx-runtime", "motion/react", "next/link"].includes(id)) return require(id);
    throw new Error(`Unmapped test dependency: ${id}`);
  };
  new Function("require", "module", "exports", compiled)(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports as T;
}

const passthrough = ({ children }: { children?: ReactNode }) => children;
const blog = loadTsx<object>("../components/marketing/public-blocks/blog-2.tsx", {
  "@/components/blog-previews/BlogPreview": {
    __esModule: true,
    default: ({ componentId }: { componentId: string }) => createElement("div", { "data-component-id": componentId }),
  },
});

type GuidesProps = { articles: readonly GuideArticleSummary[]; categories: ReturnType<typeof getGuideCategories> };
const shell = {
  "@/components/marketing/MarketingHeader": { __esModule: true, default: () => createElement("header") },
  "@/components/marketing/OneStudioFooter": { OneStudioFooter: () => createElement("footer") },
  "@/components/marketing/SectionReveal": { SectionReveal: passthrough },
  "@/lib/i18n/journal": journalCopy,
  "@/lib/i18n/guides": guidesCopy,
};
function renderJournal(locale: Locale = "en", updates = history.getJournalUpdates(locale)) {
  const updatesComponent = loadTsx<object>("../components/marketing/OneStudioUpdatesHistory.tsx", {
    "@/lib/journal/updates": { ...history, getJournalUpdates: () => updates },
    "./public-blocks/blog-2": blog,
  });
  const { default: Journal } = loadTsx<{ default: ComponentType }>("../app/journal/JournalPageClient.tsx", {
    ...shell,
    "@/components/marketing/OneStudioUpdatesHistory": updatesComponent,
    "@/lib/i18n/use-locale": { useLocale: () => [locale, () => {}] },
  });
  return renderToStaticMarkup(createElement(Journal));
}
function renderGuides(locale: Locale = "en", articles = getLatestGuideArticles(3)) {
  const { default: Guides } = loadTsx<{ default: ComponentType<GuidesProps> }>("../app/guides/GuidesPageClient.tsx", {
    ...shell,
    "@/lib/i18n/use-locale": { useLocale: () => [locale, () => {}] },
  });
  return renderToStaticMarkup(createElement(Guides, { articles, categories: getGuideCategories() }));
}

test("Journal history cards have no actions or link affordances", () => {
  const cardsSource = read("../components/marketing/public-blocks/blog-2.tsx");
  const cardStyles = read("../components/marketing/public-blocks/blog-2.module.css");
  assert.doesNotMatch(cardsSource, /next\/link|<Link|cardFoot|styles\.arrow|cardLink/);
  assert.doesNotMatch(cardStyles, /cardLink|cardFoot|\.arrow|\.card:hover|cursor:\s*pointer/);
  const { Blog2 } = blog as { Blog2: ComponentType<import("../components/marketing/public-blocks/blog-2.tsx").Blog2Props> };
  const update = history.JOURNAL_UPDATES.en[0];
  const html = renderToStaticMarkup(createElement(Blog2, {
    articles: [
      { ...update, id: "without-href" },
      { ...update, id: "with-href", href: "/journal/linked-update" },
    ],
  }));
  assert.equal((html.match(/<article\b/g) ?? []).length, 2);
  assert.doesNotMatch(html, /<a\b|href=|class="arrow"|↗|cardFoot|Journal note|Заметка журнала|cardLink/);
  assert.match(html, /data-component-id="hero-7"/);

  const journal = renderJournal();
  assert.equal((journal.match(/<article\b/g) ?? []).length, 41);
  assert.doesNotMatch(journal, /<article[^>]*data-update-id[\s\S]*?<a\b|↗|Journal note|Заметка журнала|cardLink/);
});

test("Guides renders the fixed taxonomy even with zero or changing article counts", () => {
  const ids = ["all", "business", "websites", "booking", "crm", "marketing", "seo"];
  assert.deepEqual(getGuideCategories().map((category) => category.toLowerCase()), ids.slice(1));
  const articles = getLatestGuideArticles(3);
  for (const locale of Object.keys(archive.locales) as Locale[]) {
    const copy = guidesCopy.getGuidesUiCopy(locale);
    assert.deepEqual(Object.keys(copy.categoryLabels), getGuideCategories());
    for (const content of [[], articles.slice(0, 1), articles]) {
      const html = renderGuides(locale, content);
      assert.deepEqual([...html.matchAll(/data-guide-category="([^"]+)"/g)].map((match) => match[1]), ids);
      for (const label of [copy.allCategories, ...getGuideCategories().map((key) => copy.categoryLabels[key])]) {
        assert.ok(html.includes(`>${label}</button>`), `${locale}: missing ${label}`);
      }
    }
  }
  for (const [locale, labels] of [
    ["ru", ["Все", "Бизнес", "Сайты", "Бронирование", "CRM", "Маркетинг", "SEO"]],
    ["en", ["All", "Business", "Websites", "Booking", "CRM", "Marketing", "SEO"]],
  ] as const) {
    const copy = guidesCopy.getGuidesUiCopy(locale);
    assert.deepEqual([copy.allCategories, ...getGuideCategories().map((key) => copy.categoryLabels[key])], labels);
  }
  assert.match(read("../lib/seo/guide-articles.ts"), /function getGuideCategories\(\) \{\s*return GUIDE_CATEGORY_ORDER;/);
  assert.match(read("../app/guides/page.tsx"), /categories=\{GUIDE_CATEGORY_ORDER\}/);
});

test("history keeps semantic keys and never replays card entry on locale or pointer changes", () => {
  const cards = read("../components/marketing/public-blocks/blog-2.tsx");
  const preview = read("../components/blog-previews/BlogPreview.tsx");
  assert.match(cards, /key=\{article\.id\}/);
  assert.match(cards, /BlogPreview key=\{article\.componentId\}/);
  assert.doesNotMatch(cards, /key=\{lang\}|AnimatePresence|motion\.article|Blog2CardReveal/);
  assert.match(preview, /<PreviewComponent key=\{componentId\}/);
  assert.doesNotMatch(preview, /activationKey|renderKey|shouldMount|setIsNearViewport\(entry\.isIntersecting\)/);
  assert.match(preview, /setIsNearViewport\(true\);\s*observer\.disconnect\(\)/);
  assert.match(preview, /setHasActivated\(true\)/);
  assert.doesNotMatch(preview, /setHasActivated\(false\)|setIsNearViewport\(false\)/);
  assert.match(preview, /\{PreviewComponent \? \(/);
  assert.match(preview, /setPreviewComponent\(\(\) => memo\(component\)\)/);
  assert.doesNotMatch(preview, /mediaReady|setMediaReady|image\.loading|image\.decode|querySelectorAll/);
  assert.match(preview, /if \(!shouldLoad \|\| PreviewComponent\) return/);
  const registry = loadTsx<object>("../components/blog-previews/blog-preview-registry.ts");
  const { default: Preview } = loadTsx<{ default: ComponentType<{ componentId: string; title: string }> }>("../components/blog-previews/BlogPreview.tsx", {
    "./blog-preview-registry": registry,
  });
  const html = renderToStaticMarkup(createElement(Preview, { componentId: "hero-12", title: "Hero 12" }));
  assert.match(html, /data-preview-loaded="false"/);
  assert.doesNotMatch(html, /previewShell|shellLine|<img|<picture|<video|poster=/);
  assert.doesNotMatch(preview, /PreviewShell|<img\b|<Image\b|<picture\b|<video\b|poster=/);
  assert.doesNotMatch(read("../components/blog-previews/blog-preview.module.css"), /previewShell|shellLine|gradient\(|url\(/);
  assert.doesNotMatch(html, /data-preview-content/);
});

test("Journal displays only the full product history; Guides has its own catalogue", () => {
  const journal = renderJournal();
  assert.match(journal, /Latest updates/);
  assert.equal((journal.match(/<article\b/g) ?? []).length, history.JOURNAL_UPDATES.en.length);
  assert.doesNotMatch(journal, /Articles &amp; Guides|guides-library-heading|href="\/guides\//);
  for (const entry of history.JOURNAL_UPDATES.en) {
    assert.ok(journal.includes('data-component-id="' + entry.componentId + '"'));
    assert.ok(journal.includes('dateTime="' + entry.publishedAt + '"'));
  }
  assert.ok(journal.indexOf("How it works 4") < journal.indexOf("Hero 7"));
  const guides = renderGuides();
  assert.match(guides, /Articles &amp; Guides/);
  assert.equal((guides.match(/<article\b/g) ?? []).length, 3);
  assert.doesNotMatch(guides, /Latest updates|data-component-id|journal-updates-heading/);
  for (const locale of Object.keys(archive.locales) as Locale[]) {
    assert.ok(renderJournal(locale).includes(history.getJournalUpdatesCopy(locale).title));
  }
  const ru = renderJournal("ru");
  assert.match(ru, /Последние обновления/);
  assert.match(ru, /4 июля 2026/);
  assert.match(ru, /2 сентября 2026/);
});

test("guide and update counters remain independent and dynamic", () => {
  const articles = getLatestGuideArticles(3);
  const extra = { ...articles[0], slug: "new-guide", path: "/guides/new-guide", title: "New guide" };
  assert.match(renderGuides("en", [...articles, extra]), /4 guides/);
  const updates = history.JOURNAL_UPDATES.en;
  const more = renderJournal("en", [...updates, { ...updates[0], id: "next-update", title: "Next product update" }]);
  assert.ok(more.includes('>' + (updates.length + 1) + '</span>'));
  assert.doesNotMatch(renderGuides(), /Next product update/);
});

test("homepage renders only three Guides, with global typography and the requested accent", () => {
  const articles = getLatestGuideArticles(3);
  const { OneStudioGuidesPreview } = loadTsx<{ OneStudioGuidesPreview: ComponentType<{ articles: readonly GuideArticleSummary[]; lang: Locale }> }>("../components/marketing/OneStudioGuidesPreview.tsx", {
    "@/lib/i18n/guides": guidesCopy,
    "./SectionReveal": { SectionReveal: passthrough },
  });
  for (const lang of ["en", "ru"] as const) {
    const html = renderToStaticMarkup(createElement(OneStudioGuidesPreview, { articles, lang }));
    assert.equal((html.match(/<article\b/g) ?? []).length, 3);
    for (const article of articles) assert.ok(html.includes('href="' + article.path + '"'));
    assert.match(html, /href="\/guides"/);
    assert.doesNotMatch(html, /href="\/journal/);
    assert.match(html, new RegExp('<strong[^>]*>' + guidesCopy.getGuidesUiCopy(lang).homepage.accent + '</strong>'));
    for (const role of ["h2", "card-title", "card-body", "eyebrow", "micro", "action"]) assert.ok(html.includes('os-type-' + role));
    assert.match(html, /os-public-content-guide/);
  }
  assert.doesNotMatch(read("../components/marketing/OneStudioGuidesPreview.module.css"), /font-size:|font-weight:|letter-spacing:|line-height:/);
  assert.match(read("../app/page.tsx"), /listPublishedGuideArticleSummaries/);
  assert.match(read("../app/page.tsx"), /guideArticles\.slice\(0, 3\)/);
  for (const path of ["../app/page.tsx", "../app/HomePageClient.tsx", "../components/marketing/OneStudioGuidesPreview.tsx"]) {
    assert.doesNotMatch(read(path), /JOURNAL_UPDATES|getJournalUpdates|OneStudioUpdatesHistory/);
  }
});

test("legacy production URLs redirect once to their correct owners", async () => {
  const redirects = await nextConfig.redirects!();
  assert.deepEqual(redirects.find((rule) => rule.source === "/blog"), {
    source: "/blog", destination: "/journal", statusCode: 301,
  });
  for (const article of GUIDE_ARTICLES) {
    assert.deepEqual(redirects.find((rule) => rule.source === `/blog/${article.slug}`), {
      source: `/blog/${article.slug}`, destination: article.path, statusCode: 301,
    });
  }
  assert.ok(redirects.every((rule) => !rule.source.startsWith("/journal/")));
  assert.ok(redirects.every((rule) => !rule.destination.startsWith("/journal/")));
});

test("each guide belongs to exactly one primary catalogue category", () => {
  const articles = getLatestGuideArticles(100);
  const categories = guidesRegistry.GUIDE_CATEGORY_ORDER;
  const catalogue = categories.flatMap((category) => articles.filter((article) => article.primaryCategory === category));
  assert.equal(catalogue.length, articles.length);
  assert.equal(new Set(catalogue.map((article) => article.slug)).size, articles.length);
  assert.ok(articles.some((article) => article.topics.length > 1));
  assert.match(read("../app/guides/GuidesPageClient.tsx"), /article\.primaryCategory === selectedCategory/);
  assert.doesNotMatch(read("../app/guides/GuidesPageClient.tsx"), /topics\.includes/);
});

test("every locale owns complete Guides and Journal UI copy in its locale folder", () => {
  for (const locale of Object.keys(archive.locales) as Locale[]) {
    for (const section of ["guides", "journal"]) {
      const source = read(`../lib/i18n/locales/${locale}/${section}.ts`);
      assert.doesNotMatch(source, /\.\.\.english|\.\.\/en\//);
    }
    const copy = guidesCopy.getGuidesUiCopy(locale);
    assert.ok(copy.homepage.title.includes(copy.homepage.accent));
    assert.ok(copy.navigationLabel && copy.lead && copy.loadMore);
    assert.ok(journalCopy.getJournalUiCopy(locale).headline);
    assert.match(guidesCopy.formatGuideCount(24, locale), /^24 /);
  }
});

test("guide pages render canonical metadata, Article/FAQ schemas and all rich content", async () => {
  type ArticlePageProps = { params: Promise<{ slug: string }> };
  const page = loadTsx<{
    generateMetadata: (props: ArticlePageProps) => Promise<{ alternates: { canonical: string } }>;
    default: (props: ArticlePageProps) => Promise<ReturnType<typeof createElement>>;
  }>("../app/guides/[slug]/page.tsx", {
    "next/navigation": { notFound: () => { throw new Error("404"); } },
    "@/app/_seo/site": { SITE_URL: new URL("https://onestudioos.com") },
    "@/lib/i18n/config": { platformMarketingLocale: "en" },
    "@/lib/guides/repository": {
      getPublishedGuideArticle: async (slug: string) => guidesRegistry.getGuideArticle(slug),
    },
    "@/lib/i18n/guides": guidesCopy,
  });
  let content = "";
  for (const article of GUIDE_ARTICLES) {
    const props = { params: Promise.resolve({ slug: article.slug }) };
    const metadata = await page.generateMetadata(props);
    assert.equal(metadata.alternates.canonical, `https://onestudioos.com/guides/${article.slug}`);
    const html = renderToStaticMarkup(await page.default(props));
    assert.match(html, /"@type":"Article"/);
    assert.match(html, /href="\/guides"/);
    assert.doesNotMatch(html, /\/journal\//);
    assert.doesNotMatch(html, /"@type":"FAQPage"|"@type":"QAPage"/);
    content += html;
  }
  for (const tag of ["h2", "h3", "ul", "ol", "table", "pre", "code"]) assert.ok(content.includes(`<${tag}`));
});

test("platform sitemap renders canonical guide URLs and excludes legacy article URLs", async () => {
  const { default: sitemap } = loadTsx<{ default: () => Promise<Array<{ url: string }>> }>("../app/sitemap.ts", {
    "next/headers": { headers: async () => new Headers() },
    "./_seo/platform": { PLATFORM_MARKETING_PATHS: ["/", "/journal", "/guides"] },
    "./_seo/site": { SITE_URL: new URL("https://onestudioos.com") },
    "@/lib/demo-catalog": { DEMOS: [] },
    "@/lib/public-site/template-catalog": { getPublicDemoTemplateChoices: () => [] },
    "@/lib/domains/normalize": { isTechnicalPlatformHostname: () => false, isCanonicalPlatformHostname: () => true },
    "@/lib/public-site/data": { listPublicSiteSeoPaths: async () => [] },
    "@/lib/public-site/domain-resolution": { requestHostname: () => "onestudioos.com" },
    "@/lib/public-site/metadata": {},
    "@/lib/public-site/premium-route-metadata": {},
    "@/lib/guides/repository": {
      listPublishedGuideSitemapEntries: async () => GUIDE_ARTICLES.map((article) => ({ path: article.path, publishedAt: article.publishedAt })),
    },
    "@/lib/i18n/config": { platformMarketingLocale: "en" },
    "@/lib/seo/solutions": { SOLUTION_PATHS: [] },
  });
  const urls = (await sitemap()).map((entry) => entry.url);
  for (const article of GUIDE_ARTICLES) assert.ok(urls.includes(`https://onestudioos.com${article.path}`));
  assert.ok(urls.includes("https://onestudioos.com/journal"));
  assert.ok(urls.every((url) => !url.includes("/blog") && !url.includes("/journal/")));
});
