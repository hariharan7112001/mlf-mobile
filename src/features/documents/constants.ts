/** Document API paths — mirrors app/api/documents/**. */
export const DOCUMENTS_API = {
  list: "/api/documents",
  upload: "/api/documents",
  detail: (unitId: string) => `/api/documents/${unitId}`,
  download: (unitId: string) => `/api/documents/${unitId}/download`,
} as const;

/** Mirrors DOCUMENT_TYPE_LABELS in lib/validations/documents.schema.ts. */
export const DOCUMENT_TYPE_OPTIONS = [
  { value: "judgment", label: "Judgment" },
  { value: "order", label: "Order / interim order" },
  { value: "pleading", label: "Pleading / written statement" },
  { value: "vakalatnama", label: "Vakalatnama" },
  { value: "petition", label: "Petition / plaint / complaint" },
  { value: "affidavit", label: "Affidavit" },
  { value: "evidence", label: "Evidence / annexure" },
  { value: "id_proof", label: "ID / address proof" },
  { value: "receipt", label: "Court / fee receipt" },
  { value: "other", label: "Other" },
] as const;

export type DocumentType = (typeof DOCUMENT_TYPE_OPTIONS)[number]["value"];

/** Client-portal logins may only upload these (lib/auth/client-portal.ts). */
export const CLIENT_UPLOAD_DOC_TYPES: DocumentType[] = ["id_proof", "evidence", "affidavit", "other"];

/** Mirrors config/company/compliance.ts uploads rules. */
export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const UPLOAD_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
