const SEO_TITLE_LIMIT = 70;
const NAV_LABEL_LIMIT = 52;

function naturalTitle(pageTitle: string, brandName: string): string {
  const title = pageTitle.trim();
  const brand = brandName.trim();
  if (!title) return "";
  if (!brand) return title;
  const folded = title.toLowerCase();
  const brandFolded = brand.toLowerCase();
  if (folded === brandFolded || folded.endsWith(`| ${brandFolded}`)) return title;
  return `${title} | ${brand}`;
}

function endsMidWord(value: string, fuller: string): boolean {
  if (!fuller.startsWith(value) || fuller.length === value.length) return false;
  const last = value.at(-1) ?? "";
  const next = fuller[value.length] ?? "";
  return /[\p{L}\p{N}]/u.test(last) && /[\p{L}\p{N}]/u.test(next);
}

export function restoreClippedSeoTitle(seoTitle: string, pageTitle: string, brandName: string): { seoTitle: string; restored: boolean } {
  const seo = seoTitle.trim();
  const heading = pageTitle.trim();
  const natural = naturalTitle(heading, brandName);
  if (!seo || !heading || !natural || seo === natural || natural.length <= seo.length) {
    return { seoTitle: seo, restored: false };
  }
  if (seo === heading) {
    if (seo.length === SEO_TITLE_LIMIT) return { seoTitle: natural, restored: true };
    return { seoTitle: seo, restored: false };
  }
  const prefix = natural.startsWith(seo) || heading.startsWith(seo);
  const headingIsShorter = heading.length < seo.length;
  if (headingIsShorter && !prefix) return { seoTitle: seo, restored: false };
  if (seo.endsWith(`| ${brandName.trim()}`) || seo.toLowerCase().endsWith(brandName.trim().toLowerCase())) {
    return { seoTitle: seo, restored: false };
  }
  const atLimit = seo.length === SEO_TITLE_LIMIT;
  const nearLimit = seo.length >= SEO_TITLE_LIMIT - 5 && seo.length < SEO_TITLE_LIMIT;
  const dangling = /\|\s*$/.test(seo);
  const brokenPrefix = prefix && (endsMidWord(seo, heading) || endsMidWord(seo, natural) || dangling || (heading.startsWith(seo) && heading.length > seo.length));
  if (atLimit && (prefix || heading.length > seo.length)) return { seoTitle: natural, restored: true };
  if (dangling && heading.length > seo.length) return { seoTitle: natural, restored: true };
  if (nearLimit && brokenPrefix) return { seoTitle: natural, restored: true };
  return { seoTitle: seo, restored: false };
}

export function restoreClippedNavLabel(navLabel: string, pageTitle: string, seoRestored: boolean): string {
  const nav = navLabel.trim();
  const title = pageTitle.trim();
  if (!title) return nav;
  if (seoRestored) return title;
  if (!nav || nav === title || !title.startsWith(nav) || title.length <= nav.length) return nav || title;
  const nearCap = nav.length >= NAV_LABEL_LIMIT - 2 && nav.length <= NAV_LABEL_LIMIT;
  if (nearCap || endsMidWord(nav, title)) return title;
  return nav;
}
