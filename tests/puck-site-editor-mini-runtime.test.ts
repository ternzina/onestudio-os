import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { createPuckDocument, validatePuckDocument } from "../lib/puck-site-editor/document.ts";
import {
  resolvePuckProductionSourceProps,
} from "../lib/puck-site-editor/production-background.ts";
import {
  calculateProductionPreviewFit,
  resolveProductionPreviewSceneSize,
} from "../lib/puck-site-editor/preview-fit.ts";
import {
  PUCK_PRODUCTION_MANIFEST,
  PUCK_PRODUCTION_MANIFEST_BY_ID,
} from "../lib/puck-site-editor/registry-manifest.ts";
import { resolvePuckRuntimeRealm } from "../lib/puck-site-editor/runtime-realm.ts";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const entry = (id: string) => {
  const found = PUCK_PRODUCTION_MANIFEST_BY_ID.get(id);
  assert.ok(found, id);
  return found;
};

test("Circle Gallery MINI uses the live owner viewport for canonical contain fitting", () => {
  const circle = entry("RB_batch2_circle_gallery");
  const preview = read("components/puck-site-editor/production-preview-fit.tsx");
  const drawer = read("components/puck-site-editor/product-library-drawer.tsx");
  const size = resolveProductionPreviewSceneSize({
    availableWidth: 598,
    availableHeight: 390,
    sourceWidth: 1440,
    sourceHeight: 900,
    measuredSceneHeight: 1,
    presentation: circle.presentationContract,
  });
  const fit = calculateProductionPreviewFit({
    availableWidth: 598,
    availableHeight: 390,
    sceneWidth: size.width,
    sceneHeight: size.height,
  });

  assert.deepEqual(size, { width: 1440, height: 900 });
  assert.equal(fit.width * fit.scale <= 598, true);
  assert.equal(fit.height * fit.scale <= 390, true);
  assert.match(preview, /const sourceWindow = viewport\.ownerDocument\.defaultView/);
  assert.doesNotMatch(preview, /querySelector<.*IFrameElement>|editorWindow/);
  assert.match(preview, /data-production-preview-scroll-realm=/);
  assert.match(drawer, /data-production-preview-scroll-realm=\{entry\.presentationContract\?\.geometry\.kind === "viewport" \? "local" : undefined\}/);
});

test("full-surface MINI uses the canonical viewport scene path", () => {
  const drawer = read("components/puck-site-editor/product-library-drawer.tsx");
  const fit = read("components/puck-site-editor/production-preview-fit.tsx");
  assert.match(drawer, /<ProductionPreviewViewport presentation=\{entry\.presentationContract\}>[\s\S]*data-production-preview-fill=\{entry\.presentationContract\?\.geometry\.kind === "fullSurface" \? "direct" : undefined\}/);
  assert.match(fit, /const sourceWindow = viewport\.ownerDocument\.defaultView/);
  assert.match(fit, /calculateProductionPreviewFit\(/);
  assert.match(fit, /transform: `translate\(\$\{fit\.left\}px, \$\{fit\.top\}px\) scale\(\$\{fit\.scale\}\)`/);
  assert.match(read("components/puck-site-editor/production-preview-fit.module.css"), /\.scene\s*\{[\s\S]*transform-origin: top left;/);
});

test("Scroll Mask registry defaults make insert data valid and source props renderable", () => {
  const mask = entry("RB_batch11_scroll_mask");
  const source = read("components/react-bits/scroll-mask.tsx");
  const registry = read("components/puck-site-editor/production-component-sources.tsx");
  const editor = read("components/puck-site-editor/editor-config.tsx");
  const drawer = read("components/puck-site-editor/product-library-drawer.tsx");
  const component = {
    type: mask.id,
    props: { id: "scroll-mask-qa", ...mask.defaults },
  } as const;
  const document = createPuckDocument({ pageId: "scroll-mask-qa", locale: "en", content: [component] });
  const sourceProps = resolvePuckProductionSourceProps(mask.defaults, mask.sourcePropKeys, {
    target: "none",
    edited: false,
  });

  assert.equal(validatePuckDocument(document).ok, true);
  assert.equal(mask.sourcePropKeys.includes("src"), true);
  assert.equal(mask.defaults.variant, "iris");
  assert.equal(mask.defaults.scrollLength, 1.7);
  assert.equal(sourceProps.src, mask.defaults.src);
  assert.equal(sourceProps.revealContent, true);
  assert.match(registry, /PUCK_PRODUCTION_COMPONENTS_BY_CATALOG_KEY/);
  assert.match(registry, /"starter:scroll-mask-tw": lazyComponent/);
  assert.match(editor, /defaultProps: structuredClone\(entry\.defaults\)/);
  assert.match(drawer, /type: "insert"/);
  assert.match(drawer, /componentType,/);
  assert.match(source, /export const ScrollMask = \(\{/);
  assert.match(source, /scrollLength = 1\.7/);
  assert.match(source, /new ResizeObserver\(gauge\)/);
});

test("Scroll Stack MINI keeps the official scroll trigger inside the local preview realm", () => {
  const stack = entry("RB_batch4_scroll_stack");
  const source = read("components/react-bits/scroll-stack.tsx");
  const fitCss = read("components/puck-site-editor/production-preview-fit.module.css");
  const stageCss = read("components/puck-site-editor/product-library-drawer.module.css");
  const route = read("app/puck-runtime/page.tsx");
  const renderer = read("components/puck-site-editor/public-renderer.tsx");

  assert.equal(stack.presentationContract?.geometry.kind, "viewport");
  assert.match(source, /root\.ownerDocument\.defaultView/);
  assert.match(source, /view\.addEventListener\("scroll"/);
  assert.match(source, /doc\.addEventListener\("scroll", wake/);
  assert.doesNotMatch(source, /setInterval|setTimeout\([^\n]*paint|autoplay/i);
  assert.match(renderer, /useLibraryPreviewViewportRuntime/);
  assert.match(renderer, /shouldUseIframeNativeRuntime\(entry, effectiveRuntimeMode\)[\s\S]*useLibraryPreviewViewportRuntime/);
  assert.match(fitCss, /data-production-preview-scroll-realm="local"/);
  assert.match(fitCss, /overflow-y: auto/);
  assert.match(stageCss, /\.previewStage\[data-production-preview-scroll-realm="local"\]/);
  assert.match(stageCss, /overflow: visible/);
  assert.match(route, /data-puck-runtime-scroll-realm=\{runtimeMode === "library-preview" \? "local" : undefined\}/);
  assert.match(route, /overflowY: runtimeMode === "library-preview" \? "auto" : "hidden"/);
});

test("Splash Cursor MINI receives library mode through its iframe-owned runtime", () => {
  const splash = entry("RB_free_splash_cursor");
  const frame = read("components/puck-site-editor/production-runtime-frame.tsx");
  const route = read("app/puck-runtime/page.tsx");
  const context = read("components/puck-site-editor/production-runtime-context.tsx");
  const renderer = read("components/puck-site-editor/public-renderer.tsx");

  assert.equal(resolvePuckRuntimeRealm(splash), "iframeNative");
  assert.match(frame, /event\.source !== target/);
  assert.match(frame, /runtimeMode,/);
  assert.match(route, /setRuntimeMode\(event\.data\.runtimeMode \?\? "interactive"\)/);
  assert.match(route, /<ProductionRuntimeBoundary runtimeMode=\{runtimeMode\}>/);
  assert.match(context, /ProductionRuntimeModeContext/);
  assert.match(renderer, /const effectiveRuntimeMode = isInsideRuntime && runtimeContextMode \? runtimeContextMode : runtimeMode/);
  assert.match(renderer, /runtimeMode=\{effectiveRuntimeMode\}/);
});

test("Magic Rings remains the unchanged iframe-native negative control", () => {
  const magic = entry("RB_free_magic_rings");
  assert.equal(resolvePuckRuntimeRealm(magic), "iframeNative");
  assert.equal(magic.presentationContract?.geometry.kind, "fullSurface");
  assert.equal(magic.presentationContract?.technicalRuntime?.height.value, 480);
  execFileSync("git", ["diff", "--quiet", "HEAD", "--", "components/react-bits/MagicRings.tsx"], { cwd: root });
  assert.doesNotMatch(read("components/puck-site-editor/public-renderer.tsx"), /RB_free_magic_rings|Magic Rings/);
});

test("MAIN authoring keeps the established unscaled production viewport", () => {
  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  const editor = read("components/puck-site-editor/editor-config.tsx");
  assert.doesNotMatch(renderer, /ProductionPreviewViewport|calculateProductionPreviewFit/);
  assert.match(editor, /runtimeMode=\{puck\?\.dragRef \? "authoring" : "interactive"\}/);
  assert.match(renderer, /data-production-presentation-geometry=\{presentationGeometry\?\.kind\}/);
  assert.equal(PUCK_PRODUCTION_MANIFEST.length, 280);
});
