import type { DocumentType } from "./constants";

/** Mirrors the backend's DocumentSummary (features/documents/server/serialize.ts). */
export type DocumentSummary = {
  unitId: string;
  title: string;
  docType: DocumentType;
  docTypeLabel: string;
  notes: string | null;
  caseUnitId: string | null;
  clientUnitId: string | null;
  expenseUnitId: string | null;
  mimeType: string;
  size: number;
  originalName: string;
  createdAt: string;
};

/** A file picked on-device, ready for multipart upload. */
export type PickedFile = {
  uri: string;
  name: string;
  mimeType: string;
  size: number | null;
};
