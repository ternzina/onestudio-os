import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { createElement, type ComponentType, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import type { Locale } from "../lib/i18n/config.ts";
import * as history from "../lib/journal/updates.ts";
import type { JournalUpdate } from "../lib/journal/update-types.ts";
import {
  JOURNAL_ARTICLES,
  getJournalArticle,
  getJournalCategories,
  getLatestJournalArticles,
  type JournalArticleSummary,
} from "../lib/seo/journal-articles.ts";

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
      assert.equal(getJournalArticle(entry.id), undefined);
      assert.equal(entry.href, undefined);
      assert.ok(!("slug" in entry) && !("sections" in entry));
    }
  }
  for (const article of JOURNAL_ARTICLES) assert.ok(!("componentId" in article));
  for (const path of ["../app/journal/[slug]/page.tsx", "../app/sitemap.ts"]) {
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
    if (id.endsWith(".module.css")) return new Proxy({}, { get: (_, key) => String(key) });
    if (["react", "react/jsx-runtime", "motion/react", "next/link"].includes(id)) return require(id);
    throw new Error(`Unmapped test dependency: ${id}`);
  };
  new Function("require", "module", "exports", compiled)(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports as T;
}

const passthrough = ({ children }: { children?: ReactNode }) => children;
const journalCopy = { ...loadTsx<object>("../lib/i18n/journal.ts") };
const blog = loadTsx<object>("../components/marketing/public-blocks/blog-2.tsx", {
  "@/components/blog-previews/BlogPreview": {
    __esModule: true,
    default: ({ componentId }: { componentId: string }) => createElement("div", { "data-component-id": componentId }),
  },
});

type JournalProps = {
  articles: readonly JournalArticleSummary[];
  categories: ReturnType<typeof getJournalCategories>;
};

function renderJournal({
  locale = "en",
  articles = getLatestJournalArticles(3),
  updates = history.getJournalUpdates(locale),
}: {
  locale?: Locale;
  articles?: readonly JournalArticleSummary[];
  updates?: readonly JournalUpdate[];
} = {}) {
  const updatesComponent = loadTsx<object>("../components/marketing/OneStudioUpdatesHistory.tsx", {
    "@/lib/journal/updates": { ...history, getJournalUpdates: () => updates },
    "./public-blocks/blog-2": blog,
  });
  const { default: Journal } = loadTsx<{ default: ComponentType<JournalProps> }>("../app/journal/JournalPageClient.tsx", {
    "@/components/marketing/MarketingHeader": { __esModule: true, default: () => createElement("header") },
    "@/components/marketing/OneStudioFooter": { OneStudioFooter: () => createElement("footer") },
    "@/components/marketing/OneStudioUpdatesHistory": updatesComponent,
    "@/components/marketing/SectionReveal": { SectionReveal: passthrough },
    "@/lib/i18n/journal": journalCopy,
    "@/lib/i18n/use-locale": { useLocale: () => [locale, () => {}] },
  });
  const html = renderToStaticMarkup(createElement(Journal, { articles, categories: getJournalCategories(articles) }));
  const articleSection = html.match(/<section[^>]*aria-labelledby="journal-library-heading"[\s\S]*?<\/section>/)?.[0];
  const updateSection = html.match(/<section[^>]*aria-labelledby="journal-updates-heading"[\s\S]*?<\/section>/)?.[0];
  assert.ok(articleSection && updateSection);
  assert.ok(html.indexOf(articleSection) < html.indexOf(updateSection));
  return { articleSection, updateSection };
}

test("Journal renders Articles & Guides before the separate, complete Latest updates section", () => {
  const { articleSection, updateSection } = renderJournal();
  assert.match(articleSection, /Articles &amp; Guides/);
  assert.match(updateSection, /Latest updates/);
  assert.equal((articleSection.match(/<article\b/g) ?? []).length, 3);
  assert.equal((updateSection.match(/<article\b/g) ?? []).length, history.JOURNAL_UPDATES.en.length);
  assert.doesNotMatch(articleSection, /data-component-id=/);
  assert.doesNotMatch(updateSection, /href="\/journal\//);
  for (const entry of history.JOURNAL_UPDATES.en) {
    assert.ok(updateSection.includes(`data-component-id="${entry.componentId}"`));
    assert.ok(updateSection.includes(`dateTime="${entry.publishedAt}"`));
  }
  // Preserve the previous reverse-chronological presentation without mutating data.
  assert.ok(updateSection.indexOf("How it works 4") < updateSection.indexOf("Hero 7"));
  const ru = renderJournal({ locale: "ru" });
  assert.match(ru.articleSection, /Статьи и гайды/);
  assert.match(ru.updateSection, /Последние обновления/);
  assert.match(ru.updateSection, /Небольшие заметки о том, что появилось в библиотеке и где это может пригодиться\./);
  assert.match(ru.updateSection, /4 июля 2026/);
  assert.match(ru.updateSection, /2 сентября 2026/);
});

test("article and update counters respond independently to additional data", () => {
  const articles = getLatestJournalArticles(3);
  const extraArticle = { ...articles[0], slug: "new-guide", path: "/journal/new-guide", title: "New guide" };
  const moreArticles = renderJournal({ articles: [...articles, extraArticle] });
  assert.match(moreArticles.articleSection, /4 articles/);
  assert.match(moreArticles.updateSection, new RegExp(`>${history.JOURNAL_UPDATES.en.length}</span>`));
  assert.doesNotMatch(moreArticles.updateSection, /New guide/);

  const updates = history.JOURNAL_UPDATES.en;
  const extraUpdate = { ...updates[0], id: "next-update", title: "Next product update" };
  const moreUpdates = renderJournal({ updates: [...updates, extraUpdate] });
  assert.match(moreUpdates.articleSection, /3 articles/);
  assert.match(moreUpdates.updateSection, new RegExp(`>${updates.length + 1}</span>`));
  assert.doesNotMatch(moreUpdates.articleSection, /Next product update/);
});

test("homepage still renders only the latest three full articles from the article registry", () => {
  const articles = getLatestJournalArticles(3);
  const { OneStudioJournalPreview } = loadTsx<{ OneStudioJournalPreview: ComponentType<{ articles: readonly JournalArticleSummary[]; lang: Locale }> }>("../components/marketing/OneStudioJournalPreview.tsx", {
    "@/lib/i18n/journal": journalCopy,
    "./SectionReveal": { SectionReveal: passthrough },
  });
  const html = renderToStaticMarkup(createElement(OneStudioJournalPreview, { articles, lang: "en" }));
  assert.equal((html.match(/<article\b/g) ?? []).length, 3);
  for (const article of articles) assert.ok(html.includes(`href="${article.path}"`));
  assert.match(read("../app/page.tsx"), /getLatestJournalArticles\(3\)/);
  for (const path of ["../app/page.tsx", "../app/HomePageClient.tsx", "../components/marketing/OneStudioJournalPreview.tsx"]) {
    assert.doesNotMatch(read(path), /JOURNAL_UPDATES|getJournalUpdates|OneStudioUpdatesHistory/);
  }
});
