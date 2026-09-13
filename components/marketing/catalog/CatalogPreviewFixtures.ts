"use client";

/**
 * Deliberately boring, local-only values for catalog-only mounts.  Production
 * components never import this module: generated catalog entries ask for a
 * fixture at render time instead.  The broad record keeps adapters lightweight
 * while each source implementation remains its single source of truth.
 */
const localMedia = [
  "/images/demos/premium-studio/bright/hero.webp",
  "/images/demos/premium-studio/bright/portfolio-01.webp",
  "/images/demos/premium-studio/bright/scene-dusk.webp",
];

const sampleRow = (index: number) => ({
  id: `catalog-${index}`,
  key: `catalog-${index}`,
  label: index === 0 ? "Northstar" : "Workspace",
  title: index === 0 ? "Build with clarity" : "Move work forward",
  name: index === 0 ? "Avery Stone" : "Morgan Lee",
  description: "A focused catalog preview using safe demonstration content.",
  text: "A focused catalog preview using safe demonstration content.",
  value: index === 0 ? "$4,820" : "24%",
  href: "#catalog-preview",
  url: "#catalog-preview",
  image: localMedia[index % localMedia.length],
  imageUrl: localMedia[index % localMedia.length],
  mediaUrl: localMedia[index % localMedia.length],
  src: localMedia[index % localMedia.length],
  alt: "Catalog demonstration media",
  icon: "✦",
  active: index === 0,
  incoming: index === 0,
  featured: index === 0,
  amount: index === 0 ? "+$4,820" : "−$612",
  role: "Product team",
  date: "Today",
});

const arrayKeys = /(?:items|links|navigation|features|benefits|testimonials|logos|steps|tiers|plans|activity|split|lines|totals|ledger|slides|capabilities|cards|images|media|projects|posts|services|faqs|columns|rows)/i;
const booleanKeys = /(?:loop|open|enabled|visible|show|auto|interactive|drag|paused|muted|dark|compact|loading)/i;
const numberKeys = /(?:count|index|speed|duration|delay|radius|size|width|height|scale|opacity|rating|percent|amount|price)/i;
const mediaKeys = /(?:image|media|photo|avatar|logo|cover|thumbnail|video|src|url)/i;

export function getCatalogFixture(_sourceFile: string, keys: readonly string[]) {
  return Object.fromEntries(keys.map((key) => {
    if (arrayKeys.test(key)) return [key, [sampleRow(0), sampleRow(1), sampleRow(2)]];
    if (booleanKeys.test(key)) return [key, key === "loop" ? false : true];
    if (numberKeys.test(key)) return [key, 3];
    if (mediaKeys.test(key)) return [key, localMedia[0]];
    if (/email/i.test(key)) return [key, "hello@northstar.test"];
    if (/color/i.test(key)) return [key, "#7c3aed"];
    if (/href/i.test(key)) return [key, "#catalog-preview"];
    return [key, key.toLowerCase().includes("heading") ? "Build a better next step" : "Northstar"];
  }));
}

export const catalogLocalMedia = localMedia;
