import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const showcase = readFileSync(
  "components/marketing/OneStudioMotionShowcase.tsx",
  "utf8",
);

const page = readFileSync(
  "app/components/ComponentsPageClient.tsx",
  "utf8",
);

const styles = readFileSync(
  "app/components/page.module.css",
  "utf8",
);

test(
  "component library preloads early and mounts live previews before they enter the viewport",
  () => {
    assert.match(showcase, /preload:\s*loadCircleGallery/);
    assert.match(showcase, /rootMargin:\s*"320px 0px"/);
    assert.match(showcase, /rootMargin:\s*"140px 0px"/);
    assert.match(showcase, /threshold:\s*0/);
    assert.match(showcase, /isVisible\s*\?\s*\(/);
  },
);

test(
  "component library has no visual loading poster or LIVE PREVIEW placeholder",
  () => {
    assert.doesNotMatch(showcase, /src=\{item\.poster\}/);
    assert.doesNotMatch(showcase, /catalogPreviewPlaceholder/);
    assert.doesNotMatch(showcase, />LIVE PREVIEW</);
    assert.match(showcase, /function EffectLoading\(\) \{\s*return null;/);
    assert.doesNotMatch(page, /loadingLabel=/);
  },
);

test(
  "component library supports deferred search and browser rendering containment",
  () => {
    assert.match(page, /useDeferredValue/);
    assert.match(page, /type="search"/);
    assert.match(page, /filteredItems\.length/);
    assert.match(styles, /content-visibility:\s*auto/);
    assert.match(styles, /contain-intrinsic-size:/);
  },
);
