import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { apiDelete, apiGet, apiUpload, getAuthHeaders } from "@/core/api/client";
import { getApiBaseUrl } from "@/core/env";
import { DOCUMENTS_API, type DocumentType } from "./constants";
import type { DocumentSummary, PickedFile } from "./types";

export function listDocuments(params: { caseUnitId?: string; clientUnitId?: string }) {
  const query = new URLSearchParams({ pageSize: "50" });
  if (params.caseUnitId) query.set("caseUnitId", params.caseUnitId);
  if (params.clientUnitId) query.set("clientUnitId", params.clientUnitId);
  return apiGet<DocumentSummary[]>(`${DOCUMENTS_API.list}?${query.toString()}`);
}

export type UploadDocumentInput = {
  file: PickedFile;
  title: string;
  docType: DocumentType;
  notes?: string;
  caseUnitId?: string;
  clientUnitId?: string;
};

export function uploadDocument(input: UploadDocumentInput) {
  const form = new FormData();
  // React Native's FormData takes a { uri, name, type } descriptor instead of a Blob.
  form.append("file", {
    uri: input.file.uri,
    name: input.file.name,
    type: input.file.mimeType,
  } as unknown as Blob);
  form.append("title", input.title);
  form.append("docType", input.docType);
  if (input.notes) form.append("notes", input.notes);
  if (input.caseUnitId) form.append("caseUnitId", input.caseUnitId);
  if (input.clientUnitId) form.append("clientUnitId", input.clientUnitId);
  return apiUpload<{ document: DocumentSummary }>(DOCUMENTS_API.upload, form);
}

export function deleteDocument(unitId: string) {
  return apiDelete<{ deleted: true; unitId: string }>(DOCUMENTS_API.detail(unitId));
}

/**
 * The download route needs the bearer token, so a plain browser link won't work.
 * Download into the cache with the auth header, then hand the file to the OS share
 * sheet (which offers "Open in…", Save to Files, WhatsApp, etc.).
 */
export async function downloadAndShareDocument(doc: DocumentSummary) {
  const safeName = `${doc.unitId}-${doc.originalName.replace(/[^\w.\-]/g, "_")}`;
  const destination = new File(Paths.cache, safeName);
  const file = await File.downloadFileAsync(
    `${getApiBaseUrl()}${DOCUMENTS_API.download(doc.unitId)}`,
    destination,
    { headers: await getAuthHeaders(), idempotent: true }
  );

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available on this device.");
  }
  await Sharing.shareAsync(file.uri, { mimeType: doc.mimeType, dialogTitle: doc.title });
}
