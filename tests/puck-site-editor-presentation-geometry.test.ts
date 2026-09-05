import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  PUCK_PRODUCTION_MANIFEST,
  PUCK_PRODUCTION_MANIFEST_BY_ID,
} from "../lib/puck-site-editor/registry-manifest.ts";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const entry = (catalogKey: string) => {
  const found = PUCK_PRODUCTION_MANIFEST.find((item) => item.catalogKey === catalogKey);
  assert.ok(found, catalogKey);
  return found;
};

test("Frame Border records source fill semantics separately from editor geometry", () => {
  const frame = PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_frame_border");
  assert.ok(frame);
  assert.equal(frame.catalogKey, "component:frame-border");
  assert.equal(frame.physicalSource, "@/components/react-bits/frame-border");
  assert.equal(frame.presentationContract?.provenance, "source");
  assert.deepEqual(frame.presentationContract?.sourceGeometry, {
    width: { value: "100%", provenance: "source" },
    height: { value: "100%", provenance: "source" },
    definiteParent: { required: true, provenance: "source" },
  });
  assert.deepEqual(frame.presentationContract?.geometry, {
    kind: "fullSurface",
    aspectRatio: { value: 1.64, provenance: "editorPresentationDefault" },
  });
  assert.equal(frame.presentationContract?.editorPresentationDefault, undefined);
  assert.deepEqual(frame.presentationContract?.technicalRuntime, {
    height: { value: 480, provenance: "technicalRuntime" },
  });
  assert.equal(frame.presentationContract?.overflow, "clip");

  const source = read("components/react-bits/frame-border.tsx");
  assert.match(source, /width = "100%"/);
  assert.match(source, /height = "100%"/);
  assert.match(source, /className=\{cn\("relative overflow-hidden"/);
  assert.match(source, /const \{ size, viewport \} = useThree\(\)/);
  assert.match(source, /size\.width \* viewport\.dpr/);
  assert.match(source, /size\.height \* viewport\.dpr/);
  execFileSync("git", ["diff", "--quiet", "HEAD", "--", "components/react-bits/frame-border.tsx"], { cwd: root });
});

test("Frame Border keeps its public technical host beside an authoring-only aspect", () => {
  const frame = entry("component:frame-border");
  assert.equal(frame.presentationContract?.editorPresentationDefault, undefined);
  assert.deepEqual(frame.presentationContract?.technicalRuntime, {
    height: { value: 480, provenance: "technicalRuntime" },
  });
  assert.deepEqual(frame.presentationContract?.geometry.aspectRatio, {
    value: 1.64,
    provenance: "editorPresentationDefault",
  });

  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  const preview = read("components/puck-site-editor/production-preview-fit.tsx");
  assert.doesNotMatch(renderer, /ProductionPreviewViewport|calculateProductionPreviewFit|scale\(/);
  assert.match(renderer, /presentationContract\?\.technicalRuntime/);
  assert.match(renderer, /const usesAuthoringAspectRatio = \(runtimeMode === "authoring" \|\| runtimeMode === "interactive"\)/);
  assert.match(renderer, /presentationContract\?\.technicalRuntime && !usesAuthoringAspectRatio/);
  assert.match(renderer, /presentationGeometry\.aspectRatio\.provenance !== "editorPresentationDefault"/);
  assert.match(renderer, /runtimeMode === "library-preview" && isFullSurface/);
  assert.match(preview, /scene\.style\.width = `\$\{sceneWidth\}px`/);
  assert.match(preview, /scene\.style\.height = `\$\{sceneSize\.height\}px`/);
});

test("Library preview contains intrinsic scenes and directly fills full-surface stages", () => {
  const fit = read("lib/puck-site-editor/preview-fit.ts");
  const preview = read("components/puck-site-editor/production-preview-fit.tsx");
  const drawer = read("components/puck-site-editor/product-library-drawer.tsx");
  assert.match(fit, /const width = Math\.max\(sceneWidth, 1\)/);
  assert.match(fit, /Math\.min\(availableWidth \/ width, availableHeight \/ height\)/);
  assert.doesNotMatch(fit, /Math\.max\(availableWidth, sceneWidth\)/);
  assert.match(preview, /resolveProductionPreviewSceneSize/);
  assert.match(preview, /transform: `translate\(\$\{fit\.left\}px, \$\{fit\.top\}px\) scale\(\$\{fit\.scale\}\)`/);
  assert.match(drawer, /<ProductionPreviewViewport presentation=\{entry\.presentationContract\}>/);
  assert.match(drawer, /entry\.presentationContract\?\.geometry\.kind === "fullSurface"/);
  assert.match(drawer, /data-production-preview-fill="direct"/);
  assert.doesNotMatch(drawer, /sceneWidthMode/);
});

test("full-surface entries keep direct fill while Frame Border uses authoring aspect geometry", () => {
  const frame = entry("component:frame-border");
  const magicTransform = entry("starter:magic-transform-tw");
  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  const preview = read("components/puck-site-editor/production-preview-fit.tsx");
  assert.equal(frame.presentationContract?.geometry.aspectRatio?.value, 1.64);
  assert.equal(frame.presentationContract?.geometry.aspectRatio?.provenance, "editorPresentationDefault");
  assert.equal(frame.presentationContract?.editorPresentationDefault, undefined);
  assert.equal(magicTransform.presentationContract?.editorPresentationDefault?.width.value, 1280);
  assert.match(renderer, /style=\{style\}/);
  assert.match(renderer, /data-production-presentation-geometry=\{presentationGeometry\?\.kind\}/);
  assert.match(preview, /scene\.style\.width = `\$\{sceneWidth\}px`/);
  assert.match(preview, /sceneHeight: sceneSize\.height/);
  assert.match(preview, /calculateProductionPreviewFit\([\s\S]*sceneWidth,[\s\S]*sceneHeight/);
});

test("full-surface contracts select direct fill with only the Frame Border authoring aspect", () => {
  const components = PUCK_PRODUCTION_MANIFEST.filter((item) => item.sourceKind === "component");
  const fullSurface = components.filter((item) => item.presentationContract?.geometry.kind === "fullSurface");
  assert.equal(fullSurface.length, 21);
  assert.equal(fullSurface.every((item) => item.presentationContract?.provenance === "source"), true);
  assert.equal(fullSurface.filter((item) => item.catalogKey === "component:frame-border").length, 1);
  assert.equal(fullSurface.filter((item) => item.catalogKey !== "component:frame-border").every((item) => item.presentationContract?.geometry.aspectRatio === undefined), true);
  assert.equal(fullSurface.every((item) => item.presentationContract?.sourceGeometry?.definiteParent?.required === true), true);
  assert.equal(fullSurface.every((item) => item.presentationContract?.editorPresentationDefault === undefined), true);
  assert.equal(fullSurface.every((item) => item.presentationContract?.technicalRuntime), true);
  assert.equal(fullSurface.every((item) => item.presentationContract?.sourceGeometry?.width?.value === "100%"), true);
  assert.equal(fullSurface.every((item) => item.presentationContract?.sourceGeometry?.height?.value === "100%"), true);
});

test("all numeric presentation geometry has an explicit provenance", () => {
  const components = PUCK_PRODUCTION_MANIFEST.filter((item) => item.sourceKind === "component");
  const counts = Object.fromEntries([
    "source",
    "officialExample",
    "officialDemo",
    "technicalRuntime",
    "editorPresentationDefault",
  ].map((provenance) => [provenance, 0]));
  const numericGeometry = components.flatMap((item) => {
    const contract = item.presentationContract!;
    const geometry = contract.geometry;
    return [
      geometry.minHeight,
      geometry.aspectRatio,
      geometry.authoredWidth,
      geometry.authoredHeight,
      contract.editorPresentationDefault?.width,
      contract.editorPresentationDefault?.height,
      contract.technicalRuntime?.height,
    ].filter((dimension): dimension is NonNullable<typeof dimension> => Boolean(dimension));
  });
  for (const dimension of numericGeometry) counts[dimension.provenance] += 1;
  assert.deepEqual(counts, {
    source: 5,
    officialExample: 0,
    officialDemo: 1,
    technicalRuntime: 21,
    editorPresentationDefault: 3,
  });
  assert.equal(entry("starter:magic-transform-tw").presentationContract?.geometry.authoredWidth, undefined);
  assert.deepEqual(entry("starter:magic-transform-tw").presentationContract?.editorPresentationDefault?.width, {
    value: 1280,
    provenance: "editorPresentationDefault",
  });
});

test("renderer has no Frame Border id branch and no universal 390/480 visual fallback", () => {
  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  const preview = read("components/puck-site-editor/production-preview-fit.tsx");
  assert.doesNotMatch(renderer, /RB_frame_border|component:frame-border|Frame Border/);
  assert.doesNotMatch(renderer, /runtimeFamily === "full-surface" \? 480/);
  assert.doesNotMatch(renderer, /entry\.runtimeFamily === "full-surface"/);
  assert.doesNotMatch(preview, /390|480/);
});

test("main uses the unscaled runtime host and Library contains only non-fill sources", () => {
  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  const preview = read("components/puck-site-editor/production-preview-fit.tsx");
  assert.doesNotMatch(renderer, /ProductionPreviewViewport|calculateProductionPreviewFit|scale\(|zoom\s*:/);
  assert.equal((preview.match(/scale\(/g) ?? []).length, 1);
  assert.match(preview, /data-production-preview-scale=\{fit\.scale\}/);
  assert.match(renderer, /<ProductionSourceHost entry=\{entry\} backgroundRouting=\{backgroundRouting\} runtimeMode=\{effectiveRuntimeMode\}>/);
  assert.match(renderer, /runtimeMode === "library-preview" && isFullSurface/);
  assert.doesNotMatch(renderer, /data-production-source-boundary|__r3f|MutationObserver|ResizeObserver/);
});

test("all 38 production component entries have audited geometry classes", () => {
  const components = PUCK_PRODUCTION_MANIFEST.filter((item) => item.sourceKind === "component");
  assert.equal(components.length, 38);
  assert.equal(components.every((item) => item.presentationContract?.geometry), true);
  const counts = Object.fromEntries([
    "intrinsic",
    "minHeight",
    "aspect",
    "fullSurface",
    "viewport",
  ].map((kind) => [kind, 0]));
  for (const item of components) counts[item.presentationContract!.geometry.kind] += 1;
  assert.deepEqual(counts, {
    intrinsic: 9,
    minHeight: 4,
    aspect: 0,
    fullSurface: 21,
    viewport: 4,
  });
});

test("representative components resolve through generic geometry metadata", () => {
  for (const catalogKey of [
    "component:frame-border",
    "component:light-droplets",
    "component:lightspeed",
    "starter:flicker-tw",
    "component:dot-shift",
    "component:liquid-ascii",
    "component:vortex",
    "component:glue-dots",
    "current-free:magic-rings",
    "current-free:strands",
    "current-free:floating-lines",
  ]) assert.equal(entry(catalogKey).presentationContract?.geometry.kind, "fullSurface", catalogKey);
  for (const catalogKey of [
    "control-3:blur-highlight",
    "component:credit-card",
    "component:device",
    "component:page-flip",
    "component:skewed-carousel",
    "component:tumble-carousel",
    "component:modal-cards",
    "starter:circle-stack-tw",
    "starter:rotating-cards-tw",
  ]) assert.equal(entry(catalogKey).presentationContract?.geometry.kind, "intrinsic", catalogKey);
  assert.equal(entry("component:circle-gallery").presentationContract?.geometry.kind, "viewport");
  assert.equal(entry("component:scroll-stack").presentationContract?.geometry.kind, "viewport");
  assert.equal(entry("starter:scroll-mask-tw").presentationContract?.geometry.kind, "viewport");
  assert.equal(entry("current-free:splash-cursor").presentationContract?.geometry.kind, "viewport");
});

test("Text Scatter and marketing blocks retain separate presentation contracts", () => {
  const textScatter = entry("control-6:text-scatter-tw");
  assert.equal(textScatter.presentationContract?.geometry.kind, "minHeight");
  assert.equal(textScatter.presentationContract?.geometry.minHeight?.value, 400);
  assert.deepEqual(textScatter.presentationContract?.rootLayout, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  const marketing = PUCK_PRODUCTION_MANIFEST.filter((item) => item.sourceKind === "pro-block");
  assert.equal(marketing.length > 0, true);
  assert.equal(marketing.every((item) => item.presentationContract === undefined), true);
  assert.equal(marketing.every((item) => item.host?.profile !== "canvas"), true);
});

test("production registry remains 280 and production imports stay outside editor-lab", () => {
  assert.equal(PUCK_PRODUCTION_MANIFEST.length, 280);
  for (const file of [
    "components/puck-site-editor/public-renderer.tsx",
    "components/puck-site-editor/production-component-sources.tsx",
    "components/puck-site-editor/production-runtime-frame.tsx",
    "components/puck-site-editor/product-library-drawer.tsx",
  ]) assert.doesNotMatch(read(file), /editor-lab/i, file);
});
