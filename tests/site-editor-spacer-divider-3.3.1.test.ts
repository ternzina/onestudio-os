import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createPublicSiteCoreBlockPreset, resolvePublicSiteBlockDisplayName } from "../lib/public-site/core-block-library.ts";
import { publicSiteCustomBlockVisualCapabilities } from "../lib/public-site/custom-block-registry.ts";
import { isSiteHexColor } from "../lib/public-site/colors.ts";

const read = (path: string) => readFile(new URL(path, import.meta.url), "utf8");

test("Spacer is structural and retains the 3.3 persistence shape", () => {
  const block = createPublicSiteCoreBlockPreset("spacer-divider", "spacer-contract");
  assert.equal(block.id, "spacer-contract");
  assert.equal(block.preset_id, "spacer-divider");
  assert.equal(block.spacer_size, "normal");
  assert.equal(block.show_divider, false);
  assert.equal(block.divider_thickness, 1);
  assert.equal(block.divider_color_mode, "template");
  assert.equal(block.divider_custom_color, undefined);
  assert.deepEqual(publicSiteCustomBlockVisualCapabilities("spacer"), {
    layout: false, spacing: false, sectionHeight: false, colors: false, animation: false,
    mediaSizing: false, mediaPosition: false, mediaFocalPoint: false, mediaSurface: false,
    responsiveMedia: false, multiMediaLayout: false,
  });
});

test("one shared resolver keeps semantic Core Block Library names in EN and RU", () => {
  const ru = (label: string) => ({
    "Spacer / Divider": "Отступ / Разделитель",
    "HTML / Embed": "HTML / Встраивание",
    About: "О нас",
    Services: "Услуги",
    "Pricing / Packages": "Цены / Пакеты",
    "Custom block": "Произвольный блок",
  } as Record<string, string>)[label] ?? label;

  const semantic = [
    ["spacer-divider", "Spacer / Divider", "Отступ / Разделитель"],
    ["html-embed", "HTML / Embed", "HTML / Встраивание"],
    ["about", "About", "О нас"],
    ["services", "Services", "Услуги"],
    ["pricing", "Pricing / Packages", "Цены / Пакеты"],
  ] as const;
  for (const [presetId, en, translated] of semantic) {
    const block = createPublicSiteCoreBlockPreset(presetId, `display-${presetId}`);
    assert.equal(resolvePublicSiteBlockDisplayName(block), en);
    assert.equal(resolvePublicSiteBlockDisplayName(block, ru), translated);
    assert.notEqual(resolvePublicSiteBlockDisplayName(block), "Custom block");
  }

  assert.equal(resolvePublicSiteBlockDisplayName({ kind: "video" }), "Video block");
  assert.equal(resolvePublicSiteBlockDisplayName({ kind: "legacy" as never }), "Custom block");
  assert.equal(resolvePublicSiteBlockDisplayName({ kind: "legacy" as never }, ru), "Произвольный блок");
});

test("standard and premium editors use the shared semantic display-name resolver", async () => {
  const [standard, premium] = await Promise.all([
    read("../app/admin/site/page.tsx"),
    read("../components/admin/PremiumTemplateEditor.tsx"),
  ]);
  for (const source of [standard, premium]) {
    assert.match(source, /resolvePublicSiteBlockDisplayName\(block, t\)/);
    assert.doesNotMatch(source, /richTextPlainText\(block\.title\) \|\| t\("Custom block"\)/);
  }
  assert.match(standard, /selectedCustomBlock \? resolvePublicSiteBlockDisplayName\(selectedCustomBlock, t\)/);
  assert.match(premium, /selectedPageBlock \? resolvePublicSiteBlockDisplayName\(selectedPageBlock, t\)/);
});

test("3.3.1 additively persists bounded spacer-only Divider appearance", async () => {
  const [base, migration, sqlTests] = await Promise.all([
    read("../supabase/migrations/20260813160000_site_editor_core_block_library_3_3.sql"),
    read("../supabase/migrations/20260813173000_site_editor_spacer_divider_3_3_1.sql"),
    read("../supabase/tests/onestudio-site-editor-spacer-divider-3-3-1-tests.sql"),
  ]);
  assert.match(base, /'spacer_size'/);
  assert.doesNotMatch(base, /divider_thickness|divider_color_mode|divider_custom_color/);
  assert.match(migration, /normalize_public_site_custom_blocks_v331_base\(p_blocks\)/);
  assert.match(migration, /source\.block->>'kind' = 'spacer'/);
  assert.match(migration, /divider_thickness[^]*in \('1','2','3'\)[^]*else 1/);
  assert.match(migration, /divider_color_mode[^]*in \('template','accent','custom'\)[^]*else 'template'/);
  assert.match(migration, /divider_custom_color[^]*\^#\[0-9a-fA-F\]\{6\}\$/);
  assert.match(migration, /lower\(source\.block->>'divider_custom_color'\)/);
  assert.match(sqlTests, /invalid custom color does not survive/);
  assert.match(sqlTests, /existing 3\.3 spacer normalization is preserved/);
  assert.ok(isSiteHexColor("#a1B2c3"));
  assert.equal(isSiteHexColor("red"), false);
});

test("Standard selection uses one custom block marker contract on home and custom pages", async () => {
  const [standard, runtime] = await Promise.all([
    read("../app/admin/site/page.tsx"),
    read("../components/public/PublicCustomBlock.tsx"),
  ]);
  assert.match(standard, /anchorId={`custom:\$\{block\.id\}`}[^]*?<CustomBlockPreview block={block}/);
  assert.match(standard, /data-editor-anchor={`custom:\$\{block\.id\}`}/);
  assert.match(standard, /querySelector<HTMLElement>\(\s*`\[data-editor-anchor="\$\{anchor\}"\]`/);
  assert.match(runtime, /data-public-custom-block-id={block\.id}/);
});

test("Spacer inspectors gate all Divider appearance controls and the custom color picker", async () => {
  const [standard, premium, premiumEditor] = await Promise.all([
    read("../app/admin/site/page.tsx"),
    read("../components/admin/PremiumUniversalBlockSettings.tsx"),
    read("../components/admin/PremiumTemplateEditor.tsx"),
  ]);
  const standardStart = standard.indexOf('if (block.kind === "spacer") return <>');
  const premiumStart = premium.indexOf('if (block.kind === "spacer") return [');
  const standardBranch = standard.slice(standardStart, standard.indexOf("  return (", standardStart));
  const premiumBranch = premium.slice(premiumStart, premium.indexOf("  const visual", premiumStart));
  for (const branch of [standardBranch, premiumBranch]) {
    assert.match(branch, /Spacing size/);
    assert.match(branch, /Compact/);
    assert.match(branch, /Normal/);
    assert.match(branch, /Airy/);
    assert.match(branch, /Show divider line/);
    assert.match(branch, /Divider width/);
    assert.match(branch, /Divider thickness/);
    assert.match(branch, /1 px/);
    assert.match(branch, /2 px/);
    assert.match(branch, /3 px/);
    assert.match(branch, /Divider color/);
    assert.match(branch, /Template/);
    assert.match(branch, /Accent/);
    assert.match(branch, /Custom/);
    assert.match(branch, /divider_color_mode === "custom"/);
    assert.match(branch, /divider_custom_color/);
    assert.match(branch, /Spacer helper/);
    assert.doesNotMatch(branch, /Eyebrow|Heading|RichText|Typography|media|button-action|Text color/);
  }
  assert.match(standardBranch, /block\.show_divider \? <>/);
  assert.match(standardBranch, /<ColorEditor label={t\("Divider custom color"\)}/);
  assert.match(premiumBranch, /block\.show_divider === true \? \[/);
  assert.match(premiumBranch, /type: "color" as const/);
  assert.match(standardBranch, /Show block on site/);
  assert.match(premiumEditor, /universal_block\?\.kind === "spacer" \? "Show block on site"/);
  assert.match(premiumEditor, /selectedPageBlock\.is_visible !== false/);
});

test("Shared runtime applies all widths, thicknesses, and template/accent/custom colors", async () => {
  const runtime = await read("../components/public/PublicCustomBlock.tsx");
  const spacer = runtime.slice(runtime.indexOf('if (block.kind === "spacer")'), runtime.indexOf('if (block.kind === "html_embed")'));
  assert.match(spacer, /compact: "h-8 sm:h-10"/);
  assert.match(spacer, /normal: "h-16 sm:h-20"/);
  assert.match(spacer, /airy: "h-24 sm:h-32"/);
  assert.match(spacer, /data-public-custom-block-id={block\.id}/);
  for (const [value, className] of [["narrow", "max-w-md"], ["medium", "max-w-2xl"], ["wide", "max-w-5xl"], ["full", "max-w-none"]]) {
    assert.match(spacer, new RegExp(`${value}: "${className}"`));
  }
  assert.match(spacer, /block\.divider_thickness === 2 \|\| block\.divider_thickness === 3/);
  assert.match(spacer, /block\.divider_color_mode === "accent"[^]*"var\(--site-accent\)"/);
  assert.match(spacer, /block\.divider_color_mode === "custom" && isSiteHexColor\(block\.divider_custom_color\)/);
  assert.match(spacer, /: "currentColor"/);
  assert.match(spacer, /height: dividerThickness, backgroundColor: dividerColor/);
  assert.match(spacer, /block\.show_divider \? `mx-auto w-full \$\{dividerWidthClass\}`/);
  assert.doesNotMatch(spacer, /paddingTopClass|padding_bottom|section_height/);
});

test("Standard editor preview delegates Spacer to the published shared renderer", async () => {
  const standard = await read("../app/admin/site/page.tsx");
  const start = standard.indexOf('function CustomBlockPreview');
  const spacerPreview = standard.slice(start, standard.indexOf("  const customColors", start));
  assert.match(spacerPreview, /return <PublicCustomBlock block={block} \/>/);
  assert.doesNotMatch(spacerPreview, /dividerWidth|dividerThickness|border-t/);
});

test("Standard, GLOSS, BEMBI, NOIR, VELORA, and custom pages delegate to shared runtime", async () => {
  const paths = [
    "../components/public/PublicBusinessSite.tsx",
    "../components/public/GlossBusinessSite.tsx",
    "../app/demos/premium-studio/PremiumStudioExperience.tsx",
    "../components/public/velora/VeloraSite.tsx",
    "../components/public/PublicCustomPage.tsx",
    "../components/public/NoirCustomPage.tsx",
    "../components/public/velora/VeloraCustomPage.tsx",
    "../app/demos/premium-kids-center/PremiumUniversalBlock.tsx",
  ];
  for (const source of await Promise.all(paths.map(read))) assert.match(source, /PublicCustomBlock/);
  const [home, bembi] = await Promise.all([
    read("../app/demos/premium-kids-center/HomeExperience.tsx"),
    read("../app/demos/premium-kids-center/PremiumUniversalBlock.tsx"),
  ]);
  for (const kind of ["spacer", "html_embed"]) {
    assert.match(home, new RegExp(`case "${kind}"`));
    assert.match(bembi, new RegExp(`"${kind}"`));
  }
  assert.match(bembi, /data-premium-block-id={block\.id}/);
});

test("HTML embed stays sanitized and no template-specific advanced renderers exist", async () => {
  const [runtime, files] = await Promise.all([
    read("../components/public/PublicCustomBlock.tsx"),
    read("../tests/site-editor-core-block-library-3.3.test.ts"),
  ]);
  assert.match(runtime, /sanitizePublicSiteHtml\(block\.html_source\)/);
  assert.match(runtime, /sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin"/);
  assert.doesNotMatch(runtime, /allow-scripts/);
  assert.match(files, /safe HTML and embed contract/);
  const allNamedSources = await Promise.all([
    read("../components/public/BembiCustomPage.tsx"),
    read("../components/public/GlossBusinessSite.tsx"),
    read("../components/public/NoirCustomPage.tsx"),
    read("../components/public/velora/VeloraCustomPage.tsx"),
  ]);
  for (const source of allNamedSources) assert.doesNotMatch(source, /(Bembi|Gloss|Noir|Velora)(Spacer|Html|HTML|Embed)/);
  for (const source of allNamedSources) assert.doesNotMatch(source, /kind === ["']spacer["']/);
});
