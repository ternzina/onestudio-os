import {
  assertPuckDocument,
  createPuckDocument,
  type PuckDocumentComponent,
  type PuckDocumentV1,
} from "./document.ts";

export type ProductionPuckData = {
  root: PuckDocumentV1["root"];
  content: PuckDocumentComponent[];
};

export function puckDocumentToData(document: PuckDocumentV1): ProductionPuckData {
  const validated = assertPuckDocument(document);
  return { root: validated.root, content: validated.content };
}

export function puckDataToDocument(
  data: ProductionPuckData,
  metadata: Pick<PuckDocumentV1["metadata"], "pageId" | "locale">,
): PuckDocumentV1 {
  return createPuckDocument({
    pageId: metadata.pageId,
    locale: metadata.locale,
    theme: data.root.props.theme,
    content: data.content,
  });
}
