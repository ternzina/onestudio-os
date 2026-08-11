import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PREMIUM_DEMOS } from "../lib/demo-catalog.ts";
import { getPremiumTemplateCustomPageRuntime } from "../lib/public-site/premium-template-custom-page-runtime-registry.ts";
import { getPremiumTemplateEditorAdapter } from "../lib/public-site/premium-template-editor-registry.ts";
import { getPremiumTemplatePackage } from "../lib/public-site/premium-template-package-catalog.ts";
import { PREMIUM_TEMPLATE_PACKAGE_SOURCE } from "../lib/public-site/premium-template-package-source.mjs";
import { getPremiumTemplateDefinition } from "../lib/public-site/premium-template-registry.ts";
import { getPremiumTemplatePublicRuntime } from "../lib/public-site/premium-template-runtime-registry.ts";
import {
  TEMPLATE_KEYS,
  getCustomerTemplateChoices,
  getEditorTemplateChoices,
} from "../lib/public-site/template-catalog.ts";
import { createTemplateSeed } from "../lib/public-site/template-seeds.ts";
import {
  resolveVeloraContent,
  withVeloraContent,
} from "../lib/public-site/velora-premium-template-content.ts";
import { DEFAULT_VELORA_CONTENT } from "../lib/public-site/velora-premium-template-content.ts";
import { VELORA_EDITOR_SPECS } from "../lib/public-site/velora-editor-schema.ts";
import { VELORA_PREMIUM_TEMPLATE_CONTRACT } from "../lib/public-site/velora-premium-template-contract.ts";
import { resolveVeloraDemoMetadata } from "../lib/public-site/velora-demo-metadata.ts";

const KEY = "velora-event-venue";
test("VELORA is one canonical package entry with complete manifest metadata", () => {
  assert.equal(
    PREMIUM_TEMPLATE_PACKAGE_SOURCE.filter(
      (item) => item.manifest.templateKey === KEY,
    ).length,
    1,
  );
  assert.equal(
    PREMIUM_TEMPLATE_PACKAGE_SOURCE.some((item) =>
      /bembi/i.test(item.manifest.templateKey),
    ),
    false,
  );
  const manifest = getPremiumTemplatePackage(KEY)!;
  assert.deepEqual(
    {
      name: manifest.name,
      category: manifest.category,
      route: manifest.preview.route,
      image: manifest.preview.image,
    },
    {
      name: "VELORA HOUSE",
      category: "events",
      route: "/demos/velora-event-venue",
      image: "/templates/velora/hero-cinematic.webp",
    },
  );
  const demo = PREMIUM_DEMOS.find((item) => item.slug === KEY)!;
  assert.equal(demo.href, manifest.preview.route);
  assert.deepEqual(demo.title, manifest.preview.title);
  assert.deepEqual(demo.description, manifest.preview.description);
  assert.equal(demo.previewImage, manifest.preview.image);
  assert.equal(demo.group, "events");
});
test("all generated capability lookups resolve isolated VELORA implementations", () => {
  assert.ok(TEMPLATE_KEYS.includes(KEY));
  assert.ok(getCustomerTemplateChoices().some((item) => item.key === KEY));
  assert.ok(getEditorTemplateChoices().some((item) => item.key === KEY));
  assert.equal(getPremiumTemplateDefinition(KEY)?.templateKey, KEY);
  assert.equal(getPremiumTemplateEditorAdapter(KEY)?.templateKey, KEY);
  assert.equal(getPremiumTemplatePublicRuntime(KEY)?.templateKey, KEY);
  assert.equal(getPremiumTemplateCustomPageRuntime(KEY)?.templateKey, KEY);
  assert.notEqual(
    getPremiumTemplateEditorAdapter(KEY),
    getPremiumTemplateEditorAdapter("gloss-nail-studio"),
  );
  assert.notEqual(
    getPremiumTemplatePublicRuntime(KEY),
    getPremiumTemplatePublicRuntime("premium-studio"),
  );
  for (const lookup of [
    getPremiumTemplatePackage,
    getPremiumTemplateDefinition,
    getPremiumTemplateEditorAdapter,
    getPremiumTemplatePublicRuntime,
    getPremiumTemplateCustomPageRuntime,
  ]) {
    assert.equal(lookup("unknown"), undefined);
    assert.equal(lookup("premium-kids-center"), undefined);
  }
});
test("VELORA seed, normalization and JSON reload preserve namespace, layout, pages and custom blocks", () => {
  const seed = createTemplateSeed(KEY);
  assert.equal(seed.template_id, KEY);
  const velora = resolveVeloraContent(seed);
  assert.equal(velora.brand, "VELORA");
  assert.equal(seed.pages?.length, 2);
  assert.deepEqual(
    seed.pages?.map((page) => page.slug),
    ["venues", "packages"],
  );
  velora.hero.title = "Свой заголовок";
  const custom = {
    id: "velora-story",
    kind: "text" as const,
    eyebrow: "",
    title: "История",
    text: "Сохранить",
    items: "",
    button_label: "",
    button_url: "",
    tone: "light" as const,
    is_visible: true,
  };
  const changed = withVeloraContent(
    {
      ...seed,
      custom_blocks: [custom],
      layout_order: [...(seed.layout_order ?? []), "custom:velora-story"],
    },
    velora,
  );
  const adapter = getPremiumTemplateEditorAdapter(KEY)!;
  const normalized = {
    ...changed,
    layout_order: adapter.normalizeLayout(changed.layout_order ?? [], [
      custom.id,
    ]),
  };
  const reload = JSON.parse(JSON.stringify(normalized));
  assert.equal(resolveVeloraContent(reload).hero.title, "Свой заголовок");
  assert.deepEqual(reload.custom_blocks, [custom]);
  assert.ok(reload.layout_order.includes("custom:velora-story"));
  assert.deepEqual(
    reload.pages.map((page: { slug: string }) => page.slug),
    ["venues", "packages"],
  );
});
test("VELORA public graph is lazy and demo catalog graph cannot reach implementations", async () => {
  const runtime = await readFile(
    new URL(
      "../lib/public-site/velora-premium-template-runtime-adapter.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const demos = await readFile(
    new URL("../lib/demo-catalog.ts", import.meta.url),
    "utf8",
  );
  assert.match(runtime, /dynamic</);
  assert.doesNotMatch(demos, /velora-premium-template-(seed|editor|runtime)/);
  assert.doesNotMatch(runtime, /velora-premium-template-seed/);
});

test("VELORA owns all 17 native scenes and exposes complete non-delimited inspector paths", () => {
  assert.equal(VELORA_PREMIUM_TEMPLATE_CONTRACT.nativeSections.length, 17);
  assert.deepEqual(
    VELORA_PREMIUM_TEMPLATE_CONTRACT.nativeSections.map((item) => item.id),
    [
      "hero",
      "facts",
      "venues",
      "formats",
      "transformation",
      "story",
      "packages",
      "included",
      "catering",
      "decor",
      "coordinator",
      "reviews",
      "gallery",
      "planner",
      "faq",
      "availability",
      "footer",
    ],
  );
  const specs = Object.values(VELORA_EDITOR_SPECS).flat();
  for (const presentation of [
    "venuesPresentation",
    "formatsPresentation",
    "storyPresentation",
    "packagesPresentation",
    "includedPresentation",
    "galleryPresentation",
    "cateringPresentation",
    "plannerPresentation",
    "reviewsPresentation",
    "faqPresentation",
  ]) {
    assert.ok(
      specs.some((field) => field.path === `${presentation}.title`),
      `${presentation} heading has an editor path`,
    );
  }
  assert.equal(
    specs.some((field) => field.label.includes("|")),
    false,
  );
  assert.equal(
    specs.some((field) => "keys" in field),
    false,
  );
  assert.ok(specs.filter((field) => field.kind === "richText").length >= 20);
});

test("VELORA image slots are independent media fields with adjacent alt paths", () => {
  const specs = Object.values(VELORA_EDITOR_SPECS).flat();
  const imagePaths = [
    "hero.image",
    "transformation.beforeImage",
    "transformation.afterImage",
    "cateringPresentation.image",
    "decor.image",
    "coordinator.image",
    ...DEFAULT_VELORA_CONTENT.venues.map((_, index) => `venues.${index}.image`),
    ...DEFAULT_VELORA_CONTENT.packages.map(
      (_, index) => `packages.${index}.image`,
    ),
    ...DEFAULT_VELORA_CONTENT.reviews.map(
      (_, index) => `reviews.${index}.image`,
    ),
    ...DEFAULT_VELORA_CONTENT.gallery.map(
      (_, index) => `gallery.${index}.image`,
    ),
  ];
  const altPaths = [
    "hero.alt",
    "transformation.beforeAlt",
    "transformation.afterAlt",
    "cateringPresentation.alt",
    "decor.alt",
    "coordinator.alt",
    ...DEFAULT_VELORA_CONTENT.venues.map((_, index) => `venues.${index}.alt`),
    ...DEFAULT_VELORA_CONTENT.packages.map(
      (_, index) => `packages.${index}.alt`,
    ),
    ...DEFAULT_VELORA_CONTENT.reviews.map((_, index) => `reviews.${index}.alt`),
    ...DEFAULT_VELORA_CONTENT.gallery.map((_, index) => `gallery.${index}.alt`),
  ];
  for (const path of imagePaths)
    assert.ok(
      specs.some(
        (field) =>
          field.path === path &&
          field.group === "media" &&
          field.kind === "url",
      ),
      path,
    );
  for (const path of altPaths)
    assert.ok(
      specs.some((field) => field.path === path && field.group === "media"),
      path,
    );
});

test("VELORA inspector uses the shared media picker and palette reset restores package defaults", () => {
  const seed = createTemplateSeed(KEY);
  const adapter = getPremiumTemplateEditorAdapter(KEY)!;
  const targets: Array<{ kind: string; path?: string }> = [];
  for (const sectionId of ["hero", "venues", "gallery"] as const) {
    const fields = adapter.buildInspectorFields({
      content: seed,
      sectionId,
      disabled: false,
      onChange() {},
      onChooseMedia(target) {
        targets.push(target);
      },
    });
    for (const field of fields)
      if (field.type === "button" && field.id.endsWith("-picker"))
        field.onClick();
  }
  assert.deepEqual(
    targets
      .filter((target) => target.kind === "template-content")
      .map((target) => target.path),
    [
      "hero.image",
      "venues.0.image",
      "venues.1.image",
      "venues.2.image",
      "gallery.0.image",
      "gallery.1.image",
      "gallery.2.image",
      "gallery.3.image",
      "gallery.4.image",
      "gallery.5.image",
    ],
  );
  const changed = withVeloraContent(
    {
      ...seed,
      theme_dark: "#000001",
      theme_accent: "#000002",
      theme_surface: "#000003",
    },
    { ...resolveVeloraContent(seed), plum: "#000004" },
  );
  const reset = adapter.resetSection(changed, "hero");
  assert.equal(reset.theme_dark, "#07101E");
  assert.equal(reset.theme_accent, "#D6B56E");
  assert.equal(reset.theme_surface, "#F6F0E5");
  assert.equal(resolveVeloraContent(reset).plum, "#2D394F");
});

test("VELORA normalization repairs partial items and invalid images without changing saved symbols", () => {
  const seed = createTemplateSeed(KEY);
  const raw = structuredClone(DEFAULT_VELORA_CONTENT);
  raw.venues[0] = { name: "Зал | Ω", image: "", alt: "Alt | Юнікод" };
  raw.gallery[2] = { image: "javascript:bad", alt: "Кадр | 三" };
  const reload = JSON.parse(JSON.stringify(withVeloraContent(seed, raw)));
  const normalized = resolveVeloraContent(reload);
  assert.equal(normalized.venues[0].name, "Зал | Ω");
  assert.equal(normalized.venues[0].alt, "Alt | Юнікод");
  assert.equal(
    normalized.venues[0].capacity,
    DEFAULT_VELORA_CONTENT.venues[0].capacity,
  );
  assert.equal(
    normalized.venues[0].image,
    DEFAULT_VELORA_CONTENT.venues[0].image,
  );
  assert.equal(normalized.gallery[2].alt, "Кадр | 三");
  assert.equal(
    normalized.gallery[2].image,
    DEFAULT_VELORA_CONTENT.gallery[2].image,
  );
});

test("VELORA palette reaches CSS variables and public copy uses safe rich-text runtime", async () => {
  const siteSource = await readFile(
    new URL("../components/public/velora/VeloraSite.tsx", import.meta.url),
    "utf8",
  );
  const css = await readFile(
    new URL("../components/public/velora/Velora.module.css", import.meta.url),
    "utf8",
  );
  assert.match(siteSource, /"--velora-bg": site\.content\.theme_dark/);
  assert.match(siteSource, /"--velora-gold": site\.content\.theme_accent/);
  assert.match(siteSource, /"--velora-fg": site\.content\.theme_surface/);
  assert.match(siteSource, /"--velora-elevated": content\.plum/);
  assert.match(siteSource, /"--velora-warm": content\.warm/);
  assert.match(siteSource, /PublicRichText/);
  assert.doesNotMatch(siteSource, /dangerouslySetInnerHTML/);
  for (const variable of [
    "bg",
    "elevated",
    "fg",
    "muted",
    "gold",
    "secondary",
    "border",
    "warm",
    "overlay",
    "button-fg",
  ])
    assert.match(css, new RegExp(`var\\(--velora-${variable}\\)`));
});

test("VELORA form carries the complete request and CTA selection behavior", async () => {
  const interactions = await readFile(
    new URL(
      "../components/public/velora/VeloraInteractions.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  for (const name of [
    "date",
    "eventType",
    "guests",
    "venue",
    "package",
    "name",
    "email",
    "phone",
  ])
    assert.match(interactions, new RegExp(`name=\\"${name}\\"`));
  assert.match(interactions, /Пакет: \$\{data\.get\("package"\)\}/);
  assert.match(interactions, /status === "sending"/);
  assert.match(interactions, /aria-live="polite"/);
  assert.match(interactions, /VeloraVenueCta/);
  assert.match(interactions, /VeloraPackageCta/);
  assert.match(interactions, /scrollIntoView/);
});

test("VELORA metadata resolver is route-aware and aliases share canonical URLs", () => {
  const home = resolveVeloraDemoMetadata([])!;
  const englishHome = resolveVeloraDemoMetadata(["en"])!;
  const venues = resolveVeloraDemoMetadata(["venues"])!;
  const englishVenues = resolveVeloraDemoMetadata(["en", "venues"])!;
  const packages = resolveVeloraDemoMetadata(["packages"])!;
  const alias = resolveVeloraDemoMetadata(["p", "venues"])!;
  assert.equal(String(home.alternates?.canonical), "/demos/velora-event-venue");
  assert.equal(
    String(venues.alternates?.canonical),
    "/demos/velora-event-venue/venues",
  );
  assert.equal(
    String(packages.alternates?.canonical),
    "/demos/velora-event-venue/packages",
  );
  assert.equal(
    String(alias.alternates?.canonical),
    String(venues.alternates?.canonical),
  );
  assert.equal(
    String(englishHome.alternates?.canonical),
    "/demos/velora-event-venue/en",
  );
  assert.equal(
    String(englishVenues.alternates?.canonical),
    "/demos/velora-event-venue/en/venues",
  );
  assert.equal(englishHome.openGraph?.locale, "en_GB");
  assert.equal(
    englishVenues.alternates?.languages?.ru,
    "/demos/velora-event-venue/venues",
  );
  assert.notEqual(home.title, englishHome.title);
  assert.notEqual(home.title, venues.title);
  assert.notEqual(venues.title, packages.title);
  assert.equal(venues.twitter?.title, venues.openGraph?.title);
  assert.equal(resolveVeloraDemoMetadata(["unknown"]), null);
  assert.equal(resolveVeloraDemoMetadata(["p", "unknown"]), null);
});

test("VELORA custom pages use stable built-in identity and arbitrary pages render blocks only", async () => {
  const source = await readFile(
    new URL(
      "../components/public/velora/VeloraCustomPage.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /page\.id === BUILTIN_VENUES_ID/);
  assert.match(source, /page\.id === BUILTIN_PACKAGES_ID/);
  assert.doesNotMatch(source, /page\.slug === "venues"/);
  assert.match(source, /page\.blocks\?\.map/);
  assert.match(source, /PublicCustomBlock/);
});

test("VELORA lightbox traps and restores focus with complete keyboard semantics", async () => {
  const source = await readFile(
    new URL(
      "../components/public/velora/VeloraInteractions.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  for (const marker of [
    "openerRef",
    'event.key === "Tab"',
    'event.key === "Escape"',
    'event.key === "ArrowRight"',
    'event.key === "ArrowLeft"',
    'aria-modal="true"',
  ])
    assert.match(source, new RegExp(marker));
  assert.match(source, /if \(!items\.length\) return null/);
});

test("VELORA conversion motion layer keeps every promised effect and degrades safely", async () => {
  const site = await readFile(
    new URL("../components/public/velora/VeloraSite.tsx", import.meta.url),
    "utf8",
  );
  const customPage = await readFile(
    new URL("../components/public/velora/VeloraCustomPage.tsx", import.meta.url),
    "utf8",
  );
  const interactions = await readFile(
    new URL(
      "../components/public/velora/VeloraInteractions.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const css = await readFile(
    new URL("../components/public/velora/Velora.module.css", import.meta.url),
    "utf8",
  );

  for (const marker of [
    "VeloraCursorTrail",
    "VeloraStickyHeader",
    "VeloraPageEntrance",
    "VeloraHeroTitle",
    "VeloraFestiveRibbon",
    "VeloraVenueReveal",
  ]) {
    assert.match(site, new RegExp(marker));
  }
  for (const marker of [
    "VeloraCursorTrail",
    "VeloraStickyHeader",
    "VeloraPageEntrance",
    "VeloraHeroTitle",
    "VeloraFestiveRibbon",
  ]) {
    assert.match(customPage, new RegExp(marker));
  }
  assert.match(interactions, /\(hover: hover\) and \(pointer: fine\)/);
  assert.match(interactions, /galleryGhostSet/);
  assert.match(interactions, /velora-ribbon-iridescent/);
  assert.match(interactions, /ribbonTrace/);
  assert.match(interactions, /pathLength="1"/);
  assert.doesNotMatch(interactions, /ribbonTail/);
  assert.doesNotMatch(css, /clip-path:\s*polygon\(0 43%/);
  assert.doesNotMatch(css, /velora-ribbon-(?:pass|draw)[^}]*infinite/);
  assert.match(interactions, /useSpring/);
  assert.match(css, /\.headerScrolled\s*\{/);
  assert.match(css, /@keyframes velora-gallery-travel/);
  assert.match(css, /@keyframes velora-ribbon-pass/);
  assert.match(css, /@keyframes velora-ribbon-draw/);
  assert.match(css, /@media \(hover: none\), \(pointer: coarse\)/);
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.heroRibbon[\s\S]*?display:\s*none/s,
  );
});
