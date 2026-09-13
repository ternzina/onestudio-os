#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  articleSummary,
  buildImportDraftsSql,
  buildPublishSql,
  buildUnpublishSql,
  loadDraftsFromManifest,
  parseGuideMarkdown,
  validateGuideDrafts,
} from "../lib/guides/publisher/core.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EXPECTED_PROJECT_REF = "mmdjptpvofmjgrvgusma";
const PLATFORM_ORIGIN = "https://onestudioos.com";
const DEFAULT_LOCALE = "en";

function usage() {
  console.log(`Guide Publisher 1.0

Usage:
  npm run guides:publisher -- validate --manifest=publisher.json
  npm run guides:publisher -- validate article.md --category=Booking --topics=Booking,Marketing,Websites
  npm run guides:publisher -- import --manifest=publisher.json
  npm run guides:publisher -- publish --manifest=publisher.json
  npm run guides:publisher -- publish slug-one slug-two
  npm run guides:publisher -- status slug
  npm run guides:publisher -- unpublish slug

Safety:
  - validate never writes
  - import always writes draft only
  - publish is a separate command
  - import/publish/unpublish require clean main == origin/main
  - writes require the linked OneStudio Supabase project ${EXPECTED_PROJECT_REF}
`);
}

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    const equals = arg.indexOf("=");
    let key;
    let value;
    if (equals !== -1) {
      key = arg.slice(2, equals);
      value = arg.slice(equals + 1);
    } else {
      key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        value = next;
        i += 1;
      } else {
        value = true;
      }
    }
    if (flags[key] === undefined) flags[key] = value;
    else if (Array.isArray(flags[key])) flags[key].push(value);
    else flags[key] = [flags[key], value];
  }
  return { positional, flags };
}

function git(args, { quiet = false } = {}) {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: quiet ? ["ignore", "pipe", "pipe"] : ["ignore", "pipe", "inherit"],
  }).trim();
}

function assertWriteGuard() {
  git(["fetch", "origin"]);
  const branch = git(["branch", "--show-current"], { quiet: true });
  const status = git(["status", "--porcelain"], { quiet: true });
  const head = git(["rev-parse", "HEAD"], { quiet: true });
  const originMain = git(["rev-parse", "origin/main"], { quiet: true });

  if (branch !== "main") throw new Error(`Write commands require branch main; current branch is ${branch}`);
  if (status) throw new Error("Write commands require a clean working tree");
  if (head !== originMain) throw new Error("Write commands require HEAD to equal origin/main");
  return { branch, head };
}

function run(command, args, { capture = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.status !== 0) {
    const detail = capture ? `${result.stdout ?? ""}\n${result.stderr ?? ""}`.trim() : "";
    throw new Error(`${command} ${args.join(" ")} failed${detail ? `\n${detail}` : ""}`);
  }
  return capture ? (result.stdout ?? "") : "";
}

function supabaseProjectRefPath() {
  return resolve(ROOT, "supabase/.temp/project-ref");
}

function ensureLinkedProject() {
  const refPath = supabaseProjectRefPath();
  let ref = existsSync(refPath) ? readFileSync(refPath, "utf8").trim() : "";
  if (!ref) {
    console.log("Supabase link not found in this checkout. Linking OneStudio project...");
    run("npx", ["supabase@latest", "link", "--project-ref", EXPECTED_PROJECT_REF]);
    ref = existsSync(refPath) ? readFileSync(refPath, "utf8").trim() : "";
  }
  if (ref !== EXPECTED_PROJECT_REF) {
    throw new Error(`STOP: linked Supabase project is ${ref || "unknown"}; expected ${EXPECTED_PROJECT_REF}`);
  }
  return ref;
}

function assertDbQueryAvailable() {
  run("npx", ["supabase@latest", "db", "query", "--help"], { capture: true });
}

function runSupabaseSql(sql) {
  assertDbQueryAvailable();
  ensureLinkedProject();
  const tempDir = mkdtempSync(join(tmpdir(), "onestudio-guide-publisher-"));
  const file = join(tempDir, "publisher.sql");
  try {
    writeFileSync(file, sql, "utf8");
    run("npx", ["supabase@latest", "db", "query", "--linked", "-f", file]);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function statusSql(slugs, locale = DEFAULT_LOCALE) {
  const filter = slugs.length
    ? `AND l.slug IN (${slugs.map(sqlString).join(", ")})`
    : "";
  return `SELECT
  a.canonical_slug,
  a.publication_status,
  a.published_at,
  l.locale,
  l.slug,
  l.translation_status,
  l.title,
  jsonb_array_length(l.sections) AS section_count,
  COALESCE(jsonb_array_length(l.faq), 0) AS faq_count
FROM public.platform_guide_articles a
JOIN public.platform_guide_article_locales l ON l.article_id = a.id
WHERE l.locale = ${sqlString(locale)} ${filter}
ORDER BY a.published_at DESC NULLS LAST, l.slug;`;
}

function asArray(value) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function singleDraft(file, flags) {
  const relatedLinks = asArray(flags.related)
    .map((item) => String(item).split("|"))
    .filter((parts) => parts.length >= 2)
    .map(([label, ...href]) => ({ label: label.trim(), href: href.join("|").trim() }));
  const options = {
    primaryCategory: flags.category,
    topics: flags.topics ? String(flags.topics).split(",").map((item) => item.trim()).filter(Boolean) : undefined,
    excerpt: flags.excerpt,
    locale: flags.locale ?? DEFAULT_LOCALE,
    originalLocale: flags["original-locale"] ?? DEFAULT_LOCALE,
    canonicalSlug: flags["canonical-slug"],
    relatedLinks: relatedLinks.length ? relatedLinks : undefined,
  };
  return parseGuideMarkdown(readFileSync(resolve(ROOT, file), "utf8"), options);
}

function loadDrafts(positional, flags) {
  if (flags.manifest) return loadDraftsFromManifest(resolve(ROOT, String(flags.manifest)));
  const files = positional.filter((value) => /\.md$/i.test(value));
  if (files.length !== 1) throw new Error("Use --manifest for batches, or supply exactly one Markdown file");
  return [singleDraft(files[0], flags)];
}

async function fetchKnownPaths(proposed = []) {
  const response = await fetch(`${PLATFORM_ORIGIN}/sitemap.xml?guide_publisher=${Date.now()}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
    headers: { "user-agent": "OneStudio-Guide-Publisher/1.0" },
  });
  if (!response.ok) throw new Error(`Could not load production sitemap: HTTP ${response.status}`);
  const xml = await response.text();
  const paths = new Set(["/", "/guides", "/features", "/features/online-booking", "/features/crm", "/pricing"]);
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    try {
      const url = new URL(match[1].replaceAll("&amp;", "&"));
      if (url.hostname === "onestudioos.com" || url.hostname === "www.onestudioos.com") paths.add(url.pathname);
    } catch {
      // Ignore malformed sitemap values; validation will still reject unresolved links.
    }
  }
  proposed.forEach((path) => paths.add(path));
  return paths;
}

function printValidation(result) {
  console.log("===== GUIDE PUBLISHER VALIDATION =====");
  console.log(`RESULT: ${result.ok ? "PASS" : "FAIL"}`);
  console.log(`ARTICLES: ${result.articles.length}`);
  for (const article of result.articles) {
    const summary = articleSummary(article);
    console.log(`${summary.slug}: category=${summary.primaryCategory} sections=${summary.sections} faq=${summary.faq} related=${summary.relatedLinks}`);
  }
  for (const warning of result.warnings) console.log(`WARN: ${warning}`);
  for (const error of result.errors) console.error(`ERROR: ${error}`);
}

async function validateDrafts(drafts) {
  const proposed = drafts.filter((draft) => draft.slug).map((draft) => `/guides/${draft.slug}`);
  const knownPaths = await fetchKnownPaths(proposed);
  const result = validateGuideDrafts(drafts, { knownPaths });
  printValidation(result);
  if (!result.ok) throw new Error("Guide Publisher validation failed");
  return result;
}

function slugsFrom(positional, flags) {
  if (flags.manifest) {
    const drafts = loadDraftsFromManifest(resolve(ROOT, String(flags.manifest)));
    return { slugs: drafts.map((draft) => draft.slug), drafts };
  }
  const slugs = positional.filter((value) => !/\.md$/i.test(value));
  if (!slugs.length) throw new Error("No Guide slugs supplied");
  return { slugs, drafts: null };
}

async function waitForPublished(slugs, expected = new Map()) {
  const deadline = Date.now() + 25000;
  let lastError = "";
  while (Date.now() < deadline) {
    try {
      let allOk = true;
      for (const slug of slugs) {
        const response = await fetch(`${PLATFORM_ORIGIN}/guides/${slug}?publisher_check=${Date.now()}`, {
          cache: "no-store",
          redirect: "follow",
          signal: AbortSignal.timeout(8000),
          headers: { "user-agent": "OneStudio-Guide-Publisher/1.0" },
        });
        const html = await response.text();
        const expectedTitle = expected.get(slug);
        if (!response.ok || (expectedTitle && !html.includes(expectedTitle))) allOk = false;
      }
      const sitemapResponse = await fetch(`${PLATFORM_ORIGIN}/sitemap.xml?publisher_check=${Date.now()}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      const sitemap = await sitemapResponse.text();
      if (!slugs.every((slug) => sitemap.includes(`${PLATFORM_ORIGIN}/guides/${slug}`))) allOk = false;
      if (allOk) return;
      lastError = "routes or sitemap not updated yet";
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 1200));
  }
  throw new Error(`Live verification failed: ${lastError}`);
}

async function main() {
  const [command, ...argv] = process.argv.slice(2);
  if (!command || command === "help" || command === "--help") {
    usage();
    return;
  }
  const { positional, flags } = parseArgs(argv);

  if (command === "validate") {
    const drafts = loadDrafts(positional, flags);
    const result = await validateDrafts(drafts);
    if (flags.output) writeFileSync(resolve(ROOT, String(flags.output)), `${JSON.stringify(result.articles, null, 2)}\n`, "utf8");
    return;
  }

  if (command === "import") {
    const drafts = loadDrafts(positional, flags);
    const result = await validateDrafts(drafts);
    const guard = assertWriteGuard();
    console.log("===== GUIDE PUBLISHER IMPORT =====");
    console.log("MODE: DRAFT ONLY");
    console.log(`MAIN: ${guard.head}`);
    console.log(`SUPABASE PROJECT: ${EXPECTED_PROJECT_REF}`);
    runSupabaseSql(buildImportDraftsSql(result.articles));
    console.log("RESULT: PASS");
    console.log(`DRAFTS_IMPORTED: ${result.articles.length}`);
    console.log("PUBLICATION_CHANGED: NO");
    return;
  }

  if (command === "publish") {
    const { slugs, drafts } = slugsFrom(positional, flags);
    let validation = null;
    if (drafts) validation = await validateDrafts(drafts);
    const guard = assertWriteGuard();
    const locale = String(flags.locale ?? DEFAULT_LOCALE);
    const publishedAt = flags.date ? String(flags.date) : null;
    console.log("===== GUIDE PUBLISHER PUBLISH =====");
    console.log(`MAIN: ${guard.head}`);
    console.log(`LOCALE: ${locale}`);
    console.log(`COUNT: ${slugs.length}`);
    runSupabaseSql(buildPublishSql(slugs, { locale, publishedAt }));
    const expected = new Map((validation?.articles ?? []).map((article) => [article.slug, article.h1]));
    await waitForPublished(slugs, expected);
    console.log("RESULT: PASS");
    console.log(`PUBLISHED: ${slugs.join(", ")}`);
    console.log("VERCEL_DEPLOY: NOT REQUIRED");
    console.log("GIT_COMMIT: NOT REQUIRED");
    console.log("SITEMAP: VERIFIED");
    return;
  }

  if (command === "unpublish") {
    const { slugs } = slugsFrom(positional, flags);
    const guard = assertWriteGuard();
    const locale = String(flags.locale ?? DEFAULT_LOCALE);
    console.log("===== GUIDE PUBLISHER UNPUBLISH =====");
    console.log(`MAIN: ${guard.head}`);
    runSupabaseSql(buildUnpublishSql(slugs, { locale }));
    console.log("RESULT: PASS");
    console.log(`UNPUBLISHED: ${slugs.join(", ")}`);
    return;
  }

  if (command === "status") {
    const { slugs } = slugsFrom(positional, flags);
    ensureLinkedProject();
    runSupabaseSql(statusSql(slugs, String(flags.locale ?? DEFAULT_LOCALE)));
    return;
  }

  throw new Error(`Unknown Guide Publisher command: ${command}`);
}

main().catch((error) => {
  console.error("===== GUIDE PUBLISHER ERROR =====");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
