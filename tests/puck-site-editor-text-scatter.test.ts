import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { resolvePuckProductionSourceProps } from "../lib/puck-site-editor/production-background.ts";
import { buildNativePuckFields } from "../lib/puck-site-editor/native-puck-fields.ts";
import { PUCK_PRODUCTION_MANIFEST } from "../lib/puck-site-editor/registry-manifest.ts";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const textScatter = PUCK_PRODUCTION_MANIFEST.find((entry) => entry.catalogKey === "control-6:text-scatter-tw")!;

test("Text Scatter official source remains byte-for-byte outside the recovery diff", () => {
  execFileSync("git", ["diff", "--quiet", "HEAD", "--", "components/react-bits/text-scatter.tsx"], { cwd: root });
});

test("Text Scatter keeps the intrinsic source and records the official demo scene contract", () => {
  assert.equal(textScatter.physicalSource, "@/components/react-bits/text-scatter");
  assert.equal(textScatter.rendererSource, "@/components/react-bits/text-scatter");
  assert.deepEqual(textScatter.host, {
    profile: "flow",
    width: "content",
    height: "intrinsic",
    runtimeRisk: "dom",
  });
  assert.equal(textScatter.definiteHeight, null);
  assert.equal(textScatter.sourcePropKeys.includes("className"), true);
  assert.equal(textScatter.sourcePropKeys.includes("as"), true);
  assert.equal(textScatter.defaults.className, "text-4xl md:text-6xl font-bold text-center tracking-tighter");
  assert.equal(textScatter.defaults.as, "h2");
  assert.deepEqual(textScatter.presentationContract, {
    target: "componentRoot",
    rootLayout: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    overflow: "visible",
    provenance: "officialDemo",
    geometry: {
      kind: "minHeight",
      minHeight: { value: 400, provenance: "officialDemo" },
    },
    officialExampleProps: {
      text: "Bounce Back.",
      className: "text-4xl md:text-6xl font-bold text-center tracking-tighter",
      as: "h2",
      velocity: 200,
      rotation: 90,
      scale: 1,
      duration: 2,
      returnAfter: 1,
      provenance: "officialExample",
    },
  });
  assert.equal(textScatter.presentationContract?.geometry.minHeight?.value, 400);
  assert.equal(textScatter.presentationContract?.rootLayout?.display, "flex");
  assert.equal(textScatter.presentationContract?.rootLayout?.alignItems, "center");
  assert.equal(textScatter.presentationContract?.rootLayout?.justifyContent, "center");
  assert.equal(buildNativePuckFields(textScatter).backgroundColor, undefined);
  assert.equal(buildNativePuckFields(textScatter).textColor, undefined);
});

test("Text Scatter official example props and source defaults resolve at the actual source root", () => {
  const source = read("components/react-bits/text-scatter.tsx");
  const sourceProps = resolvePuckProductionSourceProps(
    textScatter.defaults,
    textScatter.sourcePropKeys,
    { target: "none", edited: false },
  );
  assert.equal(sourceProps.className, "text-4xl md:text-6xl font-bold text-center tracking-tighter");
  assert.equal(sourceProps.as, "h2");
  assert.equal(sourceProps.text, undefined);
  assert.doesNotMatch(JSON.stringify(sourceProps), /velocity|rotation|scale|duration|returnAfter/);
  assert.match(source, /velocity = 200/);
  assert.match(source, /rotation = 90/);
  assert.match(source, /scale = 1/);
  assert.match(source, /returnAfter = 1/);
  assert.match(source, /duration = 2/);
  assert.match(source, /React\.createElement\(\s*Tag,\s*\{ className: `inline-block relative select-none \$\{className\}`/);
  assert.match(read("components/puck-site-editor/public-renderer.tsx"), /entry\.renderPublic\(componentProps\)/);
});

test("Text Scatter root layout is shared by public and authoring render paths", () => {
  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  const editorConfig = read("components/puck-site-editor/editor-config.tsx");
  assert.match(renderer, /const rootLayout = presentationContract\?\.rootLayout/);
  assert.match(renderer, /style\.display = rootLayout\.display/);
  assert.match(renderer, /style\.alignItems = rootLayout\.alignItems/);
  assert.match(renderer, /style\.justifyContent = rootLayout\.justifyContent/);
  assert.match(renderer, /runtimeMode = "public"/);
  assert.match(editorConfig, /runtimeMode=\{puck\?\.dragRef \? "authoring" : "interactive"\}/);
  assert.match(renderer, /data-production-presentation-root-layout=\{rootLayout \? "flex-center" : undefined\}/);
  assert.doesNotMatch(renderer, /presentationContract\?\.className/);
});

test("Text Scatter visible-overflow presentation bypasses the generic flow rail clip", () => {
  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  const rendererCss = read("components/puck-site-editor/public-renderer.module.css");
  assert.match(renderer, /presentationContract\?\.overflow/);
  assert.match(renderer, /style\.overflowX = "visible"/);
  assert.match(renderer, /style\.overflowY = "visible"/);
  assert.match(renderer, /!preservesVisiblePresentationOverflow/);
  assert.match(renderer, /data-production-presentation-overflow=\{presentationContract\?\.overflow\}/);
  assert.match(renderer, /data-puck-visible-presentation=\{hasVisiblePresentation \? "true" : undefined\}/);
  assert.match(renderer, /data-production-content-rail="true"/);
  assert.doesNotMatch(renderer, /presentationOverflowStyle|data-production-source-boundary/);
  assert.match(rendererCss, /\.page\[data-puck-visible-presentation="true"\]\s*\{[\s\S]*overflow-x:\s*visible/);
  assert.doesNotMatch(renderer, /RB_control6_text_scatter|control-6:text-scatter-tw|Text Scatter/);
});

test("the presentation path keeps one host and the outer preview window as its boundary", () => {
  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  const rendererCss = read("components/puck-site-editor/public-renderer.module.css");
  const puckCore = read("node_modules/@puckeditor/core/dist/index.js");

  // Letter -> source -> rail -> host -> component root.
  assert.match(renderer, /data-production-content-rail="true"[\s\S]*visiblePresentationOverflowStyle/);
  assert.match(renderer, /data-production-presentation-overflow=\{presentationContract\?\.overflow\}[\s\S]*style=\{style\}/);
  assert.doesNotMatch(renderer, /data-production-source-boundary|presentationOverflowStyle/);
  assert.match(renderer, /data-puck-visible-presentation=\{hasVisiblePresentation \? "true" : undefined\}/);
  assert.match(rendererCss, /\.page\s*\{[\s\S]*overflow-x:\s*clip/);
  assert.match(rendererCss, /\.page\[data-puck-visible-presentation="true"\]\s*\{[\s\S]*overflow-x:\s*visible/);

  // Puck's remaining overflow declarations are the editor/preview window,
  // outside the iframe document; its root has the documented scale transform
  // but no root overflow clip or containment contract.
  const canvasRule = puckCore.match(/\._PuckCanvas_[^\{]+\{[\s\S]*?\n\}/)?.[0] ?? "";
  const canvasRootRule = puckCore.match(/\._PuckCanvas-root_[^\{]+\{[\s\S]*?\n\}/)?.[0] ?? "";
  const layoutRule = puckCore.match(/\._PuckLayout-inner_[^\{]+\{[\s\S]*?\n\}/)?.[0] ?? "";
  assert.match(canvasRule, /overflow:\s*auto/);
  assert.match(canvasRootRule, /transform-origin:\s*top/);
  assert.doesNotMatch(canvasRootRule, /overflow\s*:/);
  assert.match(layoutRule, /overflow:\s*hidden/);
  assert.doesNotMatch(renderer, /contain\s*[:=]|clip-path/);
  assert.doesNotMatch(rendererCss, /contain\s*:|clip-path\s*:/);
});

test("Text Scatter keeps the official hover interaction model", () => {
  const source = read("components/react-bits/text-scatter.tsx");
  assert.match(source, /text\.split\(""\)/);
  assert.match(source, /onMouseEnter=\{handleMouseEnter\}/);
  assert.match(source, /gsap\.to\(target/);
  assert.match(source, /returnAfter/);
  assert.doesNotMatch(source, /onClick=|onPointerMove=|onMouseMove=/);
});

test("Text Scatter recovery does not contain component-specific typography or sizing patches", () => {
  const rendererCss = read("components/puck-site-editor/public-renderer.module.css");
  const previewCss = read("components/puck-site-editor/product-library-drawer.module.css");
  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  assert.doesNotMatch(rendererCss, /Text Scatter|data-production-host-profile="flow".*h1|h1:not/);
  assert.doesNotMatch(previewCss, /Text Scatter|text-scatter/);
  assert.doesNotMatch(renderer, /RB_control6_text_scatter|control-6:text-scatter-tw|Text Scatter/);
  assert.doesNotMatch(rendererCss, /min-height:\s*400px/);
});
