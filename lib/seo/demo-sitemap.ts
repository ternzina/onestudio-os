import { DEMOS } from "../demo-catalog.ts";
import { getPublicDemoTemplateChoices } from "../public-site/template-catalog.ts";
import { createCanonicalGlossDemoSite, GLOSS_DEMO_BASE_PATH } from "../public-site/gloss-demo.ts";
import { createCanonicalVeloraDemoSite, veloraDemoBasePath } from "../public-site/velora-demo.ts";
import { createCanonicalVowDemoSite, vowDemoBasePath } from "../public-site/vow-demo.ts";
import { LOCALIZED_DEMO_PATHS } from "./demo-metadata.ts";
import { demoPagePaths } from "./demo-pages.ts";

// Sitemap and IndexNow use the same public catalog and the pages rendered by each demo.
export function publicDemoPaths() {
  const catalogPaths = getPublicDemoTemplateChoices()
    .map((template) => template.gallery.previewRoute)
    .filter((path): path is string => Boolean(path));
  return [...new Set([
    ...DEMOS.map((demo) => `/demos/${demo.slug}`),
    ...catalogPaths,
    ...LOCALIZED_DEMO_PATHS,
    ...demoPagePaths(createCanonicalGlossDemoSite(), GLOSS_DEMO_BASE_PATH),
    ...(["ru", "en"] as const).flatMap((locale) => [
      veloraDemoBasePath(locale),
      ...demoPagePaths(createCanonicalVeloraDemoSite(locale), veloraDemoBasePath(locale)),
      ...demoPagePaths(createCanonicalVowDemoSite(locale), vowDemoBasePath(locale)),
    ]),
  ])];
}
