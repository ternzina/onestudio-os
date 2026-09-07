#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const INPUT = path.join(ROOT, "docs/cashpath/cashpath-final-seo-content-2.2.md");
const OUTPUT = path.join(ROOT, "lib/public-site/cashpath-final-seo-content.generated.ts");
const CHECK = process.argv.includes("--check");

const RICH_TEXT_PREFIX = "__osrt1__:";
const CFPB_URL = "https://www.consumerfinance.gov/ask-cfpb/do-personal-installment-loans-have-fees-en-2120/";
const FTC_URL = "https://consumer.ftc.gov/articles/what-know-about-advance-fee-loans";

function fail(message) {
  console.error(`CashPath SEO content generator: ${message}`);
  process.exit(1);
}

function nextNonEmpty(lines, index) {
  for (let i = index + 1; i < lines.length; i += 1) {
    const value = lines[i].trim();
    if (value) return { value, index: i };
  }
  return null;
}

function fieldValue(lines, label) {
  const prefix = `${label}:`;
  const idx = lines.findIndex((line) => line.trim().startsWith(prefix));
  if (idx < 0) fail(`Missing field ${label}`);

  const sameLine = lines[idx].trim().slice(prefix.length).trim();
  if (sameLine) return sameLine.replace(/^`|`$/g, "");

  const found = nextNonEmpty(lines, idx);
  if (!found) fail(`Missing value for ${label}`);
  return found.value.replace(/^`|`$/g, "");
}

function inlineNodes(text) {
  const nodes = [];
  let i = 0;

  const pushText = (value) => {
    if (!value) return;
    const last = nodes[nodes.length - 1];
    if (last?.type === "text") last.text += value;
    else nodes.push({ type: "text", text: value });
  };

  while (i < text.length) {
    const rest = text.slice(i);

    const internal = rest.match(/^\[\[LINK:([a-z0-9-]+)\|([^\]]+)\]\]/);
    if (internal) {
      nodes.push({
        type: "a",
        href: `/p/${internal[1]}`,
        children: [{ type: "text", text: internal[2] }],
      });
      i += internal[0].length;
      continue;
    }

    if (rest.startsWith("[[CFPB_SOURCE]]")) {
      nodes.push({
        type: "a",
        href: CFPB_URL,
        children: [{ type: "text", text: "Consumer Financial Protection Bureau" }],
      });
      i += "[[CFPB_SOURCE]]".length;
      continue;
    }

    if (rest.startsWith("[[FTC_SOURCE]]")) {
      nodes.push({
        type: "a",
        href: FTC_URL,
        children: [{ type: "text", text: "Federal Trade Commission" }],
      });
      i += "[[FTC_SOURCE]]".length;
      continue;
    }

    if (rest.startsWith("**")) {
      const end = text.indexOf("**", i + 2);
      if (end >= 0) {
        const inner = text.slice(i + 2, end);
        nodes.push({ type: "strong", children: inlineNodes(inner) });
        i = end + 2;
        continue;
      }
    }

    if (rest.startsWith("*")) {
      const end = text.indexOf("*", i + 1);
      if (end >= 0) {
        const inner = text.slice(i + 1, end);
        nodes.push({ type: "em", children: inlineNodes(inner) });
        i = end + 1;
        continue;
      }
    }

    const candidates = [
      text.indexOf("[[LINK:", i),
      text.indexOf("[[CFPB_SOURCE]]", i),
      text.indexOf("[[FTC_SOURCE]]", i),
      text.indexOf("**", i),
      text.indexOf("*", i),
    ].filter((n) => n >= 0);

    const next = candidates.length ? Math.min(...candidates) : text.length;
    if (next === i) {
      pushText(text[i]);
      i += 1;
    } else {
      pushText(text.slice(i, next));
      i = next;
    }
  }

  return nodes;
}

function paragraphsFromLines(lines) {
  const paragraphs = [];
  let current = [];

  const flush = () => {
    const value = current.join(" ").trim();
    if (value) paragraphs.push(value);
    current = [];
  };

  for (const raw of lines) {
    const line = raw.trim();

    if (!line || line === "---") {
      flush();
      continue;
    }

    if (line.startsWith("### ")) {
      flush();
      paragraphs.push(`**${line.slice(4).trim()}**`);
      continue;
    }

    current.push(line);
  }
  flush();

  return paragraphs;
}

function encodeRichText(paragraphs) {
  const doc = {
    version: 1,
    root: {
      type: "root",
      children: paragraphs.map((paragraph) => ({
        type: "p",
        children: inlineNodes(paragraph),
      })),
    },
  };
  return `${RICH_TEXT_PREFIX}${JSON.stringify(doc)}`;
}

function plainFromMarkup(text) {
  return text
    .replace(/\[\[LINK:[a-z0-9-]+\|([^\]]+)\]\]/g, "$1")
    .replace(/\[\[CFPB_SOURCE\]\]/g, "Consumer Financial Protection Bureau")
    .replace(/\[\[FTC_SOURCE\]\]/g, "Federal Trade Commission")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#+\s*/g, "")
    .trim();
}

function wordCount(text) {
  const plain = plainFromMarkup(text);
  const matches = plain.match(/[A-Za-z0-9$][A-Za-z0-9$'’&.-]*/g);
  return matches?.length ?? 0;
}

function parsePage(pageText) {
  const lines = pageText.split(/\r?\n/);
  const pageHeader = lines[0].trim();
  const pageMatch = pageHeader.match(/^# PAGE (\d+)\s+[—-]\s+(.+)$/);
  if (!pageMatch) fail(`Invalid page header: ${pageHeader}`);

  const slug = fieldValue(lines, "SLUG");
  const seoTitle = fieldValue(lines, "SEO TITLE");
  const seoDescription = fieldValue(lines, "META DESCRIPTION");
  const h1 = fieldValue(lines, "H1");

  const introIndex = lines.findIndex((line) => line.trim() === "INTRO:");
  if (introIndex < 0) fail(`Missing INTRO for ${slug}`);

  const firstSectionIndex = lines.findIndex(
    (line, index) => index > introIndex && /^##\s+/.test(line.trim()),
  );
  const introEnd = firstSectionIndex >= 0 ? firstSectionIndex : lines.length;
  const introLines = lines.slice(introIndex + 1, introEnd);
  const introParagraphs = paragraphsFromLines(introLines);

  const sections = [];
  let cursor = firstSectionIndex;
  while (cursor >= 0 && cursor < lines.length) {
    const headingLine = lines[cursor]?.trim() ?? "";
    if (!headingLine.startsWith("## ")) break;

    const title = headingLine.slice(3).trim();
    let next = cursor + 1;
    while (next < lines.length && !lines[next].trim().startsWith("## ")) next += 1;

    const bodyLines = lines.slice(cursor + 1, next);
    const bodyParagraphs = paragraphsFromLines(bodyLines);

    sections.push({
      title,
      paragraphs: bodyParagraphs,
    });

    cursor = next < lines.length ? next : -1;
  }

  if (!introParagraphs.length) fail(`Empty INTRO for ${slug}`);
  if (!sections.length) fail(`No H2 sections found for ${slug}`);

  const blocks = sections.map((section, index) => {
    const sectionPlain = section.paragraphs.join("\n\n");
    return {
      id: `${slug}-${index + 1}`,
      kind: "text",
      eyebrow: "",
      title: section.title,
      text: encodeRichText(section.paragraphs),
      items: "",
      button_label: "",
      button_url: "",
      tone: "light",
      is_visible: true,
    };
  });

  const totalText = [
    introParagraphs.join("\n\n"),
    ...sections.flatMap((section) => [section.title, section.paragraphs.join("\n\n")]),
  ].join("\n\n");

  return {
    ordinal: Number(pageMatch[1]),
    slug,
    seo_title: seoTitle,
    seo_description: seoDescription,
    title: h1,
    intro: encodeRichText(introParagraphs),
    blocks,
    section_count: sections.length,
    plain_text_word_count: wordCount(totalText),
  };
}

if (!fs.existsSync(INPUT)) fail(`Canonical source not found: ${INPUT}`);

const markdown = fs.readFileSync(INPUT, "utf8");
const sourceSha256 = crypto.createHash("sha256").update(markdown).digest("hex");

const pageStartRegex = /^# PAGE \d+\s+[—-]\s+.+$/gm;
const starts = [...markdown.matchAll(pageStartRegex)].map((match) => match.index);
if (starts.length !== 11) fail(`Expected exactly 11 pages, found ${starts.length}`);

const pages = starts.map((start, index) => {
  const end = starts[index + 1] ?? markdown.length;
  return parsePage(markdown.slice(start, end).trim());
}).sort((a, b) => a.ordinal - b.ordinal);

const slugs = pages.map((page) => page.slug);
if (new Set(slugs).size !== 11) fail("Duplicate page slug detected");

const expectedSlugs = [
  "about",
  "faq",
  "rates-fees",
  "responsible-lending",
  "contact",
  "privacy-policy",
  "terms-of-use",
  "e-consent",
  "advertiser-disclosure",
  "do-not-sell-share",
  "disclaimer",
];
for (const slug of expectedSlugs) {
  if (!slugs.includes(slug)) fail(`Missing expected page slug: ${slug}`);
}

const markerLeaks = pages.flatMap((page) => [
  page.intro,
  ...page.blocks.map((block) => block.text),
]).filter((value) => /\[\[(?:LINK:|CFPB_SOURCE|FTC_SOURCE)/.test(value));

if (markerLeaks.length) fail("Unconverted canonical marker remains in generated rich text");

const generatedPages = pages.map(({ ordinal, ...page }) => page);

const banner = `/* AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
 * Source: docs/cashpath/cashpath-final-seo-content-2.2.md
 * Source SHA-256: ${sourceSha256}
 * Regenerate with: node scripts/generate-cashpath-seo-content.mjs
 */`;

const output = `${banner}

export const CASH_PATH_FINAL_SEO_SOURCE_SHA256 = ${JSON.stringify(sourceSha256)};

export const CASH_PATH_FINAL_SEO_PAGES = ${JSON.stringify(generatedPages, null, 2)} as const;

export type CashPathFinalSeoPage = (typeof CASH_PATH_FINAL_SEO_PAGES)[number];

export function cashPathFinalSeoPage(slug: string): CashPathFinalSeoPage | undefined {
  return CASH_PATH_FINAL_SEO_PAGES.find((page) => page.slug === slug);
}
`;

if (CHECK) {
  if (!fs.existsSync(OUTPUT)) fail(`Generated file missing: ${OUTPUT}`);
  const current = fs.readFileSync(OUTPUT, "utf8");
  if (current !== output) {
    fail("Generated file is stale. Run node scripts/generate-cashpath-seo-content.mjs");
  }
  console.log(`CashPath SEO content generated file is current (${sourceSha256.slice(0, 12)}).`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, output, "utf8");

console.log(`Generated ${path.relative(ROOT, OUTPUT)}`);
console.log(`Source SHA-256: ${sourceSha256}`);
console.log(`Pages: ${pages.length}`);
for (const page of pages) {
  console.log(`${page.slug}: ${page.section_count} sections, ~${page.plain_text_word_count} words`);
}
