import { createPuckDocument, type PuckDocumentV1 } from "./document.ts";
import { PUCK_PRODUCTION_MANIFEST } from "./registry-manifest.ts";

export function createPuckPilotFixture(locale = "en"): PuckDocumentV1 {
  return createPuckDocument({
    pageId: "pilot-home",
    locale,
    content: PUCK_PRODUCTION_MANIFEST.map((entry, index) => ({
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
