import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  interactionPolicyBucket,
  policyAllowsPassiveHover,
  policyAllowsPassivePointerMove,
  policyReservesClick,
  policyReservesDrag,
  policyReservesForm,
} from "../lib/puck-site-editor/interaction-policy.ts";
import {
  PUCK_PRODUCTION_MANIFEST,
  PUCK_PRODUCTION_MANIFEST_BY_ID,
} from "../lib/puck-site-editor/registry-manifest.ts";
import { resolvePuckRuntimeRealm, shouldUseIframeNativeRuntime } from "../lib/puck-site-editor/runtime-realm.ts";

const root = path.resolve(import.meta.dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const entry = (catalogKey: string) => {
  const found = PUCK_PRODUCTION_MANIFEST.find((item) => item.catalogKey === catalogKey);
  assert.ok(found, catalogKey);
  return found;
};

test("canonical manifest carries the audited EDIT interaction policy counts", () => {
  const counts = Object.fromEntries([
    "LIVE",
    "LIVE_NONBLOCKING",
    "PAUSED_INTERACTION",
    "INTERACT_REQUIRED",
    "STATIC_OK",
  ].map((bucket) => [bucket, 0]));
  for (const item of PUCK_PRODUCTION_MANIFEST) {
    const bucket = interactionPolicyBucket(item.interactionPolicy);
    counts[bucket] += 1;
  }
  assert.deepEqual(counts, {
    LIVE: 80,
    LIVE_NONBLOCKING: 26,
    PAUSED_INTERACTION: 112,
    INTERACT_REQUIRED: 54,
    STATIC_OK: 8,
  });
  assert.equal(PUCK_PRODUCTION_MANIFEST.length, 280);
  assert.equal(
    PUCK_PRODUCTION_MANIFEST.filter((item) => policyAllowsPassiveHover(item.interactionPolicy)).length,
    15,
  );
  assert.equal(
    PUCK_PRODUCTION_MANIFEST.filter((item) => policyAllowsPassivePointerMove(item.interactionPolicy)).length,
    11,
  );
});

test("representative source classifications are generic metadata, not renderer branches", () => {
  const textScatter = entry("control-6:text-scatter-tw");
  const features = entry("pro-block:features-6");
  const navigation = entry("pro-block:navigation-14");
  const parallax = entry("pro-block:hero-19");
  const pointer = entry("pro-block:cta-8");
  const autonomous = entry("component:light-droplets");
  const lightspeed = entry("component:lightspeed");
  const carousel = entry("component:gradient-carousel");
  const form = entry("pro-block:forms-1");
  const staticEntry = entry("pro-block:features-1");

  assert.equal(textScatter.interactionPolicy.hover, "passive-edit");
  assert.equal(features.interactionPolicy.hover, "passive-edit");
  assert.equal(navigation.interactionPolicy.hover, "passive-edit");
  assert.equal(parallax.interactionPolicy.pointerMove, "passive-edit");
  assert.equal(pointer.interactionPolicy.pointerMove, "passive-edit");
  assert.equal(autonomous.interactionPolicy.visualRuntime, "live");
  assert.equal(lightspeed.interactionPolicy.visualRuntime, "live");
  assert.equal(carousel.interactionPolicy.drag, "interact-only");
  assert.equal(form.interactionPolicy.form, "interact-only");
  assert.equal(staticEntry.interactionPolicy.visualRuntime, "static");

  for (const file of [
    "components/puck-site-editor/public-renderer.tsx",
    "components/puck-site-editor/production-interaction-firewall.ts",
    "components/puck-site-editor/production-runtime-frame.tsx",
  ]) {
    const source = read(file);
    assert.doesNotMatch(source, /control-6:text-scatter|pro-block:hero-19|RB_free_splash_cursor|RB_free_magic_rings/);
    assert.doesNotMatch(source, /editor-lab/i);
  }
});

test("EDIT passive hit testing preserves native source hover and pointer streams", () => {
  const css = read("components/puck-site-editor/pilot-editor.module.css");
  const firewall = read("components/puck-site-editor/production-interaction-firewall.ts");
  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  const textScatter = read("components/react-bits/text-scatter.tsx");
  const parallax = read("components/puck-site-editor/adapted-library/hero/hero-19.tsx");

  assert.match(css, /data-puck-interaction-hover="passive-edit"/);
  assert.match(css, /data-puck-interaction-pointer-move="passive-edit"/);
  assert.match(css, /pointer-events: auto !important/);
  assert.match(css, /data-dnd-dragging/);
  assert.doesNotMatch(css, /\[data-puck-component\] \*\s*\{[^}]*pointer-events:\s*auto/);
  assert.match(renderer, /interactionPolicyDataset\(entry\.interactionPolicy\)/);
  assert.match(renderer, /ref=\{rootRef\}/);
  assert.match(renderer, /useImperativeHandle\(dragRef/);
  assert.match(textScatter, /onMouseEnter=\{handleMouseEnter\}/);
  assert.match(parallax, /onPointerMove=\{handlePointerMove\}/);
  assert.match(firewall, /"focusin"/);
  assert.match(firewall, /"submit"/);
  assert.match(firewall, /"pointerdown"/);
  assert.match(firewall, /restorePassiveMousePropagation/);
  assert.match(firewall, /event\.cancelBubble = false/);
  assert.match(firewall, /mode === "interactive"/);
  assert.match(firewall, /MutationObserver/);
  assert.doesNotMatch(firewall, /pointermove/);
  assert.doesNotMatch(firewall, /elementFromPoint|dispatchEvent|stopImmediatePropagation\(\).*pointermove/);
});

test("EDIT action firewall reserves activation, navigation, form focus, and source drag", () => {
  const firewall = read("components/puck-site-editor/production-interaction-firewall.ts");
  const editor = read("components/puck-site-editor/production-editor-ux.tsx");
  const library = read("components/puck-site-editor/product-library-drawer.tsx");

  assert.match(editor, /useProductionInteractionFirewall\(rootRef\)/);
  assert.match(firewall, /ACTION_SELECTOR/);
  assert.match(firewall, /policyReservesClick\(policy\)/);
  assert.match(firewall, /policyReservesDrag\(policy\)/);
  assert.match(firewall, /policyReservesForm\(policy\)/);
  assert.match(firewall, /event\.preventDefault\(\)/);
  assert.match(firewall, /event\.stopImmediatePropagation\(\)/);
  assert.match(firewall, /\(block as HTMLElement\)\.click\(\)/);
  assert.match(library, /onClickCapture=\{guardProductionPreviewNavigation\}/);
  assert.match(library, /onSubmitCapture=\{guardProductionPreviewSubmit\}/);

  const navigation = entry("pro-block:navigation-14").interactionPolicy;
  const carousel = entry("component:gradient-carousel").interactionPolicy;
  const form = entry("pro-block:forms-1").interactionPolicy;
  assert.equal(policyReservesClick(navigation), true);
  assert.equal(policyReservesDrag(carousel), true);
  assert.equal(policyReservesForm(form), true);
});

test("iframeNative authoring is contained while Preview, Interact, and Library remain live", () => {
  const splash = PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_free_splash_cursor");
  const rings = PUCK_PRODUCTION_MANIFEST_BY_ID.get("RB_free_magic_rings");
  assert.ok(splash);
  assert.ok(rings);
  assert.equal(resolvePuckRuntimeRealm(splash), "iframeNative");
  assert.equal(resolvePuckRuntimeRealm(rings), "iframeNative");
  for (const mode of ["authoring", "interactive", "library-preview", "public"] as const) {
    assert.equal(shouldUseIframeNativeRuntime(splash, mode), true, mode);
    assert.equal(shouldUseIframeNativeRuntime(rings, mode), true, mode);
  }

  const renderer = read("components/puck-site-editor/public-renderer.tsx");
  const frame = read("components/puck-site-editor/production-runtime-frame.tsx");
  const route = read("app/puck-runtime/page.tsx");
  assert.match(renderer, /runtimeMode=\{runtimeMode\}/);
  assert.match(renderer, /resolvePuckRuntimeRealm\(entry\)/);
  assert.match(frame, /runtimeMode === "authoring" \? "disabled-authoring" : "contained"/);
  assert.match(frame, /pointerEvents: runtimeMode === "authoring" \? "none" : "auto"/);
  assert.match(frame, /data-puck-runtime-realm="iframeNative"/);
  assert.match(route, /ownerDocument === globalDocument/);
  assert.doesNotMatch(frame, /dispatchEvent/);
  assert.doesNotMatch(route, /parent\.dispatchEvent/);
});

test("Text Scatter and Library contracts remain production-owned", () => {
  const textScatter = entry("control-6:text-scatter-tw");
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
  const library = read("components/puck-site-editor/product-library-drawer.tsx");
  assert.match(library, /PuckProductionBlock component=\{component\} runtimeMode="library-preview"/);
  assert.match(library, /onPointerMove=\{onPointerStay\}/);
  assert.match(library, /guardProductionPreviewNavigation/);
  assert.match(library, /guardProductionPreviewSubmit/);
});
