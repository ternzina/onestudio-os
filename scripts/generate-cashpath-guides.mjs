#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputDirectory = path.join(root, "docs/cashpath/guides");
const outputFile = path.join(
  root,
  "lib/public-site/cashpath-guides.generated.ts",
);
const check = process.argv.includes("--check");
const richTextPrefix = "__osrt1__:";

function fail(message) {
  console.error(`CashPath guide generator: ${message}`);
  process.exit(1);
}

function plainText(value) {
  return value
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
}

function inlineNodes(value) {
  const nodes = [];
  const pushText = (text) => {
    if (!text) return;
    const previous = nodes.at(-1);
    if (previous?.type === "text") previous.text += text;
    else nodes.push({ type: "text", text });
  };
  let index = 0;

  while (index < value.length) {
    const rest = value.slice(index);
    const link = rest.match(
      /^\[([^\]]+)\]\((\/p\/[a-z0-9-]+|https:\/\/[^)]+)\)/,
    );
    if (link) {
      nodes.push({ type: "a", href: link[2], children: inlineNodes(link[1]) });
      index += link[0].length;
      continue;
    }
    const strong = rest.match(/^\*\*([^*]+)\*\*/);
    if (strong) {
      nodes.push({ type: "strong", children: inlineNodes(strong[1]) });
      index += strong[0].length;
      continue;
    }
    const emphasis = rest.match(/^\*([^*]+)\*/);
    if (emphasis) {
      nodes.push({ type: "em", children: inlineNodes(emphasis[1]) });
      index += emphasis[0].length;
      continue;
    }
    const underscoreEmphasis = rest.match(/^_([^_]+)_/);
    if (underscoreEmphasis) {
      nodes.push({ type: "em", children: inlineNodes(underscoreEmphasis[1]) });
      index += underscoreEmphasis[0].length;
      continue;
    }
    const markers = [
      value.indexOf("[", index),
      value.indexOf("*", index),
      value.indexOf("_", index),
    ].filter((candidate) => candidate >= 0);
    const next = markers.length ? Math.min(...markers) : value.length;
    if (next === index) {
      pushText(value[index]);
      index += 1;
    } else {
      pushText(value.slice(index, next));
      index = next;
    }
  }
  return nodes;
}

function encodeRichText(nodes) {
  return `${richTextPrefix}${JSON.stringify({ version: 1, root: { type: "root", children: nodes } })}`;
}

function parseFrontmatter(source, file) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) fail(`${file} must start with YAML frontmatter`);
  const values = Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf(":");
        if (separator < 1) fail(`Invalid frontmatter in ${file}: ${line}`);
        return [
          line.slice(0, separator).trim(),
          line
            .slice(separator + 1)
            .trim()
            .replace(/^"|"$/g, ""),
        ];
      }),
  );
  for (const key of [
    "slug",
    "nav_label",
    "eyebrow",
    "seo_title",
    "seo_description",
  ]) {
    if (!values[key]) fail(`Missing ${key} in ${file}`);
  }
  return { values, body: match[2].trim() };
}

function parseGuide(source, file) {
  const { values, body } = parseFrontmatter(source, file);
  const lines = body.split(/\r?\n/);
  if (!lines[0]?.startsWith("# ")) fail(`${file} must begin with an H1`);
  const title = lines[0].slice(2).trim();
  const sections = [];
  let introLines = [];
  let section = null;
  for (const raw of lines.slice(1)) {
    if (raw.startsWith("## ")) {
      if (section) sections.push(section);
      section = { title: raw.slice(3).trim(), lines: [] };
    } else if (section) section.lines.push(raw);
    else introLines.push(raw);
  }
  if (section) sections.push(section);
  if (sections.length < 1) fail(`${file} has no H2 sections`);

  const contentNodes = (sectionLines) => {
    const nodes = [];
    let paragraph = [];
    let bullets = [];
    const flushParagraph = () => {
      const text = paragraph.join(" ").trim();
      if (text) nodes.push({ type: "p", children: inlineNodes(text) });
      paragraph = [];
    };
    const flushBullets = () => {
      if (bullets.length)
        nodes.push({
          type: "ul",
          children: bullets.map((bullet) => ({
            type: "li",
            children: inlineNodes(bullet),
          })),
        });
      bullets = [];
    };
    for (const raw of sectionLines) {
      const line = raw.trim();
      if (!line) {
        flushParagraph();
        flushBullets();
      } else if (line.startsWith("- ")) {
        flushParagraph();
        bullets.push(line.slice(2).trim());
      } else {
        flushBullets();
        paragraph.push(line);
      }
    }
    flushParagraph();
    flushBullets();
    return nodes;
  };

  const introNodes = contentNodes(introLines);
  if (!introNodes.length) fail(`${file} has no intro`);
  const blocks = sections.map((item, index) => ({
    id: `${values.slug}-${index + 1}`,
    kind: "text",
    eyebrow: "",
    title: item.title,
    text: encodeRichText(contentNodes(item.lines)),
    items: "",
    button_label: "",
    button_url: "",
    tone: "light",
    is_visible: true,
  }));
  const words =
    plainText(
      [
        title,
        ...introLines,
        ...sections.flatMap((item) => [item.title, ...item.lines]),
      ].join(" "),
    ).match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g)?.length ?? 0;
  return {
    id: values.slug,
    type: "custom",
    slug: values.slug,
    nav_label: values.nav_label,
    eyebrow: values.eyebrow,
    title,
    intro: encodeRichText(introNodes),
    is_visible: true,
    show_in_navigation: false,
    show_booking_cta: false,
    seo_title: values.seo_title,
    seo_description: values.seo_description,
    seo_no_index: false,
    blocks,
    section_count: sections.length,
    plain_text_word_count: words,
  };
}

if (!fs.existsSync(inputDirectory)) fail("Guide source directory is missing");
const files = fs
  .readdirSync(inputDirectory)
  .filter((file) => file.endsWith(".md"))
  .sort();
if (!files.length) fail("No guide markdown files found");
const source = files.map((file) => ({
  file,
  content: fs.readFileSync(path.join(inputDirectory, file), "utf8"),
}));
const sourceSha256 = crypto
  .createHash("sha256")
  .update(source.map(({ file, content }) => `${file}\n${content}`).join("\n"))
  .digest("hex");
const guides = source.map(({ file, content }) => parseGuide(content, file));
if (new Set(guides.map((guide) => guide.slug)).size !== guides.length)
  fail("Duplicate guide slug");

const banner = `/* AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.\n * Source: docs/cashpath/guides/*.md\n * Source SHA-256: ${sourceSha256}\n * Regenerate with: node scripts/generate-cashpath-guides.mjs\n */`;
const output = `${banner}\n\nimport type { PublicSitePage } from "./types.ts";\n\nexport const CASH_PATH_GUIDES_SOURCE_SHA256 = ${JSON.stringify(sourceSha256)};\n\nexport type CashPathGuide = PublicSitePage & { section_count: number; plain_text_word_count: number };\n\nexport const CASH_PATH_GUIDES: CashPathGuide[] = ${JSON.stringify(guides, null, 2)};\n`;

if (check) {
  if (
    !fs.existsSync(outputFile) ||
    fs.readFileSync(outputFile, "utf8") !== output
  )
    fail(
      "Generated file is stale. Run node scripts/generate-cashpath-guides.mjs",
    );
  console.log(
    `CashPath guides generated file is current (${sourceSha256.slice(0, 12)}).`,
  );
} else {
  fs.writeFileSync(outputFile, output, "utf8");
  console.log(
    `Generated ${path.relative(root, outputFile)} (${guides.length} guide${guides.length === 1 ? "" : "s"}).`,
  );
}
