import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  canMovePremiumEditorLayoutItem,
  getPremiumEditorNavigationMetadata,
} from "../lib/public-site/premium-template-editor-adapter.ts";
import {
  PREMIUM_TEMPLATE_EDITOR_ADAPTERS,
  getPremiumTemplateEditorAdapter,
} from "../lib/public-site/premium-template-editor-registry.ts";
import { resolvePublicSiteLayoutOrder } from "../lib/public-site/layout.ts";
import { createVeloraPremiumTemplateSeed } from "../lib/public-site/velora-premium-template-seed.ts";

test("canonical premium layouts are resolved through the shared contract", () => {
  const seed = createVeloraPremiumTemplateSeed();
  const resolved = resolvePublicSiteLayoutOrder(seed);

  assert.deepEqual(resolved, seed.layout_order);
  assert.equal(resolved[0], "native:velora-event-venue:hero");
  assert.equal(resolved.at(-1), "native:velora-event-venue:footer");
  assert.equal(resolved.some((token) => token.startsWith("section:")), false);
});

test("every registered premium editor exposes its template sections to one library model", () => {
  for (const adapter of PREMIUM_TEMPLATE_EDITOR_ADAPTERS) {
    const librarySections = getPremiumEditorNavigationMetadata(adapter);
    assert.equal(
      librarySections.length,
      adapter.contract.nativeSections.length +
        (adapter.fixedEditorSections?.length ?? 0),
      adapter.templateKey,
    );
    assert.equal(
      new Set(librarySections.map((section) => section.token)).size,
      librarySections.length,
      adapter.templateKey,
    );
  }
});

test("shared premium movement uses the resolved native layout indexes", () => {
  const seed = createVeloraPremiumTemplateSeed();
  const adapter = getPremiumTemplateEditorAdapter(seed.template_id);
  assert.ok(adapter);

  const tokens = resolvePublicSiteLayoutOrder(seed);
  const facts = adapter.nativeToken("facts");
  const factsIndex = tokens.indexOf(facts);
  assert.equal(factsIndex, 1);
  assert.equal(
    canMovePremiumEditorLayoutItem(adapter, {
      tokens,
      customBlockIds: [],
      fromIndex: factsIndex,
      direction: 1,
    }),
    true,
  );

  const moved = adapter.moveLayoutItem({
    tokens,
    customBlockIds: [],
    fromIndex: factsIndex,
    toIndex: factsIndex + 1,
  });
  assert.equal(moved[2], facts);
});

test("the visual builder derives library items and movement from the active adapter", async () => {
  const source = await readFile(
    new URL("../app/admin/site/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(
    source,
    /getPremiumEditorNavigationMetadata\(premiumEditorAdapter\)\.map/,
  );
  assert.match(source, /premiumTemplateLibraryItems/);
  assert.match(source, /movePremiumLayoutItem\(item, direction\)/);
  assert.doesNotMatch(
    source,
    /premiumTemplateLibraryItems[\s\S]{0,1200}velora-event-venue/,
  );
});
