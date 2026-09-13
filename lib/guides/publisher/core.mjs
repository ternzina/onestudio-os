import { readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";

export const GUIDE_CATEGORIES = [
  "Business",
  "Websites",
  "Booking",
  "CRM",
  "Marketing",
  "SEO",
];

export const GUIDE_LOCALES = ["ru", "en", "uk", "pl", "de", "es", "fr", "pt"];

const EDITORIAL_HEADINGS = [
  /^internal[- ]link suggestions?$/i,
  /^research\s*\/\s*claim notes/i,
  /^research notes/i,
  /^claim notes/i,
  /^content qa(?:\s+and\s+source\s+notes)?$/i,
  /^content qa notes/i,
  /^source notes/i,
  /^implementation notes/i,
  /^editorial notes/i,
  /^developer notes/i,
];

const META_KEY_MAP = new Map([
  ["status", "status"],
  ["date", "date"],
  ["target query", "targetQuery"],
  ["search intent", "searchIntentLabel"],
  ["recommended content type", "contentType"],
  ["proposed slug", "slug"],
  ["slug", "slug"],
  ["seo title", "title"],
  ["meta description", "description"],
  ["h1", "h1"],
  ["primary category", "primaryCategory"],
  ["topics", "topics"],
  ["excerpt", "excerpt"],
  ["oneStudio claim boundary".toLowerCase(), "claimBoundary"],
  ["primary cta", "primaryCta"],
  ["secondary queries", "secondaryQueries"],
]);

function normalizeNewlines(value) {
  return String(value ?? "").replace(/\r\n?/g, "\n");
}

function stripTicks(value) {
  return String(value ?? "").trim().replace(/^`+|`+$/g, "");
}

function heading(line) {
  const match = line.match(/^\s*(#{1,6})\s+(.+?)\s*$/);
  return match ? { level: match[1].length, text: cleanInlineMarkdown(match[2]) } : null;
}

function isHorizontalRule(line) {
  return /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line);
}

function isEditorialHeading(text) {
  return EDITORIAL_HEADINGS.some((pattern) => pattern.test(text.trim()));
}

function parseMetaLine(line) {
  const match = line.match(/^\s*\*\*([^*]+?):\*\*\s*(.*?)\s*$/);
  if (!match) return null;
  const rawKey = match[1].trim();
  const key = META_KEY_MAP.get(rawKey.toLowerCase());
  return key ? { key, value: stripTicks(match[2]) } : null;
}

function slugFromPath(value) {
  const raw = stripTicks(value).replace(/^https?:\/\/[^/]+/i, "");
  const match = raw.match(/^\/guides\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
  if (match) return match[1];
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw)) return raw;
  return null;
}

function cleanRoute(value) {
  const raw = stripTicks(value)
    .replace(/[),.;:]+$/g, "")
    .trim();
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  try {
    const url = new URL(raw, "https://onestudioos.com");
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function routePathOnly(value) {
  try {
    return new URL(value, "https://onestudioos.com").pathname;
  } catch {
    return value;
  }
}

function titleCaseSlug(slug) {
  const keep = new Map([
    ["seo", "SEO"],
    ["crm", "CRM"],
    ["faq", "FAQ"],
    ["google", "Google"],
    ["business", "Business"],
    ["profile", "Profile"],
  ]);
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => keep.get(part.toLowerCase()) ?? `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

export function labelFromHref(href) {
  const path = routePathOnly(href).replace(/\/$/, "");
  if (path === "/") return "OneStudio";
  if (path === "/pricing") return "Pricing";
  if (path === "/features") return "Features";
  if (path === "/guides") return "Guides";
  const slug = path.split("/").filter(Boolean).pop() ?? path;
  return titleCaseSlug(slug);
}

export function cleanInlineMarkdown(value) {
  let text = normalizeNewlines(value).replace(/\n+/g, " ").trim();
  if (!text) return "";

  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1");
  text = text.replace(/\[([^\]]+)\]\((\/[^)\s]+)\)/g, (_all, label, href) => {
    const route = cleanRoute(href);
    return route ? `[[${label.trim()}|${route}]]` : label.trim();
  });
  text = text.replace(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/gi, "$1");
  text = text.replace(/<https?:\/\/[^>]+>/gi, "");
  text = text.replace(/`([^`]+)`/g, "$1");
  text = text.replace(/\*\*([^*]+)\*\*/g, "$1");
  text = text.replace(/__([^_]+)__/g, "$1");
  text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "$1");
  text = text.replace(/(?<!_)_([^_]+)_(?!_)/g, "$1");
  text = text.replace(/<[^>]+>/g, "");
  text = text.replace(/^>\s?/, "");
  return text.replace(/\s+/g, " ").trim();
}

function metadataAndBody(markdown) {
  const lines = normalizeNewlines(markdown).split("\n");
  const metadata = {};
  let sourceTitle = "";
  let cursor = 0;

  if (heading(lines[0] ?? "")?.level === 1) {
    sourceTitle = heading(lines[0]).text;
    cursor = 1;
  }

  let bodyStart = cursor;
  let sawMeta = false;
  for (; cursor < Math.min(lines.length, 50); cursor += 1) {
    const line = lines[cursor];
    if (isHorizontalRule(line)) {
      bodyStart = cursor + 1;
      break;
    }
    const parsed = parseMetaLine(line);
    if (parsed) {
      metadata[parsed.key] = parsed.value;
      sawMeta = true;
      bodyStart = cursor + 1;
      continue;
    }
    if (!line.trim()) {
      bodyStart = cursor + 1;
      continue;
    }
    if (sawMeta) {
      bodyStart = cursor;
      break;
    }
    bodyStart = cursor;
    break;
  }

  return { metadata, sourceTitle, lines: lines.slice(bodyStart) };
}

function editorialAndPublicLines(lines) {
  const publicLines = [];
  const suggestedHrefs = [];
  const removedHeadings = [];

  let skipLevel = null;
  let skipKind = null;
  for (const line of lines) {
    const h = heading(line);
    if (h) {
      if (skipLevel !== null && h.level <= skipLevel) {
        skipLevel = null;
        skipKind = null;
      }
      if (isEditorialHeading(h.text)) {
        skipLevel = h.level;
        skipKind = /internal[- ]link/i.test(h.text) ? "links" : "editorial";
        removedHeadings.push(h.text);
        continue;
      }
    }

    if (skipLevel !== null) {
      if (skipKind === "links") {
        const matches = line.match(/\/(?:guides|features|solutions|demos|tools|pricing)(?:\/[A-Za-z0-9._~!$&'()*+,;=:@%/-]+)?/g) ?? [];
        for (const match of matches) {
          const route = cleanRoute(match);
          if (route) suggestedHrefs.push(route);
        }
      }
      continue;
    }

    publicLines.push(line);
  }

  return {
    publicLines,
    suggestedHrefs: [...new Set(suggestedHrefs)],
    removedHeadings,
  };
}

function flattenFaqAnswer(lines) {
  const parts = [];
  let listBuffer = [];
  const flushList = () => {
    if (listBuffer.length) {
      parts.push(listBuffer.join("; "));
      listBuffer = [];
    }
  };

  let paragraph = [];
  const flushParagraph = () => {
    if (paragraph.length) {
      const text = cleanInlineMarkdown(paragraph.join(" "));
      if (text) parts.push(text);
      paragraph = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || isHorizontalRule(line)) {
      flushParagraph();
      flushList();
      continue;
    }
    const list = line.match(/^[-*+]\s+(?:\[[ xX]\]\s*)?(.*)$/) || line.match(/^\d+[.)]\s+(.*)$/);
    if (list) {
      flushParagraph();
      const text = cleanInlineMarkdown(list[1]);
      if (text) listBuffer.push(text);
      continue;
    }
    flushList();
    paragraph.push(line.replace(/^>\s?/, ""));
  }
  flushParagraph();
  flushList();
  return parts.join(" ").trim();
}

function extractFaq(lines) {
  const faq = [];
  const body = [];
  let faqLevel = null;
  let question = null;
  let answerLines = [];

  const flushQuestion = () => {
    if (!question) return;
    const answer = flattenFaqAnswer(answerLines);
    if (answer) faq.push({ question, answer });
    question = null;
    answerLines = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const h = heading(line);

    if (faqLevel === null) {
      if (h && /^faq(?:s)?$/i.test(h.text.trim())) {
        faqLevel = h.level;
        continue;
      }
      body.push(line);
      continue;
    }

    if (h && h.level <= faqLevel) {
      flushQuestion();
      faqLevel = null;
      body.push(line);
      continue;
    }

    if (h && h.level > faqLevel) {
      flushQuestion();
      question = h.text;
      continue;
    }

    if (question) answerLines.push(line);
  }
  flushQuestion();

  return { bodyLines: body, faq };
}

function parseTable(lines, start) {
  if (start + 1 >= lines.length) return null;
  const headerLine = lines[start];
  const dividerLine = lines[start + 1];
  if (!headerLine.includes("|") || !/^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(dividerLine)) return null;

  const cells = (line) => line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cleanInlineMarkdown(cell.trim()));

  const headers = cells(headerLine);
  const rows = [];
  let cursor = start + 2;
  while (cursor < lines.length && lines[cursor].includes("|") && lines[cursor].trim()) {
    const row = cells(lines[cursor]);
    if (row.length !== headers.length) break;
    rows.push(row);
    cursor += 1;
  }
  return { table: { headers, rows }, next: cursor };
}

function sectionShell(title) {
  return {
    title: cleanInlineMarkdown(title),
    paragraphs: [],
    checklist: [],
    list: [],
    numberedList: [],
    subsections: [],
    table: null,
    template: null,
  };
}

function subsectionShell(title) {
  return {
    title: cleanInlineMarkdown(title),
    paragraphs: [],
    list: [],
    numberedList: [],
  };
}

function appendParagraph(target, paragraphLines) {
  const text = cleanInlineMarkdown(paragraphLines.join(" "));
  if (text) target.paragraphs.push(text);
}

function parseSections(lines) {
  const sections = [];
  let current = null;
  let currentSubsection = null;
  let paragraph = [];

  const ensureSection = () => {
    if (!current) {
      current = sectionShell("Overview");
      sections.push(current);
    }
    return current;
  };

  const target = () => currentSubsection ?? ensureSection();
  const flushParagraph = () => {
    if (!paragraph.length) return;
    appendParagraph(target(), paragraph);
    paragraph = [];
  };

  for (let i = 0; i < lines.length;) {
    const raw = lines[i];
    const trimmed = raw.trim();
    const h = heading(raw);

    if (h) {
      flushParagraph();
      if (h.level <= 2) {
        current = sectionShell(h.text);
        sections.push(current);
        currentSubsection = null;
      } else {
        ensureSection();
        currentSubsection = subsectionShell(h.text);
        current.subsections.push(currentSubsection);
      }
      i += 1;
      continue;
    }

    if (!trimmed || isHorizontalRule(trimmed)) {
      flushParagraph();
      i += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushParagraph();
      const language = trimmed.slice(3).trim();
      const code = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      const section = ensureSection();
      const value = code.join("\n").trim();
      if (value) {
        if (!section.template) section.template = { ...(language ? { label: language } : {}), content: value };
        else section.template.content += `\n\n${value}`;
      }
      continue;
    }

    const table = parseTable(lines, i);
    if (table) {
      flushParagraph();
      const section = ensureSection();
      if (!section.table) section.table = table.table;
      else {
        section.paragraphs.push(table.table.headers.join(" | "));
        section.paragraphs.push(...table.table.rows.map((row) => row.join(" | ")));
      }
      i = table.next;
      continue;
    }

    const checklist = trimmed.match(/^[-*+]\s+\[[ xX]\]\s+(.*)$/);
    if (checklist) {
      flushParagraph();
      const text = cleanInlineMarkdown(checklist[1]);
      if (text) ensureSection().checklist.push(text);
      i += 1;
      continue;
    }

    const unordered = trimmed.match(/^[-*+]\s+(.*)$/);
    if (unordered) {
      flushParagraph();
      const text = cleanInlineMarkdown(unordered[1]);
      if (text) target().list.push(text);
      i += 1;
      continue;
    }

    const numbered = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (numbered) {
      flushParagraph();
      const text = cleanInlineMarkdown(numbered[1]);
      if (text) target().numberedList.push(text);
      i += 1;
      continue;
    }

    if (/^\*\*Secondary CTA:\*\*/i.test(trimmed) && /once live|only after|when live/i.test(trimmed)) {
      flushParagraph();
      i += 1;
      continue;
    }

    paragraph.push(trimmed.replace(/^>\s?/, ""));
    i += 1;
  }
  flushParagraph();

  return sections
    .map((section) => ({
      title: section.title,
      paragraphs: section.paragraphs,
      ...(section.checklist.length ? { checklist: section.checklist } : {}),
      ...(section.list.length ? { list: section.list } : {}),
      ...(section.numberedList.length ? { numberedList: section.numberedList } : {}),
      ...(section.subsections.length
        ? {
            subsections: section.subsections
              .filter((item) => item.title)
              .map((item) => ({
                title: item.title,
                ...(item.paragraphs.length ? { paragraphs: item.paragraphs } : {}),
                ...(item.list.length ? { list: item.list } : {}),
                ...(item.numberedList.length ? { numberedList: item.numberedList } : {}),
              })),
          }
        : {}),
      ...(section.table ? { table: section.table } : {}),
      ...(section.template ? { template: section.template } : {}),
    }))
    .filter((section) =>
      section.title && (
        section.paragraphs.length ||
        section.checklist?.length ||
        section.list?.length ||
        section.numberedList?.length ||
        section.subsections?.length ||
        section.table ||
        section.template
      ),
    );
}

function firstBodyExcerpt(sections) {
  const candidates = [];
  for (const section of sections) {
    candidates.push(...(section.paragraphs ?? []));
    for (const subsection of section.subsections ?? []) candidates.push(...(subsection.paragraphs ?? []));
    if (candidates.join(" ").length >= 260) break;
  }
  const text = candidates.join(" ").replace(/\[\[([^|]+)\|[^\]]+\]\]/g, "$1").trim();
  if (text.length <= 220) return text;
  const slice = text.slice(0, 218);
  const stop = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf(" "));
  return `${slice.slice(0, stop > 120 ? stop : 218).trim()}…`;
}

function normalizeTopics(value, primaryCategory) {
  if (!value) return primaryCategory ? [primaryCategory] : [];
  const raw = Array.isArray(value) ? value : String(value).split(/[,/]/);
  return [...new Set(raw.map((item) => String(item).trim()).filter(Boolean))];
}

export function parseGuideMarkdown(markdown, options = {}) {
  const { metadata, sourceTitle, lines } = metadataAndBody(markdown);
  const editorial = editorialAndPublicLines(lines);
  const faqResult = extractFaq(editorial.publicLines);
  const sections = parseSections(faqResult.bodyLines);

  const slug = slugFromPath(options.slug ?? metadata.slug ?? "");
  const primaryCategory = options.primaryCategory ?? metadata.primaryCategory ?? null;
  const topics = normalizeTopics(options.topics ?? metadata.topics, primaryCategory);
  const locale = options.locale ?? "en";
  const originalLocale = options.originalLocale ?? "en";
  const canonicalSlug = options.canonicalSlug ?? slug;

  const draft = {
    canonicalSlug,
    slug,
    locale,
    originalLocale,
    category: "Guide",
    title: cleanInlineMarkdown(options.title ?? metadata.title ?? sourceTitle),
    h1: cleanInlineMarkdown(options.h1 ?? metadata.h1 ?? sourceTitle),
    description: cleanInlineMarkdown(options.description ?? metadata.description ?? ""),
    excerpt: cleanInlineMarkdown(options.excerpt ?? metadata.excerpt ?? firstBodyExcerpt(sections)),
    searchIntent: cleanInlineMarkdown(options.searchIntent ?? metadata.targetQuery ?? ""),
    primaryCategory,
    topics,
    sections,
    relatedLinks: Array.isArray(options.relatedLinks) ? options.relatedLinks : [],
    faq: faqResult.faq,
    suggestedRelatedHrefs: editorial.suggestedHrefs,
    removedEditorialHeadings: editorial.removedHeadings,
    source: {
      title: sourceTitle,
      status: metadata.status ?? null,
      sourceDate: metadata.date ?? null,
      searchIntentLabel: metadata.searchIntentLabel ?? null,
      claimBoundary: metadata.claimBoundary ?? null,
      primaryCta: metadata.primaryCta ?? null,
    },
  };
  return draft;
}

function collectInlineLinks(value, output) {
  if (typeof value === "string") {
    for (const match of value.matchAll(/\[\[([^|\]]+)\|([^\]]+)\]\]/g)) {
      output.push({ label: match[1].trim(), href: match[2].trim(), source: "inline" });
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectInlineLinks(item, output));
    return;
  }
  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectInlineLinks(item, output));
  }
}

function ensureRelatedLinks(draft, knownPaths) {
  if (draft.relatedLinks?.length) {
    return draft.relatedLinks.map((link) => ({
      label: cleanInlineMarkdown(link.label),
      href: cleanRoute(link.href),
    }));
  }

  return draft.suggestedRelatedHrefs
    .filter((href) => knownPaths.has(routePathOnly(href)))
    .slice(0, 6)
    .map((href) => ({ label: labelFromHref(href), href }));
}

function duplicateValues(items, key) {
  const seen = new Set();
  const dupes = new Set();
  for (const item of items) {
    const value = item[key];
    if (!value) continue;
    if (seen.has(value)) dupes.add(value);
    seen.add(value);
  }
  return [...dupes];
}

export function validateGuideDrafts(drafts, { knownPaths = new Set(), requireRelatedLinks = true } = {}) {
  const proposedPaths = new Set(drafts.map((draft) => draft.slug ? `/guides/${draft.slug}` : "").filter(Boolean));
  const allKnownPaths = new Set([...knownPaths, ...proposedPaths]);
  const errors = [];
  const warnings = [];
  const normalized = [];

  for (const [index, source] of drafts.entries()) {
    const draft = structuredClone(source);
    const prefix = draft.slug || `article#${index + 1}`;

    if (!draft.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug)) errors.push(`${prefix}: invalid or missing slug`);
    if (!draft.canonicalSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.canonicalSlug)) errors.push(`${prefix}: invalid canonicalSlug`);
    if (!GUIDE_LOCALES.includes(draft.locale)) errors.push(`${prefix}: unsupported locale ${draft.locale}`);
    if (!GUIDE_LOCALES.includes(draft.originalLocale)) errors.push(`${prefix}: unsupported originalLocale ${draft.originalLocale}`);
    if (!GUIDE_CATEGORIES.includes(draft.primaryCategory)) errors.push(`${prefix}: primaryCategory must be one of ${GUIDE_CATEGORIES.join(", ")}`);
    if (!draft.topics?.length || draft.topics.some((topic) => !GUIDE_CATEGORIES.includes(topic))) errors.push(`${prefix}: topics must use Guide categories`);

    for (const field of ["title", "h1", "description", "excerpt", "searchIntent"]) {
      if (!draft[field]?.trim()) errors.push(`${prefix}: ${field} is required`);
    }
    if (/\|\s*OneStudio(?:\s+OS)?\s*$/i.test(draft.title ?? "")) errors.push(`${prefix}: title must not contain a literal OneStudio brand suffix`);
    if (!draft.sections?.length) errors.push(`${prefix}: at least one section is required`);
    if (draft.faq?.length === 1) errors.push(`${prefix}: FAQ must contain at least two items or be omitted`);

    const relatedLinks = ensureRelatedLinks(draft, allKnownPaths);
    const relatedSeen = new Set();
    for (const link of relatedLinks) {
      if (!link.label || !link.href) {
        errors.push(`${prefix}: invalid related link`);
        continue;
      }
      const path = routePathOnly(link.href);
      if (path === `/guides/${draft.slug}`) errors.push(`${prefix}: related link must not point to itself`);
      if (/^\/(?:help|blog)(?:\/|$)/.test(path)) errors.push(`${prefix}: related link cannot point to ${path}`);
      if (!allKnownPaths.has(path)) errors.push(`${prefix}: unresolved related link ${path}`);
      if (relatedSeen.has(path)) errors.push(`${prefix}: duplicate related link ${path}`);
      relatedSeen.add(path);
    }
    if (requireRelatedLinks && !relatedLinks.length) errors.push(`${prefix}: at least one live related link is required`);

    const inlineLinks = [];
    collectInlineLinks(draft.sections, inlineLinks);
    for (const link of inlineLinks) {
      const path = routePathOnly(cleanRoute(link.href) ?? link.href);
      if (!path.startsWith("/")) errors.push(`${prefix}: unsafe inline link ${link.href}`);
      else if (/^\/(?:help|blog)(?:\/|$)/.test(path)) errors.push(`${prefix}: inline link cannot point to ${path}`);
      else if (!allKnownPaths.has(path)) errors.push(`${prefix}: unresolved inline link ${path}`);
    }

    if (draft.removedEditorialHeadings?.length) {
      warnings.push(`${prefix}: removed editorial sections: ${draft.removedEditorialHeadings.join(", ")}`);
    }
    if (!draft.source?.status || !/QA\s+PASS|Ready to Publish/i.test(draft.source.status)) {
      warnings.push(`${prefix}: source does not explicitly say QA PASS / Ready to Publish`);
    }

    normalized.push({
      canonicalSlug: draft.canonicalSlug,
      slug: draft.slug,
      locale: draft.locale,
      originalLocale: draft.originalLocale,
      category: "Guide",
      title: draft.title,
      h1: draft.h1,
      description: draft.description,
      excerpt: draft.excerpt,
      searchIntent: draft.searchIntent,
      primaryCategory: draft.primaryCategory,
      topics: draft.topics,
      sections: draft.sections,
      relatedLinks,
      faq: draft.faq?.length ? draft.faq : null,
    });
  }

  for (const key of ["slug", "title", "h1", "description", "searchIntent"]) {
    for (const value of duplicateValues(normalized, key)) errors.push(`batch: duplicate ${key}: ${value}`);
  }

  return { ok: errors.length === 0, errors, warnings, articles: normalized, knownPaths: allKnownPaths };
}

export function parseManifest(manifestPath) {
  const absolute = resolve(manifestPath);
  const manifest = JSON.parse(readFileSync(absolute, "utf8"));
  if (!manifest || !Array.isArray(manifest.articles) || !manifest.articles.length) {
    throw new Error("Guide Publisher manifest must contain a non-empty articles array");
  }
  const base = dirname(absolute);
  return manifest.articles.map((item, index) => {
    if (!item.file) throw new Error(`Manifest article #${index + 1} is missing file`);
    return {
      ...item,
      file: resolve(base, item.file),
    };
  });
}

export function loadDraftsFromManifest(manifestPath) {
  return parseManifest(manifestPath).map((item) => {
    const markdown = readFileSync(item.file, "utf8");
    return parseGuideMarkdown(markdown, item);
  });
}

function b64Json(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64");
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

export function buildImportDraftsSql(articles) {
  const blocks = articles.map((article, index) => {
    const payload = b64Json(article);
    return `
DO $guide_publisher_${index}$
DECLARE
  j jsonb := convert_from(decode('${payload}', 'base64'), 'utf8')::jsonb;
  v_article_id uuid;
  v_existing_status text;
BEGIN
  SELECT id, publication_status
  INTO v_article_id, v_existing_status
  FROM public.platform_guide_articles
  WHERE canonical_slug = j->>'canonicalSlug';

  IF v_article_id IS NULL THEN
    IF j->>'locale' <> j->>'originalLocale' THEN
      RAISE EXCEPTION 'Guide Publisher: parent % does not exist for translation locale %', j->>'canonicalSlug', j->>'locale';
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.platform_guide_article_locales
      WHERE locale = j->>'locale'
        AND (title = j->>'title' OR h1 = j->>'h1' OR description = j->>'description')
    ) THEN
      RAISE EXCEPTION 'Guide Publisher: duplicate Guide identity for %', j->>'slug';
    END IF;

    INSERT INTO public.platform_guide_articles (
      canonical_slug,
      primary_category,
      topics,
      original_locale,
      publication_status,
      published_at
    ) VALUES (
      j->>'canonicalSlug',
      j->>'primaryCategory',
      ARRAY(SELECT jsonb_array_elements_text(j->'topics')),
      j->>'originalLocale',
      'draft',
      NULL
    )
    RETURNING id INTO v_article_id;
  ELSE
    IF EXISTS (
      SELECT 1 FROM public.platform_guide_article_locales
      WHERE article_id = v_article_id AND locale = j->>'locale'
    ) THEN
      RAISE EXCEPTION 'Guide Publisher: locale % already exists for %', j->>'locale', j->>'canonicalSlug';
    END IF;
  END IF;

  INSERT INTO public.platform_guide_article_locales (
    article_id,
    locale,
    slug,
    category,
    title,
    h1,
    description,
    excerpt,
    search_intent,
    sections,
    related_links,
    faq,
    translation_status
  ) VALUES (
    v_article_id,
    j->>'locale',
    j->>'slug',
    j->>'category',
    j->>'title',
    j->>'h1',
    j->>'description',
    j->>'excerpt',
    j->>'searchIntent',
    j->'sections',
    j->'relatedLinks',
    NULLIF(j->'faq', 'null'::jsonb),
    'draft'
  );
END
$guide_publisher_${index}$;`;
  });

  return `BEGIN;\n${blocks.join("\n")}\nCOMMIT;\n`;
}

/**
 * @param {string[]} slugs
 * @param {{ locale?: string, publishedAt?: string | null }} [options]
 */
export function buildPublishSql(slugs, { locale = "en", publishedAt = null } = {}) {
  if (!slugs.length) throw new Error("No Guide slugs supplied for publish");
  const list = slugs.map(sqlString).join(", ");
  const localeSql = sqlString(locale);
  const dateExpression = publishedAt ? `${sqlString(publishedAt)}::date` : "current_date";
  return `BEGIN;
DO $guide_publish$
DECLARE
  v_expected integer := ${slugs.length};
  v_locale_count integer;
  v_parent_count integer;
  v_invalid_parent_count integer;
  v_publish_date date := ${dateExpression};
BEGIN
  IF v_publish_date > current_date THEN
    RAISE EXCEPTION 'Guide Publisher: publication date % is in the future relative to database current_date %', v_publish_date, current_date;
  END IF;

  SELECT count(*) INTO v_locale_count
  FROM public.platform_guide_article_locales
  WHERE locale = ${localeSql} AND slug IN (${list}) AND translation_status IN ('draft', 'review', 'published');

  IF v_locale_count <> v_expected THEN
    RAISE EXCEPTION 'Guide Publisher: expected % locale rows, found %', v_expected, v_locale_count;
  END IF;

  SELECT count(DISTINCT a.id) INTO v_parent_count
  FROM public.platform_guide_articles a
  JOIN public.platform_guide_article_locales l ON l.article_id = a.id
  WHERE l.locale = ${localeSql} AND l.slug IN (${list});

  IF v_parent_count <> v_expected THEN
    RAISE EXCEPTION 'Guide Publisher: expected % parent rows, found %', v_expected, v_parent_count;
  END IF;

  SELECT count(*) INTO v_invalid_parent_count
  FROM public.platform_guide_articles a
  JOIN public.platform_guide_article_locales l ON l.article_id = a.id
  WHERE l.locale = ${localeSql}
    AND l.slug IN (${list})
    AND (
      (a.original_locale = ${localeSql} AND a.publication_status NOT IN ('draft', 'review', 'published'))
      OR
      (a.original_locale <> ${localeSql} AND a.publication_status <> 'published')
    );

  IF v_invalid_parent_count <> 0 THEN
    RAISE EXCEPTION 'Guide Publisher: % parent rows are not eligible for locale publication', v_invalid_parent_count;
  END IF;

  UPDATE public.platform_guide_article_locales
  SET translation_status = 'published'
  WHERE locale = ${localeSql} AND slug IN (${list});

  UPDATE public.platform_guide_articles a
  SET publication_status = 'published',
      published_at = COALESCE(a.published_at, v_publish_date)
  WHERE a.original_locale = ${localeSql}
    AND a.id IN (
      SELECT l.article_id
      FROM public.platform_guide_article_locales l
      WHERE l.locale = ${localeSql} AND l.slug IN (${list})
    )
    AND a.publication_status IN ('draft', 'review', 'published');
END
$guide_publish$;
COMMIT;
`;
}

export function buildUnpublishSql(slugs, { locale = "en" } = {}) {
  if (!slugs.length) throw new Error("No Guide slugs supplied for unpublish");
  const list = slugs.map(sqlString).join(", ");
  const localeSql = sqlString(locale);
  return `BEGIN;
UPDATE public.platform_guide_article_locales
SET translation_status = 'draft'
WHERE locale = ${localeSql} AND slug IN (${list});

UPDATE public.platform_guide_articles a
SET publication_status = 'draft', published_at = NULL
WHERE a.original_locale = ${localeSql}
  AND a.id IN (
    SELECT l.article_id FROM public.platform_guide_article_locales l
    WHERE l.locale = ${localeSql} AND l.slug IN (${list})
  );
COMMIT;
`;
}

export function manifestExample() {
  return {
    articles: [
      {
        file: "./2026-09-11-booking-page-best-practices-final-v1.md",
        primaryCategory: "Booking",
        topics: ["Booking", "Marketing", "Websites"],
        excerpt: "Audit a booking page for service clarity, real availability, mobile friction, confirmation, and measurable conversion.",
        relatedLinks: [
          { label: "Online Booking", href: "/features/online-booking" },
          { label: "Appointment Booking Form Template", href: "/guides/appointment-booking-form-template" },
        ],
      },
    ],
  };
}

export function articleSummary(article) {
  return {
    slug: article.slug,
    locale: article.locale,
    primaryCategory: article.primaryCategory,
    topics: article.topics,
    title: article.title,
    sections: article.sections.length,
    faq: article.faq?.length ?? 0,
    relatedLinks: article.relatedLinks.length,
  };
}

export function basenameWithoutExtension(path) {
  return basename(path).replace(/\.[^.]+$/, "");
}
