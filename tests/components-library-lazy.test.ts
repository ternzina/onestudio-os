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
  "component library preloads near the viewport and runs previews only while visible",
  () => {
    assert.match(showcase, /preload:\s*loadCircleGallery/);
    assert.match(showcase, /rootMargin:\s*"320px 0px"/);
    assert.match(showcase, /intersectionRatio\s*>=\s*0\.12/);
    assert.match(showcase, /loading="lazy"/);
    assert.match(showcase, /isVisible\s*\?\s*\(/);
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
