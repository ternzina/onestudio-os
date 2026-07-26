export type DocumentType = "contract" | "invoice" | "act" | "commercial_offer" | "privacy_consent" | "other";
export type DocumentTemplate = {
  id: string;
  business_id: string;
  template_key: string;
  document_type: DocumentType;
  locale: string;
  title_template: string;
  body_template: string;
  version: number;
  status: "draft" | "active" | "archived";
};
export type GeneratedDocument = {
  id: string;
  business_id: string;
  document_type: DocumentType;
  document_number: string;
  title_snapshot: string;
  content_snapshot: string;
  status: "draft" | "final" | "void";
  issued_at: string;
  created_at: string;
};
