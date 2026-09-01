import { createPuckDocument, type PuckDocumentV1 } from "./document.ts";
import {
  PUCK_PILOT_BASELINE_MANIFEST,
  PUCK_PRODUCTION_MANIFEST,
  type PuckRegistryManifestEntry,
} from "./registry-manifest.ts";

const ROUND_TRIP_FIXTURE_TARGET = 25;

function representativeFixtureEntries() {
  const selected: PuckRegistryManifestEntry[] = [...PUCK_PILOT_BASELINE_MANIFEST];
  const ids = new Set(selected.map((entry) => entry.id));
  const categories = new Set(selected.map((entry) => entry.taxonomy));

  for (const entry of PUCK_PRODUCTION_MANIFEST) {
    if (ids.has(entry.id) || categories.has(entry.taxonomy)) continue;
    selected.push(entry);
    ids.add(entry.id);
    categories.add(entry.taxonomy);
  }
  for (const entry of PUCK_PRODUCTION_MANIFEST) {
    if (selected.length >= ROUND_TRIP_FIXTURE_TARGET) break;
    if (ids.has(entry.id)) continue;
    selected.push(entry);
    ids.add(entry.id);
  }
  return selected;
}

export const PUCK_ROUND_TRIP_FIXTURE_ENTRIES = representativeFixtureEntries();

export function createPuckPilotFixture(locale = "en"): PuckDocumentV1 {
  return createPuckDocument({
    pageId: "pilot-home",
    locale,
    content: PUCK_ROUND_TRIP_FIXTURE_ENTRIES.map((entry, index) => ({
      type: entry.id,
      props: {
        id: `pilot-${index + 1}`,
        ...structuredClone(entry.defaults),
        ...(entry.id === "reactbits.glow-cursor"
          ? { layoutWidth: "full", paddingY: "none", backgroundColor: "#09090b", textColor: "#ffffff" }
          : {}),
      },
    })),
  });
}
