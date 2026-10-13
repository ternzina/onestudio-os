import revisions from "./metadata-revisions.json" with { type: "json" };

// Editorial budgets, including any branding. Search engines may still rewrite
// snippets or truncate them by pixel width; these are not indexing guarantees.
export const GUIDE_TITLE_LIMIT = 65;
export const GUIDE_DESCRIPTION_LIMIT = 160;
const BRAND_SUFFIX = " | OneStudio OS";
const titles: Readonly<Record<string, string>> = revisions.titles;
const descriptions: Readonly<Record<string, string>> = revisions.descriptions;

const length = (value: string) => Array.from(value).length;
const normalize = (value: string) => value.replace(/\s+/gu, " ").trim();

function boundedText(value: string, limit: number): string {
  if (length(value) <= limit) return value;
  const prefix = Array.from(value).slice(0, limit - 1).join("");
  const lastSpace = prefix.lastIndexOf(" ");
  const words = lastSpace > limit / 2 ? prefix.slice(0, lastSpace) : prefix;
  return `${words.replace(/[\s,;:|+&.\-]+$/u, "")}…`;
}

/**
 * Keep search copy separate from the visible introduction and Article schema.
 * Revisions are keyed by exact source text, so a later CMS edit cannot silently
 * inherit stale copy. Unreviewed long text still gets a bounded fallback, even
 * when it is published through the CMS/cron instead of the Markdown publisher.
 */
export function getGuideSeoFields(article: { title: string; description: string }) {
  const revisedTitle = Object.hasOwn(titles, article.title) ? titles[article.title] : article.title;
  const revisedDescription = Object.hasOwn(descriptions, article.description)
    ? descriptions[article.description] : article.description;
  const unbranded = normalize(revisedTitle).replace(/(?:\s*\|\s*OneStudio(?:\s+OS)?)+\s*$/iu, "").trim();
  const title = boundedText(unbranded, GUIDE_TITLE_LIMIT);
  const branded = `${title}${BRAND_SUFFIX}`;
  return {
    title: length(branded) <= GUIDE_TITLE_LIMIT ? branded : title,
    description: boundedText(normalize(revisedDescription), GUIDE_DESCRIPTION_LIMIT),
  };
}
