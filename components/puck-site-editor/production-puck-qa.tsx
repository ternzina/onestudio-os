"use client";

import "@puckeditor/core/puck.css";
import { Puck, type Data } from "@puckeditor/core";
import { useState } from "react";
import { PUCK_PRODUCTION_EDITOR_CONFIG } from "./editor-config";
import { PUCK_PRODUCTION_EDITOR_OVERRIDES } from "./product-library-drawer";
import { PUCK_PRODUCTION_MANIFEST_BY_ID } from "@/lib/puck-site-editor/registry-manifest";
import { PUCK_PRODUCTION_AUTHORING_UI } from "@/lib/puck-site-editor/authoring-viewport";
import { ProductionEditorProvider } from "./production-editor-ux";

type ProductionPuckQaProps = {
  ids: readonly string[];
};

const dataForIds = (ids: readonly string[]): Data => ({
  root: { props: {} },
  content: ids.flatMap((id, index) => {
    const entry = PUCK_PRODUCTION_MANIFEST_BY_ID.get(id);
    return entry
      ? [{
          type: entry.id,
          props: {
            id: `production-qa-${index + 1}`,
            ...structuredClone(entry.defaults),
          },
        }]
      : [];
  }),
});

export default function ProductionPuckQa({ ids }: ProductionPuckQaProps) {
  const [data, setData] = useState<Data>(() => dataForIds(ids));

  return (
    <ProductionEditorProvider locale="en">
      <main data-production-puck-qa>
        <Puck
          config={PUCK_PRODUCTION_EDITOR_CONFIG}
          data={data}
          onChange={setData}
          overrides={PUCK_PRODUCTION_EDITOR_OVERRIDES}
          headerTitle="Production Registry · Puck QA"
          ui={{
            leftSideBarVisible: true,
            rightSideBarVisible: true,
            previewMode: "edit",
            viewports: PUCK_PRODUCTION_AUTHORING_UI,
          }}
        >
          <Puck.Layout />
        </Puck>
      </main>
    </ProductionEditorProvider>
  );
}
